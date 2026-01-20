'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, Download, Mail, Gift, Star, Users, CheckCircle } from "lucide-react"

interface FreeCalculatorPopupProps {
  isOpen: boolean
  onClose: () => void
  calculatorType: 'load' | 'tension' | 'safety'
}

export default function FreeCalculatorPopup({ isOpen, onClose, calculatorType }: FreeCalculatorPopupProps) {
  const [step, setStep] = useState<'offer' | 'calculator' | 'email' | 'success'>('offer')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [calculationResult, setCalculationResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const calculatorInfo = {
    load: {
      title: 'Free Load Calculator Pro',
      description: 'Calculate safe working loads for complex lifting operations',
      value: '£97 Value',
      features: ['Multi-point lifting', 'Angle calculations', 'Safety factors', 'PDF reports']
    },
    tension: {
      title: 'Free Tension Calculator Pro',
      description: 'Calculate chain block tensions with angle multipliers',
      value: '£67 Value',
      features: ['Chain block analysis', 'Angle multipliers', 'Load distribution', 'Safety margins']
    },
    safety: {
      title: 'Free Safety Factor Calculator',
      description: 'Determine appropriate safety factors for lifting operations',
      value: '£47 Value',
      features: ['Risk assessment', 'Factor calculations', 'Compliance check', 'Documentation']
    }
  }

  const currentCalculator = calculatorInfo[calculatorType]

  const handleEmailSubmit = async () => {
    if (!email || !name) return

    setLoading(true)
    try {
      // Submit lead to database
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          company,
          source: `free_${calculatorType}_calculator`,
          interests: [calculatorType, 'lifting', 'safety'],
          leadMagnet: currentCalculator.title
        })
      })

      if (response.ok) {
        setStep('success')
        // Track conversion
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'lead_capture', {
            event_category: 'Lead Generation',
            event_label: currentCalculator.title,
            value: 1
          })
        }
      }
    } catch (error) {
      console.error('Lead capture failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderOfferStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Calculator className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentCalculator.title}</h2>
        <p className="text-gray-600 mb-4">{currentCalculator.description}</p>
        <Badge variant="secondary" className="text-lg px-4 py-2 bg-green-100 text-green-800">
          {currentCalculator.value} - FREE Today!
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {currentCalculator.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-900">Join 2,500+ Lifting Professionals</span>
        </div>
        <p className="text-sm text-blue-800">
          Get instant access to professional-grade calculators used by engineers worldwide.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setStep('email')} className="flex-1 bg-blue-600 hover:bg-blue-700">
          <Gift className="w-4 h-4 mr-2" />
          Get Free Access
        </Button>
        <Button variant="outline" onClick={onClose} className="px-6">
          Maybe Later
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        No spam. Unsubscribe anytime. Used by professionals at Mammoet, Sarens, and more.
      </p>
    </div>
  )

  const renderEmailStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Mail className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold">Get Your Free Calculator</h3>
        <p className="text-gray-600">Enter your details for instant access</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Smith"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Work Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@company.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="company">Company (Optional)</Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Your Company Ltd"
          />
        </div>
      </div>

      <Button 
        onClick={handleEmailSubmit} 
        disabled={!email || !name || loading}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {loading ? 'Processing...' : 'Get Free Calculator'}
      </Button>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span>Instant access - no waiting</span>
      </div>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Lift Planner Pro!</h3>
        <p className="text-gray-600">Check your email for instant access to your free calculator.</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Access your free calculator immediately</li>
          <li>• Get weekly lifting engineering tips</li>
          <li>• Exclusive discounts on premium tools</li>
          <li>• Join our community of 2,500+ professionals</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setStep('calculator')} className="flex-1">
          <Calculator className="w-4 h-4 mr-2" />
          Try Calculator Now
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Free Professional Tool
          </DialogTitle>
        </DialogHeader>
        
        {step === 'offer' && renderOfferStep()}
        {step === 'email' && renderEmailStep()}
        {step === 'success' && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  )
}
