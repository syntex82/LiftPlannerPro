"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { 
  Crosshair, Grid3x3, Circle, Zap, Magnet, Settings
} from "lucide-react"

interface AdvancedSnappingPanelProps {
  snapToEndpoint: boolean
  setSnapToEndpoint: (value: boolean) => void
  snapToMidpoint: boolean
  setSnapToMidpoint: (value: boolean) => void
  snapToCenter: boolean
  setSnapToCenter: (value: boolean) => void
  snapToIntersection: boolean
  setSnapToIntersection: (value: boolean) => void
  snapToPerpendicular: boolean
  setSnapToPerpendicular: (value: boolean) => void
  snapToTangent: boolean
  setSnapToTangent: (value: boolean) => void
  snapToGrid: boolean
  setSnapToGrid: (value: boolean) => void
  snapTolerance: number
  setSnapTolerance: (value: number) => void
  showSnapIndicators: boolean
  setShowSnapIndicators: (value: boolean) => void
}

export default function AdvancedSnappingPanel({
  snapToEndpoint,
  setSnapToEndpoint,
  snapToMidpoint,
  setSnapToMidpoint,
  snapToCenter,
  setSnapToCenter,
  snapToIntersection,
  setSnapToIntersection,
  snapToPerpendicular,
  setSnapToPerpendicular,
  snapToTangent,
  setSnapToTangent,
  snapToGrid,
  setSnapToGrid,
  snapTolerance,
  setSnapTolerance,
  showSnapIndicators,
  setShowSnapIndicators,
}: AdvancedSnappingPanelProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Magnet className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Snap Settings</h3>
      </div>

      {/* Snap Modes */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-300">Snap Modes</label>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="snap-endpoint"
              checked={snapToEndpoint}
              onCheckedChange={(checked) => setSnapToEndpoint(checked as boolean)}
              className="border-slate-500"
            />
            <label htmlFor="snap-endpoint" className="text-xs text-slate-300 cursor-pointer">
              Endpoint
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="snap-midpoint"
              checked={snapToMidpoint}
              onCheckedChange={(checked) => setSnapToMidpoint(checked as boolean)}
              className="border-slate-500"
            />
            <label htmlFor="snap-midpoint" className="text-xs text-slate-300 cursor-pointer">
              Midpoint
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="snap-center"
              checked={snapToCenter}
              onCheckedChange={(checked) => setSnapToCenter(checked as boolean)}
              className="border-slate-500"
            />
            <label htmlFor="snap-center" className="text-xs text-slate-300 cursor-pointer">
              Center
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="snap-intersection"
              checked={snapToIntersection}
              onCheckedChange={(checked) => setSnapToIntersection(checked as boolean)}
              className="border-slate-500"
            />
            <label htmlFor="snap-intersection" className="text-xs text-slate-300 cursor-pointer">
              Intersection
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="snap-perpendicular"
              checked={snapToPerpendicular}
              onCheckedChange={(checked) => setSnapToPerpendicular(checked as boolean)}
              className="border-slate-500"
            />
            <label htmlFor="snap-perpendicular" className="text-xs text-slate-300 cursor-pointer">
              Perpendicular
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="snap-tangent"
              checked={snapToTangent}
              onCheckedChange={(checked) => setSnapToTangent(checked as boolean)}
              className="border-slate-500"
            />
            <label htmlFor="snap-tangent" className="text-xs text-slate-300 cursor-pointer">
              Tangent
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="snap-grid"
              checked={snapToGrid}
              onCheckedChange={(checked) => setSnapToGrid(checked as boolean)}
              className="border-slate-500"
            />
            <label htmlFor="snap-grid" className="text-xs text-slate-300 cursor-pointer">
              Grid
            </label>
          </div>
        </div>
      </div>

      {/* Snap Tolerance */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-300">
          Snap Tolerance: {snapTolerance}px
        </label>
        <Slider
          value={[snapTolerance]}
          onValueChange={(value) => setSnapTolerance(value[0])}
          min={5}
          max={50}
          step={1}
          className="w-full"
        />
      </div>

      {/* Visual Feedback */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="snap-indicators"
          checked={showSnapIndicators}
          onCheckedChange={(checked) => setShowSnapIndicators(checked as boolean)}
          className="border-slate-500"
        />
        <label htmlFor="snap-indicators" className="text-xs text-slate-300 cursor-pointer">
          Show Snap Indicators
        </label>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2 pt-2 border-t border-slate-700">
        <label className="text-xs font-medium text-slate-300">Quick Presets</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => {
              setSnapToEndpoint(true)
              setSnapToMidpoint(true)
              setSnapToCenter(true)
              setSnapToGrid(true)
            }}
          >
            All On
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => {
              setSnapToEndpoint(false)
              setSnapToMidpoint(false)
              setSnapToCenter(false)
              setSnapToIntersection(false)
              setSnapToPerpendicular(false)
              setSnapToTangent(false)
              setSnapToGrid(false)
            }}
          >
            All Off
          </Button>
        </div>
      </div>
    </Card>
  )
}

