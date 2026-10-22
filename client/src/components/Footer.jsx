import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div><h4 className="brand-lg">JobNest</h4><p>Connecting job seekers and recruiters. Sample listings are demo data.</p></div>
        <div><h5>Job seekers</h5><Link to="/jobs">Browse jobs</Link><Link to="/companies">Companies</Link><Link to="/register">Create account</Link></div>
        <div><h5>Employers</h5><Link to="/register/recruiter">Post a job</Link><Link to="/login">Recruiter login</Link></div>
      </div>
      <div className="container footer-bottom"><Link to="/about">About</Link> · <Link to="/contact">Contact</Link> · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link><br />© {new Date().getFullYear()} JobNest</div>
    </footer>
  );
}
