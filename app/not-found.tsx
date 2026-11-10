'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">

      {/* Big 404 */}
      <h1 className="text-7xl font-bold text-blue-600 mb-4">404</h1>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">
        Page not found
      </h2>

      {/* Description */}
      <p className="text-slate-500 max-w-md mb-6">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Go Home
          </Button>
        </Link>

        <Link href="/contact">
          <Button variant="outline">
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  )
}