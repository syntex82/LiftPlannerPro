'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, X, Minimize2 } from 'lucide-react'
import ChatWindow from './ChatWindow'

export default function CADChatSidebar({ projectId }: { projectId?: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
        title="Open Team Chat"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <div className={`fixed right-4 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 transition-all duration-300 ${
      isMinimized 
        ? 'bottom-4 w-80 h-12' 
        : 'bottom-4 top-4 w-96'
    }`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="text-white font-medium text-sm">
            {projectId ? 'Project Chat' : 'Team Chat'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-400 hover:text-white p-1 h-auto"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <div className="h-full">
          <ChatWindow projectId={projectId} />
        </div>
      )}
    </div>
  )
}
