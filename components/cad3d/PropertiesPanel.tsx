"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useModelerStore, ModelerObject } from "./modelerStore"
import { X, ChevronDown, ChevronRight, Box, Move, RotateCw, Maximize2, Palette, Eye, EyeOff, Lock, Unlock } from "lucide-react"

interface PropertyInputProps {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
  suffix?: string
}

const PropertyInput = ({ label, value, onChange, step = 0.1, min, max, suffix = "" }: PropertyInputProps) => (
  <div className="flex items-center gap-2">
    <label className="text-[10px] text-gray-400 w-8">{label}</label>
    <input
      type="number"
      value={value.toFixed(3)}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      step={step}
      min={min}
      max={max}
      className="flex-1 px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-[10px] text-gray-200 w-16"
    />
    {suffix && <span className="text-[9px] text-gray-500">{suffix}</span>}
  </div>
)

const Vector3Input = ({ label, value, onChange, icon }: {
  label: string
  value: [number, number, number]
  onChange: (v: [number, number, number]) => void
  icon?: React.ReactNode
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
      {icon}
      {label}
    </div>
    <div className="grid grid-cols-3 gap-1">
      <div className="flex items-center gap-0.5">
        <span className="text-[9px] text-red-400 w-3">X</span>
        <input type="number" value={value[0].toFixed(2)} step={0.1}
          onChange={(e) => onChange([parseFloat(e.target.value) || 0, value[1], value[2]])}
          className="w-full px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-[9px] text-gray-200"
        />
      </div>
      <div className="flex items-center gap-0.5">
        <span className="text-[9px] text-green-400 w-3">Y</span>
        <input type="number" value={value[1].toFixed(2)} step={0.1}
          onChange={(e) => onChange([value[0], parseFloat(e.target.value) || 0, value[2]])}
          className="w-full px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-[9px] text-gray-200"
        />
      </div>
      <div className="flex items-center gap-0.5">
        <span className="text-[9px] text-blue-400 w-3">Z</span>
        <input type="number" value={value[2].toFixed(2)} step={0.1}
          onChange={(e) => onChange([value[0], value[1], parseFloat(e.target.value) || 0])}
          className="w-full px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-[9px] text-gray-200"
        />
      </div>
    </div>
  </div>
)

const CollapsibleSection = ({ title, children, defaultOpen = true }: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-700">
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-1 px-2 py-1.5 hover:bg-gray-700/50 text-[10px] font-medium text-gray-300">
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {title}
      </button>
      {isOpen && <div className="px-2 py-2 space-y-2">{children}</div>}
    </div>
  )
}

export default function PropertiesPanel() {
  const { objects, selectedId, setObjects } = useModelerStore()
  const [isOpen, setIsOpen] = useState(true)
  
  const selectedObject = selectedId ? objects.find(o => o.id === selectedId) : null

  const updateObject = useCallback((updates: Partial<ModelerObject>) => {
    if (!selectedId) return
    setObjects(prev => prev.map(o => o.id === selectedId ? { ...o, ...updates } : o))
  }, [selectedId, setObjects])

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 border-l border-y border-gray-600 p-2 rounded-l-lg hover:bg-gray-700">
        <Box className="w-4 h-4 text-gray-400" />
      </button>
    )
  }

  return (
    <div className="w-56 bg-gray-850 border-l border-gray-700 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #1f2937, #111827)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-1.5">
          <Box className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-semibold text-gray-200">Properties</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-0.5 hover:bg-gray-700 rounded">
          <X className="w-3 h-3 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedObject ? (
          <div className="p-4 text-center text-gray-500 text-[10px]">
            Select an object to view properties
          </div>
        ) : (
          <>
            {/* Object Info */}
            <div className="px-2 py-2 border-b border-gray-700 bg-gray-800/30">
              <div className="text-[11px] font-medium text-gray-200">{selectedObject.name || selectedObject.type}</div>
              <div className="text-[9px] text-gray-500">Type: {selectedObject.type} | ID: {selectedObject.id.slice(0, 8)}</div>
            </div>

            {/* Quick Actions */}
            <div className="px-2 py-1.5 border-b border-gray-700 flex gap-1">
              <button onClick={() => updateObject({ visible: !(selectedObject.visible ?? true) })}
                className={`p-1 rounded ${selectedObject.visible !== false ? 'text-green-400 bg-green-900/30' : 'text-gray-500'}`}
                title={selectedObject.visible !== false ? 'Hide' : 'Show'}>
                {selectedObject.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
              <button onClick={() => updateObject({ locked: !selectedObject.locked })}
                className={`p-1 rounded ${selectedObject.locked ? 'text-red-400 bg-red-900/30' : 'text-gray-500'}`}
                title={selectedObject.locked ? 'Unlock' : 'Lock'}>
                {selectedObject.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
              <div className="flex-1" />
              <input type="color" value={selectedObject.color || '#93c5fd'}
                onChange={(e) => updateObject({ color: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border border-gray-600" title="Color" />
            </div>

            {/* Transform Section */}
            <CollapsibleSection title="Transform">
              <Vector3Input label="Position" value={selectedObject.position} icon={<Move className="w-3 h-3" />}
                onChange={(v) => updateObject({ position: v })} />
              <Vector3Input label="Rotation" value={selectedObject.rotation} icon={<RotateCw className="w-3 h-3" />}
                onChange={(v) => updateObject({ rotation: v })} />
              <Vector3Input label="Scale" value={selectedObject.scale} icon={<Maximize2 className="w-3 h-3" />}
                onChange={(v) => updateObject({ scale: v })} />
            </CollapsibleSection>

            {/* Geometry Section - Primitive-specific parameters */}
            <CollapsibleSection title="Geometry">
              {/* Box */}
              {selectedObject.type === 'box' && selectedObject.size && (
                <Vector3Input label="Size" value={selectedObject.size as [number, number, number]}
                  onChange={(v) => updateObject({ size: v })} icon={<Box className="w-3 h-3" />} />
              )}

              {/* Sphere */}
              {selectedObject.type === 'sphere' && (
                <PropertyInput label="Radius" value={selectedObject.radius ?? 0.5}
                  onChange={(v) => updateObject({ radius: v })} step={0.1} min={0.01} suffix="m" />
              )}

              {/* Cylinder */}
              {selectedObject.type === 'cylinder' && (
                <>
                  <PropertyInput label="Radius" value={selectedObject.radius ?? 0.5}
                    onChange={(v) => updateObject({ radius: v })} step={0.1} min={0.01} suffix="m" />
                  <PropertyInput label="Height" value={selectedObject.height ?? 1}
                    onChange={(v) => updateObject({ height: v })} step={0.1} min={0.01} suffix="m" />
                </>
              )}

              {/* Tube */}
              {selectedObject.type === 'tube' && (
                <>
                  <PropertyInput label="Radius" value={selectedObject.radius ?? 0.6}
                    onChange={(v) => updateObject({ radius: v })} step={0.1} min={0.01} suffix="m" />
                  <PropertyInput label="Thick" value={selectedObject.thickness ?? 0.1}
                    onChange={(v) => updateObject({ thickness: v })} step={0.01} min={0.005} suffix="m" />
                  <PropertyInput label="Height" value={selectedObject.height ?? 1.2}
                    onChange={(v) => updateObject({ height: v })} step={0.1} min={0.01} suffix="m" />
                </>
              )}

              {/* Cone */}
              {selectedObject.type === 'cone' && (
                <>
                  <PropertyInput label="R Bottom" value={selectedObject.radiusBottom ?? 1}
                    onChange={(v) => updateObject({ radiusBottom: v })} step={0.1} min={0} suffix="m" />
                  <PropertyInput label="R Top" value={selectedObject.radiusTop ?? 0}
                    onChange={(v) => updateObject({ radiusTop: v })} step={0.1} min={0} suffix="m" />
                  <PropertyInput label="Height" value={selectedObject.height ?? 2}
                    onChange={(v) => updateObject({ height: v })} step={0.1} min={0.01} suffix="m" />
                </>
              )}

              {/* Torus */}
              {selectedObject.type === 'torus' && (
                <>
                  <PropertyInput label="Radius" value={selectedObject.radius ?? 1}
                    onChange={(v) => updateObject({ radius: v })} step={0.1} min={0.1} suffix="m" />
                  <PropertyInput label="Tube R" value={selectedObject.tubeRadius ?? 0.3}
                    onChange={(v) => updateObject({ tubeRadius: v })} step={0.05} min={0.01} suffix="m" />
                  <PropertyInput label="Arc" value={((selectedObject.arc ?? Math.PI * 2) * 180 / Math.PI)}
                    onChange={(v) => updateObject({ arc: v * Math.PI / 180 })} step={15} min={15} max={360} suffix="°" />
                </>
              )}

              {/* Pyramid */}
              {selectedObject.type === 'pyramid' && (
                <>
                  <PropertyInput label="Radius" value={selectedObject.radius ?? 1}
                    onChange={(v) => updateObject({ radius: v })} step={0.1} min={0.1} suffix="m" />
                  <PropertyInput label="Height" value={selectedObject.height ?? 2}
                    onChange={(v) => updateObject({ height: v })} step={0.1} min={0.01} suffix="m" />
                  <PropertyInput label="Sides" value={selectedObject.sides ?? 4}
                    onChange={(v) => updateObject({ sides: Math.max(3, Math.round(v)) })} step={1} min={3} max={12} />
                </>
              )}

              {/* Wedge */}
              {selectedObject.type === 'wedge' && (
                <>
                  <PropertyInput label="Width" value={selectedObject.width ?? 1}
                    onChange={(v) => updateObject({ width: v })} step={0.1} min={0.01} suffix="m" />
                  <PropertyInput label="Height" value={selectedObject.height ?? 1}
                    onChange={(v) => updateObject({ height: v })} step={0.1} min={0.01} suffix="m" />
                  <PropertyInput label="Depth" value={selectedObject.depth ?? 2}
                    onChange={(v) => updateObject({ depth: v })} step={0.1} min={0.01} suffix="m" />
                </>
              )}

              {/* Dome */}
              {selectedObject.type === 'dome' && (
                <>
                  <PropertyInput label="Radius" value={selectedObject.radius ?? 1}
                    onChange={(v) => updateObject({ radius: v })} step={0.1} min={0.1} suffix="m" />
                  <PropertyInput label="Arc" value={((selectedObject.phiLength ?? Math.PI / 2) * 180 / Math.PI)}
                    onChange={(v) => updateObject({ phiLength: v * Math.PI / 180 })} step={15} min={15} max={180} suffix="°" />
                </>
              )}

              {/* No geometry params for this type */}
              {!['box', 'sphere', 'cylinder', 'tube', 'cone', 'torus', 'pyramid', 'wedge', 'dome'].includes(selectedObject.type) && (
                <div className="text-[9px] text-gray-500 italic">No editable geometry parameters</div>
              )}
            </CollapsibleSection>
          </>
        )}
      </div>
    </div>
  )
}

