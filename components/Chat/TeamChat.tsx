'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  status?: 'online' | 'away' | 'busy' | 'offline'
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
  const [currentUserName] = useState('User')
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  // Load rooms and users
  useEffect(() => {
    loadChatRooms()
    loadUsers()
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
    }
  }, [currentRoom])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChatRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms')
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
        if (data.length > 0 && !currentRoom) {
          setCurrentRoom(data[0].id)
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

  const connectToRoom = async (roomId: number) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    try {
      const eventSource = new EventSource(`/api/chat/messages?roomId=${roomId}&stream=true`)
      eventSource.onopen = () => setIsConnected(true)
      eventSource.onmessage = (event) => {
        try {
          const newMsg = JSON.parse(event.data)
          if (newMsg.messageType !== 'video_call_signal') {
            setMessages(prev => [...prev, newMsg])
          }
        } catch (e) {
          console.error('Error parsing message:', e)
        }
      }
      eventSource.onerror = () => setIsConnected(false)
      eventSourceRef.current = eventSource
    } catch (error) {
      console.error('Error connecting to room:', error)
    }
  }

  const loadMessages = async (roomId: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`)
      if (response.ok) {
        const data = await response.json()
        // Filter out video call signals (they have a different messageType from the API)
        setMessages(data.filter((m: any) => m.messageType !== 'video_call_signal'))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (content?: string, messageType: string = 'text') => {
    const messageContent = content || newMessage.trim()
    if (!messageContent || !currentRoom) return

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom,
          content: messageContent,
          messageType,
          replyToId: replyTo?.id
        })
      })

      if (response.ok) {
        if (!content) setNewMessage('')
        setReplyTo(null)
      }
    } catch (error) {
      console.error('Error sending message:', error)
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
    if (!file || !currentRoom) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('roomId', currentRoom.toString())

      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        await sendMessage(file.name, type === 'image' ? 'image' : 'file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
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

        {/* User Profile */}
        <div className="p-3 border-t border-slate-700/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                {currentUserName[0]?.toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 bg-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{currentUserName}</p>
              <p className="text-xs text-green-400">Online</p>
            </div>
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
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

      {/* Users Sidebar */}
      {showUserList && currentRoom && (
        <div className="w-64 bg-slate-900/80 backdrop-blur-xl border-l border-slate-700/50 p-4">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Members</h4>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(user.status || (user.isOnline ? 'online' : 'offline'))}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.isOnline ? 'Active now' : user.lastSeen || 'Offline'}</p>
                </div>
              </div>
            ))}
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
        onClose={() => setShowPermissionModal(false)}
        onRequestPermissions={async () => {
          try {
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setShowPermissionModal(false)
            handleStartVideoCall()
          } catch (e) {
            console.error('Permission denied:', e)
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

