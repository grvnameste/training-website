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

}