import { ArrowRight, Check } from 'lucide-react'

import { journeySteps, type JourneyStep } from '@/lib/content/homepage'
import { Container } from '@/components/marketing/container'
import { CtaButton } from '@/components/marketing/cta-button'
import { Icon } from '@/components/marketing/icons'
import { Reveal } from '@/components/marketing/reveal'
import { SectionHeading } from '@/components/marketing/section-heading'

export function SuccessJourney({ steps = journeySteps }: { steps?: JourneyStep[] }) {
  return (
    <section
      id="journey"
      aria-labelledby="journey-title"
      className="section-page bg-white py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          id="journey-title"
          eyebrow="Student success journey"
          title="From first commit to first offer."
          description="Six milestones, each with a concrete outcome you can point to. Mentors verify progress at every step, so nothing is left to chance."
          action={
            <CtaButton
              href="/for-students"
              variant="secondary"
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              Start with a diagnostic
            </CtaButton>
          }
        />

        <ol className="relative mt-14 hidden gap-6 lg:grid lg:grid-cols-6">
          <span
            aria-hidden="true"
            className="absolute left-[22px] right-[calc(16.667%-22px)] top-[22px] h-px bg-gradient-to-r from-blue-200 via-slate-200 to-emerald-200"
          />
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              <Reveal delay={index * 0.08}>
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-700 shadow-sm ring-4 ring-white">
                  <Icon name={step.icon} className="h-5 w-5" />
                </span>
                <p className="mt-5 font-mono text-[11px] font-medium tracking-[0.08em] text-slate-500">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-1 text-[15px] font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  {step.milestone}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>

        <ol className="relative mt-10 space-y-8 border-l border-dashed border-slate-200 pl-7 lg:hidden">
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              <Reveal delay={index * 0.04}>
                <span className="absolute -left-[40px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-700 shadow-sm">
                  <Icon name={step.icon} className="h-3.5 w-3.5" />
                </span>
                <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-slate-500">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  {step.milestone}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
