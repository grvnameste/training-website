import { whatWeDo, type Feature } from '@/lib/content/homepage'
import { Container } from '@/components/marketing/container'
import { Icon } from '@/components/marketing/icons'
import { Reveal } from '@/components/marketing/reveal'
import { SectionHeading } from '@/components/marketing/section-heading'
import { CtaButton } from '@/components/marketing/cta-button'
import { cn } from '@/lib/utils'

const audienceStyles: Record<string, string> = {
  'For students': 'bg-blue-50 text-blue-700',
  'For colleges': 'bg-emerald-50 text-emerald-800',
  'For everyone': 'bg-slate-100 text-slate-600',
}

export function WhatWeDo({ features = whatWeDo }: { features?: Feature[] }) {
  return (
    <section
      id="what-we-do"
      aria-labelledby="what-we-do-title"
      className="relative border-y border-slate-200/60 bg-surface py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          id="what-we-do-title"
          eyebrow="What we do"
          title="Everything a campus needs to teach, build, and hire."
          description="Six connected programs take learners from their first line of code to production-grade delivery — and help colleges embed that journey into the curriculum."
          action={<CtaButton href="/courses" variant="secondary">Explore programs</CtaButton>}
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <li key={feature.title} className="h-full">
              <Reveal className="h-full" delay={(index % 3) * 0.06}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-soft">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-500/[0.06] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                      <Icon name={feature.icon} className="h-5 w-5" />
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
                        audienceStyles[feature.audience],
                      )}
                    >
                      {feature.audience}
                    </span>
                  </div>
                  <h3 className="relative mt-5 text-lg font-semibold tracking-tight text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
