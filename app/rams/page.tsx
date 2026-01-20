"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DesktopRecommendation } from "@/components/ui/desktop-recommendation"
import { useDeviceDetection } from "@/lib/deviceDetection"
import {
  FileText,
  Download,
  Save,
  Home,
  AlertTriangle,
  Shield,
  Users,
  Calendar,
  MapPin,
  Sparkles,
  Brain,
  Zap,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import dynamic from 'next/dynamic'

// Dynamically import the comprehensive RAMS component
const ComprehensiveRAMS = dynamic(() => import('./comprehensive-rams'), {
  loading: () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading RAMS Generator...</div>
    </div>
  ),
  ssr: false
})

export default function RAMSGenerator() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showDesktopRecommendation, setShowDesktopRecommendation] = useState(false)
  const deviceInfo = useDeviceDetection()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Show desktop recommendation for mobile/tablet users
  useEffect(() => {
    if (!deviceInfo.isDesktop) {
      const dismissed = localStorage.getItem('dismissed-desktop-recommendations')
      if (!dismissed || !JSON.parse(dismissed).includes('rams')) {
        setShowDesktopRecommendation(true)
      }
    }
  }, [deviceInfo.isDesktop])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading RAMS Generator...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">RAMS Generator</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">RAMS Generator</h1>
              <p className="text-slate-400">Risk Assessment & Method Statement</p>
            </div>
          </div>

          <div className="bg-blue-600/20 border border-blue-500/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-blue-300 font-semibold">Safety First</h3>
                <p className="text-blue-200 text-sm">
                  This RAMS generator helps ensure comprehensive safety planning for all lifting operations.
                  Complete all sections thoroughly for maximum safety compliance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-lg">Loading RAMS Form...</div>
          </div>
        }>
          <ComprehensiveRAMS />
        </Suspense>
      </div>
    </div>
  )
}
