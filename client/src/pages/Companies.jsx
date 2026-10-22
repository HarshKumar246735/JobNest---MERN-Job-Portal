import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import CompanyLogo from '../components/CompanyLogo';
import JobCard, { JobSkeletons } from '../components/JobCard';
import { setTitle } from '../utils/format';
export function Companies() {
  const [q, setQ] = useState(''), [page, setPage] = useState(1), [d, setD] = useState({ companies: [], pages: 1 }), [loading, setLoading] = useState(true);
  useEffect(() => { setTitle('Companies'); setLoading(true); const t = setTimeout(() => api.get('/companies', { params: { q, page } }).then((r) => setD(r.data)).finally(() => setLoading(false)), 250); return () => clearTimeout(t); }, [q, page]);
  return (
    <div className="container section"><h1>Companies</h1>
      <input className="input" placeholder="Search companies" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search companies" />
      <div className="co-grid">{loading ? <div className="skeleton job-card" /> : d.companies.map((c) => (
        <Link key={c._id} to={`/companies/${c.slug}`} className="co"><CompanyLogo name={c.name} url={c.logoUrl} /><strong>{c.name}</strong><span>{c.headquarters} · {c.activeJobs} open jobs</span></Link>))}</div>
      {!loading && d.companies.length === 0 && <div className="empty"><h3>No companies found</h3></div>}
      {d.pages > 1 && <nav className="pager"><button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {d.pages}</span><button className="btn btn-ghost" disabled={page >= d.pages} onClick={() => setPage(page + 1)}>Next</button></nav>}
    </div>
  );
}
export function CompanyDetail() {
  const { id } = useParams(); const [d, setD] = useState(null), [err, setErr] = useState(false);
  useEffect(() => { setD(null); api.get(`/companies/${id}`).then((r) => { setD(r.data); setTitle(r.data.company.name); }).catch(() => setErr(true)); }, [id]);
  if (err) return <div className="container empty"><h2>Company not found</h2></div>;
  if (!d) return <div className="container grid"><JobSkeletons n={3} /></div>;
  const c = d.company;
  return (
    <div className="container section">
      <header className="detail-head"><CompanyLogo name={c.name} url={c.logoUrl} size={72} /><div><h1>{c.name}</h1>
        <p className="muted">{c.industry} · {c.headquarters} · {c.size} employees{c.foundedYear ? ` · Founded ${c.foundedYear}` : ''}</p>
        <span className={`badge ${c.verification === 'verified' ? 'ok' : ''}`}>{c.verification === 'verified' ? 'Verified employer' : 'Not verified'}</span></div></header>
      <p>{c.description}</p>
      {c.benefits?.length > 0 && <div className="chips">{c.benefits.map((b) => <span key={b} className="chip">{b}</span>)}</div>}
      <h2>Open jobs ({d.jobs.length})</h2>
      <div className="grid">{d.jobs.map((j) => <JobCard key={j._id} job={j} />)}</div>
    </div>
  );
}
