const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;
const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['candidate', 'recruiter', 'admin'], default: 'candidate', index: true },
  status: { type: String, enum: ['active', 'suspended'], default: 'active', index: true },
  phone: String, photoUrl: String,
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  isDemo: { type: Boolean, default: false },
  profile: {
    headline: String, location: String, summary: String,
    skills: [String], languages: [String], preferredLocations: [String],
    education: [{ school: String, degree: String, field: String, startYear: Number, endYear: Number }],
    experience: [{ title: String, company: String, startDate: Date, endDate: Date, description: String }],
    projects: [{ name: String, url: String, description: String }],
    certifications: [{ name: String, issuer: String, year: Number }],
    portfolioUrl: String, githubUrl: String, linkedinUrl: String,
    expectedSalary: Number, noticePeriodDays: Number,
    employmentPreferences: [String],
    privacy: { showEmail: { type: Boolean, default: false }, showPhone: { type: Boolean, default: false }, publicProfile: { type: Boolean, default: false } },
  },
  resetTokenHash: { type: String, select: false },
  resetTokenExpires: { type: Date, select: false },
}, { timestamps: true });
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = function (p) { return bcrypt.compare(p, this.password); };
userSchema.methods.toSafe = function () {
  const o = this.toObject(); delete o.password; delete o.resetTokenHash; delete o.resetTokenExpires; return o;
};
module.exports = mongoose.model('User', userSchema);
