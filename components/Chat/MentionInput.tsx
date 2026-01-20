'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface User {
  id: number
  name: string
  email: string
  isOnline: boolean
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
  users: User[]
}

export default function MentionInput({ 
  value, 
  onChange, 
  onSend, 
  placeholder = "Type a message...",
  users = []
}: MentionInputProps) {
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState(0)
  const [selectedMention, setSelectedMention] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const handleInput = () => {
      const cursorPosition = textarea.selectionStart
      const textBeforeCursor = value.substring(0, cursorPosition)
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

      if (mentionMatch) {
        setShowMentions(true)
        setMentionQuery(mentionMatch[1])
        setMentionPosition(cursorPosition - mentionMatch[0].length)
        setSelectedMention(0)
      } else {
        setShowMentions(false)
      }
    }

    textarea.addEventListener('input', handleInput)
    textarea.addEventListener('selectionchange', handleInput)

    return () => {
      textarea.removeEventListener('input', handleInput)
      textarea.removeEventListener('selectionchange', handleInput)
    }
  }, [value])

  const insertMention = (user: User) => {
    const beforeMention = value.substring(0, mentionPosition)
    const afterCursor = value.substring(textareaRef.current?.selectionStart || 0)
    const newValue = `${beforeMention}@${user.name} ${afterCursor}`
    
    onChange(newValue)
    setShowMentions(false)
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus()
      const newPosition = beforeMention.length + user.name.length + 2
      textareaRef.current?.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedMention(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedMention(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        )
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(filteredUsers[selectedMention])
      } else if (e.key === 'Escape') {
        setShowMentions(false)
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="relative">
      {/* Mention Dropdown */}
      {showMentions && filteredUsers.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              onClick={() => insertMention(user)}
              className={`w-full text-left p-3 hover:bg-slate-600 transition-colors ${
                index === selectedMention ? 'bg-slate-600' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                  {user.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{user.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">{user.email}</span>
                    {user.isOnline && (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
        >
          Send
        </Button>
      </div>

      {/* Mention Help */}
      {showMentions && filteredUsers.length === 0 && mentionQuery && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-700 border border-slate-600 rounded-lg p-3 text-slate-400 text-sm">
          No users found matching "@{mentionQuery}"
        </div>
      )}
    </div>
  )
}
