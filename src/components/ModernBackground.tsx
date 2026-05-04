import { motion } from 'motion/react';

const LOGIN_BG_URL = "https://drive.google.com/uc?export=view&id=1So_ECca4DzYJPStZuXkBU5Bcqn5BDfaS";

export const ModernBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-[#010208]">
    <div 
      className="absolute inset-0 bg-cover opacity-[0.15] mix-blend-screen saturate-0"
      style={{ backgroundImage: `url(${LOGIN_BG_URL})` }}
    />
    <motion.div 
      animate={{ scale: [1, 1.4, 1], x: [0, 50, 0] }} 
      transition={{ duration: 25, repeat: Infinity }} 
      className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-orange-500/[0.08] blur-[140px] rounded-full" 
    />
    <div 
      className="absolute inset-0 opacity-[0.05]" 
      style={{ backgroundImage: `linear-gradient(rgba(251, 191, 36, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 191, 36, 0.1) 1px, transparent 1px)`, backgroundSize: '100px 100px' }} 
    />
  </div>
);