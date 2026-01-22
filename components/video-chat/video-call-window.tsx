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
  User,
  Monitor,
  MonitorOff,
  Users,
  MoreVertical,
  MessageSquare,
  Settings,
  Grid3X3
} from "lucide-react"
import { VideoCallState } from './webrtc-manager'

interface VideoCallWindowProps {
  callState: VideoCallState
  onEndCall: () => void
  onToggleAudio: () => void
  onToggleVideo: () => void
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  onStartScreenShare: () => Promise<MediaStream | null>
  onStopScreenShare: () => Promise<void>
  isScreenSharing: boolean
}

export default function VideoCallWindow({
  callState,
  onEndCall,
  onToggleAudio,
  onToggleVideo,
  isAudioEnabled,
  isVideoEnabled,
  onStartScreenShare,
  onStopScreenShare,
  isScreenSharing
}: VideoCallWindowProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const screenShareRef = useRef<HTMLVideoElement>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [layout, setLayout] = useState<'spotlight' | 'grid'>('spotlight')
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)

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

  // Screen share handler - uses WebRTC manager to properly replace tracks
  const handleScreenShare = async () => {
    if (isScreenSharing || screenStream) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
        setScreenStream(null)
      }
      await onStopScreenShare()
      return
    }

    try {
      // Start screen sharing through WebRTC manager (replaces track in peer connection)
      const stream = await onStartScreenShare()

      if (stream) {
        setScreenStream(stream)

        // Display the screen share locally
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream
        }

        // Handle when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null)
          onStopScreenShare()
        }
      }
    } catch (error) {
      console.error('Error starting screen share:', error)
    }
  }

  if (!callState.isInCall) return null

  const windowSize = isMinimized
    ? 'w-80 h-48'
    : isFullscreen
      ? 'w-screen h-screen'
      : 'w-[900px] h-[650px]'

  const windowPosition = isMinimized
    ? 'bottom-4 right-4'
    : isFullscreen
      ? 'inset-0'
      : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'

  return (
    <div className={`fixed ${windowPosition} z-50`}>
      <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl ${windowSize} flex flex-col`}>
        {/* Header */}
        <div className="bg-slate-900/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              <span className="text-white font-semibold">
                {callState.participantName || 'Team Call'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="px-2 py-0.5 bg-slate-700/50 rounded-full">{formatDuration(callDuration)}</span>
              {screenStream && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                  <Monitor className="w-3 h-3" /> Sharing
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLayout(layout === 'spotlight' ? 'grid' : 'spotlight')}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Video Area */}
        <div className={`flex-1 relative ${isMinimized ? 'h-32' : ''} bg-gradient-to-br from-slate-800 to-slate-900`}>
          {/* Screen Share View (if active) */}
          {screenStream && (
            <div className="absolute inset-0 z-10">
              <video
                ref={screenShareRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute top-4 left-4 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl px-3 py-2 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Screen Sharing</span>
              </div>
            </div>
          )}

          {/* Remote Video (Main) */}
          <div className={`w-full h-full relative ${screenStream ? 'hidden' : ''}`}>
            {callState.remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-lg font-medium">
                    {callState.isInitiator ? 'Waiting for participant...' : 'Connecting...'}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Local Video (Picture-in-Picture) */}
            <div className={`absolute ${isMinimized ? 'top-2 right-2 w-20 h-16' : 'bottom-4 right-4 w-52 h-40'} bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-600/50 shadow-2xl transition-all hover:scale-105 cursor-move`}>
              {callState.localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                  <User className="w-10 h-10 text-slate-500" />
                </div>
              )}

              {/* Name tag */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="text-white text-xs font-medium bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">You</span>
                <div className="flex gap-1">
                  {!isVideoEnabled && (
                    <div className="bg-red-600/80 backdrop-blur-sm rounded-full p-1">
                      <VideoOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {!isAudioEnabled && (
                    <div className="bg-red-600/80 backdrop-blur-sm rounded-full p-1">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        {!isMinimized && (
          <div className="bg-slate-900/80 backdrop-blur-xl px-6 py-4 border-t border-slate-700/50">
            <div className="flex items-center justify-center gap-3">
              {/* Audio Toggle */}
              <Button
                onClick={onToggleAudio}
                className={`rounded-full w-14 h-14 transition-all ${
                  isAudioEnabled
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isAudioEnabled ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </Button>

              {/* Video Toggle */}
              <Button
                onClick={onToggleVideo}
                className={`rounded-full w-14 h-14 transition-all ${
                  isVideoEnabled
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isVideoEnabled ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <VideoOff className="w-6 h-6" />
                )}
              </Button>

              {/* Screen Share */}
              <Button
                onClick={handleScreenShare}
                className={`rounded-full w-14 h-14 transition-all ${
                  screenStream
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {screenStream ? (
                  <MonitorOff className="w-6 h-6" />
                ) : (
                  <Monitor className="w-6 h-6" />
                )}
              </Button>

              {/* End Call */}
              <Button
                onClick={onEndCall}
                className="rounded-full w-16 h-14 bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-500/25"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>

            {/* Control Labels */}
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-xs text-slate-500 w-14 text-center">{isAudioEnabled ? 'Mute' : 'Unmute'}</span>
              <span className="text-xs text-slate-500 w-14 text-center">{isVideoEnabled ? 'Stop' : 'Start'}</span>
              <span className="text-xs text-slate-500 w-14 text-center">{screenStream ? 'Stop' : 'Share'}</span>
              <span className="text-xs text-slate-500 w-16 text-center">Leave</span>
            </div>
          </div>
        )}

        {/* Minimized Controls */}
        {isMinimized && (
          <div className="bg-slate-900/80 backdrop-blur-xl px-3 py-2 border-t border-slate-700/50">
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={onToggleAudio}
                size="sm"
                className={`rounded-full w-8 h-8 ${isAudioEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isAudioEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
              </Button>

              <Button
                onClick={onToggleVideo}
                size="sm"
                className={`rounded-full w-8 h-8 ${isVideoEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isVideoEnabled ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
              </Button>

              <Button
                onClick={onEndCall}
                size="sm"
                className="rounded-full w-8 h-8 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
