"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Settings, RotateCcw, X } from "lucide-react"

interface WireframeCraneConfigProps {
  craneData: {
    boomAngle: number
    boomExtension: number
    scale?: number
    loadLineLength?: number
    specifications: {
      wireframeType?: 'mobile' | 'tower' | 'crawler'
      boom: { baseLength: number; maxLength: number }
    }
  }
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: any) => void
}

export default function WireframeCraneConfigDialog({
  craneData,
  isOpen,
  onClose,
  onUpdate
}: WireframeCraneConfigProps) {
  const [boomAngle, setBoomAngle] = useState(craneData.boomAngle)
  const [boomExtension, setBoomExtension] = useState(craneData.boomExtension)
  const [scale, setScale] = useState(craneData.scale || 1.0)
  const [loadLineLength, setLoadLineLength] = useState(craneData.loadLineLength || 70)

  useEffect(() => {
    setBoomAngle(craneData.boomAngle)
    setBoomExtension(craneData.boomExtension)
    setScale(craneData.scale || 1.0)
    setLoadLineLength(craneData.loadLineLength || 70)
  }, [craneData])

  if (!isOpen) return null

  const craneType = craneData.specifications?.wireframeType || 'mobile'
  const boomLength = craneData.specifications?.boom?.baseLength + 
    (craneData.specifications?.boom?.maxLength - craneData.specifications?.boom?.baseLength) * boomExtension

  const handleApply = () => {
    onUpdate({ boomAngle, boomExtension, scale, loadLineLength })
    onClose()
  }

  const handleReset = () => {
    setBoomAngle(45)
    setBoomExtension(0.5)
    setScale(1.0)
    setLoadLineLength(70)
  }

  const getCraneTitle = () => {
    switch (craneType) {
      case 'mobile': return 'Mobile Crane (Wireframe)'
      case 'tower': return 'Tower Crane (Wireframe)'
      case 'crawler': return 'Crawler Crane (Wireframe)'
      default: return 'Wireframe Crane'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">{getCraneTitle()}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-5">
          {/* Boom Angle - Not for tower cranes */}
          {craneType !== 'tower' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-300">Boom Angle</Label>
                <Badge variant="outline" className="border-slate-600 text-slate-300">{boomAngle.toFixed(0)}°</Badge>
              </div>
              <Slider
                value={[boomAngle]}
                onValueChange={(value) => setBoomAngle(value[0])}
                min={15}
                max={85}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>15° (low)</span>
                <span>85° (high)</span>
              </div>
            </div>
          )}

          {/* Boom Extension / Length */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-300">Boom Extension</Label>
              <Badge variant="outline" className="border-slate-600 text-slate-300">{(boomExtension * 100).toFixed(0)}%</Badge>
            </div>
            <Slider
              value={[boomExtension]}
              onValueChange={(value) => setBoomExtension(value[0])}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Retracted</span>
              <span>Fully Extended ({boomLength?.toFixed(0)}m)</span>
            </div>
          </div>

          {/* Load Line Length */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-300">Load Line Height</Label>
              <Badge variant="outline" className="border-slate-600 text-slate-300">{loadLineLength}px</Badge>
            </div>
            <Slider
              value={[loadLineLength]}
              onValueChange={(value) => setLoadLineLength(value[0])}
              min={20}
              max={200}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Short (20px)</span>
              <span>Long (200px)</span>
            </div>
          </div>

          {/* Scale */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-300">Scale</Label>
              <Badge variant="outline" className="border-slate-600 text-slate-300">{scale.toFixed(2)}x</Badge>
            </div>
            <Slider
              value={[scale]}
              onValueChange={(value) => setScale(value[0])}
              min={0.3}
              max={3.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0.3x</span>
              <span>3.0x</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-4 border-t border-slate-700">
          <Button variant="outline" onClick={handleReset} className="border-slate-600 text-slate-300 hover:text-white">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white">
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

