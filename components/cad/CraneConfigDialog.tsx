"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  RotateCcw,
  Maximize2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Gauge,
  Ruler,
  Weight
} from "lucide-react"
import { CraneSpecifications, getLoadCapacityAtRadius } from '@/lib/crane-models'

interface CraneConfigDialogProps {
  crane: CraneSpecifications | null
  craneData: {
    boomAngle: number
    boomExtension: number
    scale?: number
    loadLineLength?: number
    showLoadChart: boolean
    wireframe?: boolean
  }
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: any) => void
  onDelete?: () => void
}

export default function CraneConfigDialog({
  crane,
  craneData,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}: CraneConfigDialogProps) {
  const [boomAngle, setBoomAngle] = useState(craneData.boomAngle)
  const [boomExtension, setBoomExtension] = useState(craneData.boomExtension)
  const [scale, setScale] = useState(craneData.scale || 1.0)
  const [loadLineLength, setLoadLineLength] = useState(craneData.loadLineLength || 40)
  const [showLoadChart, setShowLoadChart] = useState(craneData.showLoadChart)
  const [wireframe, setWireframe] = useState(craneData.wireframe || false)
  const [loadWeight, setLoadWeight] = useState(10) // Default load weight in tons

  useEffect(() => {
    setBoomAngle(craneData.boomAngle)
    setBoomExtension(craneData.boomExtension)
    setScale(craneData.scale || 1.0)
    setLoadLineLength(craneData.loadLineLength || 40)
    setShowLoadChart(craneData.showLoadChart)
    setWireframe(craneData.wireframe || false)
  }, [craneData])

  if (!isOpen || !crane) return null

  // Calculate current boom length and radius
  const currentBoomLength = crane.boom.baseLength + (crane.boom.maxLength - crane.boom.baseLength) * boomExtension
  const currentRadius = currentBoomLength * Math.cos((boomAngle * Math.PI) / 180)
  const currentHeight = currentBoomLength * Math.sin((boomAngle * Math.PI) / 180)

  // Get load capacity at current radius
  const maxCapacityAtRadius = getLoadCapacityAtRadius(crane, currentRadius)
  const isLiftSafe = loadWeight <= maxCapacityAtRadius
  const safetyFactor = maxCapacityAtRadius / loadWeight

  const handleApply = () => {
    onUpdate({
      boomAngle,
      boomExtension,
      scale,
      loadLineLength,
      showLoadChart,
      wireframe
    })
    onClose()
  }

  const handleReset = () => {
    setBoomAngle(45)
    setBoomExtension(0.5)
    setScale(1.0)
    setLoadWeight(10)
    setLoadLineLength(40)
    setShowLoadChart(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {crane.manufacturer} {crane.model} Configuration
              </h2>
              <p className="text-sm text-slate-400">
                {crane.type.replace('-', ' ')} crane • {crane.maxCapacity}t capacity
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleReset} className="border-slate-600 text-slate-300 hover:text-white">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:text-white">Close</Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Configuration Panel */}
          <div className="w-1/2 border-r border-slate-700 overflow-y-auto p-6 bg-slate-900">
            <Tabs defaultValue="position" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="position">Position</TabsTrigger>
                <TabsTrigger value="load">Load Check</TabsTrigger>
              </TabsList>

              <TabsContent value="position" className="space-y-6">
                <div>
                  <Label className="text-base font-semibold text-white">Boom Configuration</Label>

                  <div className="space-y-4 mt-3">
                    {crane?.model?.toLowerCase?.().includes('plan view') ? (
                      // Plan view controls - Boom Rotation and Boom Length
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-slate-300">Boom Rotation</Label>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">{boomAngle.toFixed(0)}°</Badge>
                          </div>
                          <Slider
                            value={[boomAngle]}
                            onValueChange={(value) => setBoomAngle(value[0])}
                            min={0}
                            max={360}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>0° (12 o'clock)</span>
                            <span>360° (full rotation)</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-slate-300">Boom Length</Label>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {(crane.boom.baseLength + (crane.boom.maxLength - crane.boom.baseLength) * boomExtension).toFixed(1)}m
                            </Badge>
                          </div>
                          <Slider
                            value={[boomExtension]}
                            onValueChange={(value) => setBoomExtension(value[0])}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>{crane.boom.baseLength}m</span>
                            <span>{crane.boom.maxLength}m</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Side view controls - Boom Angle and Boom Extension
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-slate-300">Boom Angle</Label>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">{boomAngle.toFixed(1)}°</Badge>
                          </div>
                          <Slider
                            value={[boomAngle]}
                            onValueChange={(value) => setBoomAngle(value[0])}
                            min={crane.boom.luffingAngle.min}
                            max={crane.boom.luffingAngle.max}
                            step={0.5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>{crane.boom.luffingAngle.min}°</span>
                            <span>{crane.boom.luffingAngle.max}°</span>
                          </div>
                        </div>

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
                            step={0.01}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>{crane.boom.baseLength}m</span>
                            <span>{crane.boom.maxLength}m</span>
                          </div>
                        </div>
                      </>
                    )}



                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Crane Scale</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">{scale.toFixed(1)}x</Badge>
                      </div>
                      <Slider
                        value={[scale]}
                        onValueChange={(value) => setScale(value[0])}
                        min={0.2}
                        max={3.0}
                        step={0.1}
                        className="w-full"
                      />

                      {/* Wireframe toggle (plan view only) */}
                      {crane?.model?.toLowerCase?.().includes('plan view') && (
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-300">Wireframe</Label>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-slate-600 text-slate-300">{wireframe ? 'On' : 'Off'}</Badge>
                            <Switch checked={wireframe} onCheckedChange={setWireframe} />
                          </div>
                        </div>
                      )}


                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0.2x</span>
                        <span>3.0x</span>
                      </div>
                    </div>

                    {!crane?.model?.toLowerCase?.().includes('plan view') && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-slate-300">Load Line Length</Label>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">{loadLineLength.toFixed(0)}m</Badge>
                        </div>
                        <Slider
                          value={[loadLineLength]}
                          onValueChange={(value) => setLoadLineLength(value[0])}
                          min={5}
                          max={300}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>5m</span>
                          <span>300m</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300 flex items-center gap-2">
                          <Weight className="w-4 h-4" />
                          Load Weight
                        </Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">{loadWeight.toFixed(1)}t</Badge>
                      </div>
                      <Slider
                        value={[loadWeight]}
                        onValueChange={(value) => setLoadWeight(value[0])}
                        min={0.5}
                        max={100}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0.5t</span>
                        <span>100t</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <h4 className="font-semibold mb-3 text-white">Current Configuration</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Ruler className="w-4 h-4 text-blue-400" />
                      <span>Boom Length: {currentBoomLength.toFixed(1)}m</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-green-400" />
                      <span>Working Radius: {currentRadius.toFixed(1)}m</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Maximize2 className="w-4 h-4 text-orange-400" />
                      <span>Hook Height: {currentHeight.toFixed(1)}m</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Weight className="w-4 h-4 text-purple-400" />
                      <span>Max Capacity: {maxCapacityAtRadius.toFixed(1)}t</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="load" className="space-y-6">
                <div>
                  <Label className="text-base font-semibold text-white">Load Check</Label>

                  <div className="space-y-4 mt-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Load Weight (tonnes)</Label>
                        <Input
                          type="number"
                          value={loadWeight}
                          onChange={(e) => setLoadWeight(parseFloat(e.target.value) || 0)}
                          className="w-20 bg-slate-700 border-slate-600 text-white"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  isLiftSafe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {isLiftSafe ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <h4 className={`font-semibold ${
                      isLiftSafe ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {isLiftSafe ? 'Lift is SAFE' : 'Lift EXCEEDS CAPACITY'}
                    </h4>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>Load Weight: {loadWeight}t</p>
                    <p>Max Capacity at {currentRadius.toFixed(1)}m: {maxCapacityAtRadius.toFixed(1)}t</p>
                    <p>Safety Factor: {safetyFactor.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Load Chart Preview</h4>
                  </div>
                  <div className="space-y-1 text-xs">
                    {crane.loadChart.slice(0, 5).map((point, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{point.radius}m radius:</span>
                        <span className="font-mono">{point.capacity}t</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>


            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 p-6 bg-slate-900">
            <div className="h-full bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
              <div className="text-center text-slate-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">3D Preview</p>
                <p className="text-sm text-slate-500">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center space-x-4">
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                Delete Crane
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white">
              Apply Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
