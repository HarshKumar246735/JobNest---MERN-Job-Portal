import { useEffect, useState } from 'react';
import api, { errMsg } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CompanyLogo from '../../components/CompanyLogo';
import { setTitle } from '../../utils/format';
export default function Company() {
  const { refresh } = useAuth(); const toast = useToast(); const [c, setC] = useState(null), [loaded, setLoaded] = useState(false), [f, setF] = useState({ name: '', industry: '', website: '', headquarters: '', size: '11-50', foundedYear: '', description: '', workplaceInfo: '', benefits: '' });
  useEffect(() => { setTitle('Company'); api.get('/recruiter/company').then((r) => { if (r.data.company) { setC(r.data.company); setF({ ...r.data.company, benefits: (r.data.company.benefits || []).join(', ') }); } }).finally(() => setLoaded(true)); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault(); const body = { ...f, benefits: String(f.benefits).split(',').map((s) => s.trim()).filter(Boolean), foundedYear: Number(f.foundedYear) || undefined };
    try { const r = c ? await api.patch(`/companies/${c._id}`, body) : await api.post('/companies', body); setC(r.data.company); await refresh(); toast('Company saved'); } catch (x) { toast(errMsg(x), 'err'); }
  };
  const logo = async (e) => { const file = e.target.files[0]; if (!file) return; const fd = new FormData(); fd.append('logo', file); try { const r = await api.post(`/companies/${c._id}/logo`, fd); setC(r.data.company); toast('Logo updated'); } catch (x) { toast(errMsg(x), 'err'); } };
  const verify = async () => { try { const r = await api.post('/recruiter/company/verification-request'); setC(r.data.company); toast('Verification requested'); } catch (x) { toast(errMsg(x), 'err'); } };
  if (!loaded) return <div className="skeleton job-card" />;
  return (<form onSubmit={save}><h1>Company profile</h1>
    {c && <div className="card row-between"><div className="detail-head"><CompanyLogo name={c.name} url={c.logoUrl} size={64} /><div><strong>{c.name}</strong><p className="muted">Status: {c.verification}</p></div></div>
      <div><label className="field"><span>Upload logo (PNG, JPG, WEBP, max 1MB)</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={logo} /></label>
        {(c.verification === 'unverified' || c.verification === 'rejected') && <button type="button" className="btn btn-ghost" onClick={verify}>Request verification</button>}</div></div>}
    <div className="card"><div className="two-col"><label className="field"><span>Company name</span><input required value={f.name} onChange={set('name')} /></label><label className="field"><span>Industry</span><input value={f.industry || ''} onChange={set('industry')} /></label>
      <label className="field"><span>Website</span><input type="url" value={f.website || ''} onChange={set('website')} /></label><label className="field"><span>Headquarters</span><input value={f.headquarters || ''} onChange={set('headquarters')} /></label>
      <label className="field"><span>Company size</span><select value={f.size || '11-50'} onChange={set('size')}>{['1-10', '11-50', '51-200', '201-1000', '1000+'].map((s) => <option key={s}>{s}</option>)}</select></label>
      <label className="field"><span>Founded year</span><input type="number" min="1800" max="2100" value={f.foundedYear || ''} onChange={set('foundedYear')} /></label></div>
      <label className="field"><span>Description</span><textarea rows={4} value={f.description || ''} onChange={set('description')} /></label>
      <label className="field"><span>Workplace information</span><textarea rows={2} value={f.workplaceInfo || ''} onChange={set('workplaceInfo')} /></label>
      <label className="field"><span>Benefits (comma separated)</span><input value={f.benefits} onChange={set('benefits')} /></label></div>
    <button className="btn btn-primary">{c ? 'Save company' : 'Create company'}</button></form>);
}
