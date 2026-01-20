"use client"

// Site Visualization Component - Renders the training scenario site with all obstructions and ground conditions
// This is where trainees see the site layout they need to work with

import { useRef, useEffect, useState } from 'react'
import { TrainingScenario } from '@/lib/training-scenarios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SiteVisualizationProps {
  scenario: TrainingScenario
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

export default function SiteVisualization({ scenario, onCanvasReady }: SiteVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scale, setScale] = useState(1) // pixels per meter

  // Draw the site visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Calculate scale to fit site on canvas
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const scaleX = canvasWidth / scenario.siteWidth
    const scaleY = canvasHeight / scenario.siteHeight
    const calculatedScale = Math.min(scaleX, scaleY) * 0.95 // 95% to leave margin

    setScale(calculatedScale)

    // Clear canvas
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw grid
    drawGrid(ctx, canvasWidth, canvasHeight, calculatedScale)

    // Draw ground conditions first (background)
    scenario.groundConditions.forEach(ground => {
      drawGroundCondition(ctx, ground, calculatedScale)
    })

    // Draw obstructions
    scenario.obstructions.forEach(obstruction => {
      drawObstruction(ctx, obstruction, calculatedScale)
    })

    // Draw load
    drawLoad(ctx, scenario, calculatedScale)

    // Draw site boundary
    drawSiteBoundary(ctx, scenario, calculatedScale)

    // Notify parent that canvas is ready
    if (onCanvasReady) {
      onCanvasReady(canvas)
    }
  }, [scenario, onCanvasReady])

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Site Layout</CardTitle>
        <p className="text-xs text-slate-400 mt-1">{scenario.siteDescription}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-slate-700 bg-white rounded w-full"
          />
          <div className="text-xs text-slate-400 space-y-1">
            <p>Site: {scenario.siteWidth}m × {scenario.siteHeight}m</p>
            <p>Load: {scenario.load.name} ({scenario.load.weight}kg)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Draw grid lines for reference
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number
) {
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1

  // Vertical lines (every 5 meters)
  for (let x = 0; x < width; x += scale * 5) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal lines (every 5 meters)
  for (let y = 0; y < height; y += scale * 5) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

// Draw a ground condition area
function drawGroundCondition(
  ctx: CanvasRenderingContext2D,
  ground: any,
  scale: number
) {
  const x = ground.x * scale
  const y = ground.y * scale
  const width = ground.width * scale
  const height = ground.height * scale

  // Color based on type and risk
  let color = '#cccccc'
  if (ground.type === 'hard') color = '#999999'
  if (ground.type === 'soft') color = '#d4a574'
  if (ground.type === 'sloped') color = '#b8860b'
  if (ground.type === 'water') color = '#87ceeb'

  // Adjust opacity based on risk
  ctx.globalAlpha = 0.3
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height)
  ctx.globalAlpha = 1.0

  // Draw border
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, width, height)

  // Draw label with background for visibility
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Measure text to draw background
  const textMetrics = ctx.measureText(ground.description)
  const textWidth = textMetrics.width
  const textHeight = 14
  const padding = 3

  // Draw semi-transparent white background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.fillRect(
    x + width / 2 - textWidth / 2 - padding,
    y + height / 2 - textHeight / 2 - padding,
    textWidth + padding * 2,
    textHeight + padding * 2
  )

  // Draw text
  ctx.fillStyle = '#000000'
  ctx.fillText(ground.description, x + width / 2, y + height / 2)
}

// Draw an obstruction
function drawObstruction(
  ctx: CanvasRenderingContext2D,
  obstruction: any,
  scale: number
) {
  const x = obstruction.x * scale
  const y = obstruction.y * scale
  const width = obstruction.width * scale
  const height = obstruction.height * scale

  // Color based on type and hazard level
  let color = '#666666'
  if (obstruction.type === 'building') color = '#8b4513'
  if (obstruction.type === 'tree') color = '#228b22'
  if (obstruction.type === 'power_line') color = '#ff0000'
  if (obstruction.type === 'fence') color = '#a9a9a9'
  if (obstruction.type === 'vehicle') color = '#4169e1'

  // Darker for high hazard
  if (obstruction.hazardLevel === 'high') {
    ctx.globalAlpha = 0.8
  } else if (obstruction.hazardLevel === 'medium') {
    ctx.globalAlpha = 0.6
  } else {
    ctx.globalAlpha = 0.4
  }

  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height)
  ctx.globalAlpha = 1.0

  // Draw border
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.strokeRect(x, y, width, height)

  // Draw label with background for visibility
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 11px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Measure text to draw background
  const textMetrics = ctx.measureText(obstruction.description)
  const textWidth = textMetrics.width
  const textHeight = 14
  const padding = 3

  // Draw semi-transparent background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(
    x + width / 2 - textWidth / 2 - padding,
    y + height / 2 - textHeight / 2 - padding,
    textWidth + padding * 2,
    textHeight + padding * 2
  )

  // Draw text
  ctx.fillStyle = '#ffffff'
  ctx.fillText(obstruction.description, x + width / 2, y + height / 2)
}

// Draw the load to be lifted
function drawLoad(
  ctx: CanvasRenderingContext2D,
  scenario: TrainingScenario,
  scale: number
) {
  // Position load at center of site for now
  const x = (scenario.siteWidth / 2 - scenario.load.width / 2) * scale
  const y = (scenario.siteHeight / 2 - scenario.load.height / 2) * scale
  const width = scenario.load.width * scale
  const height = scenario.load.height * scale

  // Draw load
  ctx.fillStyle = '#ffff00'
  ctx.globalAlpha = 0.7
  ctx.fillRect(x, y, width, height)
  ctx.globalAlpha = 1.0

  // Draw border
  ctx.strokeStyle = '#ff8800'
  ctx.lineWidth = 3
  ctx.strokeRect(x, y, width, height)

  // Draw label (two lines) with background
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Measure text
  const nameMetrics = ctx.measureText(scenario.load.name)
  const weightMetrics = ctx.measureText(`${scenario.load.weight}kg`)
  const maxTextWidth = Math.max(nameMetrics.width, weightMetrics.width)
  const textHeight = 14
  const padding = 3

  // Draw semi-transparent background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(
    x + width / 2 - maxTextWidth / 2 - padding,
    y + height / 2 - 16 - padding,
    maxTextWidth + padding * 2,
    32 + padding * 2
  )

  // Draw text
  ctx.fillStyle = '#ffffff'
  ctx.fillText(scenario.load.name, x + width / 2, y + height / 2 - 8)
  ctx.fillText(`${scenario.load.weight}kg`, x + width / 2, y + height / 2 + 8)
}

// Draw site boundary
function drawSiteBoundary(
  ctx: CanvasRenderingContext2D,
  scenario: TrainingScenario,
  scale: number
) {
  const width = scenario.siteWidth * scale
  const height = scenario.siteHeight * scale

  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 3
  ctx.strokeRect(0, 0, width, height)
}

