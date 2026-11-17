<<<<<<< HEAD
'use client'
import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import './globals.css'
import { Inter } from "next/font/google"
import { AuthProvider } from "@/components/providers/auth-provider"
import { usePathname } from 'next/navigation'

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

import { Toaster } from 'sonner'

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
      <head>
        <title>ReadNRevise Training</title>
        <meta name="description" content="Engineering and SDLC learning platform with course catalog, capstone projects, and student dashboards." />
        <meta property="og:title" content="ReadNRevise Training" />
        <meta property="og:description" content="Engineering and SDLC learning platform with course catalog, capstone projects, and student dashboards." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`min-h-screen flex flex-col bg-white ${inter.className}`}>
        <AuthProvider>
          {!hideNavbar && <Navbar />}

          <main className="flex-1">{children}</main>

          {!hideNavbar && <Footer />}

          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  )
=======
'use client'
import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import './globals.css'
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { usePathname } from 'next/navigation'

// ✅ MOVE THIS OUTSIDE
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

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
    <ClerkProvider>
      <html lang="en">
        <body className={`min-h-screen flex flex-col bg-white ${inter.className}`}>
          
          {!hideNavbar && <Navbar />}

          <main className="flex-1">{children}</main>

          {!hideNavbar && <Footer />}

        </body>
      </html>
    </ClerkProvider>
  )
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
}