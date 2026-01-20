'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Gift, Clock, Users, Star, CheckCircle, AlertTriangle } from "lucide-react"

interface ExitIntentPopupProps {
  isVisible: boolean
  onClose: () => void
  onCapture: (email: string, offer: string) => void
}

export default function ExitIntentPopup({ isVisible, onClose, onCapture }: ExitIntentPopupProps) {
  const [email, setEmail] = useState('')
  const [selectedOffer, setSelectedOffer] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [loading, setLoading] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (!isVisible) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isVisible])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const offers = [
    {
      id: 'free_trial',
      title: '7-Day Free Trial',
      description: 'Full access to all professional features',
      value: '£29 Value',
      cta: 'Start Free Trial',
      popular: true
    },
    {
      id: 'free_calculator',
      title: 'Free Load Calculator',
      description: 'Professional-grade calculator + safety guide',
      value: '£97 Value',
      cta: 'Get Free Calculator',
      popular: false
    },
    {
      id: 'discount',
      title: '50% Off First Month',
      description: 'Professional plan for just £14.50',
      value: 'Save £14.50',
      cta: 'Claim Discount',
      popular: false
    }
  ]

  const handleSubmit = async () => {
    if (!email || !selectedOffer) return

    setLoading(true)
    try {
      await onCapture(email, selectedOffer)
      
      // Track conversion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exit_intent_conversion', {
          event_category: 'Lead Generation',
          event_label: selectedOffer,
          value: 1
        })
      }
    } catch (error) {
      console.error('Exit intent capture failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Wait! Don't Leave Empty-Handed
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Urgency Timer */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">Limited Time Offer</span>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-red-700">This offer expires when you leave!</p>
          </div>

          {/* Social Proof */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Join 2,500+ Professionals</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-blue-700 ml-2">4.9/5 from 500+ reviews</span>
            </div>
            <p className="text-sm text-blue-800">
              "This tool saved me 15 hours on my last project" - Engineering Manager at Sarens
            </p>
          </div>

          {/* Offer Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Choose Your Free Gift:</h3>
            {offers.map((offer) => (
              <div
                key={offer.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedOffer === offer.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${offer.popular ? 'ring-2 ring-green-200' : ''}`}
                onClick={() => setSelectedOffer(offer.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{offer.title}</h4>
                      {offer.popular && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Most Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {offer.value}
                    </Badge>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedOffer === offer.id 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedOffer === offer.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Email Input */}
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-center text-lg py-3"
            />
            
            <Button 
              onClick={handleSubmit}
              disabled={!email || !selectedOffer || loading}
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
            >
              <Gift className="w-5 h-5 mr-2" />
              {loading ? 'Processing...' : `Claim My ${offers.find(o => o.id === selectedOffer)?.title || 'Gift'}`}
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
            <div className="flex flex-col items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mb-1" />
              <span>No Spam</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mb-1" />
              <span>Instant Access</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mb-1" />
              <span>Unsubscribe Anytime</span>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Don't miss out on tools used by professionals at:
            </p>
            <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
              <span>Mammoet</span>
              <span>•</span>
              <span>Sarens</span>
              <span>•</span>
              <span>Lampson</span>
              <span>•</span>
              <span>ALE</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
