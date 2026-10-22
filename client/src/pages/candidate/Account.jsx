import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Trash2, Star } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { setTitle } from '../../utils/format';
export function Resumes() {
  const [list, setList] = useState(null), toast = useToast(), file = useRef();
  const load = () => api.get('/resumes').then((r) => setList(r.data.resumes));
  useEffect(() => { setTitle('My resumes'); load(); }, []);
  const upload = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast('File must be 5MB or smaller', 'err');
    const fd = new FormData(); fd.append('file', f);
    try { await api.post('/resumes/upload', fd); toast('Resume uploaded'); load(); } catch (x) { toast(errMsg(x), 'err'); } finally { file.current.value = ''; }
  };
  const download = async (r) => { try { const res = await api.get(`/resumes/${r._id}/download`, { responseType: 'blob' }); const a = document.createElement('a'); a.href = URL.createObjectURL(res.data); a.download = r.file.originalName; a.click(); URL.revokeObjectURL(a.href); } catch (x) { toast(errMsg(x), 'err'); } };
  const act = async (fn, msg) => { try { await fn(); toast(msg); load(); } catch (x) { toast(errMsg(x), 'err'); } };
  return (<><h1>My resumes</h1>
    <div className="card"><label className="field"><span>Upload a resume (PDF or DOCX, max 5MB)</span><input ref={file} type="file" accept=".pdf,.docx" onChange={upload} /></label>
      <p className="muted">Or <Link to="/candidate/resume-builder">build a resume online</Link>. Resumes are private and shared only with recruiters you apply to.</p></div>
    {!list ? <div className="skeleton job-card" /> : list.length === 0 ? <div className="empty"><h3>No resumes yet</h3></div> : list.map((r) => (
      <div className="card row-between" key={r._id}><div><strong>{r.title}</strong> {r.isDefault && <span className="badge ok">Default</span>}<p className="muted">{r.kind === 'upload' ? `${r.file.originalName} · ${(r.file.size / 1024).toFixed(0)} KB` : 'Built with resume builder'}</p></div>
        <div className="actions">{!r.isDefault && <button className="btn btn-ghost" onClick={() => act(() => api.patch(`/resumes/${r._id}`, { isDefault: true }), 'Default resume updated')}><Star size={15} /> Make default</button>}
          {r.kind === 'upload' ? <button className="btn btn-ghost" onClick={() => download(r)}><Download size={15} /> Download</button> : <Link className="btn btn-ghost" to={`/candidate/resume-builder?id=${r._id}`}>Edit</Link>}
          <button className="btn btn-ghost" aria-label="Delete resume" onClick={() => confirm('Delete this resume?') && act(() => api.delete(`/resumes/${r._id}`), 'Resume deleted')}><Trash2 size={15} /></button></div></div>))}</>);
}
const blank = { keywords: '', location: '', experienceLevel: '', workplace: [], employmentType: [] };
const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
export function JobAlerts() {
  const [alerts, setAlerts] = useState(null), [f, setF] = useState(blank), toast = useToast();
  const load = () => api.get('/alerts').then((r) => setAlerts(r.data.alerts));
  useEffect(() => { setTitle('Job alerts'); load(); }, []);
  const save = async (e) => { e.preventDefault(); try { await api.post('/alerts', f); toast('Alert saved'); setF(blank); load(); } catch (x) { toast(errMsg(x), 'err'); } };
  const Group = ({ k, opts }) => <div className="chips">{opts.map((o) => <label key={o} className="check"><input type="checkbox" checked={f[k].includes(o)} onChange={() => setF({ ...f, [k]: toggle(f[k], o) })} />{o}</label>)}</div>;
  return (<><h1>Job alerts</h1>
    <form className="card" onSubmit={save}><div className="two-col"><label className="field"><span>Keywords</span><input value={f.keywords} onChange={(e) => setF({ ...f, keywords: e.target.value })} placeholder="React Developer" /></label>
      <label className="field"><span>Location</span><input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Delhi" /></label></div>
      <label className="field"><span>Experience</span><select value={f.experienceLevel} onChange={(e) => setF({ ...f, experienceLevel: e.target.value })}><option value="">Any</option>{['Internship', 'Fresher', 'Entry-level', 'Mid-level', 'Senior-level'].map((o) => <option key={o}>{o}</option>)}</select></label>
      <span className="lbl">Workplace</span><Group k="workplace" opts={['On-site', 'Hybrid', 'Remote']} /><span className="lbl">Employment</span><Group k="employmentType" opts={['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance']} />
      <button className="btn btn-primary">Save alert</button></form>
    <p className="muted">Matching alerts are used when new jobs are published (wired up with the recruiter job posting phase).</p>
    {alerts?.map((a) => <div className="card row-between" key={a._id}><div><strong>{a.keywords || 'Any keywords'}</strong> · {a.location || 'Anywhere'}<p className="muted">{[a.experienceLevel, ...a.workplace, ...a.employmentType].filter(Boolean).join(' · ') || 'No other filters'}</p></div>
      <div className="actions"><Link className="btn btn-ghost" to={`/jobs?q=${encodeURIComponent(a.keywords)}&location=${encodeURIComponent(a.location)}`}>View matches</Link>
        <button className="btn btn-ghost" onClick={async () => { await api.delete(`/alerts/${a._id}`); load(); }}><Trash2 size={15} /></button></div></div>)}</>);
}
export function Settings() {
  const [f, setF] = useState({ currentPassword: '', newPassword: '' }), toast = useToast();
  useEffect(() => setTitle('Settings'), []);
  const submit = async (e) => { e.preventDefault(); try { await api.patch('/candidate/password', f); toast('Password updated'); setF({ currentPassword: '', newPassword: '' }); } catch (x) { toast(errMsg(x), 'err'); } };
  return (<><h1>Account settings</h1><form className="card narrow" onSubmit={submit}><h3>Change password</h3>
    <label className="field"><span>Current password</span><input type="password" required value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} autoComplete="current-password" /></label>
    <label className="field"><span>New password (min 8)</span><input type="password" required minLength={8} value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} autoComplete="new-password" /></label>
    <button className="btn btn-primary">Update password</button></form></>);
}
