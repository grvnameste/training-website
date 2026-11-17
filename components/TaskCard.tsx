// components/TaskCard.tsx
'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'

export type CardItem = {
  id: string
  title: string
  list_id?: string
  position?: number
  description?: string
  [key: string]: any
}

type Props = {
  id?: string
  title: string
  card?: CardItem
  isOverlay?: boolean
  onDelete?: (id: string) => void
}

export default function TaskCard({ id, title, card, isOverlay = false, onDelete }: Props) {
  const cardId = id || card?.id || title

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cardId,
    data: {
      type: 'Card',
      card: card || { id: cardId, title },
    },
    disabled: isOverlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Floating preview while dragging
  if (isOverlay) {
    return (
      <div className="bg-white p-3.5 rounded-xl shadow-2xl border-2 border-blue-500 cursor-grabbing rotate-1 scale-105 select-none text-slate-900 font-semibold text-sm flex items-center justify-between gap-2 z-50">
        <span className="truncate pr-2">{title}</span>
        <GripVertical size={16} className="text-blue-500 shrink-0" />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing select-none text-slate-800 text-sm font-medium flex items-center justify-between gap-2 ${
        isDragging ? 'opacity-30 border-2 border-dashed border-blue-400 bg-blue-50/50 shadow-none' : ''
      }`}
    >
      <span className="flex-1 break-words leading-snug">{title}</span>

      <div className="flex items-center gap-1 shrink-0">
        {onDelete && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(cardId)
            }}
            className="text-slate-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete task"
          >
            <Trash2 size={13} />
          </button>
        )}
        <GripVertical size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
      </div>
    </div>
  )
}