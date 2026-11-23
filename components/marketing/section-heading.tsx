import { cn } from '@/lib/utils'

export function Eyebrow({
  children,
  tone = 'light',
  className,
}: {
  children: React.ReactNode
  tone?: 'light' | 'dark' | 'mint'
  className?: string
}) {
  return (
    <p
      className={cn(
        'flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em]',
        tone === 'light' && 'text-blue-700',
        tone === 'mint' && 'text-emerald-700',
        tone === 'dark' && 'text-blue-200',
        className,
      )}
    >
      <span
        className={cn(
          'h-px w-7',
          tone === 'mint' ? 'bg-emerald-600/60' : 'bg-current opacity-50',
        )}
        aria-hidden="true"
      />
      {children}
    </p>
  )
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  action,
  tone = 'light',
  align = 'left',
  className,
}: {
  id?: string
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  tone?: 'light' | 'dark'
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between',
        align === 'center' && 'items-center text-center lg:flex-col lg:items-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        <Eyebrow tone={tone === 'dark' ? 'dark' : 'light'}>{eyebrow}</Eyebrow>
        <h2
          id={id}
          className={cn(
            'mt-5 text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-4xl lg:text-[2.75rem]',
            tone === 'dark' ? 'text-white' : 'text-slate-950',
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              'mt-5 text-pretty text-base leading-relaxed sm:text-lg',
              tone === 'dark' ? 'text-slate-300' : 'text-slate-600',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
