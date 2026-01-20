"use client"

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Mic, Shield, AlertTriangle, CheckCircle, ExternalLink, RefreshCw, Settings } from "lucide-react"
import { WebRTCManager } from './webrtc-manager'

interface PermissionRequestModalProps {
  isVisible: boolean
  onClose: () => void
  onRequestPermissions: () => Promise<void>
}

export default function PermissionRequestModal({
  isVisible,
  onClose,
  onRequestPermissions
}: PermissionRequestModalProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied' | 'manual-needed'>('pending')
  const [errorMessage, setErrorMessage] = useState('')
  const [browserType, setBrowserType] = useState('')

  useEffect(() => {
    // Detect browser type for specific instructions
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) setBrowserType('Chrome')
    else if (userAgent.includes('Firefox')) setBrowserType('Firefox')
    else if (userAgent.includes('Safari')) setBrowserType('Safari')
    else if (userAgent.includes('Edge')) setBrowserType('Edge')
    else setBrowserType('Browser')
  }, [])

  // Always start with pending state - let user try to enable permissions
  useEffect(() => {
    if (isVisible) {
      setPermissionStatus('pending')
      setErrorMessage('')
    }
  }, [isVisible])

  if (!isVisible) return null

  const handleRequestPermissions = async () => {
    setIsRequesting(true)

    try {
      // CRITICAL: Direct getUserMedia call to trigger browser popup
      console.log('🎥 Requesting camera and microphone permissions...')

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      console.log('✅ Permissions granted successfully!')

      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop())

      // Success - permissions granted
      setPermissionStatus('granted')
      setTimeout(() => {
        onClose()
        onRequestPermissions() // Start the actual call
      }, 1000)

    } catch (error: any) {
      console.error('❌ Permission request failed:', error)

      // Try fallback with basic settings for compatibility
      if (error.name === 'OverconstrainedError' || error.name === 'NotReadableError') {
        try {
          console.log('🔄 Trying fallback with basic settings...')
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          })

          fallbackStream.getTracks().forEach(track => track.stop())

          setPermissionStatus('granted')
          setTimeout(() => {
            onClose()
            onRequestPermissions()
          }, 1000)
          return
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError)
        }
      }

      setErrorMessage(getErrorMessage(error))

      if (error.name === 'NotAllowedError') {
        setPermissionStatus('manual-needed')
      } else {
        setPermissionStatus('denied')
      }
    } finally {
      setIsRequesting(false)
    }
  }

  const getErrorMessage = (error: any): string => {
    switch (error.name) {
      case 'NotAllowedError':
        return 'Camera and microphone access was denied. Please follow the instructions below to enable access.'
      case 'NotFoundError':
        return 'No camera or microphone found. Please connect a camera and microphone to use video chat.'
      case 'NotReadableError':
        return 'Camera or microphone is already in use by another application. Please close other video apps and try again.'
      case 'OverconstrainedError':
        return 'Camera settings not supported. Trying with basic settings...'
      case 'SecurityError':
        return 'Camera access blocked by browser security. Please ensure you\'re on HTTPS.'
      default:
        return `Failed to access camera/microphone: ${error.message || 'Unknown error'}`
    }
  }

  const handleRetryPermissions = async () => {
    setPermissionStatus('pending')
    setErrorMessage('')

    // Check current permission status
    const support = await WebRTCManager.checkSupport()
    if (support.supported && !support.needsPermission) {
      setPermissionStatus('granted')
      setTimeout(() => {
        onClose()
        onRequestPermissions()
      }, 1000)
    }
  }

  const getBrowserInstructions = () => {
    switch (browserType) {
      case 'Chrome':
      case 'Edge':
        return [
          'Click the camera icon 📹 in the address bar (left of the URL)',
          'Select "Always allow liftplannerpro.org to access your camera and microphone"',
          'Click "Done" and refresh this page'
        ]
      case 'Firefox':
        return [
          'Click the shield icon 🛡️ in the address bar',
          'Click "Turn off Enhanced Tracking Protection for this site"',
          'Refresh the page and allow permissions when prompted'
        ]
      case 'Safari':
        return [
          'Go to Safari → Settings → Websites',
          'Select "Camera" and "Microphone" from the left sidebar',
          'Set liftplannerpro.org to "Allow" for both'
        ]
      default:
        return [
          'Look for a camera or microphone icon in your browser\'s address bar',
          'Click it and allow access to camera and microphone',
          'Refresh the page and try again'
        ]
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="bg-slate-900 border-slate-700 p-8 w-96 text-center">
        {/* Icon */}
        <div className="mb-6">
          {permissionStatus === 'pending' && (
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-blue-500" />
            </div>
          )}
          {permissionStatus === 'granted' && (
            <div className="w-20 h-20 mx-auto mb-4 bg-green-600/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          )}
          {permissionStatus === 'denied' && (
            <div className="w-20 h-20 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-8">
          {permissionStatus === 'pending' && (
            <>
              <h3 className="text-white text-xl font-semibold mb-4">
                Enable Camera & Microphone
              </h3>
              <p className="text-slate-300 mb-6">
                To start a video call, we need access to your camera and microphone.
                Your privacy is important - video calls are peer-to-peer and not recorded.
              </p>

              <div className="space-y-3 text-left mb-6">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Camera className="w-5 h-5 text-blue-500" />
                  <span>Camera access for video</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mic className="w-5 h-5 text-blue-500" />
                  <span>Microphone access for audio</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Secure peer-to-peer connection</span>
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Important:</strong> When you click "Enable Access", your browser will show a popup asking for camera and microphone permission.
                  <strong>Click "Allow"</strong> to enable video calling.
                </p>
              </div>
            </>
          )}

          {permissionStatus === 'granted' && (
            <>
              <h3 className="text-white text-xl font-semibold mb-4">
                ✅ Permissions Enabled!
              </h3>
              <p className="text-green-400 mb-4">
                Camera and microphone access enabled successfully.
              </p>
              <p className="text-slate-300">
                Starting your video call...
              </p>
            </>
          )}

          {permissionStatus === 'manual-needed' && (
            <>
              <h3 className="text-white text-xl font-semibold mb-4">
                Manual Setup Required
              </h3>
              <p className="text-yellow-400 mb-4">
                {errorMessage}
              </p>

              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  {browserType} Instructions:
                </h4>
                <ol className="text-slate-300 text-sm space-y-2">
                  {getBrowserInstructions().map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3">
                <p className="text-amber-300 text-sm">
                  ⚠️ After following these steps, click "Check Again" below.
                </p>
              </div>
            </>
          )}

          {permissionStatus === 'denied' && (
            <>
              <h3 className="text-white text-xl font-semibold mb-4">
                Permission Issue
              </h3>
              <p className="text-red-400 mb-4">
                {errorMessage || 'Camera or microphone access was denied.'}
              </p>

              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <h4 className="text-white font-semibold mb-3">Quick Fix:</h4>
                <div className="text-slate-300 text-sm space-y-2">
                  {getBrowserInstructions().map((instruction, index) => (
                    <p key={index}>
                      <strong>{index + 1}.</strong> {instruction}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center space-x-4">
          {permissionStatus === 'pending' && (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleRequestPermissions()
                }}
                disabled={isRequesting}
                className="bg-blue-600 hover:bg-blue-700"
                type="button"
              >
                {isRequesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Enable Access
                  </>
                )}
              </Button>
            </>
          )}

          {permissionStatus === 'manual-needed' && (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRetryPermissions}
                className="bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Again
              </Button>
            </>
          )}

          {permissionStatus === 'denied' && (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRetryPermissions}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </>
          )}

          {permissionStatus === 'granted' && (
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue
            </Button>
          )}
        </div>

        {/* Browser Help */}
        {(permissionStatus === 'denied' || permissionStatus === 'manual-needed') && (
          <div className="mt-6 space-y-3">
            <div className="p-4 bg-slate-800 rounded-lg">
              <h5 className="text-white font-semibold mb-2 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Need More Help?
              </h5>
              <div className="text-slate-400 text-xs space-y-1">
                <p>• Make sure you're using Chrome, Firefox, Safari, or Edge</p>
                <p>• Ensure the site is accessed via HTTPS (https://liftplannerpro.org)</p>
                <p>• Close other video apps (Zoom, Teams, Skype) that might be using your camera</p>
                <p>• Try refreshing the page after enabling permissions</p>
              </div>
            </div>

            {browserType === 'Chrome' && (
              <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                <p className="text-blue-300 text-xs">
                  <strong>Chrome Tip:</strong> Look for the camera icon 📹 in the address bar.
                  If you don't see it, try refreshing the page.
                </p>
              </div>
            )}

            {browserType === 'Firefox' && (
              <div className="p-3 bg-orange-900/20 border border-orange-700 rounded-lg">
                <p className="text-orange-300 text-xs">
                  <strong>Firefox Tip:</strong> You might need to disable Enhanced Tracking Protection
                  for this site to allow camera access.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
