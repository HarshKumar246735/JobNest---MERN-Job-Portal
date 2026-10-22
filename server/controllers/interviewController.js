const Interview = require('../models/Interview'); const Application = require('../models/Application');
const { notify } = require('../services/notify'); const { asyncHandler, AppError } = require('../utils/helpers');
const T = /^([01]\d|2[0-3]):[0-5]\d$/;
const check = (b) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '')) throw new AppError('Valid interview date required', 400);
  if (b.date < new Date().toISOString().slice(0, 10)) throw new AppError('Interview date cannot be in the past', 400);
  if (!T.test(b.startTime || '') || !T.test(b.endTime || '')) throw new AppError('Valid start and end times required (HH:MM)', 400);
  if (b.endTime <= b.startTime) throw new AppError('End time must be after start time', 400);
  if (!['Online', 'Phone', 'In person'].includes(b.mode)) throw new AppError('Invalid interview mode', 400);
  if (b.mode === 'Online' && !/^https?:\/\//i.test(b.meetingUrl || '')) throw new AppError('A valid meeting URL is required for online interviews', 400);
  if (b.mode === 'In person' && !(b.location || '').trim()) throw new AppError('A location is required for in-person interviews', 400);
};
const fields = (b) => ({ date: new Date(`${b.date}T00:00:00Z`), startTime: b.startTime, endTime: b.endTime, timezone: String(b.timezone || 'Asia/Kolkata').slice(0, 50), mode: b.mode,
  meetingUrl: b.mode === 'Online' ? b.meetingUrl : undefined, location: b.mode === 'In person' ? String(b.location).slice(0, 200) : undefined, instructions: String(b.instructions || '').slice(0, 1000) });
const when = (i) => `${i.date.toISOString().slice(0, 10)} ${i.startTime}-${i.endTime} (${i.timezone})`;
const mine = async (user, id) => { const i = await Interview.findOne({ _id: id, recruiter: user._id }); if (!i) throw new AppError('Interview not found', 404); return i; };
exports.create = asyncHandler(async (req, res) => {
  check(req.body);
  const app = await Application.findById(req.body.applicationId).populate('job', 'title recruiter');
  if (!app || String(app.job.recruiter) !== String(req.user._id)) throw new AppError('Application not found', 404);
  if (!['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(app.status)) throw new AppError(`Cannot schedule an interview for an application in status ${app.status}`, 400);
  if (await Interview.exists({ application: app._id, status: { $in: ['SCHEDULED', 'RESCHEDULED'] } })) throw new AppError('An interview is already scheduled. Reschedule it instead.', 409);
  const i = await Interview.create({ ...fields(req.body), application: app._id, job: app.job._id, candidate: app.candidate, recruiter: req.user._id });
  if (app.status !== 'INTERVIEW_SCHEDULED') { app.status = 'INTERVIEW_SCHEDULED'; app.history.push({ status: 'INTERVIEW_SCHEDULED', by: req.user._id }); await app.save(); }
  await notify(app.candidate, 'INTERVIEW_SCHEDULED', 'Interview scheduled', `${app.job.title}: ${when(i)}, ${i.mode}`, '/candidate/dashboard');
  res.status(201).json({ success: true, interview: i }); // in-app notification only; no email is sent
});
exports.mine = asyncHandler(async (req, res) => {
  const f = req.user.role === 'recruiter' ? { recruiter: req.user._id } : { candidate: req.user._id };
  const list = await Interview.find(f).sort('date startTime').populate('job', 'title companyName').populate('candidate', 'name').lean();
  res.json({ success: true, interviews: req.user.role === 'candidate' ? list.map((i) => ({ ...i, candidate: undefined })) : list });
});
exports.update = asyncHandler(async (req, res) => {
  const i = await mine(req.user, req.params.id);
  if (['CANCELLED', 'COMPLETED'].includes(i.status)) throw new AppError(`A ${i.status.toLowerCase()} interview cannot be changed`, 400);
  if (req.body.status === 'COMPLETED') { i.status = 'COMPLETED'; await i.save(); return res.json({ success: true, interview: i }); }
  check(req.body); Object.assign(i, fields(req.body)); i.status = 'RESCHEDULED'; await i.save();
  await notify(i.candidate, 'INTERVIEW_RESCHEDULED', 'Interview rescheduled', `New time: ${when(i)}, ${i.mode}`, '/candidate/dashboard'); res.json({ success: true, interview: i });
});
exports.cancel = asyncHandler(async (req, res) => {
  const i = await mine(req.user, req.params.id); if (['CANCELLED', 'COMPLETED'].includes(i.status)) throw new AppError('Interview already finished', 400);
  i.status = 'CANCELLED'; await i.save();
  const app = await Application.findById(i.application);
  if (app?.status === 'INTERVIEW_SCHEDULED' && !(await Interview.exists({ application: app._id, status: { $in: ['SCHEDULED', 'RESCHEDULED'] } }))) { app.status = 'SHORTLISTED'; app.history.push({ status: 'SHORTLISTED', by: req.user._id, note: 'Interview cancelled' }); await app.save(); }
  await notify(i.candidate, 'INTERVIEW_CANCELLED', 'Interview cancelled', `Your interview on ${when(i)} was cancelled`, '/candidate/dashboard'); res.json({ success: true });
});
