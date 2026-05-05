# APA Academic Sources: Pixel Pushers Student Project Archive

---

## 1. Introduction: The Crisis of Knowledge Loss
In the academic environment, a significant amount of "Tacit Knowledge" is lost annually. When senior students graduate, their experiences—specifically the technical hurdles they overcame and the methodologies they found effective—leave the institution with them. This results in "Knowledge Fragmentation," where new students frequently repeat the mistakes of their predecessors.

**Pixel Pushers** is designed to solve this by creating a structured **Institutional Memory**. By using a digital repository, we capture the intellectual capital of the student body and transform it into a reusable organizational asset.

## 2. Theoretical Framework: Wiig’s KM Cycle
For this project, we have adopted **Karl Wiig’s Knowledge Management Cycle** (1993). Wiig’s framework is uniquely suited for a student archive because it focuses on how knowledge must be organized to support practical application and decision-making.

### 2.1 The Four Phases in Pixel Pushers
1. **Building:** We capture knowledge via a structured upload form. We don't just ask for a file; we require "Lessons Learned" to codify tacit experience into explicit data.
2. **Holding:** Knowledge is stored in a Supabase Postgres database. We use Row Level Security (RLS) to ensure the integrity and "Truth" of the archive.
3. **Pooling:** Through our taxonomy (Tech Stack, Year, Department), we group related knowledge so it can be searched as a collective library.
4. **Applying:** Users retrieve knowledge through a specialized search engine that prioritizes "Methodology" and "Lessons Learned," allowing them to apply past solutions to current problems.

### 2.2 Why Wiig? A Comparison with the SECI Model
In the early stages of our discovery phase, we considered the SECI Model (Socialization, Externalization, Combination, Internalization). While SECI is excellent for explaining how knowledge flows between people in an office or classroom, we found it lacked the technical "storage" rigor required for a digital repository.

We specifically chose Wiig’s KM Cycle over SECI for three strategic reasons:

* Focus on Knowledge "Holding" (Security):
SECI focuses on the process of conversion (e.g., talking to a teammate). However, Pixel Pushers is a software system that must securely hold data. Wiig’s "Holding" phase provided us with a theoretical justification for implementing Row Level Security (RLS). In Wiig’s view, knowledge is an asset that must be protected and maintained to remain valuable over time.

* Structuring for Decision-Making:
The SECI model is very fluid, but a database is rigid. Wiig’s model emphasizes the Building phase—the need to codify knowledge into specific types (Factual, Methodological, Expectational). This directly influenced our decision to create a structured upload form. Unlike SECI, which might just encourage "sharing," Wiig encouraged us to "categorize," leading to our decision to use a standardized Taxonomy.

* The "Applying" Phase vs. "Internalization":
While SECI ends with "Internalization" (the individual learning), Wiig ends with "Applying" (the knowledge solving a problem). For a student archive, the goal isn't just for a student to read a project; it's for them to apply the methodology or the lessons learned to their own current project. Wiig’s focus on the utility of knowledge guided our search and filter functionality.

By choosing Wiig, we moved away from a simple "social network" concept and toward a professional Knowledge Management System (KMS) that functions as a reliable, secure, and highly searchable institutional memory.

## 3. Knowledge Categorization
According to Wiig, knowledge is not a single entity but exists in different forms. Pixel Pushers captures four specific types:

* **Factual Knowledge:** Stored as project titles and academic years.
* **Conceptual Knowledge:** Captured in the "Abstract" to provide high-level understanding.
* **Methodological Knowledge:** Stored in the "Methodology" field to explain the *process* of development (e.g., Agile).
* **Expectational Knowledge:** Captured in the "Lessons Learned" field. This is the most critical as it documents expectations vs. reality.

### 3.1 Mitigating Technical Debt via 'Lessons Learned'
By mandating a "Lessons Learned" field, we target **Expectational Knowledge**. This documents technical pitfalls—for example, if a previous team noted that a specific library caused performance lag, a new student can avoid it.

This avoids technical debt in three ways:
1.  **Preventative Decision-Making:** Better architectural choices early on.
2.  **Reduction of Rework:** Bypassing known dead-ends.
3.  **Transfer of Tacit Warnings:** Turning a teammate's "mistake" into a permanent "holding" asset.

## 4. Governance and Security (The Holding Phase)
To maintain a reliable "Holding" phase, we implemented **Row Level Security (RLS)** and **Role-Based Access Control (RBAC)** via Supabase.

* **Integrity:** RLS ensures only authors can modify their work, preventing the corruption of the archive.
* **Validation:** The **Faculty role** acts as a "Knowledge Steward," validating the quality of submissions before they are pooled into the public library.
* **Institutional Access:** Authentication is strictly limited to `@neu.edu.ph` domains to ensure the repository remains a private institutional asset.

## 5. Technical Stack
The **Pixel Pushers** architecture is built for speed, security, and institutional scalability.

* **Frontend:** React (Vite) with Tailwind CSS for a responsive, high-performance UI.
* **Backend:** Supabase integration utilizing:
    * **Auth:** Managed Google OAuth and Email/Password flows restricted to `@neu.edu.ph` domains.
    * **Postgres Database:** High-integrity relational storage for project metadata.
    * **Storage:** Secure bucket storage for academic files and project assets.
* **Database Patterns:**
    * **Row Level Security (RLS):** Granular access control policies that protect student data at the row level.
    * **Upsert Logic:** Efficient profile persistence that ensures user data is synchronized upon every login without creating duplicate records.
    * **Fault-Tolerant Auth:** Implementation of timeout guards and local state fallbacks to prevent UI deadlocks during high-latency database operations.
