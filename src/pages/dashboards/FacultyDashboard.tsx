import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  CheckSquare,
  Eye,
  Bookmark,
  LogOut,
  Database,
  Check,
  X,
  Hash,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useDashboardNav } from '../../context/DashboardNavContext';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types/project';
import {
  approveProject,
  fetchBookmarkedProjects,
  fetchPendingProjects,
  fetchProjects,
  rejectProject,
  toggleBookmark,
} from '../../services/projectService';

/* ====================== TYPE DEFINITIONS ====================== */

interface SectionCardProps {
  title: string;
  count?: number;
  children: React.ReactNode;
}

interface ProjectCardProps {
  project: Project;
  isBookmarked: boolean;
  onBookmark: () => void;
}

interface ApprovalCardProps {
  project: Project;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onPreview: (project: Project) => void;
}

type SectionKey = 'repository' | 'approval' | 'preview' | 'bookmarks';

/* ====================== MAIN COMPONENT ====================== */

export const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const { activeSection, setActiveSection } = useDashboardNav();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [repositoryProjects, setRepositoryProjects] = useState<Project[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [bookmarks, setBookmarks] = useState<Project[]>([]);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const userId = user?.id || '';
      const [repo, pending, book] = await Promise.all([
        fetchProjects({ status: 'approved' }),
        fetchPendingProjects(),
        userId ? fetchBookmarkedProjects(userId) : Promise.resolve([])
      ]);
      
      setRepositoryProjects(repo || []);
      setPendingProjects(pending || []);
      setBookmarks(book || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user?.id]);

  const matchesQuery = (p: Project, q: string) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return (
      p.title.toLowerCase().includes(needle) ||
      (p.abstract || '').toLowerCase().includes(needle) ||
      p.keywords.some((k) => k.toLowerCase().includes(needle)) ||
      (p.submission_type || '').toLowerCase().includes(needle)
    );
  };

  const filteredRepo = useMemo(() => {
    return repositoryProjects.filter((p) => {
      const matchSearch = matchesQuery(p, searchQuery);
      const matchDept = selectedDept === 'All' || p.dept === selectedDept;
      return matchSearch && matchDept;
    });
  }, [repositoryProjects, searchQuery, selectedDept]);

  const filteredPending = useMemo(() => {
    return pendingProjects.filter((p) => {
      const matchSearch = matchesQuery(p, searchQuery);
      const matchDept = selectedDept === 'All' || p.dept === selectedDept;
      return matchSearch && matchDept;
    });
  }, [pendingProjects, searchQuery, selectedDept]);

  /* ====================== RENDER LOGIC ====================== */

  const renderContent = () => {
    if (loading) return <div className="py-20 text-center text-[#C5A059] font-bold animate-pulse">Syncing...</div>;

    switch (activeSection) {
      case 'repository':
        return (
          <SectionCard title="Knowledge Repository" subtitle="Browse approved projects in the archive." count={filteredRepo.length}>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
              <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Search size={16} className="text-[#C5A059]" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles, abstracts, tags, or submission type..."
                  className="bg-transparent flex-1 outline-none text-sm"
                />
              </label>
              <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] uppercase tracking-widest text-[#C5A059] md:min-w-[200px]">
                Department
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-sm text-white outline-none"
                >
                  {['All', 'CICS', 'COE', 'CAS'].map((d) => (
                    <option key={d} value={d} className="text-black">
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-6">
              {filteredRepo.map(p => (
                <ProjectCard key={`repo-${p.id}`} project={p} isBookmarked={bookmarks.some(b => b.id === p.id)} onBookmark={() => {
                  if (user?.id) toggleBookmark(p.id, user.id).then(() => refreshData());
                }} />
              ))}
              {filteredRepo.length === 0 && <EmptyState label="No items found." />}
            </div>
          </SectionCard>
        );
      case 'approval':
        return (
          <SectionCard title="Pending Review" subtitle="Projects awaiting your evaluation and approval." count={filteredPending.length}>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
              <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Search size={16} className="text-[#C5A059]" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter queue by keyword or tag..."
                  className="bg-transparent flex-1 outline-none text-sm"
                />
              </label>
            </div>
            <div className="space-y-4">
              {filteredPending.map(p => (
                <ApprovalCard key={`pending-${p.id}`} project={p} 
                  onApprove={(id) => approveProject(id).then(refreshData)}
                  onReject={(id) => rejectProject(id).then(refreshData)}
                  onPreview={(proj) => { setPreviewProject(proj); setActiveSection('preview'); }}
                />
              ))}
              {filteredPending.length === 0 && <EmptyState label="Queue empty." />}
            </div>
          </SectionCard>
        );
      case 'preview':
        return (
          <SectionCard title="Detail View" subtitle="Full project information and metadata.">
            {previewProject ? <PreviewPanel project={previewProject} /> : <EmptyState label="Select a project." />}
          </SectionCard>
        );
      case 'bookmarks':
        return (
          <SectionCard title="Saved Items" subtitle="Your bookmarked projects for quick reference." count={bookmarks.length}>
            <div className="grid gap-6">
              {bookmarks.map(p => (
                <ProjectCard key={`book-${p.id}`} project={p} isBookmarked={true} onBookmark={() => {
                   if (user?.id) toggleBookmark(p.id, user.id).then(() => refreshData());
                }} />
              ))}
            </div>
          </SectionCard>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex text-white overflow-hidden font-sans relative selection:bg-[#C5A059]/30 bg-[#020d1d]">
      {/* Background matching StudentDashboard */}
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


      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto p-10 pt-10 no-scrollbar scroll-smooth">
          <div className="w-full max-w-full mx-auto pb-20 px-4 sm:px-6 lg:px-8">
            {statusMessage && <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-200">{statusMessage}</div>}
            {loading ? (
              <div className="rounded-[48px] border border-[#08304f]/50 bg-[#021026]/95 p-12 text-center text-slate-300">Loading projects...</div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </main>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

/* ====================== REFACTORED SUB-COMPONENTS ====================== */


const SectionCard = ({ title, subtitle, children, count }: any) => (
  <div className="relative w-full max-w-full px-4 sm:px-0">
    <div className="mb-6 text-left">
      <h2 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter leading-none text-white">{title}</h2>
      {subtitle && <p className="mt-3 text-[#C5A059]/70 max-w-3xl text-sm sm:text-base">{subtitle}</p>}
    </div>
    <div className="w-full max-w-full bg-[#000000]/80 backdrop-blur-3xl border-2 border-[#C5A059]/60 rounded-[48px] p-10 shadow-[0_0_60px_-10px_rgba(197,160,89,0.3)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.35em] text-[#C5A059]">Section Overview</p>
        </div>
        {count !== undefined && (
          <div className="rounded-3xl bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.35em] border border-white/10 text-[#C5A059]">
            Items: {count}
          </div>
        )}
      </div>
      {children}
    </div>
  </div>
);

const ProjectCard = ({ project, isBookmarked, onBookmark }: ProjectCardProps) => (
  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[48px] border border-white/10 bg-[#000000]/70 backdrop-blur-2xl p-8 shadow-xl hover:border-[#C5A059]/30 transition-all">
    <div className="flex justify-between items-start gap-4">
      <div className="overflow-hidden flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.35em] px-3 py-1 rounded-full bg-white/10 border border-white/10">
            {project.submission_type || 'project'}
          </span>
          <p className="text-xs text-slate-400">{project.dept} • {project.program} • {project.year}</p>
        </div>
        <h3 className="font-bold text-lg truncate mt-2">{project.title}</h3>
        <p className="text-sm text-slate-300 mt-3 line-clamp-2">{project.abstract}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {project.keywords.slice(0, 6).map((k) => (
            <span key={k} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#C5A059]">
              <Hash size={10} />
              {k}
            </span>
          ))}
        </div>
      </div>
      <button onClick={onBookmark} className={`p-3 rounded-lg flex-shrink-0 transition-all ${isBookmarked ? 'text-[#C5A059] bg-[#C5A059]/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
        <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
      </button>
    </div>
  </motion.div>
);

const ApprovalCard = ({ project, onApprove, onReject, onPreview }: ApprovalCardProps) => (
  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[48px] border border-[#C5A059]/30 bg-[#C5A059]/5 backdrop-blur-2xl p-8 shadow-xl hover:border-[#C5A059]/60 transition-all">
    <div className="flex justify-between items-start gap-4">
      <div className="overflow-hidden flex-1">
        <h3 className="font-bold text-lg">{project.title}</h3>
        <p className="text-xs text-[#C5A059] mt-1">By {project.author_name}</p>
        <p className="text-sm text-slate-300 mt-3 line-clamp-2">{project.abstract}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={() => onPreview(project)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
          <Eye size={16} />
        </button>
        <button onClick={() => onReject(project.id)} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
          <X size={16} />
        </button>
        <button onClick={() => onApprove(project.id)} className="px-4 py-2 bg-[#C5A059] hover:bg-[#d4af7a] text-black rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
          <Check size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

const PreviewPanel = ({ project }: { project: Project }) => (
  <div className="space-y-6">
    <div>
      <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] mb-2">{project.submission_type || 'project'}</p>
      <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
      <p className="text-slate-300 leading-relaxed">{project.abstract}</p>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest">Department</p>
        <p className="text-sm font-semibold mt-2">{project.dept}</p>
      </div>
      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest">Program</p>
        <p className="text-sm font-semibold mt-2">{project.program}</p>
      </div>
      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest">Year</p>
        <p className="text-sm font-semibold mt-2">{project.year}</p>
      </div>
      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest">Author</p>
        <p className="text-sm font-semibold mt-2 truncate">{project.author_name}</p>
      </div>
    </div>
    {!!project.contributors?.length && (
      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest mb-2">Contributors</p>
        <ul className="text-sm text-slate-200 space-y-1">
          {project.contributors.map((c) => (
            <li key={`${c.name}-${c.email}`}>
              {c.name}
              {c.email ? <span className="text-slate-500"> • {c.email}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    )}
    {!!project.attachments?.length && (
      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
        <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest">Attachments</p>
        <div className="flex flex-wrap gap-2">
          {project.attachments.map((a) => (
            <a
              key={`${a.kind}-${a.url}`}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-xs uppercase tracking-widest hover:border-[#C5A059]/50"
            >
              <ExternalLink size={14} />
              {a.kind}
            </a>
          ))}
        </div>
      </div>
    )}
    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
      <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest mb-2">Version metadata</p>
      <p className="text-sm text-slate-300">
        Group: {project.version_group_id || '—'} • Version {project.version_number ?? 1}{' '}
        {project.is_latest_version ? '(latest)' : ''}
      </p>
    </div>
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="rounded-[48px] border border-dashed border-[#08304f]/60 bg-[#021026]/95 p-16 text-center text-slate-400">
    <p className="text-sm uppercase tracking-[0.35em]">{label}</p>
  </div>
);

export default FacultyDashboard;