//components/TaskCard.tsx
type Props = {
    title: string
  }
  
  export default function TaskCard({ title }: Props) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer">
        {title}
      </div>
    )
  }