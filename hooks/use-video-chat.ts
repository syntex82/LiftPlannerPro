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
      console.log('📹 Starting video call to:', participantName)

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
      console.log('📹 Call started with ID:', callId)

      // Send call request through WebSocket - broadcast to room (anyone can accept)
      if (onSendMessageRef.current) {
        const callRequest = {
          type: 'call-request',
          callId,
          from: currentUserName,
          to: participantName  // This is informational - all room members will see it
        }
        console.log('📹 Sending call request:', callRequest)
        onSendMessageRef.current({
          type: 'video_call_signal',
          data: callRequest,
          timestamp: new Date().toISOString()
        })
      }

      // Don't create offer yet - wait for call-accept signal
      // The offer will be created when we receive call-accept in handleWebSocketMessage
      console.log('📹 Waiting for call to be accepted...')

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
    if (!webrtcManagerRef.current || !incomingCall.callId) {
      console.log('📹 Cannot accept call - no manager or callId')
      return
    }

    try {
      console.log('📹 Accepting call from:', incomingCall.callerName, 'callId:', incomingCall.callId)

      // Check WebRTC support and permissions first
      const { supported, error } = await WebRTCManager.checkSupport()
      if (!supported) {
        alert(`Cannot accept call: ${error}`)
        rejectCall()
        return
      }

      await webrtcManagerRef.current.acceptCall(incomingCall.callId, incomingCall.callerName)
      console.log('📹 Call accepted, media ready')

      // Send call accept message to notify the caller
      if (onSendMessageRef.current) {
        const acceptMessage = {
          type: 'call-accept',
          callId: incomingCall.callId,
          from: currentUserName,
          to: incomingCall.callerName
        }
        console.log('📹 Sending call-accept:', acceptMessage)
        onSendMessageRef.current({
          type: 'video_call_signal',
          data: acceptMessage,
          timestamp: new Date().toISOString()
        })
      }

      // Handle pending offer if any (the caller may have already sent it)
      if (pendingOfferRef.current) {
        console.log('📹 Processing pending offer')
        await webrtcManagerRef.current.handleOffer(pendingOfferRef.current)
        pendingOfferRef.current = null
      } else {
        console.log('📹 No pending offer - waiting for offer from caller')
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
    console.log('📹🎯 handleWebSocketMessage CALLED with:', JSON.stringify(message, null, 2))

    if (message.type !== 'video_call_signal' || !message.data) {
      console.log('📹❌ Message rejected - type:', message.type, 'has data:', !!message.data)
      return
    }

    const signalData: WebRTCMessage = message.data

    console.log('📹 Processing video signal:', signalData.type, 'from:', signalData.from, 'currentUser:', currentUserName)

    // For room-based calls, accept signals meant for anyone (broadcast)
    // or specifically for this user
    // Don't process signals from ourselves
    if (signalData.from === currentUserName) {
      console.log('📹 Ignoring own signal')
      return
    }

    switch (signalData.type) {
      case 'call-request':
        // Accept call requests from anyone in the room (not just targeted to our username)
        // This enables room-based calling where the caller doesn't know exact usernames
        console.log('📹📞 SHOWING INCOMING CALL MODAL - caller:', signalData.from, 'callId:', signalData.callId)
        setIncomingCall({
          isVisible: true,
          callerName: signalData.from,
          callId: signalData.callId
        })
        console.log('📹✅ setIncomingCall called - modal should appear now!')
        break

      case 'call-accept':
        // Only process if we're the initiator waiting for acceptance
        if (callState.isInCall && callState.isInitiator && webrtcManagerRef.current) {
          console.log('📹 Call accepted by', signalData.from)
          // Create and send offer now that call is accepted
          webrtcManagerRef.current.createOffer()
        }
        break

      case 'call-reject':
        if (callState.isInCall && callState.isInitiator) {
          console.log('📹 Call rejected by', signalData.from)
          endCall()
          alert(`${signalData.from} declined the video call.`)
        }
        break

      case 'call-end':
        if (callState.isInCall && callState.callId === signalData.callId) {
          console.log('📹 Call ended by', signalData.from)
          endCall()
        }
        break

      case 'offer':
        console.log('📹 Received offer, isInCall:', callState.isInCall, 'isInitiator:', callState.isInitiator)
        if (webrtcManagerRef.current) {
          if (callState.isInCall && !callState.isInitiator) {
            console.log('📹 Handling offer immediately')
            webrtcManagerRef.current.handleOffer(signalData.data)
          } else {
            // Store offer for when call is accepted
            console.log('📹 Storing offer for later')
            pendingOfferRef.current = signalData.data
          }
        }
        break

      case 'answer':
        console.log('📹 Received answer, isInitiator:', callState.isInitiator)
        if (webrtcManagerRef.current && callState.isInitiator) {
          webrtcManagerRef.current.handleAnswer(signalData.data)
        }
        break

      case 'ice-candidate':
        console.log('📹 Received ICE candidate, isInCall:', callState.isInCall)
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
