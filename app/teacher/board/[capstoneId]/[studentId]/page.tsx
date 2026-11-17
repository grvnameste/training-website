<<<<<<< HEAD
// app/teacher/board/[capstoneId]/[studentId]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import BoardColumn from '@/components/BoardColumn'
import TaskCard, { CardItem } from '@/components/TaskCard'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Cloud, Loader2 } from 'lucide-react'
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

type List = {
  id: string
  title: string
  position?: number
  board_id?: string
}

export default function TeacherBoardPage() {
  const params = useParams()
  const router = useRouter()
  const capstoneId = params?.capstoneId as string
  const studentId = params?.studentId as string

  const [lists, setLists] = useState<List[]>([])
  const [cards, setCards] = useState<CardItem[]>([])
  const [activeCard, setActiveCard] = useState<CardItem | null>(null)
  const [studentName, setStudentName] = useState('')
  const [capstoneTitle, setCapstoneTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [boardId, setBoardId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    async function loadBoard() {
      setLoading(true)
      try {
        const res = await fetch(`/api/instructor/boards/${capstoneId}/${studentId}`, {
          cache: 'no-store',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Failed to load board')

        setBoardId(data.board.id)
        setStudentName(data.studentName || 'Student')
        setCapstoneTitle(data.capstoneTitle || 'Capstone')
        setLists(data.lists ?? [])
        setCards(data.cards ?? [])
      } catch (err) {
        console.error('Failed to load teacher board:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBoard()
  }, [capstoneId, studentId])

  // Drag-and-Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const foundCard = cards.find((c) => c.id === event.active.id)
    if (foundCard) setActiveCard(foundCard)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeCardObj = cards.find((c) => c.id === activeId)
    if (!activeCardObj) return

    let targetColId: string | null = null
    const overData = over.data.current

    if (overData?.type === 'Column') {
      targetColId = overId
    } else if (overData?.type === 'Card') {
      targetColId = overData.card.list_id || cards.find((c) => c.id === overId)?.list_id || null
    }

    if (!targetColId || activeCardObj.list_id === targetColId) return

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

    let nextCards = [...cards]
    const activeIndex = nextCards.findIndex((c) => c.id === activeId)
    const overIndex = nextCards.findIndex((c) => c.id === overId)

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      nextCards = arrayMove(nextCards, activeIndex, overIndex)
    }

    nextCards = nextCards.map((c) => {
      if (c.id === activeId) return { ...c, list_id: targetColId }
      return c
    })

    const targetCards = nextCards.filter((c) => c.list_id === targetColId)
    const cardPositionInTarget = targetCards.findIndex((c) => c.id === activeId)
    const finalPosition = cardPositionInTarget >= 0 ? cardPositionInTarget : 0

    setCards(nextCards)
    setSaveStatus('saving')

    try {
      if (!boardId) throw new Error('Board is not ready')
      const counters = new Map<string, number>()
      const items = nextCards
        .filter((card) => card.list_id)
        .map((card) => {
          const position = counters.get(card.list_id!) ?? 0
          counters.set(card.list_id!, position + 1)
          return { id: card.id, listId: card.list_id!, position }
        })

      const res = await fetch(`/api/boards/${boardId}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) throw new Error('Failed to save board order')

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch (err) {
      console.error('Teacher board update error:', err)
      setSaveStatus('idle')
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#f1f2f4] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading student board...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#f1f2f4] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.push('/teacher/capstone/approvals')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Approvals
        </Button>

        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 animate-pulse">
              <Loader2 size={12} className="animate-spin text-blue-600" />
              <span>Saving...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span>Saved</span>
            </div>
          )}
          {saveStatus === 'idle' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/60 text-slate-600 text-xs font-medium">
              <Cloud size={12} className="text-slate-400" />
              <span>Synced</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{capstoneTitle || 'Capstone Project'}</h1>
        <p className="text-sm text-slate-500">
          Student: <span className="font-semibold text-slate-800">{studentName || 'Student'}</span>
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto pb-6">
          <div className="flex gap-6 items-start min-w-max">
            {lists.map((list) => {
              const listCards = cards.filter((c) => c.list_id === list.id)

              return (
                <BoardColumn
                  key={list.id}
                  list={list}
                  cards={listCards}
                  newTask=""
                  setNewTask={() => {}}
                  addTask={() => {}}
                />
              )
            })}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <TaskCard id={activeCard.id} title={activeCard.title} card={activeCard} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
=======
//app/teacher/board/[capstoneId]/[studentId]/page.tsx
'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import BoardColumn from '@/components/BoardColumn'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TeacherBoardPage() {

const params = useParams()
const router = useRouter()
const capstoneId = params.capstoneId as string
const studentId = params.studentId as string

const [lists,setLists] = useState<any[]>([])
const [cards,setCards] = useState<any[]>([])
const [studentName,setStudentName] = useState('')
const [capstoneTitle,setCapstoneTitle] = useState('')

useEffect(() => {

async function loadBoard(){
    // get student + capstone info
   // get student name
const { data: student } = await supabase
.from('students')
.select('name')
.eq('id', studentId)
.single()

if(student){
setStudentName(student.name)
}

// get course title
const { data: course } = await supabase
.from('capstone_courses')
.select('title')
.eq('id', capstoneId)
.single()

if(course){
setCapstoneTitle(course.title)
}

const { data: board } = await supabase
.from('boards')
.select('*')
.eq('capstone_id',capstoneId)
.eq('student_id',studentId)
.single()

if(!board) return

const { data: listData } = await supabase
.from('lists')
.select('*')
.eq('board_id',board.id)
.order('position')

setLists(listData || [])

const listIds = listData?.map(l => l.id) || []

if(listIds.length){

const { data: cardData } = await supabase
.from('cards')
.select('*')
.in('list_id',listIds)

setCards(cardData || [])

}

}

loadBoard()

},[])

return (

    <div className="h-screen bg-[#f1f2f4] p-6 overflow-x-auto">
    
    <Button
variant="ghost"
className="mb-4 flex items-center gap-2"
onClick={() => router.push('/teacher/capstone/approvals')}
>
<ArrowLeft className="w-4 h-4" />
Back to Approvals
</Button>

<div className="mb-6">
<h1 className="text-xl font-bold">
{capstoneTitle}
</h1>
<p className="text-sm text-slate-500">
Student: {studentName}
</p>
</div>

<div className="flex gap-6">

{lists.map(list => {

const listCards = cards.filter(c => c.list_id === list.id)

return (

<BoardColumn
key={list.id}
list={list}
cards={listCards}
newTask=""
setNewTask={()=>{}}
addTask={()=>{}}
/>

)

})}

</div>
</div>

)

>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
}