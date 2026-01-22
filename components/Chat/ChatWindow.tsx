'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, Paperclip, Send, Users, Settings, Video, Phone, Trash2 } from 'lucide-react'
import ChatErrorWrapper from './ChatErrorBoundary'
import { useVideoChat } from '@/hooks/use-video-chat'
import VideoCallWindow from '@/components/video-chat/video-call-window'
import IncomingCallModal from '@/components/video-chat/incoming-call-modal'
import PermissionRequestModal from '@/components/video-chat/permission-request-modal'
import { WebRTCManager } from '@/components/video-chat/webrtc-manager'

interface Message {
  id: number
  content: string
  username: string
  messageType: 'text' | 'file' | 'system' | 'image'
  created_at: string
  replyTo?: number
  fileUrl?: string
  fileName?: string
  mentions?: string[]
  reactions?: { emoji: string, users: string[] }[]
}

interface User {
  id: number
  name: string
  email: string
  isOnline: boolean
}

interface ChatRoom {
  id: number
  name: string
  type: string
  unread_count: number
}

function ChatWindowContent({ projectId }: { projectId?: number }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [currentRoom, setCurrentRoom] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [showUserList, setShowUserList] = useState(false)
  const [currentUserName] = useState('User') // TODO: Get from session
  const [showPermissionModal, setShowPermissionModal] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const sendVideoSignal = useCallback(async (signalData: any) => {
    if (!currentRoom) return

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: currentRoom,
          content: JSON.stringify(signalData),
          messageType: 'video_call_signal'
        })
      })
    } catch (error) {
      console.error('Error sending video signal:', error)
    }
  }, [currentRoom])

  // Stable callback for video chat
  const handleVideoMessage = useCallback((message: any) => {
    // Send video call signals through the chat system
    sendVideoSignal(message)
  }, [sendVideoSignal])

  // Video chat integration
  const videoChat = useVideoChat({
    currentUserName,
    onSendMessage: handleVideoMessage
  })

  // Set user online status
  const setOnlineStatus = async (status: 'online' | 'offline') => {
    try {
      await fetch('/api/chat/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      console.log('📡 User status set to:', status)
    } catch (error) {
      console.error('Error setting online status:', error)
    }
  }

  // Load chat rooms on mount and set online status
  useEffect(() => {
    loadChatRooms()

    // Set user online when component mounts
    setOnlineStatus('online')

    // Set user offline when component unmounts or page closes
    const handleBeforeUnload = () => {
      navigator.sendBeacon('/api/chat/users', JSON.stringify({ status: 'offline' }))
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      setOnlineStatus('offline')
    }
  }, [])

  // Connect to SSE when room changes
  useEffect(() => {
    if (currentRoom) {
      connectToRoom(currentRoom)
      loadMessages(currentRoom)
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [currentRoom])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChatRooms = async () => {
    try {
      // First, check and initialize chat groups if needed
      try {
        const initCheck = await fetch('/api/chat/init')
        const initStatus = await initCheck.json()

        if (!initStatus.initialized) {
          console.log('🏗️ Initializing chat groups...')
          await fetch('/api/chat/init', { method: 'POST' })
          console.log('✅ Chat groups initialized')
        }
      } catch (initError) {
        console.log('ℹ️ Chat init check skipped:', initError)
      }

      const response = await fetch('/api/chat/rooms')
      const data = await response.json()

      // Handle both array response and { rooms: [] } response
      const roomsList = data.rooms || data || []
      console.log('📋 Loaded rooms:', roomsList)

      if (roomsList.length > 0) {
        setRooms(roomsList)
        // Auto-select first room
        setCurrentRoom(roomsList[0].id)
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error)
    }
  }

  const loadMessages = async (roomId: number) => {
    try {
      setIsLoading(true)
      console.log(`📬 Loading messages for room ${roomId}...`)
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`)
      const data = await response.json()

      console.log(`📨 Received messages data:`, data)

      // Handle both array response and { messages: [] } response
      const messagesList = Array.isArray(data) ? data : (data.messages || [])
      setMessages(messagesList)
      console.log(`✅ Loaded ${messagesList.length} messages`)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectToRoom = (roomId: number) => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // Create new SSE connection
    const eventSource = new EventSource(`/api/chat/messages?roomId=${roomId}&stream=true`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      console.log('Connected to chat room:', roomId)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'new_message') {
          const message = data.message

          // Handle video call signals
          if (message.messageType === 'video_call_signal') {
            try {
              const signalData = JSON.parse(message.content)
              console.log('📹 Received video signal:', signalData)
              // Wrap in the expected format for handleWebSocketMessage
              videoChat.handleWebSocketMessage({
                type: 'video_call_signal',
                data: signalData
              })
            } catch (error) {
              console.error('Error parsing video signal:', error)
            }
          } else {
            // Regular message
            setMessages(prev => [...prev, message])
          }
        } else if (data.type === 'connected') {
          console.log('SSE connection established')
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      console.log('SSE connection error')
    }

    eventSource.addEventListener('close', () => {
      setIsConnected(false)
      console.log('SSE connection closed')
    })
  }

  const sendMessage = async (content?: string, messageType: string = 'text') => {
    const messageContent = content || newMessage.trim()
    if (!messageContent || !currentRoom) return

    try {
      console.log('🚀 Sending message:', { roomId: currentRoom, content: messageContent, messageType })

      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: currentRoom,
          content: messageContent,
          messageType
        })
      })

      console.log('📡 Response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Message sent successfully:', result)
        if (!content) {
          setNewMessage('')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Failed to send message:', response.status, errorData)
        alert(`Failed to send message: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('💥 Error sending message:', error)
      alert(`Error sending message: ${error?.message || 'Network error'}`)
    }
  }

  const deleteMessage = async (messageId: number) => {
    if (!currentRoom) return

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      console.log('🗑️ Deleting message:', messageId)

      const response = await fetch(`/api/chat/messages?messageId=${messageId}&roomId=${currentRoom}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        console.log('✅ Message deleted successfully')
        // Remove message from local state
        setMessages(messages.filter(msg => msg.id !== messageId))
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Failed to delete message:', response.status, errorData)
        alert(`Failed to delete message: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('💥 Error deleting message:', error)
      alert(`Error deleting message: ${error?.message || 'Network error'}`)
    }
  }



  const handleStartVideoCall = async () => {
    try {
      console.log('🎥 Starting video call...')

      // Check if we're on HTTPS
      if (location.protocol !== 'https:') {
        alert('Video chat requires HTTPS. Please use https://liftplannerpro.org')
        return
      }

      // Direct getUserMedia call - this MUST trigger browser popup
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      console.log('✅ Got media stream, starting call')
      stream.getTracks().forEach(track => track.stop())

      // Start the actual video call
      await videoChat.startCall('Team Member')

    } catch (error: any) {
      console.error('❌ Video call failed:', error.name, error.message)

      if (error.name === 'NotAllowedError') {
        alert(`Camera/microphone access denied. To fix this:

1. Look for a camera icon 📹 in your browser's address bar
2. Click it and select "Allow" for camera and microphone
3. Refresh the page and try again

Or go to your browser settings and allow camera/microphone for ${location.hostname}`)
      } else {
        alert(`Video chat error: ${error.message}`)
      }
    }
  }

  const handleRequestPermissions = async () => {
    // This will be called after permissions are granted in the modal
    videoChat.startCall('Team Member')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentRoom) {
      console.log('❌ Cannot upload: no file or no room selected')
      return
    }

    console.log('📤 Uploading file:', { name: file.name, size: file.size, type: file.type })
    setIsUploading(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('roomId', currentRoom.toString())

      // Upload file to your server
      const uploadResponse = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData
      })

      console.log('📡 Upload response status:', uploadResponse.status)

      if (uploadResponse.ok) {
        const { fileUrl, fileName } = await uploadResponse.json()
        console.log('✅ File uploaded:', { fileUrl, fileName })

        // Send file message with URL included in content
        const messageContent = file.type.startsWith('image/')
          ? `[Image: ${fileName}](${fileUrl})`
          : `[File: ${fileName}](${fileUrl})`

        const messageResponse = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: currentRoom,
            content: messageContent,
            messageType: file.type.startsWith('image/') ? 'image' : 'file'
          })
        })

        console.log('📡 Message response status:', messageResponse.status)
      } else {
        const errorData = await uploadResponse.json()
        console.error('❌ Upload failed:', errorData)
      }
    } catch (error) {
      console.error('💥 File upload error:', error)
    } finally {
      setIsUploading(false)
      event.target.value = '' // Reset input
    }
  }

  const addReaction = async (messageId: number, emoji: string) => {
    try {
      await fetch('/api/chat/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji })
      })
    } catch (error) {
      console.error('Reaction error:', error)
    }
  }

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }
    return mentions
  }

  return (
    <div className="flex h-full bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Room List Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-white font-medium">Chat Rooms</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-slate-400 text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="p-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setCurrentRoom(room.id)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                currentRoom === room.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{room.name}</span>
                {room.unread_count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {room.unread_count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center justify-between">
              <h3 className="text-white font-medium">
                {rooms.find(r => r.id === currentRoom)?.name || 'Chat'}
              </h3>

              {/* Video Call Controls */}
              <div className="flex items-center space-x-2">
                {!videoChat.callState.isInCall && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartVideoCall}
                    className="text-slate-400 hover:text-white"
                    title="Start Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserList(!showUserList)}
                  className="text-slate-400 hover:text-white"
                >
                  <Users className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="text-center text-slate-400">Loading messages...</div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="group">
                    {/* Reply indicator */}
                    {message.replyTo && (
                      <div className="ml-11 mb-1 text-slate-400 text-xs">
                        ↳ Replying to message
                      </div>
                    )}

                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                        {message.username[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{message.username}</span>
                          <span className="text-slate-400 text-xs">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Message content based on type */}
                        {message.messageType === 'image' && message.fileUrl ? (
                          <div className="mb-2">
                            <img
                              src={message.fileUrl}
                              alt={message.fileName}
                              className="max-w-xs rounded-lg border border-slate-600"
                              loading="lazy"
                            />
                            <p className="text-slate-300 text-sm mt-1">{message.content}</p>
                          </div>
                        ) : message.messageType === 'file' && message.fileUrl ? (
                          <div className="mb-2">
                            <a
                              href={message.fileUrl}
                              download={message.fileName}
                              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded border border-slate-600 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <span>📎</span>
                              <span className="text-sm">{message.fileName}</span>
                            </a>
                            <p className="text-slate-300 text-sm mt-1">{message.content}</p>
                          </div>
                        ) : (
                          <p className="text-slate-300 text-sm break-words">
                            {message.content.split(/(@\w+)/g).map((part, index) =>
                              part.startsWith('@') ? (
                                <span key={index} className="bg-blue-900/50 text-blue-300 px-1 rounded">
                                  {part}
                                </span>
                              ) : part
                            )}
                          </p>
                        )}

                        {/* Message reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {message.reactions.map((reaction, index) => (
                              <button
                                key={index}
                                onClick={() => addReaction(message.id, reaction.emoji)}
                                className="inline-flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs transition-colors"
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-slate-400">{reaction.users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Message actions (visible on hover) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          <div className="flex gap-2">
                            <button
                              onClick={() => addReaction(message.id, '👍')}
                              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-700"
                            >
                              👍
                            </button>
                            <button
                              onClick={() => addReaction(message.id, '❤️')}
                              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-700"
                            >
                              ❤️
                            </button>
                            <button
                              onClick={() => setReplyTo(message)}
                              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-700"
                            >
                              Reply
                            </button>
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                              title="Delete message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700 bg-slate-800">
              {/* Reply indicator */}
              {replyTo && (
                <div className="mb-3 p-2 bg-slate-700 rounded border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-xs">Replying to {replyTo.username}</span>
                      <p className="text-slate-300 text-sm truncate">{replyTo.content}</p>
                    </div>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {/* File upload button */}
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx,.txt,.dwg"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex items-center justify-center w-10 h-10 rounded border border-slate-600 cursor-pointer transition-colors ${
                      isUploading
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-slate-400">📎</span>
                    )}
                  </label>
                </div>

                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message... (use @username to mention)"
                  rows={1}
                  className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none resize-none min-h-[40px] max-h-[120px]"
                  style={{
                    height: 'auto',
                    minHeight: '40px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                  }}
                />

                <Button
                  onClick={() => sendMessage()}
                  disabled={!newMessage.trim() || !isConnected || isUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-10"
                >
                  <span>Send</span>
                </Button>
              </div>

              {/* Quick emoji reactions */}
              <div className="flex gap-2 mt-2">
                <span className="text-slate-400 text-xs">Quick reactions:</span>
                {['👍', '👎', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewMessage(prev => prev + emoji)}
                    className="text-lg hover:bg-slate-700 px-1 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a chat room to start messaging
          </div>
        )}
      </div>

      {/* Video Call Components */}
      <VideoCallWindow
        callState={videoChat.callState}
        onEndCall={videoChat.endCall}
        onToggleAudio={videoChat.toggleAudio}
        onToggleVideo={videoChat.toggleVideo}
        isAudioEnabled={videoChat.isAudioEnabled}
        isVideoEnabled={videoChat.isVideoEnabled}
        onStartScreenShare={videoChat.startScreenShare}
        onStopScreenShare={videoChat.stopScreenShare}
        isScreenSharing={videoChat.isScreenSharing}
      />

      <IncomingCallModal
        isVisible={videoChat.incomingCall.isVisible}
        callerName={videoChat.incomingCall.callerName}
        callId={videoChat.incomingCall.callId}
        onAccept={videoChat.acceptCall}
        onReject={videoChat.rejectCall}
      />

      <PermissionRequestModal
        isVisible={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onRequestPermissions={handleRequestPermissions}
      />
    </div>
  )
}

export default function ChatWindow({ projectId }: { projectId?: number }) {
  return (
    <ChatErrorWrapper>
      <ChatWindowContent projectId={projectId} />
    </ChatErrorWrapper>
  )
}
