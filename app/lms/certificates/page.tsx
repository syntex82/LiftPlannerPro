'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Certificate {
  id: string
  certificateNumber: string
  studentName: string
  courseName: string
  completionDate: string
  score: number
  expiresAt: string | null
  course: {
    id: string
    title: string
    thumbnail: string | null
  }
}

export default function CertificatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/lms/certificates')
      return
    }
    fetchCertificates()
  }, [session, status])

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/lms/certificates')
      const data = await res.json()
      setCertificates(data.certificates || [])
    } catch (error) {
      console.error('Failed to fetch certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/lms/courses" className="text-slate-400 hover:text-white text-sm">← Back to Courses</Link>
          <h1 className="text-2xl font-bold text-white">My Certificates</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {certificates.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
            <p className="text-slate-400 text-lg mb-4">You haven&apos;t earned any certificates yet</p>
            <p className="text-slate-500 mb-6">Complete a course to receive your certificate!</p>
            <Link href="/lms/courses">
              <Button className="bg-blue-600 hover:bg-blue-700">Browse Courses</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map(cert => (
              <Card key={cert.id} className={`bg-slate-800/50 border-slate-700 overflow-hidden ${isExpired(cert.expiresAt) ? 'opacity-60' : ''}`}>
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🏆</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">Certificate of Completion</h3>
                      <p className="text-yellow-100 text-sm">{cert.certificateNumber}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-white mb-2">{cert.courseName}</h4>
                  <p className="text-slate-400 mb-4">Awarded to {cert.studentName}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span>Completed: {formatDate(cert.completionDate)}</span>
                    <span>Score: {cert.score}%</span>
                  </div>
                  {isExpired(cert.expiresAt) && (
                    <div className="bg-red-600/20 text-red-400 px-3 py-2 rounded mb-4 text-sm">
                      This certificate expired on {formatDate(cert.expiresAt!)}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Link href={`/lms/certificates/${cert.id}`}>
                      <Button variant="outline">View Certificate</Button>
                    </Link>
                    <a href={`/api/lms/certificates/${cert.id}/pdf`} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-blue-600 hover:bg-blue-700">Download PDF</Button>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

