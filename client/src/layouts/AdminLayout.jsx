import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Building2, Tags, Flag, Settings } from 'lucide-react';
import Navbar from '../components/Navbar';
const L = [['dashboard', 'Dashboard', LayoutDashboard], ['users', 'Users', Users], ['jobs', 'Job moderation', Briefcase], ['companies', 'Companies', Building2], ['categories', 'Categories & skills', Tags], ['reports', 'Reports & audit', Flag], ['settings', 'Settings', Settings]];
export default function AdminLayout() {
  return (<><Navbar /><div className="container dash"><nav className="dash-nav" aria-label="Admin">{L.map(([p, t, I]) => <NavLink key={p} to={`/admin/${p}`}><I size={17} /> {t}</NavLink>)}</nav><main className="dash-main" id="main"><Outlet /></main></div></>);
}
