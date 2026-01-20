"use client"

// Load Capacity Checker Component - Shows crane load chart and verifies capacity at selected radius
// Helps trainees understand boom radius and load capacity relationship

import { CraneEquipment } from '@/lib/equipment-library'
import { LoadSpecification } from '@/lib/training-scenarios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle } from 'lucide-react'

interface LoadCapacityCheckerProps {
  equipment: CraneEquipment
  load: LoadSpecification
  cranePosition?: { x: number; y: number }
  loadPosition?: { x: number; y: number }
}

export default function LoadCapacityChecker({
  equipment,
  load,
  cranePosition,
  loadPosition
}: LoadCapacityCheckerProps) {
  // Calculate radius if positions provided
  let radius = 0
  if (cranePosition && loadPosition) {
    const dx = loadPosition.x - cranePosition.x
    const dy = loadPosition.y - cranePosition.y
    radius = Math.sqrt(dx * dx + dy * dy)
  }

  // Find capacity at this radius
  const capacityAtRadius = equipment.loadChart.find(
    chart => chart.radius >= radius
  )

  const canLift = capacityAtRadius && capacityAtRadius.capacity >= load.weight

  return (
    <div className="space-y-4">
      {/* Load Chart */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">{equipment.name} - Load Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="font-semibold text-slate-300">Radius (m)</div>
              <div className="font-semibold text-slate-300">Capacity (kg)</div>
              {equipment.loadChart.map((chart, i) => (
                <div key={i} className="contents">
                  <div className="text-slate-400">{chart.radius}</div>
                  <div className="text-slate-400">{chart.capacity.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity Check */}
      {radius > 0 && (
        <Card className={`border-2 ${canLift ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
          <CardHeader>
            <CardTitle className={`text-sm ${canLift ? 'text-green-400' : 'text-red-400'}`}>
              Capacity Check at {radius.toFixed(1)}m Radius
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Load Weight:</p>
                <p className="text-white font-semibold">{load.weight.toLocaleString()} kg</p>
              </div>
              <div>
                <p className="text-slate-400">Crane Capacity:</p>
                <p className={`font-semibold ${canLift ? 'text-green-400' : 'text-red-400'}`}>
                  {capacityAtRadius?.capacity.toLocaleString()} kg
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canLift ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-300">Crane has sufficient capacity for this load</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-300">Crane does NOT have sufficient capacity</span>
                </>
              )}
            </div>

            {!canLift && capacityAtRadius && (
              <div className="text-xs text-red-300 bg-red-900/30 p-2 rounded">
                Shortfall: {(load.weight - capacityAtRadius.capacity).toLocaleString()} kg
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipment Specs */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Equipment Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-slate-400">Max Capacity:</p>
              <p className="text-white font-semibold">{equipment.maxCapacity.toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-slate-400">Max Radius:</p>
              <p className="text-white font-semibold">{equipment.maxRadius}m</p>
            </div>
            <div>
              <p className="text-slate-400">Max Height:</p>
              <p className="text-white font-semibold">{equipment.maxHeight}m</p>
            </div>
            <div>
              <p className="text-slate-400">Boom Sections:</p>
              <p className="text-white font-semibold">{equipment.boom.sections}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load Specs */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Load Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <p className="text-slate-400">Name:</p>
            <p className="text-white font-semibold">{load.name}</p>
          </div>
          <div>
            <p className="text-slate-400">Weight:</p>
            <p className="text-white font-semibold">{load.weight.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-slate-400">Dimensions:</p>
            <p className="text-white font-semibold">
              {load.width}m × {load.height}m × {load.depth}m
            </p>
          </div>
          {load.fragile && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded p-2 mt-2">
              <p className="text-yellow-300 text-xs">⚠ Fragile - Max tilt angle: {load.maxTiltAngle}°</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

