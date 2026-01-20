import React, { useState } from 'react'
import { X, Type, Plus } from 'lucide-react'

interface TextDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddText: (text: TextObject) => void
}

export interface TextObject {
  id: string
  content: string
  position: [number, number, number]
  fontSize: number
  color: string
  fontFamily: 'Arial' | 'Courier' | 'Times' | 'Verdana'
  bold: boolean
  italic: boolean
  rotation: [number, number, number]
}

export default function TextDialog({ isOpen, onClose, onAddText }: TextDialogProps) {
  const [textContent, setTextContent] = useState('')
  const [fontSize, setFontSize] = useState(1)
  const [color, setColor] = useState('#000000')
  const [fontFamily, setFontFamily] = useState<'Arial' | 'Courier' | 'Times' | 'Verdana'>('Arial')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [posX, setPosX] = useState(0)
  const [posY, setPosY] = useState(0)
  const [posZ, setPosZ] = useState(0)

  const handleAddText = () => {
    if (!textContent.trim()) {
      alert('Please enter text content')
      return
    }

    const textObject: TextObject = {
      id: `text-${Date.now()}`,
      content: textContent,
      position: [posX, posY, posZ],
      fontSize,
      color,
      fontFamily,
      bold,
      italic,
      rotation: [0, 0, 0]
    }

    onAddText(textObject)
    
    // Reset form
    setTextContent('')
    setFontSize(1)
    setColor('#000000')
    setFontFamily('Arial')
    setBold(false)
    setItalic(false)
    setPosX(0)
    setPosY(0)
    setPosZ(0)
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[20000]">
      <div className="bg-white rounded-lg shadow-2xl w-[600px] max-h-[90vh] overflow-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Type className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">Add Text to Scene</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Text Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Content
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>

          {/* Font Settings */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Arial">Arial</option>
                <option value="Courier">Courier</option>
                <option value="Times">Times New Roman</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size ({fontSize.toFixed(2)}m)
              </label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={fontSize}
                onChange={(e) => setFontSize(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Text Styling */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bold}
                onChange={(e) => setBold(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Bold</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={italic}
                onChange={(e) => setItalic(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Italic</span>
            </label>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Position (X, Y, Z)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">X</label>
                <input
                  type="number"
                  value={posX}
                  onChange={(e) => setPosX(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Y</label>
                <input
                  type="number"
                  value={posY}
                  onChange={(e) => setPosY(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Z</label>
                <input
                  type="number"
                  value={posZ}
                  onChange={(e) => setPosZ(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Preview</h4>
            <div
              style={{
                fontFamily: fontFamily,
                fontSize: `${Math.min(fontSize * 10, 32)}px`,
                fontWeight: bold ? 'bold' : 'normal',
                fontStyle: italic ? 'italic' : 'normal',
                color: color,
                wordWrap: 'break-word'
              }}
              className="p-3 bg-white border border-gray-300 rounded min-h-[60px]"
            >
              {textContent || 'Text preview...'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddText}
            disabled={!textContent.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Text
          </button>
        </div>
      </div>
    </div>
  )
}

