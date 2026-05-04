import supabase from '../lib/supabase';
import type { AppUser, UserRole } from '../types/user';
import type { AuditLog } from '../types/audit';

const SAMPLE_USERS: AppUser[] = [
  { id: 'u1', displayName: 'Liza Santos', email: 'liza.santos@neu.edu.ph', role: 'student', photo: '', onboarded: true },
  { id: 'u2', displayName: 'Dr. Rey Cruz', email: 'rey.cruz@neu.edu.ph', role: 'faculty', photo: '', onboarded: true },
  { id: 'u3', displayName: 'Mia Tan', email: 'mia.tan@neu.edu.ph', role: 'admin', photo: '', onboarded: true },
];

const SAMPLE_AUDIT_LOGS: AuditLog[] = [
  { id: 1, timestamp: new Date().toISOString(), actor: 'Mia Tan', action: 'Approved Project', details: 'Project PixelPusher was approved by Admin.' },
  { id: 2, timestamp: new Date().toISOString(), actor: 'Dr. Rey Cruz', action: 'Requested Revision', details: 'Pending Hydro-Sense for missing methodology details.' },
  { id: 3, timestamp: new Date().toISOString(), actor: 'Liza Santos', action: 'Submitted Project', details: 'Lexicon AI project submitted for review.' },
];

export const fetchUsers = async (): Promise<AppUser[]> => {
  const { data, error } = await supabase.from('profiles').select('id, displayName, email, role, photo, onboarded');
  if (error) {
    console.warn('Supabase fetchUsers error:', error);
    return SAMPLE_USERS;
  }
  return data || SAMPLE_USERS;
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<AppUser | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('Supabase updateUserRole error:', error);
    const fallbackUser = SAMPLE_USERS.find((user) => user.id === userId);
    if (!fallbackUser) return null;
    return { ...fallbackUser, role };
  }

  return data as AppUser | null;
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
  if (error) {
    console.warn('Supabase fetchAuditLogs error:', error);
    return SAMPLE_AUDIT_LOGS;
  }
  return (data as AuditLog[]) || SAMPLE_AUDIT_LOGS;
};

export const logAuditEntry = async (actor: string, action: string, details: string): Promise<AuditLog | null> => {
  const { data, error } = await supabase.from('audit_logs').insert([{ actor, action, details }]).single();
  if (error) {
    console.warn('Supabase logAuditEntry error:', error);
    return { id: SAMPLE_AUDIT_LOGS.length + 1, timestamp: new Date().toISOString(), actor, action, details };
  }
  return data as AuditLog | null;
};
