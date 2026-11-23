'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

import {
  applyMarketingTheme,
  THEME_EVENT,
  THEME_STORAGE_KEY,
  type MarketingTheme,
} from '@/lib/theme'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<MarketingTheme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const sync = () =>
      setTheme(document.documentElement.classList.contains('marketing-dark') ? 'dark' : 'light')
    sync()
    window.addEventListener(THEME_EVENT, sync)
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) sync()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(THEME_EVENT, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  function toggleTheme() {
    const next: MarketingTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyMarketingTheme(next)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* storage unavailable */
    }
  }

  const isDark = mounted && theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#070d19]',
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  )
}
