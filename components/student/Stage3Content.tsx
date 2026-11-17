<<<<<<< HEAD
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Code2, Github, Upload, Lock, X, FileCode, Loader2, CheckCircle2 } from 'lucide-react'

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
  capstoneId,
}: Stage3ContentProps) {
  const [files, setFiles] = useState<File[]>([])

  const handleFilesAdded = (newList: FileList | null) => {
    if (!newList) return
    const incoming = Array.from(newList)
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name))
      return [...prev, ...incoming.filter((f) => !existingNames.has(f.name))]
    })
  }

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name))
  }

  return (
    <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Code2 className="w-4 h-4 text-blue-600" />
          Stage 3: Development & Submission
        </CardTitle>
        <CardDescription className="text-xs">
          Push code to GitHub & upload build archives, docs, or screenshots
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        <Button className="w-full" variant="outline" asChild>
          <a href="https://github.com/ReadNRevise" target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4 mr-2" />
            Open GitHub Repository
          </a>
        </Button>

        {!stage3Submitted ? (
          <>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 transition">
              <Upload className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm">
                <span className="text-blue-600 font-medium">Click to upload</span> build or project files
              </p>
              <p className="text-xs text-slate-500">Multiple files allowed (ZIP, PDF, Images, Source files, max 25MB each)</p>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFilesAdded(e.target.files)}
              />
            </label>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">
                  {files.length} file(s) ready for submission:
                </p>
                <div className="space-y-1.5">
                  {files.map((f) => (
                    <div
                      key={f.name}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate font-medium text-slate-800">{f.name}</span>
                        <span className="text-slate-400 shrink-0">
                          ({(f.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(f.name)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => onUpload(files)}
              disabled={loading || files.length === 0}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading Deliverables...
                </span>
              ) : (
                'Submit for Approval'
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Stage 3 deliverables submitted!
            </div>

            {!certificateRequested && !certificateIssued && (
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={onRequestCertificate}
              >
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
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
                <a href={`/api/certificate/download?courseId=${capstoneId}`} download="certificate.pdf">
                  Download Certificate
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
=======
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
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
