import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { salary, setTitle } from '../../utils/format';
const lines = (a) => (a || []).join('\n'); const unLines = (s) => String(s).split('\n').map((x) => x.trim()).filter(Boolean); const unCsv = (s) => String(s).split(',').map((x) => x.trim()).filter(Boolean);
const blank = { title: '', description: '', responsibilities: '', qualifications: '', skills: '', preferredSkills: '', benefits: '', applicationQuestions: '', category: '', employmentType: 'Full-time', workplace: 'On-site', experienceLevel: 'Fresher', minExperienceYears: 0, salaryMin: '', salaryMax: '', city: '', state: '', country: 'India', deadline: '', openings: 1, education: '', requiresCoverLetter: false };
export default function JobForm() {
  const { id } = useParams(); const nav = useNavigate(); const toast = useToast();
  const [f, setF] = useState(blank), [cats, setCats] = useState([]), [preview, setPreview] = useState(false), [busy, setBusy] = useState(false), [status, setStatus] = useState('draft');
  useEffect(() => {
    setTitle(id ? 'Edit job' : 'Post a job'); api.get('/categories').then((r) => setCats(r.data.categories));
    if (id) api.get(`/recruiter/jobs/${id}`).then(({ data: { job: j } }) => { setStatus(j.status); setF({ ...blank, ...j, category: j.category, responsibilities: lines(j.responsibilities), qualifications: lines(j.qualifications), benefits: lines(j.benefits), applicationQuestions: lines(j.applicationQuestions), skills: j.skills.join(', '), preferredSkills: (j.preferredSkills || []).join(', '), deadline: j.deadline?.slice(0, 10) }); }).catch((e) => toast(errMsg(e), 'err'));
  }, [id]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const body = (publish) => ({ ...f, responsibilities: unLines(f.responsibilities), qualifications: unLines(f.qualifications), benefits: unLines(f.benefits), applicationQuestions: unLines(f.applicationQuestions), skills: unCsv(f.skills), preferredSkills: unCsv(f.preferredSkills),
    salaryMin: f.salaryMin === '' ? undefined : Number(f.salaryMin), salaryMax: f.salaryMax === '' ? undefined : Number(f.salaryMax), minExperienceYears: Number(f.minExperienceYears) || 0, openings: Number(f.openings) || 1, publish });
  const save = async (publish) => {
    setBusy(true);
    try { if (id) { const b = body(false); delete b.publish; await api.patch(`/jobs/${id}`, b); if (publish && status === 'draft') await api.patch(`/jobs/${id}/status`, { status: 'open' }); } else await api.post('/jobs', body(publish));
      toast(publish ? 'Job published' : 'Saved'); nav('/recruiter/jobs'); } catch (e) { toast(errMsg(e), 'err'); } finally { setBusy(false); }
  };
  const I = (k, label, type = 'text', extra = {}) => <label className="field"><span>{label}</span><input type={type} value={f[k] ?? ''} onChange={set(k)} {...extra} /></label>;
  const Sel = (k, label, opts) => <label className="field"><span>{label}</span><select value={f[k]} onChange={set(k)}>{opts.map((o) => <option key={o}>{o}</option>)}</select></label>;
  if (preview) return (<div className="card"><h1>{f.title || 'Untitled'}</h1><p className="muted">{f.city}, {f.state} · {f.workplace} · {f.employmentType} · {f.experienceLevel}</p><p className="salary">{salary({ salaryMin: f.salaryMin, salaryMax: f.salaryMax, employmentType: f.employmentType })}</p>
    <p>{f.description}</p><h3>Responsibilities</h3><ul className="bullets">{unLines(f.responsibilities).map((x) => <li key={x}>{x}</li>)}</ul><h3>Qualifications</h3><ul className="bullets">{unLines(f.qualifications).map((x) => <li key={x}>{x}</li>)}</ul>
    <div className="chips">{unCsv(f.skills).map((s) => <span className="chip" key={s}>{s}</span>)}</div><br /><button className="btn btn-ghost" onClick={() => setPreview(false)}>Back to editing</button></div>);
  return (<form onSubmit={(e) => { e.preventDefault(); save(false); }}><h1>{id ? 'Edit job' : 'Post a job'}</h1>
    <div className="card"><h3>Basics</h3>{I('title', 'Job title', 'text', { required: true, minLength: 3 })}
      <label className="field"><span>Category</span><select required value={f.category} onChange={set('category')}><option value="">Select…</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
      <label className="field"><span>Description (min 30 characters)</span><textarea required minLength={30} rows={5} value={f.description} onChange={set('description')} /></label>
      <label className="field"><span>Responsibilities (one per line)</span><textarea rows={4} value={f.responsibilities} onChange={set('responsibilities')} /></label>
      <label className="field"><span>Qualifications (one per line)</span><textarea rows={3} value={f.qualifications} onChange={set('qualifications')} /></label></div>
    <div className="card"><h3>Requirements</h3><div className="two-col">{Sel('employmentType', 'Employment type', ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'])}{Sel('workplace', 'Workplace', ['On-site', 'Hybrid', 'Remote'])}
      {Sel('experienceLevel', 'Experience level', ['Internship', 'Fresher', 'Entry-level', 'Mid-level', 'Senior-level', 'Lead'])}{I('minExperienceYears', 'Minimum years of experience', 'number', { min: 0 })}{I('education', 'Education')}{I('openings', 'Openings', 'number', { min: 1 })}</div>
      {I('skills', 'Required skills (comma separated)')}{I('preferredSkills', 'Preferred skills (comma separated)')}</div>
    <div className="card"><h3>Location, pay and deadline</h3><div className="two-col">{I('city', 'City')}{I('state', 'State')}{I('country', 'Country')}{I('deadline', 'Application deadline', 'date', { required: true })}{I('salaryMin', 'Min salary (₹/yr)', 'number', { min: 0 })}{I('salaryMax', 'Max salary (₹/yr)', 'number', { min: 0 })}</div>
      <label className="field"><span>Benefits (one per line)</span><textarea rows={3} value={f.benefits} onChange={set('benefits')} /></label></div>
    <div className="card"><h3>Application</h3><label className="check"><input type="checkbox" checked={f.requiresCoverLetter} onChange={set('requiresCoverLetter')} /> Require a cover letter</label>
      <label className="field"><span>Screening questions (one per line, candidates must answer all)</span><textarea rows={3} value={f.applicationQuestions} onChange={set('applicationQuestions')} /></label></div>
    <div className="actions"><button type="button" className="btn btn-ghost" onClick={() => setPreview(true)}>Preview</button>
      <button className="btn btn-ghost" disabled={busy}>{id ? 'Save changes' : 'Save as draft'}</button>
      {(!id || status === 'draft') && <button type="button" className="btn btn-primary" disabled={busy} onClick={(e) => { if (e.target.form.reportValidity()) save(true); }}>Publish</button>}</div></form>);
}
