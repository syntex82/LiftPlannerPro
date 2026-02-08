"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Factory } from "lucide-react"
import { SITE_OBJECTS, SITE_OBJECT_CATEGORIES, SiteObjectBlock } from '@/lib/site-objects'

interface Point {
  x: number
  y: number
}

interface DrawingElement {
  id: string
  type: 'line' | 'rectangle' | 'circle' | 'dimension' | 'arcDimension' | 'text' | 'polyline' | 'arc' | 'spline' | 'table' | 'titleblock' | 'logo' | 'image' | 'block' | 'assembled-crane'
  points: Point[]
  style: {
    stroke: string
    strokeWidth: number
    fill?: string
    fillOpacity?: number
    lineType?: 'solid' | 'dashed' | 'dotted'
  }
  layer?: string
  locked?: boolean
  blockElements?: DrawingElement[]
  blockScale?: number
  blockRotation?: number
}

interface SiteObjectsLibraryProps {
  isOpen: boolean
  onClose: () => void
  onInsertObject: (element: DrawingElement) => void
}

// Convert SiteObjectBlock to DrawingElement
const siteObjectToDrawingElement = (block: SiteObjectBlock, position: Point): DrawingElement => {
  const blockElements: DrawingElement[] = []

  // Convert lines
  block.lines.forEach((line, idx) => {
    blockElements.push({
      id: `${block.id}-line-${idx}`,
      type: 'line',
      points: [
        { x: line[0], y: line[1] },
        { x: line[2], y: line[3] }
      ],
      style: { stroke: '#06b6d4', strokeWidth: 2 },
      layer: 'layer1'
    })
  })

  // Convert circles
  block.circles?.forEach((circle, idx) => {
    const cx = circle[0], cy = circle[1], r = circle[2]
    blockElements.push({
      id: `${block.id}-circle-${idx}`,
      type: 'circle',
      points: [
        { x: cx, y: cy },
        { x: cx + r, y: cy }
      ],
      style: { stroke: '#06b6d4', strokeWidth: 2 },
      layer: 'layer1'
    })
  })

  // Convert rectangles - render as 4 lines
  block.rects?.forEach((rect, idx) => {
    const x = rect[0], y = rect[1], w = rect[2], h = rect[3]
    blockElements.push({
      id: `${block.id}-rect-${idx}-top`,
      type: 'line',
      points: [{ x, y }, { x: x + w, y }],
      style: { stroke: '#06b6d4', strokeWidth: 2 },
      layer: 'layer1'
    })
    blockElements.push({
      id: `${block.id}-rect-${idx}-right`,
      type: 'line',
      points: [{ x: x + w, y }, { x: x + w, y: y + h }],
      style: { stroke: '#06b6d4', strokeWidth: 2 },
      layer: 'layer1'
    })
    blockElements.push({
      id: `${block.id}-rect-${idx}-bottom`,
      type: 'line',
      points: [{ x: x + w, y: y + h }, { x, y: y + h }],
      style: { stroke: '#06b6d4', strokeWidth: 2 },
      layer: 'layer1'
    })
    blockElements.push({
      id: `${block.id}-rect-${idx}-left`,
      type: 'line',
      points: [{ x, y: y + h }, { x, y }],
      style: { stroke: '#06b6d4', strokeWidth: 2 },
      layer: 'layer1'
    })
  })

  return {
    id: `${block.id}-${Date.now()}`,
    type: 'block',
    points: [position],
    blockElements,
    blockScale: 1,
    blockRotation: 0,
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    layer: 'layer1'
  }
}

// Preview canvas component
function BlockPreview({ block }: { block: SiteObjectBlock }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear with dark background
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, 100, 100)

    // Calculate bounds for auto-scaling
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    block.lines.forEach(line => {
      minX = Math.min(minX, line[0], line[2])
      maxX = Math.max(maxX, line[0], line[2])
      minY = Math.min(minY, line[1], line[3])
      maxY = Math.max(maxY, line[1], line[3])
    })

    block.circles?.forEach(circle => {
      minX = Math.min(minX, circle[0] - circle[2])
      maxX = Math.max(maxX, circle[0] + circle[2])
      minY = Math.min(minY, circle[1] - circle[2])
      maxY = Math.max(maxY, circle[1] + circle[2])
    })

    block.rects?.forEach(rect => {
      minX = Math.min(minX, rect[0])
      maxX = Math.max(maxX, rect[0] + rect[2])
      minY = Math.min(minY, rect[1])
      maxY = Math.max(maxY, rect[1] + rect[3])
    })

    if (minX === Infinity) {
      minX = 0; maxX = 100; minY = 0; maxY = 100
    }

    const width = maxX - minX || 1
    const height = maxY - minY || 1
    const scale = Math.min(80 / width, 80 / height, 1)
    const offsetX = 50 - (minX + width / 2) * scale
    const offsetY = 50 - (minY + height / 2) * scale

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    // Draw style - cyan for industrial equipment
    ctx.strokeStyle = '#06b6d4'
    ctx.lineWidth = 2 / scale
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Draw lines
    block.lines.forEach(line => {
      ctx.beginPath()
      ctx.moveTo(line[0], line[1])
      ctx.lineTo(line[2], line[3])
      ctx.stroke()
    })

    // Draw circles
    block.circles?.forEach(circle => {
      ctx.beginPath()
      ctx.arc(circle[0], circle[1], circle[2], 0, Math.PI * 2)
      ctx.stroke()
    })

    // Draw rectangles
    block.rects?.forEach(rect => {
      ctx.strokeRect(rect[0], rect[1], rect[2], rect[3])
    })

    ctx.restore()
  }, [block])

  return <canvas ref={canvasRef} width={100} height={100} className="rounded" />
}

export default function SiteObjectsLibrary({ isOpen, onClose, onInsertObject }: SiteObjectsLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('vessels')

  if (!isOpen) return null

  const handleInsert = (block: SiteObjectBlock) => {
    const element = siteObjectToDrawingElement(block, { x: 300, y: 300 })
    onInsertObject(element)
    onClose()
  }

  const filteredBlocks = SITE_OBJECTS.filter(b => b.category === selectedCategory)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <Card className="w-full max-w-5xl bg-slate-800 border-slate-700 max-h-[85vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-white">Site Objects Library - Industrial Equipment</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-4 overflow-y-auto flex-1">
          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {SITE_OBJECT_CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredBlocks.map(block => (
              <Button
                key={block.id}
                onClick={() => handleInsert(block)}
                className="h-auto p-3 bg-slate-700 hover:bg-slate-600 flex flex-col items-center"
              >
                <BlockPreview block={block} />
                <div className="text-xs font-medium text-white mt-2">{block.name}</div>
                <div className="text-[10px] text-slate-400 text-center">{block.description}</div>
                {block.weight && (
                  <div className="text-[10px] text-cyan-400 mt-0.5">Weight: {block.weight}</div>
                )}
              </Button>
            ))}
          </div>

          {filteredBlocks.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              No equipment in this category yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

