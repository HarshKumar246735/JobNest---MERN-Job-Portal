const mongoose = require('mongoose');
const { Schema } = mongoose;
const STATUSES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN'];
const s = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resume: { type: Schema.Types.ObjectId, ref: 'Resume' },
  coverLetter: String,
  answers: [{ question: String, answer: String }],
  status: { type: String, enum: STATUSES, default: 'APPLIED', index: true },
  history: [{ status: String, by: { type: Schema.Types.ObjectId, ref: 'User' }, at: { type: Date, default: Date.now }, note: String }],
  recruiterNotes: { type: [{ by: { type: Schema.Types.ObjectId, ref: 'User' }, text: String, at: { type: Date, default: Date.now } }], select: false },
}, { timestamps: true });
s.index({ job: 1, candidate: 1 }, { unique: true }); // prevents duplicate applications
s.index({ job: 1, status: 1, createdAt: -1 });
module.exports = mongoose.model('Application', s);
module.exports.STATUSES = STATUSES;
