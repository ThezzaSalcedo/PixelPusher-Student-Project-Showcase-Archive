import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const { user, login, loginWithEmail, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auto-redirect if already logged in
  if (user) return <Navigate to="/dashboard" replace />;

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithEmail(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Institutional Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }} 
            animate={{ opacity: 1, y: 0, x: "-50%" }} 
            exit={{ opacity: 0, y: -20, x: "-50%" }} 
            className="fixed top-12 left-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className="bg-white border-2 border-red-50 rounded-[28px] p-6 shadow-2xl flex items-center gap-5">
              <div className="bg-red-500 p-3 rounded-2xl shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-bold text-slate-800 flex-1 leading-snug">{error}</p>
              <button onClick={() => setError(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-950/40 backdrop-blur-3xl border border-orange-400/10 rounded-[48px] p-12 md:p-16 w-full max-w-xl z-10 ring-1 ring-white/5">
        <div className="text-center mb-12">
           <h2 className="text-5xl font-black text-white uppercase leading-none tracking-tighter">
            Institutional <br/>
            <span className="italic font-light text-orange-400">Gateway.</span>
          </h2>
        </div>

        {/* --- Primary Manual Login Form --- */}
        <form onSubmit={handleManualLogin} className="space-y-5 text-left mb-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-400/80 ml-2">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-orange-500/50 outline-none transition-all placeholder:text-white/10" 
              placeholder="n.surname@neu.edu.ph" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-400/80 ml-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-orange-500/50 outline-none transition-all" 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full group bg-orange-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-orange-500 transition-all shadow-lg flex items-center justify-center gap-3"
          >
            Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* --- Secondary OAuth Option --- */}
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="bg-[#0c0d12] px-4 text-white/20">Institutional Single Sign-On</span></div>
        </div>

        <button 
          onClick={login} 
          className="w-full bg-white text-indigo-950 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 hover:bg-orange-50 transition-all shadow-xl active:scale-[0.98]"
        >
          <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" className="w-6 h-6" alt="Google" />
          Sign In with Google
        </button>
      </div>
    </div>
  );
};