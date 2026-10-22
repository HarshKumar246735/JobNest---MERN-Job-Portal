# JobNest - MERN Job Portal
LIVE DEMO - https://job-nest-mern-job-portal.vercel.app
<img width="1630" height="920" alt="image" src="https://github.com/user-attachments/assets/ab4f8ade-7de7-4068-82c2-7c070e59f63b" />


JobNest is a full-stack job portal where job seekers can find jobs, apply for positions, build resumes, and track applications. Recruiters can post jobs and manage candidates, while administrators manage and monitor the platform.

## Features

### Job Seekers

* Register and log in securely.
* Search, filter, and explore job listings.
* Apply for jobs and track application status.
* Save jobs and receive notifications.
* Build resumes using multiple templates.
* Upload resumes and manage profiles.
* View recommended jobs.

### Recruiters

* Create and manage job listings.
* View applicants and review candidates.
* Track recruitment pipelines.
* Add candidate notes.
* Schedule interviews.
* Export recruitment data to CSV.

### Administrators

* Manage users, jobs, and companies.
* Manage job categories and skills.
* View reports and dashboard statistics.
* Review audit logs and moderate the platform.

### Additional Features

* Real-time notifications using Socket.IO.
* Responsive user interface.
* Secure authentication using JWT.
* Role-based access control.
* Job search with filtering and pagination.
* SEO-friendly job listings and sitemap.

## Technology Stack

**Frontend**

* React 18
* Vite
* React Router
* Axios
* Context API
* Recharts
* Lucide React
* CSS

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.IO
* Multer
* Express Validator
* Helmet

## Project Structure

```text
JobNest/
├── client/          # React frontend
├── server/          # Express backend
├── .env.example     # Environment variables template
├── package.json     # Project scripts
└── README.md
```

## Requirements

Install the following before running the project:

* Node.js 18 or newer
* npm
* MongoDB local installation or MongoDB Atlas account

## Installation and Setup

### 1. Configure Environment Variables

Create a root `.env` file by copying `.env.example`.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure the required variables, including:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

Generate a strong, unique JWT secret and never commit your `.env` file to GitHub.

### 2. Configure the Frontend

```powershell
Copy-Item client/.env.example client/.env
```

Set the API URL in `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies

From the project root, run:

```bash
npm run install:all
```

### 4. Seed the Database

```bash
npm run seed
```

This command creates sample job categories, companies, job listings, demo accounts, and sample activity.

### 5. Start the Backend

Open a terminal:

```bash
npm run server
```

The backend should run at:

`http://localhost:5000`

### 6. Start the Frontend

Open another terminal:

```bash
npm run client
```

Open the application at:

`http://localhost:5173`

### 7. Run the Smoke Test

With the backend running, open another terminal and execute:

```bash
npm run test:smoke
```

This test checks important API functionality, including authentication, job listings, access control, applications, resumes, and interviews.

**Note:** The smoke test may require the database to be seeded and the demo accounts to exist. Resolve any reported failures before considering the application fully tested.

## Demo Accounts

These accounts are intended for local development only.

| Role       | Email                                                   | Password      |
| ---------- | ------------------------------------------------------- | ------------- |
| Job Seeker | [candidate@jobnest.demo](mailto:candidate@jobnest.demo) | Candidate@123 |
| Recruiter  | [recruiter@jobnest.demo](mailto:recruiter@jobnest.demo) | Recruiter@123 |
| Admin      | [admin@jobnest.demo](mailto:admin@jobnest.demo)         | Admin@12345   |

Never use these demo credentials in production.

## Production Build

To build the frontend:

```bash
npm run build
```

The generated frontend files will be available in `client/dist`.

To start the backend:

```bash
npm start
```

## Deployment

### Backend — Render

1. Create a new Web Service.
2. Set the root directory to `server`.
3. Set the build command to `npm install`.
4. Set the start command to `npm start`.
5. Configure the required environment variables.
6. Configure MongoDB Atlas network access.

### Frontend — Vercel

1. Import the project into Vercel.
2. Set the root directory to `client`.
3. Select Vite as the framework.
4. Add the `VITE_API_URL` environment variable with your deployed backend API URL.
5. Deploy the frontend.

After deployment, update `CLIENT_URL` on the backend to match your frontend's actual origin.

## Current Limitations

* The project requires testing in a real environment before production use.
* Resume and logo files are stored locally and may be lost when the hosting service redeploys.
* Email delivery and Cloudinary integration are not implemented.
* Some settings and legal pages are placeholders.
* Resume PDF export uses the browser's print functionality.
* Job recommendations use a basic scoring system rather than a machine-learning model.
* UI, mobile responsiveness, and Socket.IO behavior require separate testing.

## Future Improvements

* Cloud storage for resumes and company logos.
* Email verification and password-reset emails.
* Automated unit and integration tests.
* Improved job recommendations.
* Public recruiter and company profiles.
* Enhanced mobile experience.
* Advanced analytics and recruitment reports.

## Project Goal

JobNest is designed as a practical MERN stack project to demonstrate frontend development, backend API design, database management, authentication, authorization, real-time communication, and deployment.

**Status:** Development project. Verify all features through testing before using it in production.
