import Link from 'next/link'

import { cn } from '@/lib/utils'

type CtaVariant = 'primary' | 'secondary' | 'white' | 'outline-white'

const variants: Record<CtaVariant, string> = {
  primary:
    'bg-blue-600 text-white shadow-[0_12px_30px_-14px_rgba(37,99,235,0.9)] hover:bg-blue-700 hover:shadow-[0_18px_36px_-16px_rgba(37,99,235,0.95)]',
  secondary:
    'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50',
  white: 'theme-static bg-white text-slate-950 shadow-[0_12px_30px_-16px_rgba(2,6,23,0.6)] hover:bg-slate-100',
  'outline-white': 'border border-white/30 text-white hover:border-white/50 hover:bg-white/10',
}

const sizes = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
} as const

export function CtaButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  leadingIcon,
  trailingIcon,
  ariaLabel,
}: {
  href: string
  children: React.ReactNode
  variant?: CtaVariant
  size?: keyof typeof sizes
  className?: string
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  ariaLabel?: string
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        'group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  )
}
