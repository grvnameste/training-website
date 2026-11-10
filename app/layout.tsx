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
}