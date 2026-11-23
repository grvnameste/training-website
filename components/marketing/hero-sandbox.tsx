'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, TrendingUp } from 'lucide-react'

import {
  heroCertificate,
  heroMentor,
  heroPlacement,
  heroSnippets,
  type CodeToken,
} from '@/lib/content/homepage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const toneClass: Record<NonNullable<CodeToken['tone']>, string> = {
  plain: 'text-slate-300',
  keyword: 'text-sky-300',
  string: 'text-emerald-300',
  function: 'text-violet-300',
  comment: 'italic text-slate-400',
  number: 'text-amber-300',
  tag: 'text-rose-300',
}

export function HeroSandbox() {
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-[560px]">
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-500/15 via-transparent to-emerald-400/15 blur-2xl"
      />

      <motion.div
        {...enter(0.15)}
        className="relative overflow-hidden rounded-[26px] border border-slate-900/10 bg-slate-950 p-1.5 shadow-[0_50px_100px_-45px_rgba(15,23,42,0.65)] dark:border-white/10"
      >
        <div className="overflow-hidden rounded-[20px] bg-[#0b1220]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              readnrevise / lab
            </p>
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              live
            </span>
          </div>

          <Tabs defaultValue={heroSnippets[0].id} className="gap-0">
            <TabsList
              aria-label="Sample lesson code"
              className="h-auto w-full justify-start gap-1 rounded-none border-b border-white/10 bg-transparent p-0 px-3 pt-3"
            >
              {heroSnippets.map((snippet) => (
                <TabsTrigger
                  key={snippet.id}
                  value={snippet.id}
                  className="h-auto flex-none rounded-t-lg rounded-b-none border-b-2 border-transparent px-3 py-2 text-[11px] font-medium text-slate-400 transition-colors hover:text-slate-200 data-[state=active]:border-blue-400 data-[state=active]:bg-white/[0.06] data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  {snippet.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {heroSnippets.map((snippet) => (
              <TabsContent key={snippet.id} value={snippet.id} className="mt-0">
                <div className="px-4 pb-4 pt-3">
                  <p className="mb-3 font-mono text-[10px] text-slate-500">{snippet.file}</p>
                  <pre className="overflow-x-auto font-mono text-[11px] leading-[1.8] scrollbar-none">
                    <code className="block">
                      {snippet.lines.map((line, index) => (
                        <span
                          key={index}
                          className="grid grid-cols-[1.75rem_1fr] gap-2 whitespace-pre"
                        >
                          <span className="select-none text-right text-slate-600">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span>
                            {line.length === 0 ? (
                              '\u00A0'
                            ) : (
                              line.map((token, tokenIndex) => (
                                <span
                                  key={tokenIndex}
                                  className={toneClass[token.tone ?? 'plain']}
                                >
                                  {token.text}
                                </span>
                              ))
                            )}
                          </span>
                        </span>
                      ))}
                      <span className="grid grid-cols-[1.75rem_1fr] gap-2" aria-hidden="true">
                        <span />
                        <span className="inline-block h-3.5 w-[2px] motion-safe:animate-pulse bg-blue-400" />
                      </span>
                    </code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="border-t border-white/10 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 text-[10px] font-bold text-slate-950">
                  AS
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-white">
                    {heroMentor.name} · mentor
                  </p>
                  <p className="truncate text-[10px] text-slate-400">{heroMentor.lesson}</p>
                </div>
              </div>
              <span className="text-[11px] tabular-nums text-slate-300">
                {heroMentor.progress}%
              </span>
            </div>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                style={{ width: `${heroMentor.progress}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        {...enter(0.45)}
        className="absolute -right-2 top-10 z-10 hidden w-[192px] sm:block xl:-right-8 2xl:-right-16"
      >
        <div className="animate-float float-card rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_24px_50px_-24px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
              {heroMentor.status}
            </p>
          </div>
          <p className="mt-2 text-xs font-medium leading-snug text-slate-900">{heroMentor.note}</p>
          <p className="mt-1 text-[10px] text-slate-500">1:1 review · 12 min ago</p>
        </div>
      </motion.div>

      <motion.div
        {...enter(0.6)}
        className="absolute -left-2 bottom-20 z-10 hidden w-[190px] sm:block xl:-left-8 2xl:-left-16"
      >
        <div className="animate-float-slow float-card rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_24px_50px_-24px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {heroPlacement.label}
            </p>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            +{heroPlacement.value}%
          </p>
          <svg
            viewBox="0 0 120 32"
            className="mt-1 h-8 w-full"
            aria-hidden="true"
            fill="none"
          >
            <defs>
              <linearGradient id="placement-spark" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path
              d="M2 28 C16 27 22 20 34 21 C46 22 50 12 64 14 C78 16 84 7 98 6 C106 5.3 112 4 118 2"
              stroke="url(#placement-spark)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-[10px] text-slate-500">{heroPlacement.caption}</p>
        </div>
      </motion.div>

      <motion.div
        {...enter(0.75)}
        className="float-card absolute -bottom-5 right-5 z-10 hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.35)] sm:flex"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-700">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="text-[11px] font-semibold text-slate-900">{heroCertificate.title}</span>
        <span className="font-mono text-[9px] text-slate-500">{heroCertificate.serial}</span>
      </motion.div>
    </div>
  )
}
