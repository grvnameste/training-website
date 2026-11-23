'use client'

import { ArrowRight } from 'lucide-react'

import { faqCategories, type FaqCategory } from '@/lib/content/homepage'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Container } from '@/components/marketing/container'
import { CtaButton } from '@/components/marketing/cta-button'
import { SectionHeading } from '@/components/marketing/section-heading'

export function Faq({ categories = faqCategories }: { categories?: FaqCategory[] }) {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-y border-slate-200/60 bg-surface py-20 lg:py-28"
    >
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              id="faq-title"
              eyebrow="Frequently asked questions"
              title="Questions, answered."
              description="Students, colleges, courses, certificates, and partnerships — the details that usually come up first."
            />

            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <p className="text-sm font-semibold text-slate-950">Still curious?</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Talk to a program advisor about your goals, or your campus.
              </p>
              <CtaButton
                href="/contact"
                className="mt-5"
                trailingIcon={<ArrowRight className="h-4 w-4" />}
              >
                Contact us
              </CtaButton>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <Tabs defaultValue={categories[0].id} className="gap-0">
            <TabsList
              aria-label="FAQ categories"
              className="flex h-auto w-fit max-w-full flex-wrap justify-start gap-1 rounded-2xl border border-slate-200 bg-white p-1 sm:rounded-full"
            >
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="h-auto flex-none rounded-full px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-950 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-none dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-5">
                <Accordion
                  type="single"
                  collapsible
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5"
                >
                  {category.items.map((item, index) => (
                    <AccordionItem key={item.question} value={`${category.id}-${index}`}>
                      <AccordionTrigger className="py-5 text-left text-[15px] font-semibold text-slate-900 transition-colors hover:text-blue-700 hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 pr-6 text-sm leading-relaxed text-slate-600">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Container>
    </section>
  )
}
