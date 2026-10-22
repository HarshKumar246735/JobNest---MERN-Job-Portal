const User = require('../models/User');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const JobAlert = require('../models/JobAlert');
const { recommend } = require('../services/recommend');
const { asyncHandler, AppError } = require('../utils/helpers');
const STR = ['headline', 'location', 'summary', 'portfolioUrl', 'githubUrl', 'linkedinUrl'];
const ARR = ['skills', 'languages', 'preferredLocations', 'employmentPreferences', 'education', 'experience', 'projects', 'certifications'];
const completion = (u, resumes) => {
  const p = u.profile || {};
  const checks = [u.name, u.phone, p.headline, p.location, p.summary, p.skills?.length, p.education?.length, p.experience?.length, p.expectedSalary, resumes > 0];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};
exports.updateProfile = asyncHandler(async (req, res) => {
  const u = req.user, b = req.body;
  if (b.name !== undefined) u.name = String(b.name).slice(0, 80);
  if (b.phone !== undefined) u.phone = String(b.phone).slice(0, 20);
  const p = (u.profile = u.profile || {});
  STR.forEach((k) => { if (b.profile?.[k] !== undefined) p[k] = String(b.profile[k]).slice(0, k === 'summary' ? 2000 : 200); });
  ARR.forEach((k) => { if (Array.isArray(b.profile?.[k])) p[k] = b.profile[k].slice(0, 30); });
  if (b.profile?.expectedSalary !== undefined) p.expectedSalary = Math.max(0, Number(b.profile.expectedSalary) || 0);
  if (b.profile?.noticePeriodDays !== undefined) p.noticePeriodDays = Math.max(0, Number(b.profile.noticePeriodDays) || 0);
  if (b.profile?.privacy) p.privacy = { showEmail: !!b.profile.privacy.showEmail, showPhone: !!b.profile.privacy.showPhone, publicProfile: !!b.profile.privacy.publicProfile };
  u.markModified('profile'); await u.save();
  res.json({ success: true, user: u.toSafe(), completion: completion(u, await Resume.countDocuments({ user: u._id, archived: false })) });
});
exports.changePassword = asyncHandler(async (req, res) => {
  const u = await User.findById(req.user._id).select('+password');
  if (!(await u.matchPassword(req.body.currentPassword || ''))) throw new AppError('Current password is incorrect', 400);
  if (!req.body.newPassword || req.body.newPassword.length < 8) throw new AppError('New password must be at least 8 characters', 400);
  u.password = req.body.newPassword; await u.save(); res.json({ success: true });
});
exports.dashboard = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const [byStatus, saved, resumes, interviews, notes, unread, alerts, recommended, recent] = await Promise.all([
    Application.aggregate([{ $match: { candidate: id } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    SavedJob.countDocuments({ user: id }), Resume.countDocuments({ user: id, archived: false }),
    Interview.find({ candidate: id, date: { $gte: new Date() }, status: { $in: ['SCHEDULED', 'RESCHEDULED'] } }).sort('date').limit(5).populate('job', 'title companyName').lean(),
    Notification.find({ user: id }).sort('-createdAt').limit(5).lean(), Notification.countDocuments({ user: id, read: false }),
    JobAlert.countDocuments({ user: id, active: true }), recommend(req.user, 4),
    Application.find({ candidate: id }).sort('-createdAt').limit(5).populate('job', 'title slug companyName').lean(),
  ]);
  const counts = Object.fromEntries(byStatus.map((s) => [s._id, s.n]));
  res.json({ success: true, completion: completion(req.user, resumes), counts, total: Object.values(counts).reduce((a, b) => a + b, 0),
    saved, resumes, alerts, interviews, notifications: notes, unread, recommended, recent });
});
