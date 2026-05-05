# Contributing to NEU Project Archive

Welcome! To ensure the stability of the archive, all team members must follow these contribution guidelines.

## Getting Started in 30 Minutes
1.  **Sync the Repo:** Pull the latest changes from the `main` branch.
2.  **Environment Variables:** NEVER commit your `.env` file. Ask the Admin for the current Supabase and Google OAuth testing keys and place them in a local `.env` file.
3.  **Install & Run:** Run `npm install` followed by `npm run dev`.

## Branching Naming Conventions
* Features: `feat/dashboard-ui`
* Bugs: `bug/auth-domain-fix`
* Docs: `docs/test-cases-sprint1`

## Pull Request Process
1.  Ensure all code passes the local linter (`npm run lint`).
2.  Do not merge your own PRs. 
3.  The QA Lead must approve the PR after verifying that it passes the associated Test Cases.