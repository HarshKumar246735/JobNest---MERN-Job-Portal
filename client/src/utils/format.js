const lpa = (n) => (n >= 100000 ? `${(n / 100000).toFixed(n % 100000 ? 1 : 0)} LPA` : n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`);
export const salary = (j) => (j.salaryMin ? `₹${lpa(j.salaryMin)} - ₹${lpa(j.salaryMax)}${j.employmentType === 'Internship' ? ' / yr' : ''}` : 'Not disclosed');
export const ago = (d) => { const days = Math.floor((Date.now() - new Date(d)) / 864e5); return days <= 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`; };
export const setTitle = (t, desc) => {
  document.title = t ? `${t} | JobNest` : 'JobNest - Find your next job';
  const meta = document.querySelector('meta[name="description"]'); if (meta && desc) meta.setAttribute('content', desc.slice(0, 160));
  let link = document.querySelector('link[rel="canonical"]'); if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
  link.href = window.location.origin + window.location.pathname;
};
