const r = require('express').Router();
const { protect } = require('../middleware/auth');
r.get('/:id/download', protect, require('../controllers/resumeController').download);
module.exports = r;
