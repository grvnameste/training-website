import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'   // 👈 ADD THIS

export const metadata: Metadata = {
  title: 'ReadnRevise - Professional Learning Management System',
  description:
    'Build and manage your online courses with ReadnRevise. Learn with our modern LMS platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased flex flex-col min-h-screen">

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Analytics */}
        <Analytics />

      </body>
    </html>
  )
}