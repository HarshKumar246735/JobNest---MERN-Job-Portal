const mongoose = require('mongoose');
module.exports = mongoose.model('JobCategory', new mongoose.Schema({
  name: { type: String, required: true, unique: true }, slug: { type: String, required: true, unique: true },
  icon: String, description: String, active: { type: Boolean, default: true },
}, { timestamps: true }));
