import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X, Bell } from 'lucide-react';
import { useUnread } from '../context/SocketContext';
import { useAuth, homeFor } from '../context/AuthContext';
export default function Navbar() {
  const { user, logout } = useAuth(); const { unread } = useUnread(); const [open, setOpen] = useState(false); const nav = useNavigate();
  const close = () => setOpen(false);
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}><Briefcase size={22} /> Job<span>Nest</span></Link>
        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/jobs" onClick={close}>Find jobs</NavLink>
          <NavLink to="/companies" onClick={close}>Companies</NavLink>
          {(!user || user.role === 'recruiter') && <NavLink to={user ? '/recruiter/dashboard' : '/register/recruiter'} onClick={close}>For employers</NavLink>}
          {user ? (
            <>
              {user.role !== 'admin' && <Link to={`/${user.role}/notifications`} className="bell" onClick={close} aria-label={`Notifications, ${unread} unread`}><Bell size={18} />{unread > 0 && <span className="bell-n">{unread > 9 ? '9+' : unread}</span>}</Link>}
              <Link to={homeFor(user)} className="btn btn-ghost" onClick={close}>Dashboard</Link>
              <button className="btn btn-primary" onClick={async () => { await logout(); close(); nav('/'); }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" onClick={close}>Log in</Link>
              <Link to="/register" className="btn btn-primary" onClick={close}>Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
