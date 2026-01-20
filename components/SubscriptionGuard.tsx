'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isAdmin, getSubscriptionStatus, formatPrice, getTrialMessage } from '@/lib/subscription'
import { Clock, CreditCard, Crown, Sparkles } from 'lucide-react'

interface SubscriptionGuardProps {
  children: React.ReactNode
  requireSubscription?: boolean
}

export default function SubscriptionGuard({ children, requireSubscription = true }: SubscriptionGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSubscription() {
      if (status === 'loading') return
      
      if (status === 'unauthenticated') {
        router.push('/auth/signin')
        return
      }

      if (session?.user?.email) {
        // Check if admin - admins always have access
        if (isAdmin(session.user.email)) {
          setSubscriptionStatus({ isAdmin: true, hasAccess: true })
          setLoading(false)
          return
        }

        // Fetch user subscription status from API
        try {
          const res = await fetch('/api/user/subscription')
          if (res.ok) {
            const data = await res.json()
            setSubscriptionStatus(data)
          }
        } catch (error) {
          console.error('Error fetching subscription:', error)
        }
      }
      setLoading(false)
    }

    checkSubscription()
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Checking subscription...</p>
        </div>
      </div>
    )
  }

  // Admin users always have access
  if (subscriptionStatus?.isAdmin) {
    return (
      <>
        {/* Admin Badge */}
        <div className="fixed top-16 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
          <Crown className="w-3 h-3" />
          Admin
        </div>
        {children}
      </>
    )
  }

  // User has active subscription or is in trial
  if (subscriptionStatus?.hasAccess) {
    return (
      <>
        {subscriptionStatus.inTrial && subscriptionStatus.trialDaysLeft > 0 && (
          <div className="fixed top-16 right-4 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <Clock className="w-3 h-3" />
            {getTrialMessage(subscriptionStatus.trialDaysLeft)}
          </div>
        )}
        {children}
      </>
    )
  }

  // No access - show payment required screen
  if (requireSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Subscription Required</h2>
          <p className="text-gray-400 mb-6">
            {subscriptionStatus?.trialExpired 
              ? 'Your 7-day trial has ended. Subscribe to continue using Lift Planner Pro.'
              : 'Subscribe to access all features of Lift Planner Pro.'}
          </p>

          <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-semibold text-white">Professional Plan</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatPrice()}<span className="text-lg text-gray-400">/month</span>
            </div>
            <p className="text-sm text-gray-400">Full access to all features</p>
          </div>

          <button
            onClick={() => router.push('/#pricing')}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Subscribe Now
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full mt-3 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

