const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../utils/helpers');
exports.protect = asyncHandler(async (req, _res, next) => {
  const h = req.headers.authorization;
  const token = req.cookies?.token || (h && h.startsWith('Bearer ') ? h.slice(7) : null);
  if (!token) throw new AppError('Authentication required', 401);
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); } catch { throw new AppError('Invalid or expired token', 401); }
  const user = await User.findById(payload.id);
  if (!user) throw new AppError('User no longer exists', 401);
  if (user.status === 'suspended') throw new AppError('Account suspended', 403);
  req.user = user; next();
});
exports.authorize = (...roles) => (req, _res, next) =>
  roles.includes(req.user.role) ? next() : next(new AppError('Forbidden', 403));
