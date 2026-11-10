import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Code2, Github, Upload, Lock } from 'lucide-react'

interface Stage3ContentProps {
    stage3Submitted: boolean
    certificateRequested: boolean
    certificateIssued: boolean
    loading: boolean
    onUpload: (files: File[]) => void
    onRequestCertificate: () => void
    capstoneId: string
}

export function Stage3Content({
    stage3Submitted,
    certificateRequested,
    certificateIssued,
    loading,
    onUpload,
    onRequestCertificate,
    capstoneId
}: Stage3ContentProps) {
    const [files, setFiles] = useState<File[]>([])

    return (
        <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition">
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    Stage 3: Development & Submission
                </CardTitle>
                <CardDescription className="text-xs">Push code to GitHub & upload build files</CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-4">
                <Button className="w-full" onClick={() => window.open('https://github.com/ReadNRevise', '_blank')}>
                    <Github className="w-4 h-4 mr-2" />
                    Open GitHub Repository
                </Button>

                {!stage3Submitted ? (
                    <>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 transition">
                            <Upload className="w-8 h-8 text-blue-600 mb-2" />
                            <p className="text-sm">
                                <span className="text-blue-600 font-medium">Click to upload</span> or drag & drop
                            </p>
                            <p className="text-xs text-slate-500">Multiple files allowed</p>
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={e => setFiles(Array.from(e.target.files || []))}
                            />
                        </label>

                        {files.length > 0 && <p className="text-sm text-blue-600">{files.length} file(s) selected</p>}

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => onUpload(files)}
                            disabled={loading || files.length === 0}
                        >
                            Submit for Approval
                        </Button>
                    </>
                ) : (
                    <div className="space-y-3">
                        {!certificateRequested && (
                            <Button className="w-full bg-purple-600 text-white" onClick={onRequestCertificate}>
                                Request Certificate
                            </Button>
                        )}

                        {certificateRequested && !certificateIssued && (
                            <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-yellow-700 text-sm">
                                <Lock className="w-4 h-4" />
                                Waiting for teacher approval
                            </div>
                        )}

                        {certificateIssued && (
                            <Button
                                className="w-full bg-green-600 text-white"
                                onClick={() => window.open(`/api/certificate/download?courseId=${capstoneId}`)}
                            >
                                Download Certificate
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
