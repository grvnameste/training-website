'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Menu, Phone } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { megaMenus, navItems } from '@/lib/content/navigation'
import { Icon } from '@/components/marketing/icons'
import { CtaButton } from '@/components/marketing/cta-button'
import { ThemeToggle } from '@/components/marketing/theme-toggle'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

type MenuKey = 'students' | 'colleges'

const navLinkClass =
  'whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-950'

export default function Navbar() {
  const { user } = useUser()
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const triggerRefs = useRef<Partial<Record<MenuKey, HTMLButtonElement | null>>>({})

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!openMenu) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const key = openMenu
      setOpenMenu(null)
      triggerRefs.current[key]?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [openMenu])

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.menu === 'students') return pathname.startsWith('/for-students')
    if (item.menu === 'colleges') return pathname.startsWith('/for-institution')
    return pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b bg-white/85 backdrop-blur-xl transition-[box-shadow,border-color] duration-300',
          scrolled
            ? 'border-slate-200/80 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)]'
            : 'border-transparent',
        )}
        onMouseLeave={() => setOpenMenu(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setOpenMenu(null)
          }
        }}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:h-[72px] lg:px-8">
          <div className="flex min-w-0 items-center gap-6 xl:gap-8">
            <Logo />

            <nav aria-label="Primary" className="hidden items-center gap-0.5 xl:flex">
            {navItems.map((item) =>
              item.menu ? (
                <div key={item.label} className="relative">
                  <button
                    ref={(node) => {
                      triggerRefs.current[item.menu as MenuKey] = node
                    }}
                    type="button"
                    aria-expanded={openMenu === item.menu}
                    aria-controls={`mega-${item.menu}`}
                    onClick={() =>
                      setOpenMenu(openMenu === item.menu ? null : (item.menu as MenuKey))
                    }
                    onMouseEnter={() => setOpenMenu(item.menu as MenuKey)}
                    className={cn(
                      navLinkClass,
                      'inline-flex items-center gap-1.5',
                      (openMenu === item.menu || isActive(item)) &&
                        'bg-slate-100/80 text-slate-950',
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        openMenu === item.menu && 'rotate-180',
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {openMenu === item.menu ? (
                      <motion.div
                        id={`mega-${item.menu}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="fixed inset-x-0 top-16 z-40 border-y border-slate-200/70 bg-white shadow-[0_30px_60px_-30px_rgba(15,23,42,0.3)] lg:top-[72px]"
                      >
                        <MegaPanel menuKey={item.menu as MenuKey} onNavigate={() => setOpenMenu(null)} />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive(item) ? 'page' : undefined}
                  className={cn(
                    navLinkClass,
                    isActive(item) && 'bg-blue-50/80 text-blue-700 hover:text-blue-700',
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
            </nav>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            <ThemeToggle className="mr-1" />
            <Link
              href="/login"
              className="whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Sign in
            </Link>
            <CtaButton
              href={user ? '/student/dashboard' : '/register'}
              trailingIcon={
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              }
            >
              Get started
            </CtaButton>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-white p-0 sm:max-w-md">
          <SheetTitle className="sr-only">Site navigation</SheetTitle>
          <div className="border-b border-slate-100 px-6 py-5 pr-14">
            <Logo onClick={() => setMobileOpen(false)} />
          </div>

          <nav aria-label="Mobile" className="flex-1 px-4 py-4">
            <ul>
              {navItems
                .filter((item) => !item.menu)
                .map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive(item) ? 'page' : undefined}
                      className={cn(
                        'block rounded-xl px-3 py-3 text-[15px] font-medium transition-colors hover:bg-slate-50 hover:text-blue-700',
                        isActive(item) ? 'bg-blue-50 text-blue-700' : 'text-slate-800',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>

            {(['students', 'colleges'] as MenuKey[]).map((key) => {
              const menu = megaMenus[key]
              return (
                <details key={key} className="group mt-1 border-t border-slate-100">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-3.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                    {menu.label}
                    <ChevronDown
                      aria-hidden="true"
                      className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <ul className="pb-2">
                    {menu.links.map((link) => (
                      <li key={link.title}>
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Icon name={link.icon} className="h-4 w-4" />
                          </span>
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              )
            })}
          </nav>

          <div className="border-t border-slate-100 px-6 py-5">
            <CtaButton
              href={user ? '/student/dashboard' : '/register'}
              className="w-full"
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              {user ? 'Go to dashboard' : 'Get started'}
            </CtaButton>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            >
              Sign in
            </Link>
            <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              +91 98765 43210 · support@readnrevise.com
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="ReadnRevise home"
      className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <Image
        src="/assets/Readnrevise_logo.png"
        alt="ReadnRevise"
        width={198}
        height={34}
        priority
        className="h-6 w-auto transition-[filter] dark:brightness-0 dark:invert sm:h-7"
      />
    </Link>
  )
}

function MegaPanel({ menuKey, onNavigate }: { menuKey: MenuKey; onNavigate: () => void }) {
  const menu = megaMenus[menuKey]
  const overviewHref = menuKey === 'students' ? '/for-students' : '/for-institution'

  return (
    <div
      role="region"
      aria-label={menu.label}
      className="mx-auto grid w-full max-w-7xl gap-8 px-8 py-8 lg:grid-cols-[0.95fr_2.1fr_1fr]"
    >
      <div className="flex flex-col justify-between gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {menu.label}
          </p>
          <p className="mt-4 text-pretty text-lg font-semibold leading-snug tracking-tight text-slate-950">
            {menu.blurb}
          </p>
        </div>
        <Link
          href={overviewHref}
          onClick={onNavigate}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
        >
          View overview
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="grid gap-1 sm:grid-cols-2">
        {menu.links.map((link) => (
          <li key={link.title}>
            <Link
              href={link.href}
              onClick={onNavigate}
              className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Icon name={link.icon} className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                  {link.title}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                  {link.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="relative flex flex-col overflow-hidden rounded-2xl bg-slate-950 p-5 text-white">
        <span
          aria-hidden="true"
          className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-blue-500/30 blur-2xl"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl"
        />
        <p className="relative text-sm font-semibold">{menu.promo.title}</p>
        <p className="relative mt-2 text-xs leading-relaxed text-slate-300">
          {menu.promo.description}
        </p>
        <Link
          href={menu.promo.href}
          onClick={onNavigate}
          className="relative mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-slate-100"
        >
          {menu.promo.cta}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <p className="relative mt-auto flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          Learn • Build • Innovate
        </p>
      </div>
    </div>
  )
}
