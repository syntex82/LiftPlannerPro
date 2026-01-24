'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LMSPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new course catalog
    router.replace('/lms/courses')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-white">Redirecting to courses...</p>
      </div>
    </div>
  )
}

