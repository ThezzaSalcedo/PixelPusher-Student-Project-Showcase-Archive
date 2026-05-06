# KM Analyst Prompt Log: Pixel Pushers Project

This log documents the AI-assisted engineering process for the KM Analyst role, focusing on the application of Wiig’s KM Cycle to the Student Project Archive.

## Entry 1: Framework Selection and Rationale
**Prompt:** "I am the KM Analyst for a student project archive. Explain Wiig’s KM Cycle and why it is better than SECI for a digital repository."
**AI Assistance:** The AI explained the four phases (Building, Holding, Pooling, Applying) and contrasted them with SECI's socialization focus.
**Human Decision:** I decided to move forward with Wiig because our project is "repository-heavy," and Wiig’s "Holding" phase justifies our need for database security (RLS).

## Entry 2: Data Schema and Taxonomy Design
**Prompt:** "What columns do I need in Supabase to capture Factual, Methodological, and Expectational knowledge according to Wiig?"
**AI Assistance:** Provided a list of fields including 'Methodology' and 'Lessons Learned'.
**Human Decision:** I filtered the AI's list to include a 'Tech Stack' array and 'Author Contact' to ensure we facilitate "Socialization" after a user finds a project.

## Entry 3: Security and Knowledge Integrity
**Prompt:** "Give me the SQL logic for Supabase Row Level Security (RLS) to protect our organizational memory."
**AI Assistance:** Generated SQL scripts for SELECT, INSERT, and UPDATE policies.
**Human Decision:** I verified that the UPDATE policy specifically checks `auth.uid() == user_id`, ensuring the "Holding" phase is secure and only authors can edit their data.

## Entry 4: Functional Requirements by User Role
**Prompt:** "What are the specific features for Student, Faculty, and Admin roles in a Wiig-based KM system?"
**AI Assistance:** Defined roles like 'Knowledge Creator' for students and 'Knowledge Validator' for Faculty.
**Human Decision:** I adopted the "Faculty Approval" requirement to act as a quality gate for the "Pooling" phase, ensuring only high-quality data enters the public archive.

## Entry 5: Mitigating Technical Debt via Lessons Learned
**Prompt:** "Explain how the 'Lessons Learned' section helps a new student avoid technical debt."
**AI Assistance:** Linked "Expectational Knowledge" to preventative decision-making and architectural choices.
**Human Decision:** I drafted this into the final KM Conceptual Report to prove the business value of our KM system to the instructor.
