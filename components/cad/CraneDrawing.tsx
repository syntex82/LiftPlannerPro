"use client"

import { useEffect, useRef } from 'react'
import { CraneSpecifications } from '@/lib/crane-models'

interface CraneDrawingProps {
  crane: CraneSpecifications
  position: { x: number, y: number }
  scale: number
  boomAngle?: number
  boomExtension?: number
  rotation?: number
  showLoadChart?: boolean
  onUpdate?: (craneData: any) => void
}

export default function CraneDrawing({
  crane,
  position,
  scale = 1,
  boomAngle = 45,
  boomExtension = 0.5,
  rotation = 0,
  showLoadChart = false,
  onUpdate
}: CraneDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    drawCrane()
  }, [crane, position, scale, boomAngle, boomExtension, rotation])

  const drawCrane = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up drawing context
    ctx.save()
    ctx.translate(position.x, position.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale * crane.cadData.scale, scale * crane.cadData.scale)

    // Set crane color and line weight
    ctx.strokeStyle = crane.cadData.color
    ctx.lineWidth = crane.cadData.lineWeight
    ctx.fillStyle = crane.cadData.color + '40' // Semi-transparent fill

    let boomEnd = null

    // Draw crane base/tracks
    if (crane.type === 'crawler' && crane.cadData.trackPoints) {
      drawTracks(ctx, crane.cadData.trackPoints)
    } else {
      drawBase(ctx, crane.cadData.basePoints)
    }

    // Draw counterweight
    drawCounterweight(ctx, crane.cadData.counterweightPoints)

    // Draw cab
    drawCab(ctx, crane.cadData.cabPoints)

    // Draw boom and get end position
    boomEnd = drawBoom(ctx, crane.cadData.boomPoints, boomAngle, boomExtension)

    // Draw outriggers (if applicable)
    if (crane.cadData.outriggerPoints && (crane.type === 'all-terrain' || crane.type === 'truck')) {
      drawOutriggers(ctx, crane.cadData.outriggerPoints)
    }

    // Draw load block and hook
    if (boomEnd) {
      drawLoadBlock(ctx, boomEnd.boomEndX, boomEnd.boomEndY)
    }

    // Draw crane specifications text
    drawSpecifications(ctx)

    // Draw load chart (if enabled)
    if (showLoadChart) {
      drawLoadChart(ctx)
    }

    ctx.restore()
  }

  const drawPlanViewCrane = (ctx: CanvasRenderingContext2D, boomAngle: number, boomExtension: number) => {
    // PLAN VIEW - looking down from above like your reference image
    // This shows the crane as seen from directly above, with boom rotating like a clock hand

    // 1. Draw main chassis (long rectangular body) - matches your reference image
    ctx.fillStyle = '#FFD700' // Gold/yellow like your reference image
    ctx.strokeStyle = '#CC9900'
    ctx.lineWidth = 2

    // Main chassis body - long rectangle representing the crane carrier
    ctx.fillRect(-100, -15, 200, 30) // Longer and slightly wider for better proportions
    ctx.strokeRect(-100, -15, 200, 30)

    // Add chassis details - engine compartment sections
    ctx.strokeStyle = '#B8860B'
    ctx.lineWidth = 1
    // Vertical dividers to show chassis sections
    for (let i = -80; i <= 80; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, -15)
      ctx.lineTo(i, 15)
      ctx.stroke()
    }

    // 2. Draw outriggers extending from corners at proper angles
    const outriggerPositions = [
      { x: -85, y: -15, angle: 225 }, // Rear left - 45° down-left
      { x: 85, y: -15, angle: 315 },  // Front left - 45° up-left
      { x: 85, y: 15, angle: 45 },    // Front right - 45° up-right
      { x: -85, y: 15, angle: 135 }   // Rear right - 45° down-right
    ]

    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'

    outriggerPositions.forEach(pos => {
      // Calculate outrigger end position based on angle
      const outriggerLength = 45
      const angleRad = (pos.angle * Math.PI) / 180
      const armEndX = pos.x + (outriggerLength * Math.cos(angleRad))
      const armEndY = pos.y + (outriggerLength * Math.sin(angleRad))

      // Draw outrigger beam
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(armEndX, armEndY)
      ctx.stroke()

      // Draw outrigger pad (larger circle for better visibility)
      ctx.fillStyle = '#888888'
      ctx.strokeStyle = '#555555'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(armEndX, armEndY, 10, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    })

    // 3. Draw cab at correct position (front-right corner area)
    ctx.fillStyle = '#4A90E2'
    ctx.strokeStyle = '#2E5C8A'
    ctx.lineWidth = 2
    // Position cab more towards front-right, not at the very front
    ctx.fillRect(70, -12, 25, 24)
    ctx.strokeRect(70, -12, 25, 24)

    // Add cab windows
    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(72, -10, 21, 8) // Front windscreen
    ctx.fillRect(72, 2, 21, 8)   // Rear window

    // 4. Draw counterweight at rear
    ctx.fillStyle = '#666666'
    ctx.strokeStyle = '#444444'
    ctx.lineWidth = 2
    ctx.fillRect(-100, -12, 25, 24)
    ctx.strokeRect(-100, -12, 25, 24)

    // Add counterweight details
    ctx.fillStyle = '#555555'
    ctx.fillRect(-98, -10, 21, 20)

    // 5. Draw boom (rotating like clock hand) - this is the key feature
    const boomLength = 50 + (60 * boomExtension) // 50-110 length for better visibility
    // For plan view: boomAngle represents ROTATION (0° = 12 o'clock, increases clockwise)
    // Convert to radians: 0° = pointing up (north), 90° = pointing right (east), etc.
    const rotationRad = ((boomAngle - 90) * Math.PI) / 180 // Subtract 90° so 0° points up like clock
    const boomEndX = boomLength * Math.cos(rotationRad)
    const boomEndY = boomLength * Math.sin(rotationRad)

    // Draw boom as thick line representing boom width in plan view
    ctx.strokeStyle = '#FF6B35'
    ctx.lineWidth = 12 // Thicker to show boom width from above
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(boomEndX, boomEndY)
    ctx.stroke()

    // Draw boom sections to show telescopic extension
    if (boomExtension > 0.1) {
      ctx.strokeStyle = '#E55A2B'
      ctx.lineWidth = 8
      const section1Length = 50 + (20 * boomExtension)
      const section1EndX = section1Length * Math.cos(rotationRad)
      const section1EndY = section1Length * Math.sin(rotationRad)
      ctx.beginPath()
      ctx.moveTo(section1EndX, section1EndY)
      ctx.lineTo(boomEndX, boomEndY)
      ctx.stroke()
    }

    // Draw boom pivot point (turntable center)
    ctx.fillStyle = '#333333'
    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, 8, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    // Draw boom head with more detail
    ctx.fillStyle = '#FF6B35'
    ctx.strokeStyle = '#CC4A1A'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(boomEndX, boomEndY, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    return { boomEndX, boomEndY }
  }

  const drawTracks = (ctx: CanvasRenderingContext2D, points: { x: number, y: number }[]) => {
    ctx.beginPath()
    ctx.fillStyle = '#333333'
    
    // Left track
    const trackWidth = 8
    const trackLength = points[1].x - points[0].x
    
    ctx.fillRect(points[0].x - 2, points[0].y - trackWidth/2, trackLength + 4, trackWidth)
    ctx.fillRect(points[0].x - 2, points[2].y - trackWidth/2, trackLength + 4, trackWidth)
    
    // Track details (drive sprockets, idlers)
    ctx.fillStyle = '#555555'
    for (let i = 0; i < 6; i++) {
      const x = points[0].x + (i * trackLength / 5)
      ctx.fillRect(x, points[0].y - trackWidth/2, 2, trackWidth)
      ctx.fillRect(x, points[2].y - trackWidth/2, 2, trackWidth)
    }
  }

  const drawBase = (ctx: CanvasRenderingContext2D, points: { x: number, y: number }[]) => {
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach(point => ctx.lineTo(point.x, point.y))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  const drawCounterweight = (ctx: CanvasRenderingContext2D, points: { x: number, y: number }[]) => {
    ctx.fillStyle = '#666666'
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach(point => ctx.lineTo(point.x, point.y))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  const drawCab = (ctx: CanvasRenderingContext2D, points: { x: number, y: number }[]) => {
    const isPlanView = (crane.id?.toLowerCase?.().endsWith('-plan')) || (crane.model?.toLowerCase?.().includes('plan view'))

    if (isPlanView) {
      // PLAN VIEW cab - looking down from above
      ctx.fillStyle = '#4A90E2' // Blue cab color for plan view
      ctx.strokeStyle = '#2E5C8A'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      points.forEach(point => ctx.lineTo(point.x, point.y))
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw cab windows (plan view - show as lighter area)
      ctx.fillStyle = '#87CEEB'
      const windowWidth = (points[1].x - points[0].x) * 0.7
      const windowHeight = (points[2].y - points[1].y) * 0.7
      ctx.fillRect(
        points[0].x + (points[1].x - points[0].x) * 0.15,
        points[0].y + (points[2].y - points[1].y) * 0.15,
        windowWidth,
        windowHeight
      )

      // Add cab details (door outline)
      ctx.strokeStyle = '#2E5C8A'
      ctx.lineWidth = 1
      ctx.strokeRect(
        points[0].x + 2,
        points[0].y + 2,
        (points[1].x - points[0].x) - 4,
        (points[2].y - points[1].y) - 4
      )
    } else {
      // Original side view cab
      ctx.fillStyle = crane.cadData.color + '80'
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      points.forEach(point => ctx.lineTo(point.x, point.y))
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw cab windows
      ctx.fillStyle = '#87CEEB'
      const windowWidth = (points[1].x - points[0].x) * 0.6
      const windowHeight = (points[2].y - points[1].y) * 0.4
      ctx.fillRect(
        points[0].x + (points[1].x - points[0].x) * 0.2,
        points[0].y + (points[2].y - points[1].y) * 0.3,
        windowWidth,
        windowHeight
      )
    }
  }

  const drawBoom = (ctx: CanvasRenderingContext2D, points: { x: number, y: number }[], angle: number, extension: number) => {
    const boomBase = points[0]
    const boomLength = crane.boom.baseLength + (crane.boom.maxLength - crane.boom.baseLength) * extension

    // Check if this is a plan view crane
    const isPlanView = (crane.id?.toLowerCase?.().endsWith('-plan')) || (crane.model?.toLowerCase?.().includes('plan view'))

    if (isPlanView) {
      // PLAN VIEW boom - looking down from above, works like a clock hand
      // For plan view: angle represents ROTATION (0° = 12 o'clock, increases clockwise)
      const rotationRad = ((angle - 90) * Math.PI) / 180 // Subtract 90° so 0° points up like clock
      const scaledLength = boomLength * 1.5 // Scale for plan view visibility
      const boomEndX = boomBase.x + scaledLength * Math.cos(rotationRad)
      const boomEndY = boomBase.y + scaledLength * Math.sin(rotationRad)

      // Draw boom main structure (thick line representing boom width in plan view)
      ctx.lineWidth = 8 // Thick to show boom width from above
      ctx.strokeStyle = '#FF6B35' // Orange boom color
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(boomBase.x, boomBase.y)
      ctx.lineTo(boomEndX, boomEndY)
      ctx.stroke()

      // Draw boom outline (to show boom edges in plan view)
      ctx.lineWidth = 2
      ctx.strokeStyle = '#CC4A1C' // Darker orange for outline
      ctx.beginPath()
      ctx.moveTo(boomBase.x, boomBase.y)
      ctx.lineTo(boomEndX, boomEndY)
      ctx.stroke()

      // Draw telescopic sections (plan view - show as width variations)
      const sections = crane.boom.sections
      for (let i = 1; i < sections; i++) {
        const sectionRatio = i / sections
        const sectionX = boomBase.x + (boomEndX - boomBase.x) * sectionRatio
        const sectionY = boomBase.y + (boomEndY - boomBase.y) * sectionRatio

        // Draw section markers as small rectangles across boom width
        ctx.fillStyle = '#333333'
        ctx.save()
        ctx.translate(sectionX, sectionY)
        ctx.rotate(rotationRad)
        ctx.fillRect(-1, -3, 2, 6) // Small cross-section marker
        ctx.restore()
      }

      // Draw boom pivot point (turntable center)
      ctx.fillStyle = '#222222'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(boomBase.x, boomBase.y, 6, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      // Draw boom head (end of boom)
      ctx.fillStyle = '#FF6B35'
      ctx.beginPath()
      ctx.arc(boomEndX, boomEndY, 4, 0, 2 * Math.PI)
      ctx.fill()

      // Return boom end position for load block
      return { boomEndX, boomEndY }
    } else {
      // Original side view boom
      const boomEndX = boomBase.x + boomLength * Math.cos((angle * Math.PI) / 180) * 10
      const boomEndY = boomBase.y - boomLength * Math.sin((angle * Math.PI) / 180) * 10

      // Draw boom main structure
      ctx.lineWidth = crane.cadData.lineWeight * 2
      ctx.beginPath()
      ctx.moveTo(boomBase.x, boomBase.y)
      ctx.lineTo(boomEndX, boomEndY)
      ctx.stroke()

      // Draw boom sections (telescopic indicators)
      const sections = crane.boom.sections
      for (let i = 1; i < sections; i++) {
        const sectionRatio = i / sections
        const sectionX = boomBase.x + (boomEndX - boomBase.x) * sectionRatio
        const sectionY = boomBase.y + (boomEndY - boomBase.y) * sectionRatio

        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(sectionX - 3, sectionY - 3)
        ctx.lineTo(sectionX + 3, sectionY + 3)
        ctx.moveTo(sectionX + 3, sectionY - 3)
        ctx.lineTo(sectionX - 3, sectionY + 3)
        ctx.stroke()
      }

      // Draw boom lattice structure
      ctx.lineWidth = 1
      const latticeSegments = Math.floor(boomLength / 5)
      for (let i = 0; i < latticeSegments; i++) {
        const segmentRatio = i / latticeSegments
        const x1 = boomBase.x + (boomEndX - boomBase.x) * segmentRatio
        const y1 = boomBase.y + (boomEndY - boomBase.y) * segmentRatio
        const x2 = boomBase.x + (boomEndX - boomBase.x) * (segmentRatio + 1/latticeSegments)
        const y2 = boomBase.y + (boomEndY - boomBase.y) * (segmentRatio + 1/latticeSegments)

        // Cross bracing
        ctx.beginPath()
        ctx.moveTo(x1 - 2, y1 + 2)
        ctx.lineTo(x2 + 2, y2 - 2)
        ctx.moveTo(x1 + 2, y1 + 2)
        ctx.lineTo(x2 - 2, y2 - 2)
        ctx.stroke()
      }

      // Return boom end position for load block
      return { boomEndX, boomEndY }
    }
  }

  const drawOutriggers = (ctx: CanvasRenderingContext2D, points: { x: number, y: number }[]) => {
    ctx.lineWidth = 2
    ctx.strokeStyle = '#444444'

    // Check if this is a plan view crane
    const isPlanView = (crane.id?.toLowerCase?.().endsWith('-plan')) || (crane.model?.toLowerCase?.().includes('plan view'))

    if (isPlanView) {
      // PLAN VIEW outriggers - looking down from above
      points.forEach(point => {
        // Outrigger arm extending diagonally from chassis corners
        const armLength = 35
        const padSize = 12

        // Calculate diagonal direction from each corner
        const centerX = 0
        const centerY = 0
        const dirX = point.x > centerX ? 1 : -1
        const dirY = point.y > centerY ? 1 : -1

        // Extend diagonally outward (like in your image)
        const armEndX = point.x + (dirX * armLength * 0.8)
        const armEndY = point.y + (dirY * armLength * 0.8)

        // Draw outrigger beam (thick line)
        ctx.lineWidth = 4
        ctx.strokeStyle = '#555555'
        ctx.beginPath()
        ctx.moveTo(point.x, point.y)
        ctx.lineTo(armEndX, armEndY)
        ctx.stroke()

        // Draw outrigger pad (large circle - plan view)
        ctx.fillStyle = '#777777'
        ctx.strokeStyle = '#333333'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(armEndX, armEndY, padSize/2, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

        // Draw outrigger box at chassis corner
        ctx.fillStyle = '#999999'
        ctx.fillRect(point.x - 4, point.y - 4, 8, 8)
        ctx.strokeRect(point.x - 4, point.y - 4, 8, 8)
      })
    } else {
      // Original side view outriggers
      const outriggerSize = 6
      const positions = [
        { x: points[0].x, y: points[0].y + 15 }, // Front left
        { x: points[1].x, y: points[1].y + 15 }, // Front right
        { x: points[0].x, y: points[2].y - 5 },  // Rear left
        { x: points[1].x, y: points[2].y - 5 }   // Rear right
      ]

      positions.forEach(pos => {
        // Outrigger box
        ctx.fillStyle = '#666666'
        ctx.fillRect(pos.x - outriggerSize/2, pos.y - outriggerSize/2, outriggerSize, outriggerSize)
        ctx.strokeRect(pos.x - outriggerSize/2, pos.y - outriggerSize/2, outriggerSize, outriggerSize)

        // Outrigger float
        ctx.fillStyle = '#888888'
        ctx.beginPath()
        ctx.arc(pos.x, pos.y + 12, 4, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

        // Outrigger beam
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y + outriggerSize/2)
        ctx.lineTo(pos.x, pos.y + 8)
        ctx.stroke()
      })
    }
  }

  const drawLoadBlock = (ctx: CanvasRenderingContext2D, boomEndX: number, boomEndY: number) => {
    const hookX = boomEndX
    const hookY = boomEndY + 15 // Hang below boom end

    // Draw load line
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(boomEndX, boomEndY)
    ctx.lineTo(hookX, hookY)
    ctx.stroke()

    // Draw load block
    ctx.fillStyle = '#FF6B35'
    ctx.fillRect(hookX - 3, hookY - 2, 6, 4)
    ctx.strokeRect(hookX - 3, hookY - 2, 6, 4)

    // Draw hook
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(hookX, hookY + 3, 2, 0, Math.PI)
    ctx.stroke()
  }

  const drawSpecifications = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#000000'
    ctx.font = '8px Arial'
    ctx.textAlign = 'left'
    
    const specs = [
      `${crane.manufacturer} ${crane.model}`,
      `Capacity: ${crane.maxCapacity}t`,
      `Max Radius: ${crane.maxRadius}m`,
      `Max Height: ${crane.maxHeight}m`
    ]

    specs.forEach((spec, index) => {
      ctx.fillText(spec, -50, -60 + (index * 10))
    })
  }

  const drawLoadChart = (ctx: CanvasRenderingContext2D) => {
    // Draw simplified load chart as arcs showing working radius
    ctx.strokeStyle = '#00AA00'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    const chartPoints = crane.loadChart.slice(0, 5) // Show first 5 points
    chartPoints.forEach((point, index) => {
      const radius = point.radius * 10 // Scale for drawing
      ctx.beginPath()
      ctx.arc(0, 0, radius, -Math.PI/2, Math.PI/2)
      ctx.stroke()
      
      // Add capacity labels
      ctx.fillStyle = '#00AA00'
      ctx.font = '6px Arial'
      ctx.fillText(`${point.capacity}t`, radius - 10, -5)
    })

    ctx.setLineDash([]) // Reset line dash
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border border-gray-300 bg-white"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
}
