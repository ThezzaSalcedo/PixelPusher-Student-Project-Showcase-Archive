export type ProjectStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type SubmissionType = 'project' | 'thesis' | 'capstone';

export type AttachmentKind = 'pdf' | 'github' | 'image';

export interface ProjectAttachment {
  kind: AttachmentKind;
  url: string;
  label?: string;
}

export interface Contributor {
  name: string;
  email?: string;
}

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
  submission_type?: SubmissionType;
  attachments?: ProjectAttachment[];
  contributors?: Contributor[];
  version_group_id?: string;
  version_number?: number;
  is_latest_version?: boolean;
}
