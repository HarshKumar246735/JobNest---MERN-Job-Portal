const mongoose = require('mongoose');
const { Schema } = mongoose;
module.exports = mongoose.model('JobAlert', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  keywords: String, location: String, experienceLevel: String,
  workplace: [String], employmentType: [String], active: { type: Boolean, default: true },
}, { timestamps: true }));
