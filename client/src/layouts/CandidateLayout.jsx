import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, User, FileText, Bookmark, Bell, Settings, Send, Sparkles, FilePen, BellRing } from 'lucide-react';
import Navbar from '../components/Navbar';
const L = [['dashboard', 'Dashboard', LayoutDashboard], ['recommended', 'Recommended', Sparkles], ['applications', 'Applications', Send], ['saved-jobs', 'Saved jobs', Bookmark], ['profile', 'Profile', User],
  ['resumes', 'My resumes', FileText], ['resume-builder', 'Resume builder', FilePen], ['job-alerts', 'Job alerts', BellRing], ['notifications', 'Notifications', Bell], ['settings', 'Settings', Settings]];
export default function CandidateLayout() {
  return (<><Navbar /><div className="container dash">
    <nav className="dash-nav" aria-label="Candidate">{L.map(([p, t, I]) => <NavLink key={p} to={`/candidate/${p}`}><I size={17} /> {t}</NavLink>)}</nav>
    <main className="dash-main" id="main"><Outlet /></main></div></>);
}
