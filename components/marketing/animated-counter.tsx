'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

export function AnimatedCounter({
  value,
  suffix = '',
  format,
  className,
  duration = 1.6,
}: {
  value: number
  suffix?: string
  format?: 'comma'
  className?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    if (reduceMotion) {
      setDisplay(value)
      return
    }

    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })

    return () => controls.stop()
  }, [isInView, value, reduceMotion, duration])

  const visible = format === 'comma' ? display.toLocaleString('en-US') : String(display)
  const readable = format === 'comma' ? value.toLocaleString('en-US') : String(value)

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">
        {visible}
        {suffix}
      </span>
      <span className="sr-only">
        {readable}
        {suffix}
      </span>
    </span>
  )
}
