"use client"

import React, { useState, useEffect } from "react"
import { X, Keyboard } from "lucide-react"

const shortcuts = [
  { category: "Transform", items: [
    { key: "G / W", action: "Move mode" },
    { key: "R / E", action: "Rotate mode" },
    { key: "S", action: "Scale mode" },
    { key: "Q", action: "Select mode" },
  ]},
  { category: "Selection", items: [
    { key: "1", action: "Object selection" },
    { key: "2", action: "Face selection" },
    { key: "3", action: "Vertex selection" },
    { key: "4", action: "Edge selection" },
    { key: "Ctrl+A", action: "Select all" },
    { key: "Escape", action: "Deselect" },
  ]},
  { category: "Edit", items: [
    { key: "Delete / X", action: "Delete selected" },
    { key: "Ctrl+D", action: "Duplicate" },
    { key: "Shift+D", action: "Duplicate (alt)" },
    { key: "Ctrl+Z", action: "Undo" },
    { key: "Ctrl+Y", action: "Redo" },
  ]},
  { category: "View", items: [
    { key: "H", action: "Hide selected" },
    { key: "Alt+H", action: "Unhide all" },
    { key: "F", action: "Frame selected" },
    { key: "Shift+G", action: "Toggle grid" },
    { key: "Shift+S", action: "Toggle snap" },
  ]},
  { category: "File", items: [
    { key: "Ctrl+S", action: "Save project" },
    { key: "Shift+A", action: "Add menu" },
  ]},
]

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts panel with ? or F1
      if (e.key === "?" || e.key === "F1") {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 right-4 p-2 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 z-20"
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard className="w-4 h-4 text-gray-400" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <span className="text-base font-semibold text-gray-100">Keyboard Shortcuts</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          <div className="grid grid-cols-2 gap-4">
            {shortcuts.map((section) => (
              <div key={section.category} className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wide">{section.category}</h3>
                <div className="space-y-1.5">
                  {section.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{item.action}</span>
                      <kbd className="px-2 py-0.5 bg-gray-700 rounded text-gray-200 font-mono text-[10px] border border-gray-600">{item.key}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono text-[10px] border border-gray-600">?</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono text-[10px] border border-gray-600">F1</kbd> to toggle this panel
          </div>
        </div>
      </div>
    </div>
  )
}

