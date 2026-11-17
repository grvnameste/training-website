//components/student/CertificateSection.tsx
import { Button } from '@/components/ui/button'
import supabase from '@/lib/supabase/client'
import { useUser } from "@clerk/nextjs"

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
    const { user } = useUser()
    const handleRequest = async () => {
        if (!user) {
            console.log("❌ No Clerk user")
            return
        }
    
        // 🔥 get UUID from profiles
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('clerk_id', user.id)
            .single()
    
        if (!profile?.id) {
            console.log("❌ No profile found")
            return
        }
    
        const uuid = profile.id
        console.log("✅ UUID:", uuid)
    
        const { error } = await supabase
            .from('student_capstone_progress')
            .update({ certificate_requested: true })
            .eq('student_id', uuid)
            .eq('capstone_id', capstoneCourse.id)
    
        if (error) {
            console.log("❌ REQUEST ERROR:", error)
            return
        }
    
        setCertificateRequested(true)
    }

    const handleDownload = async () => {
        const res = await fetch(
            `/api/certificate/download?courseId=${capstoneCourse.id}`,
            {
                method: 'GET',
                credentials: 'include', // ✅ IMPORTANT (Clerk cookies)
            }
        )
    
        if (!res.ok) {
            const text = await res.text()
            console.log("❌ DOWNLOAD ERROR:", text)
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
