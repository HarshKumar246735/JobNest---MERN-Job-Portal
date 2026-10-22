const r = require('express').Router(); const { protect, authorize } = require('../middleware/auth'); const c = require('../controllers/adminController');
r.use(protect, authorize('admin')); // router is mounted on /api/admin only, so this cannot affect other routes
r.get('/dashboard', c.dashboard); r.get('/users', c.users); r.patch('/users/:id/status', c.setUserStatus);
r.get('/jobs', c.jobs); r.patch('/jobs/:id/moderate', c.moderateJob); r.get('/companies', c.companies); r.patch('/companies/:id/verify', c.verifyCompany);
r.get('/categories', c.categories); r.post('/categories', c.createCategory); r.patch('/categories/:id', c.updateCategory); r.delete('/categories/:id', c.deleteCategory);
r.get('/skills', c.skills); r.post('/skills', c.createSkill); r.delete('/skills/:id', c.deleteSkill);
r.get('/reports', c.reports); r.patch('/reports/:id', c.updateReport); r.get('/audit-logs', c.auditLogs);
module.exports = r;
