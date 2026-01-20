'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'

interface Message {
  id: number
  content: string
  username: string
  created_at: string
  messageType: string
}

interface MessageSearchProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
  onMessageSelect: (messageId: number) => void
}

export default function MessageSearch({ isOpen, onClose, roomId, onMessageSelect }: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Message[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentResult, setCurrentResult] = useState(0)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const searchMessages = async () => {
      setIsSearching(true)
      try {
        const response = await fetch(`/api/chat/search?roomId=${roomId}&query=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        
        if (data.messages) {
          setSearchResults(data.messages)
          setCurrentResult(0)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchMessages, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, roomId])

  const navigateResults = (direction: 'up' | 'down') => {
    if (searchResults.length === 0) return

    let newIndex
    if (direction === 'up') {
      newIndex = currentResult > 0 ? currentResult - 1 : searchResults.length - 1
    } else {
      newIndex = currentResult < searchResults.length - 1 ? currentResult + 1 : 0
    }

    setCurrentResult(newIndex)
    onMessageSelect(searchResults[newIndex].id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        navigateResults('up')
      } else {
        navigateResults('down')
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-0 left-0 right-0 bg-slate-800 border-b border-slate-600 p-4 z-10">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search messages..."
            className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        </div>

        {searchResults.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">
              {currentResult + 1} of {searchResults.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateResults('up')}
              className="text-slate-400 hover:text-white p-1"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateResults('down')}
              className="text-slate-400 hover:text-white p-1"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {isSearching && (
        <div className="mt-2 text-slate-400 text-sm">Searching...</div>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="mt-2 text-slate-400 text-sm">No messages found</div>
      )}

      {searchResults.length > 0 && (
        <div className="mt-3 max-h-40 overflow-y-auto">
          {searchResults.map((message, index) => (
            <button
              key={message.id}
              onClick={() => {
                setCurrentResult(index)
                onMessageSelect(message.id)
              }}
              className={`w-full text-left p-2 rounded mb-1 transition-colors ${
                index === currentResult 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{message.username}</span>
                <span className="text-xs opacity-75">
                  {new Date(message.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm truncate mt-1">
                {message.content.replace(new RegExp(`(${searchQuery})`, 'gi'), '**$1**')}
              </p>
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 text-slate-500 text-xs">
        Press Enter to navigate results, Shift+Enter to go backwards, Esc to close
      </div>
    </div>
  )
}
