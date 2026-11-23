'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Github, Linkedin, Mail, MapPin, Twitter } from 'lucide-react'

import { footerContent } from '@/lib/content/homepage'
import { Container } from '@/components/marketing/container'

const socials = [
  { label: 'ReadnRevise on GitHub', href: 'https://github.com/ReadNRevise', icon: Github },
  {
    label: 'ReadnRevise on LinkedIn',
    href: 'https://www.linkedin.com/company/readnrevise/posts/?feedView=all',
    icon: Linkedin,
  },
  { label: 'ReadnRevise on X', href: 'https://twitter.com/', icon: Twitter },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error')
      return
    }
    setStatus('success')
    setEmail('')
  }

  return (
    <footer className="site-footer border-t border-slate-200/70 bg-white">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Image
                src="/assets/Readnrevise_logo.png"
                alt="ReadnRevise"
                width={198}
                height={34}
                className="h-8 w-auto transition-[filter] dark:brightness-0 dark:invert"
              />
            </Link>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {footerContent.tagline}
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-600">
              {footerContent.description}
            </p>

            <div className="mt-6 flex gap-2">
              {socials.map(({ label, href, icon: SocialIcon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <SocialIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              ))}
            </div>

            <div className="mt-7 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-blue-600" aria-hidden="true" />
                support@readnrevise.com
              </p>
              <p className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-blue-600" aria-hidden="true" />
                India
              </p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-4">
            {footerContent.linkGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {group.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 transition-colors hover:text-blue-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6">
              <h3 className="text-base font-semibold tracking-tight text-slate-950">
                {footerContent.newsletter.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {footerContent.newsletter.description}
              </p>

              <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-2 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (status !== 'idle') setStatus('idle')
                  }}
                  placeholder={footerContent.newsletter.placeholder}
                  aria-invalid={status === 'error'}
                  aria-describedby="newsletter-status"
                  className="h-11 w-full min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30"
                />
                <button
                  type="submit"
                  className="h-11 shrink-0 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {footerContent.newsletter.cta}
                </button>
              </form>

              <p
                id="newsletter-status"
                aria-live="polite"
                className={`mt-3 min-h-5 text-xs ${
                  status === 'error' ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {status === 'error' && 'Enter a valid email address to subscribe.'}
                {status === 'success' && 'You are on the list. The first lesson lands this week.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 ReadnRevise. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              All systems operational
            </span>
            <Link href="/privacyPolicy" className="transition-colors hover:text-slate-800">
              Privacy policy
            </Link>
            <Link href="/termsCondition" className="transition-colors hover:text-slate-800">
              Terms of service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
