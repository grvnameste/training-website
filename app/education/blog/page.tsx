//app/education/blog/page.tsx
'use client'
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, ChevronRight } from "lucide-react"

const blogs = [
  {
    title: "Cracking the FAANG Interview: A 2026 Roadmap",
    desc: "Beyond Data Structures & Algorithms—learn the psychological and architectural mindset required for top-tier tech roles.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070",
    date: "March 28, 2026",
    readTime: "8 min read",
    category: "Career"
  },
  {
    title: "React Server Components: The Death of Client-Side Fetching?",
    desc: "An in-depth look at how Next.js 15+ is changing the way we think about data fetching and component boundaries.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070",
    date: "March 25, 2026",
    readTime: "12 min read",
    category: "Engineering"
  },
  {
    title: "Scalable Microservices with Go and Kubernetes",
    desc: "Why modern startups are ditching monoliths early and how to architect for 10x growth without breaking the bank.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",    readTime: "15 min read",
    
    category: "Architecture"
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-16">
        <div className="mb-8 flex items-center gap-2 text-sm">
  <Link href="/" className="text-slate-400 hover:text-blue-600 transition-colors">
    Home
  </Link>

  <ChevronRight size={14} className="text-slate-300" />

  <Link href="/education/blog" className="text-slate-400 hover:text-blue-600 transition-colors">
    Education
  </Link>

  <ChevronRight size={14} className="text-slate-300" />

  <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-medium">
    Blog
  </span>
</div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight"
          >
            Engineering <span className="text-blue-600">Insights</span>
          </motion.h1>
          <p className="text-xl text-slate-500 max-w-2xl">
            Deep dives into software architecture, career growth, and production-grade engineering.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-10">
          {blogs.map((blog, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative h-64 w-full mb-6 overflow-hidden rounded-3xl border border-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-100 group-hover:-translate-y-2">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-600 shadow-sm">
                    {blog.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mb-3 font-medium">
                <div className="flex items-center gap-1"><Calendar size={14}/> {blog.date}</div>
                <div className="flex items-center gap-1"><Clock size={14}/> {blog.readTime}</div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3 leading-tight">
                {blog.title}
              </h2>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                {blog.desc}
              </p>

              <Link href={`/education/blog/${i}`} className="inline-flex items-center text-sm font-bold text-blue-600 group/btn">
                Read Article 
                <ChevronRight size={18} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}