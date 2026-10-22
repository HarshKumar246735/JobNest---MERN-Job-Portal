const mongoose = require('mongoose');
const Job = require('../models/Job');
const Company = require('../models/Company');
const JobCategory = require('../models/JobCategory');
const Skill = require('../models/Skill');
const { search } = require('../services/jobSearch');
const { asyncHandler, AppError } = require('../utils/helpers');
const PUBLIC_JOB = { status: 'open' };
const byIdOrSlug = (v) => (mongoose.isValidObjectId(v) ? { _id: v } : { slug: String(v) });

exports.listJobs = asyncHandler(async (req, res) => res.json({ success: true, ...(await search(req.query)) }));
exports.featured = asyncHandler(async (_req, res) =>
  res.json({ success: true, jobs: await Job.find({ ...PUBLIC_JOB, featured: true }).sort({ publishedAt: -1 }).limit(8).select('-recruiter').lean() }));
exports.getJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ ...byIdOrSlug(req.params.id), status: { $in: ['open', 'paused', 'closed'] } })
    .populate('company', 'name slug logoUrl industry verification headquarters size website').select('-recruiter').lean();
  if (!job) throw new AppError('Job not found', 404);
  const similar = await Job.find({ ...PUBLIC_JOB, category: job.category, _id: { $ne: job._id } }).limit(4).select('title slug companyName city workplace salaryMin salaryMax').lean();
  res.json({ success: true, job, similar });
});
exports.suggestions = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ success: true, suggestions: [] });
  const r = new RegExp('^' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const [titles, skills, companies] = await Promise.all([
    Job.distinct('title', { ...PUBLIC_JOB, title: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }),
    Skill.find({ name: r }).limit(5).distinct('name'),
    Company.find({ name: r }).limit(5).distinct('name'),
  ]);
  res.json({ success: true, suggestions: [...titles.slice(0, 5).map((t) => ({ type: 'Job', text: t })), ...skills.map((t) => ({ type: 'Skill', text: t })), ...companies.map((t) => ({ type: 'Company', text: t }))] });
});
exports.categories = asyncHandler(async (_req, res) => {
  const counts = await Job.aggregate([{ $match: PUBLIC_JOB }, { $group: { _id: '$category', count: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  const cats = await JobCategory.find({ active: true }).sort('name').lean();
  res.json({ success: true, categories: cats.map((c) => ({ ...c, jobCount: map[String(c._id)] || 0 })) });
});
exports.homeStats = asyncHandler(async (_req, res) => {
  const [jobs, companies, skills] = await Promise.all([
    Job.countDocuments(PUBLIC_JOB), Company.countDocuments(),
    Job.aggregate([{ $match: PUBLIC_JOB }, { $unwind: '$skills' }, { $group: { _id: '$skills', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 12 }]),
  ]);
  res.json({ success: true, jobs, companies, topSkills: skills.map((s) => s._id) });
});
exports.listCompanies = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1), limit = 12;
  const f = req.query.q ? { name: new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } : {};
  const [companies, total] = await Promise.all([Company.find(f).sort('name').skip((page - 1) * limit).limit(limit).select('-owner').lean(), Company.countDocuments(f)]);
  const counts = await Job.aggregate([{ $match: { ...PUBLIC_JOB, company: { $in: companies.map((c) => c._id) } } }, { $group: { _id: '$company', n: { $sum: 1 } } }]);
  const m = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json({ success: true, total, pages: Math.ceil(total / limit), page, companies: companies.map((c) => ({ ...c, activeJobs: m[String(c._id)] || 0 })) });
});
exports.getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne(byIdOrSlug(req.params.id)).select('-owner').lean();
  if (!company) throw new AppError('Company not found', 404);
  const jobs = await Job.find({ ...PUBLIC_JOB, company: company._id }).sort({ publishedAt: -1 }).limit(30).select('-recruiter').lean();
  res.json({ success: true, company, jobs });
});
