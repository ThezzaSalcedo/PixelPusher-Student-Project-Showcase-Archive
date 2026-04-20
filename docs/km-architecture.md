# Knowledge Management Architecture: Pixel Pushers

This document defines the technical and conceptual structure of the Student Project Archive, guided by **Wiig’s KM Framework**.

1. Data Schema (Building Phase)
      What it’s for: This section defines the structure of the information you are collecting. It tells the Developer exactly what columns to create in the Supabase Postgres database.
      KM Purpose: In Wiig’s "Building" phase, knowledge must be codified to be useful. By requiring fields like "Methodology" and "Lessons Learned," you ensure the app captures Methodological and Expectational knowledge that would otherwise be lost when students graduate.
      Developer Impact: This guides the creation of the Project Upload Form and ensures the database can handle all required metadata.

| Field Name      |      Data Type      |      "KM Purpose (Wiig's ""Building"" Phase)"      |                                                           KM Rationale |
| --------------- | ------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id              |        UUID         |                Unique Identifier                   |   Essential for linking files and comments to a specific knowledge asset. |
| title           |        Text         |                Factual Knowledge                   |   Provides the primary label for the knowledge asset so it can be identified. |
| author contact  |        Text         |                Factual Knowledge                   |   Identifies "who knows what," allowing future students to create expert networks and seek "second opinions" or peer reviews. Must be a valid institutional email. |
| abstract        |        Text         |                Conceptual Knowledge                |   Summarizes the ""high-level"" understanding of the project for quick internalizing by future students. |
| methodology     |      Text/Enum      |              Methodological Knowledge              |   Documents how the project was done (e.g., Agile, Scrum), which is a core type of knowledge in Wiig’s model. |
| tech_stack      |      Array/Text     |                Factual Knowledge                   |   Identifies the specific tools used (e.g., React, Supabase) so future batches can find technical ""special knowledge"" sources. |
| lessons_learned |        Text         |             Expectational Knowledge                |   Captures ""tacit"" experiences and ""what we wish we knew,"" turning personal failures into shared organizational memory. |
| department      |        Text         |                Pooling Structure                   |   Allows knowledge to be ""pooled"" or grouped by academic domain for easier navigation. |
| academic_year   |       Integer       |                Contextual Memory                   |   Places the knowledge in a specific time period to track the evolution of research over generations. |
| author_ids      |       UUID[]        |               Personal Knowledge                   |   Connects the explicit project to the people who hold the personal expertise, allowing for future ""socialization"" if needed. |
| file_url        |        Text         |              Knowledge Repository                  |   The link to the actual PDF or code stored in Supabase Storage, representing the final explicit knowledge asset. |


2. Taxonomy (Pooling Phase)
      What it’s for: This is your classification system. It provides a standardized list of categories (Department, Year, Tech Stack) and tags.
      KM Purpose: Wiig’s "Pooling" phase is about coordinating and grouping knowledge assets so they are ready for collaborative access. Without a taxonomy, the archive is just a "messy pile of files"; with it, it becomes an organized repository.
      Developer Impact: The Developer uses this to build the tagging system and the fixed options in the dropdown menus of the upload form.

| Classification Category              |                                   Description                                |             Suggested Standardized Tags (Examples)             |                                                "KM Rationale (Wiig's ""Pooling"")" |
| ------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Academic Department                  |      The specific college or department the project originated from.         |                       Unique Identifier                        |    Essential for linking files and comments to a specific knowledge asset. |
| Project Type                         |      The nature of the output or application domain.                         |                       Factual Knowledge                        |    Provides the primary label for the knowledge asset so it can be identified. |
| Tech Stack                           |      The primary tools used (aligns with your technical documentation).      |                     Conceptual Knowledge                       |    Summarizes the ""high-level"" understanding of the project for quick internalizing by future students. |
| Research Methodology                 |      The framework used to conduct the study or development.                 |                   Methodological Knowledge                     |    Documents how the project was done (e.g., Agile, Scrum), which is a core type of knowledge in Wiig’s model. |
| Project Status                       |      The current state of the archived project.                              |                      Factual Knowledge                         |    Identifies the specific tools used (e.g., React, Supabase) so future batches can find technical ""special knowledge"" sources. |
| Academic Year                        |      The year the project was successfully defended.                         |                   Expectational Knowledge                      |    Captures ""tacit"" experiences and ""what we wish we knew,"" turning personal failures into shared organizational memory. |


3. Retrieval Logic Requirements (Wiig's "Applying" Phase)
      What it’s for: This section outlines the rules for how users find knowledge. It explains how the search bar should rank results and how filters should narrow down the "Pool" of projects.
      KM Purpose: In the "Applying" phase, the goal is to help students find "special knowledge" sources to solve their current research problems. Your logic ensures that the most applicable knowledge is easy to retrieve.
      Developer Impact: This tells the Developer how to configure the Postgres Full-Text Search and the Next.js filters. It ensures the search bar isn't just a basic tool, but a strategic portal for "Organizational Memory".
   
    1. Smart Search Bar Behavior
           - Full-Text Indexing: The search bar must use Postgres Full-Text Search to scan the Title, Abstract, and Lessons Learned fields simultaneously.
           - Partial Matching: The system should support partial keyword matching (e.g., searching "React" should find projects tagged with "React.js") to account for variations in student terminology.
           - Priority Ranking: Search results should be prioritized by relevance, with matches in the Title ranked higher than matches in the Abstract.

    2. Multi-Dimensional Filters
           - To facilitate "Pooling Knowledge", the interface must include a sidebar with the following filter capabilities:
           - Multi-select Tags (Tech Stack & Methodology): Users must be able to select multiple tags (e.g., "Python" + "Machine Learning") to find specific technical expertise.
           - Department/Program Dropdown: A filter to narrow results by academic domain (e.g., CS vs. IT) to ensure institutional context is preserved.
           - Year Range Slider: A way to filter by Academic Year (e.g., 2022–2024) to allow students to find either the most recent trends or "legacy" foundations.

    3. Identifying "Special Knowledge" Sources
           - Lessons Learned Highlight: When a user clicks a search result, the "Lessons Learned" or "Methodology" section should be prominently displayed to support the "Internalization" of the previous team's experience.
           - Contact Reference: Every project view must display the Author Contact to allow for socialization—turning the explicit archive back into a personal knowledge connection.
       

                                                                 **Summary Table for Developer**  

| Feature            |                               Requirement                                  |                             KM Rationale         |
| ------------------ | -------------------------------------------------------------------------- | -------------------------------------------------- |
| Search Engine      |     Postgres Full-Text Search on Title/Abstract/Tags.                      |     Ensures knowledge is "Available" for retrieval.  |                 
| Filters            |     The nature of the output or application domain.                        |     Allows ""Pooling"" of knowledge into searchable categories.  |           
| Results            |     The primary tools used (aligns with your technical documentation).     |     Helps users quickly assess if knowledge is "Applicable"     |     








Author: Alexza Gayle A. Ignacio
Date: April 17, 2026
