import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { setTitle } from '../../utils/format';
export default function Dashboard() {
  const { user } = useAuth(); const [d, setD] = useState(null), [err, setErr] = useState('');
  useEffect(() => { setTitle('Recruiter dashboard'); api.get('/recruiter/dashboard').then((r) => setD(r.data)).catch(() => setErr('Could not load dashboard')); }, []);
  if (err) return <p className="alert">{err}</p>; if (!d) return <div className="skeleton job-card tall" />;
  const S = ({ n, t, to }) => <Link to={to} className="stat"><strong>{n}</strong><span>{t}</span></Link>;
  return (<><h1>Hello, {user.name.split(' ')[0]}</h1>
    {!d.hasCompany && <div className="card"><h3>Set up your company</h3><p>Create a company profile before posting jobs.</p><Link className="btn btn-primary" to="/recruiter/company">Create company profile</Link></div>}
    <div className="stats"><S n={d.activeJobs} t="Active jobs" to="/recruiter/jobs" /><S n={d.totalApplications} t="Total applications" to="/recruiter/applications" /><S n={d.awaitingReview} t="Awaiting review" to="/recruiter/applications?status=APPLIED" />
      <S n={d.shortlisted} t="Shortlisted" to="/recruiter/applications?status=SHORTLISTED" /><S n={d.interviews} t="Upcoming interviews" to="/recruiter/interviews" /><S n={d.closedJobs} t="Closed jobs" to="/recruiter/jobs" /></div>
    {d.performance.length > 0 && <div className="card"><h3>Applications per job</h3><div style={{ height: 240 }}><ResponsiveContainer><BarChart data={d.performance}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="applications" fill="#4f46e5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>}
    <div className="card"><h3>Recent applications</h3>{d.recent.length === 0 ? <p className="muted">No applications yet.</p> : d.recent.map((a) => <p key={a._id}><Link to={`/recruiter/candidates/${a._id}`}>{a.candidate?.name}</Link> applied to {a.job?.title} · <span className={`status ${a.status}`}>{a.status.replace('_', ' ')}</span></p>)}</div></>);
}
