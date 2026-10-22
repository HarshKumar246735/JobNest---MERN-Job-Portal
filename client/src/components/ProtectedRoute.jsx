import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';
// UI convenience only. The backend enforces authorization on every endpoint.
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth(); const loc = useLocation();
  if (loading) return <div className="container"><div className="skeleton job-card tall" /></div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}
