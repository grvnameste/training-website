import { Button } from '@/components/ui/button'
import supabase from '@/lib/supabase/client'

interface CertificateSectionProps {
    capstoneCourse: { id: string; title: string } | null
    stage3Submitted: boolean
    certificateRequested: boolean
    certificateIssued: boolean
    setCertificateRequested: (val: boolean) => void
}

export function CertificateSection({
    capstoneCourse,
    stage3Submitted,
    certificateRequested,
    certificateIssued,
    setCertificateRequested
}: CertificateSectionProps) {
    if (!capstoneCourse) return null

    const handleRequest = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        await supabase
            .from('student_capstone_progress')
            .update({ certificate_requested: true })
            .eq('student_id', user!.id)
            .eq('capstone_id', capstoneCourse.id)

        setCertificateRequested(true)
    }

    const handleDownload = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch(
            `/api/certificate/download?courseId=${capstoneCourse.id}`,
            {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            }
        )

        if (!res.ok) {
            alert('Failed to download certificate')
            return
        }

        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'certificate.pdf'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="mt-3 rounded-2xl border border-green-200 bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="h-7 w-7 flex items-center justify-center rounded-full bg-green-600 text-white text-sm">
                    🎓
                </div>
                <div>
                    <p className="text-xs font-bold text-green-700">
                        Course Certificate
                    </p>
                    <p className="text-[10px] text-neutral-500">
                        Earn a verified certificate after completing the capstone
                    </p>
                </div>
            </div>

            {!stage3Submitted && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-[11px] text-green-800">
                    🔒 <span className="font-medium">
                        Complete the capstone project to unlock your certificate.
                    </span>
                    <p className="opacity-70 mt-0.5">
                        Finish all capstone stages and submit your final solution.
                    </p>
                </div>
            )}

            {stage3Submitted && !certificateRequested && !certificateIssued && (
                <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleRequest}
                >
                    Request Certificate
                </Button>
            )}

            {certificateRequested && !certificateIssued && (
                <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
                    ⏳ Certificate request submitted.
                    <p className="text-xs mt-1">
                        Your certificate will be issued after review by the instructor.
                    </p>
                </div>
            )}

            {certificateIssued && (
                <Button
                    variant="outline"
                    className="w-full border-green-300 text-green-700"
                    onClick={handleDownload}
                >
                    Download Certificate
                </Button>
            )}
        </div>
    )
}
