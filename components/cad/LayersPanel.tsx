"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Layers, Plus, Trash2, Eye, EyeOff, Lock, Unlock } from 'lucide-react'

interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  color: string
  opacity?: number
  lineWeight?: number
}

interface LayersPanelProps {
  layers: Layer[]
  currentLayer: string
  onLayerSelect: (layerId: string) => void
  onLayerCreate: (name: string) => void
  onLayerDelete: (layerId: string) => void
  onLayerToggleVisibility: (layerId: string) => void
  onLayerToggleLock: (layerId: string) => void
  onLayerRename: (layerId: string, newName: string) => void
  onLayerColorChange: (layerId: string, color: string) => void
}

export default function LayersPanel({
  layers,
  currentLayer,
  onLayerSelect,
  onLayerCreate,
  onLayerDelete,
  onLayerToggleVisibility,
  onLayerToggleLock,
  onLayerRename,
  onLayerColorChange
}: LayersPanelProps) {
  const [newLayerName, setNewLayerName] = useState('')
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleCreateLayer = () => {
    if (newLayerName.trim()) {
      onLayerCreate(newLayerName)
      setNewLayerName('')
    }
  }

  const handleRenameLayer = (layerId: string, newName: string) => {
    if (newName.trim()) {
      onLayerRename(layerId, newName)
      setEditingLayerId(null)
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="flex items-center space-x-2 mb-4">
        <Layers className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Layers</h3>
      </div>

      {/* Create New Layer */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
            placeholder="New layer name"
            className="h-8 text-xs bg-slate-700 border-slate-600"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleCreateLayer()
            }}
          />
          <Button
            size="sm"
            onClick={handleCreateLayer}
            className="h-8 px-3 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Layers List */}
      <div className="space-y-1 border-t border-slate-700 pt-3">
        {layers.map(layer => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 p-2 rounded transition-colors ${
              currentLayer === layer.id
                ? 'bg-blue-900 border border-blue-500'
                : 'bg-slate-700 hover:bg-slate-600 border border-slate-600'
            }`}
          >
            {/* Color Indicator */}
            <input
              type="color"
              value={layer.color}
              onChange={(e) => onLayerColorChange(layer.id, e.target.value)}
              className="w-4 h-4 cursor-pointer rounded"
              title="Layer color"
            />

            {/* Layer Name */}
            {editingLayerId === layer.id ? (
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameLayer(layer.id, editingName)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleRenameLayer(layer.id, editingName)
                }}
                className="flex-1 h-6 text-xs bg-slate-800 border-slate-500"
                autoFocus
              />
            ) : (
              <span
                onClick={() => onLayerSelect(layer.id)}
                onDoubleClick={() => {
                  setEditingLayerId(layer.id)
                  setEditingName(layer.name)
                }}
                className="flex-1 text-xs text-white cursor-pointer hover:text-blue-300"
              >
                {layer.name}
              </span>
            )}

            {/* Visibility Toggle */}
            <button
              onClick={() => onLayerToggleVisibility(layer.id)}
              className="p-1 hover:bg-slate-500 rounded"
              title={layer.visible ? 'Hide layer' : 'Show layer'}
            >
              {layer.visible ? (
                <Eye className="w-3 h-3 text-slate-300" />
              ) : (
                <EyeOff className="w-3 h-3 text-slate-500" />
              )}
            </button>

            {/* Lock Toggle */}
            <button
              onClick={() => onLayerToggleLock(layer.id)}
              className="p-1 hover:bg-slate-500 rounded"
              title={layer.locked ? 'Unlock layer' : 'Lock layer'}
            >
              {layer.locked ? (
                <Lock className="w-3 h-3 text-yellow-400" />
              ) : (
                <Unlock className="w-3 h-3 text-slate-300" />
              )}
            </button>

            {/* Delete Button */}
            {layers.length > 1 && (
              <button
                onClick={() => onLayerDelete(layer.id)}
                className="p-1 hover:bg-red-900 rounded"
                title="Delete layer"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Layer Info */}
      {layers.length > 0 && (
        <div className="text-xs text-slate-400 border-t border-slate-700 pt-3">
          <p>Total layers: {layers.length}</p>
          <p>Current: {layers.find(l => l.id === currentLayer)?.name || 'None'}</p>
        </div>
      )}
    </Card>
  )
}

