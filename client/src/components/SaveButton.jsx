import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../context/SavedContext';
export default function SaveButton({ jobId }) {
  const { user } = useAuth(); const { ids, toggle } = useSaved(); const nav = useNavigate();
  if (user && user.role !== 'candidate') return null;
  const saved = ids.has(String(jobId));
  return <button className={`save-btn ${saved ? 'on' : ''}`} aria-pressed={saved} aria-label={saved ? 'Remove saved job' : 'Save job'}
    onClick={() => (user ? toggle(String(jobId)) : nav('/login', { state: { from: location.pathname + location.search } }))}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'} /></button>;
}
