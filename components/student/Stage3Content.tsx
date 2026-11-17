import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Code2, Github, Upload, Lock, X, FileCode, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import type { CertificateBlocker } from '@/hooks/useCapstoneStage'

interface Stage3ContentProps {
  stage3Submitted: boolean
  certificateRequested: boolean
  certificateIssued: boolean
  certificateError: string | null
  certificateBlockers: CertificateBlocker[]
  loading: boolean
  onUpload: (files: File[]) => void
  onRequestCertificate: () => void
  capstoneId: string
}

export function Stage3Content({
  stage3Submitted,
  certificateRequested,
  certificateIssued,
  certificateError,
  certificateBlockers,
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

            {certificateError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  Certificate requirements incomplete
                </p>
                <p className="mt-1 text-xs">{certificateError}</p>
                {certificateBlockers.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs">
                    {certificateBlockers.map((blocker) => (
                      <li key={`${blocker.type}-${blocker.id}`}>
                        {blocker.type === 'assignment' ? 'Assignment' : 'Milestone'}:{' '}
                        {blocker.title}
                        {blocker.status
                          ? ` (${blocker.status.replace('_', ' ')})`
                          : ' (not started)'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
