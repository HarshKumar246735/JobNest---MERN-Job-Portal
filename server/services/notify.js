const Notification = require('../models/Notification');
// Creates an in-app notification. Real-time push via Socket.IO is attached in a later phase (io set via setIO).
let io = null;
exports.setIO = (i) => { io = i; };
exports.notify = async (user, type, title, message, link) => {
  const n = await Notification.create({ user, type, title, message, link });
  if (io) io.to(`user:${user}`).emit('notification', n);
  return n;
};
