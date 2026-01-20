"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Settings } from 'lucide-react'

interface DrawingElement {
  id: string
  type: string
  points: Array<{ x: number; y: number }>
  style: {
    stroke: string
    strokeWidth: number
    fill?: string
    fillOpacity?: number
    lineType?: string
    fontSize?: number
    fontFamily?: string
  }
  [key: string]: any
}

interface PropertiesPanelProps {
  selectedElements: DrawingElement[]
  onPropertyChange: (elementId: string, property: string, value: any) => void
}

export default function PropertiesPanel({
  selectedElements,
  onPropertyChange
}: PropertiesPanelProps) {
  if (selectedElements.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Properties</h3>
        </div>
        <div className="text-xs text-slate-400 text-center py-8">
          Select an element to view properties
        </div>
      </Card>
    )
  }

  const element = selectedElements[0]

  return (
    <Card className="bg-slate-800 border-slate-700 p-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Properties</h3>
        {selectedElements.length > 1 && (
          <span className="text-xs text-slate-400 ml-auto">
            {selectedElements.length} selected
          </span>
        )}
      </div>

      {/* Element Type */}
      <div>
        <label className="text-xs font-medium text-slate-300">Type</label>
        <div className="text-xs text-slate-400 mt-1 p-2 bg-slate-700 rounded">
          {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
        </div>
      </div>

      {/* Element ID */}
      <div>
        <label className="text-xs font-medium text-slate-300">ID</label>
        <div className="text-xs text-slate-400 mt-1 p-2 bg-slate-700 rounded font-mono break-all">
          {element.id}
        </div>
      </div>

      {/* Position */}
      {element.points.length > 0 && (
        <div>
          <label className="text-xs font-medium text-slate-300">Position</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <span className="text-xs text-slate-400">X:</span>
              <Input
                type="number"
                value={element.points[0].x.toFixed(2)}
                onChange={(e) =>
                  onPropertyChange(element.id, 'positionX', parseFloat(e.target.value))
                }
                className="h-6 text-xs bg-slate-700 border-slate-600 mt-1"
              />
            </div>
            <div>
              <span className="text-xs text-slate-400">Y:</span>
              <Input
                type="number"
                value={element.points[0].y.toFixed(2)}
                onChange={(e) =>
                  onPropertyChange(element.id, 'positionY', parseFloat(e.target.value))
                }
                className="h-6 text-xs bg-slate-700 border-slate-600 mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stroke Color */}
      <div>
        <label className="text-xs font-medium text-slate-300">Stroke Color</label>
        <div className="flex gap-2 mt-1">
          <input
            type="color"
            value={element.style.stroke}
            onChange={(e) =>
              onPropertyChange(element.id, 'strokeColor', e.target.value)
            }
            className="w-8 h-8 rounded cursor-pointer"
          />
          <Input
            value={element.style.stroke}
            onChange={(e) =>
              onPropertyChange(element.id, 'strokeColor', e.target.value)
            }
            className="flex-1 h-8 text-xs bg-slate-700 border-slate-600"
          />
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="text-xs font-medium text-slate-300">Stroke Width</label>
        <Input
          type="number"
          value={element.style.strokeWidth}
          onChange={(e) =>
            onPropertyChange(element.id, 'strokeWidth', parseFloat(e.target.value))
          }
          className="h-6 text-xs bg-slate-700 border-slate-600 mt-1"
          min="0.5"
          max="20"
          step="0.5"
        />
      </div>

      {/* Fill Color */}
      {element.style.fill !== undefined && (
        <div>
          <label className="text-xs font-medium text-slate-300">Fill Color</label>
          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={element.style.fill || '#ffffff'}
              onChange={(e) =>
                onPropertyChange(element.id, 'fillColor', e.target.value)
              }
              className="w-8 h-8 rounded cursor-pointer"
            />
            <Input
              value={element.style.fill || '#ffffff'}
              onChange={(e) =>
                onPropertyChange(element.id, 'fillColor', e.target.value)
              }
              className="flex-1 h-8 text-xs bg-slate-700 border-slate-600"
            />
          </div>
        </div>
      )}

      {/* Fill Opacity */}
      {element.style.fillOpacity !== undefined && (
        <div>
          <label className="text-xs font-medium text-slate-300">Fill Opacity</label>
          <Input
            type="range"
            value={element.style.fillOpacity}
            onChange={(e) =>
              onPropertyChange(element.id, 'fillOpacity', parseFloat(e.target.value))
            }
            className="w-full mt-1"
            min="0"
            max="1"
            step="0.1"
          />
          <span className="text-xs text-slate-400 mt-1">
            {(element.style.fillOpacity * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* Font Size */}
      {element.style.fontSize !== undefined && (
        <div>
          <label className="text-xs font-medium text-slate-300">Font Size</label>
          <Input
            type="number"
            value={element.style.fontSize}
            onChange={(e) =>
              onPropertyChange(element.id, 'fontSize', parseFloat(e.target.value))
            }
            className="h-6 text-xs bg-slate-700 border-slate-600 mt-1"
            min="8"
            max="72"
          />
        </div>
      )}

      {/* Text Content */}
      {element.text !== undefined && (
        <div>
          <label className="text-xs font-medium text-slate-300">Text</label>
          <Input
            value={element.text}
            onChange={(e) =>
              onPropertyChange(element.id, 'text', e.target.value)
            }
            className="h-6 text-xs bg-slate-700 border-slate-600 mt-1"
          />
        </div>
      )}
    </Card>
  )
}

