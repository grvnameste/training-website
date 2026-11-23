import { ArrowRight, Building2, Check } from 'lucide-react'

import { hero } from '@/lib/content/homepage'
import { Container } from '@/components/marketing/container'
import { CtaButton } from '@/components/marketing/cta-button'
import { HeroSandbox } from '@/components/marketing/hero-sandbox'
import { cn } from '@/lib/utils'

function Fade({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div className={cn('animate-rise', className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  )
}

const headlineDelays = [0, 0.08, 0.16]

export function Hero({ content = hero }: { content?: typeof hero }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-surface pb-20 pt-12 sm:pt-16 lg:pb-28 lg:pt-20"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-light [mask-image:radial-gradient(ellipse_75%_60%_at_50%_20%,black,transparent)]" />
        <div className="absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[10%] h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-[130px]" />
      </div>

      <Container className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 xl:gap-16">
        <div className="min-w-0">
          <Fade>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm backdrop-blur">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              {content.eyebrow}
              <span className="h-3 w-px bg-slate-300" aria-hidden="true" />
              <span className="text-blue-700">Cohorts open</span>
            </span>
          </Fade>

          <h1
            id="hero-title"
            className="mt-6 text-balance text-[2.05rem] font-bold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl sm:leading-[1.04] lg:text-[2.5rem] lg:leading-[1.06] xl:text-[3.25rem] xl:leading-[1.04]"
          >
            <span
              className="block animate-rise"
              style={{ animationDelay: `${headlineDelays[0]}s` }}
            >
              {content.headline[0]}
            </span>
            <span
              className="block animate-rise"
              style={{ animationDelay: `${headlineDelays[1]}s` }}
            >
              {content.headline[1]}
            </span>
            <span
              className="block animate-rise pb-1 text-gradient-brand"
              style={{ animationDelay: `${headlineDelays[2]}s` }}
            >
              {content.headline[2]}
            </span>
          </h1>

          <Fade delay={0.24}>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              {content.description}
            </p>
          </Fade>

          <Fade delay={0.32}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CtaButton
                href={content.primaryCta.href}
                size="lg"
                trailingIcon={
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                }
              >
                {content.primaryCta.label}
              </CtaButton>
              <CtaButton
                href={content.secondaryCta.href}
                size="lg"
                variant="secondary"
                leadingIcon={<Building2 className="h-4 w-4 text-slate-500" />}
              >
                {content.secondaryCta.label}
              </CtaButton>
            </div>
          </Fade>

          <Fade delay={0.4}>
            <ul className="mt-9 grid gap-4 border-t border-slate-200/80 pt-6 sm:grid-cols-3">
              {content.proof.map((item) => (
                <li key={item.label} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">{item.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Fade>
        </div>

        <HeroSandbox />
      </Container>
    </section>
  )
}
