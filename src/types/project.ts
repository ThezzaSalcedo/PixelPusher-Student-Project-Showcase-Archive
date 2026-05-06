export type ProjectStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Project {
  id: number;
  title: string;
  summary?: string;
  abstract?: string;
  request_reason?: string;
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
  tags?: string[];
  collaborators?: string[];
  version?: number;
  assets?: {
    pdfs?: string[];
    pdfExtractText?: string;
    links?: string[];
    files?: string[];
    images?: string[];
  };
  created_at?: string;
  bookmarked?: boolean;
}
