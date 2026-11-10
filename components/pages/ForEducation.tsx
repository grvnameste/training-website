//components/pages/ForEducation.tsx
'use client'
import Link from 'next/link'
import * as CardComponents from '@/components/ui/card'
import * as ButtonComponents from '@/components/ui/button'

const { Card, CardContent } = CardComponents
const { Button } = ButtonComponents

export default function ForEducation() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      
      {/* Heading */}
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">
          Education Section
        </h1>
        <p className="text-gray-600">
          Explore blogs, free courses and join discussions to learn better 🚀
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        
        {/* Blog */}
        <Card className="hover:shadow-lg transition">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Blog</h2>
            <p className="text-gray-600 mb-4">
              Read latest educational blogs and updates.
            </p>
            <Link href="/education/blog">
              <Button>Explore Blog</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Free Courses */}
        <Card className="hover:shadow-lg transition">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Free Courses</h2>
            <p className="text-gray-600 mb-4">
              Access free learning resources and courses.
            </p>
            <Link href="/education/free-courses">
              <Button>View Courses</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Discussion Forum */}
        <Card className="hover:shadow-lg transition">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Discussion Forum</h2>
            <p className="text-gray-600 mb-4">
              Ask doubts and connect with learners.
            </p>
            <Link href="/education/discussion">
              <Button>Join Discussion</Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}