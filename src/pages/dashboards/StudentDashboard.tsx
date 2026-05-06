import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, ChevronLeft, FilePlus2, LogOut, Mail, Menu, User, Workflow } from 'lucide-react';
import { motion } from 'motion/react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Project } from '../../types/project';
import {
  fetchBookmarkedProjects,
  fetchProjects,
  createProject,
  toggleBookmark,
  sendContactMessage,
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
  { id: 'dashboard', label: 'Main Dashboard', icon: Bookmark },
  { id: 'request', label: 'Request Submission Form', icon: FilePlus2 },
  { id: 'repository', label: 'Project Repository', icon: Workflow },
  { id: 'bookmarks', label: 'Save For Later', icon: Bookmark },
  { id: 'profile', label: 'Academic Profile', icon: User },
  { id: 'contact', label: 'Faculty Directory', icon: Mail },
] as const;

type SectionKey = (typeof SECTIONS)[number]['id'];
const SECTION_ID_SET = new Set<SectionKey>(SECTIONS.map((section) => section.id));
const getValidSection = (value: string | null, fallback: SectionKey): SectionKey => (
  value && SECTION_ID_SET.has(value as SectionKey) ? (value as SectionKey) : fallback
);
GlobalWorkerOptions.workerSrc = pdfWorker;

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>(() => getValidSection(searchParams.get('section'), 'dashboard'));
  const [repositoryProjects, setRepositoryProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [bookmarks, setBookmarks] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [formState, setFormState] = useState({
    title: '',
    summary: '',
    abstract: '',
    authors: '',
    tags: '',
    links: '',
    files: '',
    images: '',
    pdfs: '',
    dept: 'CICS',
    program: 'BSIT',
    year: '2026',
  });
  const [studentSubmissions, setStudentSubmissions] = useState<Project[]>([]);
  const [deleteRequests, setDeleteRequests] = useState<number[]>([]);
  const [contactProjectId, setContactProjectId] = useState<number | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [approvalRequestReason, setApprovalRequestReason] = useState('');
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [pdfPreviewText, setPdfPreviewText] = useState('');
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [linkValidationError, setLinkValidationError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const refreshData = async () => {
    if (!user?.id) return;
    setLoading(true);
    const [repo, book] = await Promise.all([
      fetchProjects({ status: 'approved' }),
      fetchBookmarkedProjects(user.id),
    ]);
    setRepositoryProjects(repo || SAMPLE_PROJECTS);
    setBookmarks(book || []);
    setStudentSubmissions((repo || SAMPLE_PROJECTS).filter((project) => project.author_id === user.id));
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [user?.id]);

  useEffect(() => {
    const sectionFromUrl = getValidSection(searchParams.get('section'), 'dashboard');
    if (sectionFromUrl !== activeSection) {
      setActiveSection(sectionFromUrl);
    }
  }, [searchParams, activeSection]);

  const handleSectionChange = (section: SectionKey) => {
    setActiveSection(section);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('section', section);
      return next;
    }, { replace: true });
  };

  const filteredRepository = useMemo(() => {
    return repositoryProjects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDept = selectedDept === 'All' || project.dept === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [repositoryProjects, searchQuery, selectedDept]);

  const handleSubmitProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    if (!formState.summary.trim() || !formState.abstract.trim() || !formState.tags.trim()) {
      setStatusMessage('Summary, abstract, and tags are required.');
      return;
    }
    const parsedLinks = formState.links.split(',').map((item) => item.trim()).filter(Boolean);
    const invalidLink = parsedLinks.find((link) => !isValidUrl(link));
    if (invalidLink) {
      setLinkValidationError(`Invalid URL: ${invalidLink}`);
      setStatusMessage('Please provide valid GitHub/Live Demo links.');
      return;
    }
    setLinkValidationError(null);

    const parsedTags = formState.tags.split(',').map((item) => item.trim()).filter(Boolean);
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
      keywords: parsedTags,
      summary: formState.summary,
      request_reason: approvalRequestReason || undefined,
      tags: parsedTags,
      version: 1,
      assets: {
        pdfs: uploadedPdf ? [uploadedPdf.name] : formState.pdfs.split(',').map((item) => item.trim()).filter(Boolean),
        pdfExtractText: pdfPreviewText || undefined,
        links: parsedLinks,
        files: formState.files.split(',').map((item) => item.trim()).filter(Boolean),
        images: formState.images.split(',').map((item) => item.trim()).filter(Boolean),
      },
      collaborators: formState.authors.split(',').map((item) => item.trim()).filter(Boolean),
      created_at: new Date().toISOString(),
      bookmarked: false,
    };

    const created = await createProject(nextProject);
    if (created) {
      setStudentSubmissions((current) => [created, ...current]);
      setStatusMessage('Request submitted. Your faculty will review it in the Approval Queue.');
      setFormState({ title: '', summary: '', abstract: '', authors: '', tags: '', links: '', files: '', images: '', pdfs: '', dept: 'CICS', program: 'BSIT', year: '2026' });
      setUploadedPdf(null);
      setPdfPreviewText('');
      await refreshData();
      return;
    }

    setStudentSubmissions((current) => [nextProject, ...current]);
    setStatusMessage('Request created locally. Connect Supabase to persist changes.');
  };

  const isValidUrl = (value: string) => {
    try {
      const candidate = new URL(value);
      return candidate.protocol === 'http:' || candidate.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setPdfError('Only PDF files are allowed.');
      return;
    }
    setPdfError(null);
    setUploadedPdf(file);

    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      const pageLimit = Math.min(pdf.numPages, 3);
      const chunks: string[] = [];

      for (let i = 1; i <= pageLimit; i += 1) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        chunks.push(pageText);
      }

      setPdfPreviewText(chunks.join('\n\n').slice(0, 4000) || 'No readable text found in the selected PDF.');
    } catch {
      setPdfError('Unable to read PDF content. Please try another file.');
      setPdfPreviewText('');
    }
  };

  const handleToggleBookmark = async (projectId: number) => {
    if (!user?.id) return;
    const success = await toggleBookmark(projectId, user.id);
    if (success) {
      setBookmarks((current) => {
        const already = current.some((project) => project.id === projectId);
        if (already) return current.filter((project) => project.id !== projectId);
        const project = repositoryProjects.find((item) => item.id === projectId) || studentSubmissions.find((item) => item.id === projectId);
        return project ? [ { ...project, bookmarked: true }, ...current ] : current;
      });
      setStatusMessage('Bookmark updated.');
      await refreshData();
    }
  };

  const handleSendContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id || contactProjectId == null) return;

    const project = repositoryProjects.find((p) => p.id === contactProjectId) || studentSubmissions.find((p) => p.id === contactProjectId);
    if (!project) return;

    const payload = `${contactMessage}\n\nApproval request reason: ${approvalRequestReason || 'N/A'}`;
    const success = await sendContactMessage(user.id, project.author_contact || '', contactProjectId, payload);
    if (success) {
      setContactMessage('');
      setApprovalRequestReason('');
      setStatusMessage(`Message sent to ${project.author_name}.`);
      return;
    }
    setStatusMessage('Failed to send message.');
  };

  const activeLabel = SECTIONS.find((item) => item.id === activeSection)?.label || 'Student Dashboard';

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
              onClick={() => handleSectionChange(section.id)}
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
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Main Feed: Posted Projects</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="rounded-3xl bg-white/5 border border-white/5 px-5 py-4 text-sm text-slate-300">Role: <span className="font-black text-white uppercase">Student</span></div>
                <div className="rounded-3xl bg-white/5 border border-white/5 px-5 py-4 text-sm text-slate-300">Sidebar Tool: <span className="font-black text-white">{activeLabel}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
              <div className="rounded-[32px] bg-slate-950/40 border border-white/5 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Search" value={searchQuery} onChange={setSearchQuery} />
                  <InputField label="Department" value={selectedDept} onChange={setSelectedDept} type="select" options={['All', 'CICS', 'COE', 'CAS']} />
                </div>
              </div>
              <div className="rounded-[32px] bg-slate-950/40 border border-white/5 p-6">
                <h2 className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-4">Quick Tip</h2>
                <p className="text-sm text-slate-300 leading-relaxed">The center feed is shared across all roles. Use your student sidebar tools for submissions, versioning, profile, and faculty requests.</p>
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
      case 'dashboard':
        return (
          <SectionCard title="Main Dashboard" subtitle="All posted projects from student submissions." count={filteredRepository.length}>
            <div className="grid gap-6">
              {filteredRepository.length === 0 ? (
                <EmptyState label="No posted projects available." />
              ) : (
                filteredRepository.map((project) => (
                  <ProjectCard key={project.id} project={project} onBookmark={() => handleToggleBookmark(project.id)} />
                ))
              )}
            </div>
          </SectionCard>
        );
      case 'request':
        return (
          <SectionCard title="Request Submission Form" subtitle="Ask faculty to review your project before it is posted to the main repository." count={studentSubmissions.length}>
            <form onSubmit={handleSubmitProject} className="space-y-8 rounded-[32px] bg-slate-950/40 border border-white/5 p-10">
              <div className="grid gap-6">
                <InputField label="Title" value={formState.title} onChange={(value) => setFormState((current) => ({ ...current, title: value }))} required />
                <TextAreaField label="Summary (required)" value={formState.summary} onChange={(value) => setFormState((current) => ({ ...current, summary: value }))} />
                <TextAreaField label="Abstract (required)" value={formState.abstract} onChange={(value) => setFormState((current) => ({ ...current, abstract: value }))} required />
                <InputField label="Authors (comma-separated)" value={formState.authors} onChange={(value) => setFormState((current) => ({ ...current, authors: value }))} placeholder="Juan Dela Cruz, Ana Reyes" />
                <InputField label="Tags / Keywords (required)" value={formState.tags} onChange={(value) => setFormState((current) => ({ ...current, tags: value }))} placeholder="AI, NLP, React" required />
                <label className="block text-sm text-slate-200">
                  <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Upload PDF File</span>
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="w-full rounded-[24px] border border-white/10 bg-slate-950/90 px-5 py-4 text-sm text-white outline-none" />
                  {uploadedPdf && <p className="mt-2 text-xs text-slate-400">Selected: {uploadedPdf.name}</p>}
                  {pdfError && <p className="mt-2 text-xs text-red-300">{pdfError}</p>}
                </label>
                <InputField label="GitHub / Live Demo Links" value={formState.links} onChange={(value) => setFormState((current) => ({ ...current, links: value }))} placeholder="https://github.com/..." />
                {linkValidationError && <p className="text-xs text-red-300">{linkValidationError}</p>}
                <InputField label="File Links" value={formState.files} onChange={(value) => setFormState((current) => ({ ...current, files: value }))} placeholder="https://drive.google.com/..." />
                <InputField label="Image Links" value={formState.images} onChange={(value) => setFormState((current) => ({ ...current, images: value }))} placeholder="https://..." />
              </div>
              {pdfPreviewText && (
                <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">PDF Content Preview</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">{pdfPreviewText}</p>
                </div>
              )}
              <div className="grid gap-6 lg:grid-cols-2">
                <InputField label="Department" value={formState.dept} onChange={(value) => setFormState((current) => ({ ...current, dept: value }))} type="select" options={['CICS', 'COE', 'CAS']} />
                <InputField label="Program" value={formState.program} onChange={(value) => setFormState((current) => ({ ...current, program: value }))} type="select" options={['BSIT', 'BSCS', 'BSCE']} />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-slate-400 text-sm">This form sends a submission request to your assigned faculty before your work appears in the main dashboard.</div>
                <button className="inline-flex items-center gap-2 rounded-3xl bg-orange-500 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-950 transition hover:bg-orange-400">Submit Request</button>
              </div>
            </form>
          </SectionCard>
        );
      case 'repository':
        return (
          <SectionCard title="Project Repository" subtitle="Projects you have posted after faculty approval." count={studentSubmissions.length}>
            <div className="space-y-4">
              {studentSubmissions.length === 0 ? <EmptyState label="No posted projects yet." /> : studentSubmissions.filter((project) => project.status === 'approved').map((project) => (
                <div key={project.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
                  <p className="font-black text-sm uppercase tracking-[0.2em]">{project.title}</p>
                  <p className="text-xs text-slate-400 mt-2">Current: {project.status}</p>
                  <div className="flex gap-2 mt-4">
                    <button className="rounded-2xl bg-white/5 px-4 py-2 text-xs" onClick={() => setStatusMessage(`New version flow started for ${project.title}.`)}>New Version</button>
                    <button className="rounded-2xl bg-red-500/10 px-4 py-2 text-xs text-red-300" onClick={() => { setDeleteRequests((current) => [...current, project.id]); setStatusMessage('Delete request sent to admin for approval.'); }}>Request Delete</button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-500">Delete requests awaiting approval: {deleteRequests.length}</p>
            </div>
          </SectionCard>
        );

      case 'bookmarks':
        return (
          <SectionCard title="Reference Library" subtitle="Save-for-later bookmarks for future research." count={bookmarks.length}>
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
      case 'profile':
        return (
          <SectionCard title="Student Profile" subtitle="Basic academic information and advisor assignment." count={0}>
            <div className="rounded-[32px] bg-slate-950/40 border border-white/10 p-6 space-y-2">
              <p className="text-sm text-slate-300">Name: {user?.displayName}</p>
              <p className="text-sm text-slate-300">Email: {user?.email}</p>
              <p className="text-sm text-slate-300">Department: {formState.dept}</p>
              <p className="text-sm text-slate-300">Program: {formState.program}</p>
            </div>
          </SectionCard>
        );

      case 'contact':
        return (
          <SectionCard title="Faculty Contact + Approval Request" subtitle="Reach assigned faculty and submit integrated approval requests." count={0}>
            <form onSubmit={handleSendContact} className="space-y-6 rounded-[32px] bg-slate-950/40 border border-white/5 p-10">
              <div className="space-y-2">
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
              <InputField label="Approval Request Reason" value={approvalRequestReason} onChange={setApprovalRequestReason} placeholder="Reason for faculty approval request..." />
              <button className="inline-flex items-center gap-2 rounded-3xl bg-orange-500 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-950 transition hover:bg-orange-400">
                Send Request
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
