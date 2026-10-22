const mongoose = require('mongoose');
const { Schema } = mongoose;
module.exports = mongoose.model('Interview', new Schema({
  application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true }, startTime: { type: String, required: true }, endTime: { type: String, required: true },
  timezone: { type: String, default: 'Asia/Kolkata' },
  mode: { type: String, enum: ['Online', 'Phone', 'In person'], required: true },
  meetingUrl: String, location: String, instructions: String,
  status: { type: String, enum: ['SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED', index: true },
}, { timestamps: true }));
