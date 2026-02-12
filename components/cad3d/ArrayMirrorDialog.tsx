"use client"

import React, { useState, useEffect } from "react"
import { X, Copy, Repeat, FlipHorizontal, Grid, ArrowRight, ArrowUp, ArrowRightLeft, RotateCcw } from "lucide-react"
import { useModelerStore } from "./modelerStore"

type TabType = 'linear' | 'radial' | 'mirror'

interface ArrayMirrorDialogProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: TabType
}

export default function ArrayMirrorDialog({ isOpen, onClose, initialTab = 'linear' }: ArrayMirrorDialogProps) {
  const { selectedId, selectedIds, objects } = useModelerStore()
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  
  // Linear array settings
  const [linearCount, setLinearCount] = useState(5)
  const [offsetX, setOffsetX] = useState(2)
  const [offsetY, setOffsetY] = useState(0)
  const [offsetZ, setOffsetZ] = useState(0)
  
  // Radial array settings
  const [radialCount, setRadialCount] = useState(6)
  const [radialRadius, setRadialRadius] = useState(5)
  const [radialAxis, setRadialAxis] = useState<'x'|'y'|'z'>('y')
  const [radialAngle, setRadialAngle] = useState(360)
  
  // Mirror settings
  const [mirrorPlane, setMirrorPlane] = useState<'yz'|'xz'|'xy'>('yz')

  const selectedCount = selectedIds.length || (selectedId ? 1 : 0)

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab, isOpen])

  const fire = (detail: any) => {
    window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail }))
  }

  const handleApply = () => {
    if (activeTab === 'linear') {
      fire({ action: 'array', data: { type: 'linear', count: linearCount, offset: [offsetX, offsetY, offsetZ] } })
    } else if (activeTab === 'radial') {
      fire({ action: 'array', data: { type: 'radial', count: radialCount, radius: radialRadius, axis: radialAxis, angle: radialAngle } })
    } else if (activeTab === 'mirror') {
      fire({ action: 'mirror', data: { plane: mirrorPlane } })
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-[420px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-blue-400" />
            <span className="text-base font-semibold text-gray-100">Array & Mirror</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button onClick={() => setActiveTab('linear')} className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'linear' ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:bg-gray-800'}`}>
            <Grid className="w-4 h-4 inline mr-1.5" /> Linear
          </button>
          <button onClick={() => setActiveTab('radial')} className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'radial' ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:bg-gray-800'}`}>
            <RotateCcw className="w-4 h-4 inline mr-1.5" /> Radial
          </button>
          <button onClick={() => setActiveTab('mirror')} className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'mirror' ? 'bg-green-600/20 text-green-400 border-b-2 border-green-500' : 'text-gray-400 hover:bg-gray-800'}`}>
            <FlipHorizontal className="w-4 h-4 inline mr-1.5" /> Mirror
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {selectedCount === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Copy className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Select one or more objects to array or mirror</p>
            </div>
          ) : (
            <>
              {/* Selection info */}
              <div className="mb-4 px-3 py-2 bg-gray-800/50 rounded-lg text-sm text-gray-400">
                <span className="text-white font-medium">{selectedCount}</span> object{selectedCount > 1 ? 's' : ''} selected
              </div>

              {/* Linear Array Tab */}
              {activeTab === 'linear' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Number of Copies</label>
                    <input type="number" value={linearCount} onChange={e => setLinearCount(Math.max(2, parseInt(e.target.value) || 2))} min={2} max={100}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Offset Distance (meters)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="flex items-center gap-1 mb-0.5"><span className="text-red-400 text-xs font-bold">X</span></div>
                        <input type="number" value={offsetX} onChange={e => setOffsetX(parseFloat(e.target.value) || 0)} step={0.5}
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:border-red-500 focus:outline-none" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-0.5"><span className="text-green-400 text-xs font-bold">Y</span></div>
                        <input type="number" value={offsetY} onChange={e => setOffsetY(parseFloat(e.target.value) || 0)} step={0.5}
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:border-green-500 focus:outline-none" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-0.5"><span className="text-blue-400 text-xs font-bold">Z</span></div>
                        <input type="number" value={offsetZ} onChange={e => setOffsetZ(parseFloat(e.target.value) || 0)} step={0.5}
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  {/* Preview indicator */}
                  <div className="text-center text-xs text-gray-500">
                    Creates <span className="text-blue-400 font-medium">{linearCount - 1}</span> copies at <span className="text-white">{Math.sqrt(offsetX**2 + offsetY**2 + offsetZ**2).toFixed(2)}m</span> intervals
                  </div>
                </div>
              )}

              {/* Radial Array Tab */}
              {activeTab === 'radial' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Number of Copies</label>
                      <input type="number" value={radialCount} onChange={e => setRadialCount(Math.max(3, parseInt(e.target.value) || 3))} min={3} max={72}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Radius (m)</label>
                      <input type="number" value={radialRadius} onChange={e => setRadialRadius(Math.max(0.1, parseFloat(e.target.value) || 1))} min={0.1} step={0.5}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Rotation Axis</label>
                    <div className="flex gap-2">
                      {(['x', 'y', 'z'] as const).map(axis => (
                        <button key={axis} onClick={() => setRadialAxis(axis)}
                          className={`flex-1 py-2 rounded text-sm font-bold uppercase ${radialAxis === axis ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                          {axis}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Preview indicator */}
                  <div className="text-center text-xs text-gray-500">
                    Creates <span className="text-purple-400 font-medium">{radialCount - 1}</span> copies around {radialAxis.toUpperCase()} axis at <span className="text-white">{radialRadius}m</span> radius
                  </div>
                </div>
              )}

              {/* Mirror Tab */}
              {activeTab === 'mirror' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Mirror Plane</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => setMirrorPlane('yz')}
                        className={`py-3 rounded text-sm font-medium ${mirrorPlane === 'yz' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                        <div className="text-lg font-bold">YZ</div>
                        <div className="text-xs opacity-70">X = 0</div>
                      </button>
                      <button onClick={() => setMirrorPlane('xz')}
                        className={`py-3 rounded text-sm font-medium ${mirrorPlane === 'xz' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                        <div className="text-lg font-bold">XZ</div>
                        <div className="text-xs opacity-70">Y = 0</div>
                      </button>
                      <button onClick={() => setMirrorPlane('xy')}
                        className={`py-3 rounded text-sm font-medium ${mirrorPlane === 'xy' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                        <div className="text-lg font-bold">XY</div>
                        <div className="text-xs opacity-70">Z = 0</div>
                      </button>
                    </div>
                  </div>
                  {/* Visual indicator */}
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600/30 border border-blue-500 rounded flex items-center justify-center text-blue-400 text-xs">
                        Original
                      </div>
                      <FlipHorizontal className="w-6 h-6 text-green-400" />
                      <div className="w-12 h-12 bg-green-600/30 border border-green-500 rounded flex items-center justify-center text-green-400 text-xs">
                        Mirror
                      </div>
                    </div>
                  </div>
                  {/* Preview indicator */}
                  <div className="text-center text-xs text-gray-500">
                    Creates mirrored copy across the <span className="text-green-400 font-medium">{mirrorPlane.toUpperCase()}</span> plane
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        {selectedCount > 0 && (
          <div className="flex gap-2 px-4 py-3 border-t border-gray-700 bg-gray-800/30">
            <button onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
            <button onClick={handleApply}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
                activeTab === 'linear' ? 'bg-blue-600 hover:bg-blue-500' :
                activeTab === 'radial' ? 'bg-purple-600 hover:bg-purple-500' :
                'bg-green-600 hover:bg-green-500'
              }`}>
              Apply {activeTab === 'linear' ? 'Linear Array' : activeTab === 'radial' ? 'Radial Array' : 'Mirror'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
