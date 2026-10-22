const mongoose = require('mongoose');
const { Schema } = mongoose;
module.exports = mongoose.model('Company', new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  logoUrl: String, website: String, industry: String, description: String,
  headquarters: String, size: { type: String, enum: ['1-10', '11-50', '51-200', '201-1000', '1000+'] },
  foundedYear: Number, benefits: [String], workplaceInfo: String,
  owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  verification: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified', index: true },
  isDemo: { type: Boolean, default: false },
}, { timestamps: true }));
