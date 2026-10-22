import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Check } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import JobCard from '../../components/JobCard';
import { useToast } from '../../context/ToastContext';
import { setTitle, ago } from '../../utils/format';
const useLoad = (url, title, pick) => {
  const [data, setData] = useState(null), [err, setErr] = useState('');
  const load = () => api.get(url).then((r) => setData(pick(r.data))).catch((e) => setErr(errMsg(e)));
  useEffect(() => { setTitle(title); load(); }, []);
  return [data, setData, err, load];
};
const Empty = ({ t, to, cta }) => <div className="empty"><h3>{t}</h3>{to && <Link className="btn btn-primary" to={to}>{cta}</Link>}</div>;
export function Applications() {
  const [apps, , err, load] = useLoad('/applications/my-applications', 'My applications', (d) => d.applications); const toast = useToast();
  const withdraw = async (id) => { if (!confirm('Withdraw this application?')) return; try { await api.patch(`/applications/${id}/withdraw`); toast('Application withdrawn'); load(); } catch (e) { toast(errMsg(e), 'err'); } };
  return (<><h1>My applications</h1>{err && <p className="alert">{err}</p>}{!apps ? <div className="skeleton job-card" /> : apps.length === 0 ? <Empty t="No applications yet" to="/jobs" cta="Browse jobs" /> :
    <div className="table-wrap"><table className="table"><thead><tr><th>Job</th><th>Company</th><th>Applied</th><th>Status</th><th /></tr></thead><tbody>{apps.map((a) => (
      <tr key={a._id}><td><Link to={`/jobs/${a.job?.slug}`}>{a.job?.title}</Link></td><td>{a.job?.companyName}</td><td>{ago(a.createdAt)}</td><td><span className={`status ${a.status}`}>{a.status.replace('_', ' ')}</span></td>
        <td>{['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status) && <button className="btn btn-ghost" onClick={() => withdraw(a._id)}>Withdraw</button>}</td></tr>))}</tbody></table></div>}</>);
}
export function SavedJobs() {
  const [jobs, , err] = useLoad('/saved-jobs', 'Saved jobs', (d) => d.jobs);
  return (<><h1>Saved jobs</h1>{err && <p className="alert">{err}</p>}{!jobs ? <div className="skeleton job-card" /> : jobs.length === 0 ? <Empty t="No saved jobs" to="/jobs" cta="Find jobs to save" /> : <div className="list">{jobs.map((j) => <JobCard key={j._id} job={j} />)}</div>}</>);
}
export function Recommended() {
  const [jobs, , err] = useLoad('/jobs/recommended', 'Recommended jobs', (d) => d.jobs);
  return (<><h1>Recommended jobs</h1><p className="muted">Ranked by a simple match of your profile skills, headline, location, experience and preferences. The score is a heuristic, not a prediction.</p>{err && <p className="alert">{err}</p>}
    {!jobs ? <div className="skeleton job-card" /> : jobs.length === 0 ? <Empty t="No recommendations yet" to="/candidate/profile" cta="Add skills to your profile" /> : <div className="list">{jobs.map((j) => <div key={j._id}><span className="badge ok">Match {j.score}%</span><JobCard job={j} /></div>)}</div>}</>);
}
export function Notifications() {
  const [list, setList, err, load] = useLoad('/notifications', 'Notifications', (d) => d.notifications); const toast = useToast();
  const act = async (fn) => { try { await fn(); load(); } catch (e) { toast(errMsg(e), 'err'); } };
  return (<><div className="row-between"><h1>Notifications</h1>{list?.some((n) => !n.read) && <button className="btn btn-ghost" onClick={() => act(() => api.patch('/notifications/read-all'))}>Mark all read</button>}</div>
    {err && <p className="alert">{err}</p>}{!list ? <div className="skeleton job-card" /> : list.length === 0 ? <Empty t="You're all caught up" /> :
      list.map((n) => <div key={n._id} className={`note-item ${n.read ? '' : 'unread'}`}><div><strong>{n.title}</strong><p>{n.message}</p><small className="muted">{ago(n.createdAt)}</small></div>
        <div>{!n.read && <button className="btn btn-ghost icon" aria-label="Mark read" onClick={() => act(() => api.patch(`/notifications/${n._id}/read`))}><Check size={16} /></button>}
          <button className="btn btn-ghost icon" aria-label="Delete" onClick={() => act(() => api.delete(`/notifications/${n._id}`))}><Trash2 size={16} /></button></div></div>)}</>);
}
