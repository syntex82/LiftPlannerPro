'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Send, Video, Phone, PhoneOff, Users, Settings, Search, Plus, Hash, 
  Smile, Paperclip, Image, Mic, MicOff, VideoOff, Monitor, X, 
  MoreVertical, Reply, Heart, ThumbsUp, Star, Check, CheckCheck,
  MessageSquare, AtSign, GripVertical, Maximize2, Minimize2
} from 'lucide-react'
import ChatErrorWrapper from './ChatErrorBoundary'
import { useVideoChat } from '@/hooks/use-video-chat'
import VideoCallWindow from '@/components/video-chat/video-call-window'
import IncomingCallModal from '@/components/video-chat/incoming-call-modal'
import PermissionRequestModal from '@/components/video-chat/permission-request-modal'

// GIF Picker Component
const GifPicker = ({ onSelect, onClose }: { onSelect: (url: string) => void, onClose: () => void }) => {
  const [search, setSearch] = useState('')
  const [gifs, setGifs] = useState<string[]>([])
  
  // Sample GIFs - in production, integrate with Giphy/Tenor API
  const sampleGifs = [
    'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
    'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
    'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
  ]

  useEffect(() => {
    setGifs(sampleGifs)
  }, [search])

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden z-50">
      <div className="p-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">GIFs</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Search GIFs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
        />
      </div>
      <div className="p-2 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
        {gifs.map((gif, i) => (
          <img
            key={i}
            src={gif}
            alt="GIF"
            className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => { onSelect(gif); onClose() }}
          />
        ))}
      </div>
    </div>
  )
}

// Emoji Picker Component
const EmojiPicker = ({ onSelect, onClose }: { onSelect: (emoji: string) => void, onClose: () => void }) => {
  const emojis = ['😀', '😂', '🥰', '😍', '🤩', '😎', '🤔', '😅', '👍', '👏', '🎉', '🔥', '❤️', '💯', '✅', '🚀', '💪', '🙌', '👀', '💡']
  
  return (
    <div className="absolute bottom-full left-0 mb-2 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl p-3 z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium text-sm">Emoji</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {emojis.map((emoji, i) => (
          <button
            key={i}
            onClick={() => { onSelect(emoji); onClose() }}
            className="text-xl p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

interface Message {
  id: number
  content: string
  username: string
  messageType: 'text' | 'file' | 'system' | 'image' | 'gif'
  created_at: string
  replyTo?: number
  fileUrl?: string
  fileName?: string
  mentions?: string[]
  reactions?: { emoji: string, users: string[] }[]
  isRead?: boolean
  avatar?: string
}

interface User {
  id: number
  name: string
  email: string
  isOnline: boolean
  avatar?: string
  status?: 'online' | 'away' | 'busy' | 'dnd' | 'offline'
  lastSeen?: string
}

interface ChatRoom {
  id: number
  name: string
  type: string
  unread_count: number
  icon?: string
  lastMessage?: string
  lastMessageTime?: string
}

function TeamChatContent({ projectId }: { projectId?: number }) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [currentRoom, setCurrentRoom] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [showUserList, setShowUserList] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [myStatus, setMyStatus] = useState<'online' | 'away' | 'busy' | 'dnd'>('online')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [targetCallUser, setTargetCallUser] = useState<User | null>(null)

  // Get current user name from session
  const currentUserName = session?.user?.name || 'User'

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Video chat hook
  const sendVideoSignal = useCallback(async (signalData: any) => {
    if (!currentRoom) return
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleVideoMessage = useCallback((message: any) => {
    sendVideoSignal(message)
  }, [sendVideoSignal])

  const videoChat = useVideoChat({
    currentUserName,
    onSendMessage: handleVideoMessage
  })

  // Set user online status - supports all status types
  const setOnlineStatus = async (status: 'online' | 'offline' | 'away' | 'busy' | 'dnd') => {
    try {
      const response = await fetch('/api/chat/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        console.log('📡 User status set to:', status)
        if (status !== 'offline') {
          setMyStatus(status as 'online' | 'away' | 'busy' | 'dnd')
        }
      } else {
        console.error('Failed to set status:', response.status)
      }
    } catch (error) {
      console.error('Error setting online status:', error)
    }
  }

  // Get status display info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'online': return { label: 'Available', color: 'bg-green-500', textColor: 'text-green-400' }
      case 'away': return { label: 'Away', color: 'bg-yellow-500', textColor: 'text-yellow-400' }
      case 'busy': return { label: 'Busy', color: 'bg-red-500', textColor: 'text-red-400' }
      case 'dnd': return { label: 'Do Not Disturb', color: 'bg-red-600', textColor: 'text-red-400' }
      default: return { label: 'Offline', color: 'bg-slate-500', textColor: 'text-slate-400' }
    }
  }

  // Load rooms and users, and set online status
  useEffect(() => {
    loadChatRooms()
    loadUsers()

    // Set user online when component mounts
    setOnlineStatus('online')

    // Set user offline when component unmounts or page closes
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable unload
      navigator.sendBeacon('/api/chat/users', JSON.stringify({ status: 'offline' }))
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      setOnlineStatus('offline')
    }
  }, [])

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
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [currentRoom])

  // Periodically refresh users list to see online status changes
  useEffect(() => {
    const interval = setInterval(() => {
      loadUsers()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [])

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
      if (response.ok) {
        const data = await response.json()
        const roomsList = data.rooms || data || []
        console.log('📋 Loaded rooms:', roomsList)
        setRooms(roomsList)
        if (roomsList.length > 0 && !currentRoom) {
          setCurrentRoom(roomsList[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading rooms:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/chat/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connectToRoom = async (roomId: number) => {
    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    try {
      console.log(`🔌 Connecting to room ${roomId}...`)
      const eventSource = new EventSource(`/api/chat/messages?roomId=${roomId}&stream=true`)

      eventSource.onopen = () => {
        console.log('✅ SSE connected')
        setIsConnected(true)
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
        } catch (e) {
          console.error('Error parsing message:', e)
        }
      }

      eventSource.onerror = (error) => {
        console.log('⚠️ SSE error, will reconnect...', error)
        setIsConnected(false)
        eventSource.close()
        eventSourceRef.current = null

        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (roomId === currentRoom) {
            console.log('🔄 Attempting to reconnect...')
            connectToRoom(roomId)
          }
        }, 3000)
      }

      eventSourceRef.current = eventSource
    } catch (error) {
      console.error('Error connecting to room:', error)
      setIsConnected(false)
    }
  }

  const loadMessages = async (roomId: number) => {
    setIsLoading(true)
    try {
      console.log(`📬 Loading messages for room ${roomId}...`)
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`)
      if (response.ok) {
        const data = await response.json()
        console.log(`📨 Received messages data:`, data)

        // Handle both array response and { messages: [] } response
        const messagesList = Array.isArray(data) ? data : (data.messages || [])

        // Filter out video call signals (they have a different messageType from the API)
        const filteredMessages = messagesList.filter((m: any) => m.messageType !== 'video_call_signal')
        setMessages(filteredMessages)
        console.log(`✅ Loaded ${filteredMessages.length} messages`)
      } else {
        console.error(`❌ Failed to load messages: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (content?: string, messageType: string = 'text') => {
    const messageContent = content || newMessage.trim()
    if (!messageContent || !currentRoom) {
      console.log('❌ Cannot send: no content or no room selected')
      return
    }

    console.log('🚀 Sending message:', { roomId: currentRoom, content: messageContent, messageType })

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom,
          content: messageContent,
          messageType,
          replyTo: replyTo?.id
        })
      })

      console.log('📡 Response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Message sent:', result)
        if (!content) setNewMessage('')
        setReplyTo(null)
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to send message:', errorData)
      }
    } catch (error) {
      console.error('💥 Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = e.target.files?.[0]
    if (!file || !currentRoom) {
      console.log('❌ Cannot upload: no file or no room selected')
      return
    }

    console.log('📤 Uploading file:', { name: file.name, size: file.size, type: file.type })
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('roomId', currentRoom.toString())

      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData
      })

      console.log('📡 Upload response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ File uploaded:', data)

        // Include the file URL in the message content
        const messageContent = type === 'image'
          ? `[Image: ${file.name}](${data.fileUrl})`
          : `[File: ${file.name}](${data.fileUrl})`

        await sendMessage(messageContent, type === 'image' ? 'image' : 'file')
      } else {
        const errorData = await response.json()
        console.error('❌ Upload failed:', errorData)
      }
    } catch (error) {
      console.error('💥 Error uploading file:', error)
    } finally {
      setIsUploading(false)
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
      console.error('Error adding reaction:', error)
    }
  }

  const handleStartVideoCall = async () => {
    const support = await (await import('@/components/video-chat/webrtc-manager')).WebRTCManager.checkSupport()
    if (!support.supported) {
      alert(`Video calling not available: ${support.error}`)
      return
    }
    if (support.needsPermission) {
      setShowPermissionModal(true)
      return
    }
    const room = rooms.find(r => r.id === currentRoom)
    videoChat.startCall(room?.name || 'Team')
  }

  // Start a video call to a specific user
  const handleStartVideoCallToUser = async (user: User) => {
    if (!user.isOnline) {
      alert(`${user.name} is currently offline and cannot receive calls.`)
      return
    }

    const support = await (await import('@/components/video-chat/webrtc-manager')).WebRTCManager.checkSupport()
    if (!support.supported) {
      alert(`Video calling not available: ${support.error}`)
      return
    }
    if (support.needsPermission) {
      setTargetCallUser(user)
      setShowPermissionModal(true)
      return
    }

    console.log('📹 Starting call to specific user:', user.name, user.email)
    videoChat.startCall(user.name)
  }

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      setIsScreenSharing(true)
      // Integrate with video call
      stream.getVideoTracks()[0].onended = () => setIsScreenSharing(false)
    } catch (error) {
      console.error('Error starting screen share:', error)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      case 'dnd': return 'bg-red-600'
      default: return 'bg-slate-500'
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
      {/* Sidebar - Channels & DMs */}
      <div className="w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Team Chat
            </h2>
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">Channels</div>
          {rooms.filter(r => r.type !== 'direct').map((room) => (
            <button
              key={room.id}
              onClick={() => setCurrentRoom(room.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                currentRoom === room.id
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Hash className="w-4 h-4 text-slate-500" />
              <span className="flex-1 text-left text-sm font-medium truncate">{room.name}</span>
              {room.unread_count > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {room.unread_count}
                </span>
              )}
            </button>
          ))}

          {/* Direct Messages */}
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mt-4">Direct Messages</div>
          {users.slice(0, 5).map((user) => (
            <button
              key={user.id}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {user.name[0]?.toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(user.status || (user.isOnline ? 'online' : 'offline'))}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.isOnline ? 'Online' : 'Offline'}</p>
              </div>
            </button>
          ))}
        </div>

        {/* User Profile with Status Dropdown */}
        <div className="p-3 border-t border-slate-700/50">
          <div className="relative">
            <div
              className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                  {currentUserName[0]?.toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${getStatusInfo(myStatus).color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{currentUserName}</p>
                <p className={`text-xs ${getStatusInfo(myStatus).textColor}`}>{getStatusInfo(myStatus).label}</p>
              </div>
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={(e) => { e.stopPropagation(); }}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* Status Dropdown */}
            {showStatusDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-50 overflow-hidden">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => { setOnlineStatus('online'); setShowStatusDropdown(false); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors ${myStatus === 'online' ? 'bg-slate-700/50' : ''}`}
                  >
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-white">Available</span>
                  </button>
                  <button
                    onClick={() => { setOnlineStatus('away'); setShowStatusDropdown(false); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors ${myStatus === 'away' ? 'bg-slate-700/50' : ''}`}
                  >
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm text-white">Away</span>
                  </button>
                  <button
                    onClick={() => { setOnlineStatus('busy'); setShowStatusDropdown(false); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors ${myStatus === 'busy' ? 'bg-slate-700/50' : ''}`}
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-white">Busy</span>
                  </button>
                  <button
                    onClick={() => { setOnlineStatus('dnd'); setShowStatusDropdown(false); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors ${myStatus === 'dnd' ? 'bg-slate-700/50' : ''}`}
                  >
                    <div className="w-3 h-3 rounded-full bg-red-600" />
                    <span className="text-sm text-white">Do Not Disturb</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {rooms.find(r => r.id === currentRoom)?.name || 'Chat'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {users.filter(u => u.isOnline).length} online • {users.length} members
                    </p>
                  </div>
                </div>

                {/* Call Controls */}
                <div className="flex items-center gap-2">
                  {!videoChat.callState.isInCall ? (
                    <>
                      <Button
                        onClick={handleStartVideoCall}
                        size="sm"
                        className="bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl gap-2"
                      >
                        <Video className="w-4 h-4" />
                        <span className="hidden sm:inline">Video</span>
                      </Button>
                      <Button
                        onClick={startScreenShare}
                        size="sm"
                        className="bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl gap-2"
                      >
                        <Monitor className="w-4 h-4" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={videoChat.endCall}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
                    >
                      <PhoneOff className="w-4 h-4" />
                      End Call
                    </Button>
                  )}

                  <Button
                    onClick={() => setShowUserList(!showUserList)}
                    size="sm"
                    variant="ghost"
                    className={`rounded-xl ${showUserList ? 'bg-slate-700/50 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Screen Share Banner */}
              {isScreenSharing && (
                <div className="mt-3 flex items-center justify-between bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm font-medium">You are sharing your screen</span>
                  </div>
                  <Button size="sm" onClick={() => setIsScreenSharing(false)} className="bg-red-600 hover:bg-red-700 text-white text-xs">
                    Stop Sharing
                  </Button>
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 text-sm">Loading messages...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
                  <p className="text-slate-400 text-sm max-w-xs">Start the conversation by sending a message below</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.username === currentUserName
                  const showAvatar = index === 0 || messages[index - 1].username !== message.username

                  return (
                    <div key={message.id} className={`group flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      {showAvatar ? (
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            isOwn
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                              : 'bg-gradient-to-br from-purple-500 to-pink-500'
                          }`}>
                            {message.username[0]?.toUpperCase()}
                          </div>
                        </div>
                      ) : (
                        <div className="w-10" />
                      )}

                      {/* Message Content */}
                      <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        {showAvatar && (
                          <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <span className="text-sm font-semibold text-white">{message.username}</span>
                            <span className="text-xs text-slate-500">{formatTime(message.created_at)}</span>
                            {message.isRead && isOwn && (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                            )}
                          </div>
                        )}

                        {/* Reply Preview */}
                        {message.replyTo && (
                          <div className={`mb-2 px-3 py-2 rounded-lg bg-slate-700/30 border-l-2 border-blue-500 ${isOwn ? 'ml-auto' : ''}`}>
                            <p className="text-xs text-slate-400">Replying to message</p>
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div className={`rounded-2xl px-4 py-3 ${
                          isOwn
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-md'
                            : 'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-200 rounded-bl-md'
                        }`}>
                          {message.messageType === 'image' && message.fileUrl ? (
                            <div className="mb-2">
                              <img
                                src={message.fileUrl}
                                alt={message.fileName}
                                className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                                loading="lazy"
                              />
                              {message.content && <p className="mt-2 text-sm">{message.content}</p>}
                            </div>
                          ) : message.messageType === 'gif' && message.fileUrl ? (
                            <img
                              src={message.fileUrl}
                              alt="GIF"
                              className="max-w-xs rounded-xl"
                              loading="lazy"
                            />
                          ) : message.messageType === 'file' && message.fileUrl ? (
                            <a
                              href={message.fileUrl}
                              download={message.fileName}
                              className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
                            >
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm underline">{message.fileName}</span>
                            </a>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content.split(/(@\w+)/g).map((part, i) =>
                                part.startsWith('@') ? (
                                  <span key={i} className="bg-blue-400/30 text-blue-200 px-1 rounded font-medium">
                                    {part}
                                  </span>
                                ) : part
                              )}
                            </p>
                          )}
                        </div>

                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className={`flex gap-1 mt-2 ${isOwn ? 'justify-end' : ''}`}>
                            {message.reactions.map((reaction, i) => (
                              <button
                                key={i}
                                onClick={() => addReaction(message.id, reaction.emoji)}
                                className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 px-2 py-1 rounded-full text-sm transition-colors"
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-slate-400 text-xs">{reaction.users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Message Actions */}
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                          {['👍', '❤️', '😂', '🎉'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(message.id, emoji)}
                              className="p-1.5 hover:bg-slate-700/50 rounded-lg text-sm transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            onClick={() => setReplyTo(message)}
                            className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
              {/* Reply Preview */}
              {replyTo && (
                <div className="mb-3 flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3 border-l-4 border-blue-500">
                  <div>
                    <p className="text-xs text-blue-400 font-medium">Replying to {replyTo.username}</p>
                    <p className="text-sm text-slate-300 truncate max-w-md">{replyTo.content}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-3">
                {/* Attachment Buttons */}
                <div className="flex gap-1">
                  <div className="relative">
                    {showEmojiPicker && <EmojiPicker onSelect={(e) => setNewMessage(prev => prev + e)} onClose={() => setShowEmojiPicker(false)} />}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false) }}
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl"
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="relative">
                    {showGifPicker && <GifPicker onSelect={(url) => sendMessage(url, 'gif')} onClose={() => setShowGifPicker(false)} />}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false) }}
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl"
                    >
                      <span className="text-sm font-bold">GIF</span>
                    </Button>
                  </div>

                  <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl"
                  >
                    <Image className="w-5 h-5" />
                  </Button>

                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.dwg,.txt" onChange={(e) => handleFileUpload(e, 'file')} />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </div>

                {/* Message Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message... Use @ to mention someone"
                    rows={1}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none min-h-[48px] max-h-[120px]"
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                    }}
                  />
                </div>

                {/* Send Button */}
                <Button
                  onClick={() => sendMessage()}
                  disabled={!newMessage.trim() || !isConnected || isUploading}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl px-5 py-3 h-12 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-500">{isConnected ? 'Connected' : 'Reconnecting...'}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
              <p className="text-slate-400">Choose a channel or start a direct message</p>
            </div>
          </div>
        )}
      </div>

      {/* Users Sidebar with Call Buttons */}
      {showUserList && currentRoom && (
        <div className="w-72 bg-slate-900/80 backdrop-blur-xl border-l border-slate-700/50 p-4">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Members ({users.filter(u => u.isOnline).length} online)
          </h4>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(user.status || (user.isOnline ? 'online' : 'offline'))}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className={`text-xs ${user.isOnline ? getStatusInfo(user.status || 'online').textColor : 'text-slate-500'}`}>
                    {user.isOnline ? getStatusInfo(user.status || 'online').label : user.lastSeen || 'Offline'}
                  </p>
                </div>
                {/* Call buttons - show on hover if user is online and not yourself */}
                {user.isOnline && user.name !== currentUserName && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartVideoCallToUser(user)}
                      className="h-7 w-7 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                      title={`Video call ${user.name}`}
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartVideoCallToUser(user)}
                      className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                      title={`Voice call ${user.name}`}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hint for calling */}
          <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400">
              💡 Hover over an online user to see call options
            </p>
          </div>
        </div>
      )}

      {/* Video Call Components */}
      <VideoCallWindow
        callState={videoChat.callState}
        onEndCall={videoChat.endCall}
        onToggleAudio={videoChat.toggleAudio}
        onToggleVideo={videoChat.toggleVideo}
        isAudioEnabled={videoChat.isAudioEnabled}
        isVideoEnabled={videoChat.isVideoEnabled}
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
        onClose={() => { setShowPermissionModal(false); setTargetCallUser(null); }}
        onRequestPermissions={async () => {
          try {
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setShowPermissionModal(false)
            // If there was a targeted user, call them; otherwise call the room
            if (targetCallUser) {
              videoChat.startCall(targetCallUser.name)
              setTargetCallUser(null)
            } else {
              handleStartVideoCall()
            }
          } catch (e) {
            console.error('Permission denied:', e)
            setTargetCallUser(null)
          }
        }}
      />
    </div>
  )
}

export default function TeamChat({ projectId }: { projectId?: number }) {
  return (
    <ChatErrorWrapper>
      <TeamChatContent projectId={projectId} />
    </ChatErrorWrapper>
  )
}

