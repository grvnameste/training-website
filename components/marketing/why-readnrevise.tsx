import { Check, X } from 'lucide-react'

import { benefits, comparison, type Benefit } from '@/lib/content/homepage'
import { Container } from '@/components/marketing/container'
import { Icon } from '@/components/marketing/icons'
import { Reveal } from '@/components/marketing/reveal'
import { SectionHeading } from '@/components/marketing/section-heading'

export function WhyReadnRevise({
  benefitList = benefits,
  comparisonData = comparison,
}: {
  benefitList?: Benefit[]
  comparisonData?: typeof comparison
}) {
  return (
    <section
      id="why-readnrevise"
      aria-labelledby="why-title"
      className="relative overflow-hidden border-y border-slate-200/60 bg-surface py-20 lg:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-72 w-[720px] -translate-x-1/2 rounded-full bg-blue-500/[0.04] blur-3xl" />
      </div>

      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative order-2 lg:order-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Side by side
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Updated for 2026
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  {comparisonData.traditionalTitle}
                </h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 ring-1 ring-slate-200">
                  Theory-first
                </span>
              </div>
              <ul className="mt-4 space-y-3">
                {comparisonData.traditionalItems.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-slate-500">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="my-3.5 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="rounded-full bg-slate-950 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                vs
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50/90 to-white p-5 ring-1 ring-blue-100/70 dark:border-blue-400/30 dark:from-blue-500/10 dark:to-transparent dark:ring-blue-400/20">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-blue-800">
                  {comparisonData.readnreviseTitle}
                </h3>
                <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                  Industry-first
                </span>
              </div>
              <ul className="mt-4 space-y-3">
                {comparisonData.readnreviseItems.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm font-medium text-slate-800">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="h-2.5 w-2.5" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="animate-float absolute -bottom-6 right-4 hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lift md:flex">
            <span className="text-2xl font-semibold tracking-tight text-slate-950">94%</span>
            <span>
              <span className="block text-xs font-semibold text-slate-900">
                Capstone approval
              </span>
              <span className="block text-[10px] text-slate-500">across 2026 cohorts</span>
            </span>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeading
            id="why-title"
            eyebrow="Why ReadnRevise"
            title="Industry depth, built into every classroom."
            description="Students learn the way engineers actually work: in sprints, with reviews, shipping something real. Colleges get a partner who maps that practice onto the academic calendar."
          />

          <ul className="mt-9 grid gap-x-6 gap-y-7 sm:grid-cols-2">
            {benefitList.map((benefit, index) => (
              <li key={benefit.title}>
                <Reveal delay={index * 0.04}>
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
                      <Icon name={benefit.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">{benefit.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
