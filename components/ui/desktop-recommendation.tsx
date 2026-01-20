"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Monitor, 
  Laptop, 
  Smartphone, 
  Tablet, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Zap,
  Eye,
  MousePointer,
  Keyboard,
  Wifi
} from "lucide-react"
import { useDeviceDetection } from "@/lib/deviceDetection"

interface DesktopRecommendationProps {
  feature: string
  title: string
  description: string
  onContinue?: () => void
  onDismiss?: () => void
  showDismiss?: boolean
}

export function DesktopRecommendation({ 
  feature, 
  title, 
  description, 
  onContinue, 
  onDismiss,
  showDismiss = true 
}: DesktopRecommendationProps) {
  const deviceInfo = useDeviceDetection()
  const [dismissed, setDismissed] = useState(false)

  // Check if user has dismissed this recommendation before
  useEffect(() => {
    const dismissedFeatures = localStorage.getItem('dismissed-desktop-recommendations')
    if (dismissedFeatures) {
      const dismissed = JSON.parse(dismissedFeatures)
      if (dismissed.includes(feature)) {
        setDismissed(true)
      }
    }
  }, [feature])

  const handleDismiss = () => {
    setDismissed(true)
    
    // Save to localStorage
    const dismissedFeatures = localStorage.getItem('dismissed-desktop-recommendations')
    const dismissed = dismissedFeatures ? JSON.parse(dismissedFeatures) : []
    if (!dismissed.includes(feature)) {
      dismissed.push(feature)
      localStorage.setItem('dismissed-desktop-recommendations', JSON.stringify(dismissed))
    }
    
    onDismiss?.()
  }

  const handleContinue = () => {
    onContinue?.()
  }

  // Don't show if dismissed or on desktop
  if (dismissed || deviceInfo.isDesktop) {
    return null
  }

  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) return <Smartphone className="w-6 h-6" />
    if (deviceInfo.isTablet) return <Tablet className="w-6 h-6" />
    return <Monitor className="w-6 h-6" />
  }

  const getDeviceType = () => {
    if (deviceInfo.isMobile) return 'Mobile Device'
    if (deviceInfo.isTablet) return 'Tablet'
    return 'Desktop'
  }

  const getRecommendationLevel = () => {
    if (feature === 'cad-editor' || feature === 'lms') return 'strongly-recommended'
    return 'recommended'
  }

  const recommendationLevel = getRecommendationLevel()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-slate-800 border-slate-700 shadow-2xl">
        <CardHeader className="relative">
          {showDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex items-center space-x-3 mb-4">
            {getDeviceIcon()}
            <div>
              <Badge variant="outline" className="text-slate-300 border-slate-600">
                {getDeviceType()} Detected
              </Badge>
            </div>
          </div>

          <CardTitle className="text-2xl text-white flex items-center space-x-3">
            {recommendationLevel === 'strongly-recommended' ? (
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            ) : (
              <Monitor className="w-6 h-6 text-blue-500" />
            )}
            <span>Desktop/Laptop Recommended</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-300">{description}</p>
          </div>

          {/* Why Desktop is Better */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              Why Desktop/Laptop is Better:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-slate-300">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>Larger screen for detailed work</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <MousePointer className="w-4 h-4 text-green-400" />
                <span>Precise mouse control</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Keyboard className="w-4 h-4 text-purple-400" />
                <span>Full keyboard shortcuts</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Better performance</span>
              </div>
            </div>
          </div>

          {/* Recommended Devices */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Recommended Devices:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3 text-slate-300">
                <Monitor className="w-4 h-4 text-blue-400" />
                <span><strong>Desktop Computer:</strong> Best experience with large monitor</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Laptop className="w-4 h-4 text-green-400" />
                <span><strong>Laptop:</strong> Good portability with full functionality</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Wifi className="w-4 h-4 text-purple-400" />
                <span><strong>Minimum:</strong> 1366x768 resolution, modern browser</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleContinue}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
            >
              Continue Anyway
            </Button>
            {showDismiss && (
              <Button 
                variant="outline" 
                onClick={handleDismiss}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Don't Show Again
              </Button>
            )}
          </div>

          {recommendationLevel === 'strongly-recommended' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-200 font-medium">Important Notice:</p>
                  <p className="text-amber-300">
                    This feature may have limited functionality on mobile devices. 
                    For the best experience, please use a desktop or laptop computer.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
