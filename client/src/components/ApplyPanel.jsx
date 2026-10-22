import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
export default function ApplyPanel({ job }) {
  const { user } = useAuth(); const toast = useToast(); const loc = useLocation();
  const [resumes, setResumes] = useState([]), [applied, setApplied] = useState(false), [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const [f, setF] = useState({ resumeId: '', coverLetter: '', answers: {} });
  const candidate = user?.role === 'candidate';
  useEffect(() => {
    if (!candidate) return;
    api.get('/resumes').then((r) => { setResumes(r.data.resumes); const d = r.data.resumes.find((x) => x.isDefault) || r.data.resumes[0]; if (d) setF((s) => ({ ...s, resumeId: d._id })); });
    api.get('/applications/my-applications').then((r) => setApplied(r.data.applications.some((a) => a.job?.slug === job.slug)));
  }, [candidate, job.slug]);
  if (job.status !== 'open') return <p className="muted">This job is {job.status} and not accepting applications.</p>;
  if (!user) return <Link to="/login" state={{ from: loc.pathname }} className="btn btn-primary block">Log in to apply</Link>;
  if (!candidate) return <p className="muted">Only job seeker accounts can apply.</p>;
  if (applied) return <p className="ok-text"><CheckCircle size={18} /> You have applied to this job. <Link to="/candidate/applications">Track application</Link></p>;
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await api.post('/applications', { jobId: job._id, resumeId: f.resumeId, coverLetter: f.coverLetter, answers: (job.applicationQuestions || []).map((q) => ({ question: q, answer: f.answers[q] || '' })) });
      setApplied(true); toast('Application submitted'); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  if (!open) return <button className="btn btn-primary block" onClick={() => setOpen(true)}>Apply now</button>;
  return (
    <form onSubmit={submit}>
      {err && <p className="alert" role="alert">{err}</p>}
      {resumes.length === 0 ? <p className="alert">You need a resume first. <Link to="/candidate/resumes">Upload</Link> or <Link to="/candidate/resume-builder">build one</Link>.</p> :
        <label className="field"><span>Resume</span><select required value={f.resumeId} onChange={(e) => setF({ ...f, resumeId: e.target.value })}>{resumes.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}</select></label>}
      <label className="field"><span>Cover letter{job.requiresCoverLetter ? ' (required)' : ' (optional)'}</span><textarea rows={4} required={job.requiresCoverLetter} value={f.coverLetter} onChange={(e) => setF({ ...f, coverLetter: e.target.value })} /></label>
      {(job.applicationQuestions || []).map((q) => <label className="field" key={q}><span>{q}</span><input required value={f.answers[q] || ''} onChange={(e) => setF({ ...f, answers: { ...f.answers, [q]: e.target.value } })} /></label>)}
      <button className="btn btn-primary block" disabled={busy || !resumes.length}>{busy ? 'Submitting…' : 'Submit application'}</button>
    </form>
  );
}
