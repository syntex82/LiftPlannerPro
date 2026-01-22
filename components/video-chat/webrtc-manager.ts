// WebRTC Manager for native video chat functionality
export interface VideoCallState {
  isInCall: boolean
  isInitiator: boolean
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  callId: string | null
  participantName: string | null
}

export interface WebRTCMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end'
  callId: string
  data?: any
  from: string
  to: string
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private onStateChange: (state: VideoCallState) => void
  private onMessage: (message: WebRTCMessage) => void
  private currentCallId: string | null = null
  private isInitiator: boolean = false
  private participantName: string | null = null

  constructor(
    onStateChange: (state: VideoCallState) => void,
    onMessage: (message: WebRTCMessage) => void
  ) {
    this.onStateChange = onStateChange
    this.onMessage = onMessage
  }

  // Check if WebRTC is supported and permissions are available
  static async checkSupport(): Promise<{
    supported: boolean;
    error?: string;
    needsPermission?: boolean;
    canRequestPermission?: boolean;
  }> {
    try {
      // Check if WebRTC is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          supported: false,
          error: 'WebRTC is not supported in this browser. Please use Chrome, Firefox, or Safari.',
          needsPermission: false,
          canRequestPermission: false
        }
      }

      // Check if we're on HTTPS (required for getUserMedia)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        return {
          supported: false,
          error: 'Video chat requires HTTPS. Please access the site via https://',
          needsPermission: false,
          canRequestPermission: false
        }
      }

      // Check permissions using Permissions API
      try {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName })
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName })

        if (cameraPermission.state === 'denied' || microphonePermission.state === 'denied') {
          return {
            supported: false,
            error: 'Camera or microphone permission is denied. Please enable access in your browser settings.',
            needsPermission: true,
            canRequestPermission: false // Already denied, need manual enable
          }
        }

        if (cameraPermission.state === 'prompt' || microphonePermission.state === 'prompt') {
          return {
            supported: true,
            needsPermission: true,
            canRequestPermission: true // Can show permission request
          }
        }

        if (cameraPermission.state === 'granted' && microphonePermission.state === 'granted') {
          return {
            supported: true,
            needsPermission: false,
            canRequestPermission: false
          }
        }
      } catch (permError) {
        // Permissions API not supported, try getUserMedia test
        console.log('Permissions API not supported, testing getUserMedia directly')

        try {
          // Test if we can get media (this will prompt if needed)
          const testStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1, height: 1 },
            audio: true
          })
          testStream.getTracks().forEach(track => track.stop())

          return {
            supported: true,
            needsPermission: false,
            canRequestPermission: false
          }
        } catch (testError) {
          return {
            supported: true,
            needsPermission: true,
            canRequestPermission: true,
            error: 'Camera and microphone access needed for video calls'
          }
        }
      }

      return { supported: true }
    } catch (error) {
      return {
        supported: false,
        error: `WebRTC check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        needsPermission: false,
        canRequestPermission: false
      }
    }
  }

  // Request permissions with user-friendly flow
  static async requestPermissions(): Promise<{
    granted: boolean;
    error?: string;
    needsManualEnable?: boolean;
  }> {
    try {
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

      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop())

      return { granted: true }
    } catch (error: any) {
      console.error('Permission request failed:', error)

      if (error.name === 'NotAllowedError') {
        return {
          granted: false,
          error: 'Camera and microphone access was denied. Please click the camera icon in your browser\'s address bar and allow access.',
          needsManualEnable: true
        }
      } else if (error.name === 'NotFoundError') {
        return {
          granted: false,
          error: 'No camera or microphone found. Please connect a camera and microphone to use video chat.',
          needsManualEnable: false
        }
      } else if (error.name === 'NotReadableError') {
        return {
          granted: false,
          error: 'Camera or microphone is already in use by another application. Please close other video apps and try again.',
          needsManualEnable: false
        }
      } else {
        return {
          granted: false,
          error: `Failed to access camera/microphone: ${error.message}`,
          needsManualEnable: true
        }
      }
    }
  }

  // Initialize WebRTC peer connection
  private createPeerConnection(): RTCPeerConnection {
    // Configuration with multiple STUN/TURN servers for better NAT traversal
    // Works with both HTTP (localhost) and HTTPS (production)
    const configuration: RTCConfiguration = {
      iceServers: [
        // Google's free STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // OpenRelay TURN servers (free, for testing - replace with your own in production)
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
      // ICE candidate policy - allow all candidates
      iceCandidatePoolSize: 10
    }

    const pc = new RTCPeerConnection(configuration)

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.currentCallId) {
        this.onMessage({
          type: 'ice-candidate',
          callId: this.currentCallId,
          data: event.candidate,
          from: 'local',
          to: 'remote'
        })
      }
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream')
      this.updateState({
        remoteStream: event.streams[0]
      })
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState)
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.endCall()
      }
    }

    return pc
  }

  // Start a video call
  async startCall(participantName: string): Promise<string> {
    try {
      this.currentCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.isInitiator = true
      this.participantName = participantName

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC is not supported in this browser. Please use Chrome, Firefox, or Safari.')
      }

      // Get user media with error handling
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
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
      } catch (mediaError) {
        console.error('Media access error:', mediaError)

        // Try with lower quality if high quality fails
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: true
          })
        } catch (fallbackError) {
          console.error('Fallback media access failed:', fallbackError)
          throw new Error(`Camera/microphone access denied. Please:\n1. Click the camera icon in your browser's address bar\n2. Allow camera and microphone access\n3. Refresh the page and try again`)
        }
      }

      // Create peer connection
      this.peerConnection = this.createPeerConnection()

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream)
        }
      })

      this.updateState({
        isInCall: true,
        isInitiator: true,
        localStream: this.localStream,
        callId: this.currentCallId,
        participantName
      })

      return this.currentCallId
    } catch (error) {
      console.error('Error starting call:', error)
      throw error
    }
  }

  // Accept an incoming call
  async acceptCall(callId: string, participantName: string): Promise<void> {
    try {
      this.currentCallId = callId
      this.isInitiator = false
      this.participantName = participantName

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC is not supported in this browser. Please use Chrome, Firefox, or Safari.')
      }

      // Get user media with error handling
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
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
      } catch (mediaError) {
        console.error('Media access error:', mediaError)

        // Try with lower quality if high quality fails
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: true
          })
        } catch (fallbackError) {
          console.error('Fallback media access failed:', fallbackError)
          throw new Error(`Camera/microphone access denied. Please:\n1. Click the camera icon in your browser's address bar\n2. Allow camera and microphone access\n3. Refresh the page and try again`)
        }
      }

      // Create peer connection
      this.peerConnection = this.createPeerConnection()

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream)
        }
      })

      this.updateState({
        isInCall: true,
        isInitiator: false,
        localStream: this.localStream,
        callId,
        participantName
      })
    } catch (error) {
      console.error('Error accepting call:', error)
      throw error
    }
  }

  // Create and send offer
  async createOffer(): Promise<void> {
    if (!this.peerConnection || !this.currentCallId) {
      console.log('📹 Cannot create offer - no peer connection or callId')
      return
    }

    try {
      console.log('📹 Creating WebRTC offer...')
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      console.log('📹 Offer created and local description set')

      this.onMessage({
        type: 'offer',
        callId: this.currentCallId,
        data: offer,
        from: 'local',
        to: 'remote'
      })
      console.log('📹 Offer sent via signaling')
    } catch (error) {
      console.error('Error creating offer:', error)
    }
  }

  // Handle incoming offer
  async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      console.log('📹 Cannot handle offer - no peer connection')
      return
    }

    try {
      console.log('📹 Handling incoming offer...')
      await this.peerConnection.setRemoteDescription(offer)
      console.log('📹 Remote description set, creating answer...')
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)
      console.log('📹 Answer created and local description set')

      if (this.currentCallId) {
        this.onMessage({
          type: 'answer',
          callId: this.currentCallId,
          data: answer,
          from: 'local',
          to: 'remote'
        })
        console.log('📹 Answer sent via signaling')
      }
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  // Handle incoming answer
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      console.log('📹 Cannot handle answer - no peer connection')
      return
    }

    try {
      console.log('📹 Handling incoming answer...')
      await this.peerConnection.setRemoteDescription(answer)
      console.log('📹 Remote description set - connection should be establishing')
    } catch (error) {
      console.error('Error handling answer:', error)
    }
  }

  // Handle incoming ICE candidate
  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) return

    try {
      await this.peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error('Error handling ICE candidate:', error)
    }
  }

  // End the current call
  endCall(): void {
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    // Send end call message
    if (this.currentCallId) {
      this.onMessage({
        type: 'call-end',
        callId: this.currentCallId,
        from: 'local',
        to: 'remote'
      })
    }

    // Reset state
    this.currentCallId = null
    this.isInitiator = false
    this.participantName = null

    this.updateState({
      isInCall: false,
      isInitiator: false,
      localStream: null,
      remoteStream: null,
      callId: null,
      participantName: null
    })
  }

  // Toggle audio
  toggleAudio(): boolean {
    if (!this.localStream) return false

    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      return audioTrack.enabled
    }
    return false
  }

  // Toggle video
  toggleVideo(): boolean {
    if (!this.localStream) return false

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      return videoTrack.enabled
    }
    return false
  }

  // Start screen sharing - replaces video track with screen share
  async startScreenShare(): Promise<MediaStream | null> {
    if (!this.peerConnection) {
      console.error('📹 Cannot start screen share - no peer connection')
      return null
    }

    try {
      console.log('📹 Starting screen share...')
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: true
      })

      const screenTrack = screenStream.getVideoTracks()[0]

      // Find the video sender and replace the track
      const videoSender = this.peerConnection.getSenders().find(
        sender => sender.track?.kind === 'video'
      )

      if (videoSender) {
        await videoSender.replaceTrack(screenTrack)
        console.log('📹 Screen share track replaced in peer connection')
      } else {
        // No video sender found, add the track
        this.peerConnection.addTrack(screenTrack, screenStream)
        console.log('📹 Screen share track added to peer connection')
      }

      // Handle when user stops sharing via browser UI
      screenTrack.onended = () => {
        console.log('📹 Screen share ended by user')
        this.stopScreenShare()
      }

      return screenStream
    } catch (error) {
      console.error('📹 Error starting screen share:', error)
      return null
    }
  }

  // Stop screen sharing - restore camera video
  async stopScreenShare(): Promise<void> {
    if (!this.peerConnection || !this.localStream) {
      console.log('📹 Cannot stop screen share - no connection or stream')
      return
    }

    try {
      console.log('📹 Stopping screen share, restoring camera...')

      // Get the original camera video track
      const cameraTrack = this.localStream.getVideoTracks()[0]

      if (cameraTrack) {
        // Find the video sender and replace with camera track
        const videoSender = this.peerConnection.getSenders().find(
          sender => sender.track?.kind === 'video'
        )

        if (videoSender) {
          await videoSender.replaceTrack(cameraTrack)
          console.log('📹 Camera track restored in peer connection')
        }
      }
    } catch (error) {
      console.error('📹 Error stopping screen share:', error)
    }
  }

  // Get peer connection (for external access if needed)
  getPeerConnection(): RTCPeerConnection | null {
    return this.peerConnection
  }

  // Get current state
  getState(): VideoCallState {
    return {
      isInCall: !!this.currentCallId,
      isInitiator: this.isInitiator,
      localStream: this.localStream,
      remoteStream: null, // Will be updated via ontrack
      callId: this.currentCallId,
      participantName: this.participantName
    }
  }

  // Update state and notify listeners
  private updateState(partialState: Partial<VideoCallState>): void {
    const currentState = this.getState()
    const newState = { ...currentState, ...partialState }
    this.onStateChange(newState)
  }
}
