import supabase from '../lib/supabase';
import type { Project } from '../types/project';

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
  },
];

const guardData = <T>(data: T | null, error: any, fallback: T): T => {
  if (error) {
    console.warn('Supabase project fetch error:', error);
    return fallback;
  }
  return data as T;
};

export const fetchProjects = async (filters?: {
  dept?: string;
  program?: string;
  year?: string;
  status?: string;
  author_id?: string;
  query?: string;
}): Promise<Project[]> => {
  const query = supabase.from('projects').select('*');

  if (filters?.dept && filters.dept !== 'All') query.eq('dept', filters.dept);
  if (filters?.program && filters.program !== 'All') query.eq('program', filters.program);
  if (filters?.year && filters.year !== 'All') query.eq('year', filters.year);
  if (filters?.status) query.eq('status', filters.status);
  if (filters?.author_id) query.eq('author_id', filters.author_id);

  if (filters?.query) {
    const search = `%${filters.query}%`;
    query.ilike('title', search);
  }

  const { data, error } = await query;
  return guardData(data, error, SAMPLE_PROJECTS);
};

export const fetchStudentProjects = async (studentId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('author_id', studentId)
    .order('created_at', { ascending: false });

  return guardData(data, error, SAMPLE_PROJECTS.filter((project) => project.author_id === studentId));
};

export const fetchPendingProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return guardData(data, error, SAMPLE_PROJECTS.filter((project) => project.status === 'pending'));
};

export const fetchBookmarkedProjects = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('bookmarked_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase fetchBookmarkedProjects error:', error);
    return SAMPLE_PROJECTS.filter((project) => project.bookmarked);
  }

  return data || SAMPLE_PROJECTS.filter((project) => project.bookmarked);
};

export const toggleBookmark = async (projectId: number, userId: string) => {
  const project = SAMPLE_PROJECTS.find((item) => item.id === projectId);
  if (project) project.bookmarked = !project.bookmarked;

  try {
    const { error } = await supabase.from('bookmarks').upsert({ project_id: projectId, user_id: userId });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Supabase toggleBookmark error:', error);
    return true;
  }
};

export const sendContactMessage = async (
  fromUserId: string,
  toEmail: string,
  projectId: number,
  message: string
) => {
  const { error } = await supabase.from('contacts').insert([{ from_user_id: fromUserId, recipient_email: toEmail, project_id: projectId, message }]);
  if (error) {
    console.warn('Supabase sendContactMessage error:', error);
    return false;
  }
  return true;
};

export const createProject = async (project: Partial<Project>): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .insert([{ ...project, status: project.status ?? 'pending' }])
    .single();

  if (error) {
    console.warn('Supabase create project error:', error);
    return null;
  }

  return data as Project | null;
};

export const updateProject = async (projectId: number, updates: Partial<Project>) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .single();

  if (error) {
    console.warn('Supabase update project error:', error);
    return null;
  }

  return data;
};

export const deleteProject = async (projectId: number) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.warn('Supabase delete project error:', error);
    return false;
  }

  return true;
};

export const approveProject = async (projectId: number) => {
  return updateProject(projectId, { status: 'approved' });
};

export const rejectProject = async (projectId: number) => {
  return updateProject(projectId, { status: 'rejected' });
};
