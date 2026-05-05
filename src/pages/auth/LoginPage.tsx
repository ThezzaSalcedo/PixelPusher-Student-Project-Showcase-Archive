import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, ArrowRight, LockKeyhole } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, loginWithEmail, error, setError } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  React.useEffect(() => {
    console.log('LoginPage useEffect - user:', user);
    if (user) {
      console.log('LoginPage - navigating to /dashboards');
      navigate('/dashboards');
    }
  }, [user, navigate]);

  if (user) return <Navigate to="/dashboards" replace />;

  const handleManualLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await loginWithEmail(email, password);
    if (success) {
      navigate('/dashboards');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#0B1C2C] overflow-hidden font-serif selection:bg-[#D4AF37]/30">

      {/* 🌌 BACKGROUND (KEEP YOUR STYLE) */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1.02, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/333.jpg')" }}
      />

      {/* Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0B1C2C]/80 via-[#0B1C2C]/95 to-[#0B1C2C]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0B1C2C_100%)]" />

      {/* ❗ ERROR TOAST */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }} 
            animate={{ opacity: 1, y: 0, x: "-50%" }} 
            exit={{ opacity: 0, y: -20, x: "-50%" }} 
            className="fixed top-12 left-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-[#0f1f33]/80 backdrop-blur-xl border border-[#D4AF37]/40 rounded-3xl p-6 flex items-center gap-5">
              <div className="bg-[#D4AF37] p-3 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <p className="text-sm text-gray-200 flex-1">{error}</p>
              <button onClick={() => setError(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💎 MAIN CARD */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl group"
      >
        {/* Glow */}
        <div className="absolute -inset-8 bg-gradient-to-b from-[#D4AF37]/20 to-transparent blur-3xl opacity-60 group-hover:opacity-100 transition" />
        
        <div className="relative bg-[#0f1f33]/70 backdrop-blur-2xl border border-[#D4AF37]/50 rounded-[40px] p-14 shadow-2xl">
          
          {/* TITLE */}
          <div className="text-center mb-14">
            <h2 className="text-5xl font-black text-white leading-none tracking-tight">
              Institutional <br/>
              <span className="italic font-light text-[#D4AF37]">Gateway</span>
            </h2>
          </div>

          {/* FORM */}
          <form onSubmit={handleManualLogin} className="space-y-6 mb-14">

            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="n.surname@neu.edu.ph"
              className="w-full bg-white/[0.03] border border-white/10 rounded-full px-8 py-5 text-white focus:border-[#D4AF37] outline-none"
              required
            />

            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white/[0.03] border border-white/10 rounded-full px-8 py-5 text-white focus:border-[#D4AF37] outline-none"
              required
            />

            {/* GOLD BUTTON */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#b8962e] text-black py-5 rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <LockKeyhole className="w-4 h-4" />
              Access Vault
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          {/* DIVIDER */}
          <div className="relative mb-10">
            <div className="border-t border-white/10"></div>
            <p className="text-center text-xs text-gray-400 mt-3 tracking-widest">
              OR CONTINUE WITH
            </p>
          </div>

          {/* GOOGLE */}
          <button 
            onClick={login}
            className="w-full bg-white text-black py-4 rounded-full flex items-center justify-center gap-3 hover:bg-gray-200 transition"
          >
            <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </motion.div>
    </div>
  );
};