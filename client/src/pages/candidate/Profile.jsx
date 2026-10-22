import { useEffect, useState } from 'react';
import api, { errMsg } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ListEditor from '../../components/ListEditor';
import { setTitle } from '../../utils/format';
const csv = (a) => (a || []).join(', '); const unCsv = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
export default function Profile() {
  const { user } = useAuth(); const toast = useToast(); const [busy, setBusy] = useState(false);
  const [name, setName] = useState(user.name), [phone, setPhone] = useState(user.phone || ''); const p0 = user.profile || {};
  const [p, setP] = useState({ ...p0, skills: csv(p0.skills), languages: csv(p0.languages), preferredLocations: csv(p0.preferredLocations), employmentPreferences: csv(p0.employmentPreferences), privacy: p0.privacy || {} });
  const [lists, setLists] = useState({ education: p0.education || [], experience: p0.experience || [], projects: p0.projects || [], certifications: p0.certifications || [] });
  useEffect(() => setTitle('My profile'), []);
  const T = ({ k, label, type = 'text' }) => <label className="field"><span>{label}</span><input type={type} value={p[k] ?? ''} onChange={(e) => setP({ ...p, [k]: e.target.value })} /></label>;
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.patch('/candidate/profile', { name, phone, profile: { ...p, skills: unCsv(p.skills), languages: unCsv(p.languages), preferredLocations: unCsv(p.preferredLocations), employmentPreferences: unCsv(p.employmentPreferences), ...lists } }); toast('Profile saved'); }
    catch (x) { toast(errMsg(x), 'err'); } finally { setBusy(false); }
  };
  const priv = (k, l) => <label className="check"><input type="checkbox" checked={!!p.privacy[k]} onChange={(e) => setP({ ...p, privacy: { ...p.privacy, [k]: e.target.checked } })} />{l}</label>;
  return (
    <form onSubmit={save}><h1>My profile</h1>
      <div className="card"><h3>Basics</h3><div className="two-col"><label className="field"><span>Full name</span><input required value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field"><span>Email (read-only)</span><input value={user.email} disabled /></label><label className="field"><span>Phone</span><input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        <T k="headline" label="Professional headline" /><T k="location" label="Current location" /><T k="expectedSalary" label="Expected salary (₹/yr)" type="number" /><T k="noticePeriodDays" label="Notice period (days)" type="number" /></div>
        <label className="field"><span>Career summary</span><textarea rows={4} value={p.summary || ''} onChange={(e) => setP({ ...p, summary: e.target.value })} /></label></div>
      <div className="card"><h3>Skills and preferences</h3><div className="two-col"><T k="skills" label="Skills (comma separated)" /><T k="languages" label="Languages" /><T k="preferredLocations" label="Preferred job locations" /><T k="employmentPreferences" label="Employment preferences (e.g. Full-time, Internship)" /></div></div>
      <div className="card"><h3>Links</h3><div className="two-col"><T k="portfolioUrl" label="Portfolio URL" type="url" /><T k="githubUrl" label="GitHub URL" type="url" /><T k="linkedinUrl" label="LinkedIn URL" type="url" /></div></div>
      <div className="card"><h3>Education</h3><ListEditor label="education" items={lists.education} onChange={(v) => setLists({ ...lists, education: v })} fields={[{ k: 'school', label: 'School' }, { k: 'degree', label: 'Degree' }, { k: 'field', label: 'Field' }, { k: 'startYear', label: 'Start year', type: 'number' }, { k: 'endYear', label: 'End year', type: 'number' }]} /></div>
      <div className="card"><h3>Work experience</h3><ListEditor label="experience" items={lists.experience} onChange={(v) => setLists({ ...lists, experience: v })} fields={[{ k: 'title', label: 'Title' }, { k: 'company', label: 'Company' }, { k: 'startDate', label: 'Start', type: 'date' }, { k: 'endDate', label: 'End', type: 'date' }, { k: 'description', label: 'Description', area: true }]} /></div>
      <div className="card"><h3>Projects</h3><ListEditor label="project" items={lists.projects} onChange={(v) => setLists({ ...lists, projects: v })} fields={[{ k: 'name', label: 'Name' }, { k: 'url', label: 'URL' }, { k: 'description', label: 'Description', area: true }]} /></div>
      <div className="card"><h3>Certifications</h3><ListEditor label="certification" items={lists.certifications} onChange={(v) => setLists({ ...lists, certifications: v })} fields={[{ k: 'name', label: 'Name' }, { k: 'issuer', label: 'Issuer' }, { k: 'year', label: 'Year', type: 'number' }]} /></div>
      <div className="card"><h3>Privacy</h3>{priv('publicProfile', 'Make my professional profile visible to recruiters I apply to')}{priv('showEmail', 'Show my email to recruiters')}{priv('showPhone', 'Show my phone number to recruiters')}
        <p className="muted">Contact details and resumes are never shown publicly.</p></div>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}
