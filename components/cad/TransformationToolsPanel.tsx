"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Copy, Repeat2, Zap, Maximize2, Minimize2, RotateCw
} from "lucide-react"

interface TransformationToolsPanelProps {
  onMirror: () => void
  onOffset: (distance: number) => void
  onArray: (type: 'rectangular' | 'polar', params: any) => void
  onFillet: (radius: number) => void
  onChamfer: (distance: number) => void
  selectedElementCount: number
}

export default function TransformationToolsPanel({
  onMirror,
  onOffset,
  onArray,
  onFillet,
  onChamfer,
  selectedElementCount,
}: TransformationToolsPanelProps) {
  const [offsetDistance, setOffsetDistance] = useState<number>(10)
  const [arrayRows, setArrayRows] = useState<number>(2)
  const [arrayColumns, setArrayColumns] = useState<number>(2)
  const [arraySpacingX, setArraySpacingX] = useState<number>(50)
  const [arraySpacingY, setArraySpacingY] = useState<number>(50)
  const [polarCount, setPolarCount] = useState<number>(4)
  const [polarRadius, setPolarRadius] = useState<number>(100)
  const [filletRadius, setFilletRadius] = useState<number>(5)
  const [chamferDistance, setChamferDistance] = useState<number>(5)

  const isDisabled = selectedElementCount === 0

  return (
    <Card className="bg-slate-800 border-slate-700 p-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="flex items-center space-x-2 mb-4">
        <Repeat2 className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Transformation Tools</h3>
        {selectedElementCount > 0 && (
          <span className="text-xs text-slate-400 ml-auto">
            {selectedElementCount} selected
          </span>
        )}
      </div>

      {isDisabled && (
        <div className="text-xs text-slate-400 text-center py-4 bg-slate-700 rounded">
          Select elements to use transformation tools
        </div>
      )}

      <Tabs defaultValue="array" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-700 text-xs">
          <TabsTrigger value="array">Array</TabsTrigger>
          <TabsTrigger value="modify">Modify</TabsTrigger>
          <TabsTrigger value="edge">Edge</TabsTrigger>
        </TabsList>

        <TabsContent value="array" className="space-y-3">
          {/* Rectangular Array */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Rectangular Array</label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400">Rows</label>
                  <Input
                    type="number"
                    value={arrayRows}
                    onChange={(e) => setArrayRows(parseInt(e.target.value) || 1)}
                    className="h-8 text-xs bg-slate-700 border-slate-600"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Columns</label>
                  <Input
                    type="number"
                    value={arrayColumns}
                    onChange={(e) => setArrayColumns(parseInt(e.target.value) || 1)}
                    className="h-8 text-xs bg-slate-700 border-slate-600"
                    min="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400">Spacing X (mm)</label>
                  <Input
                    type="number"
                    value={arraySpacingX}
                    onChange={(e) => setArraySpacingX(parseFloat(e.target.value) || 50)}
                    className="h-8 text-xs bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Spacing Y (mm)</label>
                  <Input
                    type="number"
                    value={arraySpacingY}
                    onChange={(e) => setArraySpacingY(parseFloat(e.target.value) || 50)}
                    className="h-8 text-xs bg-slate-700 border-slate-600"
                  />
                </div>
              </div>
              <Button
                size="sm"
                className="w-full text-xs h-8"
                onClick={() => onArray('rectangular', { rows: arrayRows, columns: arrayColumns, spacingX: arraySpacingX, spacingY: arraySpacingY })}
                disabled={isDisabled}
              >
                <Copy className="w-3 h-3 mr-1" />
                Create Array
              </Button>
            </div>
          </div>

          {/* Polar Array */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <label className="text-xs font-medium text-slate-300">Polar Array</label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400">Count</label>
                  <Input
                    type="number"
                    value={polarCount}
                    onChange={(e) => setPolarCount(parseInt(e.target.value) || 1)}
                    className="h-8 text-xs bg-slate-700 border-slate-600"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Radius (mm)</label>
                  <Input
                    type="number"
                    value={polarRadius}
                    onChange={(e) => setPolarRadius(parseFloat(e.target.value) || 100)}
                    className="h-8 text-xs bg-slate-700 border-slate-600"
                  />
                </div>
              </div>
              <Button
                size="sm"
                className="w-full text-xs h-8"
                onClick={() => onArray('polar', { count: polarCount, radius: polarRadius })}
                disabled={isDisabled}
              >
                <RotateCw className="w-3 h-3 mr-1" />
                Create Polar Array
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="modify" className="space-y-3">
          {/* Mirror */}
          <Button
            size="sm"
            className="w-full text-xs h-8"
            onClick={onMirror}
            disabled={isDisabled}
          >
            <Repeat2 className="w-3 h-3 mr-1" />
            Mirror
          </Button>

          {/* Offset */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Offset</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={offsetDistance}
                onChange={(e) => setOffsetDistance(parseFloat(e.target.value) || 10)}
                className="h-8 text-xs bg-slate-700 border-slate-600 flex-1"
                placeholder="Distance (mm)"
              />
              <Button
                size="sm"
                className="text-xs h-8 px-3"
                onClick={() => onOffset(offsetDistance)}
                disabled={isDisabled}
              >
                Apply
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edge" className="space-y-3">
          {/* Fillet */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Fillet</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={filletRadius}
                onChange={(e) => setFilletRadius(parseFloat(e.target.value) || 5)}
                className="h-8 text-xs bg-slate-700 border-slate-600 flex-1"
                placeholder="Radius (mm)"
              />
              <Button
                size="sm"
                className="text-xs h-8 px-3"
                onClick={() => onFillet(filletRadius)}
                disabled={isDisabled}
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Chamfer */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Chamfer</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={chamferDistance}
                onChange={(e) => setChamferDistance(parseFloat(e.target.value) || 5)}
                className="h-8 text-xs bg-slate-700 border-slate-600 flex-1"
                placeholder="Distance (mm)"
              />
              <Button
                size="sm"
                className="text-xs h-8 px-3"
                onClick={() => onChamfer(chamferDistance)}
                disabled={isDisabled}
              >
                Apply
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

