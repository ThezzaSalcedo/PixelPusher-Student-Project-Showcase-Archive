import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';    

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  // UPDATED LOGIC: Hide the global header for Login AND all Dashboard pages
  const isAuthOrDashboard = 
    location.pathname === '/login' || 
    location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-transparent font-sans text-white flex flex-col">
      {/* 
          The global header only renders on public pages (like the Landing Page).
          Dashboard-specific navigation is handled within the Dashboard components themselves.
      */}
      {!isAuthOrDashboard && (
        <nav className="absolute w-full z-40 bg-slate-950/20 backdrop-blur-sm border-b border-white/5 h-20">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-full sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-4 group">
              <span className="font-black text-xl tracking-tight block leading-none">NEU ARCHIVE</span>
            </Link>

            <div className="flex items-center gap-6">
              {user ? (
                <button onClick={handleSignOut} className="p-2.5 text-slate-500 hover:text-white">
                  Sign Out
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-white text-slate-950 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-orange-50 transition-all shadow-xl"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <Outlet />
      </div>
    </div>
  );
};