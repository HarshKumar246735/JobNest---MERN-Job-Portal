const { Server } = require('socket.io'); const jwt = require('jsonwebtoken'); const User = require('../models/User');
// Authenticated sockets: each user joins only their own private room, so they receive only their own notifications.
module.exports = (httpServer) => {
  const io = new Server(httpServer, { cors: { origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), credentials: true } });
  io.use(async (socket, next) => {
    try {
      const m = /(?:^|;\s*)token=([^;]+)/.exec(socket.handshake.headers.cookie || ''); const token = socket.handshake.auth?.token || (m && decodeURIComponent(m[1]));
      if (!token) return next(new Error('Authentication required'));
      const user = await User.findById(jwt.verify(token, process.env.JWT_SECRET).id).select('status');
      if (!user || user.status === 'suspended') return next(new Error('Unauthorized')); socket.userId = String(user._id); next();
    } catch { next(new Error('Unauthorized')); }
  });
  io.on('connection', (s) => s.join(`user:${s.userId}`));
  return io;
};
