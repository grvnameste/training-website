export const THEME_STORAGE_KEY = 'rnr-theme'
export const THEME_EVENT = 'rnr-theme-change'

export type MarketingTheme = 'light' | 'dark'

export function isWorkspacePath(pathname: string) {
  return (
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/dashboard')
  )
}

export function getPreferredTheme(): MarketingTheme {
  if (typeof window === 'undefined') return 'light'

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* storage unavailable */
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyMarketingTheme(theme: MarketingTheme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('marketing-dark', theme === 'dark')
  window.dispatchEvent(new Event(THEME_EVENT))
}
