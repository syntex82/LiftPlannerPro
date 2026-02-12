"use client"

import { useState, useCallback, useRef } from "react"
import { useLiftSimulationStore, LoadObject, CraneKeyframe } from "./liftSimulationStore"

interface LiftSimulationPanelProps {
  selectedCraneId: string | null
  craneState: { boomAngle: number; boomExtend: number; slew: number; loadLine: number; position: [number, number, number] } | null
  onClose?: () => void
}

export default function LiftSimulationPanel({ selectedCraneId, craneState, onClose }: LiftSimulationPanelProps) {
  const {
    loadObjects, selectedLoadId, setSelectedLoadId, addLoadObject, removeLoadObject,
    attachLoadToCrane, detachLoad, keyframes, currentTime, duration, isPlaying, isPaused,
    playbackSpeed, isRecording, play, pause, stop, setCurrentTime, setPlaybackSpeed,
    setIsRecording, addKeyframe, removeKeyframe, clearKeyframes, exportKeyframes, importKeyframes,
    enablePhysics, setEnablePhysics
  } = useLiftSimulationStore()

  const [activeTab, setActiveTab] = useState<'loads' | 'keyframes' | 'playback'>('loads')
  const [newLoadType, setNewLoadType] = useState<LoadObject['type']>('box')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get default dimensions for each load type
  const getLoadDimensions = (type: LoadObject['type']) => {
    switch (type) {
      case 'box': return { width: 2, height: 1.5, depth: 2, radius: undefined, weight: 5000 }
      case 'cylinder': return { width: 2, height: 2, depth: 2, radius: 1, weight: 3000 }
      case 'sphere': return { width: 2, height: 2, depth: 2, radius: 1, weight: 2000 }
      case 'vessel': return { width: 3, height: 2, depth: 8, radius: 1, weight: 15000 }
      case 'column': return { width: 3, height: 20, depth: 3, radius: 1.5, weight: 45000 }
      case 'exchanger': return { width: 2, height: 1.5, depth: 6, radius: 0.75, weight: 8000 }
      case 'reactor': return { width: 4, height: 8, depth: 4, radius: 2, weight: 35000 }
      case 'drum': return { width: 6, height: 2, depth: 2, radius: 1, weight: 12000 }
      case 'compressor': return { width: 3, height: 2.5, depth: 4, radius: undefined, weight: 18000 }
      case 'pump': return { width: 1.5, height: 1.2, depth: 2, radius: undefined, weight: 2500 }
      case 'pipe-spool': return { width: 4, height: 0.6, depth: 0.6, radius: 0.3, weight: 800 }
      case 'valve': return { width: 1, height: 0.8, depth: 1.2, radius: undefined, weight: 1500 }
      case 'motor': return { width: 1.2, height: 1.2, depth: 2, radius: 0.6, weight: 3500 }
      default: return { width: 2, height: 1.5, depth: 2, radius: undefined, weight: 5000 }
    }
  }

  const handleAddLoad = useCallback(() => {
    const dims = getLoadDimensions(newLoadType)
    const riggingHeight = Math.max(1.5, dims.height * 0.3) // Scale rigging offset with height
    addLoadObject({
      name: `${newLoadType.charAt(0).toUpperCase() + newLoadType.slice(1)} ${loadObjects.length + 1}`,
      type: newLoadType,
      width: dims.width,
      height: dims.height,
      depth: dims.depth,
      radius: dims.radius,
      weight: dims.weight,
      color: '#e67e22',
      position: [0, dims.height / 2, 5],
      rotation: [0, 0, 0],
      attachedToCraneId: null,
      riggingOffset: [0, riggingHeight, 0],
      swingAngleX: 0, swingAngleZ: 0,
      swingVelocityX: 0, swingVelocityZ: 0
    })
  }, [addLoadObject, loadObjects.length, newLoadType])

  const handleRecordKeyframe = useCallback(() => {
    if (!selectedCraneId || !craneState) return
    addKeyframe({
      time: currentTime,
      craneId: selectedCraneId,
      boomAngle: craneState.boomAngle,
      boomExtend: craneState.boomExtend,
      slew: craneState.slew,
      loadLine: craneState.loadLine,
      position: craneState.position,
      easing: 'easeInOut'
    })
  }, [selectedCraneId, craneState, currentTime, addKeyframe])

  const handleExport = useCallback(() => {
    const json = exportKeyframes()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lift-simulation-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [exportKeyframes])

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      importKeyframes(text)
    }
    reader.readAsText(file)
  }, [importKeyframes])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`
  }

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-blue-600/50 rounded-lg shadow-xl w-80 max-h-[500px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-blue-700/30 border-b border-blue-600/30">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-bold text-blue-300">Lift Simulation</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {(['loads', 'keyframes', 'playback'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab ? 'bg-blue-600/30 text-blue-300 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {/* Loads Tab */}
        {activeTab === 'loads' && (
          <>
            {/* Add Load */}
            <div className="flex gap-2">
              <select
                value={newLoadType}
                onChange={(e) => setNewLoadType(e.target.value as LoadObject['type'])}
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
              >
                <optgroup label="Basic Shapes">
                  <option value="box">Box</option>
                  <option value="cylinder">Cylinder</option>
                  <option value="sphere">Sphere</option>
                </optgroup>
                <optgroup label="Refinery Equipment">
                  <option value="vessel">Vessel</option>
                  <option value="column">Column</option>
                  <option value="exchanger">Exchanger</option>
                  <option value="reactor">Reactor</option>
                  <option value="drum">Drum</option>
                  <option value="compressor">Compressor</option>
                  <option value="pump">Pump</option>
                  <option value="pipe-spool">Pipe Spool</option>
                  <option value="valve">Valve</option>
                  <option value="motor">Motor</option>
                </optgroup>
              </select>
              <button
                onClick={handleAddLoad}
                className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-medium"
              >
                + Add Load
              </button>
            </div>

            {/* Load List */}
            <div className="space-y-1">
              {loadObjects.map(load => (
                <div
                  key={load.id}
                  onClick={() => setSelectedLoadId(load.id)}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    selectedLoadId === load.id ? 'bg-blue-600/30 border border-blue-500' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: load.color }} />
                    <span className="text-xs">{load.name}</span>
                    {load.attachedToCraneId && <span className="text-[10px] text-green-400">⬆ Attached</span>}
                  </div>
                  <div className="flex gap-1">
                    {selectedCraneId && (
                      <button
                        onClick={(e) => { e.stopPropagation(); load.attachedToCraneId ? detachLoad(load.id) : attachLoadToCrane(load.id, selectedCraneId) }}
                        className={`px-1.5 py-0.5 text-[10px] rounded ${load.attachedToCraneId ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                      >
                        {load.attachedToCraneId ? 'Detach' : 'Attach'}
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeLoadObject(load.id) }}
                      className="px-1.5 py-0.5 text-[10px] bg-gray-600 hover:bg-red-600 rounded"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {loadObjects.length === 0 && (
                <div className="text-center text-gray-500 text-xs py-4">No loads added</div>
              )}
            </div>
          </>
        )}

        {/* Keyframes Tab */}
        {activeTab === 'keyframes' && (
          <>
            {/* Record Button */}
            <div className="flex gap-2">
              <button
                onClick={handleRecordKeyframe}
                disabled={!selectedCraneId}
                className={`flex-1 px-3 py-2 rounded text-xs font-medium flex items-center justify-center gap-2 ${
                  isRecording ? 'bg-red-600 animate-pulse' : 'bg-red-700 hover:bg-red-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                Record at {formatTime(currentTime)}
              </button>
            </div>

            {/* Keyframe List */}
            <div className="space-y-1 max-h-40 overflow-auto">
              {keyframes.filter(k => k.craneId === selectedCraneId).map(kf => (
                <div key={kf.id} className="flex items-center justify-between p-2 bg-gray-800 rounded text-xs">
                  <span className="text-yellow-400 font-mono">{formatTime(kf.time)}</span>
                  <span className="text-gray-400">∠{kf.boomAngle.toFixed(0)}° ↔{kf.slew.toFixed(0)}°</span>
                  <button
                    onClick={() => removeKeyframe(kf.id)}
                    className="px-1.5 py-0.5 text-[10px] bg-gray-600 hover:bg-red-600 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {keyframes.filter(k => k.craneId === selectedCraneId).length === 0 && (
                <div className="text-center text-gray-500 text-xs py-4">No keyframes recorded</div>
              )}
            </div>

            {/* Import/Export */}
            <div className="flex gap-2 pt-2 border-t border-gray-700">
              <button onClick={handleExport} className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                Export
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                Import
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
              <button onClick={clearKeyframes} className="px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs">
                Clear
              </button>
            </div>
          </>
        )}

        {/* Playback Tab */}
        {activeTab === 'playback' && (
          <>
            {/* Timeline Scrubber */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Timeline</span>
                <span className="text-blue-400 font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              {/* Keyframe markers */}
              <div className="relative h-2 -mt-1">
                {keyframes.filter(k => k.craneId === selectedCraneId).map(kf => (
                  <div
                    key={kf.id}
                    className="absolute w-1.5 h-1.5 bg-yellow-500 rounded-full -translate-x-1/2"
                    style={{ left: `${(kf.time / duration) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex justify-center gap-2">
              <button onClick={stop} className="p-2 bg-gray-700 hover:bg-gray-600 rounded">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg>
              </button>
              <button onClick={isPlaying ? pause : play} className="p-2 bg-blue-600 hover:bg-blue-500 rounded">
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
            </div>

            {/* Speed Control */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Speed</span>
                <span className="text-blue-400">{playbackSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="4"
                step="0.1"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Physics Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <span className="text-xs text-gray-400">Load Physics (Swing)</span>
              <button
                onClick={() => setEnablePhysics(!enablePhysics)}
                className={`w-10 h-5 rounded-full transition-colors ${enablePhysics ? 'bg-green-600' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${enablePhysics ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

