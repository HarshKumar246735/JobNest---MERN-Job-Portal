const { query } = require('express-validator');
const L = ['Internship', 'Fresher', 'Entry-level', 'Mid-level', 'Senior-level', 'Lead'];
exports.list = [
  query('page').optional().isInt({ min: 1, max: 1000 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('sort').optional().isIn(['relevant', 'newest', 'salary_asc', 'salary_desc']),
  query('experience').optional().isIn(L),
  query('type').optional().isIn(['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance']),
  query('workplace').optional().isIn(['On-site', 'Hybrid', 'Remote']),
  query('salaryMin').optional().isInt({ min: 0 }).toInt(),
  query('salaryMax').optional().isInt({ min: 0 }).toInt(),
  query('days').optional().isInt({ min: 1, max: 365 }).toInt(),
  query('q').optional().isString().isLength({ max: 100 }),
  query('location').optional().isString().isLength({ max: 100 }),
  query('skills').optional().isString().isLength({ max: 200 }),
  query('company').optional().isString().isLength({ max: 100 }),
  query('education').optional().isString().isLength({ max: 100 }),
  query('category').optional().isString().isLength({ max: 100 }),
];
