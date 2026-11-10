//components/chat/ChatMessage.tsx
import { ScrollArea } from '@/components/ui/scroll-area'
import { Message } from '@/hooks/useTeacherChat'

interface ChatMessagesProps {
    messages: Message[]
    teacherId: string | null
    scrollRef: React.RefObject<HTMLDivElement>
}

export function ChatMessages({ messages, teacherId, scrollRef }: ChatMessagesProps) {
    return (
        <div className="flex-1 min-h-0 relative">
            <ScrollArea className="h-full bg-[#f8faff]" ref={scrollRef}>
                <div className="p-4 space-y-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === teacherId ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            <div
                                className={`max-w-[80%] px-3 py-1.5 shadow-sm transition-all hover:shadow-md ${msg.sender_id === teacherId
                                    ? 'bg-blue-600 text-white rounded-[18px] rounded-br-none'
                                    : 'bg-white text-slate-800 rounded-[18px] rounded-bl-none border border-slate-100'
                                    }`}
                            >
                                {msg.content && <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                                {msg.media_url && (
                                    <div className={`mt-2 rounded-2xl overflow-hidden border ${msg.sender_id === teacherId ? 'border-white/20' : 'border-slate-100'}`}>
                                        {msg.media_type === 'image' ? (
                                            <img
                                                src={msg.media_url}
                                                alt="Attachment"
                                                className="max-w-full h-auto object-cover max-h-80"
                                            />
                                        ) : (
                                            <video
                                                src={msg.media_url}
                                                controls
                                                className="max-w-full h-auto max-h-80"
                                            />
                                        )}
                                    </div>
                                )}

                                <div className={`text-[9px] mt-1.5 font-bold uppercase tracking-wider ${msg.sender_id === teacherId ? 'text-blue-100/70 text-right' : 'text-slate-400 text-left'
                                    }`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
