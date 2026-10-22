class AppError extends Error { constructor(msg, status = 400) { super(msg); this.status = status; } }
exports.AppError = AppError;
exports.asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
