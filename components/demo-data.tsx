'use client'

// Initialize demo courses
export function initializeDemoData() {
  if (typeof window === 'undefined') return

  const existingCourses = localStorage.getItem('lms_courses')
  if (!existingCourses) {
    const demoCourses = [
      {
        id: '1',
        title: 'Complete Web Development Bootcamp',
        price: 99.99,
        thumbnail: '/web-development-course.png',
        description: 'Learn HTML, CSS, JavaScript, React, and Node.js from scratch. Build real-world projects and become a full-stack developer.',
        content: 'Module 1: HTML & CSS Basics\n\nModule 2: JavaScript Fundamentals\n\nModule 3: React Basics\n\nModule 4: Node.js & Express\n\nModule 5: Database & MongoDB\n\nModule 6: Deployment & Final Project',
        videos: [
          { id: 'v1', name: 'Welcome to Web Development', file: '' },
          { id: 'v2', name: 'HTML Basics', file: '' },
          { id: 'v3', name: 'CSS & Styling', file: '' },
          { id: 'v4', name: 'JavaScript Introduction', file: '' },
        ],
        enrollments: 1250,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Python for Data Science',
        price: 79.99,
        thumbnail: '/python-data-science.png',
        description: 'Master Python programming for data analysis, visualization, and machine learning. Includes NumPy, Pandas, and Scikit-learn.',
        content: 'Module 1: Python Fundamentals\n\nModule 2: NumPy & Arrays\n\nModule 3: Pandas & DataFrames\n\nModule 4: Data Visualization\n\nModule 5: Statistics & Probability\n\nModule 6: Machine Learning Basics',
        videos: [
          { id: 'v5', name: 'Course Overview', file: '' },
          { id: 'v6', name: 'Python Basics', file: '' },
          { id: 'v7', name: 'Working with Data', file: '' },
        ],
        enrollments: 890,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'UI/UX Design Masterclass',
        price: 69.99,
        thumbnail: '/ui-ux-design-concept.png',
        description: 'Learn modern design principles, wireframing, prototyping, and user research. Create stunning interfaces with Figma.',
        content: 'Module 1: Design Fundamentals\n\nModule 2: User Research\n\nModule 3: Wireframing\n\nModule 4: Prototyping\n\nModule 5: Figma Mastery\n\nModule 6: Design Systems',
        videos: [
          { id: 'v8', name: 'Design Principles', file: '' },
          { id: 'v9', name: 'User Research Methods', file: '' },
          { id: 'v10', name: 'Introduction to Figma', file: '' },
        ],
        enrollments: 650,
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Advanced React & Next.js',
        price: 89.99,
        thumbnail: '/react-nextjs.jpg',
        description: 'Deep dive into React hooks, state management, Next.js 14, and building production-ready applications.',
        content: 'Module 1: React Hooks Deep Dive\n\nModule 2: State Management\n\nModule 3: Next.js Fundamentals\n\nModule 4: API Routes\n\nModule 5: Performance Optimization\n\nModule 6: Deployment',
        videos: [
          { id: 'v11', name: 'React Hooks Explained', file: '' },
          { id: 'v12', name: 'State Management', file: '' },
          { id: 'v13', name: 'Next.js Basics', file: '' },
        ],
        enrollments: 980,
        createdAt: new Date().toISOString(),
      },
      {
        id: '5',
        title: 'Business Communication Skills',
        price: 0,
        thumbnail: '/business-communication.jpg',
        description: 'Free course on effective communication, presentations, and professional writing skills.',
        content: 'Module 1: Business Writing\n\nModule 2: Email Etiquette\n\nModule 3: Presentations\n\nModule 4: Networking\n\nModule 5: Conflict Resolution',
        videos: [
          { id: 'v14', name: 'Professional Communication', file: '' },
          { id: 'v15', name: 'Public Speaking Tips', file: '' },
        ],
        enrollments: 3450,
        createdAt: new Date().toISOString(),
      },
      {
        id: '6',
        title: 'Digital Marketing Fundamentals',
        price: 59.99,
        thumbnail: '/digital-marketing-strategy.png',
        description: 'Learn SEO, social media marketing, email marketing, and analytics to grow your online presence.',
        content: 'Module 1: Digital Marketing Basics\n\nModule 2: SEO Optimization\n\nModule 3: Social Media Strategy\n\nModule 4: Email Marketing\n\nModule 5: Analytics & Metrics',
        videos: [
          { id: 'v16', name: 'Marketing Overview', file: '' },
          { id: 'v17', name: 'SEO Basics', file: '' },
          { id: 'v18', name: 'Social Media Marketing', file: '' },
        ],
        enrollments: 2100,
        createdAt: new Date().toISOString(),
      },
    ]

    localStorage.setItem('lms_courses', JSON.stringify(demoCourses))
  }

  // Initialize demo users if they don't exist
  const existingUsers = localStorage.getItem('lms_users')
  if (!existingUsers) {
    const demoUsers = [
      {
        name: 'Demo Teacher',
        email: 'teacher@demo.com',
        password: 'pass123',
        role: 'teacher',
      },
      {
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: 'pass123',
        role: 'admin',
      },
      {
        name: 'Demo Student',
        email: 'student@demo.com',
        password: 'pass123',
        role: 'student',
      },
    ]
    localStorage.setItem('lms_users', JSON.stringify(demoUsers))
  }
}
