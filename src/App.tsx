import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModernBackground } from './components/ModernBackground';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { FacultyDashboard } from './pages/dashboards/FacultyDashboard';
import { LoadingScreen } from './components/LoadingScreen';


// Traffic Controller: Redirects users based on their login status and role
const RoleRedirector = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  
  return <Navigate to={`/dashboard/${user.role}`} replace />;
};

// Security Guard: Protects specific role-based routes
const RoleGuard = ({ children, role }: { children: React.ReactNode; role: string }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <ModernBackground />
      <BrowserRouter>
        <Routes>
          {/* Main Layout wrapper for pages with a Nav Bar */}
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard/student" element={
              <RoleGuard role="student">
                <StudentDashboard />
              </RoleGuard>
            } />
            <Route path="/dashboard/admin" element={
              <RoleGuard role="admin">
                <AdminDashboard />
              </RoleGuard>
            } />
            <Route path="/dashboard/faculty" element={
              <RoleGuard role="faculty">
                <FacultyDashboard />
              </RoleGuard>
            } />
          </Route>

          {/* Central redirect logic for /dashboard */}
          <Route path="/dashboard" element={<RoleRedirector />} />
          
          {/* Fallback for unknown URLs */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}