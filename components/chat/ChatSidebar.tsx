//components/chat/ChatSidebar.tsx
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, MessageSquare, ChevronRight, User, Book } from 'lucide-react'
import { Room } from '@/hooks/useTeacherChat'

interface ChatSidebarProps {
    rooms: Room[]
    selectedRoomId?: string
    onSelectRoom: (room: Room) => void
    isUserOnline: (userId: string, courseId?: string) => boolean
    searchQuery: string
    onSearchChange: (val: string) => void
    teacherId: string | null
}

export function ChatSidebar({
    rooms,
    selectedRoomId,
    onSelectRoom,
    isUserOnline,
    searchQuery,
    onSearchChange,
    teacherId
}: ChatSidebarProps) {
    return (
        <div className="w-72 border-r flex flex-col bg-slate-50/50">
            <div className="p-3 border-b bg-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Inbox
                    <span className="flex items-center gap-1.5 ml-auto">
                        <span className={`w-1.5 h-1.5 rounded-full ${(teacherId && isUserOnline(teacherId)) ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Live Status</span>
                    </span>
                </h2>
                <div className="mt-2.5 relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        className="pl-9 bg-slate-50 h-9 text-sm"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {rooms.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <p className="text-sm">No conversations yet.</p>
                        </div>
                    ) : (
                        rooms
                            .filter(room =>
                                room.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                room.course_title?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((room) => (
                                <button
                                    key={room.id}
                                    onClick={() => onSelectRoom(room)}
                                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-300 ${selectedRoomId === room.id
                                        ? 'bg-blue-600 text-white shadow-md active:scale-95'
                                        : 'hover:bg-blue-50 text-slate-600 active:scale-98'
                                        }`}
                                >
                                    <div className="relative">
                                        <Avatar className={`w-10 h-10 border-2 transition-transform duration-300 ${selectedRoomId === room.id ? 'border-white/50 scale-105' : 'border-white'}`}>
                                            <AvatarImage src={room.student_image} className="object-cover" />
                                            <AvatarFallback className={selectedRoomId === room.id ? 'bg-white/20' : 'bg-slate-200'}>
                                                <User className="w-5 h-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        {isUserOnline(room.student_id, room.course_id) && (
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full ${selectedRoomId === room.id ? 'border-blue-600' : ''}`} />
                                        )}
                                        {room.unread_count !== undefined && room.unread_count > 0 && (
                                            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white shadow-sm animate-in zoom-in duration-300">
                                                {room.unread_count}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className={`font-bold text-[13px] truncate ${selectedRoomId === room.id ? 'text-white' : 'text-slate-900'}`}>{room.student_name}</p>
                                        <p className="text-[10px] flex items-center gap-1 opacity-80 font-medium truncate mt-0">
                                            <Book className="w-3 h-3" />
                                            {room.course_title}
                                        </p>
                                    </div>
                                    <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${selectedRoomId === room.id ? 'hidden' : 'block'}`} />
                                </button>
                            ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
