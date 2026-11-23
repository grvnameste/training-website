import Link from 'next/link'
import { ArrowRight, Clock, FolderGit2, ListChecks } from 'lucide-react'

import { learningPaths, type LearningPath } from '@/lib/content/homepage'
import { Container } from '@/components/marketing/container'
import { CtaButton } from '@/components/marketing/cta-button'
import { Icon } from '@/components/marketing/icons'
import { Reveal } from '@/components/marketing/reveal'
import { SectionHeading } from '@/components/marketing/section-heading'
import { cn } from '@/lib/utils'

const levelStyles = {
  Beginner: 'bg-emerald-50 text-emerald-800',
  Intermediate: 'bg-blue-50 text-blue-700',
  Advanced: 'bg-amber-50 text-amber-800',
} as const

export function LearningPaths({ paths = learningPaths }: { paths?: LearningPath[] }) {
  return (
    <section
      id="learning-paths"
      aria-labelledby="learning-paths-title"
      className="section-page bg-white py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          id="learning-paths-title"
          eyebrow="Featured learning paths"
          title="Pick a path. Ship real work."
          description="Structured, mentor-reviewed tracks built around projects — not passive video hours. Every path ends with a deployed capstone you can defend in an interview."
          action={
            <CtaButton
              href="/courses"
              variant="secondary"
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              Browse all courses
            </CtaButton>
          }
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path, index) => (
            <li key={path.slug} className="h-full">
              <Reveal className="h-full" delay={(index % 3) * 0.06}>
                <article className="group flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/80 hover:shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-200/70 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-500">
                      <Icon name={path.icon} className="h-5 w-5" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      {path.featured ? (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                          Popular
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
                          levelStyles[path.level],
                        )}
                      >
                        {path.level}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                    {path.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{path.blurb}</p>

                  <dl className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <dt className="sr-only">Duration</dt>
                      <dd>{path.duration}</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <dt className="sr-only">Projects</dt>
                      <dd>{path.projects} projects</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                      <dt className="sr-only">Modules</dt>
                      <dd>{path.modules.length} modules</dd>
                    </div>
                  </dl>

                  <div className="mt-5 rounded-2xl bg-slate-50/80 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Curriculum highlights
                    </p>
                    <ul className="mt-2.5 space-y-1.5">
                      {path.modules.map((module) => (
                        <li key={module} className="flex items-start gap-2 text-xs text-slate-600">
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500"
                            aria-hidden="true"
                          />
                          {module}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies covered">
                    {path.skills.map((skill) => (
                      <li
                        key={skill}
                        className="rounded-full border border-slate-200/80 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-5">
                    <Link
                      href="/courses"
                      aria-label={`Explore the ${path.title} learning path`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
                    >
                      Explore path
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
