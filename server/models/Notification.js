const mongoose = require('mongoose');
const { Schema } = mongoose;
const s = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, title: { type: String, required: true }, message: String, link: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });
s.index({ user: 1, read: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', s);
