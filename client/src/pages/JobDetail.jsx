import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import CompanyLogo from '../components/CompanyLogo';
import ApplyPanel from '../components/ApplyPanel';
import SaveButton from '../components/SaveButton';
import { salary, ago, setTitle } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../services/api';
export default function JobDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null), [err, setErr] = useState(''); const { user } = useAuth(); const toast = useToast();
  const report = async (jobId) => { const reason = prompt('What is wrong with this listing?'); if (!reason) return; try { await api.post('/reports', { targetType: 'job', targetId: jobId, reason }); toast('Thanks, the listing was reported for review'); } catch (e) { toast(errMsg(e), 'err'); } };
  useEffect(() => {
    setData(null); setErr('');
    api.get(`/jobs/${id}`).then((r) => { setData(r.data); setTitle(`${r.data.job.title} at ${r.data.job.companyName}`, r.data.job.description); })
      .catch((e) => setErr(e.response?.status === 404 ? 'This job does not exist or was removed.' : 'Failed to load job.'));
  }, [id]);
  if (err) return <div className="container empty"><h2>{err}</h2><Link to="/jobs" className="btn btn-primary">Browse jobs</Link></div>;
  if (!data) return <div className="container"><div className="job-card skeleton tall" /></div>;
  const { job, similar } = data, c = job.company;
  const ld = { '@context': 'https://schema.org', '@type': 'JobPosting', title: job.title, description: job.description, datePosted: job.publishedAt, validThrough: job.deadline,
    employmentType: job.employmentType.toUpperCase().replace('-', '_'), hiringOrganization: { '@type': 'Organization', name: job.companyName },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.city, addressRegion: job.state, addressCountry: 'IN' } },
    baseSalary: job.salaryMin && { '@type': 'MonetaryAmount', currency: job.salaryCurrency, value: { '@type': 'QuantitativeValue', minValue: job.salaryMin, maxValue: job.salaryMax, unitText: 'YEAR' } } };
  const List = ({ title, items }) => items?.length > 0 && <><h3>{title}</h3><ul className="bullets">{items.map((i) => <li key={i}>{i}</li>)}</ul></>;
  return (
    <div className="container detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="detail-main">
        <header className="detail-head">
          <CompanyLogo name={job.companyName} size={64} />
          <div><h1>{job.title}</h1><p><Link to={`/companies/${c.slug}`}>{job.companyName}</Link> · {job.city}, {job.state} · {job.workplace}</p></div>
        </header>
        <div className="facts">
          <div><span>Salary</span><strong>{salary(job)}</strong></div><div><span>Type</span><strong>{job.employmentType}</strong></div>
          <div><span>Experience</span><strong>{job.experienceLevel}{job.minExperienceYears ? ` (${job.minExperienceYears}+ yrs)` : ''}</strong></div>
          <div><span>Openings</span><strong>{job.openings}</strong></div><div><span>Posted</span><strong>{ago(job.publishedAt)}</strong></div>
          <div><span>Apply by</span><strong>{new Date(job.deadline).toLocaleDateString()}</strong></div>
        </div>
        <h3>About the role</h3><p>{job.description}</p>
        <List title="Responsibilities" items={job.responsibilities} /><List title="Qualifications" items={job.qualifications} />
        <h3>Skills</h3><div className="chips">{job.skills.map((s) => <Link key={s} to={`/jobs?skills=${encodeURIComponent(s)}`} className="chip">{s}</Link>)}{job.preferredSkills?.map((s) => <span key={s} className="chip chip-soft">{s} (preferred)</span>)}</div>
        <List title="Benefits" items={job.benefits} />
        {job.isDemo && <p className="muted note">This is a sample listing created as demo data.</p>}
        {user && user.role !== 'admin' && <button className="btn btn-ghost" onClick={() => report(job._id)}>Report this listing</button>}
      </article>
      <aside className="detail-side">
        <div className="side-card"><div className="row-between"><h3>Apply for this job</h3><SaveButton jobId={job._id} /></div><ApplyPanel job={job} /></div>
        {similar.length > 0 && <div className="side-card"><h3>Similar jobs</h3>{similar.map((s) => <Link key={s._id} to={`/jobs/${s.slug}`} className="similar"><strong>{s.title}</strong><span>{s.companyName} · {s.city}</span></Link>)}</div>}
      </aside>
    </div>
  );
}
