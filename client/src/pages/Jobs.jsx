import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import JobCard, { JobSkeletons } from '../components/JobCard';
import { setTitle } from '../utils/format';
const OPTS = {
  experience: ['Internship', 'Fresher', 'Entry-level', 'Mid-level', 'Senior-level', 'Lead'],
  type: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'],
  workplace: ['On-site', 'Hybrid', 'Remote'],
};
const LABEL = { experience: 'Experience', type: 'Job type', workplace: 'Workplace', q: 'Keyword', location: 'Location', skills: 'Skills', fresher: 'Fresher friendly', internship: 'Internships', verified: 'Verified employers', days: 'Posted within (days)', salaryMin: 'Min salary', company: 'Company', category: 'Category' };
export default function Jobs({ byCategory }) {
  const { slug } = useParams();
  const [sp, setSp] = useSearchParams();
  const [res, setRes] = useState({ jobs: [], total: 0, pages: 1 }), [loading, setLoading] = useState(true), [err, setErr] = useState(''), [show, setShow] = useState(false);
  const params = Object.fromEntries(sp); if (byCategory) params.category = slug;
  const key = JSON.stringify(params);
  useEffect(() => {
    setTitle(byCategory ? `${slug.replace(/-/g, ' ')} jobs` : 'Search jobs'); setLoading(true); setErr('');
    api.get('/jobs', { params }).then((r) => setRes(r.data)).catch((e) => setErr(e.response?.data?.message || 'Failed to load jobs')).finally(() => setLoading(false));
  }, [key]);
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  const clear = () => setSp(new URLSearchParams());
  const active = [...sp.entries()].filter(([k]) => !['page', 'sort'].includes(k));
  const page = Number(sp.get('page') || 1);
  const Select = ({ k, label }) => (
    <label className="field"><span>{label}</span>
      <select value={sp.get(k) || ''} onChange={(e) => set(k, e.target.value)}><option value="">Any</option>{OPTS[k].map((o) => <option key={o}>{o}</option>)}</select></label>
  );
  return (
    <div className="container jobs-page">
      <SearchBar key={sp.get('q') + sp.get('location')} initialQ={sp.get('q') || ''} initialLoc={sp.get('location') || ''} />
      <div className="jobs-layout">
        <button className="btn btn-ghost filter-toggle" onClick={() => setShow(!show)}><SlidersHorizontal size={16} /> Filters</button>
        <aside className={`filters ${show ? 'show' : ''}`}>
          <h3>Filters</h3>
          <Select k="experience" label="Experience level" /><Select k="type" label="Job type" /><Select k="workplace" label="Workplace" />
          <label className="field"><span>Posted within</span><select value={sp.get('days') || ''} onChange={(e) => set('days', e.target.value)}><option value="">Anytime</option><option value="1">24 hours</option><option value="7">7 days</option><option value="30">30 days</option></select></label>
          <label className="field"><span>Min. yearly salary (₹)</span><input type="number" min="0" step="100000" value={sp.get('salaryMin') || ''} onChange={(e) => set('salaryMin', e.target.value)} /></label>
          <label className="field"><span>Skills (comma separated)</span><input defaultValue={sp.get('skills') || ''} onBlur={(e) => set('skills', e.target.value)} placeholder="React, Node.js" /></label>
          <label className="check"><input type="checkbox" checked={sp.get('fresher') === 'true'} onChange={(e) => set('fresher', e.target.checked ? 'true' : '')} /> Fresher friendly</label>
          <label className="check"><input type="checkbox" checked={sp.get('internship') === 'true'} onChange={(e) => set('internship', e.target.checked ? 'true' : '')} /> Internships</label>
          <label className="check"><input type="checkbox" checked={sp.get('verified') === 'true'} onChange={(e) => set('verified', e.target.checked ? 'true' : '')} /> Verified employers</label>
          <button className="btn btn-ghost" onClick={clear}>Clear filters</button>
        </aside>
        <section>
          <div className="results-head">
            <strong>{loading ? 'Searching…' : `${res.total} jobs found`}</strong>
            <label>Sort <select value={sp.get('sort') || 'relevant'} onChange={(e) => set('sort', e.target.value)}>
              <option value="relevant">Most relevant</option><option value="newest">Newest</option><option value="salary_desc">Salary: high to low</option><option value="salary_asc">Salary: low to high</option></select></label>
          </div>
          {active.length > 0 && <div className="chips active">{active.map(([k, v]) => <button key={k} className="chip chip-x" onClick={() => set(k, '')}>{LABEL[k] || k}: {v === 'true' ? 'Yes' : v} <X size={12} /></button>)}</div>}
          {err && <p className="alert">{err}</p>}
          <div className="list">{loading ? <JobSkeletons /> : res.jobs.map((j) => <JobCard key={j._id} job={j} />)}</div>
          {!loading && !err && res.jobs.length === 0 && <div className="empty"><h3>No jobs match your search</h3><p>Try removing filters or using broader keywords.</p><button className="btn btn-primary" onClick={clear}>Clear all filters</button></div>}
          {res.pages > 1 && <nav className="pager" aria-label="Pagination">
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => set('page', page - 1)}>Previous</button>
            <span>Page {page} of {res.pages}</span>
            <button className="btn btn-ghost" disabled={page >= res.pages} onClick={() => set('page', page + 1)}>Next</button></nav>}
        </section>
      </div>
    </div>
  );
}
