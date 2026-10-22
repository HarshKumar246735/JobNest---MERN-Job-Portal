# JobNest - MERN Job Portal

Job seekers, recruiters and administrators on one platform: search and filter jobs, apply, track applications, build resumes, post jobs, review candidates, schedule interviews, and moderate the platform.

> **Status honesty:** all code was written without access to a database or the npm registry, so it has been syntax-checked (`node --check`, esbuild) and its imports verified, but **never run end-to-end**. Run the steps below and the smoke test, then fix anything that surfaces. See "Known limitations".

## Stack
React 18 + Vite, React Router, Axios, Context API, Lucide, Recharts, plain CSS (`client/src/css`) | Node, Express 4, MongoDB + Mongoose, JWT (httpOnly cookie, Bearer fallback), bcryptjs, Multer, Socket.IO, express-validator, Helmet, express-rate-limit.

## Structure
```
JobNest/
├── client/   React app (src/pages, components, layouts, context, hooks, services, utils, css)
├── server/   Express API (config, controllers, middleware, models, routes, services, validators, sockets, scripts)
├── .env.example  README.md  package.json
```

## Prerequisites
Node 18+, a MongoDB database (local `mongodb://127.0.0.1:27017/jobnest` or a free MongoDB Atlas cluster).

## Setup
```bash
cp .env.example .env                 # root .env is read by the server; set MONGODB_URI and a long random JWT_SECRET
cp client/.env.example client/.env   # VITE_API_URL=http://localhost:5000/api
npm run install:all
npm run seed                         # 15 categories, 32 demo companies, 300 jobs, demo accounts + sample activity
npm run server                       # API on :5000   (terminal 1)
npm run client                       # app on :5173   (terminal 2)
npm run test:smoke                   # with the API running; exercises auth, RBAC, apply flow, uploads, interviews
```
`npm run seed` is repeatable (upserts, no duplicates) and refuses to run when `NODE_ENV=production`.
Create a real admin with `ADMIN_EMAIL` / `ADMIN_PASSWORD` (12+ chars) in `.env` then `npm run seed:admin`. Users can never self-register as admin.

## Demo accounts (development only, created by `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Job seeker | candidate@jobnest.demo | Candidate@123 |
| Recruiter | recruiter@jobnest.demo | Recruiter@123 |
| Admin | admin@jobnest.demo | Admin@12345 |

Never use these in production. The 32 demo companies are fictional, unverified and use initials logos. Jobs are marked `isDemo` and described as sample listings.

## Environment variables
See `.env.example`. Required: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (comma-separated allowed origins). Optional: `SERVER_URL` (public API URL, used for logo URLs), `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Cloudinary and SMTP variables are listed but **not used by the code yet**: files are stored on local disk and no email is sent (notifications are in-app only; password-reset tokens are printed to the server console outside production).

## Production build
`npm run build` (client, outputs `client/dist`). `npm start` runs the API.

## Deployment
**Backend on Render:** new Web Service, root directory `server`, build `npm install`, start `npm start`. Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=https://your-app.vercel.app`, `SERVER_URL=https://your-api.onrender.com`. Allow Render's IPs in MongoDB Atlas network access. Seed once from your machine against the Atlas URI with `ALLOW_PROD_SEED=true` only if you want demo data.
**Frontend on Vercel:** root directory `client`, framework Vite, env `VITE_API_URL=https://your-api.onrender.com/api`. `client/vercel.json` rewrites all routes to `index.html` so refreshes and deep links work. Update `client/public/robots.txt` with your API URL (the API serves `/sitemap.xml`).
Cross-site cookies: the API sets `SameSite=None; Secure` in production. Browsers that block third-party cookies (e.g. Safari) may break sessions when frontend and API are on different domains; serving both under one parent domain avoids this.

## Authorization model
Every protected endpoint checks the JWT and role on the server (`middleware/auth.js`); frontend route guards are only a convenience. Recruiters can only touch jobs/applications/interviews they own; candidates only their own data; `/api/admin/*` requires the admin role and sensitive actions are written to the audit log. Candidates can only withdraw applications; recruiters follow the transition table in `services/applicationFlow.js`.

## Feature status
Implemented in source (not yet executed end-to-end): auth + password reset, public job search with server-side filters/sort/pagination/suggestions, company and category pages, candidate dashboard/profile/applications/saved jobs/alerts/recommendations/notifications, resume upload (content-sniffed PDF/DOCX) and builder (3 templates, live preview, reorder, print-to-PDF), apply workflow with duplicate prevention, recruiter dashboard/company/jobs/pipeline/notes/interviews/CSV, admin dashboard/users/jobs/companies/categories/skills/reports/audit log, Socket.IO notifications with authenticated rooms, saved-job deadline reminders, sitemap, JobPosting structured data, responsive CSS.

## Known limitations
- Never run end-to-end by the author; expect to fix small bugs. `npm run test:smoke` covers the main API paths but not the UI, mobile layout, or Socket.IO.
- No automated unit/UI tests; no mobile/browser testing was done.
- Local-disk uploads (resumes, logos) are lost on Render free-tier redeploys. Add persistent storage or Cloudinary before real use.
- No email sending; no Cloudinary integration; no profile photo upload; no public profile page; privacy toggles only control what recruiters see.
- Admin "Settings" is informational (no editable platform settings); no admin pre-approval queue (jobs publish immediately, admins can flag/remove).
- Builder resumes cannot be downloaded by recruiters from the candidate page; PDF export uses the browser print dialog.
- Homepage omits career-advice, testimonials, newsletter and resume-promo sections (no fabricated content, no newsletter backend). Contact page shows a placeholder email, and Privacy/Terms are templates needing legal review.
- Company logos are initials-based; no third-party logo API is used.
- Seeded jobs are 5 roles x 4 seniority levels per category (300 total) with varied company, city, salary, skills and descriptions, but titles are formulaic.
- Recommendations are a transparent heuristic score, not a validated model.
