<<<<<<< HEAD
'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import BoardColumn from '@/components/BoardColumn'
import TaskCard, { CardItem } from '@/components/TaskCard'
import { ArrowLeft, CheckCircle2, Cloud, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

type List = {
  id: string
  title: string
  position: number
  board_id?: string
}

export default function BoardPage() {
  const { user, isLoaded } = useUser()
  const params = useParams()
  const router = useRouter()
  const capstoneId = params?.capstoneId as string

  const [lists, setLists] = useState<List[]>([])
  const [cards, setCards] = useState<CardItem[]>([])
  const [activeCard, setActiveCard] = useState<CardItem | null>(null)
  const [newTask, setNewTask] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [boardTitle, setBoardTitle] = useState('Capstone Project Board')
  const [boardId, setBoardId] = useState<string | null>(null)

  const initialized = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px drag intent prevents accidental clicks from triggering drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ==============================================================
  // 1. INITIALIZE & LOAD STUDENT BOARD
  // ==============================================================
  const loadBoard = useCallback(async () => {
    if (!capstoneId || !user?.id) return
    setLoading(true)

    try {
      const [boardRes, courseRes] = await Promise.all([
        fetch(`/api/me/boards/${capstoneId}`, { cache: 'no-store' }),
        fetch(`/api/catalog/courses/${capstoneId}`, { cache: 'no-store' }),
      ])

      const boardData = await boardRes.json().catch(() => ({}))
      if (!boardRes.ok) throw new Error(boardData?.error || 'Failed to load board')

      const courseData = await courseRes.json().catch(() => ({}))
      if (courseData?.course?.title) {
        setBoardTitle(`${courseData.course.title} – Board`)
      }

      setBoardId(boardData.board.id)
      setLists(boardData.lists ?? [])
      setCards(boardData.cards ?? [])
    } catch (err) {
      console.error('Failed to load board:', err)
    } finally {
      setLoading(false)
    }
  }, [capstoneId, user?.id])

  useEffect(() => {
    if (!isLoaded || !user?.id || initialized.current) return
    initialized.current = true
    loadBoard()
  }, [isLoaded, user?.id, loadBoard])

  // ==============================================================
  // 2. ADD & DELETE TASKS
  // ==============================================================
  const addTask = async (listId: string) => {
    const text = newTask[listId]?.trim()
    if (!text) return

    // Position is at the end of the current column
    const columnCards = cards.filter((c) => c.list_id === listId)
    const position = columnCards.length

    // Optimistic insert
    const tempId = `temp_${Date.now()}`
    const optimisticCard: CardItem = {
      id: tempId,
      list_id: listId,
      title: text,
      position,
    }

    setCards((prev) => [...prev, optimisticCard])
    setNewTask((prev) => ({ ...prev, [listId]: '' }))
    triggerSaveStatus('saving')

    try {
      if (!boardId) throw new Error('Board is not ready')
      const res = await fetch(`/api/boards/${boardId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, title: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to insert card')

      setCards((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? {
                ...c,
                id: data.card.id,
                list_id: data.card.listId,
                title: data.card.title,
                position: data.card.position,
              }
            : c
        )
      )
      triggerSaveStatus('saved')
    } catch (err) {
      console.error('Failed to insert card:', err)
      setCards((prev) => prev.filter((c) => c.id !== tempId))
      triggerSaveStatus('idle')
    }
  }

  const deleteTask = async (cardId: string) => {
    const cardToDelete = cards.find((c) => c.id === cardId)
    if (!cardToDelete) return

    // Optimistic removal
    setCards((prev) => prev.filter((c) => c.id !== cardId))
    triggerSaveStatus('saving')

    toast('Task deleted', {
      description: `"${cardToDelete.title}" was removed from the board.`,
      action: {
        label: 'Undo',
        onClick: () => restoreTask(cardToDelete),
      },
      duration: 6000,
    })

    try {
      if (!boardId) throw new Error('Board is not ready')
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete card')
      triggerSaveStatus('saved')
    } catch (err) {
      console.error('Failed to delete card:', err)
      triggerSaveStatus('idle')
    }
  }

  const restoreTask = async (cardToRestore: CardItem) => {
    setCards((prev) => [...prev, cardToRestore])
    triggerSaveStatus('saving')

    try {
      if (!boardId || !cardToRestore.list_id) throw new Error('Board is not ready')
      const res = await fetch(`/api/boards/${boardId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: cardToRestore.list_id,
          title: cardToRestore.title,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to restore card')
      setCards((prev) =>
        prev.filter((card) => card.id !== cardToRestore.id).concat({
          ...cardToRestore,
          id: data.card.id,
          list_id: data.card.listId,
          position: data.card.position,
        })
      )
      triggerSaveStatus('saved')
      toast.success(`Restored task "${cardToRestore.title}".`)
    } catch (err) {
      console.error('Failed to restore task:', err)
      triggerSaveStatus('idle')
    }
  }

  const triggerSaveStatus = (status: 'saving' | 'saved' | 'idle') => {
    setSaveStatus(status)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    if (status === 'saved') {
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 2500)
    }
  }

  // ==============================================================
  // 3. DRAG AND DROP HANDLERS (@dnd-kit)
  // ==============================================================
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const foundCard = cards.find((c) => c.id === active.id)
    if (foundCard) {
      setActiveCard(foundCard)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    // Identify active and over objects
    const activeData = active.data.current
    const overData = over.data.current

    if (activeData?.type !== 'Card') return

    const activeCardObj = cards.find((c) => c.id === activeId)
    if (!activeCardObj) return

    // Find target column ID
    let targetColId: string | null = null

    if (overData?.type === 'Column') {
      targetColId = overId
    } else if (overData?.type === 'Card') {
      targetColId = overData.card.list_id || cards.find((c) => c.id === overId)?.list_id || null
    }

    if (!targetColId) return

    // If moving across columns, update list_id optimistically
    if (activeCardObj.list_id !== targetColId) {
      setCards((prev) => {
        const activeIndex = prev.findIndex((c) => c.id === activeId)
        const overIndex = prev.findIndex((c) => c.id === overId)

        if (activeIndex === -1) return prev

        const updated = [...prev]
        const [movedCard] = updated.splice(activeIndex, 1)
        movedCard.list_id = targetColId!

        if (overIndex !== -1) {
          updated.splice(overIndex, 0, movedCard)
        } else {
          updated.push(movedCard)
        }

        return updated
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeCardObj = cards.find((c) => c.id === activeId)
    if (!activeCardObj) return

    const overData = over.data.current
    let targetColId: string | undefined = activeCardObj.list_id

    if (overData?.type === 'Column') {
      targetColId = overId
    } else if (overData?.type === 'Card') {
      targetColId = overData.card.list_id || cards.find((c) => c.id === overId)?.list_id || targetColId
    }

    if (!targetColId) return

    // Reorder cards in state
    let nextCards = [...cards]
    const activeIndex = nextCards.findIndex((c) => c.id === activeId)
    const overIndex = nextCards.findIndex((c) => c.id === overId)

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      nextCards = arrayMove(nextCards, activeIndex, overIndex)
    }

    // Ensure target list_id is set
    nextCards = nextCards.map((c) => {
      if (c.id === activeId) {
        return { ...c, list_id: targetColId }
      }
      return c
    })

    // Recalculate positions for all cards in the affected target column
    const targetCards = nextCards.filter((c) => c.list_id === targetColId)
    const cardPositionInTarget = targetCards.findIndex((c) => c.id === activeId)
    const finalPosition = cardPositionInTarget >= 0 ? cardPositionInTarget : 0

    // Update state immediately
    setCards(nextCards)

    triggerSaveStatus('saving')

    try {
      if (!boardId) throw new Error('Board is not ready')
      const counters = new Map<string, number>()
      const items = nextCards
        .filter((card) => card.list_id && !card.id.startsWith('temp_'))
        .map((card) => {
          const position = counters.get(card.list_id!) ?? 0
          counters.set(card.list_id!, position + 1)
          return { id: card.id, listId: card.list_id!, position }
        })

      if (items.length > 0) {
        const res = await fetch(`/api/boards/${boardId}/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        })
        if (!res.ok) throw new Error('Failed to persist board order')
      }
      triggerSaveStatus('saved')
    } catch (err) {
      console.error('Error persisting card movement to database:', err)
      triggerSaveStatus('idle')
    }
  }

  // ==============================================================
  // 5. RENDER UI
  // ==============================================================
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading project board...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[85vh] flex flex-col space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href={`/student/capstone/${capstoneId}/stage/2`}
              className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Stage 2
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{boardTitle}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Interactive SDLC Kanban Board • Drag cards to update task status in real time
          </p>
        </div>

        {/* Database Sync Status Indicator */}
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 animate-pulse">
              <Loader2 size={13} className="animate-spin text-blue-600" />
              <span>Saving changes...</span>
            </div>
          )}

          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>All changes saved</span>
            </div>
          )}

          {saveStatus === 'idle' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <Cloud size={13} className="text-slate-400" />
              <span>Cloud Synced</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Drag-and-Drop Columns Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto pb-6">
          <div className="flex gap-5 items-start min-w-max">
            {lists.map((list) => {
              const columnCards = cards.filter((c) => c.list_id === list.id)

              return (
                <BoardColumn
                  key={list.id}
                  list={list}
                  cards={columnCards}
                  newTask={newTask[list.id] || ''}
                  setNewTask={(value) =>
                    setNewTask((prev) => ({
                      ...prev,
                      [list.id]: value,
                    }))
                  }
                  addTask={() => addTask(list.id)}
                  onDeleteCard={deleteTask}
                />
              )
            })}
          </div>
        </div>

        {/* Floating preview while dragging */}
        <DragOverlay>
          {activeCard ? (
            <TaskCard
              id={activeCard.id}
              title={activeCard.title}
              card={activeCard}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
=======
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import BoardColumn from '../../../../components/BoardColumn'
import { useUser } from "@clerk/nextjs"

export default function BoardPage() {

  const { user } = useUser()

  const params = useParams()
  const capstoneId = params.capstoneId as string

  const [lists, setLists] = useState<any[]>([])
  const [cards, setCards] = useState<any[]>([])
  const [newTask, setNewTask] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const initialized = useRef(false)

  // ================= LOAD BOARD =================
  const loadBoard = async () => {
    if (loading) return
    setLoading(true)

    try {
      if (!user?.id) return

      // Clerk → UUID
      const { data: uuid } = await supabase.rpc('clerk_to_uuid', {
        clerk_id: user.id
      })

      const studentId = uuid

      // =========================
      // 🔥 STEP 1: TEMPLATE FIRST
      // =========================
      const { data: template } = await supabase
        .from('board_templates')
        .select('*')
        .eq('capstone_id', capstoneId)
        .single()

      if (template) {
        const { data: templateLists } = await supabase
          .from('template_lists')
          .select('*')
          .eq('template_id', template.id)
          .order('position')

        if (templateLists && templateLists.length > 0) {

          setLists(templateLists)

          const listIds = templateLists.map(l => l.id)

          const { data } = await supabase
            .from('template_cards')
            .select('id,title,list_id')
            .in('list_id', listIds)

          setCards(data || [])

          setLoading(false)
          return // 🔥 STOP HERE → no board load
        }
      }

      // =========================
      // 🔥 STEP 2: BOARD FALLBACK
      // =========================
      let { data: board } = await supabase
        .from('boards')
        .select('*')
        .eq('capstone_id', capstoneId)
        .eq('student_id', studentId)
        .maybeSingle()

      if (!board) {
        setLists([])
        setCards([])
        return
      }

      // load lists
      const { data: listData } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', board.id)
        .order('position')

      setLists(listData || [])

      // load cards
      let cardData: any[] = []

      if (listData && listData.length > 0) {
        const listIds = listData.map(l => l.id)

        const { data } = await supabase
          .from('cards')
          .select('id,title,list_id')
          .in('list_id', listIds)

        cardData = data || []
      }

      setCards(cardData)

    } catch (error) {
      console.error("Board load failed", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!capstoneId || initialized.current) return
    initialized.current = true
    loadBoard()
  }, [capstoneId])

  // ================= ADD TASK =================
  const addTask = async (listId: string) => {
    if (!newTask[listId]) return

    const { data } = await supabase
      .from('cards')
      .insert({
        list_id: listId,
        title: newTask[listId],
        position: 0
      })
      .select()
      .single()

    if (data) {
      setCards(prev => [...prev, data])
    }

    setNewTask(prev => ({
      ...prev,
      [listId]: ""
    }))
  }

  // ================= UI =================
  return (
    <div className="h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-6 overflow-x-auto">
      
      <h1 className="text-3xl font-bold mb-6 text-slate-800 tracking-tight">
        Project Board
      </h1>

      <div className="flex gap-5 w-max items-start">
        {lists.map(list => {
          const listCards = cards.filter(c => c.list_id === list.id)

          return (
            <BoardColumn
              key={list.id}
              list={list}
              cards={listCards}
              newTask={newTask[list.id] || ""}
              setNewTask={(value) =>
                setNewTask(prev => ({
                  ...prev,
                  [list.id]: value
                }))
              }
              addTask={() => addTask(list.id)}
            />
          )
        })}
      </div>
    </div>
  )
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
}