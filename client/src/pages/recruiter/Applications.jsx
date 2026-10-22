import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { STATUSES, pretty, download } from '../../utils/constants';
import { ago, setTitle } from '../../utils/format';
export default function Applications() {
  const [sp, setSp] = useSearchParams(); const toast = useToast();
  const [d, setD] = useState(null), [jobs, setJobs] = useState([]), [q, setQ] = useState(sp.get('q') || '');
  const key = sp.toString();
  useEffect(() => { setTitle('Applications'); api.get('/recruiter/jobs').then((r) => setJobs(r.data.jobs)); }, []);
  useEffect(() => { setD(null); api.get('/recruiter/applications', { params: Object.fromEntries(sp) }).then((r) => setD(r.data)).catch((e) => { toast(errMsg(e), 'err'); setD({ applications: [], pages: 1, total: 0 }); }); }, [key]);
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  const page = Number(sp.get('page') || 1);
  return (<><div className="row-between"><h1>Applications</h1>
    <button className="btn btn-ghost" onClick={() => download(api, `/recruiter/applications/export.csv${sp.get('status') ? `?status=${sp.get('status')}` : ''}`, 'applications.csv').catch((e) => toast(errMsg(e), 'err'))}><Download size={15} /> Export CSV</button></div>
    <div className="card two-col"><label className="field"><span>Job</span><select value={sp.get('job') || ''} onChange={(e) => set('job', e.target.value)}><option value="">All jobs</option>{jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}</select></label>
      <label className="field"><span>Status</span><select value={sp.get('status') || ''} onChange={(e) => set('status', e.target.value)}><option value="">All</option>{STATUSES.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}</select></label>
      <form onSubmit={(e) => { e.preventDefault(); set('q', q.trim()); }}><label className="field"><span>Candidate name</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search and press Enter" /></label></form></div>
    {!d ? <div className="skeleton job-card" /> : d.applications.length === 0 ? <div className="empty"><h3>No applications found</h3></div> :
      <div className="table-wrap"><table className="table"><thead><tr><th>Candidate</th><th>Job</th><th>Applied</th><th>Status</th></tr></thead><tbody>{d.applications.map((a) => (
        <tr key={a._id}><td><Link to={`/recruiter/candidates/${a._id}`}>{a.candidate?.name}</Link><div className="muted">{a.candidate?.profile?.headline}</div></td><td>{a.job?.title}</td><td>{ago(a.createdAt)}</td><td><span className={`status ${a.status}`}>{pretty(a.status)}</span></td></tr>))}</tbody></table></div>}
    {d?.pages > 1 && <nav className="pager"><button className="btn btn-ghost" disabled={page <= 1} onClick={() => set('page', page - 1)}>Previous</button><span>Page {page} of {d.pages}</span><button className="btn btn-ghost" disabled={page >= d.pages} onClick={() => set('page', page + 1)}>Next</button></nav>}</>);
}
