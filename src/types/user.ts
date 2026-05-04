export type UserRole = 'student' | 'faculty' | 'admin' | 'guest';

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  photo?: string;
  role: UserRole;
  onboarded: boolean;
}
