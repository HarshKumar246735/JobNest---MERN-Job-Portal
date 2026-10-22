const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../utils/helpers');

const sign = (id) =>
jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const prod = process.env.NODE_ENV === 'production';

const configuredSameSite = (
process.env.COOKIE_SAME_SITE || (prod ? 'none' : 'lax')
).toLowerCase();

const sameSite = ['strict', 'lax', 'none'].includes(configuredSameSite)
? configuredSameSite
: prod
? 'none'
: 'lax';

const cookieOptions = {
httpOnly: true,
sameSite,
secure: prod || sameSite === 'none',
maxAge: 7 * 864e5,
path: '/',
};

const send = (res, user, status = 200) => {
const token = sign(user._id);

res.cookie('token', token, cookieOptions);

res.status(status).json({
success: true,
token,
user: user.toSafe(),
});
};

exports.register = asyncHandler(async (req, res) => {
const { name, email, password } = req.body;

const role = req.body.role === 'recruiter' ? 'recruiter' : 'candidate';

if (await User.findOne({ email })) {
throw new AppError('Email already registered', 409);
}

send(res, await User.create({ name, email, password, role }), 201);
});

exports.login = asyncHandler(async (req, res) => {
const user = await User.findOne({ email: req.body.email }).select('+password');

if (!user || !(await user.matchPassword(req.body.password))) {
throw new AppError('Invalid email or password', 401);
}

if (user.status === 'suspended') {
throw new AppError('Account suspended', 403);
}

send(res, user);
});

exports.logout = (_req, res) => {
res.clearCookie('token', {
httpOnly: true,
sameSite,
secure: prod || sameSite === 'none',
path: '/',
});

res.json({ success: true });
};

exports.me = (req, res) =>
res.json({ success: true, user: req.user.toSafe() });

exports.forgotPassword = asyncHandler(async (req, res) => {
const user = await User.findOne({ email: req.body.email });

if (user) {
const raw = crypto.randomBytes(32).toString('hex');


user.resetTokenHash = crypto
  .createHash('sha256')
  .update(raw)
  .digest('hex');

user.resetTokenExpires = Date.now() + 15 * 60 * 1000;

await user.save({ validateBeforeSave: false });

if (!prod) {
  console.log(`[DEV] Password reset token for ${user.email}: ${raw}`);
}


}

res.json({
success: true,
message: 'If the account exists, reset instructions have been generated.',
});
});

exports.resetPassword = asyncHandler(async (req, res) => {
const hash = crypto
.createHash('sha256')
.update(req.body.token)
.digest('hex');

const user = await User.findOne({
resetTokenHash: hash,
resetTokenExpires: { $gt: Date.now() },
});

if (!user) {
throw new AppError('Token invalid or expired', 400);
}

user.password = req.body.password;
user.resetTokenHash = undefined;
user.resetTokenExpires = undefined;

await user.save();

send(res, user);
});
