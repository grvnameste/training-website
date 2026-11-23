import { partners, trustStats, type Partner, type Stat } from '@/lib/content/homepage'
import { AnimatedCounter } from '@/components/marketing/animated-counter'
import { Container } from '@/components/marketing/container'
import { Eyebrow } from '@/components/marketing/section-heading'

const stopWords = new Set(['of', 'and', 'the', 'for'])

function initials(name: string) {
  return name
    .split(' ')
    .filter((word) => word && !stopWords.has(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

function LogoGroup({ items, hidden = false }: { items: Partner[]; hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-3 pr-3" aria-hidden={hidden || undefined}>
      {items.map((partner) => (
        <div
          key={partner.name}
          className="flex items-center gap-2.5 whitespace-nowrap rounded-2xl border border-slate-200/80 bg-white px-5 py-3 transition-colors hover:border-slate-300"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[9px] font-bold tracking-tight text-slate-500">
            {initials(partner.name)}
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-500">
            {partner.name}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TrustBand({
  stats = trustStats,
  partnerList = partners,
}: {
  stats?: Stat[]
  partnerList?: Partner[]
}) {
  return (
    <section aria-labelledby="trust-title" className="section-page border-y border-slate-200/70 bg-white">
      <Container className="py-14 lg:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Trusted by campuses and hiring teams</Eyebrow>
            <h2
              id="trust-title"
              className="mt-4 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl"
            >
              Credibility you can measure
            </h2>
          </div>
          <p className="text-sm text-slate-500">Reported across 2024–2026 cohorts</p>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-0 lg:divide-x lg:divide-slate-200 lg:dark:divide-white/10">
          {stats.map((stat) => (
            <div key={stat.label} className="lg:px-6 lg:first:pl-0 lg:last:pr-0">
              <dd className="text-[1.75rem] font-semibold leading-none tracking-tight text-slate-950 sm:text-[2rem]">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  format={stat.format}
                />
              </dd>
              <dt className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Partner campuses and hiring collaborators
          </p>
          <div className="marquee mask-fade-x mt-5 overflow-hidden">
            <div className="marquee-track flex w-max">
              <LogoGroup items={partnerList} />
              <LogoGroup items={partnerList} hidden />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
