import type { Project } from '../types/project';

/** Stable numeric IDs so demo rows merge cleanly with Supabase auto-increment IDs. */
export const DEMO_PROJECT_IDS = {
  courseProject: 9_001,
  thesis: 9_002,
  capstone: 9_003,
  pendingShowcase: 9_004,
} as const;

const created = () => new Date().toISOString();

/**
 * Demo archive content: three submission types plus one pending item for faculty/admin queues.
 * Merged into API results so every role sees realistic data when the DB is empty or unreachable.
 */
export const DEMO_ARCHIVE_PROJECTS: Project[] = [
  {
    id: DEMO_PROJECT_IDS.courseProject,
    title: 'CampusWayfinder: Indoor Navigation for New Students',
    abstract:
      'CampusWayfinder is a mobile-first web application that helps first-year students locate rooms, labs, and faculty offices using building floor plans and searchable directories. The system combines vector maps, QR checkpoints, and a lightweight pathfinding layer so visitors can orient themselves without installing native apps. This undergraduate project documents requirements elicitation, UX testing with twenty student participants, and a deployment guide for institutional Wi-Fi. Lessons learned emphasize accessibility contrast ratios, offline-friendly caching, and maintaining map data when rooms are reassigned each term.',
    author_id: 'demo-student-project',
    author_name: 'Ana L. Reyes',
    author_contact: 'ana.reyes@neu.edu.ph',
    dept: 'CICS',
    program: 'BSIT',
    year: '2026',
    status: 'approved',
    submission_type: 'project',
    keywords: ['navigation', 'maps', 'UX', 'progressive-web-app', 'accessibility'],
    tech_stack: ['React', 'TypeScript', 'Vite', 'Leaflet'],
    lessons_learned:
      'Usability testing early prevented costly rework on map gestures and screen reader labels.',
    created_at: created(),
    version_group_id: 'demo-vg-course',
    version_number: 1,
    is_latest_version: true,
    contributors: [
      { name: 'Ana L. Reyes', email: 'ana.reyes@neu.edu.ph' },
      { name: 'Marco Villarin', email: 'marco.villarin@neu.edu.ph' },
    ],
    attachments: [
      {
        kind: 'pdf',
        label: 'Full project report',
        url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf',
      },
      {
        kind: 'github',
        label: 'Source repository',
        url: 'https://github.com/facebook/react',
      },
      {
        kind: 'image',
        label: 'Floor plan mock',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200',
      },
    ],
  },
  {
    id: DEMO_PROJECT_IDS.thesis,
    title: 'Predicting Student At-Risk Status Using Explainable Boosted Trees',
    abstract:
      'This thesis evaluates whether interpretable gradient boosting can forecast academic risk using registrar-safe features such as attendance streaks, LMS engagement, and assessment velocity. The study compares XGBoost with shallow decision rules, reports SHAP-style explanations for advisors, and discusses fairness constraints across scholarship cohorts. Data were anonymized and limited to historical cohorts with institutional review. Findings suggest modest lift over baseline logistic models while keeping explanations short enough for faculty advising sessions. The document includes methodology, ethical safeguards, replication notebook links, and recommendations for responsible deployment on campus.',
    author_id: 'demo-student-thesis',
    author_name: 'Jared K. Mendoza',
    author_contact: 'jared.mendoza@neu.edu.ph',
    dept: 'CICS',
    program: 'BSCS',
    year: '2025',
    status: 'approved',
    submission_type: 'thesis',
    keywords: ['machine-learning', 'explainability', 'student-success', 'xgboost', 'ethics'],
    tech_stack: ['Python', 'scikit-learn', 'XGBoost', 'Jupyter'],
    lessons_learned:
      'Explainability mattered more than raw accuracy when presenting results to non-technical stakeholders.',
    created_at: created(),
    version_group_id: 'demo-vg-thesis',
    version_number: 2,
    is_latest_version: true,
    contributors: [{ name: 'Jared K. Mendoza', email: 'jared.mendoza@neu.edu.ph' }],
    attachments: [
      {
        kind: 'pdf',
        label: 'Thesis manuscript (sample PDF)',
        url: 'https://www.africau.edu/images/default/sample.pdf',
      },
      {
        kind: 'github',
        label: 'Replication code',
        url: 'https://github.com/microsoft/TypeScript',
      },
      {
        kind: 'image',
        label: 'ROC curve figure',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
      },
    ],
  },
  {
    id: DEMO_PROJECT_IDS.capstone,
    title: 'NEU Archive: Role-Aware Showcase for Capstone Deliverables',
    abstract:
      'This capstone designs and prototypes a role-aware digital archive where graduating students publish capstone artifacts, theses, and reference projects for junior cohorts. The platform encodes submission types, multi-format attachments, contributor attribution, and bookmarking workflows for students and reviewers. A versioning model preserves prior submissions when authors resubmit after feedback. The narrative covers threat modeling for academic data, moderation queues for faculty, and admin audit trails. Deliverables include a live demo, deployment checklist, and evaluation with pilot departments.',
    author_id: 'demo-student-capstone',
    author_name: 'Sofia R. Navarro',
    author_contact: 'sofia.navarro@neu.edu.ph',
    dept: 'CICS',
    program: 'BSIT',
    year: '2026',
    status: 'approved',
    submission_type: 'capstone',
    keywords: ['archive', 'capstone', 'roles', 'versioning', 'bookmarks'],
    tech_stack: ['React', 'Supabase', 'Framer Motion'],
    lessons_learned:
      'Modeling versions separately from deletes kept trust high when students revised after review.',
    created_at: created(),
    version_group_id: 'demo-vg-capstone',
    version_number: 1,
    is_latest_version: true,
    contributors: [
      { name: 'Sofia R. Navarro', email: 'sofia.navarro@neu.edu.ph' },
      { name: 'Luis Tan', email: 'luis.tan@neu.edu.ph' },
      { name: 'Priya De Leon', email: 'priya.deleon@neu.edu.ph' },
    ],
    attachments: [
      {
        kind: 'pdf',
        label: 'Capstone documentation pack',
        url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf',
      },
      {
        kind: 'github',
        label: 'Monorepo',
        url: 'https://github.com/supabase/supabase',
      },
      {
        kind: 'image',
        label: 'Dashboard preview',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
      },
    ],
  },
  {
    id: DEMO_PROJECT_IDS.pendingShowcase,
    title: 'GreenGrid: Energy Dashboard for Campus Microgrids',
    abstract:
      'GreenGrid prototypes a faculty-reviewed dashboard that visualizes simulated microgrid loads, solar yield, and alert thresholds for maintenance teams. This submission is intentionally left pending to exercise approval queues for reviewers and administrators while students finalize instrumentation photos and their DOI link.',
    author_id: 'demo-student-pending',
    author_name: 'Ethan C. Ramos',
    author_contact: 'ethan.ramos@neu.edu.ph',
    dept: 'COE',
    program: 'BSEE',
    year: '2026',
    status: 'pending',
    submission_type: 'project',
    keywords: ['energy', 'dashboard', 'IoT', 'sustainability'],
    tech_stack: ['React', 'D3.js', 'Node.js'],
    lessons_learned: 'Pending demo entry used to validate moderation flows across dashboards.',
    created_at: created(),
    version_group_id: 'demo-vg-pending',
    version_number: 1,
    is_latest_version: true,
    contributors: [{ name: 'Ethan C. Ramos', email: 'ethan.ramos@neu.edu.ph' }],
    attachments: [
      {
        kind: 'github',
        label: 'Work in progress',
        url: 'https://github.com/nodejs/node',
      },
    ],
  },
];
