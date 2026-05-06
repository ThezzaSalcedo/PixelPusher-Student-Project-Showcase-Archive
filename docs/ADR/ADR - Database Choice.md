# Use Supabase for database - Fullstack Developer

> **Date**: April 4, 2026

> **Status**: Decided

## Context

We needed a database to securely store all the data to be used for our Student Project Showcase Archive.

## Options Considered

Supabase: open-source, allowing self-hosting to avoid vendor lock-in, and uses PostgreSQL’s native replication for real-time updates rather than proprietary NoSQL structures.
Firebase: uses a NoSQL document store (Firestore), excels in rapid mobile prototyping and real-time synchronization, and has a mature, all-in-one ecosystem.
Appwrite: uses a lightweight document-based structure and is often considered easy to set up, fast in performance tests, and versatile for mobile/Flutter projects.

## Decision

We chose Supabase since providing a full, robust PostgreSQL relational database, offering better data integrity, complex querying (joins), and SQL flexibility.

## Consequences

Choosing Supabase over Firebase provided us with a powerful, PostgreSQL-backed platform that excels in scalable relational data modeling, advanced native security features, predictable tiered pricing, and vendor independence through self-hosting. However, these robust capabilities come with notable trade-offs, primarily a steeper learning curve that requires managing database schemas and SQL rather than relying on a beginner-friendly, schema-less approach. Additionally, we have to navigate a much smaller community ecosystem, missing built-in mobile features like push notifications as well as a complex self-hosting maintenance process and strict free-tier limits that pause inactive projects.
