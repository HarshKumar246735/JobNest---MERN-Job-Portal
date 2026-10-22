const r = require('express').Router(); const Job = require('../models/Job'); const Company = require('../models/Company'); const JobCategory = require('../models/JobCategory'); const { asyncHandler } = require('../utils/helpers');
const x = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
r.get('/sitemap.xml', asyncHandler(async (_req, res) => {
  const base = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].replace(/\/$/, '');
  const [jobs, cos, cats] = await Promise.all([Job.find({ status: 'open' }).select('slug updatedAt').limit(5000).lean(), Company.find().select('slug').limit(2000).lean(), JobCategory.find({ active: true }).select('slug').lean()]);
  const urls = [['/', ''], ['/jobs', ''], ['/companies', ''], ['/about', ''], ...cats.map((c) => [`/categories/${c.slug}`, '']), ...cos.map((c) => [`/companies/${c.slug}`, '']), ...jobs.map((j) => [`/jobs/${j.slug}`, j.updatedAt.toISOString().slice(0, 10)])];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([p, d]) => `<url><loc>${x(base + p)}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>`);
}));
module.exports = r;
