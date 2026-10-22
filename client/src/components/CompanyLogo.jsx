import { useState } from 'react';
const colors = ['#4f46e5', '#0ea5e9', '#059669', '#d97706', '#db2777', '#7c3aed', '#0f766e'];
export default function CompanyLogo({ name = '?', url, size = 44 }) {
  const [bad, setBad] = useState(false);
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const bg = colors[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
  if (url && !bad) return <img src={url} alt={`${name} logo`} width={size} height={size} loading="lazy" className="logo-img" onError={() => setBad(true)} />;
  return <span className="logo-fallback" style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }} aria-label={`${name} logo`}>{initials}</span>;
}
