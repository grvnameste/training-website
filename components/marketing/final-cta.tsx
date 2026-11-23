import { ArrowRight, CalendarDays, Check } from 'lucide-react'

import { finalCta } from '@/lib/content/homepage'
import { Container } from '@/components/marketing/container'
import { CtaButton } from '@/components/marketing/cta-button'
import { Reveal } from '@/components/marketing/reveal'

export function FinalCta({ content = finalCta }: { content?: typeof finalCta }) {
  const footnotes = content.footnote.split(' · ')

  return (
    <section aria-labelledby="final-cta-title" className="section-page bg-white py-20 lg:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-transparent bg-slate-950 px-6 py-16 text-center dark:border-white/10 sm:px-10 lg:px-16 lg:py-20">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,black,transparent)] opacity-50" />
              <div className="absolute -top-24 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-blue-500/25 blur-[120px]" />
              <div className="absolute -bottom-28 right-[10%] h-72 w-72 rounded-full bg-emerald-400/15 blur-[110px]" />
            </div>

            <div className="relative mx-auto max-w-3xl">
              <p className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                <span className="h-px w-7 bg-emerald-400/60" aria-hidden="true" />
                {content.eyebrow}
              </p>

              <h2
                id="final-cta-title"
                className="mt-5 text-balance text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-[3.4rem]"
              >
                {content.headline}
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-300">
                {content.description}
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <CtaButton
                  href={content.primaryCta.href}
                  variant="white"
                  size="lg"
                  trailingIcon={
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  }
                >
                  {content.primaryCta.label}
                </CtaButton>
                <CtaButton
                  href={content.secondaryCta.href}
                  variant="outline-white"
                  size="lg"
                  leadingIcon={<CalendarDays className="h-4 w-4" />}
                >
                  {content.secondaryCta.label}
                </CtaButton>
              </div>

              <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {footnotes.map((note) => (
                  <li key={note} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
