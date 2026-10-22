const mongoose = require('mongoose');
const { Schema } = mongoose;
const s = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, job: { type: Schema.Types.ObjectId, ref: 'Job', required: true } }, { timestamps: true });
s.index({ user: 1, job: 1 }, { unique: true });
module.exports = mongoose.model('SavedJob', s);
