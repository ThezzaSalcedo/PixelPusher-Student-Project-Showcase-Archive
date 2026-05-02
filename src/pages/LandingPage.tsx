import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Upload, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; //

export const LandingPage = () => {
  const { user } = useAuth(); //

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-40 relative text-center">
      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
        className="mb-40"
      >
        <span className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12 border border-orange-500/20">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" /> Established Gateway • Philippines
        </span>
        
        <h1 className="text-6xl md:text-9xl font-black text-white tracking-tight leading-[0.9] mb-12 uppercase">
          Knowledge <span className="text-white/10">/</span> <br />
          <span className="font-serif italic font-light text-orange-100/40 normal-case">Archives.</span>
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <div className="relative w-full sm:max-w-xl group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search institutional research..."
              className="w-full pl-20 pr-8 py-8 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-orange-500/30 text-white font-medium text-lg placeholder:text-slate-600 shadow-2xl backdrop-blur-xl"
            />
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard icon={<Upload />} title="Building" type="KM Cycle I" desc="Collect & validate institutional knowledge." />
        <FeatureCard icon={<BookOpen />} title="Holding" type="KM Cycle II" desc="Preserve research in the secure vaults." />
        <FeatureCard icon={<Search />} title="Pooling" type="KM Cycle III" desc="Discovery of shared student capstones." />
        <FeatureCard icon={<Users />} title="Applying" type="KM Cycle IV" desc="Implement knowledge into societal solutions." />
      </div>
    </main>
  );
};

// Reusable Feature Card Component
const FeatureCard = ({ icon, title, type, desc }: any) => (
  <div className="p-12 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[64px] transition-all duration-700 relative overflow-hidden group hover:border-orange-400/40 hover:-translate-y-3">
    <div className="mb-12 text-orange-500 group-hover:scale-110 transition-transform duration-700">{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600/40 mb-4 block">{type}</span>
    <h3 className="text-2xl font-black mb-6 tracking-tighter text-white uppercase">{title}</h3>
    <p className="text-sm text-slate-400 font-academic leading-relaxed font-light italic">{desc}</p>
  </div>
);