import React, { useState } from 'react'
import { Eye, EyeOff, Plus, Settings, Trash2 } from 'lucide-react'
import { useModelerStore } from './modelerStore'

export default function LayerPanel() {
  const { layers, currentLayer, objects, setCurrentLayer, toggleLayerVisibility, addLayer, deleteLayer, renameLayer, setObjects } = useModelerStore()
  const [showAddLayer, setShowAddLayer] = useState(false)
  const [newLayerName, setNewLayerName] = useState('')
  const [newLayerColor, setNewLayerColor] = useState('#ffffff')
  const [editingLayer, setEditingLayer] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const getObjectCountInLayer = (layerId: string) => {
    return objects.filter(obj => (obj.layer || 'default') === layerId).length
  }

  const handleAddLayer = () => {
    if (newLayerName.trim()) {
      addLayer({
        name: newLayerName.trim(),
        visible: true,
        color: newLayerColor
      })
      setNewLayerName('')
      setNewLayerColor('#ffffff')
      setShowAddLayer(false)
    }
  }

  const handleDeleteLayer = (layerId: string) => {
    if (layerId === 'default') {
      alert('Cannot delete the default layer')
      return
    }
    if (confirm('Delete this layer? Objects will be moved to Default layer.')) {
      deleteLayer(layerId)
    }
  }

  const handleRenameLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId)
    if (!layer) return
    setEditingLayer(layerId)
    setEditName(layer.name)
  }

  const saveRename = () => {
    if (editingLayer && editName.trim()) {
      renameLayer(editingLayer, editName.trim())
    }
    setEditingLayer(null)
    setEditName('')
  }

  return (
    <div className="w-64 bg-gray-800 border-l border-gray-600 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-200">Layers</h3>
          <button
            onClick={() => setShowAddLayer(true)}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            title="Add Layer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Layer Form */}
      {showAddLayer && (
        <div className="p-3 border-b border-gray-600 bg-gray-750">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Layer name"
              value={newLayerName}
              onChange={(e) => setNewLayerName(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200"
              onKeyDown={(e) => e.key === 'Enter' && handleAddLayer()}
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newLayerColor}
                onChange={(e) => setNewLayerColor(e.target.value)}
                className="w-6 h-6 rounded border border-gray-600"
              />
              <button
                onClick={handleAddLayer}
                disabled={!newLayerName.trim()}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddLayer(false)
                  setNewLayerName('')
                  setNewLayerColor('#ffffff')
                }}
                className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto">
        {layers.map((layer) => {
          const objectCount = getObjectCountInLayer(layer.id)
          const isActive = currentLayer === layer.id
          
          return (
            <div
              key={layer.id}
              className={`p-2 border-b border-gray-700 hover:bg-gray-750 cursor-pointer ${
                isActive ? 'bg-blue-900/30 border-blue-600' : ''
              }`}
              onClick={() => setCurrentLayer(layer.id)}
            >
              <div className="flex items-center gap-2">
                {/* Visibility Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLayerVisibility(layer.id)
                  }}
                  className="p-1 rounded hover:bg-gray-600"
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? (
                    <Eye className="w-3 h-3 text-gray-400" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-gray-500" />
                  )}
                </button>

                {/* Layer Color */}
                <div
                  className="w-3 h-3 rounded border border-gray-600"
                  style={{ backgroundColor: layer.color }}
                />

                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  {editingLayer === layer.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={saveRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename()
                        if (e.key === 'Escape') setEditingLayer(null)
                      }}
                      className="w-full px-1 py-0.5 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200"
                      autoFocus
                    />
                  ) : (
                    <>
                      <div className="text-xs text-gray-200 truncate">
                        {layer.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {objectCount} object{objectCount !== 1 ? 's' : ''}
                      </div>
                    </>
                  )}
                </div>

                {/* Layer Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRenameLayer(layer.id)
                    }}
                    className="p-1 rounded hover:bg-gray-600"
                    title="Rename Layer"
                  >
                    <Settings className="w-3 h-3 text-gray-400" />
                  </button>
                  {layer.id !== 'default' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteLayer(layer.id)
                      }}
                      className="p-1 rounded hover:bg-gray-600 hover:text-red-400"
                      title="Delete Layer"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Current Layer Info */}
      <div className="p-3 border-t border-gray-600 bg-gray-750">
        <div className="text-xs text-gray-400">
          Active Layer: <span className="text-gray-200">{layers.find(l => l.id === currentLayer)?.name}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          New objects will be created on this layer
        </div>
      </div>
    </div>
  )
}
