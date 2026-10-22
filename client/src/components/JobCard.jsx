import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock } from 'lucide-react';
import CompanyLogo from './CompanyLogo';
import SaveButton from './SaveButton';
import { salary, ago } from '../utils/format';
export default function JobCard({ job }) {
  return (
    <article className="job-card">
      <CompanyLogo name={job.companyName} url={job.companyLogo} />
      <div className="job-card-body">
        <h3><Link to={`/jobs/${job.slug}`}>{job.title}</Link></h3>
        <p className="muted">{job.companyName}{job.featured && <span className="badge">Featured</span>}</p>
        <ul className="meta">
          <li><MapPin size={14} />{job.city}, {job.state}</li>
          <li><Briefcase size={14} />{job.employmentType} · {job.workplace}</li>
          <li><Clock size={14} />{ago(job.publishedAt)}</li>
        </ul>
        <p className="salary">{salary(job)}</p>
        <div className="chips">{job.skills?.slice(0, 4).map((s) => <span key={s} className="chip">{s}</span>)}</div>
      </div>
      <SaveButton jobId={job._id} />
    </article>
  );
}
export const JobSkeletons = ({ n = 6 }) => Array.from({ length: n }, (_, i) => <div key={i} className="job-card skeleton" aria-hidden="true" />);
