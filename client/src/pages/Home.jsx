import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import JobCard, { JobSkeletons } from '../components/JobCard';
import CompanyLogo from '../components/CompanyLogo';
import { setTitle } from '../utils/format';
export default function Home() {
  const [d, setD] = useState({ cats: [], featured: [], latest: [], remote: [], fresher: [], companies: [], stats: null });
  const [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    setTitle('');
    Promise.all([api.get('/categories'), api.get('/jobs/featured'), api.get('/jobs', { params: { sort: 'newest', limit: 6 } }),
      api.get('/jobs', { params: { workplace: 'Remote', limit: 3 } }), api.get('/jobs', { params: { fresher: true, limit: 3 } }),
      api.get('/companies'), api.get('/stats')])
      .then(([c, f, l, r, fr, co, s]) => setD({ cats: c.data.categories, featured: f.data.jobs.slice(0, 6), latest: l.data.jobs, remote: r.data.jobs, fresher: fr.data.jobs, companies: co.data.companies.slice(0, 8), stats: s.data }))
      .catch(() => setError('Could not load jobs. Is the API running and the database seeded?')).finally(() => setLoading(false));
  }, []);
  const Row = ({ title, jobs, link }) => (
    <section className="container section">
      <div className="section-head"><h2>{title}</h2>{link && <Link to={link}>View all →</Link>}</div>
      <div className="grid">{loading ? <JobSkeletons n={3} /> : jobs.map((j) => <JobCard key={j._id} job={j} />)}</div>
    </section>
  );
  return (
    <>
      <section className="hero"><div className="container">
        <h1>Find work that fits your <span>next chapter</span></h1>
        <p>Search jobs by title, skill, company or location{d.stats ? ` across ${d.stats.jobs} open roles` : ''}.</p>
        <SearchBar />
        {d.stats && <div className="chips hero-skills">{d.stats.topSkills.slice(0, 8).map((s) => <Link key={s} className="chip" to={`/jobs?skills=${encodeURIComponent(s)}`}>{s}</Link>)}</div>}
      </div></section>
      {error && <p className="container alert">{error}</p>}
      <section className="container section">
        <div className="section-head"><h2>Popular categories</h2></div>
        <div className="cat-grid">{d.cats.map((c) => <Link key={c._id} to={`/categories/${c.slug}`} className="cat"><strong>{c.name}</strong><span>{c.jobCount} jobs</span></Link>)}</div>
      </section>
      <Row title="Featured jobs" jobs={d.featured} link="/jobs?sort=relevant" />
      <Row title="Latest jobs" jobs={d.latest} link="/jobs?sort=newest" />
      <Row title="Remote opportunities" jobs={d.remote} link="/jobs?workplace=Remote" />
      <Row title="Freshers and entry-level" jobs={d.fresher} link="/jobs?fresher=true" />
      <section className="container section">
        <div className="section-head"><h2>Companies hiring</h2><Link to="/companies">All companies →</Link></div>
        <div className="co-grid">{d.companies.map((c) => <Link key={c._id} to={`/companies/${c.slug}`} className="co"><CompanyLogo name={c.name} url={c.logoUrl} /><strong>{c.name}</strong><span>{c.activeJobs} open jobs</span></Link>)}</div>
      </section>
      <section className="container"><div className="banner"><div><h2>Hiring? Reach candidates on JobNest</h2><p>Create a company profile and post your first job.</p></div><Link className="btn btn-light" to="/register/recruiter">Start hiring</Link></div></section>
    </>
  );
}
