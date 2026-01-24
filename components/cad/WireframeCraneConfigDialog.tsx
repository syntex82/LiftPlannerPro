"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, RotateCcw, X, Ruler, Weight, Move } from "lucide-react"

interface WireframeCraneConfigProps {
  craneData: {
    boomAngle: number
    boomExtension: number
    scale?: number
    loadLineLength?: number
    boomSections?: number
    outriggerExtension?: number
    counterweightTons?: number
    showDimensions?: boolean
    specifications: {
      wireframeType?: 'mobile' | 'tower' | 'crawler' | 'mobile-plan'
      boom: { baseLength: number; maxLength: number; sections?: number }
      model?: string
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
  const [loadLineLength, setLoadLineLength] = useState(craneData.loadLineLength || 80)
  const [boomSections, setBoomSections] = useState(craneData.boomSections || 5)
  const [outriggerExtension, setOutriggerExtension] = useState(craneData.outriggerExtension || 1.0)
  const [counterweightTons, setCounterweightTons] = useState(craneData.counterweightTons || 12)
  const [showDimensions, setShowDimensions] = useState(craneData.showDimensions !== false)

  useEffect(() => {
    setBoomAngle(craneData.boomAngle)
    setBoomExtension(craneData.boomExtension)
    setScale(craneData.scale || 1.0)
    setLoadLineLength(craneData.loadLineLength || 80)
    setBoomSections(craneData.boomSections || 5)
    setOutriggerExtension(craneData.outriggerExtension || 1.0)
    setCounterweightTons(craneData.counterweightTons || 12)
    setShowDimensions(craneData.showDimensions !== false)
  }, [craneData])

  if (!isOpen) return null

  const craneType = craneData.specifications?.wireframeType || 'mobile'
  const isPlanView = craneType === 'mobile-plan'
  const boomLength = craneData.specifications?.boom?.baseLength +
    (craneData.specifications?.boom?.maxLength - craneData.specifications?.boom?.baseLength) * boomExtension

  const handleApply = () => {
    onUpdate({
      boomAngle,
      boomExtension,
      scale,
      loadLineLength,
      boomSections,
      outriggerExtension,
      counterweightTons,
      showDimensions
    })
    onClose()
  }

  const handleReset = () => {
    setBoomAngle(isPlanView ? 0 : 45)
    setBoomExtension(0.5)
    setScale(1.0)
    setLoadLineLength(80)
    setBoomSections(5)
    setOutriggerExtension(1.0)
    setCounterweightTons(12)
    setShowDimensions(true)
  }

  const getCraneTitle = () => {
    switch (craneType) {
      case 'mobile': return 'LTM 1055 Side View'
      case 'mobile-plan': return 'LTM 1055 Plan View'
      case 'tower': return 'Tower Crane'
      case 'crawler': return 'Crawler Crane'
      default: return 'Technical Crane Drawing'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-lg border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-white">{getCraneTitle()}</h2>
              <p className="text-xs text-slate-400">Professional Engineering Drawing</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="boom" className="w-full">
          <TabsList className="grid w-full grid-cols-3 m-2 mr-4 ml-4" style={{width: 'calc(100% - 16px)'}}>
            <TabsTrigger value="boom">Boom</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          {/* Boom Tab */}
          <TabsContent value="boom" className="p-4 space-y-4">
            {/* Boom Angle */}
            {craneType !== 'tower' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-300">{isPlanView ? 'Boom Rotation' : 'Boom Angle'}</Label>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">{boomAngle.toFixed(0)}°</Badge>
                </div>
                <Slider
                  value={[boomAngle]}
                  onValueChange={(value) => setBoomAngle(value[0])}
                  min={isPlanView ? 0 : 15}
                  max={isPlanView ? 360 : 85}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{isPlanView ? '0° (right)' : '15° (low)'}</span>
                  <span>{isPlanView ? '360° (full)' : '85° (high)'}</span>
                </div>
              </div>
            )}

            {/* Boom Extension */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-300">Boom Length</Label>
                <Badge variant="outline" className="border-slate-600 text-slate-300">{boomLength?.toFixed(1)}m</Badge>
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
                <span>{craneData.specifications?.boom?.baseLength}m</span>
                <span>{craneData.specifications?.boom?.maxLength}m</span>
              </div>
            </div>

            {/* Boom Sections */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-300">Telescopic Sections</Label>
                <Badge variant="outline" className="border-slate-600 text-slate-300">{boomSections}</Badge>
              </div>
              <Slider
                value={[boomSections]}
                onValueChange={(value) => setBoomSections(value[0])}
                min={1}
                max={7}
                step={1}
                className="w-full"
              />
            </div>

            {/* Load Line (side view only) */}
            {!isPlanView && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-300">Hook Drop</Label>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">{loadLineLength}px</Badge>
                </div>
                <Slider
                  value={[loadLineLength]}
                  onValueChange={(value) => setLoadLineLength(value[0])}
                  min={30}
                  max={250}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup" className="p-4 space-y-4">
            {/* Outrigger Extension */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-300">Outrigger Extension</Label>
                <Badge variant="outline" className="border-slate-600 text-slate-300">{(outriggerExtension * 100).toFixed(0)}%</Badge>
              </div>
              <Slider
                value={[outriggerExtension]}
                onValueChange={(value) => setOutriggerExtension(value[0])}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Retracted</span>
                <span>Full Extension</span>
              </div>
            </div>

            {/* Counterweight */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-300">Counterweight</Label>
                <Badge variant="outline" className="border-slate-600 text-slate-300">{counterweightTons}t</Badge>
              </div>
              <Slider
                value={[counterweightTons]}
                onValueChange={(value) => setCounterweightTons(value[0])}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0t</span>
                <span>20t</span>
              </div>
            </div>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="p-4 space-y-4">
            {/* Scale */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-300">Drawing Scale</Label>
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
            </div>

            {/* Show Dimensions Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <Ruler className="w-4 h-4 text-slate-400" />
                <Label className="text-slate-300">Show Dimension Lines</Label>
              </div>
              <Switch
                checked={showDimensions}
                onCheckedChange={setShowDimensions}
              />
            </div>
          </TabsContent>
        </Tabs>

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

