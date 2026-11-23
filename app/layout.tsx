import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/components/providers/auth-provider'
import SiteChrome from '@/components/site-chrome'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const title = 'ReadnRevise — Learn. Build. Innovate.'
const description =
  'Project-based programming courses for students, and industry collaboration, faculty development, and placement readiness for colleges.'

export const metadata: Metadata = {
  title: {
    default: title,
    template: '%s | ReadnRevise',
  },
  description,
  applicationName: 'ReadnRevise',
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: 'ReadnRevise',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`flex min-h-screen flex-col bg-background antialiased ${inter.className}`}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var s=localStorage.getItem('rnr-theme');var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);var p=location.pathname;var pub=!/^\\/(student|teacher|dashboard)(\\/|$)/.test(p);if(d&&pub){document.documentElement.classList.add('marketing-dark')}}catch(e){}})()",
          }}
        />
        <AuthProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          <SiteChrome>{children}</SiteChrome>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  )
}
