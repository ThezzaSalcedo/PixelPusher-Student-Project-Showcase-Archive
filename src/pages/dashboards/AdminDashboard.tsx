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
import { motion } from 'motion/react';
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
  {
    id: 2,
    title: 'Hydro-Sense: IoT Fluid Monitoring System',
    abstract: 'An IoT project for remote fluid level detection in campus facilities.',
    author_id: 'author-2',
    author_name: 'Engineering Team A',
    author_contact: 'eng-team@neu.edu.ph',
    dept: 'COE',
    program: 'BSCE',
    year: '2025',
    status: 'pending',
    keywords: ['IoT', 'Hardware', 'Arduino'],
    tech_stack: ['Arduino', 'Sensors'],
    lessons_learned: 'Sensor calibration and power optimization matter most for field deployments.',
    created_at: new Date().toISOString(),
    bookmarked: false,
  },
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
    <div className="flex h-screen bg-[#010208] text-white overflow-hidden font-sans">
      <motion.aside animate={{ width: isCollapsed ? 88 : 310 }} className="relative border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl flex flex-col z-50 shadow-2xl transition-all duration-300">
        <button onClick={() => setIsCollapsed((value) => !value)} className="absolute -right-3 top-12 bg-orange-600 rounded-full p-1.5 border border-white/10 hover:bg-orange-500 shadow-lg z-[60]">
          {isCollapsed ? <Menu size={12} /> : <ChevronLeft size={12} />}
        </button>

        <div className={`p-8 flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20"><span className="font-black text-sm">N</span></div>
          {!isCollapsed && <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap">NEU Archive</span>}
        </div>

        <div className={`mx-4 p-4 rounded-[32px] bg-white/[0.03] border border-white/5 mb-6 ${isCollapsed ? 'flex justify-center px-0 bg-transparent border-none' : ''}`}>
          <div className="flex items-center gap-4">
            <img src={user?.photo} alt="P" className="w-10 h-10 rounded-xl border border-white/10 shrink-0 object-cover" />
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="font-black text-[10px] uppercase truncate tracking-wider">{user?.displayName}</p>
                <p className="text-[8px] font-black text-orange-500 uppercase italic tracking-widest">{user?.role}</p>
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

        <div className="p-4 border-t border-white/5 mt-auto">
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-4 rounded-2xl text-slate-500 hover:text-red-400 transition-all group`}>
            <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-10 pb-6 bg-gradient-to-b from-[#010208] via-[#010208] to-transparent z-40">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-5xl font-black uppercase tracking-tighter">Admin <span className="text-orange-500 italic">Control.</span></h1>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">{activeLabel}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoChip icon={<Activity size={18} />} label="Projects" value={`${repositoryProjects.length}`} />
                <InfoChip icon={<TrendingUp size={18} />} label="Pending" value={`${pendingProjects.length}`} />
                <InfoChip icon={<ShieldAlert size={18} />} label="Users" value={`${users.length}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 pt-0 no-scrollbar scroll-smooth">
          <div className="max-w-6xl mx-auto pb-20">
            {statusMessage && <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-4 text-sm text-emerald-200">{statusMessage}</div>}
            {loading ? (
              <div className="rounded-[32px] border border-white/10 bg-slate-950/60 p-12 text-center text-slate-400">Loading admin data...</div>
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
          <SectionCard title="Project Repository" subtitle="All projects currently stored in the archive." count={filteredRepository.length}>
            {filteredRepository.length === 0 ? (
              <EmptyState label="No projects found." />
            ) : (
              <div className="grid gap-6">
                {filteredRepository.map((project) => (
                  <ProjectCard key={project.id} project={project} onBookmark={() => handleBookmark(project.id)} bookmarked={bookmarks.some((item) => item.id === project.id)} onAction={() => handleChoosePreview(project)} actionLabel="Preview" />
                ))}
              </div>
            )}
          </SectionCard>
        );
      case 'approval':
        return (
          <SectionCard title="Approval Queue" subtitle="Review pending or submitted projects before approval." count={pendingProjects.length}>
            {pendingProjects.length === 0 ? (
              <EmptyState label="No pending projects at this time." />
            ) : (
              <div className="space-y-6">
                {pendingProjects.map((project) => (
                  <ApprovalCard key={project.id} project={project} onApprove={() => handleApprove(project.id)} onReject={() => handleReject(project.id)} onPreview={() => handleChoosePreview(project)} />
                ))}
              </div>
            )}
          </SectionCard>
        );
      case 'preview':
        return previewProject ? (
          <SectionCard title="Project Preview" subtitle="Inspect details before approving or updating metadata." count={1}>
            <PreviewPane project={previewProject} />
          </SectionCard>
        ) : (
          <SectionCard title="Project Preview" subtitle="Choose a project from the repository or approval queue." count={0}>
            <EmptyState label="Select a project to preview details." />
          </SectionCard>
        );
      case 'admin':
        return (
          <SectionCard title="Admin Panel" subtitle="Core governance controls for taxonomy and system health." count={0}>
            <div className="grid gap-6 lg:grid-cols-2">
              <MetricCard icon={<ShieldCheck size={18} />} label="Taxonomy" value="Manage tags and categories" />
              <MetricCard icon={<MessageCircle size={18} />} label="Moderation" value="Edit or remove any entry" />
              <MetricCard icon={<TrendingUp size={18} />} label="Analytics" value="Insights for departmental memory" />
              <MetricCard icon={<Activity size={18} />} label="Audit" value="Track recent admin actions" />
            </div>
          </SectionCard>
        );
      case 'audit':
        return (
          <SectionCard title="Audit Trail" subtitle="View system events and governance activity." count={auditLogs.length}>
            {auditLogs.length === 0 ? (
              <EmptyState label="No audit entries yet." />
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <AuditCard key={log.id} log={log} />
                ))}
              </div>
            )}
          </SectionCard>
        );
      case 'users':
        return (
          <SectionCard title="User Management" subtitle="Assign roles and manage access." count={users.length}>
            {users.length === 0 ? (
              <EmptyState label="No users to manage." />
            ) : (
              <div className="space-y-4">
                {users.map((appUser) => (
                  <UserRow key={appUser.id} user={appUser} onChangeRole={(newRole) => handleRoleChange(appUser.id, newRole)} />
                ))}
              </div>
            )}
          </SectionCard>
        );
      case 'report':
        return (
          <SectionCard title="Reports" subtitle="Institutional memory metrics and summary insights." count={0}>
            <div className="grid gap-6 lg:grid-cols-3">
              <ReportTile title="Departments" value="CICS, COE, CAS" />
              <ReportTile title="Top Stack" value="React, Supabase, AI" />
              <ReportTile title="Approval Rate" value="82%" />
            </div>
          </SectionCard>
        );
      case 'bookmarks':
        return (
          <SectionCard title="Bookmarks" subtitle="Admin saved items for oversight." count={bookmarks.length}>
            {bookmarks.length === 0 ? (
              <EmptyState label="No bookmarked items currently." />
            ) : (
              <div className="grid gap-6">
                {bookmarks.map((project) => (
                  <ProjectCard key={project.id} project={project} onBookmark={() => handleBookmark(project.id)} bookmarked />
                ))}
              </div>
            )}
          </SectionCard>
        );
      default:
        return null;
    }
  }
};

const SectionCard = ({ title, subtitle, children, count }: { title: string; subtitle: string; children: React.ReactNode; count: number; }) => (
  <div className="space-y-6 rounded-[32px] border border-white/10 bg-slate-950/50 p-8 shadow-2xl">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tighter">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="rounded-3xl bg-white/5 px-5 py-3 text-sm uppercase tracking-[0.35em] text-slate-300">Items: {count}</div>
    </div>
    {children}
  </div>
);

const InfoChip = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-3 rounded-3xl bg-white/5 border border-white/5 px-5 py-4 text-sm text-slate-300">
    <div className="rounded-3xl bg-orange-500/10 p-3 text-orange-300">{icon}</div>
    <div>
      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="rounded-[32px] border border-dashed border-white/10 bg-slate-950/40 p-16 text-center text-slate-500">
    <p className="text-sm uppercase tracking-[0.35em]">{label}</p>
  </div>
);

const ApprovalCard = ({ project, onApprove, onReject, onPreview }: any) => (
  <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/10 bg-slate-950/40 p-8 shadow-xl">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-orange-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-orange-300">{project.dept}</span>
          <span className="rounded-full bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">{project.program}</span>
          <span className="rounded-full bg-slate-900/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-300">Pending Review</span>
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tight text-white">{project.title}</h3>
        <p className="text-sm leading-relaxed text-slate-400">{project.abstract || 'No abstract provided.'}</p>
      </div>
      <div className="flex flex-col gap-3 min-w-[220px]">
        <button onClick={onPreview} className="rounded-3xl bg-white/10 px-5 py-4 text-sm uppercase tracking-[0.35em] text-white hover:bg-white/20">Preview</button>
        <button onClick={onApprove} className="rounded-3xl bg-emerald-500 px-5 py-4 text-sm font-black uppercase tracking-[0.35em] text-slate-950 hover:bg-emerald-400">Approve</button>
        <button onClick={onReject} className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm uppercase tracking-[0.35em] text-red-300 hover:bg-red-500/20">Reject</button>
      </div>
    </div>
  </motion.div>
);

const PreviewPane = ({ project }: { project: Project }) => (
  <div className="rounded-[32px] border border-white/10 bg-slate-950/40 p-10 shadow-xl">
    <div className="mb-8 flex flex-wrap items-center gap-3 text-slate-400">
      <span className="rounded-full bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em]">Author: {project.author_name}</span>
      <span className="rounded-full bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em]">Dept: {project.dept}</span>
      <span className="rounded-full bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em]">Year: {project.year}</span>
    </div>
    <div className="space-y-6">
      <div>
        <h3 className="text-4xl font-black uppercase tracking-tight text-white">{project.title}</h3>
        <p className="mt-4 text-slate-400 leading-relaxed">{project.abstract}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[28px] bg-slate-900/70 p-6">
          <h4 className="text-sm uppercase tracking-[0.35em] text-slate-500">Lessons Learned</h4>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{project.lessons_learned || 'Not provided yet.'}</p>
        </div>
        <div className="rounded-[28px] bg-slate-900/70 p-6">
          <h4 className="text-sm uppercase tracking-[0.35em] text-slate-500">Tech Stack</h4>
          <div className="mt-4 flex flex-wrap gap-2">
            {(project.tech_stack || []).map((item) => (
              <span key={item} className="rounded-full bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-slate-300">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UserRow = ({ user, onChangeRole }: any) => (
  <div className="flex flex-col gap-3 rounded-[32px] border border-white/10 bg-slate-950/40 p-6 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h3 className="text-lg font-black uppercase tracking-tight text-white">{user.displayName}</h3>
      <p className="text-sm text-slate-400">{user.email}</p>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
      <div className="rounded-3xl bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.35em] text-slate-300">Current: {user.role}</div>
      <select value={user.role} onChange={(event) => onChangeRole(event.target.value)} className="rounded-3xl bg-slate-900/90 border border-white/10 px-4 py-3 text-sm text-white outline-none">
        <option value="student">student</option>
        <option value="faculty">faculty</option>
        <option value="admin">admin</option>
      </select>
    </div>
  </div>
);

const AuditCard = ({ log }: { log: AuditLog }) => (
  <div className="rounded-[32px] border border-white/10 bg-slate-950/40 p-6">
    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-sm">
      <span>{new Date(log.timestamp).toLocaleString()}</span>
      <span className="text-slate-500">•</span>
      <span>{log.actor}</span>
    </div>
    <h3 className="mt-4 text-lg font-black uppercase tracking-tight text-white">{log.action}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-400">{log.details}</p>
  </div>
);

const MetricCard = ({ icon, label, value }: any) => (
  <div className="rounded-[32px] border border-white/10 bg-slate-950/40 p-8 text-center">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-orange-300">{icon}</div>
    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{label}</p>
    <p className="mt-6 text-3xl font-black text-white">{value}</p>
  </div>
);

const ReportTile = ({ title, value }: any) => (
  <div className="rounded-[32px] border border-white/10 bg-slate-950/40 p-8 text-center">
    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{title}</p>
    <p className="mt-6 text-3xl font-black text-white">{value}</p>
  </div>
);

const ProjectCard = ({ project, onBookmark, bookmarked = false, onAction, actionLabel }: any) => (
  <motion.div layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/10 bg-slate-950/40 p-8 shadow-xl">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-orange-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-orange-300">{project.dept}</span>
          <span className="rounded-full bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">{project.program}</span>
          <span className="rounded-full bg-slate-900/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-300">{project.status}</span>
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tight text-white">{project.title}</h3>
        <p className="text-sm leading-relaxed text-slate-400">{project.abstract || 'No abstract provided.'}</p>
      </div>
      <div className="flex flex-col gap-3 min-w-[200px]">
        <button onClick={onBookmark} className="rounded-3xl bg-white/5 px-5 py-4 text-left text-sm uppercase tracking-[0.35em] text-slate-200 hover:bg-white/10">{bookmarked ? 'Remove Bookmark' : 'Bookmark'}</button>
        {onAction && actionLabel && <button onClick={onAction} className="rounded-3xl bg-orange-500 px-5 py-4 text-sm font-black uppercase tracking-[0.35em] text-slate-950 hover:bg-orange-400">{actionLabel}</button>}
      </div>
    </div>
  </motion.div>
);

const NavItem = ({ icon, label, active = false, collapsed, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-5 px-5'} py-4 rounded-2xl transition-all group relative border border-transparent ${active ? 'bg-orange-500/10 text-orange-400 border-orange-500/10' : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'}`}>
    <div className="shrink-0">{icon}</div>
    {!collapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{label}</span>}
  </button>
);