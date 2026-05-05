import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModernBackground } from './components/ModernBackground';
import { Layout } from './components/Layout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';

import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { FacultyDashboard } from './pages/dashboards/FacultyDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';

import { LoadingScreen } from './components/LoadingScreen';

/* ================================
   ROLE REDIRECTOR (FIXED)
================================ */
const RoleRedirector = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.toLowerCase();

  switch (role) {
    case 'student':
      return <Navigate to="/dashboards/student" replace />;
    case 'faculty':
      return <Navigate to="/dashboards/faculty" replace />;
    case 'admin':
      return <Navigate to="/dashboards/admin" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

/* ================================
   ROLE GUARD
================================ */
const RoleGuard = ({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string;
}) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/* ================================
   APP
================================ */
export default function App() {
  return (
    <AuthProvider>
      <ModernBackground />

      <BrowserRouter>
        <Routes>

          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* DASHBOARDS */}
            <Route path="/dashboards/student" element={
              <RoleGuard role="student">
                <StudentDashboard />
              </RoleGuard>
            } />

            <Route path="/dashboards/faculty" element={
              <RoleGuard role="faculty">
                <FacultyDashboard />
              </RoleGuard>
            } />

            <Route path="/dashboards/admin" element={
              <RoleGuard role="admin">
                <AdminDashboard />
              </RoleGuard>
            } />

          </Route>

          {/* CENTRAL REDIRECT */}
          <Route path="/dashboards" element={<RoleRedirector />} />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}