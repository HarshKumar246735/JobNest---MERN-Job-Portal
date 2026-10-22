import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import api from '../services/api';
export default function SearchBar({ initialQ = '', initialLoc = '' }) {
  const nav = useNavigate();
  const [q, setQ] = useState(initialQ), [loc, setLoc] = useState(initialLoc);
  const [sugg, setSugg] = useState([]), [open, setOpen] = useState(false);
  useEffect(() => {
    if (q.trim().length < 2) { setSugg([]); return; }
    const t = setTimeout(() => api.get('/jobs/suggestions', { params: { q } }).then((r) => setSugg(r.data.suggestions)).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [q]);
  const go = (e, text) => {
    e?.preventDefault();
    const p = new URLSearchParams(); const term = text ?? q;
    if (term.trim()) p.set('q', term.trim()); if (loc.trim()) p.set('location', loc.trim());
    setOpen(false); nav(`/jobs?${p}`);
  };
  return (
    <form className="searchbar" onSubmit={go} role="search">
      <div className="sb-field">
        <Search size={18} />
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Job title, skill or company" aria-label="Job title, skill or company" />
        {open && sugg.length > 0 && (
          <ul className="suggest">{sugg.map((s, i) => <li key={i}><button type="button" onMouseDown={() => { setQ(s.text); go(null, s.text); }}>{s.text}<em>{s.type}</em></button></li>)}</ul>
        )}
      </div>
      <div className="sb-field"><MapPin size={18} /><input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="City, state or country" aria-label="Location" /></div>
      <button className="btn btn-primary" type="submit">Search jobs</button>
    </form>
  );
}
