export type IconKey =
  | 'code'
  | 'terminal'
  | 'git'
  | 'faculty'
  | 'college'
  | 'library'
  | 'layers'
  | 'python'
  | 'java'
  | 'ai'
  | 'frontend'
  | 'analytics'
  | 'project'
  | 'mentor'
  | 'workshop'
  | 'career'
  | 'curriculum'
  | 'certificate'
  | 'discover'
  | 'learn'
  | 'practice'
  | 'build'
  | 'certify'
  | 'placement'
  | 'hackathon'
  | 'mou'
  | 'compass'
  | 'briefcase'
  | 'book'

export type Audience = 'For students' | 'For colleges' | 'For everyone'

export type Stat = {
  label: string
  value: number
  suffix?: string
  format?: 'comma'
}

export type Partner = {
  name: string
}

export type Feature = {
  icon: IconKey
  title: string
  description: string
  audience: Audience
}

export type LearningPath = {
  slug: string
  title: string
  blurb: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  projects: number
  modules: string[]
  skills: string[]
  icon: IconKey
  featured?: boolean
}

export type Benefit = {
  icon: IconKey
  title: string
  description: string
}

export type JourneyStep = {
  icon: IconKey
  title: string
  description: string
  milestone: string
}

export type InstitutionHighlight = {
  icon: IconKey
  title: string
  description: string
}

export type Testimonial = {
  id: string
  category: 'student' | 'faculty'
  quote: string
  name: string
  role: string
  institution: string
  outcome: string
  initials: string
}

export type Insight = {
  title: string
  excerpt: string
  category: 'Programming' | 'Technology' | 'Career Development'
  readTime: string
  author: string
  date: string
  image: string
  imageAlt: string
  href: string
  featured?: boolean
}

export type FaqCategory = {
  id: string
  label: string
  items: { question: string; answer: string }[]
}

export type CodeToken = {
  text: string
  tone?: 'plain' | 'keyword' | 'string' | 'function' | 'comment' | 'number' | 'tag'
}

export type CodeSnippet = {
  id: string
  label: string
  file: string
  lines: CodeToken[][]
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const hero = {
  eyebrow: 'Learn • Build • Innovate',
  headline: ['Learn programming.', 'Build real projects.', 'Become industry ready.'],
  description:
    'ReadnRevise equips students with mentor-led, project-based programming skills — and partners with colleges to close the gap between academic theory and industry practice.',
  primaryCta: { label: 'Explore Courses', href: '/courses' },
  secondaryCta: { label: 'Partner With Us', href: '/for-institution' },
  proof: [
    { label: '25,000+ learners', detail: 'across 150+ campuses' },
    { label: '4.9/5 mentor rating', detail: 'from 6,200 reviews' },
    { label: 'Verified credentials', detail: 'backed by capstone proof' },
  ],
}

export const heroSnippets: CodeSnippet[] = [
  {
    id: 'react',
    label: 'React 19',
    file: 'enrollment.tsx',
    lines: [
      [{ text: "'use client'", tone: 'string' }],
      [
        { text: 'import', tone: 'keyword' },
        { text: ' { useOptimistic } ' },
        { text: 'from', tone: 'keyword' },
        { text: " 'react'", tone: 'string' },
      ],
      [],
      [
        { text: 'export function ', tone: 'keyword' },
        { text: 'Enrollment', tone: 'function' },
        { text: '({ cohort }: Cohort) {' },
      ],
      [
        { text: '  const ' },
        { text: '[students, add]', tone: 'plain' },
        { text: ' = ' },
        { text: 'useOptimistic', tone: 'function' },
        { text: '(cohort.students)' },
      ],
      [],
      [
        { text: '  return', tone: 'keyword' },
        { text: ' (' },
      ],
      [
        { text: '    <', tone: 'tag' },
        { text: 'Squad', tone: 'tag' },
        { text: ' onJoin={(s) => ' },
        { text: 'add', tone: 'function' },
        { text: '(s)}>' },
      ],
      [
        { text: '      {students.map((s) => ' },
        { text: '<', tone: 'tag' },
        { text: 'Learner', tone: 'tag' },
        { text: ' key={s.id} />' },
      ],
      [
        { text: '    </', tone: 'tag' },
        { text: 'Squad', tone: 'tag' },
        { text: '>' },
      ],
      [{ text: '  )' }],
      [{ text: '}' }],
    ],
  },
  {
    id: 'rag',
    label: 'GenAI & RAG',
    file: 'tutor.ts',
    lines: [
      [
        { text: 'import', tone: 'keyword' },
        { text: ' { embed, rerank, stream } ' },
        { text: 'from', tone: 'keyword' },
        { text: " '@readnrevise/rag'", tone: 'string' },
      ],
      [],
      [
        { text: 'export async function ', tone: 'keyword' },
        { text: 'askTutor', tone: 'function' },
        { text: '(question: string) {' },
      ],
      [
        { text: '  const ' },
        { text: 'vector', tone: 'plain' },
        { text: ' = ' },
        { text: 'await', tone: 'keyword' },
        { text: ' ' },
        { text: 'embed', tone: 'function' },
        { text: '(question)' },
      ],
      [
        { text: '  const ' },
        { text: 'docs', tone: 'plain' },
        { text: ' = ' },
        { text: 'await', tone: 'keyword' },
        { text: ' ' },
        { text: 'retriever.search', tone: 'function' },
        { text: '(vector, { k: ' },
        { text: '4', tone: 'number' },
        { text: ' })' },
      ],
      [],
      [
        { text: '  // keep answers grounded in course material', tone: 'comment' },
      ],
      [
        { text: '  const ' },
        { text: 'context', tone: 'plain' },
        { text: ' = ' },
        { text: 'await', tone: 'keyword' },
        { text: ' ' },
        { text: 'rerank', tone: 'function' },
        { text: '(question, docs)' },
      ],
      [
        { text: '  return', tone: 'keyword' },
        { text: ' ' },
        { text: 'stream', tone: 'function' },
        { text: '({ question, context })' },
      ],
      [{ text: '}' }],
    ],
  },
  {
    id: 'fastapi',
    label: 'Python FastAPI',
    file: 'main.py',
    lines: [
      [
        { text: 'from', tone: 'keyword' },
        { text: ' fastapi ' },
        { text: 'import', tone: 'keyword' },
        { text: ' FastAPI' },
      ],
      [
        { text: 'from', tone: 'keyword' },
        { text: ' pydantic ' },
        { text: 'import', tone: 'keyword' },
        { text: ' BaseModel' },
      ],
      [],
      [{ text: 'app', tone: 'plain' }, { text: ' = ' }, { text: 'FastAPI', tone: 'function' }, { text: '()' }],
      [],
      [
        { text: 'class ', tone: 'keyword' },
        { text: 'Submission', tone: 'function' },
        { text: '(BaseModel):' },
      ],
      [
        { text: '    learner_id: ' },
        { text: 'str', tone: 'keyword' },
      ],
      [
        { text: '    repo_url: ' },
        { text: 'str', tone: 'keyword' },
      ],
      [],
      [
        { text: '@app.post', tone: 'function' },
        { text: '(' },
        { text: "'/submissions'", tone: 'string' },
        { text: ')' },
      ],
      [
        { text: 'async def ', tone: 'keyword' },
        { text: 'submit', tone: 'function' },
        { text: '(payload: Submission):' },
      ],
      [
        { text: '    return ', tone: 'keyword' },
        { text: 'await', tone: 'keyword' },
        { text: ' pipeline.enqueue(payload)' },
      ],
    ],
  },
]

export const heroMentor = {
  name: 'Ananya S.',
  role: 'Senior engineer · mentor',
  status: 'Review approved',
  note: 'Clean state model. Ship it.',
  lesson: 'Lesson 04 · Data flow',
  progress: 62,
}

export const heroPlacement = {
  value: 94,
  label: 'Placement readiness',
  caption: 'after capstone review',
}

export const heroCertificate = {
  title: 'Verified certificate',
  serial: 'RN-2026-04821',
}

/* ------------------------------------------------------------------ */
/* Trust                                                               */
/* ------------------------------------------------------------------ */

export const trustStats: Stat[] = [
  { label: 'Partner colleges', value: 150, suffix: '+' },
  { label: 'Student enrollments', value: 25000, suffix: '+', format: 'comma' },
  { label: 'Workshops delivered', value: 500, suffix: '+' },
  { label: 'Industry mentors', value: 200, suffix: '+' },
  { label: 'Certifications issued', value: 18000, suffix: '+', format: 'comma' },
]

export const partners: Partner[] = [
  { name: 'Aurora Institute of Technology' },
  { name: 'Meridian University' },
  { name: 'Northline College of Engineering' },
  { name: 'Crestwood University' },
  { name: 'Vantage Institute' },
  { name: 'Sunrise Polytechnic' },
  { name: 'Orbit Business School' },
  { name: 'Greenfield College' },
  { name: 'Helix Institute' },
  { name: 'Summit University' },
  { name: 'Nimbus College' },
  { name: 'Beacon Tech Academy' },
]

/* ------------------------------------------------------------------ */
/* What we do                                                          */
/* ------------------------------------------------------------------ */

export const whatWeDo: Feature[] = [
  {
    icon: 'code',
    title: 'Programming Courses',
    description:
      'Project-driven bootcamps in full stack, Python, Java, and AI — taught live by practising engineers.',
    audience: 'For students',
  },
  {
    icon: 'terminal',
    title: 'Technical Workshops',
    description:
      'Hands-on sandbox labs on the tools shipping teams use: APIs, cloud, Git workflows, and AI tooling.',
    audience: 'For students',
  },
  {
    icon: 'git',
    title: 'Industry Projects',
    description:
      'Production-style capstones with sprint reviews, pull requests, and a deployed artefact you can defend.',
    audience: 'For students',
  },
  {
    icon: 'faculty',
    title: 'Faculty Development',
    description:
      'Structured FDPs that help professors teach modern stacks, review projects, and use industry briefs.',
    audience: 'For colleges',
  },
  {
    icon: 'college',
    title: 'College Collaboration',
    description:
      'Centers of Excellence, curriculum co-design, and MOUs with clear academic outcomes and review cycles.',
    audience: 'For colleges',
  },
  {
    icon: 'library',
    title: 'Learning Resources',
    description:
      'Cheatsheets, practice decks, assessment banks, and reference labs that keep learning going between sessions.',
    audience: 'For everyone',
  },
]

/* ------------------------------------------------------------------ */
/* Learning paths                                                      */
/* ------------------------------------------------------------------ */

export const learningPaths: LearningPath[] = [
  {
    slug: 'full-stack',
    title: 'Full Stack Web Architecture',
    blurb: 'Design, build, and deploy end-to-end products with React, Node, and PostgreSQL.',
    level: 'Advanced',
    duration: '24 weeks',
    projects: 6,
    modules: ['React architecture & state', 'API design with Node', 'Deployments & observability'],
    skills: ['React 19', 'PostgreSQL', 'TypeScript'],
    icon: 'layers',
    featured: true,
  },
  {
    slug: 'python',
    title: 'Python Programming & Automation',
    blurb: 'From first script to scheduled automation, with clean, testable Python throughout.',
    level: 'Beginner',
    duration: '12 weeks',
    projects: 4,
    modules: ['Language foundations', 'Automation & scraping', 'Testing with pytest'],
    skills: ['Python 3.13', 'Automation', 'pytest'],
    icon: 'python',
  },
  {
    slug: 'java',
    title: 'Enterprise Java & Spring Boot',
    blurb: 'Build secure, production-grade services the way enterprise teams actually ship them.',
    level: 'Intermediate',
    duration: '16 weeks',
    projects: 5,
    modules: ['Java 21 & concurrency', 'Spring Boot APIs', 'Security & testing'],
    skills: ['Java 21', 'Spring Boot', 'JUnit'],
    icon: 'java',
  },
  {
    slug: 'ai-ml',
    title: 'AI & Machine Learning Engineering',
    blurb: 'Train, evaluate, and deploy models — including retrieval-augmented applications.',
    level: 'Advanced',
    duration: '20 weeks',
    projects: 5,
    modules: ['Model evaluation', 'RAG pipelines', 'Serving & monitoring'],
    skills: ['PyTorch', 'RAG', 'FastAPI'],
    icon: 'ai',
    featured: true,
  },
  {
    slug: 'frontend',
    title: 'Modern Frontend Engineering & UI/UX',
    blurb: 'Accessible interfaces, design systems, and performance work that survives real traffic.',
    level: 'Intermediate',
    duration: '14 weeks',
    projects: 4,
    modules: ['Design systems', 'Accessibility & motion', 'Performance budgets'],
    skills: ['Next.js', 'Tailwind CSS', 'Figma'],
    icon: 'frontend',
  },
  {
    slug: 'data-analytics',
    title: 'Data Analytics & Business Intelligence',
    blurb: 'Turn messy data into decisions with SQL, dashboards, and business storytelling.',
    level: 'Beginner',
    duration: '10 weeks',
    projects: 3,
    modules: ['Advanced SQL', 'Dashboard design', 'Insight storytelling'],
    skills: ['SQL', 'Power BI', 'Python'],
    icon: 'analytics',
  },
]

/* ------------------------------------------------------------------ */
/* Why ReadnRevise                                                     */
/* ------------------------------------------------------------------ */

export const benefits: Benefit[] = [
  {
    icon: 'project',
    title: 'Project-based learning',
    description: 'Every module ends in something deployed, reviewed, and added to your portfolio.',
  },
  {
    icon: 'mentor',
    title: 'Industry mentors',
    description: 'Practising engineers review your code, your decisions, and your architecture weekly.',
  },
  {
    icon: 'workshop',
    title: 'Hands-on workshops',
    description: 'Half-day labs on the tooling and workflows real product teams use every day.',
  },
  {
    icon: 'career',
    title: 'Career guidance',
    description: 'Resume, portfolio, mock interviews, and offer evaluation with dedicated coaches.',
  },
  {
    icon: 'curriculum',
    title: 'Modern curriculum',
    description: 'Paths refreshed each term around current stacks, patterns, and hiring signals.',
  },
  {
    icon: 'certificate',
    title: 'Verified certificates',
    description: 'Shareable credentials backed by capstone evidence — not attendance sheets.',
  },
]

export const comparison = {
  traditionalTitle: 'Traditional tracks',
  traditionalItems: [
    'Recorded lectures, no feedback loop',
    'Toy projects copied from tutorials',
    'Certificates with nothing behind them',
    'Syllabus updated once a year',
  ],
  readnreviseTitle: 'The ReadnRevise way',
  readnreviseItems: [
    'Live mentor reviews every sprint',
    'Production-grade capstone on GitHub',
    'Verified credentials with proof of work',
    'Curriculum refreshed each term',
  ],
}

/* ------------------------------------------------------------------ */
/* Student journey                                                     */
/* ------------------------------------------------------------------ */

export const journeySteps: JourneyStep[] = [
  {
    icon: 'discover',
    title: 'Discover',
    description: 'Take a skill diagnostic and choose a path with a mentor.',
    milestone: 'Skill map + path plan',
  },
  {
    icon: 'learn',
    title: 'Learn',
    description: 'Live sessions and labs on the fundamentals that compound.',
    milestone: 'Weekly concept checks',
  },
  {
    icon: 'practice',
    title: 'Practice',
    description: 'Graded problems with instant feedback and peer review.',
    milestone: 'Practice score ≥ 80%',
  },
  {
    icon: 'build',
    title: 'Build projects',
    description: 'Ship a production-style capstone inside a sprint team.',
    milestone: 'Mentor-approved PR',
  },
  {
    icon: 'certify',
    title: 'Earn certificate',
    description: 'Pass the assessment and publish a verified credential.',
    milestone: 'Digital badge + QR',
  },
  {
    icon: 'career',
    title: 'Career ready',
    description: 'Interview with portfolio proof and structured placement support.',
    milestone: 'Offer-ready profile',
  },
]

/* ------------------------------------------------------------------ */
/* Institutions                                                        */
/* ------------------------------------------------------------------ */

export const institutionStats: Stat[] = [
  { label: 'Partner campuses', value: 150, suffix: '+' },
  { label: 'Faculty trained', value: 2400, suffix: '+', format: 'comma' },
  { label: 'MOUs signed', value: 38 },
]

export const institutionHighlights: InstitutionHighlight[] = [
  {
    icon: 'faculty',
    title: 'Faculty development',
    description: 'FDPs that move professors from theory to modern, project-led delivery.',
  },
  {
    icon: 'workshop',
    title: 'Industry workshops',
    description: 'Hands-on sessions on AI, cloud, and full-stack tooling, delivered on campus.',
  },
  {
    icon: 'curriculum',
    title: 'Curriculum enhancement',
    description: 'Semester-aligned modules co-designed with working engineers.',
  },
  {
    icon: 'placement',
    title: 'Placement training',
    description: 'Mock interviews, coding drills, and drives with hiring partners.',
  },
  {
    icon: 'hackathon',
    title: 'Campus hackathons',
    description: 'Theme-based build sprints judged by industry panels.',
  },
  {
    icon: 'mou',
    title: 'Institutional MOUs',
    description: 'Long-term collaboration with clear outcomes and review cycles.',
  },
]

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

export const testimonials: Testimonial[] = [
  {
    id: 'aarav',
    category: 'student',
    quote:
      'The sprint reviews were demanding in the best way. By the time I interviewed, shipping under review felt routine — not scary.',
    name: 'Aarav Mehta',
    role: 'Full Stack cohort, 2025',
    institution: 'Aurora Institute of Technology',
    outcome: 'Placed at ₹18 LPA',
    initials: 'AM',
  },
  {
    id: 'priya',
    category: 'student',
    quote:
      'I arrived knowing syntax and left knowing how to evaluate a model, defend a design decision, and actually ship it.',
    name: 'Priya Nair',
    role: 'AI & ML cohort, 2025',
    institution: 'Meridian University',
    outcome: 'ML Engineer offer',
    initials: 'PN',
  },
  {
    id: 'rohan',
    category: 'student',
    quote:
      'My GitHub finally looked like an engineer’s GitHub. Recruiters asked about the capstone, not my marksheet.',
    name: 'Rohan Gupta',
    role: 'Frontend cohort, 2024',
    institution: 'Northline College of Engineering',
    outcome: '3 offers before graduation',
    initials: 'RG',
  },
  {
    id: 'meera',
    category: 'faculty',
    quote:
      'Our faculty now teach from live industry briefs. The change in classroom energy is impossible to ignore.',
    name: 'Dr. Meera Iyer',
    role: 'Dean, Academics',
    institution: 'Crestwood University',
    outcome: '92% FDP participation',
    initials: 'MI',
  },
  {
    id: 'raman',
    category: 'faculty',
    quote:
      'ReadnRevise sat with us and rebuilt the semester-six lab around real delivery. It is the most useful academic partnership we have signed.',
    name: 'Prof. S. Raman',
    role: 'Head of Department, CSE',
    institution: 'Vantage Institute',
    outcome: 'Placement rate up 31%',
    initials: 'SR',
  },
  {
    id: 'ananya',
    category: 'faculty',
    quote:
      'They did not sell us a course catalogue. They designed a center of excellence with us — and stayed to run it.',
    name: 'Dr. Ananya Bose',
    role: 'Principal',
    institution: 'Summit University',
    outcome: '3 MOUs · CoE launched',
    initials: 'AB',
  },
]

/* ------------------------------------------------------------------ */
/* Insights                                                            */
/* ------------------------------------------------------------------ */

export const insights: Insight[] = [
  {
    title: 'The 2026 full-stack roadmap: what hiring teams actually test',
    excerpt:
      'We reviewed 120 campus hiring loops to find the signals that separate portfolio projects from production-ready work.',
    category: 'Programming',
    readTime: '8 min read',
    author: 'Nikhil Rao',
    date: 'Nov 12, 2026',
    image: '/web-development-course.png',
    imageAlt: 'Code editor showing a full-stack application architecture',
    href: '/education/blog',
    featured: true,
  },
  {
    title: 'How colleges are embedding industry sprints into semester six',
    excerpt: 'A practical model for running mentor-led sprints without breaking the academic calendar.',
    category: 'Technology',
    readTime: '6 min read',
    author: 'Dr. Meera Iyer',
    date: 'Nov 4, 2026',
    image: '/online-learning-platform.png',
    imageAlt: 'Students collaborating around a laptop in a classroom',
    href: '/education/blog',
  },
  {
    title: 'From campus to offer letter: a placement playbook',
    excerpt: 'Five habits that consistently move candidates from shortlist to signed offer.',
    category: 'Career Development',
    readTime: '5 min read',
    author: 'Sana Kapoor',
    date: 'Oct 28, 2026',
    image: '/ui-ux-design-concept.png',
    imageAlt: 'Designers reviewing an interface prototype',
    href: '/education/blog',
  },
]

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export const faqCategories: FaqCategory[] = [
  {
    id: 'students',
    label: 'Students',
    items: [
      {
        question: 'Who are ReadnRevise courses designed for?',
        answer:
          'Students from their second year onward, fresh graduates, and career switchers. Every path begins with a diagnostic so mentors can place you at the right level.',
      },
      {
        question: 'Do I need prior coding experience?',
        answer:
          'Not for beginner paths. Python and Data Analytics start from fundamentals. Full Stack, Java, and AI expect basic programming comfort.',
      },
      {
        question: 'How much time should I commit each week?',
        answer:
          'Plan for eight to ten hours: two live sessions, one mentor review, and project work. Part-time cohorts run on weekends.',
      },
    ],
  },
  {
    id: 'institutions',
    label: 'Institutions',
    items: [
      {
        question: 'How does a college partnership start?',
        answer:
          'A 30-minute discovery call, a curriculum gap review, and a pilot cohort. Most campuses sign an MOU within 30 days of the review.',
      },
      {
        question: 'Can programs run inside our academic calendar?',
        answer:
          'Yes. We map sprints to your semester structure and deliver on campus, online, or in a hybrid format.',
      },
      {
        question: 'Do you train our faculty as well?',
        answer:
          'Faculty development runs alongside student cohorts, covering modern tooling, project review methods, and industry briefs.',
      },
    ],
  },
  {
    id: 'courses',
    label: 'Courses',
    items: [
      {
        question: 'Are the courses live or recorded?',
        answer:
          'Sessions are live and mentor-led, with recordings for revision. Code labs, reviews, and assessments are always live.',
      },
      {
        question: 'What projects will I build?',
        answer:
          'Each path ends in a production-style capstone: a deployed full-stack app, an evaluated ML pipeline, or a BI dashboard built on real data.',
      },
      {
        question: 'How are cohorts scheduled?',
        answer: 'New cohorts start every month, with weekday-evening and weekend tracks available.',
      },
    ],
  },
  {
    id: 'certificates',
    label: 'Certificates',
    items: [
      {
        question: 'Are certificates recognised by employers?',
        answer:
          'They are verified digital credentials that link to your capstone, code reviews, and assessment scores — proof of work hiring teams can inspect.',
      },
      {
        question: 'What do I need to earn a certificate?',
        answer:
          'Complete 90% of labs, pass the final assessment, and get your capstone approved by a mentor.',
      },
      {
        question: 'Can employers verify a certificate?',
        answer:
          'Yes. Every credential carries a unique verification link and QR code that resolves to the issued record.',
      },
    ],
  },
  {
    id: 'partnerships',
    label: 'Partnerships',
    items: [
      {
        question: 'What does a Center of Excellence include?',
        answer:
          'Co-designed curriculum, a trained faculty pod, industry mentors on campus, hackathon support, and placement readiness reporting.',
      },
      {
        question: 'Do you support hackathons and bootcamps?',
        answer:
          'We run themed campus hackathons with industry judges and short-format bootcamps around emerging stacks.',
      },
      {
        question: 'Who owns the curriculum we co-create?',
        answer:
          'Your institution owns the academic structure; ReadnRevise licenses the delivery material and updates it each term.',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

export const finalCta = {
  eyebrow: 'Start today',
  headline: 'Ready to shape your future?',
  description:
    'Join 25,000+ learners and 150+ campuses building industry-ready skills with ReadnRevise.',
  primaryCta: { label: 'Explore Courses', href: '/courses' },
  secondaryCta: { label: 'Book a Consultation', href: '/contact' },
  footnote: 'No commitment required · Mentor-led cohorts · Verified outcomes',
}

export const footerContent = {
  tagline: 'Learn • Build • Innovate',
  description:
    'Project-based technical education for students, and industry collaboration for colleges that want job-ready graduates.',
  linkGroups: [
    {
      title: 'Explore',
      links: [
        { label: 'Courses', href: '/courses' },
        { label: 'For students', href: '/for-students' },
        { label: 'For institutions', href: '/for-institution' },
        { label: 'Free resources', href: '/education/free-courses' },
        { label: 'Blog', href: '/education/blog' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Discussion forum', href: '/education/discussion' },
        { label: 'Privacy policy', href: '/privacyPolicy' },
        { label: 'Terms of service', href: '/termsCondition' },
      ],
    },
  ],
  newsletter: {
    title: 'One practical lesson, every week',
    description: 'Short, hands-on notes on programming, careers, and industry-ready skills.',
    placeholder: 'you@campus.edu',
    cta: 'Subscribe',
  },
}
