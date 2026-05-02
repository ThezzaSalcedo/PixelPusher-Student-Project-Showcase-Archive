import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Used to detect current page

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  // Check if we are currently on the login page
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-transparent font-sans text-white flex flex-col">
      {/* 
          1. !isLoginPage: Only render the nav if we are NOT on the login page.
          2. absolute: Makes the header stay at the top of the landing page so it scrolls away.
      */}
      {!isLoginPage && (
        <nav className="absolute w-full z-40 bg-slate-950/20 backdrop-blur-sm border-b border-white/5 h-20">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-full sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-4 group">
              <span className="font-black text-xl tracking-tight block leading-none">NEU ARCHIVE</span>
            </Link>

            <div className="flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white leading-tight">{user.displayName}</p>
                    <p className="text-[10px] text-orange-200 uppercase font-black italic">{user.role}</p>
                  </div>
                  <button 
                    onClick={handleSignOut} 
                    className="p-2.5 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
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