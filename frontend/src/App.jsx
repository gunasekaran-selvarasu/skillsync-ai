import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './stores/authContext';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import FacultyLayout from './layouts/FacultyLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import CareerTwinPage from './pages/student/CareerTwinPage';
import SkillsAndGapsPage from './pages/student/SkillsAndGapsPage';
import DynamicRoadmapPage from './pages/student/DynamicRoadmapPage';
import ResumeStudioPage from './pages/student/ResumeStudioPage';
import JobMatchPage from './pages/student/JobMatchPage';
import AssessmentsPage from './pages/student/AssessmentsPage';
import ProjectGeneratorPage from './pages/student/ProjectGeneratorPage';
import InterviewPrepPage from './pages/student/InterviewPrepPage';
import SkillVerificationPage from './pages/student/SkillVerificationPage';
import CareerWhatIfPage from './pages/student/CareerWhatIfPage';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import AssignedStudentsPage from './pages/faculty/AssignedStudentsPage';
import StudentReportsPage from './pages/faculty/StudentReportsPage';

// Admin Pages
import TPODashboard from './pages/admin/TPODashboard';
import PlacementDrivesPage from './pages/admin/PlacementDrivesPage';
import CompaniesJobsPage from './pages/admin/CompaniesJobsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AIConfigPage from './pages/admin/AIConfigPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="career-twin" element={<CareerTwinPage />} />
        <Route path="skills-gaps" element={<SkillsAndGapsPage />} />
        <Route path="roadmap" element={<DynamicRoadmapPage />} />
        <Route path="resume-studio" element={<ResumeStudioPage />} />
        <Route path="job-match" element={<JobMatchPage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="projects" element={<ProjectGeneratorPage />} />
        <Route path="interviews" element={<InterviewPrepPage />} />
        <Route path="verification" element={<SkillVerificationPage />} />
        <Route path="what-if" element={<CareerWhatIfPage />} />
      </Route>

      {/* Faculty Portal */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="students" element={<AssignedStudentsPage />} />
        <Route path="reports" element={<StudentReportsPage />} />
      </Route>

      {/* Admin / TPO Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TPODashboard />} />
        <Route path="drives" element={<PlacementDrivesPage />} />
        <Route path="companies" element={<CompaniesJobsPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="ai-config" element={<AIConfigPage />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="*"
        element={
          user ? (
            user.role === 'student' ? (
              <Navigate to="/student/dashboard" replace />
            ) : user.role === 'faculty' ? (
              <Navigate to="/faculty/dashboard" replace />
            ) : (
              <Navigate to="/admin/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
