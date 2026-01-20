"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Terminal } from "lucide-react"

interface CommandLineInterfaceProps {
  isOpen: boolean
  onClose: () => void
  onCommand: (command: string) => void
}

const AVAILABLE_COMMANDS = [
  { name: 'line', description: 'Draw a line' },
  { name: 'rect', description: 'Draw a rectangle' },
  { name: 'circle', description: 'Draw a circle' },
  { name: 'mirror', description: 'Mirror selected elements' },
  { name: 'array', description: 'Create array of elements' },
  { name: 'offset', description: 'Offset selected elements' },
  { name: 'measure', description: 'Measure distance' },
  { name: 'area', description: 'Calculate area' },
  { name: 'undo', description: 'Undo last action' },
  { name: 'redo', description: 'Redo last action' },
  { name: 'zoom in', description: 'Zoom in' },
  { name: 'zoom out', description: 'Zoom out' },
  { name: 'pan', description: 'Pan view' },
  { name: 'select all', description: 'Select all elements' },
  { name: 'deselect', description: 'Deselect all' },
  { name: 'delete', description: 'Delete selected elements' },
  { name: 'help', description: 'Show help' },
]

export default function CommandLineInterface({
  isOpen,
  onClose,
  onCommand,
}: CommandLineInterfaceProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<typeof AVAILABLE_COMMANDS>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (input.trim() === '') {
      setSuggestions([])
      return
    }

    const filtered = AVAILABLE_COMMANDS.filter(cmd =>
      cmd.name.toLowerCase().includes(input.toLowerCase())
    )
    setSuggestions(filtered.slice(0, 5))
  }, [input])

  const handleCommand = (command: string) => {
    const trimmed = command.trim()
    if (trimmed === '') return

    setHistory([...history, trimmed])
    setHistoryIndex(-1)
    onCommand(trimmed)
    setInput('')
    setSuggestions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(newIndex)
      if (newIndex >= 0) {
        setInput(history[history.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      if (newIndex >= 0) {
        setInput(history[history.length - 1 - newIndex])
      } else {
        setInput('')
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <Card className="w-full bg-slate-900 border-slate-700 rounded-none border-t">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-semibold text-white">Command Line</h3>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Input */}
          <div className="relative">
            <div className="flex items-center space-x-2">
              <span className="text-green-400 font-mono text-sm">{'>'}</span>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-slate-800 border-slate-600 text-white font-mono text-sm h-8"
                placeholder="Enter command..."
              />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded shadow-lg z-10">
                {suggestions.map((cmd, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setInput(cmd.name)
                      inputRef.current?.focus()
                    }}
                    className="px-3 py-2 hover:bg-slate-700 cursor-pointer text-xs text-slate-300 border-b border-slate-700 last:border-b-0"
                  >
                    <div className="font-mono text-green-400">{cmd.name}</div>
                    <div className="text-slate-500">{cmd.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="text-xs text-slate-400 space-y-1">
            <div>Type a command and press Enter. Use ↑↓ for history, Esc to close.</div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COMMANDS.slice(0, 8).map((cmd) => (
                <span
                  key={cmd.name}
                  className="px-2 py-1 bg-slate-800 rounded font-mono text-green-400 cursor-pointer hover:bg-slate-700"
                  onClick={() => handleCommand(cmd.name)}
                >
                  {cmd.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

