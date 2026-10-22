const mongoose = require('mongoose');
const { Schema } = mongoose;
module.exports = mongoose.model('Resume', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind: { type: String, enum: ['upload', 'built'], required: true },
  title: { type: String, default: 'My Resume' },
  file: { storedName: String, originalName: String, mime: String, size: Number, cloudinaryId: String }, // never served publicly
  builder: { template: { type: String, enum: ['classic', 'modern', 'minimal'], default: 'modern' },
    sectionOrder: [String], data: Schema.Types.Mixed },
  isDefault: { type: Boolean, default: false }, archived: { type: Boolean, default: false },
}, { timestamps: true }));
