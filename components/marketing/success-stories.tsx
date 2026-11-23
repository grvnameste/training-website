'use client'

import { useState } from 'react'
import { Quote, TrendingUp } from 'lucide-react'

import { testimonials, type Testimonial } from '@/lib/content/homepage'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Container } from '@/components/marketing/container'
import { SectionHeading } from '@/components/marketing/section-heading'
import { cn } from '@/lib/utils'

const filters = [
  { id: 'student', label: 'Students & alumni' },
  { id: 'faculty', label: 'Deans & faculty' },
] as const

type FilterId = (typeof filters)[number]['id']

export function SuccessStories({ stories = testimonials }: { stories?: Testimonial[] }) {
  const [active, setActive] = useState<FilterId>('student')
  const items = stories.filter((story) => story.category === active)

  return (
    <section
      id="stories"
      aria-labelledby="stories-title"
      className="border-y border-slate-200/60 bg-surface py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          id="stories-title"
          eyebrow="Success stories"
          title="Outcomes, not just certificates."
          description="Hear from the learners who shipped their way into roles — and the campus leaders who rebuilt their programs around practice."
          action={
            <div
              role="group"
              aria-label="Filter success stories"
              className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm"
            >
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={active === filter.id}
                  onClick={() => setActive(filter.id)}
                  className={cn(
                    'rounded-full px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1',
                    active === filter.id
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 hover:text-slate-950 dark:hover:text-white',
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          }
        />

        <p className="sr-only" aria-live="polite">
          Showing {items.length} stories for {filters.find((f) => f.id === active)?.label}.
        </p>

        <Carousel
          key={active}
          aria-label="Success stories carousel"
          opts={{ align: 'start' }}
          className="mt-10"
        >
          <CarouselContent>
            {items.map((story) => (
              <CarouselItem key={story.id} className="md:basis-1/2">
                <figure className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-7">
                  <Quote className="h-6 w-6 text-blue-200" aria-hidden="true" />
                  <blockquote className="mt-4 flex-1 text-pretty text-[15px] leading-relaxed text-slate-700">
                    “{story.quote}”
                  </blockquote>

                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 text-sm font-semibold text-white">
                      {story.initials}
                    </span>
                    <figcaption className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{story.name}</p>
                      <p className="line-clamp-2 text-[11px] leading-snug text-slate-500">
                        {story.role} · {story.institution}
                      </p>
                    </figcaption>
                  </div>

                  <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                    <TrendingUp className="h-3 w-3" aria-hidden="true" />
                    {story.outcome}
                  </p>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Use the arrow keys or the controls to explore more stories.
            </p>
            <div className="flex gap-2">
              <CarouselPrevious className="static size-10 translate-x-0 translate-y-0 border-slate-200 bg-white text-slate-700 hover:bg-slate-50" />
              <CarouselNext className="static size-10 translate-x-0 translate-y-0 border-slate-200 bg-white text-slate-700 hover:bg-slate-50" />
            </div>
          </div>
        </Carousel>
      </Container>
    </section>
  )
}
