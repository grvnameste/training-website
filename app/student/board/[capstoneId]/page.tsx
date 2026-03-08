//app/student/board/[capstoneId]/page.tsx
'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import BoardColumn from '../../../../components/BoardColumn'
export default function BoardPage(){

const params=useParams()
const capstoneId=params.capstoneId as string

const[lists,setLists]=useState<any[]>([])
const[cards,setCards]=useState<any[]>([])
const [newTask, setNewTask] = useState<Record<string,string>>({})

const [loading,setLoading] = useState(false)
const initialized = useRef(false)
// load board
const loadBoard=async()=>{
    if (loading) return
setLoading(true)


const { data: session } = await supabase.auth.getSession()

if (!session?.session?.user?.id) {
  setLoading(false)
  return
}

const studentId = session.session.user.id
console.log("Student ID:", studentId)
// get board
const res = await fetch("/api/trello/create-board", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      capstoneId,
      studentId
    })
  })
  
  if (!res.ok) {
    console.error("Board API failed")
    return
  }
  
  const board = await res.json()
  
if (!board) return

// load lists
const {data:listData}=await supabase
.from('lists')
.select('*')
.eq('board_id',board.id)
.order('position')

setLists(listData||[])

// load cards
let cardData:any[] = []

if(listData && listData.length > 0){

  const listIds = listData.map(l => l.id)

  const { data } = await supabase
    .from('cards')
    .select('id,title,list_id')
    .in('list_id', listIds)

  cardData = data || []
}

setCards(cardData)
setLoading(false)
}

useEffect(() => {

    if (!capstoneId || initialized.current) return
  
    initialized.current = true
    loadBoard()
  
  }, [capstoneId])
// add task
const addTask=async(listId:string)=>{

    if(!newTask[listId]) return
    const { data } = await supabase
  .from('cards')
  .insert({
    list_id:listId,
    title:newTask[listId],
    position:0
  })
  .select()
  .single()

if(data){
  setCards(prev => [...prev, data])
}

setNewTask(prev=>({
  ...prev,
  [listId]:""
}))
}

return(

<div className="h-screen bg-[#f1f2f4] p-6 overflow-x-auto">
<h1 className="text-2xl font-bold mb-6">
Project Board
</h1>

<div className="flex gap-6 w-max">
{lists.map(list => {

const listCards = cards.filter(c => c.list_id === list.id)

return (
  <BoardColumn
    key={list.id}
    list={list}
    cards={listCards}
    newTask={newTask[list.id] || ""}
    setNewTask={(value)=>
      setNewTask(prev=>({
        ...prev,
        [list.id]: value
      }))
    }
    addTask={()=>addTask(list.id)}
  />
)

})}

</div>

</div>

)
}