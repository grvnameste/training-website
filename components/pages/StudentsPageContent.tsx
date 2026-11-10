'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Code, Users, Trophy, ArrowRight } from 'lucide-react'

export default function StudentsPageContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - More Dynamic */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-white py-24 lg:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider text-blue-600 uppercase bg-blue-100/50 rounded-full">
            Elevate Your Career
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
            For <span className="text-blue-600">Students</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-gray-600 leading-relaxed">
            Don't just watch tutorials. Build real-world projects, collaborate in high-performance teams, 
            and get industry-standard code reviews.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Start Learning
            </button>
            <button className="px-8 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
              View Curriculum
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION - Modern Cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Feature 
              icon={<BookOpen size={28} />} 
              title="Structured Learning" 
              desc="A meticulously crafted roadmap that takes you from fundamental concepts to enterprise-level architecture." 
            />
            <Feature 
              icon={<Code size={28} />} 
              title="Hands-on Projects" 
              desc="Forget 'Todo' apps. Build production-ready applications with modern tech stacks like Next.js and Tailwind." 
            />
            <Feature 
              icon={<Users size={28} />} 
              title="Team Collaboration" 
              desc="Experience the agile environment. Work with Git, PR reviews, and sprint planning just like top tech firms." 
            />
            <Feature 
              icon={<Trophy size={28} />} 
              title="Skill Growth" 
              desc="Continuous assessment and portfolio building to ensure you are 100% ready to crack any interview." 
            />
          </div>
        </div>
      </section>

      {/* JOURNEY SECTION - Visual Steps */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900">Your Learning Journey</h2>
            <div className="mt-4 w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>
          
          <div className="grid gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">1</div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Master the Concepts</h3>
                <p className="text-gray-600">Deep dive into the 'why' behind the code with our interactive modules.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">2</div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Guided Implementation</h3>
                <p className="text-gray-600">Apply what you've learned in smaller, focused tasks with instant feedback.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">3</div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Portfolio Projects</h3>
                <p className="text-gray-600">Lead your own project from scratch, including design, dev, and deployment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Feature({ icon, title, desc }: any) {
  return (
    <Card className="group border-none shadow-none hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 bg-transparent p-4">
      <CardHeader className="pb-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-gray-600 leading-relaxed">
        {desc}
      </CardContent>
    </Card>
  )
}