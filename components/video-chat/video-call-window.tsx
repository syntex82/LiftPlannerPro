"use client"

import { useEffect, useRef, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Maximize2,
  Minimize2,
  User
} from "lucide-react"
import { VideoCallState } from './webrtc-manager'

interface VideoCallWindowProps {
  callState: VideoCallState
  onEndCall: () => void
  onToggleAudio: () => void
  onToggleVideo: () => void
  isAudioEnabled: boolean
  isVideoEnabled: boolean
}

export default function VideoCallWindow({
  callState,
  onEndCall,
  onToggleAudio,
  onToggleVideo,
  isAudioEnabled,
  isVideoEnabled
}: VideoCallWindowProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream
    }
  }, [callState.localStream])

  // Set up remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && callState.remoteStream) {
      remoteVideoRef.current.srcObject = callState.remoteStream
    }
  }, [callState.remoteStream])

  // Call duration timer
  useEffect(() => {
    if (!callState.isInCall) {
      setCallDuration(0)
      return
    }

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [callState.isInCall])

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!callState.isInCall) return null

  return (
    <div className={`fixed ${isMinimized ? 'bottom-4 right-4' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'} z-50`}>
      <Card className={`bg-slate-900 border-slate-700 overflow-hidden ${
        isMinimized ? 'w-80 h-48' : 'w-[800px] h-[600px]'
      }`}>
        {/* Header */}
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">
              {callState.participantName || 'Video Call'}
            </span>
            <span className="text-slate-400 text-sm">
              {formatDuration(callDuration)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Video Area */}
        <div className={`relative ${isMinimized ? 'h-32' : 'h-96'} bg-slate-800`}>
          {/* Remote Video (Main) */}
          <div className="w-full h-full relative">
            {callState.remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-700">
                <div className="text-center">
                  <User className="w-16 h-16 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">
                    {callState.isInitiator ? 'Waiting for participant...' : 'Connecting...'}
                  </p>
                </div>
              </div>
            )}

            {/* Local Video (Picture-in-Picture) */}
            <div className={`absolute ${isMinimized ? 'top-2 right-2 w-20 h-16' : 'top-4 right-4 w-48 h-36'} bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-600`}>
              {callState.localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-700">
                  <User className="w-8 h-8 text-slate-500" />
                </div>
              )}
              
              {/* Video status indicators */}
              <div className="absolute bottom-1 left-1 flex space-x-1">
                {!isVideoEnabled && (
                  <div className="bg-red-600 rounded-full p-1">
                    <VideoOff className="w-3 h-3 text-white" />
                  </div>
                )}
                {!isAudioEnabled && (
                  <div className="bg-red-600 rounded-full p-1">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        {!isMinimized && (
          <div className="bg-slate-800 px-6 py-4">
            <div className="flex items-center justify-center space-x-4">
              {/* Audio Toggle */}
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                size="lg"
                onClick={onToggleAudio}
                className="rounded-full w-12 h-12"
              >
                {isAudioEnabled ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </Button>

              {/* Video Toggle */}
              <Button
                variant={isVideoEnabled ? "default" : "destructive"}
                size="lg"
                onClick={onToggleVideo}
                className="rounded-full w-12 h-12"
              >
                {isVideoEnabled ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <VideoOff className="w-5 h-5" />
                )}
              </Button>

              {/* End Call */}
              <Button
                variant="destructive"
                size="lg"
                onClick={onEndCall}
                className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Minimized Controls */}
        {isMinimized && (
          <div className="bg-slate-800 px-3 py-2">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant={isAudioEnabled ? "ghost" : "destructive"}
                size="sm"
                onClick={onToggleAudio}
                className="rounded-full w-8 h-8"
              >
                {isAudioEnabled ? (
                  <Mic className="w-3 h-3" />
                ) : (
                  <MicOff className="w-3 h-3" />
                )}
              </Button>

              <Button
                variant={isVideoEnabled ? "ghost" : "destructive"}
                size="sm"
                onClick={onToggleVideo}
                className="rounded-full w-8 h-8"
              >
                {isVideoEnabled ? (
                  <Video className="w-3 h-3" />
                ) : (
                  <VideoOff className="w-3 h-3" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={onEndCall}
                className="rounded-full w-8 h-8 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
