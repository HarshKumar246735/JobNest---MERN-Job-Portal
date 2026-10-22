const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const multer = require('multer');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const { asyncHandler, AppError } = require('../utils/helpers');
const DIR = path.join(__dirname, '../uploads/resumes'); fs.mkdirSync(DIR, { recursive: true }); // outside any static/public path
exports.upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } }).single('file');
// Content sniffing: never trust the extension or client mime alone.
const sniff = (b) => (b.slice(0, 4).toString() === '%PDF' ? 'pdf' : b.slice(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) ? 'docx' : null);
const MIME = { pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
const canView = async (user, r) => {
  if (String(r.user) === String(user._id) || user.role === 'admin') return true;
  if (user.role !== 'recruiter') return false;
  const apps = await Application.find({ resume: r._id }).populate('job', 'recruiter').lean();
  return apps.some((a) => String(a.job?.recruiter) === String(user._id));
};
const setDefault = async (userId, id) => { await Resume.updateMany({ user: userId }, { isDefault: false }); await Resume.updateOne({ _id: id }, { isDefault: true }); };
exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const kind = sniff(req.file.buffer), ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
  if (!kind || ext !== kind) throw new AppError('Only valid PDF or DOCX files are allowed', 400);
  const storedName = `${crypto.randomUUID()}.${kind}`;
  await fs.promises.writeFile(path.join(DIR, storedName), req.file.buffer, { mode: 0o600 });
  const count = await Resume.countDocuments({ user: req.user._id, archived: false });
  const r = await Resume.create({ user: req.user._id, kind: 'upload', title: String(req.body.title || req.file.originalname).slice(0, 100),
    file: { storedName, originalName: path.basename(req.file.originalname).slice(0, 150), mime: MIME[kind], size: req.file.size } });
  if (count === 0) await setDefault(req.user._id, r._id);
  res.status(201).json({ success: true, resume: await Resume.findById(r._id) });
});
exports.createBuilt = asyncHandler(async (req, res) => {
  const { title, template, sectionOrder, data } = req.body;
  if (!data || typeof data !== 'object') throw new AppError('Resume data is required', 400);
  const count = await Resume.countDocuments({ user: req.user._id, archived: false });
  const r = await Resume.create({ user: req.user._id, kind: 'built', title: String(title || 'My Resume').slice(0, 100), builder: { template: ['classic', 'modern', 'minimal'].includes(template) ? template : 'modern', sectionOrder, data } });
  if (count === 0) await setDefault(req.user._id, r._id);
  res.status(201).json({ success: true, resume: r });
});
exports.list = asyncHandler(async (req, res) => res.json({ success: true, resumes: await Resume.find({ user: req.user._id, archived: false }).sort('-createdAt').select('-file.storedName').lean() }));
exports.getOne = asyncHandler(async (req, res) => {
  const r = await Resume.findById(req.params.id).lean();
  if (!r || !(await canView(req.user, r))) throw new AppError('Resume not found', 404);
  delete r.file?.storedName; res.json({ success: true, resume: r });
});
exports.download = asyncHandler(async (req, res) => {
  const r = await Resume.findById(req.params.id);
  if (!r || r.kind !== 'upload' || !(await canView(req.user, r))) throw new AppError('Resume not found', 404);
  res.setHeader('Content-Type', r.file.mime); res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(r.file.originalName)}"`);
  res.setHeader('Cache-Control', 'private, no-store'); fs.createReadStream(path.join(DIR, path.basename(r.file.storedName))).pipe(res);
});
exports.update = asyncHandler(async (req, res) => {
  const r = await Resume.findOne({ _id: req.params.id, user: req.user._id, archived: false });
  if (!r) throw new AppError('Resume not found', 404);
  if (req.body.title) r.title = String(req.body.title).slice(0, 100);
  if (r.kind === 'built') {
    if (['classic', 'modern', 'minimal'].includes(req.body.template)) r.builder.template = req.body.template;
    if (Array.isArray(req.body.sectionOrder)) r.builder.sectionOrder = req.body.sectionOrder;
    if (req.body.data && typeof req.body.data === 'object') { r.builder.data = req.body.data; r.markModified('builder.data'); }
  }
  await r.save(); if (req.body.isDefault) await setDefault(req.user._id, r._id);
  res.json({ success: true, resume: await Resume.findById(r._id) });
});
exports.remove = asyncHandler(async (req, res) => {
  const r = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!r) throw new AppError('Resume not found', 404);
  if (await Application.exists({ resume: r._id })) { r.archived = true; r.isDefault = false; await r.save(); } // keep history for recruiters
  else { if (r.file?.storedName) await fs.promises.unlink(path.join(DIR, path.basename(r.file.storedName))).catch(() => {}); await r.deleteOne(); }
  res.json({ success: true });
});
