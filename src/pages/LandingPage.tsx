import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  const getDashboardRoute = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'student':
        return '/dashboards/student';
      case 'faculty':
        return '/dashboards/faculty';
      case 'admin':
        return '/dashboards/admin';
      default:
        return '/';
    }
  };

  if (user) return <Navigate to={getDashboardRoute(user.role)} replace />;

  return (
    <div className="min-h-screen bg-[#0B1C2C] text-white font-serif relative overflow-hidden">

      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/333.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1C2C]/40 via-[#0B1C2C]/75 to-[#0B1C2C] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_60%,_#0B1C2C_100%)] z-0" />

      <main className="relative z-10">

        {/* 🎯 HERO */}
        <section className="text-center py-28 px-6">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-8xl font-bold text-[#C5A059] tracking-wide"
          >
            KNOWLEDGE
          </motion.h1>

          <p className="text-3xl md:text-5xl italic text-white mt-4 mb-10">
            / ARCHIVES
          </p>

          <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            A centralized institutional platform for preserving, accessing, and 
            managing academic knowledge within New Era University.
          </p>

        </section>

        {/* 🔥 SYSTEM ACTIONS */}
        <section className="max-w-6xl mx-auto px-6 pb-24">

          <p className="text-center text-[#C5A059] text-xs tracking-[0.4em] mb-12 font-bold">
            SYSTEM ACCESS
          </p>

          <div className="grid md:grid-cols-3 gap-6">

            <ActionCard 
              title="REPOSITORY"
              desc="Browse and explore approved academic projects and research outputs."
            />

            <ActionCard 
              title="FACULTY REVIEW"
              desc="Evaluate submissions and manage approval workflows efficiently."
            />

            <ActionCard 
              title="KNOWLEDGE ACCESS"
              desc="Retrieve archived materials and institutional research assets."
            />

          </div>

        </section>

        {/* 🏛️ ABOUT */}
        <section className="max-w-5xl mx-auto px-6 pb-28 text-center">

          <div className="bg-white/10 backdrop-blur-xl border border-[#C5A059]/30 rounded-3xl p-12">

            <h2 className="text-3xl md:text-4xl font-bold text-[#C5A059] mb-6 tracking-wide">
              INSTITUTIONAL KNOWLEDGE HUB
            </h2>

            <p className="text-gray-300 leading-relaxed text-sm md:text-base max-w-3xl mx-auto">
              The NEU Archive is designed to serve as a structured repository for 
              academic outputs, enabling students and faculty to preserve knowledge, 
              collaborate effectively, and access valuable research across disciplines.
            </p>

          </div>

        </section>

      </main>
    </div>
  );
};

const ActionCard = ({ title, desc }: any) => (
  <motion.div 
    whileHover={{ y: -6 }}
    className="bg-[#0f1f33]/60 backdrop-blur-xl border border-[#C5A059]/30 
               rounded-2xl p-10 text-center 
               hover:border-[#C5A059] transition-all duration-300"
  >
    <h3 className="text-[#C5A059] font-bold mb-4 tracking-[0.2em] text-sm">
      {title}
    </h3>
    <p className="text-gray-300 text-sm leading-relaxed">
      {desc}
    </p>
  </motion.div>
);