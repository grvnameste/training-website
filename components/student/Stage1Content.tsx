//components/student/Stage1Content.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Upload, CheckCircle, Lock } from 'lucide-react'

interface Stage1ContentProps {
    submitted: boolean
    approved: boolean
    loading: boolean
    onUpload: (file: File) => void
    onNext: () => void
}

export function Stage1Content({ submitted, approved, loading, onUpload, onNext }: Stage1ContentProps) {
    const [file, setFile] = useState<File | null>(null)
    const handleSubmit = () => {
        if (!file) {
            alert("Select file first")
            return
        }

        console.log("BUTTON CLICKED")
        console.log("FILE:", file)              // 👈 ADD THIS
        console.log("CALLING onUpload")         // 👈 ADD THIS

        if (onUpload) {
            onUpload(file)
        } else {
            console.log("onUpload is undefined ❌")
        }
        }

    return (
        <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition">
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Stage 1: Requirement Gathering
                </CardTitle>
                <CardDescription className="text-xs">Upload your requirement document for admin approval</CardDescription>

                <Button
                    variant="outline"
                    className="w-full mt-3 flex items-center justify-between border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 h-9"
                    onClick={() => window.open('/assets/stage1-guide.pdf', '_blank')}
                >
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-blue-700 text-xs text-left truncate">Read Stage 1 Guidelines (PDF)</span>
                    </div>
                </Button>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                    Please read instructions carefully before submitting.
                </p>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-4">
                {!submitted ? (
                    <>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition">
                            <Upload className="w-6 h-6 text-blue-600 mb-2" />
                            <p className="text-xs">
                                <span className="text-blue-600 font-bold">Click to upload</span> or drag & drop
                            </p>
                            <p className="text-[10px] text-slate-400">PDF / DOC / DOCX</p>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                            />
                        </label>

                        {file && <p className="text-xs text-blue-600 font-medium">Selected: {file.name}</p>}

                        <Button onClick={handleSubmit} className="w-full h-9 text-sm">         Submit Requirement
                        </Button>
                    </>
                ) : approved ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Stage 1 approved by admin
                        </div>
                        <p className="text-sm text-slate-600">
                            You submitted the requirement document and it has been approved. This stage is now locked for editing.
                        </p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={onNext}>
                            Go to Stage 2
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-yellow-700 text-sm">
                        <Lock className="w-4 h-4" />
                        Pending Admin Approval
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
