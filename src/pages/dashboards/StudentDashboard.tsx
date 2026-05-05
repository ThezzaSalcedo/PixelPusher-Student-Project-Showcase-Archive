import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Database,
  ClipboardList,
  FilePlus,
  Bookmark,
  Mail,
  LogOut,
  ChevronLeft,
  Menu,
  Hash,
  Calendar,
  GraduationCap,
  MessageCircle,
  ArrowUpRight,
  Trash2,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types/project';
import {
  fetchBookmarkedProjects,
  fetchProjects,
  fetchStudentProjects,
  createProject,
  deleteProject,
  toggleBookmark,
  sendContactMessage,
  updateProject,
} from '../../services/projectService';

const SAMPLE_PROJECTS: Project[] = [ /* your original 3 sample projects */ ];

const SECTIONS = [
  { id: 'repository', label: 'Project Repository', icon: Database },
  { id: 'submissions', label: 'Project Submissions', icon: ClipboardList },
  { id: 'form', label: 'Submission Form', icon: FilePlus },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { id: 'contact', label: 'Contact', icon: Mail },
] as const;

type SectionKey = (typeof SECTIONS)[number]['id'];

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('repository');
  const [repositoryProjects, setRepositoryProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [submissions, setSubmissions] = useState<Project[]>([]);
  const [bookmarks, setBookmarks] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [formState, setFormState] = useState({
    title: '',
    abstract: '',
    dept: 'CICS',
    program: 'BSIT',
    year: '2026',
    keywords: '',
    tech_stack: '',
    lessons_learned: '',
  });
  const [contactProjectId, setContactProjectId] = useState<number | null>(null);
  const [contactMessage, setContactMessage] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const refreshData = async () => {
    if (!user?.id) return;
    setLoading(true);
    const [repo, subs, book] = await Promise.all([
      fetchProjects({ status: 'approved' }),
      fetchStudentProjects(user.id),
      fetchBookmarkedProjects(user.id),
    ]);
    setRepositoryProjects(repo || SAMPLE_PROJECTS);
    setSubmissions(subs || []);
    setBookmarks(book || []);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [user?.id]);

  const filteredRepository = useMemo(() => {
    return repositoryProjects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDept = selectedDept === 'All' || project.dept === selectedDept;
      const matchesYear = selectedYear === 'All' || project.year === selectedYear;
      const matchesProgram = selectedProgram === 'All' || project.program === selectedProgram;
      return matchesSearch && matchesDept && matchesYear && matchesProgram;
    });
  }, [repositoryProjects, searchQuery, selectedDept, selectedYear, selectedProgram]);

  const handleSubmitProject = async (event: React.FormEvent<HTMLFormElement>) => {
    // ... your original function (unchanged)
  };

  const handleDeleteSubmission = async (projectId: number) => {
    // ... your original function (unchanged)
  };

  const handleToggleBookmark = async (projectId: number) => {
    // ... your original function (unchanged)
  };

  const handleSendContact = async (event: React.FormEvent<HTMLFormElement>) => {
    // ... your original function (unchanged)
  };

  const activeLabel = SECTIONS.find((item) => item.id === activeSection)?.label || 'Dashboard';

  return (
    <div className="min-h-screen flex text-white overflow-hidden font-sans relative selection:bg-[#C5A059]/30 bg-[#020d1d]">
      {/* Background matching LandingPage */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(1,9,26,0.82), rgba(2,21,47,0.96)),
            radial-gradient(circle at top left, rgba(197,160,89,0.12), transparent 24%),
            radial-gradient(circle at bottom right, rgba(88,136,255,0.08), transparent 22%),
            url('/images/333.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.12,
        }}
      />

      {/* Sidebar */}
      <motion.aside 
        animate={{ width: isCollapsed ? 88 : 300 }} 
        className="relative border-r border-[#08304f]/50 bg-[#071628]/95 backdrop-blur-3xl flex flex-col z-50 shadow-2xl"
      >
        <button onClick={() => setIsCollapsed((value) => !value)} className="absolute -right-3 top-12 bg-[#C5A059] text-black rounded-full p-1.5 border border-white/20 hover:bg-[#d4af7a] shadow-lg z-[60]">
          {isCollapsed ? <Menu size={12} /> : <ChevronLeft size={12} />}
        </button>

        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-amber-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#C5A059]/30">
            <span className="font-black text-sm">N</span>
          </div>
          {!isCollapsed && <span className="font-black text-xl tracking-tighter">NEU Archive</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar scroll-smooth">
          {SECTIONS.map((section) => (
            <NavItem
              key={section.id}
              icon={<section.icon size={20} />}
              label={section.label}
              active={activeSection === section.id}
              collapsed={isCollapsed}
              onClick={() => setActiveSection(section.id)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto space-y-4">
          <div className="rounded-3xl border border-[#C5A059]/20 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0f1c32] border border-[#C5A059]/20 flex items-center justify-center text-sm font-bold text-white uppercase">
                {user?.displayName?.split(' ').map((word: any[]) => word[0]).join('').slice(0, 2) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user?.displayName || 'Account'}</p>
                <p className="text-xs uppercase text-[#C5A059] tracking-widest">{user?.role || 'Unknown Role'}</p>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:text-red-400 transition-all group">
            <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto p-10 pt-10 no-scrollbar scroll-smooth">
          <div className="w-full max-w-full mx-auto pb-20 px-4 sm:px-6 lg:px-8">
            {statusMessage && <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-200">{statusMessage}</div>}
            {loading ? (
              <div className="rounded-[48px] border border-[#08304f]/50 bg-[#021026]/95 p-12 text-center text-slate-300">Loading projects...</div>
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
    switch (activeSection) {
      case 'repository':
        return (
          <SectionCard title="Project Repository" subtitle="Browse approved student projects in the archive." count={filteredRepository.length}>
            <div className="grid gap-6">
              {filteredRepository.length === 0 ? (
                <EmptyState label="No repository items match your filters." />
              ) : (
                filteredRepository.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onBookmark={() => handleToggleBookmark(project.id)}
                    highlight
                  />
                ))
              )}
            </div>
          </SectionCard>
        );
      case 'submissions':
        return (
          <SectionCard title="Your Submissions" subtitle="Edit or delete your pending and draft projects." count={submissions.length}>
            <div className="space-y-6">
              {submissions.length === 0 ? (
                <EmptyState label="No project submissions yet. Use the form to add a new project." />
              ) : (
                submissions.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    statusLabel={project.status}
                    onDelete={() => handleDeleteSubmission(project.id)}
                    onBookmark={() => handleToggleBookmark(project.id)}
                    actionLabel="Edit"
                    onAction={() => setActiveSection('form')}
                  />
                ))
              )}
            </div>
          </SectionCard>
        );
      case 'form':
        return (
          <SectionCard title="Project Submission Form" subtitle="Submit a project draft for review and approval." count={0}>
            <form onSubmit={handleSubmitProject} className="space-y-8 rounded-[48px] bg-[#021026]/95 backdrop-blur-3xl border border-[#08304f]/50 p-10">
              {/* Your original form content here - unchanged */}
            </form>
          </SectionCard>
        );
      case 'bookmarks':
        return (
          <SectionCard title="Bookmarks" subtitle="Saved projects for later reference." count={bookmarks.length}>
            {bookmarks.length === 0 ? (
              <EmptyState label="Bookmark projects from the repository to save them here." />
            ) : (
              <div className="grid gap-6">
                {bookmarks.map((project) => (
                  <ProjectCard key={project.id} project={project} onBookmark={() => handleToggleBookmark(project.id)} bookmarked />
                ))}
              </div>
            )}
          </SectionCard>
        );
      case 'contact':
        return (
          <SectionCard title="Contact Portal" subtitle="Send a message to the project author." count={0}>
            {/* Your original contact form */}
          </SectionCard>
        );
      default:
        return null;
    }
  }
};

/* ====================== UPDATED UI COMPONENTS ====================== */

const SectionCard = ({ title, subtitle, children, count }: any) => (
  <div className="relative w-full max-w-full px-4 sm:px-0">
    <div className="mb-6 text-left">
      <h2 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter leading-none text-white">{title}</h2>
      <p className="mt-3 text-[#C5A059]/70 max-w-3xl text-sm sm:text-base">{subtitle}</p>
    </div>
    <div className="w-full max-w-full bg-[#000000]/80 backdrop-blur-3xl border-2 border-[#C5A059]/60 rounded-[48px] p-10 shadow-[0_0_60px_-10px_rgba(197,160,89,0.3)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.35em] text-[#C5A059]">Section Overview</p>
        </div>
        <div className="rounded-3xl bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.35em] border border-white/10 text-[#C5A059]">
          Items: {count}
        </div>
      </div>
      {children}
    </div>
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="rounded-[48px] border border-dashed border-[#08304f]/60 bg-[#021026]/95 p-16 text-center text-slate-400">
    <p className="text-sm uppercase tracking-[0.35em]">{label}</p>
  </div>
);

const ProjectCard = ({ project, onBookmark, onDelete, onAction, actionLabel, bookmarked = false, statusLabel, highlight }: any) => (
  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[48px] border border-white/10 bg-[#000000]/70 backdrop-blur-2xl p-8 shadow-xl">
    {/* Your original ProjectCard content here - unchanged */}
    {/* Paste your full original ProjectCard JSX */}
  </motion.div>
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

export default StudentDashboard;