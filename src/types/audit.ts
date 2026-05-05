export interface AuditLog {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}
