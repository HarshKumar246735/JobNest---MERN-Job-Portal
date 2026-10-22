const Notification = require('../models/Notification');
const { asyncHandler, AppError } = require('../utils/helpers');
exports.list = asyncHandler(async (req, res) => {
  const [items, unread] = await Promise.all([Notification.find({ user: req.user._id }).sort('-createdAt').limit(100).lean(), Notification.countDocuments({ user: req.user._id, read: false })]);
  res.json({ success: true, notifications: items, unread });
});
exports.read = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
  if (!n) throw new AppError('Notification not found', 404); res.json({ success: true });
});
exports.readAll = asyncHandler(async (req, res) => { await Notification.updateMany({ user: req.user._id, read: false }, { read: true }); res.json({ success: true }); });
exports.remove = asyncHandler(async (req, res) => { await Notification.deleteOne({ _id: req.params.id, user: req.user._id }); res.json({ success: true }); });
