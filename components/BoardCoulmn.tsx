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
    <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl p-4 w-[300px] flex flex-col max-h-[80vh] shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <h2 className="font-semibold mb-3 text-slate-700 tracking-wide flex items-center justify-between">
        {list.title}
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">    {cards.length}
        </span>
      </h2>
      <div className="flex flex-col gap-2 overflow-y-auto scroll-smooth pr-1 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 transition">      {cards.length === 0 ? (
        <div className="text-xs text-slate-400 text-center py-4">
          No tasks yet
        </div>
      ) : (
        cards.map((card: any) => (
          <TaskCard key={card.id} title={card.title} />
        ))
      )}
      </div>

      <div className="mt-3">

        <input
          className="w-full border border-slate-200 rounded-lg p-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
          placeholder="Add task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTask()
          }}
        />
      </div>

      <button
        className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm py-2 rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-150" onClick={addTask}
      >
        + Add Task
      </button>

    </div>
  )
}