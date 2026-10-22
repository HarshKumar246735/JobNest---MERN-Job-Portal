const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const JobAlert = require('../models/JobAlert');
const { asyncHandler, AppError } = require('../utils/helpers');
exports.save = asyncHandler(async (req, res) => {
  if (!(await Job.exists({ _id: req.params.jobId }))) throw new AppError('Job not found', 404);
  await SavedJob.updateOne({ user: req.user._id, job: req.params.jobId }, { $setOnInsert: {} }, { upsert: true });
  res.status(201).json({ success: true });
});
exports.unsave = asyncHandler(async (req, res) => { await SavedJob.deleteOne({ user: req.user._id, job: req.params.jobId }); res.json({ success: true }); });
exports.list = asyncHandler(async (req, res) => {
  const items = await SavedJob.find({ user: req.user._id }).sort('-createdAt').populate({ path: 'job', select: '-recruiter' }).lean();
  res.json({ success: true, jobs: items.filter((i) => i.job).map((i) => i.job), ids: items.map((i) => String(i.job?._id)) });
});
const pick = (b) => ({ keywords: String(b.keywords || '').slice(0, 100), location: String(b.location || '').slice(0, 100), experienceLevel: String(b.experienceLevel || ''),
  workplace: Array.isArray(b.workplace) ? b.workplace.slice(0, 3) : [], employmentType: Array.isArray(b.employmentType) ? b.employmentType.slice(0, 5) : [], active: b.active !== false });
exports.alerts = asyncHandler(async (req, res) => res.json({ success: true, alerts: await JobAlert.find({ user: req.user._id }).sort('-createdAt').lean() }));
exports.createAlert = asyncHandler(async (req, res) => {
  const a = pick(req.body); if (!a.keywords && !a.location) throw new AppError('Provide keywords or a location', 400);
  if ((await JobAlert.countDocuments({ user: req.user._id })) >= 10) throw new AppError('Maximum 10 alerts', 400);
  res.status(201).json({ success: true, alert: await JobAlert.create({ ...a, user: req.user._id }) });
});
exports.updateAlert = asyncHandler(async (req, res) => {
  const a = await JobAlert.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, pick(req.body), { new: true });
  if (!a) throw new AppError('Alert not found', 404); res.json({ success: true, alert: a });
});
exports.deleteAlert = asyncHandler(async (req, res) => { await JobAlert.deleteOne({ _id: req.params.id, user: req.user._id }); res.json({ success: true }); });
