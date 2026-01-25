"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useVideoChat } from '@/hooks/use-video-chat'
import PermissionRequestModal from '@/components/video-chat/permission-request-modal'
import IncomingCallModal from '@/components/video-chat/incoming-call-modal'
import VideoCallWindow from '@/components/video-chat/video-call-window'
import {
  Hash, Users, Video, Phone, Monitor, Settings, Plus, Search, MessageSquare, Send, Smile,
  Paperclip, Image, MoreHorizontal, Reply, X, PhoneOff, Mic, MicOff, VideoOff,
  ChevronDown, CheckCheck, Bell, BellOff, Pin, Star, AtSign, Command, Bold, Italic,
  Code, Link2, ListOrdered, List, Quote, FileText, Download, Eye, Clock, UserPlus,
  MessageCircle, Mail, Briefcase, MapPin, Globe, Calendar, Award, Zap, Coffee, Trash2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Types
interface ChatUser {
  id: number
  dbId?: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  status: 'online' | 'away' | 'busy' | 'offline'
  statusMessage?: string
  lastSeen?: string
  jobTitle?: string
  department?: string
  company?: string
  location?: string
  skills?: string[]
  bio?: string
  phone?: string
  joinedAt?: string
}

interface ChatRoom {
  id: number
  name: string
  description?: string
  type: 'channel' | 'direct' | 'group'
  unread_count: number
  is_private: boolean
  members?: ChatUser[]
  lastMessage?: ChatMessage
  isPinned?: boolean
  isMuted?: boolean
}

interface ChatMessage {
  id: string
  content: string
  username: string
  userId?: string
  roomId: number
  created_at: string
  messageType: 'text' | 'image' | 'file' | 'gif' | 'code' | 'system' | 'video_call_signal'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  replyTo?: string
  replyToMessage?: ChatMessage
  reactions?: { emoji: string; users: string[] }[]
  isEdited?: boolean
  isPinned?: boolean
  mentions?: string[]
  isRead?: boolean
  formatting?: {
    bold?: boolean
    italic?: boolean
    code?: boolean
    quote?: boolean
  }
}

interface DirectConversation {
  id: string
  participants: ChatUser[]
  lastMessage?: ChatMessage
  unreadCount: number
  createdAt: string
}

// Utility functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-500'
    case 'away': return 'bg-yellow-500'
    case 'busy': return 'bg-red-500'
    default: return 'bg-slate-500'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'online': return 'Available'
    case 'away': return 'Away'
    case 'busy': return 'Do Not Disturb'
    default: return 'Offline'
  }
}

const formatTime = (date: string | null | undefined) => {
  // Handle null, undefined, or empty dates
  if (!date) return 'Unknown'

  const d = new Date(date)

  // Check if date is valid
  if (isNaN(d.getTime())) return 'Unknown'

  const now = new Date()
  const diff = now.getTime() - d.getTime()

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diff < 604800000) {
    return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

// Parse markdown-like formatting
const parseMessageFormatting = (content: string) => {
  // Bold: **text** or __text__
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  content = content.replace(/__(.*?)__/g, '<strong>$1</strong>')
  // Italic: *text* or _text_
  content = content.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  content = content.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>')
  // Code: `code`
  content = content.replace(/`([^`]+)`/g, '<code class="bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-300">$1</code>')
  // Strikethrough: ~~text~~
  content = content.replace(/~~(.*?)~~/g, '<del>$1</del>')
  return content
}

export default function ProfessionalTeamChat() {
  const { data: session } = useSession()
  
  // Core state
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [directConversations, setDirectConversations] = useState<DirectConversation[]>([])

  // UI state
  const [currentRoom, setCurrentRoom] = useState<number | null>(null)
  const [currentDM, setCurrentDM] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [showUserList, setShowUserList] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showFormatting, setShowFormatting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([])
  const [showPinnedMessages, setShowPinnedMessages] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'channels' | 'dms' | 'threads'>('channels')

  // Video call state
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [targetCallUser, setTargetCallUser] = useState<ChatUser | null>(null)

  // Create channel state
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)

  // Delete channel state
  const [channelToDelete, setChannelToDelete] = useState<ChatRoom | null>(null)
  const [isDeletingChannel, setIsDeletingChannel] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const videoChatRef = useRef<{ handleWebSocketMessage: (msg: any) => void } | null>(null)

  // Current user
  const currentUserName = session?.user?.name || 'User'
  const currentUserEmail = session?.user?.email || ''

  // Video signal handler for sending via API
  const handleVideoMessage = useCallback(async (message: any) => {
    if (!currentRoom) return
    console.log('📹 handleVideoMessage called with:', message.type)

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom,
          content: JSON.stringify(message),
          messageType: 'video_call_signal'
        })
      })

      if (response.ok) {
        console.log('📹✅ Video signal sent successfully')
      } else {
        console.error('📹❌ Failed to send video signal:', response.status)
      }
    } catch (error) {
      console.error('📹💥 Error sending video signal:', error)
    }
  }, [currentRoom])

  // Video chat hook
  const videoChat = useVideoChat({
    currentUserName,
    onSendMessage: handleVideoMessage
  })

  // Keep videoChatRef updated (so SSE handler can access latest without causing re-renders)
  useEffect(() => {
    videoChatRef.current = {
      handleWebSocketMessage: videoChat.handleWebSocketMessage
    }
  }, [videoChat.handleWebSocketMessage])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      // Ctrl/Cmd + /: Show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        // Show shortcuts modal
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowUserProfile(false)
        setShowEmojiPicker(false)
        setShowMentions(false)
      }
      // Ctrl/Cmd + B: Bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b' && document.activeElement === messageInputRef.current) {
        e.preventDefault()
        insertFormatting('**', '**')
      }
      // Ctrl/Cmd + I: Italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i' && document.activeElement === messageInputRef.current) {
        e.preventDefault()
        insertFormatting('*', '*')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Insert formatting helper
  const insertFormatting = (prefix: string, suffix: string) => {
    const input = messageInputRef.current
    if (!input) return

    const start = input.selectionStart
    const end = input.selectionEnd
    const selectedText = newMessage.substring(start, end)
    const newText = newMessage.substring(0, start) + prefix + selectedText + suffix + newMessage.substring(end)
    setNewMessage(newText)

    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  // Fetch rooms and users
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [roomsRes, usersRes] = await Promise.all([
          fetch('/api/chat/rooms'),
          fetch('/api/chat/users')
        ])

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json()
          setRooms(roomsData)
          if (roomsData.length > 0 && !currentRoom) {
            setCurrentRoom(roomsData[0].id)
          }
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData)
        }
      } catch (error) {
        console.error('Failed to fetch chat data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch messages when room changes
  useEffect(() => {
    if (!currentRoom) return

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?roomId=${currentRoom}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      }
    }

    fetchMessages()

    // Set up SSE for real-time updates
    console.log(`🔌 Connecting to room ${currentRoom}...`)
    const eventSource = new EventSource(`/api/chat/messages?roomId=${currentRoom}&stream=true`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('✅ SSE connected')
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 SSE message received:', data.type)

        if (data.type === 'new_message') {
          const message = data.message
          console.log('📨 Message type:', message.messageType, 'from:', message.username)

          // Handle video call signals
          if (message.messageType === 'video_call_signal') {
            console.log('📹📨 Video signal received! From:', message.username, 'Current user:', currentUserName)

            // Skip our own messages - we sent them, don't process them
            if (message.username === currentUserName) {
              console.log('📹 Skipping own video signal')
              return
            }

            if (!message.content) {
              console.error('📹❌ Video signal has no content')
              return
            }

            try {
              const parsedContent = JSON.parse(message.content)
              console.log('📹⬅️ Raw video signal content:', JSON.stringify(parsedContent, null, 2))

              let signalData = parsedContent

              // Unwrap if it's the wrapper format
              if (parsedContent.type === 'video_call_signal' && parsedContent.data) {
                signalData = parsedContent.data
                console.log('📹 Unwrapped inner data:', JSON.stringify(signalData, null, 2))
              }

              // Replace 'local' with actual sender username from the SSE message
              if (signalData.from === 'local' || !signalData.from) {
                signalData.from = message.username
                console.log('📹 Replaced from field with:', message.username)
              }

              console.log('📹🔔 CALLING handleWebSocketMessage with signal type:', signalData.type, 'from:', signalData.from)
              console.log('📹🔍 videoChatRef.current exists:', !!videoChatRef.current)

              // Use ref to avoid videoChat in dependency array (causes infinite loop)
              if (videoChatRef.current?.handleWebSocketMessage) {
                console.log('📹▶️ Calling handleWebSocketMessage NOW')
                videoChatRef.current.handleWebSocketMessage({
                  type: 'video_call_signal',
                  data: signalData
                })
                console.log('📹✅ handleWebSocketMessage called successfully')
              } else {
                console.error('📹💀 videoChatRef.current or handleWebSocketMessage is NULL!')
              }
            } catch (error) {
              console.error('📹❌ Error parsing video signal:', error)
            }
          } else {
            // Regular message
            console.log('💬 Adding message to chat:', message.content?.substring(0, 30))
            setMessages(prev => [...prev, message])
          }
        } else if (data.type === 'connected') {
          console.log('✅ SSE connection confirmed for room')
        } else if (data.type === 'typing') {
          setTypingUsers(data.users)
        }
      } catch (e) {
        console.error('❌ Error parsing SSE message:', e)
      }
    }

    eventSource.onerror = (error) => {
      console.log('⚠️ SSE error, will reconnect...', error)
      setIsConnected(false)
      eventSource.close()
      eventSourceRef.current = null
    }

    return () => {
      console.log('🔌 Closing SSE connection')
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [currentRoom, currentUserName])

  // Poll for video signals (SSE broadcast doesn't work reliably in serverless)
  useEffect(() => {
    if (!currentRoom || !currentUserName) return

    // Start polling from now
    let lastCheckedTimestamp = Date.now()
    // Track processed message IDs to avoid duplicates
    const processedIds = new Set<string>()

    const pollForVideoSignals = async () => {
      try {
        const res = await fetch(`/api/chat/messages?roomId=${currentRoom}&since=${lastCheckedTimestamp}`)
        if (res.ok) {
          const messages = await res.json()
          for (const message of messages) {
            // Skip if already processed
            if (processedIds.has(message.id)) continue
            processedIds.add(message.id)

            // Update timestamp for next poll
            if (message.timestamp && message.timestamp > lastCheckedTimestamp) {
              lastCheckedTimestamp = message.timestamp
            }

            // Only process video signals from others
            if (message.messageType === 'video_call_signal' && message.username !== currentUserName) {
              console.log('📹🔄 POLL: Found video signal from:', message.username)

              if (!message.content) {
                console.error('📹❌ POLL: Video signal has no content')
                return
              }

              try {
                const parsedContent = JSON.parse(message.content)
                let signalData = parsedContent

                // Unwrap if needed
                if (parsedContent.type === 'video_call_signal' && parsedContent.data) {
                  signalData = parsedContent.data
                }

                // Fix the from field
                if (signalData.from === 'local' || !signalData.from) {
                  signalData.from = message.username
                }

                console.log('📹🔄 POLL: Processing signal type:', signalData.type, 'from:', signalData.from)

                if (videoChatRef.current?.handleWebSocketMessage) {
                  videoChatRef.current.handleWebSocketMessage({
                    type: 'video_call_signal',
                    data: signalData
                  })
                  console.log('📹✅ POLL: handleWebSocketMessage called!')
                }
              } catch (e) {
                console.error('📹❌ POLL: Error parsing video signal:', e)
              }
            }
          }
        }
      } catch (error) {
        console.error('📹 POLL error:', error)
      }
    }

    // Poll every 500ms for video signals (needs to be fast for calls)
    const pollInterval = setInterval(pollForVideoSignals, 500)

    return () => {
      clearInterval(pollInterval)
    }
  }, [currentRoom, currentUserName])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const sendMessage = async (content?: string, messageType: 'text' | 'image' | 'file' | 'gif' | 'code' = 'text') => {
    const messageContent = content || newMessage.trim()
    if (!messageContent || !currentRoom) return

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom,
          content: messageContent,
          messageType,
          replyTo: replyTo?.id
        })
      })

      if (res.ok) {
        // Clear input immediately - SSE will provide the message
        // Don't add message locally as SSE broadcast will deliver it
        setNewMessage('')
        setReplyTo(null)
        setShowEmojiPicker(false)
      } else {
        const error = await res.json()
        console.error('Failed to send message:', error)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }

    // Detect @ mentions
    if (e.key === '@' || (newMessage.endsWith('@') && e.key !== 'Backspace')) {
      setShowMentions(true)
      setMentionFilter('')
    }
  }

  // Handle mention input
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNewMessage(value)

    // Check for @mentions
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1)
      if (!afterAt.includes(' ')) {
        setShowMentions(true)
        setMentionFilter(afterAt)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  // Insert mention
  const insertMention = (user: ChatUser) => {
    if (!user || !user.name) return
    const lastAtIndex = newMessage.lastIndexOf('@')
    const beforeAt = newMessage.substring(0, lastAtIndex)
    setNewMessage(beforeAt + `@${user.name} `)
    setShowMentions(false)
    messageInputRef.current?.focus()
  }

  // Open user profile
  const openUserProfile = (user: ChatUser) => {
    setSelectedUser(user)
    setShowUserProfile(true)
  }

  // Start direct message - send a message mentioning the user
  const startDirectMessage = async (user: ChatUser) => {
    if (!user || !user.name) return
    setShowUserProfile(false)
    // For now, insert their name in the message box to start a conversation
    setNewMessage(`@${user.name} `)
    messageInputRef.current?.focus()
  }

  // Start a video call to the current room
  const handleStartVideoCall = async () => {
    console.log('📹🚀 Starting video call...')

    if (!currentRoom) {
      alert('Please select a chat room first')
      return
    }

    if (!isConnected) {
      alert('Chat is not connected. Please wait for the connection to be established.')
      return
    }

    const support = await (await import('@/components/video-chat/webrtc-manager')).WebRTCManager.checkSupport()
    console.log('📹 WebRTC support check:', support)

    if (!support.supported) {
      alert(`Video calling not available: ${support.error}`)
      return
    }
    if (support.needsPermission) {
      console.log('📹 Showing permission modal')
      setShowPermissionModal(true)
      return
    }
    const room = rooms.find(r => r.id === currentRoom)
    console.log('📹 Starting call to room:', room?.name || 'Team')
    videoChat.startCall(room?.name || 'Team')
  }

  // Start a video call to a specific user
  const handleStartVideoCallToUser = async (user: ChatUser) => {
    if (!user || !user.name) {
      console.error('📹❌ Cannot start call: user or user.name is undefined')
      return
    }
    console.log('📹🚀 Starting video call to user:', user.name)

    if (!user.isOnline) {
      alert(`${user.name} is currently offline and cannot receive calls.`)
      return
    }

    if (!currentRoom) {
      alert('Please select a chat room first')
      return
    }

    if (!isConnected) {
      alert('Chat is not connected. Please wait for the connection to be established.')
      return
    }

    const support = await (await import('@/components/video-chat/webrtc-manager')).WebRTCManager.checkSupport()
    console.log('📹 WebRTC support check:', support)

    if (!support.supported) {
      alert(`Video calling not available: ${support.error}`)
      return
    }
    if (support.needsPermission) {
      setTargetCallUser(user)
      console.log('📹 Showing permission modal for user call')
      setShowPermissionModal(true)
      return
    }

    console.log('📹 Starting call to user:', user.name)
    videoChat.startCall(user.name)
  }

  // Create new channel
  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      alert('Please enter a channel name')
      return
    }

    setIsCreatingChannel(true)
    try {
      const slug = newChannelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChannelName.trim(),
          slug: slug,
          description: newChannelDescription.trim() || `Channel for ${newChannelName}`,
          type: 'PUBLIC',  // Must match GroupType enum: PUBLIC, PRIVATE, or SYSTEM
          category: 'TEAM' // Must match GroupCategory enum
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Channel created:', data)

        // Add to rooms list
        const newRoom: ChatRoom = {
          id: data.id || Date.now(),
          name: newChannelName.trim(),
          type: 'channel',
          unread_count: 0,
          is_private: false
        }
        setRooms(prev => [...prev, newRoom])

        // Close modal and reset
        setShowCreateChannel(false)
        setNewChannelName('')
        setNewChannelDescription('')

        // Switch to the new channel
        setCurrentRoom(newRoom.id)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create channel')
      }
    } catch (error) {
      console.error('Error creating channel:', error)
      alert('Failed to create channel. Please try again.')
    } finally {
      setIsCreatingChannel(false)
    }
  }

  // Delete channel
  const handleDeleteChannel = async () => {
    if (!channelToDelete) return

    setIsDeletingChannel(true)
    try {
      const response = await fetch(`/api/chat/rooms/${channelToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        console.log('✅ Channel deleted:', channelToDelete.name)

        // Remove from rooms list
        setRooms(prev => prev.filter(r => r.id !== channelToDelete.id))

        // If we're in the deleted channel, switch to first available
        if (currentRoom === channelToDelete.id) {
          const remainingRooms = rooms.filter(r => r.id !== channelToDelete.id)
          if (remainingRooms.length > 0) {
            setCurrentRoom(remainingRooms[0].id)
          }
        }

        setChannelToDelete(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete channel')
      }
    } catch (error) {
      console.error('Error deleting channel:', error)
      alert('Failed to delete channel. Please try again.')
    } finally {
      setIsDeletingChannel(false)
    }
  }

  // Filter users for search
  const filteredUsers = useMemo(() => {
    const safeUsers = users.filter(u => u && u.name)
    if (!userSearchQuery) return safeUsers
    return safeUsers.filter(u =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.jobTitle?.toLowerCase().includes(userSearchQuery.toLowerCase())
    )
  }, [users, userSearchQuery])

  // Filter messages for search AND exclude video call signals from display
  const filteredMessages = useMemo(() => {
    // First, filter out video call signals - they should never be displayed
    const displayableMessages = messages.filter(m =>
      m.messageType !== 'video_call_signal' &&
      !m.content?.includes('"type":"video_call_signal"') &&
      !m.content?.includes('"type":"videocallsignal"')
    )

    if (!messageSearchQuery) return displayableMessages
    return displayableMessages.filter(m =>
      m.content?.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
      m.username?.toLowerCase().includes(messageSearchQuery.toLowerCase())
    )
  }, [messages, messageSearchQuery])

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (!searchQuery) return rooms
    return rooms.filter(r =>
      r.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [rooms, searchQuery])

  // Add reaction to message
  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch('/api/chat/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji })
      })
      if (res.ok) {
        // Update local state
        setMessages(prev => prev.map(m => {
          if (m.id === messageId) {
            const reactions = m.reactions || []
            const existing = reactions.find(r => r.emoji === emoji)
            if (existing) {
              if (existing.users.includes(currentUserName)) {
                existing.users = existing.users.filter(u => u !== currentUserName)
              } else {
                existing.users.push(currentUserName)
              }
            } else {
              reactions.push({ emoji, users: [currentUserName] })
            }
            return { ...m, reactions }
          }
          return m
        }))
      }
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  // Professional emoji set
  const professionalEmojis = ['👍', '👏', '🎉', '✅', '❤️', '🔥', '💯', '🚀', '👀', '🤔', '💡', '⭐']

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Left Sidebar - Channels & DMs */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col transition-all duration-300`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold text-white ${sidebarCollapsed ? 'hidden' : ''}`}>
              Conversations
            </h2>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '-rotate-90' : 'rotate-90'}`} />
              </Button>
              {!sidebarCollapsed && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCreateChannel(true)}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Search */}
          {!sidebarCollapsed && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        {!sidebarCollapsed && (
          <div className="flex border-b border-slate-700/50">
            <button
              onClick={() => setActiveTab('channels')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'channels'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Channels
            </button>
            <button
              onClick={() => setActiveTab('dms')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'dms'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setActiveTab('threads')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'threads'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Threads
            </button>
          </div>
        )}

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {activeTab === 'channels' && (
            <>
              <div className={`text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 ${sidebarCollapsed ? 'hidden' : ''}`}>
                Channels
              </div>
              {filteredRooms.filter(r => r.type !== 'direct').map((room) => (
                <TooltipProvider key={room.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                          currentRoom === room.id
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        <button
                          onClick={() => { setCurrentRoom(room.id); setCurrentDM(null) }}
                          className="flex-1 flex items-center gap-3"
                        >
                          <Hash className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          {!sidebarCollapsed && (
                            <span className="flex-1 text-left text-sm font-medium truncate">{room.name || 'Unnamed'}</span>
                          )}
                        </button>
                        {!sidebarCollapsed && (
                          <div className="flex items-center gap-1">
                            {room.unread_count > 0 && (
                              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {room.unread_count}
                              </span>
                            )}
                            {room.isPinned && <Pin className="w-3 h-3 text-yellow-400" />}
                            {room.isMuted && <BellOff className="w-3 h-3 text-slate-500" />}
                            {/* Only show delete for non-default channels (ID > 5) */}
                            {room.id > 5 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setChannelToDelete(room) }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                title="Delete channel"
                              >
                                <Trash2 className="w-3 h-3 text-red-400 hover:text-red-300" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    {sidebarCollapsed && (
                      <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                        {room.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </>
          )}

          {activeTab === 'dms' && (
            <>
              <div className={`text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 ${sidebarCollapsed ? 'hidden' : ''}`}>
                Direct Messages
              </div>
              {filteredUsers.slice(0, 10).map((user) => (
                <button
                  key={user.id}
                  onClick={() => openUserProfile(user)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {(user.name || 'U')[0]?.toUpperCase() || '?'}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(user.status)}`} />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">{user.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.statusMessage || getStatusLabel(user.status)}</p>
                    </div>
                  )}
                </button>
              ))}
            </>
          )}

          {activeTab === 'threads' && (
            <div className={`text-center py-8 ${sidebarCollapsed ? 'hidden' : ''}`}>
              <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No active threads</p>
              <p className="text-slate-500 text-xs mt-1">Reply to messages to create threads</p>
            </div>
          )}
        </div>

        {/* Current User Status */}
        <div className="p-3 border-t border-slate-700/50">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                {(currentUserName || 'U')[0]?.toUpperCase() || '?'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 bg-green-500" />
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{currentUserName}</p>
                  <p className="text-xs text-green-400">Online</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                    <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Set as Available
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Set as Away
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Do Not Disturb
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                      <Coffee className="w-4 h-4 mr-2" />
                      Set Status Message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm flex-shrink-0">
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

                {/* Header Actions */}
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowSearch(!showSearch)}
                          className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl"
                        >
                          <Search className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">
                        Search messages (⌘K)
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    size="sm"
                    onClick={handleStartVideoCall}
                    className={`rounded-xl gap-2 ${
                      videoChat.callState.isInCall
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-slate-700/50 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {videoChat.callState.isInCall ? (
                      <>
                        <PhoneOff className="w-4 h-4" />
                        <span className="hidden sm:inline">End</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        <span className="hidden sm:inline">Video</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleStartVideoCall}
                    className="bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">Call</span>
                  </Button>

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

              {/* Search Bar */}
              {showSearch && (
                <div className="mt-3 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search in this channel..."
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    onClick={() => { setShowSearch(false); setMessageSearchQuery('') }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {messageSearchQuery ? 'No messages found' : 'No messages yet'}
                  </h3>
                  <p className="text-slate-400 text-sm max-w-xs">
                    {messageSearchQuery ? 'Try a different search term' : 'Start the conversation by sending a message below'}
                  </p>
                </div>
              ) : (
                filteredMessages.map((message, index) => {
                  const isOwn = message.username === currentUserName
                  const showAvatar = index === 0 || filteredMessages[index - 1].username !== message.username
                  const messageUser = users.find(u => u.name === message.username)

                  return (
                    <div key={message.id} className={`group flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {/* Clickable Avatar */}
                      {showAvatar ? (
                        <button
                          onClick={() => messageUser && openUserProfile(messageUser)}
                          className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            isOwn
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                              : 'bg-gradient-to-br from-purple-500 to-pink-500'
                          }`}>
                            {message.username?.[0]?.toUpperCase() || '?'}
                          </div>
                        </button>
                      ) : (
                        <div className="w-10" />
                      )}

                      {/* Message Content */}
                      <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        {showAvatar && (
                          <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <button
                              onClick={() => messageUser && openUserProfile(messageUser)}
                              className="text-sm font-semibold text-white hover:text-blue-400 transition-colors cursor-pointer"
                            >
                              {message.username || 'Unknown'}
                            </button>
                            {messageUser?.jobTitle && (
                              <Badge variant="secondary" className="bg-slate-700/50 text-slate-400 text-xs px-1.5 py-0">
                                {messageUser.jobTitle}
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500">{formatTime(message.created_at)}</span>
                            {message.isEdited && (
                              <span className="text-xs text-slate-500">(edited)</span>
                            )}
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
                            </div>
                          ) : message.messageType === 'file' && message.fileUrl ? (
                            <a
                              href={message.fileUrl}
                              download={message.fileName}
                              className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{message.fileName}</p>
                                {message.fileSize && (
                                  <p className="text-xs text-slate-400">{formatFileSize(message.fileSize)}</p>
                                )}
                              </div>
                              <Download className="w-5 h-5 text-slate-400" />
                            </a>
                          ) : message.messageType === 'code' ? (
                            <pre className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                              <code className="text-sm text-green-400 font-mono">{message.content || ''}</code>
                            </pre>
                          ) : (
                            <p
                              className="text-sm leading-relaxed whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{
                                __html: parseMessageFormatting(
                                  (message.content || '').split(/(@\w+)/g).map((part, i) =>
                                    part.startsWith('@')
                                      ? `<span class="bg-blue-400/30 text-blue-200 px-1 rounded font-medium cursor-pointer hover:underline">${part}</span>`
                                      : part
                                  ).join('')
                                )
                              }}
                            />
                          )}
                        </div>

                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className={`flex flex-wrap gap-1 mt-2 ${isOwn ? 'justify-end' : ''}`}>
                            {message.reactions.filter(r => r.users.length > 0).map((reaction, i) => (
                              <button
                                key={i}
                                onClick={() => addReaction(message.id, reaction.emoji)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
                                  reaction.users.includes(currentUserName)
                                    ? 'bg-blue-500/30 border border-blue-500/50'
                                    : 'bg-slate-800/80 hover:bg-slate-700'
                                }`}
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-slate-400 text-xs">{reaction.users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Message Actions */}
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                          {professionalEmojis.slice(0, 6).map((emoji) => (
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                                <Pin className="w-4 h-4 mr-2" /> Pin message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                                <Star className="w-4 h-4 mr-2" /> Save message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" /> Mark unread
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm flex-shrink-0">
              {/* Reply Preview */}
              {replyTo && (
                <div className="mb-3 flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3 border-l-4 border-blue-500">
                  <div>
                    <p className="text-xs text-blue-400 font-medium">Replying to {replyTo.username || 'Unknown'}</p>
                    <p className="text-sm text-slate-300 truncate max-w-md">{replyTo.content || ''}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Formatting Toolbar */}
              {showFormatting && (
                <div className="mb-3 flex items-center gap-1 p-2 bg-slate-800/50 rounded-xl">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => insertFormatting('**', '**')} className="text-slate-400 hover:text-white">
                          <Bold className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">Bold (⌘B)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => insertFormatting('*', '*')} className="text-slate-400 hover:text-white">
                          <Italic className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">Italic (⌘I)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => insertFormatting('`', '`')} className="text-slate-400 hover:text-white">
                          <Code className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">Code</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => insertFormatting('~~', '~~')} className="text-slate-400 hover:text-white">
                          <span className="line-through text-sm">S</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">Strikethrough</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="w-px h-6 bg-slate-700 mx-1" />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => insertFormatting('> ', '')} className="text-slate-400 hover:text-white">
                          <Quote className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">Quote</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => insertFormatting('```\n', '\n```')} className="text-slate-400 hover:text-white">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">Code Block</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              <div className="flex items-end gap-3">
                {/* Attachment Buttons */}
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowFormatting(!showFormatting)}
                          className={`rounded-xl ${showFormatting ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                        >
                          <Bold className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">Formatting</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-20 left-20 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl z-50">
                      <div className="grid grid-cols-6 gap-2">
                        {professionalEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => { setNewMessage(prev => prev + emoji); setShowEmojiPicker(false) }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-lg text-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <input type="file" ref={imageInputRef} className="hidden" accept="image/*" />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => imageInputRef.current?.click()}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl"
                  >
                    <Image className="w-5 h-5" />
                  </Button>

                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.dwg,.txt,.xlsx,.pptx" />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </div>

                {/* Message Input */}
                <div className="flex-1 relative">
                  {/* Mentions Popup */}
                  {showMentions && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                      {users
                        .filter(u => u && u.name && u.name.toLowerCase().includes(mentionFilter.toLowerCase()))
                        .slice(0, 5)
                        .map((user) => (
                          <button
                            key={user.id}
                            onClick={() => insertMention(user)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                              {user.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium text-white">{user.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-400">{user.jobTitle || user.email || ''}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}

                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message... Use @ to mention, **bold**, *italic*, `code`"
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
                  disabled={!newMessage.trim() || !isConnected}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl px-5 py-3 h-12 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-slate-500">{isConnected ? 'Connected' : 'Reconnecting...'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="hidden sm:inline">⌘K to search</span>
                  <span className="hidden sm:inline">⌘B bold</span>
                  <span className="hidden sm:inline">⌘I italic</span>
                </div>
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

      {/* Right Sidebar - Members */}
      {showUserList && currentRoom && (
        <div className="w-72 flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border-l border-slate-700/50 flex flex-col">
          {/* Member Search */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search members..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Online Members */}
          <div className="flex-1 overflow-y-auto p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Online — {filteredUsers.filter(u => u.isOnline).length}
            </h4>
            <div className="space-y-1 mb-6">
              {filteredUsers.filter(u => u.isOnline).map((user) => (
                <div
                  key={user.id}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <button onClick={() => openUserProfile(user)} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {(user.name || 'U')[0]?.toUpperCase() || '?'}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(user.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">{user.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.statusMessage || user.jobTitle || getStatusLabel(user.status)}</p>
                    </div>
                  </button>
                  {/* Call buttons - show on hover */}
                  {user.name !== currentUserName && (
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

            {/* Offline Members */}
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Offline — {filteredUsers.filter(u => !u.isOnline).length}
            </h4>
            <div className="space-y-1">
              {filteredUsers.filter(u => !u.isOnline).map((user) => (
                <button
                  key={user.id}
                  onClick={() => openUserProfile(user)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group opacity-60 hover:opacity-100"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-sm font-bold">
                      {(user.name || 'U')[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 bg-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors">{user.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500 truncate">{user.lastSeen ? `Last seen ${formatTime(user.lastSeen)}` : 'Offline'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          {selectedUser && (
            <>
              {/* Cover & Avatar */}
              <div className="relative -mx-6 -mt-6 mb-4">
                <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg" />
                <div className="absolute -bottom-8 left-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-slate-900">
                      {(selectedUser.name || 'U')[0]?.toUpperCase() || '?'}
                    </div>
                    <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-slate-900 ${getStatusColor(selectedUser.status)}`} />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                {/* Name & Status */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedUser.name || 'Unknown User'}</h2>
                    <p className="text-sm text-slate-400">{selectedUser.email}</p>
                  </div>
                  <Badge className={`${
                    selectedUser.status === 'online' ? 'bg-green-500/20 text-green-400' :
                    selectedUser.status === 'away' ? 'bg-yellow-500/20 text-yellow-400' :
                    selectedUser.status === 'busy' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {getStatusLabel(selectedUser.status)}
                  </Badge>
                </div>

                {/* Status Message */}
                {selectedUser.statusMessage && (
                  <div className="mb-4 p-3 bg-slate-800/50 rounded-xl">
                    <p className="text-sm text-slate-300 flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-slate-500" />
                      {selectedUser.statusMessage}
                    </p>
                  </div>
                )}

                {/* Professional Info */}
                <div className="space-y-3 mb-6">
                  {selectedUser.jobTitle && (
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <span className="text-white">{selectedUser.jobTitle}</span>
                      {selectedUser.department && (
                        <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                          {selectedUser.department}
                        </Badge>
                      )}
                    </div>
                  )}
                  {selectedUser.company && (
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300">{selectedUser.company}</span>
                    </div>
                  )}
                  {selectedUser.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300">{selectedUser.location}</span>
                    </div>
                  )}
                  {selectedUser.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300">{selectedUser.phone}</span>
                    </div>
                  )}
                  {selectedUser.joinedAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300">Joined {formatTime(selectedUser.joinedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {selectedUser.bio && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">About</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{selectedUser.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => startDirectMessage(selectedUser)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  {selectedUser.isOnline && selectedUser.name !== currentUserName && (
                    <Button
                      onClick={() => { setShowUserProfile(false); handleStartVideoCallToUser(selectedUser); }}
                      className="bg-green-600 hover:bg-green-500 text-white"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Search Modal */}
      <Dialog open={showSearch && !currentRoom} onOpenChange={setShowSearch}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Search</DialogTitle>
            <DialogDescription className="text-slate-400">
              Search messages, channels, and people
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-500 text-center py-8">Start typing to search...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Call Window */}
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

      {/* Incoming Call Modal */}
      <IncomingCallModal
        isVisible={videoChat.incomingCall.isVisible}
        callerName={videoChat.incomingCall.callerName}
        callId={videoChat.incomingCall.callId}
        onAccept={videoChat.acceptCall}
        onReject={videoChat.rejectCall}
      />

      {/* Permission Request Modal */}
      <PermissionRequestModal
        isVisible={showPermissionModal}
        onClose={() => { setShowPermissionModal(false); setTargetCallUser(null); }}
        onRequestPermissions={async () => {
          try {
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setShowPermissionModal(false)
            if (targetCallUser && targetCallUser.name) {
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

      {/* Create Channel Dialog */}
      <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Channel</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new channel for your team to collaborate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Channel Name
              </label>
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g., general, announcements"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Description (Optional)
              </label>
              <textarea
                value={newChannelDescription}
                onChange={(e) => setNewChannelDescription(e.target.value)}
                placeholder="What's this channel about?"
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateChannel(false)
                setNewChannelName('')
                setNewChannelDescription('')
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={isCreatingChannel || !newChannelName.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {isCreatingChannel ? 'Creating...' : 'Create Channel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Channel Confirmation Dialog */}
      <Dialog open={!!channelToDelete} onOpenChange={(open) => !open && setChannelToDelete(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Channel</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete <span className="text-white font-semibold">#{channelToDelete?.name}</span>?
              This action cannot be undone and all messages in this channel will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setChannelToDelete(null)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteChannel}
              disabled={isDeletingChannel}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {isDeletingChannel ? 'Deleting...' : 'Delete Channel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}