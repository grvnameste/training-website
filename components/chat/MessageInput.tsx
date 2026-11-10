//components/chat/Messageinput.tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Paperclip, Send, Loader2, X } from 'lucide-react'

interface MessageInputProps {
    content: string
    onContentChange: (val: string) => void
    onSend: () => void
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
    fileInputRef: React.RefObject<HTMLInputElement>
    isUploading: boolean
    filePreview: string | null
    onRemoveFile: () => void
    selectedFileType?: string
}

export function MessageInput({
    content,
    onContentChange,
    onSend,
    onFileSelect,
    fileInputRef,
    isUploading,
    filePreview,
    onRemoveFile,
    selectedFileType
}: MessageInputProps) {
    return (
        <div className="px-3 pb-3 pt-1 border-t bg-white shrink-0">
            {filePreview && (
                <div className="mb-2 relative group animate-in slide-in-from-bottom-2 duration-200">
                    <div className="rounded-2xl overflow-hidden border-2 border-blue-100 shadow-sm bg-white max-w-[130px]">
                        {selectedFileType?.startsWith('image') ? (
                            <img src={filePreview} alt="Preview" className="w-full h-20 object-cover" />
                        ) : (
                            <div className="h-20 flex flex-col items-center justify-center bg-slate-50 italic text-slate-400 text-[9px] font-bold uppercase tracking-widest gap-0.5 p-2 text-center">
                                <Send className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                                Video
                            </div>
                        )}
                    </div>
                    <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-1.5 left-[118px] h-5 w-5 rounded-full shadow-lg border-2 border-white"
                        onClick={onRemoveFile}
                    >
                        <X className="w-2.5 h-2.5" />
                    </Button>
                </div>
            )}

            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 focus-within:border-blue-300">
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-slate-500 hover:text-blue-600 rounded-lg h-8 w-8"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <Paperclip className="w-4 h-4" />
                </Button>

                <Input
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSend()}
                    placeholder={filePreview ? "Add a caption..." : "Type a message..."}
                    className="border-none bg-transparent focus-visible:ring-0 shadow-none text-[13px] h-8"
                    disabled={isUploading}
                    title="Message content"
                    aria-label="Message content"
                />

                <Button
                    size="icon"
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 w-8"
                    onClick={onSend}
                    disabled={isUploading || (!content.trim() && !filePreview)}
                    title="Send message"
                    aria-label="Send message"
                >
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </Button>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={onFileSelect}
                title="Upload media"
                aria-label="Upload media"
            />
        </div>
    )
}
