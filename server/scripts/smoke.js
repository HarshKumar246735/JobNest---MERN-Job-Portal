// End-to-end API smoke test. Requires: running server (npm run server), seeded DB (npm run seed), Node 18+.
// Usage: API=http://localhost:5000/api npm run test:smoke   (creates a throwaway candidate account each run)
const API = process.env.API || 'http://localhost:5000/api';
let pass = 0, fail = 0;
const call = async (method, path, { token, body, form } = {}) => {
  const r = await fetch(API + path, { method, headers: { ...(token && { Authorization: `Bearer ${token}` }), ...(body && { 'Content-Type': 'application/json' }) }, body: form || (body && JSON.stringify(body)) });
  let json = null; try { json = await r.json(); } catch {} return { status: r.status, json };
};
const t = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + extra}`); };
(async () => {
  const login = async (email, password) => (await call('POST', '/auth/login', { body: { email, password } })).json?.token;
  t('health', (await call('GET', '/health')).status === 200);
  const list = await call('GET', '/jobs?limit=5&page=2'); t('jobs list + pagination', list.status === 200 && list.json.jobs.length === 5 && list.json.total >= 300, `total=${list.json?.total}`);
  t('invalid query rejected', (await call('GET', '/jobs?page=abc')).status === 400);
  t('filter by workplace', (await call('GET', '/jobs?workplace=Remote&limit=20')).json.jobs.every((j) => j.workplace === 'Remote'));
  t('NoSQL operator in query is ignored/rejected', [200, 400].includes((await call('GET', '/jobs?q[$ne]=x')).status));
  const one = (await call('GET', '/jobs?limit=1')).json.jobs[0]; t('job detail by slug', (await call('GET', `/jobs/${one.slug}`)).status === 200);
  t('unauthenticated my-applications = 401', (await call('GET', '/applications/my-applications')).status === 401);
  t('unauthenticated admin = 401', (await call('GET', '/admin/dashboard')).status === 401);
  const email = `smoke${Date.now()}@test.local`;
  const reg = await call('POST', '/auth/register', { body: { name: 'Smoke Tester', email, password: 'Password123!', role: 'admin' } });
  t('register ignores admin role', reg.status === 201 && reg.json.user.role === 'candidate');
  const cand = reg.json.token;
  t('duplicate email rejected', (await call('POST', '/auth/register', { body: { name: 'X Y', email, password: 'Password123!' } })).status === 409);
  t('bad login rejected', (await call('POST', '/auth/login', { body: { email, password: 'wrong-password' } })).status === 401);
  t('candidate blocked from recruiter API', (await call('GET', '/recruiter/dashboard', { token: cand })).status === 403);
  t('candidate blocked from admin API', (await call('GET', '/admin/dashboard', { token: cand })).status === 403);
  const fd = new FormData(); fd.append('file', new Blob(['not really a pdf'], { type: 'application/pdf' }), 'fake.pdf');
  t('fake PDF upload rejected', (await call('POST', '/resumes/upload', { token: cand, form: fd })).status === 400);
  const resume = await call('POST', '/resumes', { token: cand, body: { title: 'Smoke', template: 'modern', data: { personal: { name: 'Smoke' } } } }); t('resume builder save', resume.status === 201);
  const rec = await login('recruiter@jobnest.demo', 'Recruiter@123'); t('recruiter login', !!rec);
  const mine = (await call('GET', '/recruiter/jobs', { token: rec })).json.jobs; const mineIds = new Set(mine.map((j) => j._id));
  const pool = (await call('GET', '/jobs?limit=50')).json.jobs; const foreign = pool.find((j) => !mineIds.has(j._id)); const own = pool.find((j) => mineIds.has(j._id)) || mine.find((j) => j.status === 'open');
  const ap = await call('POST', '/applications', { token: cand, body: { jobId: foreign._id, resumeId: resume.json.resume._id } });
  t('apply to job', ap.status === 201, JSON.stringify(ap.json)); t('duplicate application = 409', (await call('POST', '/applications', { token: cand, body: { jobId: foreign._id, resumeId: resume.json.resume._id } })).status === 409);
  t('recruiter cannot see another recruiter\'s application', (await call('GET', `/recruiter/applications/${ap.json.application._id}`, { token: rec })).status === 404);
  t('candidate cannot set own status', (await call('PATCH', `/recruiter/applications/${ap.json.application._id}/status`, { token: cand, body: { status: 'HIRED' } })).status === 403);
  t('withdraw application', (await call('PATCH', `/applications/${ap.json.application._id}/withdraw`, { token: cand })).status === 200);
  if (own) {
    const ap2 = await call('POST', '/applications', { token: cand, body: { jobId: own._id, resumeId: resume.json.resume._id } }); t('apply to recruiter-owned job', ap2.status === 201, JSON.stringify(ap2.json));
    t('recruiter can view own application', (await call('GET', `/recruiter/applications/${ap2.json.application._id}`, { token: rec })).status === 200);
    t('invalid transition rejected (APPLIED -> HIRED)', (await call('PATCH', `/recruiter/applications/${ap2.json.application._id}/status`, { token: rec, body: { status: 'HIRED' } })).status === 400);
    t('valid transition (APPLIED -> SHORTLISTED)', (await call('PATCH', `/recruiter/applications/${ap2.json.application._id}/status`, { token: rec, body: { status: 'SHORTLISTED' } })).status === 200);
    const day = new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10);
    t('interview with bad time range rejected', (await call('POST', '/interviews', { token: rec, body: { applicationId: ap2.json.application._id, date: day, startTime: '11:00', endTime: '10:00', mode: 'Phone' } })).status === 400);
    t('interview scheduled', (await call('POST', '/interviews', { token: rec, body: { applicationId: ap2.json.application._id, date: day, startTime: '10:00', endTime: '10:30', mode: 'Phone' } })).status === 201);
    const notes = (await call('GET', '/notifications', { token: cand })).json; t('candidate received notifications', notes.notifications.length >= 2);
  }
  const rv = await call('GET', `/resumes/${resume.json.resume._id}/download`, { token: rec }); t('recruiter cannot download unrelated resume', [403, 404].includes(rv.status));
  const adm = await login('admin@jobnest.demo', 'Admin@12345'); if (adm) { t('admin dashboard', (await call('GET', '/admin/dashboard', { token: adm })).status === 200); t('admin audit logs', (await call('GET', '/admin/audit-logs', { token: adm })).status === 200); } else console.log('SKIP  admin tests (dev admin account missing)');
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('Smoke test crashed:', e.message); process.exit(1); });
