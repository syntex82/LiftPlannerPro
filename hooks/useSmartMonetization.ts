"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UsageLimits {
  calculations: number
  projects: number
  exports: number
}

interface UserUsage {
  calculations: number
  projects: number
  exports: number
  lastReset: string
}

export function useSmartMonetization() {
  // Hard-disable all limits globally (temporary per user request)
  const DISABLE_LIMITS = true
  const { data: session } = useSession()
  const [usage, setUsage] = useState<UserUsage>({
    calculations: 0,
    projects: 0,
    exports: 0,
    lastReset: new Date().toISOString()
  })
  
  const [showUpgradePrompt, setShowUpgradePrompt] = useState<string | null>(null)
  const [userCredits, setUserCredits] = useState(0)

  // Free tier limits
  const FREE_LIMITS: UsageLimits = DISABLE_LIMITS ? {
    calculations: Number.MAX_SAFE_INTEGER,
    projects: Number.MAX_SAFE_INTEGER,
    exports: Number.MAX_SAFE_INTEGER,
  } : {
    calculations: 10,
    projects: 3,
    exports: 2,
  }

  useEffect(() => {
    if (session?.user?.email) {
      loadUserUsage()
      loadUserCredits()
    }
  }, [session])

  const loadUserUsage = async () => {
    try {
      // Load from localStorage for now (in production, load from database)
      const stored = localStorage.getItem(`usage_${session?.user?.email}`)
      if (stored) {
        const parsedUsage = JSON.parse(stored)
        
        // Reset monthly counters if it's a new month
        const lastReset = new Date(parsedUsage.lastReset)
        const now = new Date()
        const isNewMonth = lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()
        
        if (isNewMonth) {
          const resetUsage = {
            calculations: 0,
            projects: parsedUsage.projects, // Projects don't reset monthly
            exports: 0,
            lastReset: now.toISOString()
          }
          setUsage(resetUsage)
          localStorage.setItem(`usage_${session?.user?.email}`, JSON.stringify(resetUsage))
        } else {
          setUsage(parsedUsage)
        }
      }
    } catch (error) {
      console.error('Error loading usage:', error)
    }
  }

  const loadUserCredits = async () => {
    try {
      // In production, load from database
      // For now, simulate with localStorage
      const stored = localStorage.getItem(`credits_${session?.user?.email}`)
      setUserCredits(stored ? parseFloat(stored) : 10.0) // Start with £10 demo credits
    } catch (error) {
      console.error('Error loading credits:', error)
    }
  }

  const saveUsage = (newUsage: UserUsage) => {
    setUsage(newUsage)
    if (session?.user?.email) {
      localStorage.setItem(`usage_${session?.user?.email}`, JSON.stringify(newUsage))
    }
  }

  const checkLimit = (type: keyof UsageLimits): boolean => {
    if (DISABLE_LIMITS) return false
    const currentUsage = usage[type]
    const limit = FREE_LIMITS[type]
    return currentUsage >= limit
  }

  const canUseFeature = (type: keyof UsageLimits): boolean => {
    if (DISABLE_LIMITS) return true
    return !checkLimit(type) || userCredits > 0
  }

  const useFeature = (type: keyof UsageLimits): boolean => {
    if (DISABLE_LIMITS) return true
    // Check if user has hit free limit
    if (checkLimit(type)) {
      // Check if user has credits
      if (userCredits > 0) {
        // Deduct credits and allow usage
        const cost = getFeatureCost(type)
        if (userCredits >= cost) {
          setUserCredits(prev => prev - cost)
          localStorage.setItem(`credits_${session?.user?.email}`, (userCredits - cost).toString())
          return true
        }
      }
      // Show upgrade prompt
      setShowUpgradePrompt(type)
      return false
    }

    // User is within free limits
    const newUsage = { ...usage, [type]: usage[type] + 1 }
    saveUsage(newUsage)
    return true
  }

  const getFeatureCost = (type: keyof UsageLimits): number => {
    const costs = {
      calculations: 0.99,
      projects: 1.99,
      exports: 1.49
    }
    return costs[type]
  }

  const getRemainingUsage = (type: keyof UsageLimits): number => {
    return Math.max(0, FREE_LIMITS[type] - usage[type])
  }

  const getUsagePercentage = (type: keyof UsageLimits): number => {
    return Math.min(100, (usage[type] / FREE_LIMITS[type]) * 100)
  }

  const purchaseCredits = async (packageType: string): Promise<boolean> => {
    try {
      // Use Stripe checkout for real payments
      const response = await fetch('/api/monetization/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'credits',
          item: packageType
        })
      })

      const data = await response.json()

      if (response.ok && data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl
        return true
      } else {
        alert(data.error || 'Payment failed. Please try again.')
        return false
      }

    } catch (error) {
      console.error('Error purchasing credits:', error)
      alert('Payment failed. Please try again.')
      return false
    }
  }

  const purchaseFeature = async (featureType: string): Promise<boolean> => {
    try {
      // Use Stripe checkout for direct feature purchase
      const response = await fetch('/api/monetization/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'pay-per-use',
          item: featureType,
          quantity: 1
        })
      })

      const data = await response.json()

      if (response.ok && data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl
        return true
      } else {
        alert(data.error || 'Payment failed. Please try again.')
        return false
      }

    } catch (error) {
      console.error('Error purchasing feature:', error)
      alert('Payment failed. Please try again.')
      return false
    }
  }

  return {
    usage,
    userCredits,
    showUpgradePrompt,
    setShowUpgradePrompt,
    canUseFeature,
    useFeature,
    getRemainingUsage,
    getUsagePercentage,
    purchaseCredits,
    purchaseFeature,
    FREE_LIMITS
  }
}
