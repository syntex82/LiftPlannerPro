'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface TandemCraneData {
  specifications: any
  crane1: {
    boomAngle: number
    boomExtension: number
    scale: number
    loadLineLength: number
    offsetX: number
    offsetY: number
  }
  crane2: {
    boomAngle: number
    boomExtension: number
    scale: number
    loadLineLength: number
    offsetX: number
    offsetY: number
  }
  spacing: number
  showLoadChart: boolean
}

interface TandemCraneConfigDialogProps {
  isOpen: boolean
  onClose: () => void
  craneData: TandemCraneData
  onUpdate: (data: Partial<TandemCraneData>) => void
}

export default function TandemCraneConfigDialog({
  isOpen,
  onClose,
  craneData,
  onUpdate
}: TandemCraneConfigDialogProps) {
  // Crane 1 state
  const [crane1BoomAngle, setCrane1BoomAngle] = useState(craneData.crane1.boomAngle)
  const [crane1BoomExtension, setCrane1BoomExtension] = useState(craneData.crane1.boomExtension)
  const [crane1Scale, setCrane1Scale] = useState(craneData.crane1.scale)
  const [crane1LoadLineLength, setCrane1LoadLineLength] = useState(craneData.crane1.loadLineLength)
  const [crane1OffsetX, setCrane1OffsetX] = useState(craneData.crane1.offsetX)
  const [crane1OffsetY, setCrane1OffsetY] = useState(craneData.crane1.offsetY)

  // Crane 2 state
  const [crane2BoomAngle, setCrane2BoomAngle] = useState(craneData.crane2.boomAngle)
  const [crane2BoomExtension, setCrane2BoomExtension] = useState(craneData.crane2.boomExtension)
  const [crane2Scale, setCrane2Scale] = useState(craneData.crane2.scale)
  const [crane2LoadLineLength, setCrane2LoadLineLength] = useState(craneData.crane2.loadLineLength)
  const [crane2OffsetX, setCrane2OffsetX] = useState(craneData.crane2.offsetX)
  const [crane2OffsetY, setCrane2OffsetY] = useState(craneData.crane2.offsetY)

  // Shared state
  const [spacing, setSpacing] = useState(craneData.spacing)
  const [showLoadChart, setShowLoadChart] = useState(craneData.showLoadChart)

  useEffect(() => {
    setCrane1BoomAngle(craneData.crane1.boomAngle)
    setCrane1BoomExtension(craneData.crane1.boomExtension)
    setCrane1Scale(craneData.crane1.scale)
    setCrane1LoadLineLength(craneData.crane1.loadLineLength)
    setCrane1OffsetX(craneData.crane1.offsetX)
    setCrane1OffsetY(craneData.crane1.offsetY)

    setCrane2BoomAngle(craneData.crane2.boomAngle)
    setCrane2BoomExtension(craneData.crane2.boomExtension)
    setCrane2Scale(craneData.crane2.scale)
    setCrane2LoadLineLength(craneData.crane2.loadLineLength)
    setCrane2OffsetX(craneData.crane2.offsetX)
    setCrane2OffsetY(craneData.crane2.offsetY)

    setSpacing(craneData.spacing)
    setShowLoadChart(craneData.showLoadChart)
  }, [craneData])

  const handleApply = () => {
    onUpdate({
      crane1: {
        boomAngle: crane1BoomAngle,
        boomExtension: crane1BoomExtension,
        scale: crane1Scale,
        loadLineLength: crane1LoadLineLength,
        offsetX: crane1OffsetX,
        offsetY: crane1OffsetY
      },
      crane2: {
        boomAngle: crane2BoomAngle,
        boomExtension: crane2BoomExtension,
        scale: crane2Scale,
        loadLineLength: crane2LoadLineLength,
        offsetX: crane2OffsetX,
        offsetY: crane2OffsetY
      },
      spacing,
      showLoadChart
    })
    onClose()
  }

  const syncCranes = () => {
    setCrane2BoomAngle(crane1BoomAngle)
    setCrane2BoomExtension(crane1BoomExtension)
    setCrane2Scale(crane1Scale)
    setCrane2LoadLineLength(crane1LoadLineLength)
    // Note: Position offsets are NOT synced to maintain independent positioning
  }

  const syncSpacing = () => {
    // Quick spacing adjustment - sets cranes to opposite sides
    // Convert spacing from meters to pixels (2 pixels per meter)
    const spacingPixels = spacing * 2
    setCrane1OffsetX(-spacingPixels / 2)
    setCrane2OffsetX(spacingPixels / 2)
    setCrane1OffsetY(0)
    setCrane2OffsetY(0)
  }

  const crane = craneData.specifications

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center gap-2">
            🏗️ Tandem Crane Configuration
            <Badge variant="outline" className="border-orange-500 text-orange-400">
              DUAL LIFT
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Crane Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">
                {crane?.manufacturer} {crane?.model}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Tandem lift configuration with two cranes facing opposite directions - booms meet in the middle
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="crane1" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="crane1" className="data-[state=active]:bg-slate-700">
                Crane 1 (Left → Facing Right)
              </TabsTrigger>
              <TabsTrigger value="crane2" className="data-[state=active]:bg-slate-700">
                Crane 2 (Right ← Facing Left)
              </TabsTrigger>
              <TabsTrigger value="shared" className="data-[state=active]:bg-slate-700">
                Shared Settings
              </TabsTrigger>
            </TabsList>

            {/* Crane 1 Configuration */}
            <TabsContent value="crane1" className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200 flex items-center justify-between">
                    Crane 1 Configuration (Left Side → Facing Right)
                    <Button
                      onClick={syncCranes}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Copy to Crane 2 →
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Crane 1 Controls */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Boom Angle</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {crane1BoomAngle.toFixed(0)}°
                        </Badge>
                      </div>
                      <Slider
                        value={[crane1BoomAngle]}
                        onValueChange={(value) => setCrane1BoomAngle(value[0])}
                        min={-5}
                        max={85}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>-5°</span>
                        <span>85°</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Boom Extension</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {(crane1BoomExtension * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <Slider
                        value={[crane1BoomExtension]}
                        onValueChange={(value) => setCrane1BoomExtension(value[0])}
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Scale</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {crane1Scale.toFixed(1)}x
                        </Badge>
                      </div>
                      <Slider
                        value={[crane1Scale]}
                        onValueChange={(value) => setCrane1Scale(value[0])}
                        min={0.2}
                        max={3.0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0.2x</span>
                        <span>3.0x</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Load Line Length</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {crane1LoadLineLength.toFixed(0)}m
                        </Badge>
                      </div>
                      <Slider
                        value={[crane1LoadLineLength]}
                        onValueChange={(value) => setCrane1LoadLineLength(value[0])}
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

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">X Position Offset</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {crane1OffsetX.toFixed(0)}px
                        </Badge>
                      </div>
                      <Slider
                        value={[crane1OffsetX]}
                        onValueChange={(value) => setCrane1OffsetX(value[0])}
                        min={-500}
                        max={500}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>-500px</span>
                        <span>500px</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Y Position Offset</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {crane1OffsetY.toFixed(0)}px
                        </Badge>
                      </div>
                      <Slider
                        value={[crane1OffsetY]}
                        onValueChange={(value) => setCrane1OffsetY(value[0])}
                        min={-300}
                        max={300}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>-300px</span>
                        <span>300px</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Crane 2 Configuration */}
            <TabsContent value="crane2" className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200">Crane 2 Configuration (Right Side ← Facing Left)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Crane 2 Controls */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Boom Angle</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {crane2BoomAngle.toFixed(0)}°
                        </Badge>
                      </div>
                      <Slider
                        value={[crane2BoomAngle]}
                        onValueChange={(value) => setCrane2BoomAngle(value[0])}
                        min={-5}
                        max={85}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>-5°</span>
                        <span>85°</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Boom Extension</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {(crane2BoomExtension * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <Slider
                        value={[crane2BoomExtension]}
                        onValueChange={(value) => setCrane2BoomExtension(value[0])}
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Scale</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {crane2Scale.toFixed(1)}x
                        </Badge>
                      </div>
                      <Slider
                        value={[crane2Scale]}
                        onValueChange={(value) => setCrane2Scale(value[0])}
                        min={0.2}
                        max={3.0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0.2x</span>
                        <span>3.0x</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Load Line Length</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {crane2LoadLineLength.toFixed(0)}m
                        </Badge>
                      </div>
                      <Slider
                        value={[crane2LoadLineLength]}
                        onValueChange={(value) => setCrane2LoadLineLength(value[0])}
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

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">X Position Offset</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {crane2OffsetX.toFixed(0)}px
                        </Badge>
                      </div>
                      <Slider
                        value={[crane2OffsetX]}
                        onValueChange={(value) => setCrane2OffsetX(value[0])}
                        min={-500}
                        max={500}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>-500px</span>
                        <span>500px</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-300">Y Position Offset</Label>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {crane2OffsetY.toFixed(0)}px
                        </Badge>
                      </div>
                      <Slider
                        value={[crane2OffsetY]}
                        onValueChange={(value) => setCrane2OffsetY(value[0])}
                        min={-300}
                        max={300}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>-300px</span>
                        <span>300px</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shared Settings */}
            <TabsContent value="shared" className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200">Shared Configuration</CardTitle>
                  <CardDescription className="text-slate-400">
                    Settings that apply to both cranes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-slate-300">Crane Spacing</Label>
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {spacing.toFixed(0)}m
                      </Badge>
                    </div>
                    <Slider
                      value={[spacing]}
                      onValueChange={(value) => setSpacing(value[0])}
                      min={50}
                      max={300}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>50m</span>
                      <span>300m</span>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={syncSpacing}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full"
                      >
                        Apply Spacing to Crane Positions
                      </Button>
                      <p className="text-xs text-slate-500 mt-2">
                        This will set Crane 1 to -{spacing}px and Crane 2 to +{spacing}px on X-axis
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator className="bg-slate-700" />

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
