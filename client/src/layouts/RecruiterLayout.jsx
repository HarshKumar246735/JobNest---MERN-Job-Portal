import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, Briefcase, Users, CalendarDays, Bell, PlusCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
const L = [['dashboard', 'Dashboard', LayoutDashboard], ['company', 'Company', Building2], ['jobs', 'My jobs', Briefcase], ['jobs/new', 'Post a job', PlusCircle], ['applications', 'Applications', Users], ['interviews', 'Interviews', CalendarDays], ['notifications', 'Notifications', Bell]];
export default function RecruiterLayout() {
  return (<><Navbar /><div className="container dash"><nav className="dash-nav" aria-label="Recruiter">{L.map(([p, t, I]) => <NavLink key={p} end={p === 'jobs'} to={`/recruiter/${p}`}><I size={17} /> {t}</NavLink>)}</nav>
    <main className="dash-main" id="main"><Outlet /></main></div></>);
}
