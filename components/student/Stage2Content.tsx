// components/student/Stage2Content.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { KanbanSquare, CheckCircle, Lock, Loader2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Stage2ContentProps {
  capstoneId: string
  stage2Submitted: boolean
  loading?: boolean
  onSubmitReview: () => void
}

export function Stage2Content({
  capstoneId,
  stage2Submitted,
  loading = false,
  onSubmitReview,
}: Stage2ContentProps) {
  const router = useRouter()

  return (
    <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <KanbanSquare className="w-4 h-4 text-blue-600" />
          Stage 2: Backlog Creation
        </CardTitle>
        <CardDescription className="text-xs">
          Create project tasks inside your Kanban board
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {!stage2Submitted ? (
          <>
            <Button
              variant="outline"
              className="w-full gap-2"
              disabled={loading}
              onClick={() => router.push(`/student/board/${capstoneId}`)}
            >
              <ExternalLink className="w-4 h-4" />
              Open Project Board
            </Button>

            <p className="text-sm text-slate-600">
              Create your project tasks inside the board, then submit your backlog for mentor review.
            </p>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
              onClick={onSubmitReview}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </span>
              ) : (
                'Submit Stage 2 for Review'
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4" />
              Stage 2 already submitted
            </div>
            <p className="text-sm text-slate-600">
              Backlog has been submitted for review. You can still inspect your board anytime.
            </p>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => router.push(`/student/board/${capstoneId}`)}
            >
              <ExternalLink className="w-4 h-4" />
              View Project Board
            </Button>
            <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-yellow-700 text-sm">
              <Lock className="w-4 h-4" />
              Waiting for admin approval to unlock Stage 3
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
