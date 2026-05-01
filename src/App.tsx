import React, { useState, useEffect, useContext, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Upload, 
  BookOpen, 
  Users, 
  ArrowRight, 
  Download, 
  LogOut, 
  AlertCircle,
  HelpCircle,
  X,
  FileText,
  ShieldCheck,
  ChevronRight,
  Lock,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface User {
  id: string;
  displayName: string;
  email: string;
  photo?: string;
  role: 'student' | 'admin' | 'guest';
  onboarded: boolean;
  studentId?: string;
  department?: string;
  advisor?: string;
}

const AuthContext = createContext<{ 
  user: User | null; 
  login: () => void; 
  logout: () => void;
  error: string | null;
  setError: (val: string | null) => void;
  setUser: (user: User | null) => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  error: null,
  setError: () => {},
  setUser: () => {},
});

declare global {
  interface Window {
    google: any;
  }
}

const NEU_LOGO_URL = "https://drive.google.com/thumbnail?id=163dNIQbB7SiwOt_XDxF9jNO3groZ8hPO&sz=w1000";
const LOGIN_BG_URL = "https://drive.google.com/uc?export=view&id=1So_ECca4DzYJPStZuXkBU5Bcqn5BDfaS";

// --- Modern Background ---
function ModernBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden select-none pointer-events-none">
      {/* Deepest Academic Base */}
      <div className="absolute inset-0 bg-[#010208]" />
      
      {/* Background Image - Editorial / Architectural Treatment */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.15] mix-blend-screen saturate-0"
        style={{ backgroundImage: `url(${LOGIN_BG_URL})` }}
      />
      
      {/* Elegant Mesh Blobs - Enhanced Gold & Indigo */}
      <motion.div 
        animate={{ 
          scale: [1, 1.4, 1],
          x: [0, 80, 0],
          y: [0, 50, 0] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-orange-500/[0.08] blur-[140px] rounded-full"
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.25, 1],
          x: [0, -60, 0],
          y: [0, 80, 0] 
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-15%] left-[-15%] w-[70%] h-[70%] bg-indigo-600/[0.15] blur-[150px] rounded-full"
      />

      <motion.div 
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-orange-200/[0.02] blur-[180px] rounded-full"
      />

      {/* Subtle Noise/Texture Layer */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      {/* Grid for Academic Precision - Golden Hue */}
      <div className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(251, 191, 36, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 191, 36, 0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px' 
        }} 
      />

      {/* Edge Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#010208]/90" />
    </div>
  );
}

// --- Gatekeeper Component ---
/**
 * Wraps protected features to restrict access based on authentication state.
 */
function Gatekeeper({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { user } = useContext(AuthContext);
  if (!user || user.role === 'guest') {
    return <>{fallback || <LockedState />}</>;
  }
  return <>{children}</>;
}

function LockedState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-100 rounded-[32px] bg-slate-50/50">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
        <Lock className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-slate-900 font-bold mb-1">Access Restricted</p>
      <p className="text-slate-500 text-sm text-center mb-4 max-w-[200px]">Sign in with your @neu.edu.ph email to unlock this feature.</p>
      <Link to="/login" className="text-indigo-900 font-black text-[10px] uppercase tracking-widest hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full transition-colors">Login Now</Link>
    </div>
  );
}

// --- Layout Wrapper ---
function Layout({ children }: { children: React.ReactNode }) {
  const { user, login, logout, error, setError, setUser } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-transparent font-sans text-white selection:bg-orange-500/30 flex flex-col">
      <nav className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-orange-400/5 shadow-2xl shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="bg-white p-1 rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <img src={NEU_LOGO_URL} alt="NEU Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-white block leading-none">NEU ARCHIVE</span>
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">Institutional Gateway</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              <NavLink to="/">Repository</NavLink>
              <NavLink to="/browse">Browse</NavLink>
              <NavLink to="/about">About</NavLink>
              {user && <NavLink to="/dashboard">Dashboard</NavLink>}
            </div>

            <div className="flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white leading-tight">{user.displayName}</p>
                    <p className="text-[10px] text-orange-200 uppercase tracking-widest font-black italic">{user.role}</p>
                  </div>
                  <img src={user.photo} alt={user.displayName} className="w-10 h-10 rounded-xl ring-2 ring-white/10 shadow-sm" referrerPolicy="no-referrer" />
                  <button onClick={logout} title="Sign Out" className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="bg-white text-slate-950 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-orange-50 transition-all shadow-xl active:scale-95 text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
            >
              <div className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-2xl flex items-center gap-4 text-indigo-900">
                <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="font-black text-[10px] uppercase tracking-[0.2em] mb-1">Access Restricted</p>
                  <p className="text-sm font-medium text-slate-600">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {user && !user.onboarded && (
             <OnboardingModal onComplete={(updatedUser) => setUser(updatedUser)} />
          )}
        </AnimatePresence>
        {children}
      </div>

      <footer className="bg-indigo-950 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-white p-2 rounded-xl">
                  <img src={NEU_LOGO_URL} alt="NEU Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="font-serif italic text-3xl tracking-tighter capitalize text-white">Project Archive.</span>
              </div>
              <p className="max-w-sm text-slate-400 text-sm leading-relaxed font-academic font-light italic">
                "Preserving the legacy of research and intellectual property for a new era of knowledge synthesis."
              </p>
            </div>
            <div className="flex flex-col gap-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Quick Portal</span>
              <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Repository Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Global Search</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Institutional Help</a></li>
              </ul>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Official Domain</p>
              <p className="text-orange-100 font-serif italic text-xl drop-shadow-[0_0_12px_rgba(249,115,22,0.3)]">neu.edu.ph</p>
              <div className="mt-8 flex justify-start md:justify-end gap-6 text-slate-500">
                <ShieldCheck className="w-5 h-5 text-orange-500/40" />
                <Lock className="w-5 h-5 text-orange-500/40" />
                <GraduationCap className="w-5 h-5 text-orange-500/40" />
              </div>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">New Era University • Philippines Hub</p>
            <p className="text-[10px] font-medium text-slate-600">© 2026 Institutional Knowledge Repository</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-orange-400 transition-all relative group">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)] transition-all group-hover:w-full" />
    </Link>
  );
}

// --- Home Page ---
function HomePage() {
  const { user } = useContext(AuthContext);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-40 relative">
      <section className="text-center mb-40">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
        >
          <span className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.9)]" /> Established Gateway • Philippines
          </span>
          <h1 className="text-6xl md:text-9xl font-black text-white tracking-tight leading-[0.9] mb-12 uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            Knowledge <span className="text-white/10">/</span> <br />
            <span className="font-serif italic font-light text-orange-100/40 normal-case drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">Archives.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-16 font-academic leading-relaxed font-light italic">
            Centering institutional memory through Wiig's KM Cycle. Join the academic preservation movement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="relative w-full sm:max-w-xl group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search institutional research..."
                className="w-full pl-20 pr-8 py-8 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-orange-500/30 focus:ring-8 focus:ring-orange-500/5 transition-all text-white font-medium text-lg placeholder:text-slate-600 shadow-2xl backdrop-blur-xl"
              />
            </div>
            <button className="w-full sm:w-auto px-12 py-8 bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-orange-500 transition-all shadow-[0_20px_50px_-10px_rgba(249,115,22,0.4)] hover:-translate-y-1 border border-orange-400/20">
              Search Portal
            </button>
          </div>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-48">
        <FeatureCard icon={<Upload />} title="Building" type="KM Cycle I" desc="Collect & validate institutional knowledge." active={!!user?.onboarded} />
        <FeatureCard icon={<BookOpen />} title="Holding" type="KM Cycle II" desc="Preserve research in the secure vaults." active={true} />
        <FeatureCard icon={<Search />} title="Pooling" type="KM Cycle III" desc="Discovery of shared student capstones." active={true} />
        <FeatureCard icon={<Users />} title="Applying" type="KM Cycle IV" desc="Implement knowledge into societal solutions." active={true} />
      </div>

      <section className="mb-40">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 mb-6 block">Records History</span>
            <h2 className="text-5xl font-black text-indigo-950 tracking-tight uppercase">Recent <span className="font-serif italic font-light text-slate-300 normal-case">Deposits</span></h2>
          </div>
          <button className="text-indigo-950 font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 hover:gap-6 transition-all group bg-slate-50 px-8 py-4 rounded-full border border-slate-100">
            Full Archive <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[1, 2, 3].map((i) => (
            <ProjectCard key={i} index={i} authenticated={!!user} />
          ))}
        </div>
      </section>
    </main>
  );
}

function SupportModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="w-full max-w-xl bg-slate-900/40 backdrop-blur-3xl rounded-[48px] p-12 md:p-16 relative z-10 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)] border border-orange-400/10 transition-all hover:border-orange-400/30"
      >
        <div className="flex justify-between items-start mb-10">
          <div className="bg-white p-5 rounded-3xl shadow-[0_0_25px_rgba(249,115,22,0.3)] ring-1 ring-orange-400/30">
            <GraduationCap className="w-10 h-10 text-slate-900" />
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-slate-500">
            <X className="w-8 h-8" />
          </button>
        </div>
        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">Institutional SSO</h3>
        <div className="space-y-8 text-slate-400 font-academic text-lg leading-relaxed italic font-light">
          <p>
            The Eunice Archive (EA) utilizes New Era University's centralized Single Sign-On. Your institutional identity is the primary key.
          </p>
          <div className="p-6 bg-white/[0.03] rounded-3xl border border-orange-400/10 space-y-4">
            <div className="flex gap-4">
              <ShieldCheck className="w-6 h-6 text-orange-400 shrink-0" />
              <p className="text-sm font-black uppercase tracking-widest text-white">Encrypted Transactions</p>
            </div>
            <p className="text-sm leading-relaxed not-italic font-sans font-medium">All authentication handshakes are verified against the university's secure directory. Personal accounts are automatically blacklisted.</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-full mt-12 py-6 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-orange-50 transition-all shadow-[0_20px_50px_-10px_rgba(249,115,22,0.4)] ring-1 ring-orange-400/20"
        >
          Return to Gateway
        </button>
      </motion.div>
    </div>
  );
}

function OnboardingModal({ onComplete }: { onComplete: (user: User) => void }) {
  const [formData, setFormData] = useState({ studentId: '', department: '', advisor: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        onComplete(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl" 
      />
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-3xl rounded-[64px] p-12 md:p-20 relative z-10 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)] border border-orange-400/10"
      >
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 mb-6 block drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]">Member Registration</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6 leading-none">Complete <br/><span className="font-serif italic font-light lowercase text-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">Identity.</span></h2>
          <p className="text-slate-400 font-academic text-xl leading-relaxed italic font-light">Finalizing your institutional profile within the archive.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Student ID</label>
              <input 
                required
                type="text" 
                placeholder="NEU-XXXX-XXXX"
                value={formData.studentId}
                onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-400/40 transition-all font-black text-xs uppercase tracking-widest placeholder:text-slate-700 text-white"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Department</label>
              <select 
                required
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:ring-8 focus:ring-orange-400/5 focus:border-orange-400/40 transition-all font-black text-xs uppercase tracking-widest appearance-none text-white"
              >
                <option value="" className="bg-slate-900">Select College</option>
                <option value="CS" className="bg-slate-900">Computer Science</option>
                <option value="ENG" className="bg-slate-900">Engineering</option>
                <option value="ARTS" className="bg-slate-900">Liberal Arts</option>
                <option value="BUS" className="bg-slate-900">Business</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Project Advisor</label>
            <input 
              required
              type="text" 
              placeholder="Full Academic Name"
              value={formData.advisor}
              onChange={e => setFormData({ ...formData, advisor: e.target.value })}
              className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:ring-8 focus:ring-orange-400/5 focus:border-orange-400/40 transition-all font-black text-xs uppercase tracking-widest placeholder:text-slate-700 text-white"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[10px] rounded-full hover:bg-orange-50 transition-all shadow-[0_20px_50px_-10px_rgba(249,115,22,0.4)] ring-1 ring-orange-400/20 disabled:opacity-50"
          >
            {loading ? 'Finalizing...' : 'Initialize Profile Access'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// --- Login Page ---
function LoginPage() {
  const { user, login, error, setError } = useContext(AuthContext);
  const [showHelp, setShowHelp] = useState(false);

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-transparent">
      {/* Refined Dark Overlay */}
      <div className="absolute inset-0 bg-[#010208]/40 backdrop-blur-[2px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Superior Gold-Rimmed Glass Card */}
        <div className="bg-slate-950/40 backdrop-blur-3xl border border-orange-400/10 rounded-[48px] p-12 md:p-24 shadow-[0_48px_120px_-20px_rgba(0,0,0,1)] relative overflow-hidden group ring-1 ring-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.06] via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.05),transparent)] pointer-events-none" />
          
          <div className="flex flex-col items-center text-center mb-16 relative">
            <div className="bg-white p-6 rounded-[28px] shadow-2xl mb-12 ring-2 ring-orange-400/20 group-hover:scale-105 transition-transform duration-1000 ease-out">
              <img src={NEU_LOGO_URL} alt="NEU Logo" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 uppercase leading-[0.9] font-sans">
              Institutional <br/>
              <span className="font-serif italic font-light lowercase text-orange-400 tracking-normal opacity-90 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">Gateway.</span>
            </h2>
            <div className="w-12 h-px bg-orange-400/40 mb-8" />
            <p className="text-slate-200 font-academic text-2xl leading-relaxed max-w-lg italic font-light">
              Official Entry Point for the <span className="text-white font-medium underline underline-offset-8 decoration-orange-400/40">New Era University</span> Academic Community.
            </p>
          </div>

          <div className="space-y-8 relative">
            <button 
              onClick={login}
              className="w-full group bg-white text-indigo-950 py-8 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-6 hover:bg-orange-50 transition-all shadow-[0_20px_50px_-10px_rgba(249,115,22,0.2)] active:scale-[0.98] relative overflow-hidden border border-orange-200/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/20 to-orange-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" className="w-6 h-6 object-contain" />
              Identify with G-Suite
            </button>

            <div className="flex items-center gap-8 py-4 opacity-40">
              <div className="h-px w-full bg-orange-400/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.8em] text-orange-200 whitespace-nowrap">Secure Access</span>
              <div className="h-px w-full bg-orange-400/20" />
            </div>

            <div className="bg-white/[0.03] rounded-[32px] p-10 border border-orange-400/10 backdrop-blur-xl group/info transition-colors hover:bg-white/[0.05]">
              <div className="flex items-start gap-8">
                <div className="bg-orange-400/10 p-4 rounded-xl border border-orange-400/20 shrink-0">
                  <ShieldCheck className="w-7 h-7 text-orange-400" />
                </div>
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white mb-3 italic">Integrity Protocol</p>
                  <p className="text-base text-slate-300 font-academic leading-relaxed italic font-light">
                    Access mandates a verified <code className="text-orange-400 font-black bg-white/5 px-2.5 py-1 rounded-lg ring-1 ring-orange-400/20 text-shadow-sm">@neu.edu.ph</code> domain. Invalid credentials will be automatically denied.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-white/[0.05] pt-12 relative">
            <button 
              onClick={() => setShowHelp(true)}
              className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-colors"
            >
              <HelpCircle className="w-4 h-4" /> Academic Helpdesk
            </button>
            <Link to="/" className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 group transition-colors">
              Repository Entry <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        {/* Brand Footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.6em] flex items-center justify-center gap-4">
            <span className="w-8 h-px bg-slate-800" />
            New Era University • EST. 1975
            <span className="w-8 h-px bg-slate-800" />
          </p>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showHelp && (
            <SupportModal onClose={() => setShowHelp(false)} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- App Entry and Routing ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
    
    // Initialize Google Identity Services
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "884701267498-84hno35o3jqv796r45367l0077p50c7m.apps.googleusercontent.com",
          callback: handleGsiCallback,
          itp_support: true,
          auto_select: false,
        });
        clearInterval(interval);
      }
    }, 100);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'AUTH_SUCCESS') {
        setUser(event.data.user);
        setError(null);
      } else if (event.data?.type === 'AUTH_ERROR') {
        setError(event.data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType?.includes('application/json')) {
        const data = await res.json();
        if (data.authenticated) setUser(data.user);
      }
    } catch (err) {
      console.warn('Auth status silent failure');
    } finally {
      setLoading(false);
    }
  };

  const handleGsiCallback = async (response: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setError(null);
      } else {
        setError(data.message || 'Institutional verification failed.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Priority: Env Var > Placeholder (for preview)
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "884701267498-84hno35o3jqv796r45367l0077p50c7m.apps.googleusercontent.com";

    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'openid profile email',
        ux_mode: 'popup',
        prompt: 'select_account',
        callback: async (response: any) => {
          if (response.code) {
            setLoading(true);
            try {
              const res = await fetch('/api/auth/google/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: response.code })
              });
              const data = await res.json();
              if (res.ok) {
                setUser(data.user);
              } else {
                setError(data.message || 'Verification failed');
              }
            } catch (err) {
              setError('Handshake failed. Try again.');
            } finally {
              setLoading(false);
            }
          }
        },
      });
      client.requestCode();
    } else {
      // Fallback to legacy popup if library not ready
      const width = 500, height = 620;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open('/auth/google', 'login', `width=${width},height=${height},left=${left},top=${top}`);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent flex-col gap-10">
      <div className="relative group">
        <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full scale-150 animate-pulse" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          className="w-28 h-28 border border-white/5 rounded-[40px] flex items-center justify-center relative bg-white shadow-2xl overflow-hidden"
        >
          <img 
            src={NEU_LOGO_URL} 
            alt="Loading..." 
            className="w-16 h-16 object-contain relative z-10" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent" />
        </motion.div>
        <div className="w-32 h-32 border-t-2 border-indigo-500/30 rounded-[48px] animate-spin absolute inset-[-8px]" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="font-black text-[10px] tracking-[0.6em] text-indigo-400 uppercase">Validating Handshake</p>
        <p className="text-[8px] font-black tracking-[0.4em] text-slate-700 uppercase italic">Institutional Knowledge Base</p>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError, setUser }}>
      <ModernBackground />
      <AnimatePresence>
        {user && !user.onboarded && <OnboardingModal onComplete={(u: User) => setUser(u)} />}
      </AnimatePresence>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<Gatekeeper><div className="max-w-7xl mx-auto px-4 py-24"><h1 className="text-5xl font-black uppercase tracking-tight text-indigo-950">Student Dashboard</h1></div></Gatekeeper>} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

// --- Reusable UI ---
function FeatureCard({ icon, title, type, desc, active }: { icon: React.ReactNode; title: string; type: string; desc: string; active: boolean }) {
  return (
    <div className={cn(
      "p-12 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[64px] transition-all duration-700 relative overflow-hidden group",
      !active ? "opacity-30 grayscale saturate-0" : "hover:shadow-[0_48px_80px_-20px_rgba(249,115,22,0.25)] hover:-translate-y-3 border-orange-400/10 hover:border-orange-400/40"
    )}>
      {!active && <div className="absolute inset-0 z-10" title="Locked feature" />}
      <div className="mb-12 text-orange-500 transition-transform group-hover:scale-115 duration-700 origin-left drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600/40 mb-4 block">{type}</span>
      <h3 className="text-2xl font-black mb-6 tracking-tighter text-white uppercase">{title}</h3>
      <p className="text-sm text-slate-400 font-academic leading-relaxed font-light italic">{desc}</p>
      
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/[0.04] rounded-tl-[100px] translate-x-12 translate-y-12 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-700" />
    </div>
  );
}

const ProjectCard: React.FC<{ index: number; authenticated: boolean }> = ({ index, authenticated }) => {
  return (
    <div className="group bg-slate-900/40 backdrop-blur-3xl rounded-[64px] border border-white/5 overflow-hidden transition-all duration-1000 hover:shadow-[0_80px_160px_-40px_rgba(0,0,0,0.7)] hover:border-orange-400/30 relative">
      <div className="h-72 bg-white/5 p-16 flex items-center justify-center relative overflow-hidden group-hover:bg-orange-950/20 transition-colors duration-1000">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-0 transition-opacity" />
        <FileText className="w-24 h-24 text-slate-700 group-hover:text-orange-500 transition-all duration-1000 group-hover:scale-125 group-hover:rotate-12 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
        <div className="absolute bottom-6 left-12 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce shadow-[0_0_10px_rgba(249,115,22,0.9)]" />
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-75 shadow-[0_0_10px_rgba(249,115,22,0.9)]" />
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-150 shadow-[0_0_10px_rgba(249,115,22,0.9)]" />
        </div>
      </div>
      <div className="p-12">
        <div className="flex gap-4 mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 bg-orange-950/40 px-4 py-1.5 rounded-full border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]">Scholarship</span>
        </div>
        <h4 className="text-2xl font-black mb-10 leading-tight tracking-tight text-white uppercase line-clamp-2 font-serif normal-case italic font-light">Research Manuscript: Theoretical Framework {index}</h4>
        <div className="flex items-center justify-between pt-10 border-t border-white/5">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[11px] text-slate-950 font-black shadow-2xl group-hover:rotate-6 transition-transform ring-1 ring-orange-400/30">NEU</div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Researcher</span>
              <span className="text-[10px] font-medium text-slate-500">Institutional Member</span>
            </div>
          </div>
          <Gatekeeper fallback={<button className="p-4 text-slate-700 cursor-not-allowed bg-white/5 rounded-2xl"><Lock className="w-5 h-5" /></button>}>
            <button className="p-4 bg-white text-slate-950 rounded-2xl hover:bg-orange-50 transition-all shadow-[0_10px_40px_rgba(249,115,22,0.3)] ring-1 ring-orange-400/30 group/btn">
              <Download className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
            </button>
          </Gatekeeper>
        </div>
      </div>
    </div>
  );
};
