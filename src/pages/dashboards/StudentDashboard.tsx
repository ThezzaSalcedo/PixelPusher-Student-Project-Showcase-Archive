import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Database,
  ClipboardList,
  FilePlus,
  Bookmark,
  Mail,
  LogOut,
  Hash,
  Calendar,
  GraduationCap,
  MessageCircle,
  Trash2,
  Edit3,
  Sparkles,
  Filter,
  User,
  Github,
  FileText,
  Image as ImageIcon,
  History,
  Plus,
  X,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useDashboardNav } from '../../context/DashboardNavContext';
import { useNavigate } from 'react-router-dom';
import type { Contributor, Project, ProjectAttachment, SubmissionType } from '../../types/project';
import {
  createProject,
  createProjectVersion,
  deleteProject,
  fetchBookmarkedProjects,
  fetchProjects,
  fetchStudentProjects,
  fetchVersionHistory,
  sendContactMessage,
  toggleBookmark,
  updateProject,
} from '../../services/projectService';
import { updateProfileDisplayName } from '../../services/profileService';
import {
  parseKeywordList,
  parseTechStack,
  normalizeAttachment,
  validateAbstract,
} from '../../utils/projectValidation';


type SectionKey = 'repository' | 'project' | 'submissions' | 'form' | 'bookmarks' | 'contact' | 'profile';

const DEPTS = ['All', 'CICS', 'COE', 'CAS'];
const PROGRAMS = ['All', 'BSIT', 'BSCS', 'BSCE', 'BSEE', 'OTHER'];
const YEARS = ['All', '2024', '2025', '2026', '2027'];
const SUBMISSION_TYPES: SubmissionType[] = ['project', 'thesis', 'capstone'];

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { activeSection, setActiveSection } = useDashboardNav();
  const [repositoryProjects, setRepositoryProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Project[]>([]);
  const [bookmarks, setBookmarks] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedType, setSelectedType] = useState<'All' | SubmissionType>('All');

  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [versionBaseId, setVersionBaseId] = useState<number | null>(null);
  const [historyForGroup, setHistoryForGroup] = useState<string | null>(null);
  const [versionRows, setVersionRows] = useState<Project[]>([]);

  const [profileName, setProfileName] = useState('');

  const [formState, setFormState] = useState({
    title: '',
    abstract: '',
    submission_type: 'project' as SubmissionType,
    dept: 'CICS',
    program: 'BSIT',
    year: '2026',
    keywords: '',
    tech_stack: '',
    lessons_learned: '',
    author_contact: '',
    pdf_url: '',
    github_url: '',
    image_urls: '',
  });
  const [contributors, setContributors] = useState<Contributor[]>([{ name: '', email: '' }]);

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
    setRepositoryProjects(repo || []);
    setSubmissions(subs || []);
    setBookmarks(book || []);
    setLoading(false);
  };

useEffect(() => {
  if (activeSection === 'bookmarks' && user?.id && bookmarks.length === 0) {
    fetchBookmarkedProjects(user.id).then(setBookmarks);
  }
}, [activeSection, user?.id]);

  useEffect(() => {
    setProfileName(user?.displayName || '');
  }, [user?.displayName]);

  useEffect(() => {
    if (!user) return;
    setFormState((s) => ({
      ...s,
      author_contact: s.author_contact || user.email || '',
    }));
    setContributors((rows) =>
      rows.length === 1 && !rows[0].name
        ? [{ name: user.displayName || '', email: user.email || '' }]
        : rows
    );
  }, [user?.id, user?.email, user?.displayName]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!historyForGroup) {
        setVersionRows([]);
        return;
      }
      const rows = await fetchVersionHistory(historyForGroup);
      setVersionRows(rows);
    };
    loadHistory();
  }, [historyForGroup]);

  const filteredRepository = useMemo(() => {
    return repositoryProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.abstract || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'All' || project.dept === selectedDept;
      const matchesYear = selectedYear === 'All' || project.year === selectedYear;
      const matchesProgram = selectedProgram === 'All' || project.program === selectedProgram;
      const matchesType =
        selectedType === 'All' || (project.submission_type || 'project') === selectedType;
      return matchesSearch && matchesDept && matchesYear && matchesProgram && matchesType;
    });
  }, [repositoryProjects, searchQuery, selectedDept, selectedYear, selectedProgram, selectedType]);

  const resetForm = () => {
    setEditingProjectId(null);
    setVersionBaseId(null);
    setFormState({
      title: '',
      abstract: '',
      submission_type: 'project',
      dept: 'CICS',
      program: 'BSIT',
      year: '2026',
      keywords: '',
      tech_stack: '',
      lessons_learned: '',
      author_contact: user?.email || '',
      pdf_url: '',
      github_url: '',
      image_urls: '',
    });
    setContributors([{ name: user?.displayName || '', email: user?.email || '' }]);
  };

  const loadProjectIntoForm = (project: Project, asNewVersion: boolean) => {
    setFormState({
      title: project.title,
      abstract: project.abstract || '',
      submission_type: project.submission_type || 'project',
      dept: project.dept,
      program: project.program,
      year: project.year,
      keywords: project.keywords.join(', '),
      tech_stack: (project.tech_stack || []).join(', '),
      lessons_learned: project.lessons_learned || '',
      author_contact: project.author_contact || user?.email || '',
      pdf_url: project.attachments?.find((a) => a.kind === 'pdf')?.url || '',
      github_url: project.attachments?.find((a) => a.kind === 'github')?.url || '',
      image_urls:
        project.attachments
          ?.filter((a) => a.kind === 'image')
          .map((a) => a.url)
          .join(', ') || '',
    });
    setContributors(
      project.contributors?.length
        ? project.contributors
        : [{ name: user?.displayName || '', email: user?.email || '' }]
    );
    if (asNewVersion) {
      setVersionBaseId(project.id);
      setEditingProjectId(null);
    } else {
      setEditingProjectId(project.id);
      setVersionBaseId(null);
    }
    setActiveSection('form');
  };

  const buildAttachments = (): ProjectAttachment[] => {
    const list: ProjectAttachment[] = [];
    const pdf = normalizeAttachment('pdf', formState.pdf_url, 'Primary PDF');
    const gh = normalizeAttachment('github', formState.github_url, 'Repository');
    if (pdf) list.push(pdf);
    if (gh) list.push(gh);
    formState.image_urls
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((url, idx) => {
        const img = normalizeAttachment('image', url, `Image ${idx + 1}`);
        if (img) list.push(img);
      });
    return list;
  };

  const buildPayload = (): Partial<Project> => {
    const abstractCheck = validateAbstract(formState.abstract);
    if (abstractCheck.ok === false) {
      throw new Error(abstractCheck.message);
    }
    const attachmentList = buildAttachments();
    if (attachmentList.length === 0) {
      throw new Error('Add at least one valid attachment (PDF, GitHub, or image URL).');
    }
    const contributorList = contributors
      .map((c) => ({ name: c.name.trim(), email: c.email?.trim() }))
      .filter((c) => c.name.length > 0);
    if (contributorList.length === 0) {
      throw new Error('Add at least one contributor with a name.');
    }

    return {
      title: formState.title.trim(),
      abstract: formState.abstract.trim(),
      submission_type: formState.submission_type,
      dept: formState.dept,
      program: formState.program,
      year: formState.year,
      keywords: parseKeywordList(formState.keywords),
      tech_stack: parseTechStack(formState.tech_stack),
      lessons_learned: formState.lessons_learned.trim(),
      author_contact: formState.author_contact.trim() || user?.email,
      author_name: contributorList[0].name,
      author_id: user?.id,
      attachments: attachmentList,
      contributors: contributorList,
      status: 'pending',
    };
  };

  const handleSubmitProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;
    setStatusMessage(null);
    try {
      const payload = buildPayload();
      if (versionBaseId) {
        const created = await createProjectVersion(versionBaseId, payload, user.id);
        if (!created) {
          setStatusMessage('Could not create a new version. Check your connection or table columns.');
          return;
        }
        setStatusMessage('New version submitted for review. Previous versions remain in history.');
        resetForm();
        await refreshData();
        return;
      }
      if (editingProjectId) {
        const updated = await updateProject(editingProjectId, {
          ...payload,
          status: 'pending',
        });
        if (!updated) {
          setStatusMessage('Update failed. Ensure your Supabase row exists.');
          return;
        }
        setStatusMessage('Submission updated and sent back to the review queue.');
        resetForm();
        await refreshData();
        return;
      }
      const created = await createProject({
        ...payload,
        version_group_id: crypto.randomUUID(),
        version_number: 1,
        is_latest_version: true,
      });
      if (!created) {
        setStatusMessage('Create failed. Verify Supabase `projects` columns match the payload.');
        return;
      }
      setStatusMessage('Project submitted for faculty review.');
      resetForm();
      await refreshData();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Unable to submit project.');
    }
  };

  const handleDeleteSubmission = async (projectId: number) => {
    if (!confirm('Delete this submission permanently?')) return;
    const ok = await deleteProject(projectId);
    if (!ok) {
      setStatusMessage('Delete failed.');
      return;
    }
    setStatusMessage('Submission deleted.');
    await refreshData();
  };

  const handleToggleBookmark = async (projectId: number) => {
    if (!user?.id) return;
    await toggleBookmark(projectId, user.id);
    await refreshData();
  };

  const handleSendContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id || !contactProjectId) return;
    const project = repositoryProjects.find((p) => p.id === contactProjectId);
    if (!project?.author_contact) {
      setStatusMessage('Author contact is unavailable for this record.');
      return;
    }
    const ok = await sendContactMessage(user.id, project.author_contact, contactProjectId, contactMessage);
    setStatusMessage(ok ? 'Message sent.' : 'Unable to send message.');
    if (ok) setContactMessage('');
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;
    const ok = await updateProfileDisplayName(user.id, profileName.trim());
    setStatusMessage(
      ok ? 'Profile name updated in directory records.' : 'Profile update failed (check Supabase policies).'
    );
  };

  const addContributorRow = () => setContributors((rows) => [...rows, { name: '', email: '' }]);
  const removeContributorRow = (index: number) =>
    setContributors((rows) => rows.filter((_, i) => i !== index));
  const updateContributor = (index: number, field: keyof Contributor, value: string) => {
    setContributors((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="min-h-screen flex text-white overflow-hidden font-sans relative selection:bg-[#C5A059]/30 bg-[#020d1d]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
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
            {statusMessage && (
              <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-200">
                {statusMessage}
              </div>
            )}
            {loading ? (
              <div className="rounded-[48px] border border-[#08304f]/50 bg-[#021026]/95 p-12 text-center text-slate-300">
                Loading projects...
              </div>
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
          <SectionCard
            title="Project Repository"
            subtitle="Browse approved student projects, theses, and capstones."
            count={filteredRepository.length}
          >
            <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Search size={16} className="text-[#C5A059]" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, abstract, tags..."
                  className="bg-transparent flex-1 outline-none text-sm"
                />
              </label>
              <FilterSelect label="Dept" value={selectedDept} options={DEPTS} onChange={setSelectedDept} />
              <FilterSelect label="Program" value={selectedProgram} options={PROGRAMS} onChange={setSelectedProgram} />
              <FilterSelect label="Year" value={selectedYear} options={YEARS} onChange={setSelectedYear} />
              <FilterSelect
                label="Type"
                value={selectedType}
                options={['All', ...SUBMISSION_TYPES]}
                onChange={(v) => setSelectedType(v as 'All' | SubmissionType)}
              />
            </div>
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
      case 'project':
        return (
          <SectionCard
            title="Project"
            subtitle="Manage your projects and submissions."
            count={submissions.length}
          >
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => setActiveSection('submissions')}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <ClipboardList size={24} className="text-[#C5A059] mb-3" />
                  <h3 className="text-lg font-semibold">Project Submissions</h3>
                  <p className="text-sm text-slate-400">View and manage your submitted projects</p>
                </button>
                <button
                  onClick={() => setActiveSection('form')}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <FilePlus size={24} className="text-[#C5A059] mb-3" />
                  <h3 className="text-lg font-semibold">Submission Form</h3>
                  <p className="text-sm text-slate-400">Create new project submissions</p>
                </button>
              </div>
            </div>
          </SectionCard>
        );
      case 'submissions':
        return (
          <SectionCard
            title="Your Submissions"
            subtitle="Edit drafts, manage contributors, or submit a new version after approval."
            count={submissions.length}
          >
            <div className="space-y-6">
              {submissions.length === 0 ? (
                <EmptyState label="No submissions yet. Use the submission form to add your work." />
              ) : (
                submissions.map((project) => (
                  <div key={project.id} className="space-y-4">
                    <ProjectCard
                      project={project}
                      statusLabel={project.status}
                      onDelete={() => handleDeleteSubmission(project.id)}
                      onBookmark={() => handleToggleBookmark(project.id)}
                      actionLabel="Edit"
                      onAction={() => loadProjectIntoForm(project, false)}
                      extraActions={
                        <div className="flex flex-wrap gap-2">
                          {project.status === 'approved' && (
                            <button
                              type="button"
                              onClick={() => loadProjectIntoForm(project, true)}
                              className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/20"
                            >
                              New version
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setHistoryForGroup((current) =>
                                current === (project.version_group_id || '') ? null : project.version_group_id || ''
                              )
                            }
                            className="px-4 py-2 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/30 text-xs font-bold uppercase tracking-widest text-[#C5A059] inline-flex items-center gap-2"
                          >
                            <History size={14} />
                            Version history
                          </button>
                        </div>
                      }
                    />
                    {historyForGroup && historyForGroup === project.version_group_id && (
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-6 space-y-3">
                        <p className="text-xs uppercase tracking-[0.35em] text-[#C5A059]">Version timeline</p>
                        {versionRows.length === 0 ? (
                          <p className="text-sm text-slate-400">No additional versions synced yet.</p>
                        ) : (
                          versionRows.map((row) => (
                            <div
                              key={row.id}
                              className="flex flex-wrap items-center justify-between gap-3 border border-white/5 rounded-2xl px-4 py-3"
                            >
                              <div>
                                <p className="text-sm font-semibold">
                                  Version {row.version_number}{' '}
                                  {row.is_latest_version && (
                                    <span className="text-[10px] uppercase text-emerald-300">Latest</span>
                                  )}
                                </p>
                                <p className="text-xs text-slate-400">{row.status}</p>
                              </div>
                              <p className="text-xs text-slate-500">
                                {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        );
      case 'form':
        return (
          <SectionCard
            title="Submission Form"
            subtitle={
              versionBaseId
                ? 'You are submitting a new version. Older rows stay visible in history.'
                : editingProjectId
                  ? 'Update your pending submission.'
                  : 'Upload references, GitHub links, and PDFs using secure HTTPS URLs.'
            }
            count={0}
          >
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5"
              >
                Clear form
              </button>
              {versionBaseId && (
                <span className="text-xs text-[#C5A059] uppercase tracking-widest">
                  Version flow active — submit to append history
                </span>
              )}
            </div>
            <form
              onSubmit={handleSubmitProject}
              className="space-y-8 rounded-[48px] bg-[#021026]/95 backdrop-blur-3xl border border-[#08304f]/50 p-10"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Title">
                  <input
                    required
                    value={formState.title}
                    onChange={(e) => setFormState((s) => ({ ...s, title: e.target.value }))}
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C5A059]/60"
                  />
                </Field>
                <Field label="Submission type">
                  <select
                    value={formState.submission_type}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, submission_type: e.target.value as SubmissionType }))
                    }
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C5A059]/60"
                  >
                    {SUBMISSION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field
                label="Abstract / executive summary"
                hint="Minimum 80 characters. Include problem, method, and outcome."
              >
                <textarea
                  required
                  rows={6}
                  value={formState.abstract}
                  onChange={(e) => setFormState((s) => ({ ...s, abstract: e.target.value }))}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C5A059]/60"
                />
              </Field>

              <div className="grid gap-6 md:grid-cols-3">
                <Field label="Department">
                  <select
                    value={formState.dept}
                    onChange={(e) => setFormState((s) => ({ ...s, dept: e.target.value }))}
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                  >
                    {DEPTS.filter((d) => d !== 'All').map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Program">
                  <select
                    value={formState.program}
                    onChange={(e) => setFormState((s) => ({ ...s, program: e.target.value }))}
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                  >
                    {PROGRAMS.filter((p) => p !== 'All').map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Graduation year">
                  <input
                    value={formState.year}
                    onChange={(e) => setFormState((s) => ({ ...s, year: e.target.value }))}
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                  />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Keywords / tags" hint="Comma separated — used for search facets.">
                  <input
                    value={formState.keywords}
                    onChange={(e) => setFormState((s) => ({ ...s, keywords: e.target.value }))}
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                    placeholder="archive, react, supabase"
                  />
                </Field>
                <Field label="Tech stack">
                  <input
                    value={formState.tech_stack}
                    onChange={(e) => setFormState((s) => ({ ...s, tech_stack: e.target.value }))}
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                    placeholder="React, Supabase, Python"
                  />
                </Field>
              </div>

              <Field label="Lessons learned">
                <textarea
                  rows={3}
                  value={formState.lessons_learned}
                  onChange={(e) => setFormState((s) => ({ ...s, lessons_learned: e.target.value }))}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </Field>

              <Field label="Primary contact email">
                <input
                  type="email"
                  value={formState.author_contact}
                  onChange={(e) => setFormState((s) => ({ ...s, author_contact: e.target.value }))}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </Field>

              <div className="rounded-3xl border border-[#C5A059]/20 bg-[#C5A059]/5 p-6 space-y-4">
                <p className="text-xs uppercase tracking-[0.35em] text-[#C5A059]">Attachments</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="PDF URL" hint="Must include pdf in the path or filename.">
                    <div className="flex items-center gap-2 rounded-2xl bg-black/40 border border-white/10 px-3">
                      <FileText size={16} className="text-[#C5A059]" />
                      <input
                        value={formState.pdf_url}
                        onChange={(e) => setFormState((s) => ({ ...s, pdf_url: e.target.value }))}
                        className="w-full bg-transparent py-3 text-sm outline-none"
                        placeholder="https://.../report.pdf"
                      />
                    </div>
                  </Field>
                  <Field label="GitHub URL" hint="Must be a github.com link.">
                    <div className="flex items-center gap-2 rounded-2xl bg-black/40 border border-white/10 px-3">
                      <Github size={16} className="text-[#C5A059]" />
                      <input
                        value={formState.github_url}
                        onChange={(e) => setFormState((s) => ({ ...s, github_url: e.target.value }))}
                        className="w-full bg-transparent py-3 text-sm outline-none"
                        placeholder="https://github.com/org/repo"
                      />
                    </div>
                  </Field>
                  <Field label="Image URLs" hint="Comma separated HTTPS links.">
                    <div className="flex items-center gap-2 rounded-2xl bg-black/40 border border-white/10 px-3">
                      <ImageIcon size={16} className="text-[#C5A059]" />
                      <input
                        value={formState.image_urls}
                        onChange={(e) => setFormState((s) => ({ ...s, image_urls: e.target.value }))}
                        className="w-full bg-transparent py-3 text-sm outline-none"
                        placeholder="https://.../hero.png, https://.../diagram.jpg"
                      />
                    </div>
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs uppercase tracking-[0.35em] text-[#C5A059]">Contributors</p>
                  <button
                    type="button"
                    onClick={addContributorRow}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/20"
                  >
                    <Plus size={14} />
                    Add contributor
                  </button>
                </div>
                <div className="space-y-3">
                  {contributors.map((row, index) => (
                    <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
                      <Field label={`Name #${index + 1}`}>
                        <input
                          value={row.name}
                          onChange={(e) => updateContributor(index, 'name', e.target.value)}
                          className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                        />
                      </Field>
                      <Field label="Email (optional)">
                        <input
                          value={row.email || ''}
                          onChange={(e) => updateContributor(index, 'email', e.target.value)}
                          className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() => removeContributorRow(index)}
                        disabled={contributors.length === 1}
                        className="h-[46px] rounded-2xl border border-red-500/30 text-red-300 hover:bg-red-500/10 disabled:opacity-30"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-10 py-4 rounded-3xl bg-[#C5A059] text-black font-black uppercase tracking-widest hover:bg-[#d4af7a]"
              >
                {versionBaseId ? 'Submit new version' : editingProjectId ? 'Update submission' : 'Submit for review'}
              </button>
            </form>
          </SectionCard>
        );
      case 'bookmarks':
        return (
          <SectionCard title="Bookmarks" subtitle="Save for later — synced when Supabase bookmarks table is available." count={bookmarks.length}>
            {bookmarks.length === 0 ? (
              <EmptyState label="Bookmark projects from the repository to save them here." />
            ) : (
              <div className="grid gap-6">
                {bookmarks.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onBookmark={() => handleToggleBookmark(project.id)}
                    bookmarked
                  />
                ))}
              </div>
            )}
          </SectionCard>
        );
      case 'profile':
        return (
          <SectionCard title="My profile" subtitle="Update how your name appears in the institutional directory." count={0}>
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
              <Field label="Display name">
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </Field>
              <p className="text-xs text-slate-400">Signed in as {user?.email}</p>
              <button
                type="submit"
                className="px-8 py-3 rounded-3xl bg-[#C5A059] text-black font-bold uppercase tracking-widest text-xs"
              >
                Save profile
              </button>
            </form>
          </SectionCard>
        );
      case 'contact':
        return (
          <SectionCard title="Contact portal" subtitle="Reach out to authors about their archived work." count={0}>
            <form onSubmit={handleSendContact} className="space-y-6 max-w-3xl">
              <Field label="Choose project">
                <select
                  value={contactProjectId || ''}
                  onChange={(e) => setContactProjectId(Number(e.target.value))}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                >
                  <option value="">Select a project</option>
                  {repositoryProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Message">
                <textarea
                  required
                  rows={5}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </Field>
              <button
                type="submit"
                className="px-8 py-3 rounded-3xl bg-[#C5A059] text-black font-bold uppercase tracking-widest text-xs"
              >
                Send message
              </button>
            </form>
          </SectionCard>
        );
      default:
        return null;
    }
  }
};

const SectionCard = ({ title, subtitle, children, count }: any) => (
  <div className="relative w-full max-w-full px-4 sm:px-0">
    <div className="mb-6 text-left">
      <h2 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter leading-none text-white">{title}</h2>
      <p className="mt-3 text-[#C5A059]/70 max-w-3xl text-sm sm:text-base">{subtitle}</p>
    </div>
    <div className="w-full max-w-full bg-[#000000]/80 backdrop-blur-3xl border-2 border-[#C5A059]/60 rounded-[48px] p-10 shadow-[0_0_60px_-10px_rgba(197,160,89,0.3)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.35em] text-[#C5A059]">Section overview</p>
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

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="block space-y-2 text-sm text-slate-200">
    <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">{label}</span>
    {children}
    {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
  </label>
);

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-widest text-[#C5A059]">
    <span className="flex items-center gap-2 text-[10px] text-slate-400">
      <Filter size={12} />
      {label}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent text-sm text-white outline-none"
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="text-black">
          {opt}
        </option>
      ))}
    </select>
  </label>
);

type ProjectCardProps = {
  project: Project;
  onBookmark: () => void;
  onDelete?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  bookmarked?: boolean;
  statusLabel?: string;
  highlight?: boolean;
  extraActions?: React.ReactNode;
};

const ProjectCard = ({
  project,
  onBookmark,
  onDelete,
  onAction,
  actionLabel,
  bookmarked = false,
  statusLabel,
  highlight,
  extraActions,
}: ProjectCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-[48px] border ${
      highlight ? 'border-[#C5A059]/40' : 'border-white/10'
    } bg-[#000000]/70 backdrop-blur-2xl p-8 shadow-xl space-y-4`}
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-3 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.4em] px-3 py-1 rounded-full bg-white/10 border border-white/10">
            {project.submission_type || 'project'}
          </span>
          {statusLabel && (
            <span className="text-[10px] uppercase tracking-[0.4em] px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-200">
              {statusLabel}
            </span>
          )}
          <span className="text-xs text-slate-400 flex items-center gap-2">
            <GraduationCap size={14} />
            {project.dept} • {project.program} • {project.year}
          </span>
        </div>
        <h3 className="text-2xl font-black leading-tight">{project.title}</h3>
        <p className="text-sm text-slate-300 line-clamp-4">{project.abstract}</p>
        <div className="flex flex-wrap gap-2">
          {project.keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-widest text-[#C5A059]"
            >
              <Hash size={12} />
              {keyword}
            </span>
          ))}
        </div>
        {!!project.contributors?.length && (
          <div className="text-xs text-slate-400 space-y-1">
            <p className="uppercase tracking-[0.35em] text-[#C5A059]">Contributors</p>
            <p>{project.contributors.map((c) => c.name).join(', ')}</p>
          </div>
        )}
        {!!project.attachments?.length && (
          <div className="flex flex-wrap gap-2">
            {project.attachments.map((attachment) => (
              <a
                key={`${attachment.kind}-${attachment.url}`}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-[11px] uppercase tracking-widest hover:border-[#C5A059]/50"
              >
                <ExternalLink size={12} />
                {attachment.kind.toUpperCase()}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 lg:items-end">
        <button
          type="button"
          onClick={onBookmark}
          className={`p-3 rounded-2xl border border-white/10 ${
            bookmarked ? 'text-[#C5A059] bg-[#C5A059]/10' : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
        <div className="flex flex-wrap gap-2 justify-end">
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/20"
            >
              <Edit3 size={14} />
              {actionLabel}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs font-bold uppercase tracking-widest text-red-200"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
        {extraActions}
      </div>
    </div>
    <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t border-white/5 pt-4">
      <span className="inline-flex items-center gap-2">
        <Calendar size={14} />
        {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Recently added'}
      </span>
      <span className="inline-flex items-center gap-2">
        <MessageCircle size={14} />
        {project.author_name}
      </span>
      {project.lessons_learned && (
        <span className="inline-flex items-center gap-2 text-[#C5A059]">
          <Sparkles size={14} />
          Lesson logged
        </span>
      )}
    </div>
  </motion.div>
);

export default StudentDashboard;
