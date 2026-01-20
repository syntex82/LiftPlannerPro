"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Plus } from 'lucide-react'

interface Point {
  x: number
  y: number
}

interface DrawingElement {
  id: string
  type: string
  points: Point[]
  style: {
    stroke: string
    strokeWidth: number
    fill?: string
    fillOpacity?: number
    lineType?: 'solid' | 'dashed' | 'dotted'
    lineCap?: 'butt' | 'round' | 'square'
    lineJoin?: 'miter' | 'round' | 'bevel'
    fontSize?: number
    fontFamily?: string
  }
  layer?: string
  text?: string
  fontSize?: number
  fontFamily?: string
  locked?: boolean
  closed?: boolean
  radius?: number
  startAngle?: number
  endAngle?: number
  controlPoints?: Point[]
  [key: string]: any
}

interface LiftingScenarioLibraryProps {
  isOpen: boolean
  onClose: () => void
  onInsertObject: (element: DrawingElement) => void
}

// Pre-made objects for lifting scenarios - hard to draw items
const SCENARIO_OBJECTS = {
  buildings: [
    {
      id: 'building-2story',
      name: '2-Story Building',
      description: 'Simple 2-story structure',
      width: 150,
      height: 200,
      color: '#8B7355',
      strokeWidth: 3
    },
    {
      id: 'building-4story',
      name: '4-Story Building',
      description: 'Urban building with rooftop',
      width: 180,
      height: 350,
      color: '#A0826D',
      strokeWidth: 3
    },
    {
      id: 'building-warehouse',
      name: 'Warehouse',
      description: 'Large industrial warehouse',
      width: 400,
      height: 180,
      color: '#A9A9A9',
      strokeWidth: 3
    },
    {
      id: 'building-factory',
      name: 'Factory',
      description: 'Multi-bay factory building',
      width: 500,
      height: 200,
      color: '#808080',
      strokeWidth: 3
    }
  ],
  vessels: [
    {
      id: 'tank-cylindrical',
      name: 'Cylindrical Tank',
      description: 'Vertical storage tank',
      width: 120,
      height: 200,
      color: '#4169E1',
      strokeWidth: 2,
      shape: 'cylinder'
    },
    {
      id: 'tank-horizontal',
      name: 'Horizontal Tank',
      description: 'Horizontal storage vessel',
      width: 300,
      height: 100,
      color: '#4169E1',
      strokeWidth: 2,
      shape: 'ellipse'
    },
    {
      id: 'pressure-vessel',
      name: 'Pressure Vessel',
      description: 'High-pressure storage vessel',
      width: 100,
      height: 180,
      color: '#FF6347',
      strokeWidth: 3,
      shape: 'cylinder'
    },
    {
      id: 'tank-conical',
      name: 'Conical Tank',
      description: 'Cone-shaped storage tank',
      width: 140,
      height: 220,
      color: '#DAA520',
      strokeWidth: 2,
      shape: 'triangle'
    }
  ],
  structures: [
    {
      id: 'steel-frame',
      name: 'Steel Frame',
      description: 'Multi-level steel structure',
      width: 200,
      height: 300,
      color: '#696969',
      strokeWidth: 2,
      pattern: 'grid'
    },
    {
      id: 'scaffold',
      name: 'Scaffolding',
      description: 'Temporary work platform',
      width: 150,
      height: 250,
      color: '#FFD700',
      strokeWidth: 1,
      pattern: 'grid'
    },
    {
      id: 'tower',
      name: 'Tower Structure',
      description: 'Tall tower/mast',
      width: 80,
      height: 400,
      color: '#696969',
      strokeWidth: 2
    },
    {
      id: 'bridge',
      name: 'Bridge Span',
      description: 'Structural bridge',
      width: 400,
      height: 60,
      color: '#8B4513',
      strokeWidth: 3
    }
  ],
  equipment: [
    {
      id: 'pump-unit',
      name: 'Pump Unit',
      description: 'Industrial pump assembly',
      width: 80,
      height: 100,
      color: '#FF8C00',
      strokeWidth: 2
    },
    {
      id: 'compressor',
      name: 'Air Compressor',
      description: 'Large compressor unit',
      width: 120,
      height: 150,
      color: '#DC143C',
      strokeWidth: 2
    },
    {
      id: 'generator-set',
      name: 'Generator Set',
      description: 'Power generation unit',
      width: 150,
      height: 100,
      color: '#FF4500',
      strokeWidth: 2
    },
    {
      id: 'hvac-unit',
      name: 'HVAC Unit',
      description: 'Rooftop HVAC system',
      width: 100,
      height: 80,
      color: '#4169E1',
      strokeWidth: 2
    }
  ],
  infrastructure: [
    {
      id: 'power-pole',
      name: 'Power Pole',
      description: 'Utility pole with lines',
      width: 30,
      height: 250,
      color: '#8B4513',
      strokeWidth: 2
    },
    {
      id: 'power-lines',
      name: 'Power Lines',
      description: 'Overhead electrical lines',
      width: 400,
      height: 15,
      color: '#FFD700',
      strokeWidth: 3,
      pattern: 'dashed'
    },
    {
      id: 'fence',
      name: 'Fence/Barrier',
      description: 'Perimeter fence',
      width: 300,
      height: 20,
      color: '#696969',
      strokeWidth: 2,
      pattern: 'dashed'
    },
    {
      id: 'road',
      name: 'Road/Access',
      description: 'Access road',
      width: 200,
      height: 40,
      color: '#A9A9A9',
      strokeWidth: 1
    }
  ]
}

export default function LiftingScenarioLibrary({
  isOpen,
  onClose,
  onInsertObject
}: LiftingScenarioLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof SCENARIO_OBJECTS>('buildings')

  if (!isOpen) return null

  const handleInsertObject = (obj: any) => {
    const element: DrawingElement = {
      id: `${obj.id}-${Date.now()}`,
      type: 'rectangle',
      points: [
        { x: 200, y: 200 },
        { x: 200 + obj.width, y: 200 + obj.height }
      ],
      style: {
        stroke: obj.color,
        strokeWidth: obj.strokeWidth,
        fill: obj.color,
        fillOpacity: obj.fillOpacity || 0.3,
        lineType: obj.pattern || 'solid'
      },
      text: obj.name,
      layer: 'layer1'
    }
    onInsertObject(element)
    onClose()
  }

  const currentObjects = SCENARIO_OBJECTS[selectedCategory]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Lifting Scenario Objects</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {Object.keys(SCENARIO_OBJECTS).map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category as keyof typeof SCENARIO_OBJECTS)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Objects Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {currentObjects.map(obj => (
              <Button
                key={obj.id}
                onClick={() => handleInsertObject(obj)}
                className="h-auto p-2 bg-slate-700 hover:bg-slate-600 text-left flex flex-col items-start text-xs"
              >
                <div className="font-semibold text-white text-sm">{obj.name}</div>
                <div className="text-xs text-slate-400">{obj.description}</div>
                <div className="mt-1 flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  <span className="text-xs">Insert</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

