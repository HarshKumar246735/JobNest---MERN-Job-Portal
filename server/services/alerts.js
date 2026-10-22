const JobAlert = require('../models/JobAlert');
const { notify } = require('./notify');
// Notify candidates whose saved alert criteria match a newly published job.
exports.notifyMatches = async (job) => {
  const alerts = await JobAlert.find({ active: true }).limit(5000).lean();
  const hay = `${job.title} ${job.companyName} ${job.skills.join(' ')}`.toLowerCase();
  const loc = `${job.city} ${job.state} ${job.country}`.toLowerCase();
  const seen = new Set();
  for (const a of alerts) {
    if (seen.has(String(a.user))) continue;
    const kw = (a.keywords || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (kw.length && !kw.every((w) => hay.includes(w))) continue;
    if (a.location && !loc.includes(a.location.toLowerCase()) && job.workplace !== 'Remote') continue;
    if (a.experienceLevel && a.experienceLevel !== job.experienceLevel) continue;
    if (a.workplace?.length && !a.workplace.includes(job.workplace)) continue;
    if (a.employmentType?.length && !a.employmentType.includes(job.employmentType)) continue;
    seen.add(String(a.user));
    await notify(a.user, 'JOB_ALERT', 'New job matches your alert', `${job.title} at ${job.companyName}`, `/jobs/${job.slug}`);
  }
};
