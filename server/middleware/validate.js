const { validationResult } = require('express-validator');
module.exports = (req, res, next) => {
  const r = validationResult(req);
  if (r.isEmpty()) return next();
  res.status(400).json({ success: false, message: 'Validation failed', errors: r.array().map(e => ({ field: e.path, message: e.msg })) });
};
