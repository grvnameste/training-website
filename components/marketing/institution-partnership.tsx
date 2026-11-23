import { ArrowRight } from 'lucide-react'

import {
  institutionHighlights,
  institutionStats,
  type InstitutionHighlight,
  type Stat,
} from '@/lib/content/homepage'
import { AnimatedCounter } from '@/components/marketing/animated-counter'
import { Container } from '@/components/marketing/container'
import { CtaButton } from '@/components/marketing/cta-button'
import { Icon } from '@/components/marketing/icons'
import { Reveal } from '@/components/marketing/reveal'

export function InstitutionPartnership({
  stats = institutionStats,
  highlights = institutionHighlights,
}: {
  stats?: Stat[]
  highlights?: InstitutionHighlight[]
}) {
  return (
    <section
      id="partnership"
      aria-labelledby="partnership-title"
      className="section-page bg-white py-20 lg:py-28"
    >
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-transparent bg-slate-950 px-6 py-12 dark:border-white/10 sm:px-10 lg:px-14 lg:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_80%_70%_at_30%_20%,black,transparent)] opacity-60" />
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/15 blur-[110px]" />
            <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
          </div>

          <div className="relative grid gap-12 lg:grid-cols-[1.02fr_1fr] lg:gap-14">
            <div>
              <Reveal>
                <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                  <span className="h-px w-7 bg-emerald-400/60" aria-hidden="true" />
                  For colleges &amp; universities
                </p>
                <h2
                  id="partnership-title"
                  className="mt-5 text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-4xl lg:text-[2.75rem]"
                >
                  Building industry-ready campuses
                </h2>
                <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-300">
                  We co-design curriculum, train faculty, and run industry sprints on campus — so
                  your graduates leave with a portfolio, not just a transcript.
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <CtaButton
                    href="/for-institution"
                    variant="white"
                    size="lg"
                    trailingIcon={
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    }
                  >
                    Become a partner
                  </CtaButton>
                  <CtaButton href="/contact" variant="outline-white" size="lg">
                    Book a consultation
                  </CtaButton>
                </div>
                <p className="mt-4 text-xs text-slate-400">
                  Typical MOU timeline: 30 days from the curriculum review.
                </p>
              </Reveal>

              <Reveal delay={0.16}>
                <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-7">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <dd className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                        <AnimatedCounter
                          value={stat.value}
                          suffix={stat.suffix}
                          format={stat.format}
                        />
                      </dd>
                      <dt className="mt-1.5 text-[11px] font-medium uppercase leading-tight tracking-[0.1em] text-slate-400">
                        {stat.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {highlights.map((highlight, index) => (
                <li key={highlight.title} className="h-full">
                  <Reveal className="h-full" delay={0.06 + (index % 2) * 0.05}>
                    <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors duration-300 hover:border-emerald-400/30 hover:bg-white/[0.07]">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300 transition-colors group-hover:bg-emerald-400/20">
                        <Icon name={highlight.icon} className="h-4 w-4" />
                      </span>
                      <h3 className="mt-3.5 text-sm font-semibold text-white">
                        {highlight.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                        {highlight.description}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
