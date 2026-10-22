module.exports = (err, _req, res, _next) => {
  let status = err.status || 500, message = err.message;
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.code === 11000) { status = 409; message = 'Duplicate value: record already exists'; }
  if (err.name === 'CastError') { status = 400; message = 'Invalid identifier'; }
  if (status >= 500) { console.error(err); message = 'Internal server error'; }
  res.status(status).json({ success: false, message });
};
