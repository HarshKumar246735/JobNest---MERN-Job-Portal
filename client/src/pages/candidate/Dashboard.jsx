import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import JobCard from '../../components/JobCard';
import { setTitle } from '../../utils/format';
const ORDER = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN'];
export default function Dashboard() {
  const { user } = useAuth(); const [d, setD] = useState(null), [err, setErr] = useState('');
  useEffect(() => { setTitle('Dashboard'); api.get('/candidate/dashboard').then((r) => setD(r.data)).catch(() => setErr('Could not load dashboard')); }, []);
  if (err) return <p className="alert">{err}</p>;
  if (!d) return <div className="skeleton job-card tall" />;
  const chart = ORDER.map((s) => ({ name: s.replace('_', ' ').toLowerCase(), count: d.counts[s] || 0 })).filter((x) => x.count);
  const Stat = ({ n, t, to }) => <Link to={to} className="stat"><strong>{n}</strong><span>{t}</span></Link>;
  return (
    <>
      <h1>Welcome back, {user.name.split(' ')[0]}</h1>
      <div className="card"><div className="row-between"><strong>Profile completion: {d.completion}%</strong>{d.completion < 100 && <Link to="/candidate/profile">Complete profile</Link>}</div>
        <div className="progress" role="progressbar" aria-valuenow={d.completion} aria-valuemin="0" aria-valuemax="100"><div style={{ width: `${d.completion}%` }} /></div>
        <p className="muted">{d.resumes ? `${d.resumes} resume(s) on file` : 'No resume yet.'} {!d.resumes && <Link to="/candidate/resumes">Add one</Link>}</p></div>
      <div className="stats">
        <Stat n={d.total} t="Applications" to="/candidate/applications" /><Stat n={d.counts.UNDER_REVIEW || 0} t="Under review" to="/candidate/applications" />
        <Stat n={d.counts.SHORTLISTED || 0} t="Shortlisted" to="/candidate/applications" /><Stat n={d.saved} t="Saved jobs" to="/candidate/saved-jobs" />
        <Stat n={d.alerts} t="Active alerts" to="/candidate/job-alerts" /><Stat n={d.unread} t="Unread notifications" to="/candidate/notifications" />
      </div>
      {chart.length > 0 && <div className="card"><h3>Applications by status</h3><div style={{ height: 220 }}><ResponsiveContainer><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>}
      <div className="card"><h3>Upcoming interviews</h3>{d.interviews.length === 0 ? <p className="muted">No interviews scheduled.</p> : d.interviews.map((i) => <p key={i._id}><strong>{i.job?.title}</strong> at {i.job?.companyName} · {new Date(i.date).toLocaleDateString()} {i.startTime} ({i.mode})</p>)}</div>
      <div className="section-head"><h2>Recommended for you</h2><Link to="/candidate/recommended">See all →</Link></div>
      <div className="list">{d.recommended.map((j) => <JobCard key={j._id} job={j} />)}</div>
      <div className="card"><h3>Recent applications</h3>{d.recent.length === 0 ? <p className="muted">You haven't applied yet. <Link to="/jobs">Find jobs</Link></p> : d.recent.map((a) => <p key={a._id}><Link to={`/jobs/${a.job?.slug}`}>{a.job?.title}</Link> · {a.job?.companyName} · <span className={`status ${a.status}`}>{a.status.replace('_', ' ')}</span></p>)}</div>
    </>
  );
}
