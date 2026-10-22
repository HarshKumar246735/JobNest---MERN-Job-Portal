const fs = require('fs'); const path = require('path'); const crypto = require('crypto'); const multer = require('multer');
const Company = require('../models/Company'); const Job = require('../models/Job'); const JobCategory = require('../models/JobCategory');
const Application = require('../models/Application'); const User = require('../models/User'); const Interview = require('../models/Interview');
const { RECRUITER_TRANSITIONS } = require('../services/applicationFlow'); const { notify } = require('../services/notify'); const { notifyMatches } = require('../services/alerts');
const { asyncHandler, AppError, slugify } = require('../utils/helpers');
const LOGO_DIR = path.join(__dirname, '../uploads/logos'); fs.mkdirSync(LOGO_DIR, { recursive: true });
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rand = () => crypto.randomBytes(3).toString('hex');
// ---------- Company ----------
exports.logoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024, files: 1 } }).single('logo');
const CFIELDS = ['name', 'website', 'industry', 'description', 'headquarters', 'size', 'foundedYear', 'workplaceInfo'];
const myCompany = async (user) => { const c = await Company.findOne({ owner: user._id }); if (!c) throw new AppError('Create your company profile first', 400); return c; };
exports.getMyCompany = asyncHandler(async (req, res) => res.json({ success: true, company: await Company.findOne({ owner: req.user._id }).lean() }));
exports.createCompany = asyncHandler(async (req, res) => {
  if (await Company.exists({ owner: req.user._id })) throw new AppError('You already have a company profile', 409);
  if (!req.body.name || String(req.body.name).trim().length < 2) throw new AppError('Company name is required', 400);
  const d = {}; CFIELDS.forEach((k) => { if (req.body[k] !== undefined) d[k] = req.body[k]; });
  if (Array.isArray(req.body.benefits)) d.benefits = req.body.benefits.slice(0, 20);
  const c = await Company.create({ ...d, owner: req.user._id, slug: `${slugify(d.name)}-${rand()}` });
  await User.updateOne({ _id: req.user._id }, { company: c._id });
  res.status(201).json({ success: true, company: c });
});
exports.updateCompany = asyncHandler(async (req, res) => {
  const c = await Company.findOne({ _id: req.params.id, owner: req.user._id });
  if (!c) throw new AppError('Company not found', 404);
  CFIELDS.forEach((k) => { if (req.body[k] !== undefined && k !== 'name') c[k] = req.body[k]; });
  if (req.body.name) { c.name = String(req.body.name).slice(0, 100); await Job.updateMany({ company: c._id }, { companyName: c.name }); }
  if (Array.isArray(req.body.benefits)) c.benefits = req.body.benefits.slice(0, 20);
  await c.save(); res.json({ success: true, company: c });
});
exports.uploadLogo = asyncHandler(async (req, res) => {
  const c = await Company.findOne({ _id: req.params.id, owner: req.user._id }); if (!c) throw new AppError('Company not found', 404);
  const b = req.file?.buffer; if (!b) throw new AppError('No file uploaded', 400);
  const ext = b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? 'png' : b.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ? 'jpg' : b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP' ? 'webp' : null;
  if (!ext) throw new AppError('Logo must be a PNG, JPG or WEBP image', 400);
  const name = `${crypto.randomUUID()}.${ext}`; await fs.promises.writeFile(path.join(LOGO_DIR, name), b);
  c.logoUrl = `${process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`}/uploads/logos/${name}`; await c.save();
  await Job.updateMany({ company: c._id }, { companyLogo: c.logoUrl }); res.json({ success: true, company: c });
});
exports.requestVerification = asyncHandler(async (req, res) => {
  const c = await myCompany(req.user);
  if (c.verification === 'verified') throw new AppError('Already verified', 400);
  c.verification = 'pending'; await c.save(); res.json({ success: true, company: c });
});
// ---------- Jobs ----------
const JF = ['title', 'description', 'responsibilities', 'qualifications', 'skills', 'preferredSkills', 'employmentType', 'workplace', 'experienceLevel', 'minExperienceYears', 'salaryMin', 'salaryMax', 'city', 'state', 'country', 'deadline', 'openings', 'education', 'benefits', 'applicationQuestions', 'requiresCoverLetter'];
const own = async (user, id) => { const j = await Job.findOne({ _id: id, recruiter: user._id }); if (!j) throw new AppError('Job not found', 404); return j; };
exports.myJobs = asyncHandler(async (req, res) => {
  const f = { recruiter: req.user._id }; if (req.query.status) f.status = String(req.query.status);
  res.json({ success: true, jobs: await Job.find(f).sort('-createdAt').select('-description -responsibilities -qualifications').lean() });
});
exports.getMyJob = asyncHandler(async (req, res) => res.json({ success: true, job: await own(req.user, req.params.id) }));
exports.createJob = asyncHandler(async (req, res) => {
  const company = await myCompany(req.user); const cat = await JobCategory.findById(req.body.category); if (!cat) throw new AppError('Invalid category', 400);
  const d = {}; JF.forEach((k) => { if (req.body[k] !== undefined) d[k] = req.body[k]; });
  const publish = req.body.publish === true;
  if (publish && new Date(d.deadline) < new Date()) throw new AppError('Deadline must be in the future to publish', 400);
  const job = await Job.create({ ...d, company: company._id, companyName: company.name, companyLogo: company.logoUrl, recruiter: req.user._id, category: cat._id, categorySlug: cat.slug,
    slug: `${slugify(d.title)}-${slugify(company.name)}-${rand()}`, status: publish ? 'open' : 'draft', publishedAt: new Date() });
  if (publish) notifyMatches(job).catch((e) => console.error('alert match failed', e.message));
  res.status(201).json({ success: true, job });
});
exports.updateJob = asyncHandler(async (req, res) => {
  const job = await own(req.user, req.params.id); if (job.status === 'rejected') throw new AppError('Rejected jobs cannot be edited', 400);
  JF.forEach((k) => { if (req.body[k] !== undefined) job[k] = req.body[k]; });
  if (req.body.category) { const c = await JobCategory.findById(req.body.category); if (!c) throw new AppError('Invalid category', 400); job.category = c._id; job.categorySlug = c.slug; }
  await job.save(); res.json({ success: true, job });
});
const MOVES = { draft: ['open'], open: ['paused', 'closed'], paused: ['open', 'closed'], closed: ['open'] };
exports.setStatus = asyncHandler(async (req, res) => {
  const job = await own(req.user, req.params.id), to = req.body.status;
  if (!MOVES[job.status]?.includes(to)) throw new AppError(`Cannot change a ${job.status} job to ${to}`, 400);
  if (to === 'open' && job.deadline < new Date()) throw new AppError('Extend the deadline before reopening this job', 400);
  const wasDraft = job.status === 'draft'; job.status = to; if (wasDraft) job.publishedAt = new Date(); await job.save();
  if (wasDraft) notifyMatches(job).catch(() => {}); res.json({ success: true, job });
});
exports.removeJob = asyncHandler(async (req, res) => {
  const job = await own(req.user, req.params.id);
  if (job.status === 'draft' && job.applicationCount === 0) await job.deleteOne(); else { job.status = 'closed'; await job.save(); } // keep history
  res.json({ success: true });
});
exports.duplicateJob = asyncHandler(async (req, res) => {
  const j = (await own(req.user, req.params.id)).toObject(); const d = {}; JF.forEach((k) => (d[k] = j[k]));
  const copy = await Job.create({ ...d, title: `${j.title} (copy)`, deadline: new Date(Date.now() + 30 * 864e5), company: j.company, companyName: j.companyName, companyLogo: j.companyLogo,
    recruiter: j.recruiter, category: j.category, categorySlug: j.categorySlug, slug: `${slugify(j.title)}-${rand()}${rand()}`, status: 'draft' });
  res.status(201).json({ success: true, job: copy });
});
// ---------- Applications ----------
exports.applications = asyncHandler(async (req, res) => {
  const ids = await Job.find({ recruiter: req.user._id }).distinct('_id'); const f = { job: { $in: ids } };
  if (req.query.job) { if (!ids.some((i) => String(i) === String(req.query.job))) throw new AppError('Job not found', 404); f.job = req.query.job; }
  if (req.query.status) f.status = String(req.query.status);
  if (req.query.q) f.candidate = { $in: await User.find({ role: 'candidate', name: new RegExp(esc(req.query.q), 'i') }).distinct('_id') };
  const page = Math.max(parseInt(req.query.page) || 1, 1), limit = 15;
  const [apps, total] = await Promise.all([Application.find(f).sort('-createdAt').skip((page - 1) * limit).limit(limit).populate('candidate', 'name profile.headline profile.location profile.skills').populate('job', 'title slug').lean(), Application.countDocuments(f)]);
  res.json({ success: true, applications: apps, total, page, pages: Math.ceil(total / limit) });
});
const loadApp = async (user, id, notes = false) => {
  const app = await Application.findById(id).select(notes ? '+recruiterNotes' : '').populate('job', 'title slug recruiter companyName').populate('candidate').populate('resume', 'title kind file.originalName file.size');
  if (!app || String(app.job.recruiter) !== String(user._id)) throw new AppError('Application not found', 404); return app;
};
exports.getApplication = asyncHandler(async (req, res) => {
  const a = (await loadApp(req.user, req.params.id, true)).toObject(), c = a.candidate, p = c.profile || {}, pv = p.privacy || {};
  a.candidate = { _id: c._id, name: c.name, email: pv.showEmail ? c.email : undefined, phone: pv.showPhone ? c.phone : undefined, profile: { ...p, privacy: undefined } }; // private contact details hidden unless allowed
  const interviews = await Interview.find({ application: a._id }).sort('-date').lean();
  res.json({ success: true, application: a, interviews });
});
exports.setAppStatus = asyncHandler(async (req, res) => {
  const app = await loadApp(req.user, req.params.id), to = req.body.status;
  if (to === 'INTERVIEW_SCHEDULED') throw new AppError('Schedule an interview to move a candidate to this stage', 400);
  if (!RECRUITER_TRANSITIONS[app.status]?.includes(to)) throw new AppError(`Cannot move an application from ${app.status} to ${to}`, 400);
  app.status = to; app.history.push({ status: to, by: req.user._id, note: String(req.body.note || '').slice(0, 300) }); await app.save();
  await notify(app.candidate._id, 'STATUS_CHANGE', 'Application update', `Your application for ${app.job.title} is now ${to.replace('_', ' ').toLowerCase()}`, '/candidate/applications');
  res.json({ success: true, status: app.status });
});
exports.addNote = asyncHandler(async (req, res) => {
  const text = String(req.body.text || '').trim(); if (!text) throw new AppError('Note cannot be empty', 400);
  const app = await loadApp(req.user, req.params.id, true); app.recruiterNotes.push({ by: req.user._id, text: text.slice(0, 1000) }); await app.save(); res.status(201).json({ success: true, notes: app.recruiterNotes });
});
const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; }; // CSV-injection safe
exports.exportCsv = asyncHandler(async (req, res) => {
  const ids = await Job.find({ recruiter: req.user._id }).distinct('_id'); const f = { job: { $in: ids } }; if (req.query.status) f.status = String(req.query.status);
  const apps = await Application.find(f).sort('-createdAt').populate('candidate', 'name email profile.privacy profile.headline').populate('job', 'title').lean();
  const rows = [['Candidate', 'Headline', 'Email', 'Job', 'Status', 'Applied on'], ...apps.map((a) => [a.candidate?.name, a.candidate?.profile?.headline, a.candidate?.profile?.privacy?.showEmail ? a.candidate.email : '', a.job?.title, a.status, a.createdAt.toISOString().slice(0, 10)])];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"'); res.send(rows.map((r) => r.map(cell).join(',')).join('\n'));
});
exports.dashboard = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).select('title status applicationCount').lean(); const ids = jobs.map((j) => j._id);
  const [by, interviews, recent] = await Promise.all([Application.aggregate([{ $match: { job: { $in: ids } } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    Interview.countDocuments({ recruiter: req.user._id, status: { $in: ['SCHEDULED', 'RESCHEDULED'] }, date: { $gte: new Date(Date.now() - 864e5) } }),
    Application.find({ job: { $in: ids } }).sort('-createdAt').limit(6).populate('candidate', 'name profile.headline').populate('job', 'title').lean()]);
  const c = Object.fromEntries(by.map((s) => [s._id, s.n]));
  res.json({ success: true, hasCompany: !!(await Company.exists({ owner: req.user._id })), activeJobs: jobs.filter((j) => j.status === 'open').length, closedJobs: jobs.filter((j) => j.status === 'closed').length,
    totalApplications: Object.values(c).reduce((a, b) => a + b, 0), awaitingReview: c.APPLIED || 0, shortlisted: c.SHORTLISTED || 0, interviews, recent,
    performance: jobs.sort((a, b) => b.applicationCount - a.applicationCount).slice(0, 8).map((j) => ({ name: j.title.slice(0, 22), applications: j.applicationCount })) });
});
