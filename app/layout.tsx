'use client'

import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import './globals.css'
import { usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const hideNavbar =
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher')

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">
        
        {/* 👇 Navbar sirf public pages pe */}
        {!hideNavbar && <Navbar />}

        <main className="flex-1">{children}</main>

        {/* 👇 Footer bhi optionally hide kar sakte */}
        {!hideNavbar && <Footer />}
      </body>
    </html>
  )
}