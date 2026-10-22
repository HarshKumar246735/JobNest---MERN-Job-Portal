const Job = require('../models/Job');
const Application = require('../models/Application');
const words = (s = '') => s.toLowerCase().split(/[^a-z0-9+#.]+/).filter((w) => w.length > 2);
// Transparent heuristic score (0-100): skills overlap, title keywords, location, experience, employment type. Not a validated prediction.
exports.recommend = async (user, limit = 12) => {
  const p = user.profile || {};
  const mySkills = new Set((p.skills || []).map((s) => s.toLowerCase()));
  const kw = new Set([...words(p.headline), ...(p.preferredSkills || [])]);
  const locs = [p.location, ...(p.preferredLocations || [])].filter(Boolean).map((l) => l.toLowerCase());
  const applied = await Application.find({ candidate: user._id }).distinct('job');
  const pool = await Job.find({ status: 'open', deadline: { $gte: new Date() }, _id: { $nin: applied } }).sort({ publishedAt: -1 }).limit(500).select('-recruiter').lean();
  const exp = (p.employmentPreferences || []).map((e) => e.toLowerCase());
  const yrs = (p.experience || []).length;
  const scored = pool.map((j) => {
    const js = j.skills.map((s) => s.toLowerCase());
    const overlap = js.length ? js.filter((s) => mySkills.has(s)).length / js.length : 0;
    const tw = words(j.title); const titleHit = tw.length ? tw.filter((w) => kw.has(w)).length / tw.length : 0;
    const locHit = locs.some((l) => `${j.city} ${j.state}`.toLowerCase().includes(l) || l.includes(j.city.toLowerCase())) || j.workplace === 'Remote' ? 1 : 0;
    const level = yrs === 0 ? ['Internship', 'Fresher', 'Entry-level'] : yrs < 3 ? ['Entry-level', 'Mid-level'] : ['Mid-level', 'Senior-level', 'Lead'];
    const expHit = level.includes(j.experienceLevel) ? 1 : 0;
    const typeHit = !exp.length || exp.includes(j.employmentType.toLowerCase()) ? 1 : 0;
    return { ...j, score: Math.round(overlap * 50 + titleHit * 20 + locHit * 15 + expHit * 10 + typeHit * 5) };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
};
