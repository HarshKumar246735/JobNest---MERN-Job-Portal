const mongoose = require('mongoose');
const { Schema } = mongoose;
const s = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, targetType: String, targetId: Schema.Types.ObjectId,
  details: Schema.Types.Mixed, ip: String,
}, { timestamps: { createdAt: true, updatedAt: false } });
s.index({ createdAt: -1 });
module.exports = mongoose.model('AuditLog', s);
