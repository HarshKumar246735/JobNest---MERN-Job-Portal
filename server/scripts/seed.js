require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const { categories, levels, companies, cities } = require('./seedData');
const { slugify } = require('../utils/helpers');
const M = (n) => require(`../models/${n}`);
const [User, Company, Job, JobCategory, Skill, Application, SavedJob, Interview, Notification] =
  ['User', 'Company', 'Job', 'JobCategory', 'Skill', 'Application', 'SavedJob', 'Interview', 'Notification'].map(M);
const sizes = ['11-50', '51-200', '201-1000', '1000+'];
const types = ['On-site', 'Hybrid', 'Remote'];

(async () => {
  await connectDB();
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
    console.error('Refusing to seed demo data in production (set ALLOW_PROD_SEED=true to override).'); process.exit(1);
  }
  const hash = (p) => bcrypt.hash(p, 12);
  const upsertUser = async (email, fields, pw) => {
    await User.updateOne({ email }, { $setOnInsert: { ...fields, email, password: await hash(pw), isDemo: true } }, { upsert: true });
    return User.findOne({ email });
  };
  // Categories + skills
  const catDocs = [];
  for (const [name, , skills] of categories) {
    const slug = slugify(name);
    await JobCategory.updateOne({ slug }, { $setOnInsert: { name, slug, description: `Sample ${name} roles` } }, { upsert: true });
    catDocs.push(await JobCategory.findOne({ slug }));
    for (const s of skills) await Skill.updateOne({ name: s }, { $setOnInsert: { name: s } }, { upsert: true });
  }
  // Recruiters + companies (one recruiter per demo company)
  const pwHash = await hash('Recruiter@123');
  const comps = [];
  for (let i = 0; i < companies.length; i++) {
    const name = companies[i], slug = slugify(name);
    const email = i === 0 ? 'recruiter@jobnest.demo' : `recruiter${i + 1}@jobnest.demo`;
    await User.updateOne({ email }, { $setOnInsert: { name: `${name} Recruiter`, email, password: pwHash, role: 'recruiter', isDemo: true } }, { upsert: true });
    const rec = await User.findOne({ email });
    const [city, state] = cities[i % cities.length];
    await Company.updateOne({ slug }, { $setOnInsert: { name, slug, owner: rec._id, isDemo: true, verification: 'unverified',
      industry: 'Technology & Services', headquarters: `${city}, ${state}`, size: sizes[i % 4], foundedYear: 2005 + (i % 15),
      website: `https://example.com/${slug}`, description: `${name} is a fictional demo employer created for JobNest sample data.`,
      benefits: ['Health insurance', 'Flexible hours', 'Learning budget'] } }, { upsert: true });
    const comp = await Company.findOne({ slug });
    await User.updateOne({ _id: rec._id }, { company: comp._id });
    comps.push({ comp, rec });
  }
  // Jobs: 15 categories x 5 roles x 4 levels = 300, varied by level, company, city, workplace, salary, skills
  let n = 0, created = 0;
  for (let ci = 0; ci < categories.length; ci++) {
    const [catName, roles, skills, baseLakh] = categories[ci];
    for (let ri = 0; ri < roles.length; ri++) for (let li = 0; li < levels.length; li++, n++) {
      const L = levels[li], { comp, rec } = comps[(n * 7 + ci) % comps.length];
      const title = `${L.prefix} ${roles[ri]}`.replace('- ', '');
      const slug = slugify(`${title}-${comp.name}-${ci}${ri}${li}`);
      const [city, state] = cities[(n * 3) % cities.length];
      const monthly = Math.round((baseLakh * 100000 * L.mult) / 12 / 1000) * 1000;
      const salaryMin = L.type === 'Internship' ? Math.round(monthly * 12 * 0.6) : Math.round(baseLakh * 100000 * L.mult * 0.9 / 10000) * 10000;
      const mySkills = skills.slice(0, 3 + (li % 3)), pref = skills.slice(3);
      const doc = {
        title, slug, company: comp._id, companyName: comp.name, recruiter: rec._id, isDemo: true,
        category: catDocs[ci]._id, categorySlug: catDocs[ci].slug,
        description: `[Sample listing] ${comp.name} is hiring a ${title} in ${city} for its ${catName.toLowerCase()} team. ` +
          (L.yrs ? `You will own ${roles[ri].toLowerCase()} deliverables end to end with ${L.yrs}+ years of experience, mentoring newer colleagues.` : `This role suits candidates starting their career and will pair you with a mentor while you contribute to real ${roles[ri].toLowerCase()} work.`),
        responsibilities: [`Deliver ${roles[ri].toLowerCase()} tasks for the ${comp.name} ${catName} team`, `Collaborate with ${['design', 'product', 'operations', 'engineering'][li]} stakeholders`, L.yrs >= 3 ? 'Review work and guide junior team members' : 'Learn team processes and tools quickly', `Document and report progress weekly`],
        qualifications: [L.edu, L.yrs ? `${L.yrs}+ years in a related role` : 'Strong fundamentals and willingness to learn', 'Good written and verbal communication'],
        skills: mySkills, preferredSkills: pref, employmentType: L.type, workplace: types[(n + li) % 3], experienceLevel: L.exp, minExperienceYears: L.yrs,
        salaryMin, salaryMax: Math.round(salaryMin * (L.yrs ? 1.35 : 1.25) / 10000) * 10000, city, state, country: 'India',
        deadline: new Date(Date.now() + (20 + (n % 40)) * 864e5), openings: 1 + (n % 4), education: L.edu,
        benefits: ['Health insurance', n % 2 ? 'Remote allowances' : 'Performance bonus', 'Paid leave'],
        featured: n % 12 === 0, status: 'open', publishedAt: new Date(Date.now() - (n % 30) * 864e5),
      };
      const r = await Job.updateOne({ slug }, { $setOnInsert: doc }, { upsert: true });
      if (r.upsertedCount) created++;
    }
  }
  // Demo accounts + sample activity
  const cand = await upsertUser('candidate@jobnest.demo', { name: 'Demo Candidate', role: 'candidate',
    profile: { headline: 'Aspiring Frontend Developer', location: 'Delhi', skills: ['React', 'JavaScript', 'CSS'] } }, 'Candidate@123');
  if (process.env.NODE_ENV !== 'production') await upsertUser('admin@jobnest.demo', { name: 'Demo Admin', role: 'admin' }, 'Admin@12345');
  const sample = await Job.find({ isDemo: true, status: 'open' }).limit(4);
  for (const [i, j] of sample.entries()) {
    await SavedJob.updateOne({ user: cand._id, job: j._id }, { $setOnInsert: {} }, { upsert: true });
    if (i < 3) {
      const status = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED'][i];
      const r = await Application.updateOne({ candidate: cand._id, job: j._id }, { $setOnInsert: { status, history: [{ status: 'APPLIED' }] } }, { upsert: true });
      if (r.upsertedCount) await Job.updateOne({ _id: j._id }, { $inc: { applicationCount: 1 } });
    }
  }
  const shortlisted = await Application.findOne({ candidate: cand._id, status: 'SHORTLISTED' });
  if (shortlisted && !(await Interview.findOne({ application: shortlisted._id }))) {
    const j = await Job.findById(shortlisted.job);
    await Interview.create({ application: shortlisted._id, job: j._id, candidate: cand._id, recruiter: j.recruiter,
      date: new Date(Date.now() + 3 * 864e5), startTime: '11:00', endTime: '11:45', mode: 'Online', meetingUrl: 'https://meet.example.com/demo', instructions: 'Sample interview (demo data).' });
  }
  if (!(await Notification.findOne({ user: cand._id }))) await Notification.create({ user: cand._id, type: 'WELCOME', title: 'Welcome to JobNest', message: 'Demo notification.' });
  console.log(`Seed complete. New jobs: ${created}. Total jobs: ${await Job.countDocuments()}. Categories: ${await JobCategory.countDocuments()}. Companies: ${await Company.countDocuments()}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
