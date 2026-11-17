<<<<<<< HEAD
// components/BoardColumn.tsx
'use client'

import React, { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard, { CardItem } from './TaskCard'
import { Plus } from 'lucide-react'

type List = {
  id: string
  title: string
  position?: number
  [key: string]: any
}

type Props = {
  list: List
  cards: CardItem[]
  newTask: string
  setNewTask: (value: string) => void
  addTask: () => void
  onDeleteCard?: (cardId: string) => void
}

export default function BoardColumn({
  list,
  cards,
  newTask,
  setNewTask,
  addTask,
  onDeleteCard,
}: Props) {
  // Connect @dnd-kit/core for column drop target
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: {
      type: 'Column',
      list,
    },
  })

  // Memoize card IDs for SortableContext
  const cardIds = useMemo(() => cards.map((c) => c.id), [cards])

  return (
    <div className="bg-[#ebecf0] rounded-2xl p-4 w-[300px] shrink-0 flex flex-col max-h-[85vh] shadow-sm border border-slate-200/60 transition-colors">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
          <span>{list.title}</span>
        </h2>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
          {cards.length}
        </span>
      </div>

      {/* Droppable and Sortable Cards List */}
      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex flex-col gap-2.5 overflow-y-auto flex-1 min-h-[140px] p-1 rounded-xl transition-all ${
            isOver
              ? 'bg-blue-100/70 border-2 border-dashed border-blue-400 ring-2 ring-blue-300/40'
              : 'border border-transparent'
          }`}
        >
          {cards.map((card) => (
            <TaskCard
              key={card.id}
              id={card.id}
              title={card.title}
              card={card}
              onDelete={onDeleteCard}
            />
          ))}

          {cards.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-6 border border-dashed border-slate-300/80 rounded-xl text-xs text-slate-400 font-medium text-center select-none">
              Drag tasks here
            </div>
          )}
        </div>
      </SortableContext>

      {/* Task Creation Form */}
      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
        <input
          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-800"
          placeholder="+ Add a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTask()
            }
          }}
        />

        <button
          type="button"
          disabled={!newTask?.trim()}
          className="w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-slate-900 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm"
          onClick={addTask}
        >
          <Plus size={14} /> Add Card
        </button>
      </div>
    </div>
  )
=======
//components/BoardColumn.tsx
'use client'
import TaskCard from "./TaskCard"

type Props = {
  list: any
  cards: any[]
  newTask: string
  setNewTask: (value: string) => void
  addTask: () => void
}

export default function BoardColumn({
  list,
  cards,
  newTask,
  setNewTask,
  addTask
}: Props) {
  return (
    <div className="bg-[#ebecf0] rounded-xl p-4 w-[300px] flex flex-col max-h-[80vh]">

      <h2 className="font-semibold mb-3">{list.title}</h2>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {cards.map((card:any) => (
          <TaskCard key={card.id} title={card.title} />
        ))}
      </div>

      <input
        className="w-full border rounded-md p-2 text-sm mt-2"
        placeholder="Add task"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 mt-2 rounded-md"
        onClick={addTask}
      >
        Add
      </button>

    </div>
  )
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
}