'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDeviceDetection, getDeviceMessage, canHandleFeature } from '@/lib/deviceDetection'

interface DeviceNotificationProps {
  feature: string
  children: React.ReactNode
  fallbackContent?: React.ReactNode
  showAlways?: boolean
}

export function DeviceNotification({ 
  feature, 
  children, 
  fallbackContent,
  showAlways = false 
}: DeviceNotificationProps) {
  const deviceInfo = useDeviceDetection()
  const [dismissed, setDismissed] = useState(false)
  const canHandle = canHandleFeature(feature, deviceInfo)
  const message = getDeviceMessage(feature, deviceInfo)

  // Reset dismissed state when device changes
  useEffect(() => {
    setDismissed(false)
  }, [deviceInfo.isMobile, deviceInfo.isTablet, deviceInfo.isDesktop])

  // If feature is supported or notification is dismissed, show content
  if (canHandle || dismissed) {
    return <>{children}</>
  }

  // Show notification for unsupported features
  return (
    <div className="relative">
      {/* Desktop-only feature notification */}
      <Card className="bg-amber-50 border-amber-200 p-6 m-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              Desktop Required
            </h3>
            <p className="text-amber-700 mb-4">
              {message}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setDismissed(true)}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Continue Anyway
              </Button>
              
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Fallback content for mobile/tablet */}
      {fallbackContent && (
        <div className="p-4">
          {fallbackContent}
        </div>
      )}
    </div>
  )
}

// Quick notification for temporary messages
export function QuickDeviceNotification({ 
  message, 
  type = 'info',
  onDismiss 
}: {
  message: string
  type?: 'info' | 'warning' | 'error' | 'success'
  onDismiss?: () => void
}) {
  const [visible, setVisible] = useState(true)

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  if (!visible) return null

  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  }

  const icons = {
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg border ${typeStyles[type]} shadow-lg`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Device info display component
export function DeviceInfoDisplay() {
  const deviceInfo = useDeviceDetection()

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50 opacity-50 hover:opacity-100 transition-opacity">
      <div>Device: {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}</div>
      <div>Screen: {deviceInfo.screenWidth}×{deviceInfo.screenHeight}</div>
      <div>Touch: {deviceInfo.touchSupport ? 'Yes' : 'No'}</div>
      <div>Orientation: {deviceInfo.orientation}</div>
    </div>
  )
}
