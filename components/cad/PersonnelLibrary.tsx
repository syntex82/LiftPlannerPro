"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Users } from "lucide-react"
import { PERSONNEL_BLOCKS, PERSONNEL_CATEGORIES, PersonnelBlock } from '@/lib/personnel-blocks'

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

interface PersonnelLibraryProps {
  isOpen: boolean
  onClose: () => void
  onInsertPersonnel: (element: DrawingElement) => void
}

// Convert PersonnelBlock to DrawingElement
const personnelToDrawingElement = (block: PersonnelBlock, position: Point): DrawingElement => {
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
      style: { stroke: '#000000', strokeWidth: 2 },
      layer: 'layer1'
    })
  })

  // Convert circles (heads) - need 2 points: center and edge point
  block.circles?.forEach((circle, idx) => {
    const cx = circle[0], cy = circle[1], r = circle[2]
    blockElements.push({
      id: `${block.id}-circle-${idx}`,
      type: 'circle',
      points: [
        { x: cx, y: cy },           // center
        { x: cx + r, y: cy }        // edge point (right side)
      ],
      style: { stroke: '#000000', strokeWidth: 2 },
      layer: 'layer1'
    })
  })

  // Convert ellipses (hard hat domes) - render as circles with average radius
  block.ellipses?.forEach((ellipse, idx) => {
    const cx = ellipse[0], cy = ellipse[1], r = (ellipse[2] + ellipse[3]) / 2
    blockElements.push({
      id: `${block.id}-ellipse-${idx}`,
      type: 'circle',
      points: [
        { x: cx, y: cy },           // center
        { x: cx + r, y: cy }        // edge point
      ],
      style: { stroke: '#000000', strokeWidth: 2 },
      layer: 'layer1'
    })
  })

  // Convert rectangles - render as 4 lines
  block.rects?.forEach((rect, idx) => {
    const x = rect[0], y = rect[1], w = rect[2], h = rect[3]
    // Top
    blockElements.push({
      id: `${block.id}-rect-${idx}-top`,
      type: 'line',
      points: [{ x, y }, { x: x + w, y }],
      style: { stroke: '#000000', strokeWidth: 2 },
      layer: 'layer1'
    })
    // Right
    blockElements.push({
      id: `${block.id}-rect-${idx}-right`,
      type: 'line',
      points: [{ x: x + w, y }, { x: x + w, y: y + h }],
      style: { stroke: '#000000', strokeWidth: 2 },
      layer: 'layer1'
    })
    // Bottom
    blockElements.push({
      id: `${block.id}-rect-${idx}-bottom`,
      type: 'line',
      points: [{ x: x + w, y: y + h }, { x, y: y + h }],
      style: { stroke: '#000000', strokeWidth: 2 },
      layer: 'layer1'
    })
    // Left
    blockElements.push({
      id: `${block.id}-rect-${idx}-left`,
      type: 'line',
      points: [{ x, y: y + h }, { x, y }],
      style: { stroke: '#000000', strokeWidth: 2 },
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
    style: { stroke: '#000000', strokeWidth: 2 },
    layer: 'layer1'
  }
}

// Preview canvas component
function BlockPreview({ block }: { block: PersonnelBlock }) {
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

    block.ellipses?.forEach(ellipse => {
      minX = Math.min(minX, ellipse[0] - ellipse[2])
      maxX = Math.max(maxX, ellipse[0] + ellipse[2])
      minY = Math.min(minY, ellipse[1] - ellipse[3])
      maxY = Math.max(maxY, ellipse[1] + ellipse[3])
    })

    const width = maxX - minX
    const height = maxY - minY
    const scale = Math.min(85 / width, 85 / height, 0.5) // Limit scale to 0.5 for larger figures
    const offsetX = 50 - (minX + width / 2) * scale
    const offsetY = 50 - (minY + height / 2) * scale

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    // Draw style
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2 / scale // Keep consistent line width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Draw lines
    block.lines.forEach(line => {
      ctx.beginPath()
      ctx.moveTo(line[0], line[1])
      ctx.lineTo(line[2], line[3])
      ctx.stroke()
    })

    // Draw circles (heads)
    block.circles?.forEach(circle => {
      ctx.beginPath()
      ctx.arc(circle[0], circle[1], circle[2], 0, Math.PI * 2)
      ctx.stroke()
    })

    // Draw ellipses (hard hat domes)
    block.ellipses?.forEach(ellipse => {
      ctx.beginPath()
      ctx.ellipse(ellipse[0], ellipse[1], ellipse[2], ellipse[3], 0, 0, Math.PI * 2)
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

export default function PersonnelLibrary({ isOpen, onClose, onInsertPersonnel }: PersonnelLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('signaller')

  if (!isOpen) return null

  const handleInsert = (block: PersonnelBlock) => {
    const element = personnelToDrawingElement(block, { x: 300, y: 300 })
    onInsertPersonnel(element)
    onClose()
  }

  const filteredBlocks = PERSONNEL_BLOCKS.filter(b => b.category === selectedCategory)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <Card className="w-full max-w-3xl bg-slate-800 border-slate-700 max-h-[85vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-white">Lifting Personnel</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-4 overflow-y-auto flex-1">
          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {PERSONNEL_CATEGORIES.map(cat => (
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

          {/* Personnel Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {filteredBlocks.map(block => (
              <Button
                key={block.id}
                onClick={() => handleInsert(block)}
                className="h-auto p-2 bg-slate-700 hover:bg-slate-600 flex flex-col items-center"
              >
                <BlockPreview block={block} />
                <div className="text-xs font-medium text-white mt-1">{block.name}</div>
                <div className="text-[10px] text-slate-400">{block.description}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

