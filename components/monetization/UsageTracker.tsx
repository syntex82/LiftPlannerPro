"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calculator, FolderOpen, Download, Coffee, Zap } from "lucide-react"

interface UsageTrackerProps {
  usage: {
    calculations: number
    projects: number
    exports: number
  }
  limits: {
    calculations: number
    projects: number
    exports: number
  }
  userCredits: number
  onUpgrade?: () => void
}

export default function UsageTracker({ usage, limits, userCredits, onUpgrade }: UsageTrackerProps) {
  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-green-600"
  }

  const getProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const usageItems = [
    {
      icon: Calculator,
      name: "Calculations",
      used: usage.calculations,
      limit: limits.calculations,
      period: "this month",
      upgradePrice: "99p each"
    },
    {
      icon: FolderOpen,
      name: "Projects",
      used: usage.projects,
      limit: limits.projects,
      period: "total",
      upgradePrice: "£1.99 each"
    },
    {
      icon: Download,
      name: "Exports",
      used: usage.exports,
      limit: limits.exports,
      period: "this month",
      upgradePrice: "£1.49 each"
    }
  ]

  return (
    <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-200">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Your Usage</h3>
            <p className="text-sm text-slate-600">Free tier limits</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <Coffee className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-600">£{userCredits.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-500">credits available</p>
          </div>
        </div>

        {/* Usage Items */}
        <div className="space-y-3">
          {usageItems.map((item, index) => {
            const percentage = Math.min(100, (item.used / item.limit) * 100)
            const isNearLimit = percentage >= 80
            const isAtLimit = item.used >= item.limit

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    {isAtLimit && (
                      <Badge variant="destructive" className="text-xs">
                        Limit reached
                      </Badge>
                    )}
                    {isNearLimit && !isAtLimit && (
                      <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                        Almost full
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${getUsageColor(item.used, item.limit)}`}>
                      {item.used}/{item.limit}
                    </span>
                    <p className="text-xs text-slate-500">{item.period}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  
                  {isAtLimit && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Need more? Just {item.upgradePrice}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={onUpgrade}
                        className="h-6 px-2 text-xs border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Add More
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Upgrade Suggestion */}
        {(usage.calculations >= limits.calculations * 0.8 || 
          usage.projects >= limits.projects * 0.8 || 
          usage.exports >= limits.exports * 0.8) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex items-start space-x-3">
              <Coffee className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-800">Running low on free usage?</h4>
                <p className="text-xs text-blue-600 mt-1">
                  Get more for the price of a coffee! Starting from just 99p.
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Button 
                    size="sm"
                    onClick={onUpgrade}
                    className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Coffee className="w-3 h-3 mr-1" />
                    Coffee Pack - £3.99
                  </Button>
                  <span className="text-xs text-blue-600">5 credits + £1 bonus!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pro Subscription Hint */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-center space-y-2">
            <p className="text-sm text-green-800">
              <strong>Heavy user?</strong> Get unlimited everything for £29/month
            </p>
            <p className="text-xs text-green-600">
              That's less than £1 per day for unlimited calculations, projects & exports!
            </p>
            <Button 
              size="sm"
              variant="outline"
              onClick={onUpgrade}
              className="h-7 px-3 text-xs border-green-500 text-green-600 hover:bg-green-50"
            >
              View Pro Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
