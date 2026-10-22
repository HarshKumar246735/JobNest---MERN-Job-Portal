const r = require('express').Router(); const { protect } = require('../middleware/auth');
r.post('/', protect, require('../controllers/adminController').createReport); module.exports = r;
