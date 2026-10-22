import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import { Companies, CompanyDetail } from './pages/Companies';
import { Login, Register } from './pages/Auth';
import NotFound from './pages/NotFound';
import { About, Contact, Privacy, Terms } from './pages/Static';
import AdminLayout from './layouts/AdminLayout';
import { AdminDashboard, AdminUsers, AdminJobs, AdminCompanies, AdminCategories, AdminReports, AdminSettings } from './pages/admin/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import CandidateLayout from './layouts/CandidateLayout';
import RecruiterLayout from './layouts/RecruiterLayout';
import RDashboard from './pages/recruiter/Dashboard';
import RCompany from './pages/recruiter/Company';
import RJobs from './pages/recruiter/Jobs';
import RJobForm from './pages/recruiter/JobForm';
import RApplications from './pages/recruiter/Applications';
import RCandidate from './pages/recruiter/CandidateDetail';
import RInterviews from './pages/recruiter/Interviews';
import Dashboard from './pages/candidate/Dashboard';
import Profile from './pages/candidate/Profile';
import ResumeBuilder from './pages/candidate/ResumeBuilder';
import { Applications, SavedJobs, Recommended, Notifications } from './pages/candidate/Lists';
import { Resumes, JobAlerts, Settings } from './pages/candidate/Account';
export default createBrowserRouter([{ element: <MainLayout />, children: [
  { path: '/', element: <Home /> }, { path: '/jobs', element: <Jobs /> }, { path: '/jobs/:id', element: <JobDetail /> },
  { path: '/categories/:slug', element: <Jobs byCategory /> },
  { path: '/companies', element: <Companies /> }, { path: '/companies/:id', element: <CompanyDetail /> },
  { path: '/login', element: <Login /> }, { path: '/register', element: <Register /> }, { path: '/register/recruiter', element: <Register recruiter /> },
  { path: '/about', element: <About /> }, { path: '/contact', element: <Contact /> }, { path: '/privacy', element: <Privacy /> }, { path: '/terms', element: <Terms /> },
  { path: '*', element: <NotFound /> },
] }, { element: <ProtectedRoute role="candidate" />, children: [{ path: '/candidate', element: <CandidateLayout />, children: [
  { path: 'dashboard', element: <Dashboard /> }, { path: 'profile', element: <Profile /> }, { path: 'applications', element: <Applications /> },
  { path: 'saved-jobs', element: <SavedJobs /> }, { path: 'recommended', element: <Recommended /> }, { path: 'resumes', element: <Resumes /> },
  { path: 'resume-builder', element: <ResumeBuilder /> }, { path: 'job-alerts', element: <JobAlerts /> }, { path: 'notifications', element: <Notifications /> }, { path: 'settings', element: <Settings /> },
] }] }, { element: <ProtectedRoute role="recruiter" />, children: [{ path: '/recruiter', element: <RecruiterLayout />, children: [
  { path: 'dashboard', element: <RDashboard /> }, { path: 'company', element: <RCompany /> }, { path: 'jobs', element: <RJobs /> }, { path: 'jobs/new', element: <RJobForm /> },
  { path: 'jobs/:id/edit', element: <RJobForm /> }, { path: 'applications', element: <RApplications /> }, { path: 'candidates/:id', element: <RCandidate /> },
  { path: 'interviews', element: <RInterviews /> }, { path: 'notifications', element: <Notifications /> },
] }] }, { element: <ProtectedRoute role="admin" />, children: [{ path: '/admin', element: <AdminLayout />, children: [
  { path: 'dashboard', element: <AdminDashboard /> }, { path: 'users', element: <AdminUsers /> }, { path: 'jobs', element: <AdminJobs /> }, { path: 'companies', element: <AdminCompanies /> },
  { path: 'categories', element: <AdminCategories /> }, { path: 'reports', element: <AdminReports /> }, { path: 'settings', element: <AdminSettings /> },
] }] }]);
