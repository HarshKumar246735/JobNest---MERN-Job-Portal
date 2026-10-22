const { body } = require('express-validator');
module.exports = (patch = false) => {
  const o = (c) => (patch ? c.optional() : c);
  return [
    o(body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters')),
    o(body('description').trim().isLength({ min: 30, max: 8000 }).withMessage('Description must be at least 30 characters')),
    o(body('category').isMongoId().withMessage('Valid category required')),
    o(body('employmentType').isIn(['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'])),
    o(body('workplace').isIn(['On-site', 'Hybrid', 'Remote'])),
    o(body('experienceLevel').isIn(['Internship', 'Fresher', 'Entry-level', 'Mid-level', 'Senior-level', 'Lead'])),
    o(body('deadline').isISO8601().withMessage('Valid deadline required')),
    body('skills').optional().isArray({ max: 30 }), body('preferredSkills').optional().isArray({ max: 30 }),
    body('responsibilities').optional().isArray({ max: 30 }), body('qualifications').optional().isArray({ max: 30 }),
    body('benefits').optional().isArray({ max: 30 }), body('applicationQuestions').optional().isArray({ max: 10 }),
    body('salaryMin').optional({ values: 'falsy' }).isInt({ min: 0 }).toInt(), body('salaryMax').optional({ values: 'falsy' }).isInt({ min: 0 }).toInt(),
    body('salaryMax').custom((v, { req }) => !v || !req.body.salaryMin || Number(v) >= Number(req.body.salaryMin)).withMessage('Maximum salary must be at least the minimum'),
    body('openings').optional().isInt({ min: 1, max: 1000 }).toInt(),
  ];
};
