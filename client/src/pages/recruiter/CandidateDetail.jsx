import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import InterviewForm from '../../components/InterviewForm';
import { TRANSITIONS, pretty, download } from '../../utils/constants';
import { setTitle } from '../../utils/format';
export default function CandidateDetail() {
  const { id } = useParams(); const toast = useToast(); const [d, setD] = useState(null), [err, setErr] = useState(''), [note, setNote] = useState(''), [sched, setSched] = useState(false);
  const load = () => api.get(`/recruiter/applications/${id}`).then((r) => { setD(r.data); setTitle(r.data.application.candidate.name); }).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, [id]);
  const act = async (fn, msg) => { try { await fn(); toast(msg); load(); } catch (e) { toast(errMsg(e), 'err'); } };
  if (err) return <div className="empty"><h2>{err}</h2><Link to="/recruiter/applications">Back</Link></div>; if (!d) return <div className="skeleton job-card tall" />;
  const a = d.application, c = a.candidate, p = c.profile || {}; const next = TRANSITIONS[a.status] || [];
  return (<><Link to="/recruiter/applications">← Applications</Link>
    <div className="card"><div className="row-between"><div><h1>{c.name}</h1><p className="muted">{p.headline} {p.location && `· ${p.location}`}</p>
      <p>Applied for <strong>{a.job.title}</strong> · <span className={`status ${a.status}`}>{pretty(a.status)}</span></p>
      {c.email && <p>Email: {c.email}</p>}{c.phone && <p>Phone: {c.phone}</p>}{!c.email && <p className="muted note">Contact details are hidden by the candidate. Use in-app interview scheduling to reach them.</p>}</div>
      <div className="actions">{next.map((s) => <button key={s} className={`btn ${s === 'REJECTED' ? 'btn-ghost' : 'btn-primary'}`} onClick={() => act(() => api.patch(`/recruiter/applications/${a._id}/status`, { status: s }), `Moved to ${pretty(s)}`)}>{s === 'REJECTED' ? 'Reject' : `Move to ${pretty(s)}`}</button>)}
        {['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status) && <button className="btn btn-ghost" onClick={() => setSched(!sched)}>Schedule interview</button>}</div></div></div>
    {sched && <div className="card"><h3>Schedule interview</h3><InterviewForm onSubmit={(f) => act(async () => { await api.post('/interviews', { ...f, applicationId: a._id }); setSched(false); }, 'Interview scheduled and candidate notified in-app')} /></div>}
    <div className="card"><h3>Resume</h3>{a.resume ? (a.resume.kind === 'upload' ? <button className="btn btn-ghost" onClick={() => download(api, `/resumes/${a.resume._id}/download`, a.resume.file.originalName).catch((e) => toast(errMsg(e), 'err'))}>Download {a.resume.file.originalName}</button> : <p className="muted">Built with the resume builder (online resumes cannot be downloaded from here yet).</p>) : <p className="muted">No resume attached.</p>}</div>
    {a.coverLetter && <div className="card"><h3>Cover letter</h3><p style={{ whiteSpace: 'pre-wrap' }}>{a.coverLetter}</p></div>}
    {a.answers?.length > 0 && <div className="card"><h3>Screening answers</h3>{a.answers.map((x) => <p key={x.question}><strong>{x.question}</strong><br />{x.answer}</p>)}</div>}
    <div className="card"><h3>Profile</h3>{p.summary && <p>{p.summary}</p>}<div className="chips">{p.skills?.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      {p.experience?.map((e, i) => <p key={i}><strong>{e.title}</strong> at {e.company}</p>)}{p.education?.map((e, i) => <p key={i}>{e.degree} {e.field} · {e.school}</p>)}
      {[p.linkedinUrl, p.githubUrl, p.portfolioUrl].filter(Boolean).map((u) => <p key={u}><a href={u} target="_blank" rel="noopener noreferrer">{u}</a></p>)}</div>
    {d.interviews.length > 0 && <div className="card"><h3>Interviews</h3>{d.interviews.map((i) => <p key={i._id}>{new Date(i.date).toLocaleDateString()} {i.startTime}-{i.endTime} · {i.mode} · <span className="status">{i.status}</span></p>)}</div>}
    <div className="card"><h3>Internal notes (never shown to the candidate)</h3>{a.recruiterNotes?.map((n) => <p key={n._id}>{n.text}<br /><small className="muted">{new Date(n.at).toLocaleString()}</small></p>)}
      <form onSubmit={(e) => { e.preventDefault(); if (note.trim()) act(async () => { await api.post(`/recruiter/applications/${a._id}/notes`, { text: note }); setNote(''); }, 'Note added'); }}><textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a private note" aria-label="Internal note" /><br /><button className="btn btn-ghost" style={{ marginTop: '.5rem' }}>Add note</button></form></div>
    <div className="card"><h3>History</h3>{a.history.map((h, i) => <p key={i}><span className="status">{pretty(h.status)}</span> <small className="muted">{new Date(h.at).toLocaleString()} {h.note && `· ${h.note}`}</small></p>)}</div></>);
}
