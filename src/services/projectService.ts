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

// Shared in-memory database for fully connected dashboards across all user roles
let projectsDB: Project[] = [...SAMPLE_PROJECTS];

export const fetchProjects = async (filters?: {
  dept?: string;
  program?: string;
  year?: string;
  status?: string;
  author_id?: string;
  query?: string;
}): Promise<Project[]> => {
  let result = [...projectsDB];

  if (filters?.status) {
    result = result.filter((p) => p.status === filters.status);
  }
  if (filters?.dept && filters.dept !== 'All') {
    result = result.filter((p) => p.dept === filters.dept);
  }
  if (filters?.program && filters.program !== 'All') {
    result = result.filter((p) => p.program === filters.program);
  }
  if (filters?.year && filters.year !== 'All') {
    result = result.filter((p) => p.year === filters.year);
  }
  if (filters?.author_id) {
    result = result.filter((p) => p.author_id === filters.author_id);
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }

  return result;
};

export const fetchStudentProjects = async (studentId: string): Promise<Project[]> => {
  return projectsDB
    .filter((project) => project.author_id === studentId)
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
};

export const fetchPendingProjects = async (): Promise<Project[]> => {
  return projectsDB
    .filter((project) => project.status === 'pending')
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
};

export const fetchBookmarkedProjects = async (userId: string): Promise<Project[]> => {
  // Demo: returns globally bookmarked projects (shared across users)
  return projectsDB.filter((project) => project.bookmarked);
};

export const toggleBookmark = async (projectId: number, userId: string) => {
  const project = projectsDB.find((item) => item.id === projectId);
  if (project) {
    project.bookmarked = !project.bookmarked;
  }
  return true;
};

export const sendContactMessage = async (
  fromUserId: string,
  toEmail: string,
  projectId: number,
  message: string
) => {
  console.log(`[DEMO] Contact message sent from ${fromUserId} to ${toEmail} for project ${projectId}: ${message}`);
  return true;
};

export const createProject = async (project: Partial<Project>): Promise<Project | null> => {
  const newProject: Project = {
    id: project.id || Date.now(),
    title: project.title || 'Untitled Project',
    abstract: project.abstract || '',
    author_id: project.author_id || 'unknown',
    author_name: project.author_name || 'Unknown Author',
    author_contact: project.author_contact || '',
    dept: project.dept || 'CICS',
    program: project.program || 'BSIT',
    year: project.year || '2026',
    status: project.status ?? 'pending',
    keywords: project.keywords || [],
    tech_stack: project.tech_stack || [],
    lessons_learned: project.lessons_learned || '',
    created_at: project.created_at || new Date().toISOString(),
    bookmarked: false,
  };

  projectsDB.unshift(newProject);
  return newProject;
};

export const updateProject = async (projectId: number, updates: Partial<Project>) => {
  const index = projectsDB.findIndex((p) => p.id === projectId);
  if (index === -1) return null;

  projectsDB[index] = { ...projectsDB[index], ...updates };
  return projectsDB[index];
};

export const deleteProject = async (projectId: number) => {
  const initialLength = projectsDB.length;
  projectsDB = projectsDB.filter((p) => p.id !== projectId);
  return projectsDB.length < initialLength;
};

export const approveProject = async (projectId: number) => {
  return updateProject(projectId, { status: 'approved' });
};

export const rejectProject = async (projectId: number) => {
  return updateProject(projectId, { status: 'rejected' });
};