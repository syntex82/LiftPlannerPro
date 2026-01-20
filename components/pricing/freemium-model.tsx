'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Lock, Zap, Crown, Users, Calculator, FileText, Shield } from "lucide-react"

interface FreemiumModelProps {
  userPlan: 'free' | 'professional' | null
  projectCount: number
  calculationsUsed: number
}

export default function FreemiumModel({ userPlan, projectCount, calculationsUsed }: FreemiumModelProps) {
  const [showUpgrade, setShowUpgrade] = useState(false)

  const freeLimits = {
    projects: 3,
    calculations: 10,
    exports: 2,
    storage: 100 // MB
  }

  const freeFeatures = [
    { name: 'Basic Load Calculator', included: true },
    { name: 'Simple CAD Tools', included: true },
    { name: 'Project Storage (3 projects)', included: true },
    { name: 'Basic Templates', included: true },
    { name: 'Community Support', included: true }
  ]

  const premiumFeatures = [
    { name: 'Advanced Calculators', included: false, icon: Calculator },
    { name: 'Professional CAD Suite', included: false, icon: FileText },
    { name: 'Unlimited Projects', included: false, icon: Users },
    { name: 'Rigging Loft Management', included: false, icon: Shield },
    { name: 'PDF/DWG Export', included: false, icon: FileText },
    { name: 'Priority Support', included: false, icon: Zap },
    { name: 'Team Collaboration', included: false, icon: Users },
    { name: 'Custom Branding', included: false, icon: Crown }
  ]

  const usagePercentage = {
    projects: (projectCount / freeLimits.projects) * 100,
    calculations: (calculationsUsed / freeLimits.calculations) * 100
  }

  const isNearLimit = (percentage: number) => percentage >= 80
  const isAtLimit = (percentage: number) => percentage >= 100

  if (userPlan === 'professional') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Crown className="w-5 h-5" />
            Professional Plan Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">You have full access to all Lift Planner Pro features!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Usage Dashboard for Free Users */}
      {userPlan === 'free' && (
        <Card className={`${isNearLimit(Math.max(usagePercentage.projects, usagePercentage.calculations)) ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Your Free Plan Usage
              </span>
              <Badge variant="outline" className="bg-white">
                Free Plan
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Projects Used</span>
                <span className={isAtLimit(usagePercentage.projects) ? 'text-red-600 font-semibold' : ''}>
                  {projectCount}/{freeLimits.projects}
                </span>
              </div>
              <Progress 
                value={usagePercentage.projects} 
                className={`h-2 ${isAtLimit(usagePercentage.projects) ? 'bg-red-100' : isNearLimit(usagePercentage.projects) ? 'bg-orange-100' : 'bg-blue-100'}`}
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Calculations This Month</span>
                <span className={isAtLimit(usagePercentage.calculations) ? 'text-red-600 font-semibold' : ''}>
                  {calculationsUsed}/{freeLimits.calculations}
                </span>
              </div>
              <Progress 
                value={usagePercentage.calculations} 
                className={`h-2 ${isAtLimit(usagePercentage.calculations) ? 'bg-red-100' : isNearLimit(usagePercentage.calculations) ? 'bg-orange-100' : 'bg-blue-100'}`}
              />
            </div>

            {(isNearLimit(usagePercentage.projects) || isNearLimit(usagePercentage.calculations)) && (
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-800 text-sm font-medium">
                  ⚠️ You're approaching your free plan limits. Upgrade to continue using all features.
                </p>
              </div>
            )}

            {(isAtLimit(usagePercentage.projects) || isAtLimit(usagePercentage.calculations)) && (
              <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium">
                  🚫 You've reached your free plan limits. Upgrade now to continue.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feature Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Free Plan
            </CardTitle>
            <p className="text-2xl font-bold">£0<span className="text-sm font-normal text-gray-500">/month</span></p>
          </CardHeader>
          <CardContent className="space-y-3">
            {freeFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">{feature.name}</span>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 mb-3">Limitations:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Max 3 projects</li>
                <li>• 10 calculations/month</li>
                <li>• Basic features only</li>
                <li>• Community support</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Professional Plan */}
        <Card className="border-blue-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-semibold">
            MOST POPULAR
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-blue-600" />
              Professional Plan
            </CardTitle>
            <p className="text-2xl font-bold text-blue-600">
              £29<span className="text-sm font-normal text-gray-500">/month</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Include all free features */}
            {freeFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">{feature.name}</span>
              </div>
            ))}
            
            {/* Premium features */}
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <feature.icon className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">{feature.name}</span>
              </div>
            ))}

            <div className="pt-4">
              <Button 
                onClick={() => window.location.href = '/auth/signup?plan=professional'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Professional
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Value Proposition */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Why 2,500+ Professionals Choose Lift Planner Pro
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Save 10+ Hours/Week</h4>
              <p className="text-sm text-gray-600">Automated calculations and planning</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Reduce Risk</h4>
              <p className="text-sm text-gray-600">Professional-grade safety calculations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Look Professional</h4>
              <p className="text-sm text-gray-600">Impress clients with detailed plans</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonial */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-green-800 italic mb-2">
                "Lift Planner Pro saved us £50,000 on our last project by optimizing our lifting plan. 
                The ROI was immediate."
              </p>
              <p className="text-sm text-green-700 font-semibold">
                - Sarah Johnson, Senior Lifting Engineer at Mammoet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
