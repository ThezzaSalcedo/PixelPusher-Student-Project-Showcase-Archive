export type ProjectStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Project {
  id: number;
  title: string;
  abstract?: string;
  author_id?: string;
  author_name: string;
  author_contact?: string;
  dept: string;
  program: string;
  year: string;
  status: ProjectStatus;
  keywords: string[];
  tech_stack?: string[];
  lessons_learned?: string;
  created_at?: string;
  bookmarked?: boolean;
}
