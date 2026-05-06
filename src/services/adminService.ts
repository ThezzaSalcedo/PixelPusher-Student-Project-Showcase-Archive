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

// Shared in-memory database for User Management and Audit Trail (fully connected across all user roles)
let usersDB: AppUser[] = [...SAMPLE_USERS];
let auditLogsDB: AuditLog[] = [...SAMPLE_AUDIT_LOGS];

export const fetchUsers = async (): Promise<AppUser[]> => {
  return [...usersDB];
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<AppUser | null> => {
  const index = usersDB.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  usersDB[index] = { ...usersDB[index], role };
  return usersDB[index];
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  return [...auditLogsDB].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const logAuditEntry = async (actor: string, action: string, details: string): Promise<AuditLog | null> => {
  const newLog: AuditLog = {
    id: auditLogsDB.length + 1,
    timestamp: new Date().toISOString(),
    actor,
    action,
    details,
  };
  auditLogsDB.unshift(newLog);
  return newLog;
};