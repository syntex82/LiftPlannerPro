"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, ArrowLeft, Coffee, Zap } from "lucide-react"
import Link from "next/link"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get?.('session_id') ?? null
  const type = searchParams?.get?.('type') ?? null // 'subscription', 'credits', 'pay-per-use'
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd verify the session with your backend
      // For now, we'll simulate success based on type
      setTimeout(() => {
        if (type === 'credits') {
          setSession({
            customer_email: 'customer@example.com',
            type: 'credits',
            metadata: { packageName: 'Coffee Pack ☕' }
          })
        } else if (type === 'pay-per-use') {
          setSession({
            customer_email: 'customer@example.com',
            type: 'pay-per-use',
            metadata: { serviceName: 'Extra Calculation' }
          })
        } else {
          setSession({
            customer_email: 'customer@example.com',
            type: 'subscription',
            metadata: { planName: 'Pro Plan' }
          })
        }
        setLoading(false)
      }, 1000)
    }
  }, [sessionId, type])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Processing your payment...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-white">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-300">
                Thank you for subscribing to Lift Planner Pro! Your payment has been processed successfully.
              </p>
              
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">What's Next?</h3>
                <ul className="text-slate-300 space-y-2 text-left">
                  <li>• Download the Lift Planner Pro software</li>
                  <li>• Check your email for login credentials</li>
                  <li>• Access our comprehensive documentation</li>
                  <li>• Join our community support forum</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/dashboard">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800" asChild>
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
