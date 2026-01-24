'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
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
  verificationUrl: string
  course: {
    id: string
    title: string
    description: string
    instructor: { name: string | null }
  }
}

export default function CertificateViewPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const certId = params?.certId as string
  
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificate()
  }, [certId])

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`/api/lms/certificates/${certId}`)
      const data = await res.json()
      setCertificate(data.certificate)
    } catch (error) {
      console.error('Failed to fetch certificate:', error)
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

  const copyVerificationUrl = () => {
    if (certificate?.verificationUrl) {
      navigator.clipboard.writeText(certificate.verificationUrl)
      alert('Verification URL copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Certificate Not Found</h1>
          <Link href="/lms/certificates"><Button>Back to Certificates</Button></Link>
        </div>
      </div>
    )
  }

  const isExpired = certificate.expiresAt && new Date(certificate.expiresAt) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/lms/certificates" className="text-slate-400 hover:text-white text-sm">← My Certificates</Link>
            <h1 className="text-2xl font-bold text-white">Certificate Details</h1>
          </div>
          <a href={`/api/lms/certificates/${certId}/pdf`} target="_blank" rel="noopener noreferrer">
            <Button className="bg-blue-600 hover:bg-blue-700">Download PDF</Button>
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Certificate Preview */}
        <Card className={`bg-white text-slate-900 p-8 mb-6 ${isExpired ? 'opacity-60' : ''}`}>
          <div className="text-center border-8 border-double border-yellow-500 p-8">
            <div className="text-yellow-600 text-lg mb-2">LiftPlannerPro</div>
            <h2 className="text-3xl font-serif font-bold mb-4">Certificate of Completion</h2>
            <p className="text-slate-600 mb-6">This is to certify that</p>
            <p className="text-2xl font-semibold text-slate-900 mb-6">{certificate.studentName}</p>
            <p className="text-slate-600 mb-2">has successfully completed the course</p>
            <p className="text-xl font-semibold text-slate-800 mb-6">{certificate.courseName}</p>
            <div className="flex justify-center gap-12 mb-6">
              <div>
                <p className="text-slate-500 text-sm">Completion Date</p>
                <p className="font-medium">{formatDate(certificate.completionDate)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Score</p>
                <p className="font-medium">{certificate.score}%</p>
              </div>
            </div>
            <div className="border-t border-slate-300 pt-4 mt-6">
              <p className="text-slate-500 text-sm">Certificate Number</p>
              <p className="font-mono text-sm">{certificate.certificateNumber}</p>
            </div>
          </div>
        </Card>

        {isExpired && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-400 px-4 py-3 rounded mb-6">
            ⚠️ This certificate expired on {formatDate(certificate.expiresAt!)}
          </div>
        )}

        {/* Verification Info */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Verification</h3>
          <p className="text-slate-400 mb-4">
            Anyone can verify this certificate using the verification URL or certificate number.
          </p>
          <div className="flex gap-2 items-center">
            <input 
              type="text" 
              readOnly 
              value={certificate.verificationUrl}
              className="flex-1 bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm"
            />
            <Button onClick={copyVerificationUrl} variant="outline">Copy</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

