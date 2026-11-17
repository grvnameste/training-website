'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface ConfettiPiece {
  id: number
  startX: number
  driftX: number
  endY: number
  rotate: number
  rotateX: number
  delay: number
  duration: number
  width: number
  height: number
  color: string
  shape: 'rect' | 'ribbon' | 'circle'
}

export interface ConfettiProps {
  /** Whether the confetti burst is currently active */
  active: boolean
  /** Increment to replay the burst while active remains true */
  burstKey?: number
  /** Number of confetti particles per burst */
  particleCount?: number
  /** Duration in milliseconds before automatically clearing particles */
  durationMs?: number
  /** Optional callback invoked after the burst finishes */
  onComplete?: () => void
}

const CONFETTI_COLORS = [
  '#2563EB', // blue-600
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EC4899', // pink-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
]

function createConfettiPieces(count: number): ConfettiPiece[] {
  const shapes: ConfettiPiece['shape'][] = ['rect', 'ribbon', 'circle']
  return Array.from({ length: count }, (_, idx) => {
    const shape = shapes[idx % shapes.length]
    const baseSize = 7 + Math.random() * 6
    return {
      id: idx,
      startX: 12 + Math.random() * 76,
      driftX: (Math.random() - 0.5) * 260,
      endY: 85 + Math.random() * 35,
      rotate: (Math.random() - 0.5) * 900,
      rotateX: 180 + Math.random() * 540,
      delay: Math.random() * 0.45,
      duration: 2.3 + Math.random() * 1.4,
      width: shape === 'ribbon' ? baseSize * 0.55 : baseSize,
      height: shape === 'ribbon' ? baseSize * 1.9 : baseSize,
      color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
      shape,
    }
  })
}

export function Confetti({
  active,
  burstKey = 0,
  particleCount = 75,
  durationMs = 4200,
  onComplete,
}: ConfettiProps) {
  const prefersReducedMotion = useReducedMotion()
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (!active || prefersReducedMotion) {
      setPieces([])
      return
    }

    setPieces(createConfettiPieces(particleCount))

    const timer = window.setTimeout(() => {
      setPieces([])
      onComplete?.()
    }, durationMs)

    return () => window.clearTimeout(timer)
  }, [active, burstKey, particleCount, durationMs, prefersReducedMotion, onComplete])

  if (prefersReducedMotion) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={`${burstKey}-${piece.id}`}
            initial={{
              left: `${piece.startX}%`,
              top: '-4vh',
              x: 0,
              y: 0,
              scale: 0.4,
              rotate: 0,
              rotateX: 0,
              opacity: 0,
            }}
            animate={{
              x: [0, piece.driftX * 0.45, piece.driftX],
              y: ['0vh', `${piece.endY * 0.48}vh`, `${piece.endY}vh`],
              scale: [0.4, 1.1, 0.95],
              rotate: piece.rotate,
              rotateX: piece.rotateX,
              opacity: [0, 1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: [0.22, 0.61, 0.36, 1],
              opacity: {
                times: [0, 0.08, 0.78, 1],
                duration: piece.duration,
                delay: piece.delay,
              },
            }}
            style={{
              position: 'absolute',
              width: `${piece.width}px`,
              height: `${piece.height}px`,
              backgroundColor: piece.color,
              borderRadius: piece.shape === 'circle' ? '9999px' : '2px',
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
