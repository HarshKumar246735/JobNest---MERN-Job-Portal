const Job = require('../models/Job');
const Company = require('../models/Company');
const JobCategory = require('../models/JobCategory');
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rx = (s) => new RegExp(esc(s.trim()), 'i');

exports.buildFilter = async (q) => {
  const f = { status: 'open', deadline: { $gte: new Date() } };
  const and = [];
  if (q.q) { const r = rx(q.q); and.push({ $or: [{ title: r }, { skills: r }, { companyName: r }, { city: r }, { state: r }] }); }
  if (q.location) { const r = rx(q.location); and.push({ $or: [{ city: r }, { state: r }, { country: r }] }); }
  if (q.category) {
    const c = await JobCategory.findOne({ slug: String(q.category) });
    f.category = c ? c._id : null;
  }
  if (q.experience) f.experienceLevel = q.experience;
  if (q.type) f.employmentType = q.type;
  if (q.workplace) f.workplace = q.workplace;
  if (q.fresher === 'true') f.experienceLevel = { $in: ['Fresher', 'Internship', 'Entry-level'] };
  if (q.internship === 'true') f.employmentType = 'Internship';
  if (q.salaryMin) f.salaryMax = { $gte: q.salaryMin };
  if (q.salaryMax) f.salaryMin = { $lte: q.salaryMax };
  if (q.skills) f.skills = { $all: String(q.skills).split(',').map((s) => s.trim()).filter(Boolean).map((s) => new RegExp(`^${esc(s)}$`, 'i')) };
  if (q.education) f.education = rx(q.education);
  if (q.days) f.publishedAt = { $gte: new Date(Date.now() - q.days * 864e5) };
  if (q.company) {
    const c = await Company.findOne({ $or: [{ slug: String(q.company) }, { name: rx(q.company) }] });
    f.company = c ? c._id : null;
  }
  if (q.verified === 'true') {
    const ids = await Company.find({ verification: 'verified' }).distinct('_id');
    f.company = f.company ? (ids.some((i) => String(i) === String(f.company)) ? f.company : null) : { $in: ids };
  }
  if (and.length) f.$and = and;
  return f;
};
const SORTS = { relevant: { featured: -1, publishedAt: -1 }, newest: { publishedAt: -1 }, salary_asc: { salaryMin: 1 }, salary_desc: { salaryMax: -1 } };

exports.search = async (q) => {
  const page = q.page || 1, limit = q.limit || 12;
  const filter = await exports.buildFilter(q);
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ ...SORTS[q.sort || 'relevant'], _id: 1 }).skip((page - 1) * limit).limit(limit)
      .select('-recruiter -responsibilities -qualifications').lean(),
    Job.countDocuments(filter),
  ]);
  return { jobs, total, page, pages: Math.ceil(total / limit) };
};
