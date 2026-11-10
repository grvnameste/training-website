'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useUser } from "@clerk/nextjs"
import { Menu, X } from "lucide-react"

// 1. Variants type import karein
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ChevronDown, BookOpen, GraduationCap, MessagesSquare, ArrowRight, Sparkles } from 'lucide-react'

const educationLinks = [
  {
    title: "Educational Blog",
    description: "Deep dive into modern learning methodologies and tech.",
    href: "/education/blog",
    icon: BookOpen,
    color: "text-blue-600",
  },
  {
    title: "Free Courses",
    description: "Curated learning paths, from basics to advanced topics.",
    href: "/education/free-courses",
    icon: GraduationCap,
    color: "text-indigo-600",
  },
  {
    title: "Discussion Forum",
    description: "Engage with peers, ask questions, share knowledge.",
    href: "/education/discussion",
    icon: MessagesSquare,
    color: "text-emerald-600",
  },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const [mobileOpen, setMobileOpen] = useState(false)

  const { user } = useUser() // 🔥 ADD THIS

  // 2. Explicitly define types for variants
  const panelVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.05, // Children animate one by one
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -15, 
      transition: { duration: 0.2, ease: "easeIn" }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Image
                src="/assets/Readnrevise_logo.png"
                alt="Logo"
                width={130}
                height={36}
                className="object-contain"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-10 text-[15px] font-medium text-slate-600 relative">
            <Link href="/" className="hover:text-blue-600 transition-colors py-2">Home</Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors py-2">About Us</Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors py-2">
  Contact
</Link>
            <Link href="/Forinstitution" className="hover:text-blue-600 transition-colors py-2">For Institution</Link>
            <Link href="/Forstudents" className="hover:text-blue-600 transition-colors py-2">For Students</Link>


            <button 
              onMouseEnter={() => setOpen(true)}
              className={`flex items-center gap-1.5 py-2 transition-colors outline-none ${open ? 'text-blue-600' : 'hover:text-blue-600'}`}
            >
              For Education
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
          </div>


{/* Mobile Menu Button */}
<div className="md:hidden">
  <button onClick={() => setMobileOpen(!mobileOpen)}>
    {mobileOpen ? <X /> : <Menu />}
  </button>
</div>

<div className="hidden md:flex items-center gap-3">
              <Link href="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-blue-600 font-medium">Sign In</Button>
            </Link>
            <Link href={user ? "/student/dashboard" : "/register"}>
  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-full shadow-md shadow-blue-500/10 transition-all active:scale-95 font-semibold">
    Get Started
  </Button>
</Link>
          </div>
        </nav>
      </header>


      {mobileOpen && (
  <div className="md:hidden px-6 pb-4 space-y-2 bg-white border-b">

    <Link href="/" className="block py-2 text-slate-700 hover:text-blue-600" onClick={() => setMobileOpen(false)}>
      Home
    </Link>

    <Link href="/about" className="block py-2 text-slate-700 hover:text-blue-600" onClick={() => setMobileOpen(false)}>
      About
    </Link>

    <Link href="/contact" className="block py-2 text-slate-700 hover:text-blue-600" onClick={() => setMobileOpen(false)}>
      Contact
    </Link>

    <Link href="/Forinstitution" className="block py-2 text-slate-700 hover:text-blue-600" onClick={() => setMobileOpen(false)}>
      For Institution
    </Link>

    <Link href="/Forstudents" className="block py-2 text-slate-700 hover:text-blue-600" onClick={() => setMobileOpen(false)}>
      For Students
    </Link>

    <hr className="my-2"/>

    <Link href="/education/blog" className="block py-2 text-slate-700 hover:text-blue-600" onClick={() => setMobileOpen(false)}>
      Blog
    </Link>

    <Link href="/education/free-courses" className="block py-2 text-slate-700 hover:text-blue-600" onClick={() => setMobileOpen(false)}>
      Free Courses
    </Link>

    <Link href="/education/discussion" className="block py-2 text-slate-700 hover:text-blue-600" onClick={() => setMobileOpen(false)}>
      Discussion
    </Link>

  </div>
)}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed top-[69px] left-0 w-full bg-white z-40 border-b border-slate-100 shadow-2xl shadow-slate-200/50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-12 gap-8">

              <motion.div variants={itemVariants} className="col-span-4 border-r border-slate-100 pr-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">Learning Hub</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Explore our curated resources designed to enhance your educational journey.
                </p>
                <Link href="/education" className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 group">
                  Explore All Resources 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <div className="col-span-8 grid grid-cols-2 gap-x-6 gap-y-2">
                {educationLinks.map((item) => (
                  <motion.div key={item.title} variants={itemVariants}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all group"
                    >
                      <item.icon className={`w-6 h-6 mt-1 flex-shrink-0 ${item.color}`} />
                      <div>
                        <div className="text-[15px] font-semibold text-slate-900 group-hover:text-blue-600">
                          {item.title}
                        </div>
                        <p className="text-sm text-slate-500 leading-snug mt-1">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100">
              <div className="mx-auto max-w-7xl px-6 py-3 text-center text-xs text-slate-400">
                © 2026 Readnrevise Education Platform.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/10 z-30"
            onMouseEnter={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}