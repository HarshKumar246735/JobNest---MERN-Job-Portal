const { body } = require('express-validator');
exports.register = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 chars'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars'),
  body('role').optional().isIn(['candidate', 'recruiter']).withMessage('Invalid role'),
];
exports.login = [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()];
exports.forgot = [body('email').isEmail().normalizeEmail()];
exports.reset = [body('token').isString().notEmpty(), body('password').isLength({ min: 8 })];
