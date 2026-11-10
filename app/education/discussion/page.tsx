//app/education/discussion/page.tsx
'use client'

import Link from "next/link"
import { ChevronRight } from "lucide-react"


export default function DiscussionPage() {
  const handleRedirect = () => {
    window.open("http://localhost:3001", "_blank") // 🔥 apna project link daal
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-20">
  
      {/* 🔗 BREADCRUMB (ADD THIS) */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center gap-2 text-sm">
        <Link href="/" className="text-slate-400 hover:text-blue-600">
          Home
        </Link>
  
        <ChevronRight size={14} className="text-slate-300" />
  
        <Link href="/education/blog" className="text-slate-400 hover:text-blue-600">
          Education
        </Link>
  
        <ChevronRight size={14} className="text-slate-300" />
  
        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-medium">
          Discussion
        </span>
      </div>
  
      {/* 🔥 EXISTING CONTENT WRAP KAR */}
      <div className="flex flex-col items-center justify-center text-center">
        
        <h1 className="text-3xl font-bold mb-4">Discussion Forum</h1>
  
        <p className="text-slate-600 mb-6 max-w-md">
          Join our community discussion platform to ask doubts and collaborate with others.
        </p>
  
        <button
          onClick={handleRedirect}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Go to Discussion →
        </button>
  
      </div>
    </div>
  )
}