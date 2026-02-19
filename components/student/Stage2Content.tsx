import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { KanbanSquare, CheckCircle, Lock } from 'lucide-react'

interface Stage2ContentProps {
    trelloUrl: string | null
    trelloRequested: boolean
    cardCount: number
    stage2Submitted: boolean
    onRequestTrello: () => void
    onSubmitReview: () => void
}

export function Stage2Content({
    trelloUrl,
    trelloRequested,
    cardCount,
    stage2Submitted,
    onRequestTrello,
    onSubmitReview,
}: Stage2ContentProps) {
    return (
        <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition">
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <KanbanSquare className="w-4 h-4 text-blue-600" />
                    Stage 2: Backlog Creation
                </CardTitle>
                <CardDescription className="text-xs">Create minimum 10 Trello tasks</CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3">
                {!stage2Submitted ? (
                    <>
                        {trelloUrl && (
                            <Button variant="outline" className="w-full" onClick={() => window.open(trelloUrl, '_blank')}>
                                Open Trello Board
                            </Button>
                        )}

                        {!trelloRequested ? (
                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={onRequestTrello}>
                                Request Access
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Trello access granted by admin
                            </div>
                        )}

                        <p className="text-sm text-slate-600">
                            Tasks created: <b>{cardCount}/10</b>
                        </p>

                        {trelloRequested && cardCount >= 10 && (
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={onSubmitReview}>
                                Submit Stage 2 for Review
                            </Button>
                        )}
                    </>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Stage 2 already submitted
                        </div>
                        <p className="text-sm text-slate-600">
                            Backlog has been submitted for review. You cannot submit this stage again.
                        </p>
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
