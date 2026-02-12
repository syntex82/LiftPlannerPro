"use client"

import React, { useState, useMemo } from "react"
import { useModelerStore, ModelerObject } from "./modelerStore"
import { Ruler, Triangle, Box, Target, X, ChevronDown, ChevronRight, Crosshair } from "lucide-react"
import * as THREE from "three"

interface MeasurementResult {
  type: 'distance' | 'angle' | 'volume' | 'area' | 'bounds' | 'centerOfMass'
  value: number | string
  unit: string
  details?: string
}

// Calculate bounding box for an object
function calculateBoundingBox(obj: ModelerObject): THREE.Box3 {
  const box = new THREE.Box3()
  const pos = new THREE.Vector3(...obj.position)
  
  // Get object dimensions based on type
  let size = new THREE.Vector3(1, 1, 1)
  if (obj.type === 'box' && obj.size) {
    size.set(obj.size[0], obj.size[1], obj.size[2])
  } else if (obj.type === 'sphere') {
    const r = obj.radius ?? 0.5
    size.set(r * 2, r * 2, r * 2)
  } else if (obj.type === 'cylinder' || obj.type === 'tube') {
    const r = obj.radius ?? 0.5
    const h = obj.height ?? 1
    size.set(r * 2, h, r * 2)
  } else if (obj.type === 'cone') {
    const r = Math.max(obj.radiusBottom ?? 1, obj.radiusTop ?? 0)
    const h = obj.height ?? 2
    size.set(r * 2, h, r * 2)
  } else if (obj.type === 'torus') {
    const r = (obj.radius ?? 1) + (obj.tubeRadius ?? 0.3)
    size.set(r * 2, (obj.tubeRadius ?? 0.3) * 2, r * 2)
  } else if (obj.type === 'pyramid') {
    const r = obj.radius ?? 1
    const h = obj.height ?? 2
    size.set(r * 2, h, r * 2)
  } else if (obj.type === 'wedge') {
    size.set(obj.width ?? 1, obj.height ?? 1, obj.depth ?? 2)
  } else if (obj.type === 'dome') {
    const r = obj.radius ?? 1
    size.set(r * 2, r, r * 2)
  }
  
  // Apply scale
  size.multiply(new THREE.Vector3(...obj.scale))
  
  // Create box centered at position
  box.setFromCenterAndSize(pos, size)
  return box
}

// Calculate volume of an object
function calculateVolume(obj: ModelerObject): number {
  const [sx, sy, sz] = obj.scale
  const scaleFactor = sx * sy * sz
  
  switch (obj.type) {
    case 'box': {
      const [w, h, d] = obj.size ?? [1, 1, 1]
      return w * h * d * scaleFactor
    }
    case 'sphere': {
      const r = obj.radius ?? 0.5
      return (4/3) * Math.PI * Math.pow(r, 3) * scaleFactor
    }
    case 'cylinder': {
      const r = obj.radius ?? 0.5
      const h = obj.height ?? 1
      return Math.PI * r * r * h * scaleFactor
    }
    case 'tube': {
      const r = obj.radius ?? 0.6
      const t = obj.thickness ?? 0.1
      const h = obj.height ?? 1.2
      const outerVol = Math.PI * r * r * h
      const innerVol = Math.PI * Math.pow(r - t, 2) * h
      return (outerVol - innerVol) * scaleFactor
    }
    case 'cone': {
      const rb = obj.radiusBottom ?? 1
      const rt = obj.radiusTop ?? 0
      const h = obj.height ?? 2
      // Frustum volume formula
      return (Math.PI * h / 3) * (rb*rb + rb*rt + rt*rt) * scaleFactor
    }
    case 'torus': {
      const R = obj.radius ?? 1
      const r = obj.tubeRadius ?? 0.3
      const arc = obj.arc ?? (Math.PI * 2)
      return 2 * Math.PI * Math.PI * R * r * r * (arc / (Math.PI * 2)) * scaleFactor
    }
    case 'pyramid': {
      const r = obj.radius ?? 1
      const h = obj.height ?? 2
      const sides = obj.sides ?? 4
      // Regular pyramid volume: (1/3) * base_area * height
      const baseArea = (sides * r * r * Math.sin(2 * Math.PI / sides)) / 2
      return (baseArea * h / 3) * scaleFactor
    }
    case 'wedge': {
      const w = obj.width ?? 1
      const h = obj.height ?? 1
      const d = obj.depth ?? 2
      return (w * h * d / 2) * scaleFactor // Triangular prism = half of box
    }
    case 'dome': {
      const r = obj.radius ?? 1
      const phi = obj.phiLength ?? (Math.PI / 2)
      // Spherical cap volume
      const fullSphereVol = (4/3) * Math.PI * Math.pow(r, 3)
      return fullSphereVol * (phi / Math.PI) * scaleFactor
    }
    default:
      return 0
  }
}

// Calculate surface area (simplified for common primitives)
function calculateSurfaceArea(obj: ModelerObject): number {
  const [sx, sy, sz] = obj.scale
  
  switch (obj.type) {
    case 'box': {
      const [w, h, d] = obj.size ?? [1, 1, 1]
      return 2 * (w*sx*h*sy + h*sy*d*sz + w*sx*d*sz)
    }
    case 'sphere': {
      const r = (obj.radius ?? 0.5) * Math.cbrt(sx * sy * sz)
      return 4 * Math.PI * r * r
    }
    case 'cylinder': {
      const r = (obj.radius ?? 0.5) * Math.sqrt(sx * sz)
      const h = (obj.height ?? 1) * sy
      return 2 * Math.PI * r * (r + h)
    }
    default:
      return 0 // Complex shapes return 0
  }
}

// Calculate center of mass (geometric center for uniform density)
function calculateCenterOfMass(obj: ModelerObject): THREE.Vector3 {
  // For simple shapes with uniform density, CoM = geometric center = position
  return new THREE.Vector3(...obj.position)
}

export default function MeasurementTools3D() {
  const { objects, selectedId, selectedIds } = useModelerStore()
  const [isOpen, setIsOpen] = useState(true)
  const [showBounds, setShowBounds] = useState(false)
  const [showCoM, setShowCoM] = useState(false)
  const [expandedSections, setExpandedSections] = useState({ single: true, multi: true })

  const selectedObject = selectedId ? objects.find(o => o.id === selectedId) : null
  const selectedObjects = selectedIds.length > 0 ? objects.filter(o => selectedIds.includes(o.id)) :
    (selectedObject ? [selectedObject] : [])

  // Single object measurements
  const singleMeasurements = useMemo(() => {
    if (!selectedObject) return null
    const box = calculateBoundingBox(selectedObject)
    const size = new THREE.Vector3()
    box.getSize(size)
    const volume = calculateVolume(selectedObject)
    const area = calculateSurfaceArea(selectedObject)
    const com = calculateCenterOfMass(selectedObject)

    return {
      bounds: { width: size.x, height: size.y, depth: size.z },
      volume,
      area,
      centerOfMass: com,
      position: selectedObject.position
    }
  }, [selectedObject])

  // Multi-object measurements (distance between 2 objects)
  const multiMeasurements = useMemo(() => {
    if (selectedObjects.length < 2) return null

    const [obj1, obj2] = selectedObjects
    const pos1 = new THREE.Vector3(...obj1.position)
    const pos2 = new THREE.Vector3(...obj2.position)
    const distance = pos1.distanceTo(pos2)

    // Combined bounding box
    const combinedBox = new THREE.Box3()
    selectedObjects.forEach(obj => {
      combinedBox.union(calculateBoundingBox(obj))
    })
    const combinedSize = new THREE.Vector3()
    combinedBox.getSize(combinedSize)

    // Total volume
    const totalVolume = selectedObjects.reduce((sum, obj) => sum + calculateVolume(obj), 0)

    return {
      distance,
      combinedBounds: { width: combinedSize.x, height: combinedSize.y, depth: combinedSize.z },
      totalVolume,
      objectCount: selectedObjects.length
    }
  }, [selectedObjects])

  // Fire event to toggle bounding box display
  const toggleBoundsDisplay = () => {
    setShowBounds(!showBounds)
    window.dispatchEvent(new CustomEvent('cad3d:modeler', {
      detail: { action: 'toggle-bounds', data: !showBounds }
    }))
  }

  // Fire event to toggle center of mass display
  const toggleCoMDisplay = () => {
    setShowCoM(!showCoM)
    window.dispatchEvent(new CustomEvent('cad3d:modeler', {
      detail: { action: 'toggle-com', data: !showCoM }
    }))
  }

  if (!isOpen) {
    return (
      <div className="w-8 bg-gray-800 border-r border-gray-600 flex flex-col items-center py-2">
        <button onClick={() => setIsOpen(true)}
          className="p-1.5 hover:bg-gray-700 rounded"
          title="Show Measurements">
          <Ruler className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-52 bg-gray-850 border-r border-gray-700 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #1f2937, #111827)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-1.5">
          <Ruler className="w-3.5 h-3.5 text-green-400" />
          <span className="text-[11px] font-semibold text-gray-200">Measurements</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-0.5 hover:bg-gray-700 rounded">
          <X className="w-3 h-3 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto text-[10px]">
        {!selectedObject && selectedObjects.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Select object(s) to measure
          </div>
        ) : (
          <>
            {/* Display Options */}
            <div className="px-2 py-1.5 border-b border-gray-700 flex gap-1">
              <button onClick={toggleBoundsDisplay}
                className={`flex-1 px-2 py-1 rounded text-[9px] ${showBounds ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50' : 'bg-gray-700 text-gray-400'}`}
                title="Show bounding box">
                <Box className="w-3 h-3 mx-auto mb-0.5" /> Bounds
              </button>
              <button onClick={toggleCoMDisplay}
                className={`flex-1 px-2 py-1 rounded text-[9px] ${showCoM ? 'bg-orange-600/30 text-orange-400 border border-orange-500/50' : 'bg-gray-700 text-gray-400'}`}
                title="Show center of mass">
                <Target className="w-3 h-3 mx-auto mb-0.5" /> CoM
              </button>
            </div>

            {/* Single Object Measurements */}
            {singleMeasurements && (
              <div className="border-b border-gray-700">
                <button onClick={() => setExpandedSections(p => ({...p, single: !p.single}))}
                  className="w-full flex items-center gap-1 px-2 py-1.5 hover:bg-gray-700/50 text-gray-300 font-medium">
                  {expandedSections.single ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  Object Measurements
                </button>
                {expandedSections.single && (
                  <div className="px-2 pb-2 space-y-1.5">
                    {/* Bounding Box */}
                    <div className="bg-gray-800/50 rounded p-1.5">
                      <div className="text-gray-400 mb-1 flex items-center gap-1">
                        <Box className="w-3 h-3" /> Bounding Box
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div><span className="text-red-400">W:</span> <span className="text-white">{singleMeasurements.bounds.width.toFixed(2)}m</span></div>
                        <div><span className="text-green-400">H:</span> <span className="text-white">{singleMeasurements.bounds.height.toFixed(2)}m</span></div>
                        <div><span className="text-blue-400">D:</span> <span className="text-white">{singleMeasurements.bounds.depth.toFixed(2)}m</span></div>
                      </div>
                    </div>

                    {/* Volume */}
                    <div className="flex justify-between px-1.5 py-1 bg-gray-800/50 rounded">
                      <span className="text-gray-400">Volume:</span>
                      <span className="text-cyan-400 font-mono">{singleMeasurements.volume.toFixed(3)} m³</span>
                    </div>

                    {/* Surface Area */}
                    {singleMeasurements.area > 0 && (
                      <div className="flex justify-between px-1.5 py-1 bg-gray-800/50 rounded">
                        <span className="text-gray-400">Surface Area:</span>
                        <span className="text-purple-400 font-mono">{singleMeasurements.area.toFixed(2)} m²</span>
                      </div>
                    )}

                    {/* Center of Mass */}
                    <div className="bg-gray-800/50 rounded p-1.5">
                      <div className="text-gray-400 mb-1 flex items-center gap-1">
                        <Crosshair className="w-3 h-3" /> Center of Mass
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center font-mono">
                        <div><span className="text-red-400">X:</span> <span className="text-white">{singleMeasurements.centerOfMass.x.toFixed(2)}</span></div>
                        <div><span className="text-green-400">Y:</span> <span className="text-white">{singleMeasurements.centerOfMass.y.toFixed(2)}</span></div>
                        <div><span className="text-blue-400">Z:</span> <span className="text-white">{singleMeasurements.centerOfMass.z.toFixed(2)}</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Multi-Object Measurements */}
            {multiMeasurements && (
              <div className="border-b border-gray-700">
                <button onClick={() => setExpandedSections(p => ({...p, multi: !p.multi}))}
                  className="w-full flex items-center gap-1 px-2 py-1.5 hover:bg-gray-700/50 text-gray-300 font-medium">
                  {expandedSections.multi ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  Multi-Object ({multiMeasurements.objectCount})
                </button>
                {expandedSections.multi && (
                  <div className="px-2 pb-2 space-y-1.5">
                    {/* Distance */}
                    <div className="flex justify-between px-1.5 py-1.5 bg-green-900/30 rounded border border-green-700/50">
                      <span className="text-green-400 flex items-center gap-1">
                        <Ruler className="w-3 h-3" /> Distance:
                      </span>
                      <span className="text-green-300 font-mono font-bold">{multiMeasurements.distance.toFixed(3)} m</span>
                    </div>

                    {/* Combined Bounds */}
                    <div className="bg-gray-800/50 rounded p-1.5">
                      <div className="text-gray-400 mb-1">Combined Bounds</div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div><span className="text-red-400">W:</span> <span className="text-white">{multiMeasurements.combinedBounds.width.toFixed(2)}m</span></div>
                        <div><span className="text-green-400">H:</span> <span className="text-white">{multiMeasurements.combinedBounds.height.toFixed(2)}m</span></div>
                        <div><span className="text-blue-400">D:</span> <span className="text-white">{multiMeasurements.combinedBounds.depth.toFixed(2)}m</span></div>
                      </div>
                    </div>

                    {/* Total Volume */}
                    <div className="flex justify-between px-1.5 py-1 bg-gray-800/50 rounded">
                      <span className="text-gray-400">Total Volume:</span>
                      <span className="text-cyan-400 font-mono">{multiMeasurements.totalVolume.toFixed(3)} m³</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

