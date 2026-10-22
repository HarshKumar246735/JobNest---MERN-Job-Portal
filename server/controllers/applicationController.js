const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { WITHDRAWABLE } = require('../services/applicationFlow');
const { notify } = require('../services/notify');
const { asyncHandler, AppError } = require('../utils/helpers');
exports.apply = asyncHandler(async (req, res) => {
  const { jobId, resumeId, coverLetter, answers } = req.body;
  const job = await Job.findById(jobId);
  if (!job || job.status !== 'open') throw new AppError('This job is not open for applications', 400);
  if (job.deadline < new Date()) throw new AppError('The application deadline has passed', 400);
  if (await Application.findOne({ job: job._id, candidate: req.user._id })) throw new AppError('You have already applied to this job', 409);
  let resume = null;
  if (resumeId) { resume = await Resume.findOne({ _id: resumeId, user: req.user._id, archived: false }); if (!resume) throw new AppError('Selected resume not found', 400); }
  else throw new AppError('Please select or upload a resume', 400);
  if (job.requiresCoverLetter && !(coverLetter || '').trim()) throw new AppError('A cover letter is required for this job', 400);
  const given = Array.isArray(answers) ? answers : [];
  const qa = job.applicationQuestions.map((q) => ({ question: q, answer: String(given.find((a) => a.question === q)?.answer || '').slice(0, 1000) }));
  if (qa.some((a) => !a.answer.trim())) throw new AppError('Please answer all application questions', 400);
  const app = await Application.create({ job: job._id, candidate: req.user._id, resume: resume._id, coverLetter: String(coverLetter || '').slice(0, 4000), answers: qa, history: [{ status: 'APPLIED', by: req.user._id }] });
  await Job.updateOne({ _id: job._id }, { $inc: { applicationCount: 1 } });
  await Promise.all([
    notify(req.user._id, 'APPLICATION_SUBMITTED', 'Application submitted', `You applied to ${job.title} at ${job.companyName}`, `/candidate/applications`),
    notify(job.recruiter, 'NEW_APPLICATION', 'New application', `${req.user.name} applied to ${job.title}`, `/recruiter/applications`),
  ]);
  res.status(201).json({ success: true, application: app });
});
exports.mine = asyncHandler(async (req, res) => {
  const f = { candidate: req.user._id }; if (req.query.status) f.status = String(req.query.status);
  const apps = await Application.find(f).sort('-createdAt').populate('job', 'title slug companyName companyLogo city state status').populate('resume', 'title kind').lean();
  res.json({ success: true, applications: apps });
});
exports.getOne = asyncHandler(async (req, res) => {
  // recruiterNotes is select:false and never returned here, so candidates cannot see internal notes.
  const app = await Application.findOne({ _id: req.params.id, candidate: req.user._id }).populate('job', 'title slug companyName city state').lean();
  if (!app) throw new AppError('Application not found', 404);
  res.json({ success: true, application: app });
});
exports.withdraw = asyncHandler(async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, candidate: req.user._id }).populate('job', 'title recruiter');
  if (!app) throw new AppError('Application not found', 404);
  if (!WITHDRAWABLE.includes(app.status)) throw new AppError(`An application in status ${app.status} cannot be withdrawn`, 400);
  app.status = 'WITHDRAWN'; app.history.push({ status: 'WITHDRAWN', by: req.user._id }); await app.save();
  await notify(app.job.recruiter, 'APPLICATION_WITHDRAWN', 'Application withdrawn', `${req.user.name} withdrew from ${app.job.title}`, '/recruiter/applications');
  res.json({ success: true, application: app });
});
