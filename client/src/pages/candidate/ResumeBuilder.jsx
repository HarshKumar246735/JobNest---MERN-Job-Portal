import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUp, ArrowDown, X, Printer, Save, UserCheck } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ListEditor from '../../components/ListEditor';
import '../../css/resume.css';
const SECTIONS = { summary: 'Professional summary', skills: 'Skills', experience: 'Work experience', education: 'Education', projects: 'Projects', certifications: 'Certifications', languages: 'Languages' };
const FIELDS = {
  experience: [{ k: 'title', label: 'Title' }, { k: 'company', label: 'Company' }, { k: 'startDate', label: 'Start', type: 'date' }, { k: 'endDate', label: 'End', type: 'date' }, { k: 'description', label: 'Description', area: true }],
  education: [{ k: 'school', label: 'School' }, { k: 'degree', label: 'Degree' }, { k: 'field', label: 'Field' }, { k: 'endYear', label: 'End year', type: 'number' }],
  projects: [{ k: 'name', label: 'Name' }, { k: 'url', label: 'URL' }, { k: 'description', label: 'Description', area: true }],
  certifications: [{ k: 'name', label: 'Name' }, { k: 'issuer', label: 'Issuer' }, { k: 'year', label: 'Year', type: 'number' }],
};
const empty = { personal: { name: '', email: '', phone: '', location: '', links: '' }, summary: '', skills: '', languages: '', experience: [], education: [], projects: [], certifications: [] };
const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present');
function Preview({ data, order, template }) {
  const p = data.personal, list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
  const body = {
    summary: data.summary && <p>{data.summary}</p>,
    skills: data.skills && <p className="r-tags">{list(data.skills).map((s) => <span key={s}>{s}</span>)}</p>,
    languages: data.languages && <p>{list(data.languages).join(' · ')}</p>,
    experience: data.experience.map((e, i) => <div key={i} className="r-item"><strong>{e.title}</strong>{e.company && ` · ${e.company}`}<em>{fmt(e.startDate)} - {fmt(e.endDate)}</em><p>{e.description}</p></div>),
    education: data.education.map((e, i) => <div key={i} className="r-item"><strong>{e.degree}{e.field && `, ${e.field}`}</strong><em>{e.endYear}</em><p>{e.school}</p></div>),
    projects: data.projects.map((e, i) => <div key={i} className="r-item"><strong>{e.name}</strong>{e.url && <em>{e.url}</em>}<p>{e.description}</p></div>),
    certifications: data.certifications.map((e, i) => <div key={i} className="r-item"><strong>{e.name}</strong>{e.issuer && ` · ${e.issuer}`}<em>{e.year}</em></div>),
  };
  return (<div className={`resume-paper tpl-${template}`} id="resume-preview"><header><h1>{p.name || 'Your Name'}</h1><p>{[p.email, p.phone, p.location, p.links].filter(Boolean).join('  |  ')}</p></header>
    {order.map((k) => { const c = body[k]; const has = Array.isArray(c) ? c.length : c; return has ? <section key={k}><h2>{SECTIONS[k]}</h2>{c}</section> : null; })}</div>);
}
export default function ResumeBuilder() {
  const { user } = useAuth(); const toast = useToast(); const [sp] = useSearchParams();
  const [id, setId] = useState(sp.get('id')), [title, setTitle] = useState('My Resume'), [template, setTemplate] = useState('modern');
  const [data, setData] = useState({ ...empty, personal: { ...empty.personal, name: user.name, email: user.email } });
  const [order, setOrder] = useState(['summary', 'experience', 'education', 'skills', 'projects']);
  useEffect(() => { document.title = 'Resume builder | JobNest'; if (id) api.get(`/resumes/${id}`).then((r) => { const b = r.data.resume.builder; setTitle(r.data.resume.title); setTemplate(b.template); setData({ ...empty, ...b.data }); if (b.sectionOrder?.length) setOrder(b.sectionOrder); }).catch((e) => toast(errMsg(e), 'err')); }, []);
  const move = (i, d) => setOrder((o) => { const n = [...o]; const j = i + d; if (j < 0 || j >= n.length) return o; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const prefill = () => { const q = user.profile || {}; setData((d) => ({ ...d, personal: { ...d.personal, phone: user.phone || '', location: q.location || '', links: [q.linkedinUrl, q.githubUrl].filter(Boolean).join(' ') }, summary: q.summary || d.summary, skills: (q.skills || []).join(', '), languages: (q.languages || []).join(', '), experience: q.experience || [], education: q.education || [], projects: q.projects || [], certifications: q.certifications || [] })); toast('Filled from your profile'); };
  const save = async () => {
    try { const body = { title, template, sectionOrder: order, data }; if (id) await api.patch(`/resumes/${id}`, body); else { const r = await api.post('/resumes', body); setId(r.data.resume._id); } toast('Resume saved'); } catch (e) { toast(errMsg(e), 'err'); }
  };
  const missing = Object.keys(SECTIONS).filter((k) => !order.includes(k));
  const P = (k, label) => <label className="field"><span>{label}</span><input value={data.personal[k]} onChange={(e) => setData({ ...data, personal: { ...data.personal, [k]: e.target.value } })} /></label>;
  return (
    <div className="builder"><div className="builder-form">
      <h1>Resume builder</h1>
      <div className="card"><div className="two-col"><label className="field"><span>Resume title</span><input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span>Template</span><select value={template} onChange={(e) => setTemplate(e.target.value)}><option value="modern">Modern</option><option value="classic">Classic</option><option value="minimal">Minimal</option></select></label></div>
        <div className="actions"><button className="btn btn-ghost" onClick={prefill}><UserCheck size={15} /> Fill from profile</button><button className="btn btn-primary" onClick={save}><Save size={15} /> Save</button><button className="btn btn-ghost" onClick={() => window.print()}><Printer size={15} /> Download PDF</button></div>
        <p className="muted">Download PDF opens your browser's print dialog: choose "Save as PDF".</p></div>
      <div className="card"><h3>Personal information</h3><div className="two-col">{P('name', 'Full name')}{P('email', 'Email')}{P('phone', 'Phone')}{P('location', 'Location')}</div>{P('links', 'Links (LinkedIn, GitHub, portfolio)')}</div>
      {order.map((k, i) => (
        <div className="card" key={k}><div className="row-between"><h3>{SECTIONS[k]}</h3><div className="actions">
          <button className="btn btn-ghost icon" aria-label="Move up" onClick={() => move(i, -1)}><ArrowUp size={14} /></button><button className="btn btn-ghost icon" aria-label="Move down" onClick={() => move(i, 1)}><ArrowDown size={14} /></button>
          <button className="btn btn-ghost icon" aria-label={`Remove ${SECTIONS[k]}`} onClick={() => setOrder(order.filter((x) => x !== k))}><X size={14} /></button></div></div>
          {k === 'summary' ? <textarea rows={4} value={data.summary} onChange={(e) => setData({ ...data, summary: e.target.value })} className="input" />
            : k === 'skills' || k === 'languages' ? <input className="input" value={data[k]} placeholder="Comma separated" onChange={(e) => setData({ ...data, [k]: e.target.value })} />
            : <ListEditor label={SECTIONS[k].toLowerCase()} items={data[k]} fields={FIELDS[k]} onChange={(v) => setData({ ...data, [k]: v })} />}</div>))}
      {missing.length > 0 && <div className="card"><span className="lbl">Add section</span><div className="chips">{missing.map((k) => <button key={k} className="chip chip-x" onClick={() => setOrder([...order, k])}>+ {SECTIONS[k]}</button>)}</div></div>}
    </div><div className="builder-preview"><Preview data={data} order={order} template={template} /></div></div>
  );
}
