"use client"

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, PhoneOff, Video, User } from "lucide-react"

interface IncomingCallModalProps {
  isVisible: boolean
  callerName: string
  callId: string
  onAccept: () => void
  onReject: () => void
}

export default function IncomingCallModal({
  isVisible,
  callerName,
  callId,
  onAccept,
  onReject
}: IncomingCallModalProps) {
  const [isRinging, setIsRinging] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsRinging(true)
      
      // Auto-reject after 30 seconds
      const timeout = setTimeout(() => {
        onReject()
      }, 30000)

      return () => clearTimeout(timeout)
    } else {
      setIsRinging(false)
    }
  }, [isVisible, onReject])

  // Play ringtone effect (optional - you can add actual audio)
  useEffect(() => {
    if (isRinging) {
      // You can add audio ringtone here
      console.log('📞 Incoming call ringing...')
    }
  }, [isRinging])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="bg-slate-900 border-slate-700 p-8 w-96 text-center">
        {/* Caller Avatar */}
        <div className="mb-6">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarFallback className="bg-blue-600 text-white text-2xl">
              {callerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Ringing Animation */}
          <div className={`w-32 h-32 mx-auto mb-4 rounded-full border-4 border-blue-500 flex items-center justify-center ${
            isRinging ? 'animate-pulse' : ''
          }`}>
            <Video className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        {/* Call Info */}
        <div className="mb-8">
          <h3 className="text-white text-xl font-semibold mb-2">
            Incoming Video Call
          </h3>
          <p className="text-slate-300 text-lg">
            {callerName}
          </p>
          <p className="text-slate-500 text-sm mt-2">
            wants to start a video call
          </p>
        </div>

        {/* Call Actions */}
        <div className="flex items-center justify-center space-x-8">
          {/* Reject Call */}
          <Button
            variant="destructive"
            size="lg"
            onClick={onReject}
            className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          {/* Accept Call */}
          <Button
            variant="default"
            size="lg"
            onClick={onAccept}
            className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700"
          >
            <Phone className="w-6 h-6" />
          </Button>
        </div>

        {/* Call ID (for debugging) */}
        <p className="text-slate-600 text-xs mt-4">
          Call ID: {callId.slice(-8)}
        </p>
      </Card>
    </div>
  )
}
