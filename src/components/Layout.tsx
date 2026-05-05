import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './dashboard/Sidebar'; // The decoupled sidebar
import { useAuth } from '../context/AuthContext';
import { DashboardNavProvider } from '../context/DashboardNavContext';

// Define the PublicNavbar locally to fix the "Cannot find name" error
const PublicNavbar = () => {
  const { user, logout } = useAuth();
  
  return (
    <nav className="absolute w-full z-40 bg-slate-950/20 backdrop-blur-sm border-b border-white/5 h-20 shrink-0">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-full sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-4 group">
          <span className="font-black text-xl tracking-tight block leading-none text-white">NEU ARCHIVE</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <button 
              onClick={() => logout()} 
              className="p-2.5 text-slate-500 hover:text-white uppercase text-[10px] font-black tracking-widest"
            >
              Sign Out
            </button>
          ) : (
            <Link 
              to="/login" 
              className="bg-white text-slate-950 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-all shadow-xl"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export const Layout = () => {
  const location = useLocation();
  
  // Dashboard routes use the decoupled Sidebar[cite: 3, 6]
  const isDashboard = location.pathname.startsWith('/dashboard');
  
  // The PublicNavbar only appears on the Landing Page[cite: 4, 6]
  const isLandingPage = location.pathname === '/';

  return (
    <DashboardNavProvider>
      <div className="h-screen w-full flex overflow-hidden bg-[#020d1d] text-white font-sans selection:bg-[#C5A059]/30">
        
        {/* 1. FIXED SIDEBAR: Rendered for dashboards */}
        {isDashboard && <Sidebar />}

        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* 2. PUBLIC HEADER: Strictly for the Landing Page[cite: 4, 6] */}
          {isLandingPage && <PublicNavbar />} 

          {/* 3. SCROLLABLE CONTENT: Main viewport for Dashboards */}
          <main className={`flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10 ${isLandingPage ? 'pt-20' : ''}`}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global CSS for hiding scrollbars while maintaining functionality[cite: 3] */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </DashboardNavProvider>
  );
};