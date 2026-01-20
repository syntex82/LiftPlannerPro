"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { WebRTCManager, VideoCallState, WebRTCMessage } from '@/components/video-chat/webrtc-manager'

interface VideoChatHook {
  // State
  callState: VideoCallState
  incomingCall: {
    isVisible: boolean
    callerName: string
    callId: string
  }
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  
  // Actions
  startCall: (participantName: string) => Promise<void>
  acceptCall: () => Promise<void>
  rejectCall: () => void
  endCall: () => void
  toggleAudio: () => void
  toggleVideo: () => void
  
  // WebSocket integration
  handleWebSocketMessage: (message: any) => void
  sendWebSocketMessage: (message: WebRTCMessage) => void
}

interface UseVideoChatProps {
  currentUserName: string
  onSendMessage?: (message: any) => void
}

export function useVideoChat({ 
  currentUserName, 
  onSendMessage 
}: UseVideoChatProps): VideoChatHook {
  const [callState, setCallState] = useState<VideoCallState>({
    isInCall: false,
    isInitiator: false,
    localStream: null,
    remoteStream: null,
    callId: null,
    participantName: null
  })
  
  const [incomingCall, setIncomingCall] = useState({
    isVisible: false,
    callerName: '',
    callId: ''
  })
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  
  const webrtcManagerRef = useRef<WebRTCManager | null>(null)
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null)
  const onSendMessageRef = useRef(onSendMessage)

  // Update the ref when onSendMessage changes
  useEffect(() => {
    onSendMessageRef.current = onSendMessage
  }, [onSendMessage])

  // Stable callback functions
  const handleStateChange = useCallback((newState: VideoCallState) => {
    setCallState(newState)
  }, [])

  const handleMessage = useCallback((message: WebRTCMessage) => {
    // Send WebRTC signaling messages through your existing WebSocket
    if (onSendMessageRef.current) {
      onSendMessageRef.current({
        type: 'video_call_signal',
        data: message,
        timestamp: new Date().toISOString()
      })
    }
  }, [])

  // Initialize WebRTC Manager
  useEffect(() => {
    if (!webrtcManagerRef.current) {
      webrtcManagerRef.current = new WebRTCManager(handleStateChange, handleMessage)
    }

    return () => {
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.endCall()
        webrtcManagerRef.current = null
      }
    }
  }, [handleStateChange, handleMessage])

  // Start a video call
  const startCall = useCallback(async (participantName: string) => {
    if (!webrtcManagerRef.current) return

    try {
      // Check WebRTC support and permissions first
      const support = await WebRTCManager.checkSupport()
      if (!support.supported) {
        alert(`Video chat not available: ${support.error}`)
        return
      }

      // If permissions are needed, they should be handled by the UI first
      if (support.needsPermission) {
        console.log('Permissions needed, should show permission modal first')
        return
      }

      const callId = await webrtcManagerRef.current.startCall(participantName)

      // Send call request through WebSocket
      if (onSendMessageRef.current) {
        onSendMessageRef.current({
          type: 'video_call_signal',
          data: {
            type: 'call-request',
            callId,
            from: currentUserName,
            to: participantName
          },
          timestamp: new Date().toISOString()
        })
      }

      // Create and send offer after a short delay
      setTimeout(() => {
        webrtcManagerRef.current?.createOffer()
      }, 1000)
    } catch (error) {
      console.error('Failed to start call:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start video call. Please check your camera and microphone permissions.'
      alert(errorMessage)
    }
  }, [currentUserName])

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (onSendMessageRef.current && incomingCall.callId) {
      onSendMessageRef.current({
        type: 'video_call_signal',
        data: {
          type: 'call-reject',
          callId: incomingCall.callId,
          from: currentUserName,
          to: incomingCall.callerName
        },
        timestamp: new Date().toISOString()
      })
    }

    setIncomingCall({ isVisible: false, callerName: '', callId: '' })
    pendingOfferRef.current = null
  }, [incomingCall, currentUserName])

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!webrtcManagerRef.current || !incomingCall.callId) return

    try {
      // Check WebRTC support and permissions first
      const { supported, error } = await WebRTCManager.checkSupport()
      if (!supported) {
        alert(`Cannot accept call: ${error}`)
        rejectCall()
        return
      }

      await webrtcManagerRef.current.acceptCall(incomingCall.callId, incomingCall.callerName)

      // Send call accept message
      if (onSendMessageRef.current) {
        onSendMessageRef.current({
          type: 'video_call_signal',
          data: {
            type: 'call-accept',
            callId: incomingCall.callId,
            from: currentUserName,
            to: incomingCall.callerName
          },
          timestamp: new Date().toISOString()
        })
      }

      // Handle pending offer if any
      if (pendingOfferRef.current) {
        await webrtcManagerRef.current.handleOffer(pendingOfferRef.current)
        pendingOfferRef.current = null
      }

      setIncomingCall({ isVisible: false, callerName: '', callId: '' })
    } catch (error) {
      console.error('Failed to accept call:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept video call. Please check your camera and microphone permissions.'
      alert(errorMessage)
      rejectCall()
    }
  }, [incomingCall, currentUserName, rejectCall])

  // End current call
  const endCall = useCallback(() => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.endCall()
    }
    setIncomingCall({ isVisible: false, callerName: '', callId: '' })
    pendingOfferRef.current = null
  }, [])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (webrtcManagerRef.current) {
      const enabled = webrtcManagerRef.current.toggleAudio()
      setIsAudioEnabled(enabled)
    }
  }, [])

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (webrtcManagerRef.current) {
      const enabled = webrtcManagerRef.current.toggleVideo()
      setIsVideoEnabled(enabled)
    }
  }, [])

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type !== 'video_call_signal' || !message.data) return

    const signalData: WebRTCMessage = message.data

    switch (signalData.type) {
      case 'call-request':
        if (signalData.to === currentUserName) {
          setIncomingCall({
            isVisible: true,
            callerName: signalData.from,
            callId: signalData.callId
          })
        }
        break

      case 'call-accept':
        if (signalData.to === currentUserName && webrtcManagerRef.current) {
          console.log('Call accepted by', signalData.from)
        }
        break

      case 'call-reject':
        if (signalData.to === currentUserName) {
          console.log('Call rejected by', signalData.from)
          endCall()
          alert(`${signalData.from} declined the video call.`)
        }
        break

      case 'call-end':
        if (signalData.to === currentUserName || callState.callId === signalData.callId) {
          endCall()
        }
        break

      case 'offer':
        if (webrtcManagerRef.current) {
          if (callState.isInCall && !callState.isInitiator) {
            webrtcManagerRef.current.handleOffer(signalData.data)
          } else {
            // Store offer for when call is accepted
            pendingOfferRef.current = signalData.data
          }
        }
        break

      case 'answer':
        if (webrtcManagerRef.current && callState.isInitiator) {
          webrtcManagerRef.current.handleAnswer(signalData.data)
        }
        break

      case 'ice-candidate':
        if (webrtcManagerRef.current && callState.isInCall) {
          webrtcManagerRef.current.handleIceCandidate(signalData.data)
        }
        break
    }
  }, [currentUserName, callState, endCall])

  // Send WebSocket message wrapper
  const sendWebSocketMessage = useCallback((message: WebRTCMessage) => {
    if (onSendMessageRef.current) {
      onSendMessageRef.current({
        type: 'video_call_signal',
        data: message,
        timestamp: new Date().toISOString()
      })
    }
  }, [])

  return {
    callState,
    incomingCall,
    isAudioEnabled,
    isVideoEnabled,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    handleWebSocketMessage,
    sendWebSocketMessage
  }
}
