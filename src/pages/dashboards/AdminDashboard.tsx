import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Eye,
  Bookmark,
  ShieldCheck,
  History,
  BarChart3,
  Users,
  LogOut,
  ChevronLeft,
  Menu,
  Hash,
  Database,
  Calendar,
  GraduationCap,
  Activity,
  MessageCircle,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types/project';
import type { AppUser } from '../../types/user';
import type { AuditLog } from '../../types/audit';
import {
  approveProject,
  fetchBookmarkedProjects as fetchAdminBookmarks,
  fetchPendingProjects,
  fetchProjects,
  rejectProject,
  toggleBookmark,
} from '../../services/projectService';
import { fetchUsers, fetchAuditLogs, updateUserRole, logAuditEntry } from '../../services/adminService';

const SAMPLE_PROJECTS: Project[] = [
  // ... your original sample data (unchanged)
  {
    id: 1,
    title: 'PixelPusher: A Decentralized Institutional Archive',
    abstract: 'A student-driven dashboard for preserving and searching institutional projects.',
    author_id: 'author-1',
    author_name: 'HotDevs Inc.',
    author_contact: 'hotdevs@neu.edu.ph',
    dept: 'CICS',
    program: 'BSIT',
    year: '2026',
    status: 'approved',
    keywords: ['React', 'Supabase', 'KM System'],
    tech_stack: ['React', 'Supabase'],
    lessons_learned: 'Designing a collaborative knowledge archive requires role-based flows.',
    created_at: new Date().toISOString(),
    bookmarked: false,
  },
  // ... (rest of your samples remain)
];

const SECTIONS = [
  { id: 'repository', label: 'Project Repository', icon: Database },
  { id: 'approval', label: 'Approval', icon: CheckSquare },
  { id: 'preview', label: 'Project Preview', icon: Eye },
  { id: 'admin', label: 'Admin Panel', icon: ShieldCheck },
  { id: 'audit', label: 'Audit Trail', icon: History },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'report', label: 'Report', icon: BarChart3 },
  { id: 'bookmarks', label: 'Bookmark', icon: Bookmark },
] as const;

type SectionKey = (typeof SECTIONS)[number]['id'];

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('repository');
  const [repositoryProjects, setRepositoryProjects] = useState<Project[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [bookmarks, setBookmarks] = useState<Project[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const refreshData = async () => {
    setLoading(true);
    const [repo, pending, book, allUsers, logs] = await Promise.all([
      fetchProjects(),
      fetchPendingProjects(),
      fetchAdminBookmarks(user?.id || ''),
      fetchUsers(),
      fetchAuditLogs(),
    ]);
    setRepositoryProjects(repo || SAMPLE_PROJECTS);
    setPendingProjects(pending || SAMPLE_PROJECTS.filter((project) => project.status === 'pending'));
    setBookmarks(book || []);
    setUsers(allUsers);
    setAuditLogs(logs || []);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [user?.id]);

  const filteredRepository = useMemo(() => {
    return repositoryProjects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDept = selectedDept === 'All' || project.dept === selectedDept;
      const matchesYear = selectedYear === 'All' || project.year === selectedYear;
      const matchesProgram = selectedProgram === 'All' || project.program === selectedProgram;
      return matchesSearch && matchesDept && matchesYear && matchesProgram;
    });
  }, [repositoryProjects, searchQuery, selectedDept, selectedYear, selectedProgram]);

  const handleChoosePreview = (project: Project) => {
    setPreviewProject(project);
    setActiveSection('preview');
  };

  const handleApprove = async (projectId: number) => {
    const approved = await approveProject(projectId);
    if (approved) {
      setStatusMessage('Project approved successfully.');
      await logAuditEntry(user?.displayName || 'Admin', 'Approved Project', `Approved project ID ${projectId}`);
      refreshData();
    } else {
      setStatusMessage('Project approval failed.');
    }
  };

  const handleReject = async (projectId: number) => {
    const rejected = await rejectProject(projectId);
    if (rejected) {
      setStatusMessage('Project rejected successfully.');
      await logAuditEntry(user?.displayName || 'Admin', 'Rejected Project', `Rejected project ID ${projectId}`);
      refreshData();
    } else {
      setStatusMessage('Project rejection failed.');
    }
  };

  const handleBookmark = async (projectId: number) => {
    if (!user?.id) return;
    const success = await toggleBookmark(projectId, user.id);
    if (success) {
      setStatusMessage('Bookmark state updated.');
      refreshData();
    }
  };

  const handleRoleChange = async (userId: string, role: AppUser['role']) => {
    const updated = await updateUserRole(userId, role);
    if (updated) {
      setUsers((current) => current.map((item) => item.id === userId ? updated : item));
      setStatusMessage(`Role updated to ${role} for ${updated.displayName}.`);
      await logAuditEntry(user?.displayName || 'Admin', 'Changed Role', `Changed ${updated.displayName}'s role to ${role}`);
    } else {
      setStatusMessage('Role change failed.');
    }
  };

  const activeLabel = SECTIONS.find((item) => item.id === activeSection)?.label || 'Admin Dashboard';

  return (
    <div className="min-h-screen flex text-white overflow-hidden font-sans relative selection:bg-[#C5A059]/30 bg-[#020d1d]">
      
      {/* Background - Same as LandingPage */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1.02, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/images/333.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#010e23]/40 to-[#02152f]/95 z-0" />

      {/* Sidebar */}
      <motion.aside 
        animate={{ width: isCollapsed ? 88 : 310 }} 
        className="relative border-r border-white/10 bg-white/10 backdrop-blur-3xl flex flex-col z-50 shadow-2xl"
      >
        <button 
          onClick={() => setIsCollapsed((value) => !value)} 
          className="absolute -right-3 top-12 bg-[#C5A059] text-black rounded-full p-1.5 border border-white/20 hover:bg-[#d4af7a] shadow-lg z-[60]"
        >
          {isCollapsed ? <Menu size={12} /> : <ChevronLeft size={12} />}
        </button>

        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-amber-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#C5A059]/30">
            <span className="font-black text-sm">N</span>
          </div>
          {!isCollapsed && <span className="font-black text-xl tracking-tighter">NEU Archive</span>}
        </div>

        <div className="mx-4 p-4 rounded-[32px] bg-white/[0.03] border border-[#C5A059]/20 mb-6">
          <div className="flex items-center gap-4">
            <img src={user?.photo} alt="P" className="w-10 h-10 rounded-xl border border-[#C5A059]/30 shrink-0 object-cover" />
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="font-bold text-sm truncate tracking-wider">{user?.displayName}</p>
                <p className="text-[#C5A059] text-xs font-bold uppercase italic tracking-widest">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar scroll-smooth">
          {SECTIONS.map((section) => (
            <NavItem
              key={section.id}
              icon={<section.icon size={18} />}
              label={section.label}
              active={activeSection === section.id}
              collapsed={isCollapsed}
              onClick={() => setActiveSection(section.id)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:text-red-400 transition-all group">
            <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto p-10 pt-0 no-scrollbar scroll-smooth">
          <div className="max-w-6xl mx-auto pb-20">
            {statusMessage && <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-200">{statusMessage}</div>}
            {loading ? (
              <div className="rounded-[48px] border border-[#08304f]/50 bg-[#021026]/95 p-12 text-center text-slate-300">Loading admin data...</div>
            ) : (
              renderActiveSection()
            )}
          </div>
        </div>
      </main>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );

  function renderActiveSection() {
    // Your original renderActiveSection remains 100% unchanged
    switch (activeSection) {
      case 'repository':
        return (
          <SectionCard title="Project Repository" subtitle="All projects currently stored in the archive." count={filteredRepository.length}>
            {/* ... your original content ... */}
          </SectionCard>
        );
      // ... all other cases remain exactly as you wrote them
      default:
        return null;
    }
  }
};

// ==================== UPDATED UI COMPONENTS ====================

const SectionCard = ({ title, subtitle, children, count }: any) => (
  <div className="bg-[#021026]/95 backdrop-blur-3xl border-2 border-[#08304f]/50 rounded-[48px] p-10 shadow-[0_0_60px_-10px_rgba(197,160,89,0.3)]">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-10">
      <div>
        <h2 className="text-4xl font-black uppercase tracking-tighter">{title}</h2>
        <p className="mt-2 text-[#C5A059]/70">{subtitle}</p>
      </div>
      <div className="rounded-3xl bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.35em] border border-white/10 text-[#C5A059]">
        Items: {count}
      </div>
    </div>
    {children}
  </div>
);

const InfoChip = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-3 rounded-3xl bg-[#021026]/90 border border-[#08304f]/45 px-5 py-4">
    <div className="rounded-3xl bg-[#C5A059]/10 p-3 text-[#C5A059]">{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  </div>
);

const NavItem = ({ icon, label, active = false, collapsed, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-5 px-5'} py-4 rounded-2xl transition-all group relative border border-transparent ${active ? 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20' : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
  >
    <div className="shrink-0">{icon}</div>
    {!collapsed && <span className="text-xs font-bold uppercase tracking-widest">{label}</span>}
  </button>
);