'use client'

import { useEffect, useRef, useState } from 'react'

interface Point {
  x: number
  y: number
}

interface AnimatedElement {
  type: 'line' | 'circle' | 'rectangle' | 'dimension' | 'crane' | 'text'
  points: Point[]
  progress: number
  delay: number
  color: string
  width?: number
  radius?: number
  text?: string
}

export default function AnimatedCAD() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [time, setTime] = useState(0)
  const animationRef = useRef<number>(0)

  // Define CAD elements to animate
  const elements: AnimatedElement[] = [
    // Grid lines (subtle)
    ...Array.from({ length: 10 }, (_, i) => ({
      type: 'line' as const,
      points: [{ x: i * 60, y: 0 }, { x: i * 60, y: 400 }],
      progress: 0,
      delay: 0,
      color: 'rgba(59, 130, 246, 0.1)',
      width: 1
    })),
    ...Array.from({ length: 8 }, (_, i) => ({
      type: 'line' as const,
      points: [{ x: 0, y: i * 60 }, { x: 600, y: i * 60 }],
      progress: 0,
      delay: 0,
      color: 'rgba(59, 130, 246, 0.1)',
      width: 1
    })),
    // Crane base
    { type: 'rectangle' as const, points: [{ x: 220, y: 280 }, { x: 320, y: 320 }], progress: 0, delay: 500, color: '#3b82f6', width: 2 },
    // Outriggers
    { type: 'line' as const, points: [{ x: 200, y: 300 }, { x: 160, y: 340 }], progress: 0, delay: 800, color: '#60a5fa', width: 2 },
    { type: 'line' as const, points: [{ x: 340, y: 300 }, { x: 380, y: 340 }], progress: 0, delay: 800, color: '#60a5fa', width: 2 },
    // Outrigger pads
    { type: 'rectangle' as const, points: [{ x: 140, y: 330 }, { x: 180, y: 350 }], progress: 0, delay: 1000, color: '#10b981', width: 2 },
    { type: 'rectangle' as const, points: [{ x: 360, y: 330 }, { x: 400, y: 350 }], progress: 0, delay: 1000, color: '#10b981', width: 2 },
    // Crane boom (main)
    { type: 'line' as const, points: [{ x: 270, y: 280 }, { x: 420, y: 120 }], progress: 0, delay: 1200, color: '#f59e0b', width: 3 },
    // Load hook
    { type: 'line' as const, points: [{ x: 420, y: 120 }, { x: 420, y: 200 }], progress: 0, delay: 1500, color: '#94a3b8', width: 2 },
    // Load
    { type: 'rectangle' as const, points: [{ x: 390, y: 200 }, { x: 450, y: 250 }], progress: 0, delay: 1700, color: '#ef4444', width: 2 },
    // Swing radius arc
    { type: 'circle' as const, points: [{ x: 270, y: 300 }], radius: 180, progress: 0, delay: 2000, color: 'rgba(251, 191, 36, 0.3)', width: 1 },
    // Dimension lines
    { type: 'dimension' as const, points: [{ x: 270, y: 350 }, { x: 420, y: 350 }], progress: 0, delay: 2300, color: '#22d3ee', width: 1, text: '15.2m' },
    { type: 'dimension' as const, points: [{ x: 450, y: 120 }, { x: 450, y: 300 }], progress: 0, delay: 2500, color: '#22d3ee', width: 1, text: '18.0m' },
    // Landing zone
    { type: 'rectangle' as const, points: [{ x: 480, y: 220 }, { x: 560, y: 280 }], progress: 0, delay: 2700, color: '#10b981', width: 2 },
    // Exclusion zone label
    { type: 'text' as const, points: [{ x: 90, y: 380 }], progress: 0, delay: 3000, color: '#f87171', text: 'EXCLUSION ZONE' },
    // Safety text
    { type: 'text' as const, points: [{ x: 490, y: 310 }], progress: 0, delay: 3200, color: '#4ade80', text: 'LANDING' },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      setTime(prev => prev + 16) // ~60fps
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw each element based on progress
    elements.forEach(el => {
      const elapsedSinceStart = time - el.delay
      if (elapsedSinceStart < 0) return

      const progress = Math.min(1, elapsedSinceStart / 800) // 800ms animation per element
      const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease out cubic

      ctx.strokeStyle = el.color
      ctx.fillStyle = el.color
      ctx.lineWidth = el.width || 1
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      switch (el.type) {
        case 'line':
          drawAnimatedLine(ctx, el.points[0], el.points[1], easeProgress)
          break
        case 'rectangle':
          drawAnimatedRectangle(ctx, el.points[0], el.points[1], easeProgress)
          break
        case 'circle':
          drawAnimatedCircle(ctx, el.points[0], el.radius || 50, easeProgress)
          break
        case 'dimension':
          drawAnimatedDimension(ctx, el.points[0], el.points[1], el.text || '', easeProgress)
          break
        case 'text':
          if (progress >= 1) {
            ctx.font = '12px monospace'
            ctx.globalAlpha = Math.min(1, (elapsedSinceStart - 800) / 300)
            ctx.fillText(el.text || '', el.points[0].x, el.points[0].y)
            ctx.globalAlpha = 1
          }
          break
      }
    })

    // Add animated cursor
    if (time > 3500) {
      const cursorX = 300 + Math.sin(time / 500) * 50
      const cursorY = 200 + Math.cos(time / 700) * 30
      
      // Cursor crosshair
      ctx.strokeStyle = '#22d3ee'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cursorX - 10, cursorY)
      ctx.lineTo(cursorX + 10, cursorY)
      ctx.moveTo(cursorX, cursorY - 10)
      ctx.lineTo(cursorX, cursorY + 10)
      ctx.stroke()
      
      // Coordinate display
      ctx.font = '10px monospace'
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(`X: ${Math.round(cursorX)} Y: ${Math.round(cursorY)}`, cursorX + 15, cursorY - 5)
    }
  }, [time])

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="w-full max-w-2xl mx-auto rounded-xl opacity-80"
    />
  )
}

function drawAnimatedLine(ctx: CanvasRenderingContext2D, start: Point, end: Point, progress: number) {
  const currentEnd = {
    x: start.x + (end.x - start.x) * progress,
    y: start.y + (end.y - start.y) * progress
  }
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(currentEnd.x, currentEnd.y)
  ctx.stroke()
}

function drawAnimatedRectangle(ctx: CanvasRenderingContext2D, topLeft: Point, bottomRight: Point, progress: number) {
  const width = bottomRight.x - topLeft.x
  const height = bottomRight.y - topLeft.y
  const perimeter = (width + height) * 2
  const currentLength = perimeter * progress

  ctx.beginPath()
  ctx.moveTo(topLeft.x, topLeft.y)

  // Draw perimeter progressively
  let remaining = currentLength

  // Top edge
  if (remaining > 0) {
    const draw = Math.min(remaining, width)
    ctx.lineTo(topLeft.x + draw, topLeft.y)
    remaining -= draw
  }

  // Right edge
  if (remaining > 0) {
    const draw = Math.min(remaining, height)
    ctx.lineTo(bottomRight.x, topLeft.y + draw)
    remaining -= draw
  }

  // Bottom edge
  if (remaining > 0) {
    const draw = Math.min(remaining, width)
    ctx.lineTo(bottomRight.x - draw, bottomRight.y)
    remaining -= draw
  }

  // Left edge
  if (remaining > 0) {
    const draw = Math.min(remaining, height)
    ctx.lineTo(topLeft.x, bottomRight.y - draw)
  }

  ctx.stroke()
}

function drawAnimatedCircle(ctx: CanvasRenderingContext2D, center: Point, radius: number, progress: number) {
  ctx.beginPath()
  ctx.arc(center.x, center.y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
  ctx.stroke()
}

function drawAnimatedDimension(ctx: CanvasRenderingContext2D, start: Point, end: Point, text: string, progress: number) {
  const isHorizontal = Math.abs(end.y - start.y) < Math.abs(end.x - start.x)

  // Draw dimension line
  drawAnimatedLine(ctx, start, end, progress)

  // Draw end ticks
  if (progress > 0.1) {
    const tickSize = 8
    if (isHorizontal) {
      ctx.beginPath()
      ctx.moveTo(start.x, start.y - tickSize)
      ctx.lineTo(start.x, start.y + tickSize)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.moveTo(start.x - tickSize, start.y)
      ctx.lineTo(start.x + tickSize, start.y)
      ctx.stroke()
    }
  }

  if (progress > 0.9) {
    const tickSize = 8
    if (isHorizontal) {
      ctx.beginPath()
      ctx.moveTo(end.x, end.y - tickSize)
      ctx.lineTo(end.x, end.y + tickSize)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.moveTo(end.x - tickSize, end.y)
      ctx.lineTo(end.x + tickSize, end.y)
      ctx.stroke()
    }
  }

  // Draw text
  if (progress >= 1) {
    ctx.font = 'bold 12px monospace'
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2
    const textWidth = ctx.measureText(text).width

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(midX - textWidth/2 - 4, midY - 8, textWidth + 8, 16)
    ctx.fillStyle = '#22d3ee'
    ctx.fillText(text, midX - textWidth/2, midY + 4)
  }
}

