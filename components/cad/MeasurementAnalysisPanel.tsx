"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Ruler, AreaChart, Calculator, Zap, Trash2, Copy
} from "lucide-react"

interface Measurement {
  id: string
  type: 'distance' | 'angle' | 'area' | 'perimeter'
  value: number
  label?: string
  timestamp: number
}

interface MeasurementAnalysisPanelProps {
  measurements: Measurement[]
  onClearMeasurements: () => void
  onExportMeasurements: () => void
  selectedMeasurement: string | null
  onSelectMeasurement: (id: string) => void
}

export default function MeasurementAnalysisPanel({
  measurements,
  onClearMeasurements,
  onExportMeasurements,
  selectedMeasurement,
  onSelectMeasurement,
}: MeasurementAnalysisPanelProps) {
  const [showLoadAnalysis, setShowLoadAnalysis] = useState(false)
  const [loadValue, setLoadValue] = useState<number>(0)
  const [safetyFactor, setSafetyFactor] = useState<number>(1.5)

  const distanceMeasurements = measurements.filter(m => m.type === 'distance')
  const areaMeasurements = measurements.filter(m => m.type === 'area')
  const angleMeasurements = measurements.filter(m => m.type === 'angle')
  const perimeterMeasurements = measurements.filter(m => m.type === 'perimeter')

  const totalDistance = distanceMeasurements.reduce((sum, m) => sum + m.value, 0)
  const totalArea = areaMeasurements.reduce((sum, m) => sum + m.value, 0)
  const averageAngle = angleMeasurements.length > 0 
    ? angleMeasurements.reduce((sum, m) => sum + m.value, 0) / angleMeasurements.length 
    : 0

  const formatValue = (value: number, type: string): string => {
    if (type === 'angle') return `${value.toFixed(2)}°`
    if (type === 'area') return `${value.toFixed(2)} mm²`
    return `${value.toFixed(2)} mm`
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="flex items-center space-x-2 mb-4">
        <Ruler className="w-5 h-5 text-green-400" />
        <h3 className="text-sm font-semibold text-white">Measurements & Analysis</h3>
      </div>

      <Tabs defaultValue="measurements" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-700">
          <TabsTrigger value="measurements" className="text-xs">Measurements</TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="space-y-3">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-700 p-2 rounded">
              <div className="text-slate-400">Total Distance</div>
              <div className="text-white font-semibold">{totalDistance.toFixed(2)} mm</div>
            </div>
            <div className="bg-slate-700 p-2 rounded">
              <div className="text-slate-400">Total Area</div>
              <div className="text-white font-semibold">{totalArea.toFixed(2)} mm²</div>
            </div>
          </div>

          {/* Measurements List */}
          <div className="space-y-2">
            {measurements.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">
                No measurements yet. Use measurement tools to add.
              </div>
            ) : (
              measurements.map((measurement) => (
                <div
                  key={measurement.id}
                  onClick={() => onSelectMeasurement(measurement.id)}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedMeasurement === measurement.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium capitalize">
                      {measurement.type}: {measurement.label || ''}
                    </span>
                    <span className="text-xs font-semibold">
                      {formatValue(measurement.value, measurement.type)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-700">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 flex-1"
              onClick={onExportMeasurements}
            >
              <Copy className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 flex-1 text-red-400 hover:text-red-300"
              onClick={onClearMeasurements}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-3">
          {/* Load Analysis */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Load Analysis</label>
            
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-400">Load (kg)</label>
                <Input
                  type="number"
                  value={loadValue}
                  onChange={(e) => setLoadValue(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs bg-slate-700 border-slate-600"
                  placeholder="Enter load value"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Safety Factor</label>
                <Input
                  type="number"
                  value={safetyFactor}
                  onChange={(e) => setSafetyFactor(parseFloat(e.target.value) || 1.5)}
                  className="h-8 text-xs bg-slate-700 border-slate-600"
                  step="0.1"
                  min="1"
                />
              </div>
            </div>

            {loadValue > 0 && (
              <div className="bg-slate-700 p-2 rounded space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Load:</span>
                  <span className="text-white font-semibold">{loadValue.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">With Safety Factor:</span>
                  <span className="text-white font-semibold">{(loadValue * safetyFactor).toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Load per Area:</span>
                  <span className="text-white font-semibold">
                    {totalArea > 0 ? (loadValue / totalArea).toFixed(4) : '0'} kg/mm²
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Geometric Analysis */}
          <div className="bg-slate-700 p-2 rounded space-y-1 text-xs border-t border-slate-600 pt-3">
            <div className="font-medium text-slate-300 mb-2">Geometric Analysis</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Distance Measurements:</span>
              <span className="text-white">{distanceMeasurements.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Area Measurements:</span>
              <span className="text-white">{areaMeasurements.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Average Angle:</span>
              <span className="text-white">{averageAngle.toFixed(2)}°</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

