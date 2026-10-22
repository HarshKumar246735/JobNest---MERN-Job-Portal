const mongoose = require('mongoose');
const { Schema } = mongoose;
const jobSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  companyName: String, companyLogo: String,
  recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  description: { type: String, required: true },
  responsibilities: [String], qualifications: [String],
  skills: { type: [String], index: true }, preferredSkills: [String],
  category: { type: Schema.Types.ObjectId, ref: 'JobCategory', required: true, index: true },
  categorySlug: { type: String, index: true },
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'], required: true },
  workplace: { type: String, enum: ['On-site', 'Hybrid', 'Remote'], required: true },
  experienceLevel: { type: String, enum: ['Internship', 'Fresher', 'Entry-level', 'Mid-level', 'Senior-level', 'Lead'], required: true },
  minExperienceYears: { type: Number, default: 0 },
  salaryMin: Number, salaryMax: Number, salaryCurrency: { type: String, default: 'INR' },
  city: String, state: String, country: { type: String, default: 'India' },
  deadline: { type: Date, required: true },
  openings: { type: Number, default: 1, min: 1 },
  education: String, benefits: [String],
  applicationQuestions: [String], requiresCoverLetter: { type: Boolean, default: false },
  applicationCount: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'pending', 'open', 'paused', 'closed', 'rejected'], default: 'open', index: true },
  featured: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date, default: Date.now, index: true },
  isDemo: { type: Boolean, default: false },
}, { timestamps: true });
jobSchema.index({ title: 'text', companyName: 'text', skills: 'text', city: 'text' });
jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ status: 1, salaryMin: 1 });
module.exports = mongoose.model('Job', jobSchema);
