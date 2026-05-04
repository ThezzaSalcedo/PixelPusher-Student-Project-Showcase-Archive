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
import { motion, AnimatePresence } from 'motion/react';
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
  {
    id: 3,
    title: 'Lexicon: AI-Driven Legal Document Analyzer',
    abstract: 'A machine learning solution for summarizing legal filings and identifying key clauses.',
    author_id: 'author-3',
    author_name: 'Vanguard Devs',
    author_contact: 'vanguard@neu.edu.ph',
    dept: 'CAS',
    program: 'BSCS',
    year: '2026',
    status: 'approved',
    keywords: ['AI', 'NLP', 'Python'],
    tech_stack: ['Python', 'NLP'],
    lessons_learned: 'Ethical design improves trust in AI systems for academic workflows.',
    created_at: new Date().toISOString(),
    bookmarked: false,
  },
];

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
    event.preventDefault();
    if (!user) return;

    const nextProject: Project = {
      id: Date.now(),
      author_id: user.id,
      author_name: user.displayName,
      author_contact: user.email,
      title: formState.title,
      abstract: formState.abstract,
      dept: formState.dept,
      program: formState.program,
      year: formState.year,
      status: 'pending',
      keywords: formState.keywords.split(',').map((item) => item.trim()).filter(Boolean),
      tech_stack: formState.tech_stack.split(',').map((item) => item.trim()).filter(Boolean),
      lessons_learned: formState.lessons_learned,
      created_at: new Date().toISOString(),
      bookmarked: false,
    };

    const created = await createProject(nextProject);
    if (created) {
      setSubmissions((current) => [created, ...current]);
      setStatusMessage('Project submitted successfully and is now pending review.');
      setFormState({ title: '', abstract: '', dept: 'CICS', program: 'BSIT', year: '2026', keywords: '', tech_stack: '', lessons_learned: '' });
      setActiveSection('submissions');
      await refreshData();
      return;
    }

    setSubmissions((current) => [nextProject, ...current]);
    setStatusMessage('Project created locally. Connect Supabase to persist changes.');
    setActiveSection('submissions');
  };

  const handleDeleteSubmission = async (projectId: number) => {
    const deleted = await deleteProject(projectId);
    if (deleted) {
      setSubmissions((current) => current.filter((project) => project.id !== projectId));
      setStatusMessage('Submission removed.');
      return;
    }
    setStatusMessage('Failed to delete submission.');
  };

  const handleToggleBookmark = async (projectId: number) => {
    if (!user?.id) return;
    const success = await toggleBookmark(projectId, user.id);
    if (success) {
      setBookmarks((current) => {
        const already = current.some((project) => project.id === projectId);
        if (already) return current.filter((project) => project.id !== projectId);
        const project = repositoryProjects.find((item) => item.id === projectId) || submissions.find((item) => item.id === projectId);
        return project ? [ { ...project, bookmarked: true }, ...current ] : current;
      });
      setStatusMessage('Bookmark updated.');
      await refreshData();
    }
  };

  const handleSendContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id || contactProjectId == null) return;

    const project = repositoryProjects.find((p) => p.id === contactProjectId) || submissions.find((p) => p.id === contactProjectId);
    if (!project) return;

    const success = await sendContactMessage(user.id, project.author_contact || '', contactProjectId, contactMessage);
    if (success) {
      setContactMessage('');
      setStatusMessage(`Message sent to ${project.author_name}.`);
      return;
    }
    setStatusMessage('Failed to send message.');
  };

  const activeLabel = SECTIONS.find((item) => item.id === activeSection)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-[#010208] text-white overflow-hidden font-sans">
      <motion.aside animate={{ width: isCollapsed ? 88 : 300 }} className="relative border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl flex flex-col z-50">
        <button onClick={() => setIsCollapsed((value) => !value)} className="absolute -right-3 top-12 bg-orange-600 rounded-full p-1.5 border border-white/10 hover:bg-orange-500 shadow-lg z-[60]">
          {isCollapsed ? <Menu size={12} /> : <ChevronLeft size={12} />}
        </button>

        <div className={`p-8 flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0"><span className="font-black text-sm">N</span></div>
          {!isCollapsed && <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap">NEU Archive</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
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

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-4 rounded-2xl text-slate-500 hover:text-red-400 transition-all`}>
            <LogOut size={20} />
            {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-10 pb-6 bg-gradient-to-b from-[#010208] via-[#010208] to-transparent z-40">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-5xl font-black uppercase tracking-tighter">Student <span className="text-orange-500 italic">Dashboard.</span></h1>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">{activeLabel}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="rounded-3xl bg-white/5 border border-white/5 px-5 py-4 text-sm text-slate-300">Role: <span className="font-black text-white uppercase">Student</span></div>
                <div className="rounded-3xl bg-white/5 border border-white/5 px-5 py-4 text-sm text-slate-300">Your submissions: <span className="font-black text-white">{submissions.length}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
              <div className="flex flex-wrap gap-3">
                <StatCard title="Search" desc="Filter the campus archive." icon={<Search size={20} />} />
                <StatCard title="Submissions" desc="Track your project queue." icon={<ClipboardList size={20} />} />
                <StatCard title="Bookmarks" desc="Save projects for later." icon={<Bookmark size={20} />} />
              </div>
              <div className="rounded-[32px] bg-slate-950/40 border border-white/5 p-6">
                <h2 className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-4">Quick Tip</h2>
                <p className="text-sm text-slate-300 leading-relaxed">Use the submission form to draft and publish knowledge to the holding phase. Faculty will review pending uploads before approval.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 pt-0 no-scrollbar scroll-smooth">
          <div className="max-w-6xl mx-auto pb-20">
            {statusMessage && (
              <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-4 text-sm text-emerald-200">{statusMessage}</div>
            )}
            {loading ? (
              <div className="rounded-[32px] border border-white/10 bg-slate-950/60 p-12 text-center text-slate-400">Loading projects...</div>
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
            <form onSubmit={handleSubmitProject} className="space-y-8 rounded-[32px] bg-slate-950/40 border border-white/5 p-10">
              <div className="grid gap-6 lg:grid-cols-2">
                <InputField label="Title" value={formState.title} onChange={(value) => setFormState((current) => ({ ...current, title: value }))} required />
                <InputField label="Department" value={formState.dept} onChange={(value) => setFormState((current) => ({ ...current, dept: value }))} type="select" options={['CICS', 'COE', 'CAS']} />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <InputField label="Program" value={formState.program} onChange={(value) => setFormState((current) => ({ ...current, program: value }))} type="select" options={['BSIT', 'BSCS', 'BSCE']} />
                <InputField label="Year" value={formState.year} onChange={(value) => setFormState((current) => ({ ...current, year: value }))} type="select" options={['2026', '2025', '2024']} />
              </div>
              <TextAreaField label="Abstract" value={formState.abstract} onChange={(value) => setFormState((current) => ({ ...current, abstract: value }))} required />
              <TextAreaField label="Lessons Learned" value={formState.lessons_learned} onChange={(value) => setFormState((current) => ({ ...current, lessons_learned: value }))} />
              <div className="grid gap-6 lg:grid-cols-2">
                <InputField label="Keywords" value={formState.keywords} onChange={(value) => setFormState((current) => ({ ...current, keywords: value }))} placeholder="React, Supabase, AI" />
                <InputField label="Tech Stack" value={formState.tech_stack} onChange={(value) => setFormState((current) => ({ ...current, tech_stack: value }))} placeholder="React, Tailwind CSS" />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-slate-400 text-sm">Your submission will enter the review queue as pending.</div>
                <button className="inline-flex items-center gap-2 rounded-3xl bg-orange-500 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-950 transition hover:bg-orange-400">Submit Project <ArrowUpRight size={16} /></button>
              </div>
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
            <form onSubmit={handleSendContact} className="space-y-6 rounded-[32px] bg-slate-950/40 border border-white/5 p-10">
              <div className="grid gap-6 lg:grid-cols-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Project</label>
                <select
                  value={contactProjectId ?? ''}
                  onChange={(event) => setContactProjectId(Number(event.target.value))}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-5 py-4 text-sm text-white outline-none"
                >
                  <option value="">Select a project</option>
                  {repositoryProjects.map((project) => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Message</label>
                <textarea
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                  className="w-full rounded-[32px] border border-white/10 bg-slate-950/90 px-5 py-4 text-sm text-white outline-none min-h-[180px] resize-none"
                  placeholder="Ask the author for guidance or clarification..."
                />
              </div>
              <button className="inline-flex items-center gap-2 rounded-3xl bg-orange-500 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-950 transition hover:bg-orange-400">
                Send Message <MessageCircle size={16} />
              </button>
            </form>
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

const InputField = ({ label, value, onChange, type = 'text', options, placeholder = '' }: any) => (
  <label className="block text-sm text-slate-200">
    <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">{label}</span>
    {type === 'select' ? (
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-[24px] border border-white/10 bg-slate-950/90 px-5 py-4 text-sm text-white outline-none">
        {options.map((option: string) => (<option key={option} value={option}>{option}</option>))}
      </select>
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-[24px] border border-white/10 bg-slate-950/90 px-5 py-4 text-sm text-white outline-none" />
    )}
  </label>
);

const TextAreaField = ({ label, value, onChange }: any) => (
  <label className="block text-sm text-slate-200">
    <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">{label}</span>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full min-h-[160px] rounded-[24px] border border-white/10 bg-slate-950/90 px-5 py-4 text-sm text-white outline-none resize-none" />
  </label>
);

const StatCard = ({ title, desc, icon }: any) => (
  <div className="flex items-center gap-4 rounded-[32px] border border-white/10 bg-slate-950/70 p-6">
    <div className="rounded-3xl bg-orange-500/10 p-3 text-orange-400">{icon}</div>
    <div>
      <h3 className="text-sm font-black uppercase tracking-[0.35em] text-slate-300">{title}</h3>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="rounded-[32px] border border-dashed border-white/10 bg-slate-950/40 p-16 text-center text-slate-500">
    <p className="text-sm uppercase tracking-[0.35em]">{label}</p>
  </div>
);

const ProjectCard = ({ project, onBookmark, onDelete, onAction, actionLabel, bookmarked = false, statusLabel }: any) => (
  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/10 bg-slate-950/40 p-8 shadow-xl">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-orange-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-orange-300">{project.dept}</span>
          <span className="rounded-full bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">{project.program}</span>
          {statusLabel && <span className="rounded-full bg-slate-800/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-300">{statusLabel}</span>}
        </div>
        <div>
          <h3 className="text-3xl font-black uppercase tracking-tight text-white">{project.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{project.abstract || 'No abstract available yet.'}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-900/70 p-4 text-sm text-slate-300">Author: {project.author_name}</div>
          <div className="rounded-3xl bg-slate-900/70 p-4 text-sm text-slate-300">Year: {project.year}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(project.keywords || []).map((keyword: string) => (
            <span key={keyword} className="rounded-3xl bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-slate-300">{keyword}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 min-w-[220px]">
        <button onClick={onBookmark} className="rounded-3xl bg-white/5 px-5 py-4 text-left text-sm uppercase tracking-[0.35em] text-slate-200 hover:bg-white/10">
          {bookmarked ? 'Remove Bookmark' : 'Bookmark'}
        </button>
        {actionLabel && onAction && (
          <button onClick={onAction} className="rounded-3xl bg-orange-500 px-5 py-4 text-sm font-black uppercase tracking-[0.35em] text-slate-950 hover:bg-orange-400">{actionLabel}</button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm uppercase tracking-[0.35em] text-red-300 hover:bg-red-500/20">Delete</button>
        )}
      </div>
    </div>
  </motion.div>
);

const NavItem = ({ icon, label, active = false, collapsed, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-5 px-5'} py-4 rounded-2xl transition-all group relative border border-transparent ${active ? 'bg-orange-500/10 text-orange-400 border-orange-500/10' : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'}`}>
    <div className="shrink-0">{icon}</div>
    {!collapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>}
  </button>
);
