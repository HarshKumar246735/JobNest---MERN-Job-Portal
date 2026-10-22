import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api, { errMsg } from '../../services/api';
import usePaged from '../../hooks/usePaged';
import Pager from '../../components/Pager';
import { useToast } from '../../context/ToastContext';
import { ago, setTitle } from '../../utils/format';
const useAct = (reload) => { const toast = useToast(); return async (fn, msg, confirmMsg) => { if (confirmMsg && !confirm(confirmMsg)) return; try { await fn(); toast(msg); reload(); } catch (e) { toast(errMsg(e), 'err'); } }; };
const Table = ({ d, err, head, row }) => err ? <p className="alert">{err}</p> : !d ? <div className="skeleton job-card" /> : d.items.length === 0 ? <div className="empty"><h3>Nothing found</h3></div> :
  <div className="table-wrap"><table className="table"><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{d.items.map(row)}</tbody></table></div>;
export function AdminDashboard() {
  const [d, setD] = useState(null), [err, setErr] = useState('');
  useEffect(() => { setTitle('Admin dashboard'); api.get('/admin/dashboard').then((r) => setD(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  if (err) return <p className="alert">{err}</p>; if (!d) return <div className="skeleton job-card tall" />;
  const S = ([n, t]) => <div className="stat" key={t}><strong>{n}</strong><span>{t}</span></div>;
  return (<><h1>Admin dashboard</h1><div className="stats">{[[d.users, 'Users'], [d.candidates, 'Job seekers'], [d.recruiters, 'Recruiters'], [d.companies, 'Companies'], [d.activeJobs, 'Active jobs'], [d.applications, 'Applications'], [d.pendingJobs, 'Jobs awaiting review'], [d.openReports, 'Open reports'], [d.suspended, 'Suspended accounts']].map(S)}</div>
    <div className="card"><h3>Applications, last 14 days</h3>{d.applicationsPerDay.length === 0 ? <p className="muted">No recent applications.</p> : <div style={{ height: 220 }}><ResponsiveContainer><BarChart data={d.applicationsPerDay}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="applications" fill="#4f46e5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>}</div>
    <div className="card"><h3>Recent admin activity</h3>{d.activity.length === 0 ? <p className="muted">No activity yet.</p> : d.activity.map((a) => <p key={a._id}>{a.actor?.name} · <strong>{a.action}</strong> · <span className="muted">{ago(a.createdAt)}</span></p>)}</div></>);
}
export function AdminUsers() {
  const [q, setQ] = useState(''), [role, setRole] = useState(''), [status, setStatus] = useState(''); const { data, err, page, setPage, reload } = usePaged('/admin/users', { q, role, status }); const act = useAct(reload);
  useEffect(() => setTitle('Users'), []);
  return (<><h1>Users</h1><div className="card two-col"><label className="field"><span>Search</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" /></label>
    <label className="field"><span>Role</span><select value={role} onChange={(e) => setRole(e.target.value)}><option value="">All</option><option value="candidate">Job seeker</option><option value="recruiter">Recruiter</option><option value="admin">Admin</option></select></label>
    <label className="field"><span>Status</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All</option><option value="active">Active</option><option value="suspended">Suspended</option></select></label></div>
    <Table d={data} err={err} head={['Name', 'Email', 'Role', 'Status', 'Joined', '']} row={(u) => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td><span className={`status ${u.status === 'suspended' ? 'REJECTED' : ''}`}>{u.status}</span></td><td>{ago(u.createdAt)}</td>
      <td>{u.role !== 'admin' && (u.status === 'active' ? <button className="btn btn-ghost" onClick={() => act(() => api.patch(`/admin/users/${u._id}/status`, { status: 'suspended', reason: prompt('Reason (optional)') || '' }), 'Account suspended', `Suspend ${u.email}?`)}>Suspend</button> : <button className="btn btn-ghost" onClick={() => act(() => api.patch(`/admin/users/${u._id}/status`, { status: 'active' }), 'Account reactivated')}>Reactivate</button>)}</td></tr>} />
    <Pager page={page} pages={data?.pages} setPage={setPage} /></>);
}
export function AdminJobs() {
  const [q, setQ] = useState(''), [status, setStatus] = useState(''); const { data, err, page, setPage, reload } = usePaged('/admin/jobs', { q, status }); const act = useAct(reload);
  useEffect(() => setTitle('Job moderation'), []);
  const mod = (j, action, msg) => act(() => api.patch(`/admin/jobs/${j._id}/moderate`, { action, reason: action === 'approve' ? '' : prompt('Reason shown to the recruiter') || '' }), msg, action === 'approve' ? null : `${action} "${j.title}"?`);
  return (<><h1>Job moderation</h1><div className="card two-col"><label className="field"><span>Search</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title or company" /></label>
    <label className="field"><span>Status</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All</option>{['open', 'pending', 'paused', 'closed', 'rejected', 'draft'].map((s) => <option key={s}>{s}</option>)}</select></label></div>
    <Table d={data} err={err} head={['Job', 'Company', 'Status', 'Applications', '']} row={(j) => <tr key={j._id}><td>{j.title}</td><td>{j.companyName}</td><td><span className="status">{j.status}</span></td><td>{j.applicationCount}</td>
      <td><div className="actions">{j.status !== 'open' && <button className="btn btn-ghost" onClick={() => mod(j, 'approve', 'Job approved')}>Approve</button>}{j.status !== 'pending' && <button className="btn btn-ghost" onClick={() => mod(j, 'flag', 'Job flagged')}>Flag</button>}{j.status !== 'rejected' && <button className="btn btn-ghost" onClick={() => mod(j, 'reject', 'Job removed from listings')}>Remove</button>}</div></td></tr>} />
    <Pager page={page} pages={data?.pages} setPage={setPage} /></>);
}
export function AdminCompanies() {
  const [q, setQ] = useState(''), [v, setV] = useState(''); const { data, err, page, setPage, reload } = usePaged('/admin/companies', { q, verification: v }); const act = useAct(reload);
  useEffect(() => setTitle('Companies'), []);
  const set = (c, status) => act(() => api.patch(`/admin/companies/${c._id}/verify`, { status, note: prompt('Note (optional)') || '' }), `Company ${status}`, `Mark ${c.name} as ${status}? Only verify companies you have actually checked.`);
  return (<><h1>Company verification</h1><div className="card two-col"><label className="field"><span>Search</span><input value={q} onChange={(e) => setQ(e.target.value)} /></label>
    <label className="field"><span>Verification</span><select value={v} onChange={(e) => setV(e.target.value)}><option value="">All</option>{['pending', 'unverified', 'verified', 'rejected'].map((s) => <option key={s}>{s}</option>)}</select></label></div>
    <Table d={data} err={err} head={['Company', 'Industry', 'Location', 'Status', '']} row={(c) => <tr key={c._id}><td>{c.name}{c.isDemo && <span className="badge">demo</span>}</td><td>{c.industry}</td><td>{c.headquarters}</td><td><span className={`status ${c.verification === 'verified' ? 'HIRED' : ''}`}>{c.verification}</span></td>
      <td><div className="actions">{c.verification !== 'verified' && <button className="btn btn-ghost" onClick={() => set(c, 'verified')}>Verify</button>}{c.verification !== 'rejected' && <button className="btn btn-ghost" onClick={() => set(c, 'rejected')}>Reject</button>}</div></td></tr>} />
    <Pager page={page} pages={data?.pages} setPage={setPage} /></>);
}
export function AdminCategories() {
  const [cats, setCats] = useState(null), [skills, setSkills] = useState([]), [name, setName] = useState(''), [skill, setSkill] = useState('');
  const load = () => { api.get('/admin/categories').then((r) => setCats(r.data.categories)); api.get('/admin/skills').then((r) => setSkills(r.data.skills)); }; const act = useAct(load);
  useEffect(() => { setTitle('Categories & skills'); load(); }, []);
  return (<><h1>Categories</h1><form className="card row-between" onSubmit={(e) => { e.preventDefault(); act(async () => { await api.post('/admin/categories', { name }); setName(''); }, 'Category added'); }}><input className="input" style={{ maxWidth: 320 }} required value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" aria-label="New category" /><button className="btn btn-primary">Add category</button></form>
    {!cats ? <div className="skeleton job-card" /> : <div className="table-wrap"><table className="table"><thead><tr><th>Name</th><th>Jobs</th><th>Active</th><th /></tr></thead><tbody>{cats.map((c) => <tr key={c._id}><td>{c.name}</td><td>{c.jobCount}</td><td>{c.active ? 'Yes' : 'No'}</td>
      <td><div className="actions"><button className="btn btn-ghost" onClick={() => act(() => api.patch(`/admin/categories/${c._id}`, { active: !c.active }), c.active ? 'Deactivated' : 'Activated')}>{c.active ? 'Deactivate' : 'Activate'}</button>
        <button className="btn btn-ghost" onClick={() => act(() => api.delete(`/admin/categories/${c._id}`), 'Done', `Delete ${c.name}? Categories with jobs are deactivated instead.`)}>Delete</button></div></td></tr>)}</tbody></table></div>}
    <h2 style={{ marginTop: '2rem' }}>Skills</h2><form className="card row-between" onSubmit={(e) => { e.preventDefault(); act(async () => { await api.post('/admin/skills', { name: skill }); setSkill(''); }, 'Skill added'); }}><input className="input" style={{ maxWidth: 320 }} required value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="New skill" aria-label="New skill" /><button className="btn btn-primary">Add skill</button></form>
    <div className="chips">{skills.map((s) => <button key={s._id} className="chip chip-x" aria-label={`Delete ${s.name}`} onClick={() => act(() => api.delete(`/admin/skills/${s._id}`), 'Skill removed', `Remove ${s.name}?`)}>{s.name} ×</button>)}</div></>);
}
export function AdminReports() {
  const [tab, setTab] = useState('reports'), [status, setStatus] = useState('open'); const r = usePaged('/admin/reports', { status }), a = usePaged('/admin/audit-logs'); const act = useAct(r.reload);
  useEffect(() => setTitle('Reports & audit'), []);
  const upd = (x, s) => act(() => api.patch(`/admin/reports/${x._id}`, { status: s, resolutionNote: s === 'open' ? '' : prompt('Resolution note (optional)') || '' }), `Report ${s}`);
  return (<><h1>Reports & audit log</h1><div className="actions" style={{ marginBottom: '1rem' }}><button className={`btn ${tab === 'reports' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('reports')}>Reports & complaints</button><button className={`btn ${tab === 'audit' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('audit')}>Audit log</button></div>
    {tab === 'reports' ? <><label className="field" style={{ maxWidth: 220 }}><span>Status</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All</option>{['open', 'reviewing', 'resolved', 'dismissed'].map((s) => <option key={s}>{s}</option>)}</select></label>
      <Table d={r.data} err={r.err} head={['Target', 'Reason', 'Reporter', 'Status', '']} row={(x) => <tr key={x._id}><td>{x.targetType}{x.targetLabel && `: ${x.targetLabel}`}</td><td>{x.reason}</td><td>{x.reporter?.name}</td><td><span className="status">{x.status}</span></td>
        <td><div className="actions">{x.status !== 'reviewing' && x.status !== 'resolved' && <button className="btn btn-ghost" onClick={() => upd(x, 'reviewing')}>Review</button>}{['open', 'reviewing'].includes(x.status) && <><button className="btn btn-ghost" onClick={() => upd(x, 'resolved')}>Resolve</button><button className="btn btn-ghost" onClick={() => upd(x, 'dismissed')}>Dismiss</button></>}</div></td></tr>} /><Pager page={r.page} pages={r.data?.pages} setPage={r.setPage} /></>
      : <><Table d={a.data} err={a.err} head={['When', 'Admin', 'Action', 'Target']} row={(x) => <tr key={x._id}><td>{new Date(x.createdAt).toLocaleString()}</td><td>{x.actor?.name}</td><td>{x.action}</td><td>{x.targetType} {x.details?.title || x.details?.name || x.details?.email || ''}</td></tr>} /><Pager page={a.page} pages={a.data?.pages} setPage={a.setPage} /></>}</>);
}
export function AdminSettings() {
  useEffect(() => setTitle('Settings'), []);
  return (<><h1>Platform settings</h1><div className="card"><p>Runtime settings (secrets, CORS origins, email and storage providers) are configured through server environment variables, not through this page, so they cannot be changed from a browser.</p>
    <p className="muted">Admin accounts are created only with <code>npm run seed:admin</code>. Moderation, verification, user, category and skill changes are recorded in the audit log.</p></div></>);
}
