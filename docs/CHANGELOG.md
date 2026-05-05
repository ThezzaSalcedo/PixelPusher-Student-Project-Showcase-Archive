# Changelog

## [0.1.0] - Sprint 1
### Added
* Initial React + Vite scaffolding.
* Tailwind CSS and Framer Motion configurations for "Dark Mode" UI.
* `AuthContext.tsx` implementing Google OAuth and `@neu.edu.ph` domain gating.
* Base routing for Student, Faculty, and Admin dashboards via `App.tsx`.
* Mock Supabase setup and initial database schema integration.

### Security
* Implemented protected routes (`RoleGuard`) preventing unauthorized dashboard access.