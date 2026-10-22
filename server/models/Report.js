const mongoose = require('mongoose');
const { Schema } = mongoose;
module.exports = mongoose.model('Report', new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['job', 'company', 'user'], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  kind: { type: String, enum: ['report', 'complaint'], default: 'report' },
  reason: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open', index: true },
  resolutionNote: String,
}, { timestamps: true }));
