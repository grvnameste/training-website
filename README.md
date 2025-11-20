# EduLearn - Professional Learning Management System

A modern, full-featured LMS built with Next.js and Tailwind CSS for creating, managing, and consuming online courses.

## Features

### 🎯 For Everyone
- Professional landing page with feature showcase
- Role-based authentication (Admin, Teacher, Student)
- Responsive design for all devices
- Modern UI with intuitive navigation

### 👨‍🏫 For Teachers & Admins
- Create and manage online courses
- Set course pricing and monetization
- Upload course thumbnails and videos
- Write detailed course descriptions and content
- View student enrollment statistics
- Track course revenue and performance

### 👨‍🎓 For Students
- Browse all available courses
- Search and filter courses by title and price
- View detailed course information
- Enroll in courses (free or paid)
- Access video lessons through course player
- Track learning progress
- View enrolled courses
- Stream videos with playback controls

## Demo Credentials

### Teacher Account
- Email: `teacher@demo.com`
- Password: `pass123`

### Admin Account
- Email: `admin@demo.com`
- Password: `pass123`

### Student Account
- Email: `student@demo.com`
- Password: `pass123`

## Getting Started

1. **Clone the repository**
   \`\`\`bash
   git clone <repo-url>
   cd edulearn
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

\`\`\`
app/
├── page.tsx                 # Landing page
├── login/                   # Login page
├── register/               # Registration page
├── teacher/                # Teacher dashboard routes
│   ├── layout.tsx
│   ├── dashboard/
│   └── courses/
└── student/                # Student dashboard routes
    ├── layout.tsx
    ├── dashboard/
    ├── my-courses/
    └── courses/

lib/
└── auth.ts                 # Authentication utilities

components/
└── ui/                     # shadcn UI components
\`\`\`

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Storage**: Browser localStorage (demo mode)
- **Icons**: Lucide React

## Features Explained

### Course Creation
Teachers and admins can create courses with:
- Course title and description
- Course pricing (free or paid)
- Thumbnail upload
- Multiple video uploads
- Course syllabus/content

### Student Experience
- Browse all available courses
- Search and filter functionality
- Detailed course preview before enrollment
- One-click enrollment
- Video player with playlist
- Progress tracking
- Enrolled courses dashboard

### Data Storage
Currently uses browser localStorage for demo purposes. In production, this would be connected to:
- PostgreSQL/MySQL database
- File storage service (AWS S3, Vercel Blob, etc.)
- Payment processing (Stripe, PayPal)

## Future Enhancements

- [ ] Real database integration (PostgreSQL/MongoDB)
- [ ] Payment processing (Stripe integration)
- [ ] File storage (AWS S3 or Vercel Blob)
- [ ] Email notifications
- [ ] Course reviews and ratings
- [ ] Student certificates
- [ ] Discussion forums
- [ ] Admin analytics dashboard
- [ ] Course categories and tags
- [ ] Instructor profiles

## Notes

- All data is stored in browser localStorage (cleared when browser cache is cleared)
- Videos are stored as base64 in localStorage (suitable for demo only)
- For production deployment, integrate with proper backend and database services

## License

MIT License - feel free to use this for your projects!

---

Built with ❤️ using Next.js and Tailwind CSS
