import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, ArrowRight, UserPlus, GraduationCap, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../lib/supabase';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboards/student" replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Create user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: role,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message || 'Registration failed. Please try again.');
        return;
      }

      if (data?.user) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (selectedRole: string) => {
    switch (selectedRole) {
      case 'student':
        return <GraduationCap size={20} />;
      case 'faculty':
        return <UserPlus size={20} />;
      case 'admin':
        return <Shield size={20} />;
      default:
        return <UserPlus size={20} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#0B1C2C] overflow-hidden font-serif selection:bg-[#D4AF37]/30">

      {/* Background */}
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

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }} 
            animate={{ opacity: 1, y: 0, x: "-50%" }} 
            exit={{ opacity: 0, y: -20, x: "-50%" }} 
            className="fixed top-12 left-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-[#0f1f33]/80 backdrop-blur-xl border border-red-500/40 rounded-3xl p-6 flex items-center gap-5">
              <div className="bg-red-500 p-3 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-200 flex-1">{error}</p>
              <button onClick={() => setError('')}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h3>
              <p className="text-gray-600 mb-4">Your account has been created. Redirecting to login...</p>
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl group"
      >
        {/* Glow */}
        <div className="absolute -inset-8 bg-gradient-to-b from-[#D4AF37]/20 to-transparent blur-3xl opacity-60 group-hover:opacity-100 transition" />
        
        <div className="relative bg-[#0f1f33]/70 backdrop-blur-2xl border border-[#D4AF37]/50 rounded-[40px] p-14 shadow-2xl">
          
          {/* Title */}
          <div className="text-center mb-14">
            <h2 className="text-5xl font-black text-white leading-none tracking-tight">
              Create <br/>
              <span className="italic font-light text-[#D4AF37]">Account</span>
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <input 
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-white/[0.03] border border-white/10 rounded-full px-8 py-5 text-white focus:border-[#D4AF37] outline-none"
              required
            />

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

            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full bg-white/[0.03] border border-white/10 rounded-full px-8 py-5 text-white focus:border-[#D4AF37] outline-none"
              required
            />

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Select Your Role</label>
              <div className="grid grid-cols-3 gap-3">
                {(['student', 'faculty', 'admin'] as const).map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setRole(roleOption)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      role === roleOption
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white'
                        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {getRoleIcon(roleOption)}
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {roleOption === 'student' && 'Student'}
                      {roleOption === 'faculty' && 'Faculty'}
                      {roleOption === 'admin' && 'Admin'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button 
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#b8962e] text-black py-5 rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                  />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
