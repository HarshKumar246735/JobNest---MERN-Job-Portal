import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';
import { errMsg } from '../services/api';
import { setTitle } from '../utils/format';
function Shell({ title, sub, children }) {
  setTitle(title);
  return <div className="auth-wrap"><div className="auth-card"><h1>{title}</h1><p className="muted">{sub}</p>{children}</div></div>;
}
export function Login() {
  const { login, user } = useAuth(); const nav = useNavigate(); const loc = useLocation();
  const [f, setF] = useState({ email: '', password: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  if (user) return <Navigate to={homeFor(user)} replace />;
  const submit = async (e) => { e.preventDefault(); setBusy(true); setErr(''); try { const u = await login(f.email, f.password); nav(loc.state?.from || homeFor(u)); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); } };
  return (
    <Shell title="Welcome back" sub="Log in to your JobNest account">
      <form onSubmit={submit}>
        {err && <p className="alert" role="alert">{err}</p>}
        <label className="field"><span>Email</span><input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></label>
        <label className="field"><span>Password</span><input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></label>
        <button className="btn btn-primary block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="muted center">New here? <Link to="/register">Create an account</Link> · <Link to="/register/recruiter">Hire talent</Link></p>
    </Shell>
  );
}
export function Register({ recruiter }) {
  const { register, user } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  if (user) return <Navigate to={homeFor(user)} replace />;
  const submit = async (e) => { e.preventDefault(); setBusy(true); setErr(''); try { nav(homeFor(await register({ ...f, role: recruiter ? 'recruiter' : 'candidate' }))); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); } };
  return (
    <Shell title={recruiter ? 'Create a recruiter account' : 'Create your account'} sub={recruiter ? 'Post jobs and manage applicants' : 'Find and apply to jobs faster'}>
      <form onSubmit={submit}>
        {err && <p className="alert" role="alert">{err}</p>}
        <label className="field"><span>Full name</span><input required minLength={2} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></label>
        <label className="field"><span>Email</span><input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></label>
        <label className="field"><span>Password (min 8 characters)</span><input type="password" required minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" /></label>
        <button className="btn btn-primary block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="muted center">Already registered? <Link to="/login">Log in</Link></p>
    </Shell>
  );
}
