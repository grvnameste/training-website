import type { Metadata } from 'next'

import { Hero } from '@/components/marketing/hero'
import { TrustBand } from '@/components/marketing/trust-band'
import { WhatWeDo } from '@/components/marketing/what-we-do'
import { LearningPaths } from '@/components/marketing/learning-paths'
import { WhyReadnRevise } from '@/components/marketing/why-readnrevise'
import { SuccessJourney } from '@/components/marketing/success-journey'
import { InstitutionPartnership } from '@/components/marketing/institution-partnership'
import { SuccessStories } from '@/components/marketing/success-stories'
import { Insights } from '@/components/marketing/insights'
import { Faq } from '@/components/marketing/faq'
import { FinalCta } from '@/components/marketing/final-cta'

const description =
  'Learn programming, build real projects, and become industry ready with mentor-led courses. ReadnRevise partners with colleges on curriculum, faculty development, and placement readiness.'

export const metadata: Metadata = {
  title: { absolute: 'ReadnRevise — Learn. Build. Innovate.' },
  description,
  openGraph: {
    title: 'ReadnRevise — Learn. Build. Innovate.',
    description,
    type: 'website',
    siteName: 'ReadnRevise',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'ReadnRevise',
  slogan: 'Learn • Build • Innovate',
  description,
  email: 'support@readnrevise.com',
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Hero />
      <TrustBand />
      <WhatWeDo />
      <LearningPaths />
      <WhyReadnRevise />
      <SuccessJourney />
      <InstitutionPartnership />
      <SuccessStories />
      <Insights />
      <Faq />
      <FinalCta />
    </>
  )
}
