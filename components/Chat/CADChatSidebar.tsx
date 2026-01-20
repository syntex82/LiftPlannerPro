'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react'
import TeamChat from './TeamChat'

export default function CADChatSidebar({ projectId }: { projectId?: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/25 z-50 transition-all hover:scale-105"
        title="Open Team Chat"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    )
  }

  const sidebarWidth = isExpanded ? 'w-[800px]' : 'w-[450px]'
  const sidebarHeight = isMinimized ? 'h-14' : 'bottom-4 top-4'

  return (
    <div className={`fixed right-4 ${sidebarHeight} ${sidebarWidth} z-50 transition-all duration-300`}>
      {isMinimized ? (
        // Minimized bar
        <div className="h-14 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-medium">Team Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Full chat window
        <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">Team Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <TeamChat projectId={projectId} />
          </div>
        </div>
      )}
    </div>
  )
}
