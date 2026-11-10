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
}