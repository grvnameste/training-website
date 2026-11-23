import type { IconKey } from './homepage'

export type NavItem = {
  label: string
  href: string
  menu?: 'students' | 'colleges'
}

export type MegaMenuLink = {
  title: string
  description: string
  href: string
  icon: IconKey
}

export type MegaMenu = {
  label: string
  blurb: string
  links: MegaMenuLink[]
  promo: {
    title: string
    description: string
    href: string
    cta: string
  }
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'For Students', href: '/for-students', menu: 'students' },
  { label: 'For Institutions', href: '/for-institution', menu: 'colleges' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/education/blog' },
  { label: 'Contact', href: '/contact' },
]

export const megaMenus: Record<'students' | 'colleges', MegaMenu> = {
  students: {
    label: 'For students',
    blurb: 'Choose a path, build a portfolio, and walk into interviews with proof of work.',
    links: [
      {
        title: 'Programming Courses',
        description: 'Live, mentor-led tracks across full stack, Python, Java, and AI.',
        href: '/courses',
        icon: 'code',
      },
      {
        title: 'Career Development',
        description: 'Portfolio reviews, mock interviews, and offer evaluation support.',
        href: '/for-students',
        icon: 'career',
      },
      {
        title: 'Technical Workshops',
        description: 'Hands-on sandbox labs on the tooling real teams use.',
        href: '/education/free-courses',
        icon: 'workshop',
      },
      {
        title: 'Real Projects',
        description: 'Sprint-based capstones reviewed by practising engineers.',
        href: '/for-students',
        icon: 'project',
      },
      {
        title: 'Coding Resources',
        description: 'Cheatsheets, practice decks, and reference labs.',
        href: '/education',
        icon: 'book',
      },
    ],
    promo: {
      title: 'Not sure where to start?',
      description: 'Take a guided skills diagnostic and get a path recommendation in five minutes.',
      href: '/for-students',
      cta: 'Find your path',
    },
  },
  colleges: {
    label: 'For colleges',
    blurb: 'Co-designed curriculum, trained faculty, and industry delivery on your campus.',
    links: [
      {
        title: 'Academic Collaboration',
        description: 'Semester-aligned modules built with industry engineers.',
        href: '/for-institution',
        icon: 'college',
      },
      {
        title: 'Faculty Development',
        description: 'FDPs on modern stacks, review practice, and industry briefs.',
        href: '/for-institution',
        icon: 'faculty',
      },
      {
        title: 'Industry Workshops',
        description: 'On-campus labs across AI, cloud, and full-stack delivery.',
        href: '/for-institution',
        icon: 'workshop',
      },
      {
        title: 'Industry Experts',
        description: 'Guest mentors and practitioners embedded in your classroom.',
        href: '/for-institution',
        icon: 'mentor',
      },
      {
        title: 'Internship Programs',
        description: 'Structured internships with review cycles and clear outcomes.',
        href: '/for-institution',
        icon: 'placement',
      },
      {
        title: 'Placement Readiness',
        description: 'Assessments, mock drives, and hiring-partner connections.',
        href: '/for-institution',
        icon: 'career',
      },
    ],
    promo: {
      title: 'Design a Center of Excellence',
      description: 'Get a campus-specific curriculum gap review and partnership blueprint.',
      href: '/contact',
      cta: 'Book a consultation',
    },
  },
}
