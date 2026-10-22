import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { setTitle } from '../../utils/format';
export default function Jobs() {
  const [jobs, setJobs] = useState(null), toast = useToast(), nav = useNavigate();
  const load = () => api.get('/recruiter/jobs').then((r) => setJobs(r.data.jobs));
  useEffect(() => { setTitle('My jobs'); load(); }, []);
  const act = async (fn, msg) => { try { await fn(); toast(msg); load(); } catch (e) { toast(errMsg(e), 'err'); } };
  return (<><div className="row-between"><h1>My jobs</h1><Link className="btn btn-primary" to="/recruiter/jobs/new">Post a job</Link></div>
    {!jobs ? <div className="skeleton job-card" /> : jobs.length === 0 ? <div className="empty"><h3>No jobs yet</h3></div> :
      <div className="table-wrap"><table className="table"><thead><tr><th>Title</th><th>Status</th><th>Applications</th><th>Deadline</th><th /></tr></thead><tbody>{jobs.map((j) => (
        <tr key={j._id}><td>{j.status === 'open' ? <Link to={`/jobs/${j.slug}`}>{j.title}</Link> : j.title}</td><td><span className="status">{j.status}</span></td>
          <td><Link to={`/recruiter/applications?job=${j._id}`}>{j.applicationCount}</Link></td><td>{new Date(j.deadline).toLocaleDateString()}</td>
          <td><div className="actions"><Link className="btn btn-ghost" to={`/recruiter/jobs/${j._id}/edit`}>Edit</Link>
            {j.status === 'draft' && <button className="btn btn-ghost" onClick={() => act(() => api.patch(`/jobs/${j._id}/status`, { status: 'open' }), 'Job published')}>Publish</button>}
            {j.status === 'open' && <button className="btn btn-ghost" onClick={() => act(() => api.patch(`/jobs/${j._id}/status`, { status: 'paused' }), 'Applications paused')}>Pause</button>}
            {(j.status === 'paused' || j.status === 'closed') && <button className="btn btn-ghost" onClick={() => act(() => api.patch(`/jobs/${j._id}/status`, { status: 'open' }), 'Job reopened')}>Reopen</button>}
            {['open', 'paused'].includes(j.status) && <button className="btn btn-ghost" onClick={() => confirm('Close this job?') && act(() => api.patch(`/jobs/${j._id}/status`, { status: 'closed' }), 'Job closed')}>Close</button>}
            <button className="btn btn-ghost" onClick={() => act(async () => { const r = await api.post(`/jobs/${j._id}/duplicate`); nav(`/recruiter/jobs/${r.data.job._id}/edit`); }, 'Job duplicated as draft')}>Duplicate</button>
            {j.status === 'draft' && <button className="btn btn-ghost" onClick={() => confirm('Delete this draft?') && act(() => api.delete(`/jobs/${j._id}`), 'Draft deleted')}>Delete</button>}</div></td></tr>))}</tbody></table></div>}</>);
}
