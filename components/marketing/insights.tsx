import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react'

import { insights, type Insight } from '@/lib/content/homepage'
import { Container } from '@/components/marketing/container'
import { CtaButton } from '@/components/marketing/cta-button'
import { Reveal } from '@/components/marketing/reveal'
import { SectionHeading } from '@/components/marketing/section-heading'
import { cn } from '@/lib/utils'

const categoryStyles: Record<Insight['category'], string> = {
  Programming: 'bg-blue-50 text-blue-700',
  Technology: 'bg-emerald-50 text-emerald-800',
  'Career Development': 'bg-amber-50 text-amber-800',
}

function authorInitials(name: string) {
  return name
    .replace(/^Dr\.\s+/, '')
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

function Meta({ insight }: { insight: Insight }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={cn(
          'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
          categoryStyles[insight.category],
        )}
      >
        {insight.category}
      </span>
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
        <Clock className="h-3 w-3" aria-hidden="true" />
        {insight.readTime}
      </span>
    </div>
  )
}

export function Insights({ posts = insights }: { posts?: Insight[] }) {
  const featured = posts.find((insight) => insight.featured) ?? posts[0]
  const secondary = posts.filter((insight) => insight !== featured)

  return (
    <section
      id="insights"
      aria-labelledby="insights-title"
      className="section-page bg-white py-20 lg:py-28"
    >
      <Container>
        <SectionHeading
          id="insights-title"
          eyebrow="Latest insights"
          title="Notes from the industry."
          description="Practical writing on programming, technology, and careers — from the mentors and campus leaders inside the ReadnRevise network."
          action={
            <CtaButton
              href="/education/blog"
              variant="secondary"
              trailingIcon={<ArrowUpRight className="h-4 w-4" />}
            >
              Visit the blog
            </CtaButton>
          }
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <article className="group h-full">
              <Link
                href={featured.href}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:min-h-[436px] lg:flex-row"
              >
                <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-slate-100 lg:aspect-auto lg:w-[46%]">
                  <Image
                    src={featured.image}
                    alt={featured.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 320px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700 backdrop-blur">
                    Featured
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <Meta insight={featured} />
                  <h3 className="mt-3 text-balance text-xl font-semibold tracking-[-0.02em] text-slate-950 transition-colors group-hover:text-blue-700 sm:text-2xl">
                    {featured.title}
                  </h3>
                  <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {featured.excerpt}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                        {authorInitials(featured.author)}
                      </span>
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{featured.author}</span> ·{' '}
                        {featured.date}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          </Reveal>

          <div className="flex flex-col gap-5 lg:col-span-5">
            {secondary.map((insight, index) => (
              <Reveal key={insight.title} delay={0.08 + index * 0.06} className="flex-1">
                <article className="group h-full">
                  <Link
                    href={insight.href}
                    className="flex h-full min-h-[150px] gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-44 sm:w-40">
                      <Image
                        src={insight.image}
                        alt={insight.imageAlt}
                        fill
                        sizes="(min-width: 640px) 160px, 112px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col py-1">
                      <Meta insight={insight} />
                      <h3 className="mt-2 line-clamp-3 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-slate-950 transition-colors group-hover:text-blue-700">
                        {insight.title}
                      </h3>
                      <p className="mt-auto pt-3 text-[11px] text-slate-500">
                        {insight.author} · {insight.date}
                      </p>
                    </div>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
