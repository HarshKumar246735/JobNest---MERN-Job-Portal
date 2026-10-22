const User = require('../models/User'); const Company = require('../models/Company'); const Job = require('../models/Job'); const Application = require('../models/Application');
const JobCategory = require('../models/JobCategory'); const Skill = require('../models/Skill'); const Report = require('../models/Report'); const AuditLog = require('../models/AuditLog');
const { audit } = require('../services/audit'); const { notify } = require('../services/notify');
const { asyncHandler, AppError, slugify } = require('../utils/helpers');
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const paged = async (Model, filter, req, opts = {}) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1), limit = 15;
  let q = Model.find(filter).sort(opts.sort || '-createdAt').skip((page - 1) * limit).limit(limit); if (opts.select) q = q.select(opts.select); if (opts.populate) q = q.populate(opts.populate);
  const [items, total] = await Promise.all([q.lean(), Model.countDocuments(filter)]); return { items, total, page, pages: Math.ceil(total / limit) };
};
exports.dashboard = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 14 * 864e5);
  const [users, candidates, recruiters, companies, activeJobs, applications, pendingJobs, openReports, suspended, perDay, activity] = await Promise.all([
    User.countDocuments(), User.countDocuments({ role: 'candidate' }), User.countDocuments({ role: 'recruiter' }), Company.countDocuments(), Job.countDocuments({ status: 'open' }),
    Application.countDocuments(), Job.countDocuments({ status: 'pending' }), Report.countDocuments({ status: { $in: ['open', 'reviewing'] } }), User.countDocuments({ status: 'suspended' }),
    Application.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    AuditLog.find().sort('-createdAt').limit(8).populate('actor', 'name').lean()]);
  res.json({ success: true, users, candidates, recruiters, companies, activeJobs, applications, pendingJobs, openReports, suspended, applicationsPerDay: perDay.map((d) => ({ day: d._id.slice(5), applications: d.n })), activity });
});
exports.users = asyncHandler(async (req, res) => {
  const f = {}; if (['candidate', 'recruiter', 'admin'].includes(req.query.role)) f.role = req.query.role; if (['active', 'suspended'].includes(req.query.status)) f.status = req.query.status;
  if (req.query.q) { const r = new RegExp(esc(req.query.q), 'i'); f.$or = [{ name: r }, { email: r }]; }
  res.json({ success: true, ...(await paged(User, f, req, { select: 'name email role status createdAt isDemo' })) });
});
exports.setUserStatus = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id); if (!u) throw new AppError('User not found', 404);
  if (String(u._id) === String(req.user._id) || u.role === 'admin') throw new AppError('Administrator accounts cannot be suspended here', 403);
  if (!['active', 'suspended'].includes(req.body.status)) throw new AppError('Invalid status', 400);
  u.status = req.body.status; await u.save({ validateBeforeSave: false });
  await audit(req, `USER_${u.status.toUpperCase()}`, 'user', u._id, { email: u.email, reason: String(req.body.reason || '').slice(0, 300) }); res.json({ success: true });
});
exports.jobs = asyncHandler(async (req, res) => {
  const f = {}; if (req.query.status) f.status = String(req.query.status); if (req.query.q) { const r = new RegExp(esc(req.query.q), 'i'); f.$or = [{ title: r }, { companyName: r }]; }
  res.json({ success: true, ...(await paged(Job, f, req, { select: 'title slug companyName status city applicationCount createdAt isDemo' })) });
});
exports.moderateJob = asyncHandler(async (req, res) => {
  const to = { approve: 'open', reject: 'rejected', flag: 'pending' }[req.body.action]; if (!to) throw new AppError('Invalid action', 400);
  const job = await Job.findById(req.params.id); if (!job) throw new AppError('Job not found', 404);
  job.status = to; await job.save(); const reason = String(req.body.reason || '').slice(0, 300);
  await audit(req, `JOB_${req.body.action.toUpperCase()}`, 'job', job._id, { title: job.title, reason });
  await notify(job.recruiter, 'JOB_MODERATION', 'Job moderation update', `${job.title} was ${{ open: 'approved', rejected: 'rejected', pending: 'flagged for review' }[to]}${reason ? `: ${reason}` : ''}`, '/recruiter/jobs');
  res.json({ success: true, status: to });
});
exports.companies = asyncHandler(async (req, res) => {
  const f = {}; if (req.query.verification) f.verification = String(req.query.verification); if (req.query.q) f.name = new RegExp(esc(req.query.q), 'i');
  res.json({ success: true, ...(await paged(Company, f, req, { select: 'name slug industry headquarters verification isDemo createdAt', sort: '-updatedAt' })) });
});
exports.verifyCompany = asyncHandler(async (req, res) => {
  const s = req.body.status; if (!['verified', 'rejected', 'unverified'].includes(s)) throw new AppError('Invalid status', 400);
  const c = await Company.findById(req.params.id); if (!c) throw new AppError('Company not found', 404);
  c.verification = s; await c.save(); await audit(req, `COMPANY_${s.toUpperCase()}`, 'company', c._id, { name: c.name, note: String(req.body.note || '').slice(0, 300) });
  if (c.owner) await notify(c.owner, 'COMPANY_VERIFICATION', 'Company verification update', `${c.name} verification: ${s}`, '/recruiter/company'); res.json({ success: true, verification: s });
});
exports.categories = asyncHandler(async (_req, res) => {
  const counts = Object.fromEntries((await Job.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }])).map((c) => [String(c._id), c.n]));
  res.json({ success: true, categories: (await JobCategory.find().sort('name').lean()).map((c) => ({ ...c, jobCount: counts[String(c._id)] || 0 })) });
});
exports.createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim(); if (name.length < 2) throw new AppError('Name required', 400);
  const c = await JobCategory.create({ name, slug: slugify(name), description: String(req.body.description || '').slice(0, 300) }); await audit(req, 'CATEGORY_CREATE', 'category', c._id, { name }); res.status(201).json({ success: true, category: c });
});
exports.updateCategory = asyncHandler(async (req, res) => {
  const c = await JobCategory.findById(req.params.id); if (!c) throw new AppError('Category not found', 404);
  if (req.body.name) c.name = String(req.body.name).trim(); if (req.body.description !== undefined) c.description = String(req.body.description).slice(0, 300); if (typeof req.body.active === 'boolean') c.active = req.body.active;
  await c.save(); await audit(req, 'CATEGORY_UPDATE', 'category', c._id, { name: c.name, active: c.active }); res.json({ success: true, category: c });
});
exports.deleteCategory = asyncHandler(async (req, res) => {
  const c = await JobCategory.findById(req.params.id); if (!c) throw new AppError('Category not found', 404);
  if (await Job.exists({ category: c._id })) { c.active = false; await c.save(); await audit(req, 'CATEGORY_DEACTIVATE', 'category', c._id, { name: c.name }); return res.json({ success: true, deactivated: true }); } // has jobs: keep
  await c.deleteOne(); await audit(req, 'CATEGORY_DELETE', 'category', c._id, { name: c.name }); res.json({ success: true });
});
exports.skills = asyncHandler(async (req, res) => { const f = req.query.q ? { name: new RegExp(esc(req.query.q), 'i') } : {}; res.json({ success: true, skills: await Skill.find(f).sort('name').limit(200).lean() }); });
exports.createSkill = asyncHandler(async (req, res) => { const name = String(req.body.name || '').trim(); if (!name || name.length > 50) throw new AppError('Valid skill name required', 400);
  const s = await Skill.findOneAndUpdate({ name }, { $setOnInsert: { name } }, { upsert: true, new: true }); await audit(req, 'SKILL_CREATE', 'skill', s._id, { name }); res.status(201).json({ success: true, skill: s }); });
exports.deleteSkill = asyncHandler(async (req, res) => { const s = await Skill.findByIdAndDelete(req.params.id); if (s) await audit(req, 'SKILL_DELETE', 'skill', s._id, { name: s.name }); res.json({ success: true }); });
exports.reports = asyncHandler(async (req, res) => {
  const f = {}; if (req.query.status) f.status = String(req.query.status);
  const r = await paged(Report, f, req, { populate: { path: 'reporter', select: 'name email' } });
  const jobIds = r.items.filter((i) => i.targetType === 'job').map((i) => i.targetId); const jobs = Object.fromEntries((await Job.find({ _id: { $in: jobIds } }).select('title').lean()).map((j) => [String(j._id), j.title]));
  res.json({ success: true, ...r, items: r.items.map((i) => ({ ...i, targetLabel: jobs[String(i.targetId)] })) });
});
exports.updateReport = asyncHandler(async (req, res) => {
  if (!['open', 'reviewing', 'resolved', 'dismissed'].includes(req.body.status)) throw new AppError('Invalid status', 400);
  const r = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status, resolutionNote: String(req.body.resolutionNote || '').slice(0, 500) }, { new: true }); if (!r) throw new AppError('Report not found', 404);
  await audit(req, `REPORT_${r.status.toUpperCase()}`, 'report', r._id, { targetType: r.targetType }); res.json({ success: true, report: r });
});
exports.auditLogs = asyncHandler(async (req, res) => res.json({ success: true, ...(await paged(AuditLog, {}, req, { populate: { path: 'actor', select: 'name' } })) }));
exports.createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason } = req.body; const kind = req.body.kind === 'complaint' ? 'complaint' : 'report';
  if (!['job', 'company', 'user'].includes(targetType)) throw new AppError('Invalid target type', 400); if (!/^[a-f\d]{24}$/i.test(String(targetId))) throw new AppError('Invalid target', 400);
  if (!reason || String(reason).trim().length < 5) throw new AppError('Please describe the problem (min 5 characters)', 400);
  const Model = { job: Job, company: Company, user: User }[targetType]; if (!(await Model.exists({ _id: targetId }))) throw new AppError('Target not found', 404);
  if (await Report.exists({ reporter: req.user._id, targetType, targetId, status: { $in: ['open', 'reviewing'] } })) throw new AppError('You already reported this', 409);
  await Report.create({ reporter: req.user._id, targetType, targetId, kind, reason: String(reason).trim().slice(0, 1000) }); res.status(201).json({ success: true });
});
