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
}