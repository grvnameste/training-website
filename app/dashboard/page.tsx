//app/dashboard/page.tsx
'use client'
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { useEffect } from "react"


export default function DashboardRedirect() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.replace('/login')
      return
    }
    const role = user.role

    console.log("Role:", role)

    if (role === 'super_admin' || role === 'teacher') {
      router.replace('/teacher/dashboard')
    } else {
      router.replace('/student/dashboard')
    }

  }, [user, isLoaded])

  return (
    <div className="flex items-center justify-center h-screen">
      Redirecting...
    </div>
  )
}