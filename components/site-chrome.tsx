'use client'

import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { usePathname } from 'next/navigation'

import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import { applyMarketingTheme, getPreferredTheme, isWorkspacePath } from '@/lib/theme'

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isWorkspace = isWorkspacePath(pathname)

  useEffect(() => {
    applyMarketingTheme(isWorkspace ? 'light' : getPreferredTheme())
  }, [isWorkspace, pathname])

  return (
    <MotionConfig reducedMotion="user">
      {!isWorkspace && <Navbar />}
      <main id="main" className="flex-1">
        {children}
      </main>
      {!isWorkspace && <Footer />}
    </MotionConfig>
  )
}
