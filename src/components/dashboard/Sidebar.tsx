/* src/components/dashboard/Sidebar.tsx */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  Menu,
  ChevronLeft,
  Database,
  CheckSquare,
  Eye,
  Bookmark,
  History,
  User,
  ClipboardList,
  FilePlus,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDashboardNav } from '../../context/DashboardNavContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { activeSection, setActiveSection } = useDashboardNav();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = user?.role === 'admin'
    ? [{ id: 'audit', label: 'Audit Trail', icon: History }]
    : user?.role === 'faculty'
      ? [
          { id: 'repository', label: 'Project Repository', icon: Database },
          { id: 'approval', label: 'Review Queue', icon: CheckSquare },
          { id: 'preview', label: 'Project Preview', icon: Eye },
          { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
        ]
      : [
          { id: 'repository', label: 'Project Repository', icon: Database },
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'project', label: 'Project', icon: Database },
          { id: 'submissions', label: 'Project Submission', icon: ClipboardList },
          { id: 'form', label: 'Submission Form', icon: FilePlus },
          { id: 'contact', label: 'Contact', icon: Mail },
        ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 88 : 310 }}
      className="h-screen sticky top-0 border-r border-white/10 bg-[#071628]/95 backdrop-blur-3xl flex flex-col z-50 shrink-0"
    >
      {/* BRANDING SECTION - Static */}
      <div className="p-8 shrink-0 flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-amber-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#C5A059]/30">
          <span className="font-black text-sm text-white">N</span>
        </div>
        {!isCollapsed && <span className="font-black text-xl tracking-tighter">NEU Archive</span>}
      </div>

      {/* NAVIGATION SECTION - Scrollable only if list is long[cite: 3] */}
      {navItems.length > 0 && (
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl transition-all ${activeSection === item.id ? 'bg-white/[0.08] text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
            >
              <item.icon size={20} />
              {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>
      )}

      {/* FOOTER SECTION - Pinned to bottom, always visible[cite: 3] */}
      <div className="p-4 border-t border-white/10 shrink-0 bg-transparent">
        <div className="mb-4 p-4 rounded-3xl bg-white/[0.03] border border-[#C5A059]/20">
          <div className="flex items-center gap-3">
            <img src={user?.photo} className="w-10 h-10 rounded-xl object-cover shrink-0" alt="Profile" />
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{user?.displayName}</p>
                <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-widest italic">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={async () => { await logout(); navigate('/'); }}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:text-red-400 transition-all group"
        >
          <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};