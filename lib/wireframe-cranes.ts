/**
 * Professional Engineering Crane Drawing Library
 * Based on Liebherr LTM 1055-3.1 technical specification drawings
 * Creates accurate technical drawings for professional lift planning
 */

// Configuration interface for crane drawing
export interface CraneDrawingConfig {
  boomAngle: number           // Boom angle in degrees (0-85)
  boomLength: number          // Boom length in meters
  boomSections: number        // Number of telescopic sections extended
  outriggerExtension: number  // Outrigger extension (0-1, 0=retracted, 1=full)
  counterweightTons: number   // Counterweight in tons
  loadLineLength: number      // Hook drop length in pixels
  showDimensions: boolean     // Show dimension lines
  scale: number               // Drawing scale
}

// Default configuration
export const defaultCraneConfig: CraneDrawingConfig = {
  boomAngle: 45,
  boomLength: 40,
  boomSections: 5,
  outriggerExtension: 1.0,
  counterweightTons: 12,
  loadLineLength: 80,
  showDimensions: true,
  scale: 1.0
}

// Draw dimension line with arrows and text
function drawDimensionLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  text: string,
  offset: number = 20,
  position: 'above' | 'below' | 'left' | 'right' = 'below'
) {
  ctx.save()
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#000000'
  ctx.lineWidth = 0.5
  ctx.font = '9px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)

  // Calculate offset direction
  let offsetX = 0, offsetY = 0
  if (position === 'below') offsetY = offset
  else if (position === 'above') offsetY = -offset
  else if (position === 'left') offsetX = -offset
  else if (position === 'right') offsetX = offset

  const startX = x1 + offsetX
  const startY = y1 + offsetY
  const endX = x2 + offsetX
  const endY = y2 + offsetY

  // Extension lines
  ctx.setLineDash([2, 2])
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(startX, startY)
  ctx.moveTo(x2, y2)
  ctx.lineTo(endX, endY)
  ctx.stroke()
  ctx.setLineDash([])

  // Dimension line
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()

  // Arrows
  const arrowSize = 4
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(startX + arrowSize * Math.cos(angle - Math.PI / 6), startY + arrowSize * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(startX, startY)
  ctx.lineTo(startX + arrowSize * Math.cos(angle + Math.PI / 6), startY + arrowSize * Math.sin(angle + Math.PI / 6))
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(endX, endY)
  ctx.lineTo(endX - arrowSize * Math.cos(angle - Math.PI / 6), endY - arrowSize * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(endX, endY)
  ctx.lineTo(endX - arrowSize * Math.cos(angle + Math.PI / 6), endY - arrowSize * Math.sin(angle + Math.PI / 6))
  ctx.stroke()

  // Text
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2
  ctx.save()
  ctx.translate(midX, midY)
  if (Math.abs(angle) > Math.PI / 2) {
    ctx.rotate(angle + Math.PI)
  } else {
    ctx.rotate(angle)
  }
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(-ctx.measureText(text).width / 2 - 2, -6, ctx.measureText(text).width + 4, 12)
  ctx.fillStyle = '#000000'
  ctx.fillText(text, 0, 0)
  ctx.restore()

  ctx.restore()
}

// Draw lattice boom structure with cross-bracing
function drawLatticeBoom(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  width: number,
  segments: number
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)

  ctx.save()
  ctx.translate(x1, y1)
  ctx.rotate(angle)

  // Perpendicular offset for boom width
  const halfWidth = width / 2

  // Top and bottom chords
  ctx.beginPath()
  ctx.moveTo(0, -halfWidth)
  ctx.lineTo(length, -halfWidth)
  ctx.moveTo(0, halfWidth)
  ctx.lineTo(length, halfWidth)
  ctx.stroke()

  // Cross bracing (X pattern)
  const segmentLength = length / segments
  for (let i = 0; i < segments; i++) {
    const segStart = i * segmentLength
    const segEnd = (i + 1) * segmentLength

    // Diagonal braces (X pattern)
    ctx.beginPath()
    ctx.moveTo(segStart, -halfWidth)
    ctx.lineTo(segEnd, halfWidth)
    ctx.moveTo(segStart, halfWidth)
    ctx.lineTo(segEnd, -halfWidth)
    ctx.stroke()

    // Vertical braces at segment ends
    if (i > 0) {
      ctx.beginPath()
      ctx.moveTo(segStart, -halfWidth)
      ctx.lineTo(segStart, halfWidth)
      ctx.stroke()
    }
  }

  // End plates
  ctx.beginPath()
  ctx.moveTo(0, -halfWidth)
  ctx.lineTo(0, halfWidth)
  ctx.moveTo(length, -halfWidth)
  ctx.lineTo(length, halfWidth)
  ctx.stroke()

  ctx.restore()
}

// Draw professional LTM 1055-3.1 style mobile crane (SIDE VIEW)
// Based on Liebherr technical specification drawings
// Layout: Driver cab (front/left) -> Engine -> Superstructure with crane cab -> Counterweight (rear/right)
export function drawWireframeMobileCrane(
  ctx: CanvasRenderingContext2D,
  boomAngle: number = 45,
  boomLength: number = 200,
  scale: number = 1.0,
  config: Partial<CraneDrawingConfig> = {}
) {
  const cfg = { ...defaultCraneConfig, ...config, boomAngle, boomLength, scale }

  ctx.save()
  ctx.scale(scale, scale)
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#000000'
  ctx.lineWidth = 1.2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Ground level and base measurements
  const groundY = 70
  const wheelRadius = 18
  const wheelY = groundY - wheelRadius

  // === CARRIER/CHASSIS ===
  const chassisLeft = -180
  const chassisRight = 180
  const chassisLength = chassisRight - chassisLeft
  const chassisTop = groundY - 55
  const chassisBottom = groundY - 25

  // Main chassis frame
  ctx.strokeRect(chassisLeft, chassisTop, chassisLength, chassisBottom - chassisTop)

  // === DRIVER CAB (Front - Left side) ===
  const cabLeft = chassisLeft
  const cabRight = chassisLeft + 70
  const cabTop = chassisTop - 35

  ctx.beginPath()
  ctx.moveTo(cabLeft, chassisTop)
  ctx.lineTo(cabLeft, cabTop + 10)
  ctx.lineTo(cabLeft + 10, cabTop)  // Windscreen angle
  ctx.lineTo(cabRight - 5, cabTop)
  ctx.lineTo(cabRight, cabTop + 8)
  ctx.lineTo(cabRight, chassisTop)
  ctx.stroke()

  // Cab windows
  ctx.strokeRect(cabLeft + 12, cabTop + 5, 20, 22)
  ctx.strokeRect(cabLeft + 38, cabTop + 5, 22, 22)

  // === ENGINE COMPARTMENT ===
  const engineLeft = cabRight + 5
  const engineRight = engineLeft + 60
  const engineTop = chassisTop - 20
  ctx.strokeRect(engineLeft, engineTop, engineRight - engineLeft, chassisTop - engineTop + 5)
  // Engine vents
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(engineLeft + 8 + i * 12, engineTop + 3)
    ctx.lineTo(engineLeft + 8 + i * 12, chassisTop - 2)
    ctx.stroke()
  }

  // === SUPERSTRUCTURE (sits on turntable, center-right of carrier) ===
  const superCenterX = 40
  const superLeft = superCenterX - 60
  const superRight = superCenterX + 80
  const superTop = chassisTop - 50
  const superBottom = chassisTop + 5

  // Turntable ring
  ctx.beginPath()
  ctx.arc(superCenterX, chassisTop, 25, 0, Math.PI * 2)
  ctx.stroke()

  // Superstructure body
  ctx.beginPath()
  ctx.moveTo(superLeft, superBottom)
  ctx.lineTo(superLeft, superTop + 15)
  ctx.lineTo(superLeft + 15, superTop)
  ctx.lineTo(superRight - 20, superTop)
  ctx.lineTo(superRight, superTop + 20)
  ctx.lineTo(superRight, superBottom)
  ctx.closePath()
  ctx.stroke()

  // === CRANE OPERATOR CAB (on superstructure, front-facing) ===
  const craneCabLeft = superLeft - 5
  const craneCabTop = superTop - 25
  ctx.beginPath()
  ctx.moveTo(craneCabLeft, superTop)
  ctx.lineTo(craneCabLeft, craneCabTop + 8)
  ctx.lineTo(craneCabLeft + 8, craneCabTop)
  ctx.lineTo(craneCabLeft + 40, craneCabTop)
  ctx.lineTo(craneCabLeft + 45, craneCabTop + 10)
  ctx.lineTo(craneCabLeft + 45, superTop)
  ctx.stroke()
  // Crane cab windows
  ctx.strokeRect(craneCabLeft + 5, craneCabTop + 5, 15, 18)
  ctx.strokeRect(craneCabLeft + 24, craneCabTop + 5, 16, 18)

  // === COUNTERWEIGHT (REAR - Right side, behind superstructure) ===
  const cwLeft = superRight + 10
  const cwRight = cwLeft + 55
  const cwTop = superTop + 5
  const cwBottom = superBottom - 5
  const cwHeight = cwBottom - cwTop

  ctx.strokeRect(cwLeft, cwTop, cwRight - cwLeft, cwHeight)
  // Counterweight stacking lines
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath()
    ctx.moveTo(cwLeft, cwTop + i * (cwHeight / 4))
    ctx.lineTo(cwRight, cwTop + i * (cwHeight / 4))
    ctx.stroke()
  }
  // Counterweight label
  ctx.font = '10px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${cfg.counterweightTons}t`, (cwLeft + cwRight) / 2, cwTop + cwHeight / 2 + 4)

  // === AXLES AND WHEELS (3 axle groups like LTM 1055) ===
  // Front axle group (2 axles)
  const frontAxle1 = chassisLeft + 45
  const frontAxle2 = chassisLeft + 85
  // Rear axle group (3 axles)
  const rearAxle1 = chassisRight - 100
  const rearAxle2 = chassisRight - 65
  const rearAxle3 = chassisRight - 30

  const allAxles = [frontAxle1, frontAxle2, rearAxle1, rearAxle2, rearAxle3]

  for (const axleX of allAxles) {
    // Tire outer
    ctx.beginPath()
    ctx.arc(axleX, wheelY, wheelRadius, 0, Math.PI * 2)
    ctx.stroke()
    // Tire inner (rim)
    ctx.beginPath()
    ctx.arc(axleX, wheelY, wheelRadius * 0.5, 0, Math.PI * 2)
    ctx.stroke()
    // Hub
    ctx.beginPath()
    ctx.arc(axleX, wheelY, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // === OUTRIGGERS ===
  const outriggerExtend = 100 * cfg.outriggerExtension

  // Front outrigger
  const frontOutX = chassisLeft + 65
  if (cfg.outriggerExtension > 0) {
    ctx.beginPath()
    ctx.moveTo(frontOutX, chassisBottom)
    ctx.lineTo(frontOutX - outriggerExtend, chassisBottom)
    ctx.lineTo(frontOutX - outriggerExtend, groundY + 5)
    ctx.stroke()
    // Pad
    ctx.fillRect(frontOutX - outriggerExtend - 15, groundY + 5, 30, 8)
  }

  // Rear outrigger
  const rearOutX = chassisRight - 50
  if (cfg.outriggerExtension > 0) {
    ctx.beginPath()
    ctx.moveTo(rearOutX, chassisBottom)
    ctx.lineTo(rearOutX + outriggerExtend, chassisBottom)
    ctx.lineTo(rearOutX + outriggerExtend, groundY + 5)
    ctx.stroke()
    // Pad
    ctx.fillRect(rearOutX + outriggerExtend - 15, groundY + 5, 30, 8)
  }

  // === BOOM ===
  // Boom pivot is on the superstructure, front area
  const pivotX = superLeft + 30
  const pivotY = superTop - 5

  // Boom foot pivot circle
  ctx.beginPath()
  ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2)
  ctx.stroke()

  // Calculate boom end position
  const boomRad = (boomAngle * Math.PI) / 180
  const boomEndX = pivotX + boomLength * Math.cos(boomRad)
  const boomEndY = pivotY - boomLength * Math.sin(boomRad)

  // Telescopic boom sections
  const boomBaseWidth = 28
  const boomTipWidth = 14
  const sections = cfg.boomSections

  ctx.save()
  ctx.translate(pivotX, pivotY)
  ctx.rotate(-boomRad)

  for (let s = 0; s < sections; s++) {
    const sectionStart = (s / sections) * boomLength
    const sectionEnd = ((s + 1) / sections) * boomLength
    const startWidth = boomBaseWidth - (boomBaseWidth - boomTipWidth) * (s / sections)
    const endWidth = boomBaseWidth - (boomBaseWidth - boomTipWidth) * ((s + 1) / sections)

    // Section outline
    ctx.beginPath()
    ctx.moveTo(sectionStart, -startWidth / 2)
    ctx.lineTo(sectionEnd, -endWidth / 2)
    ctx.lineTo(sectionEnd, endWidth / 2)
    ctx.lineTo(sectionStart, startWidth / 2)
    ctx.closePath()
    ctx.stroke()

    // Section joint line
    if (s > 0) {
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(sectionStart, -startWidth / 2 - 3)
      ctx.lineTo(sectionStart, startWidth / 2 + 3)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  ctx.restore()

  // === BOOM HEAD / SHEAVE ===
  ctx.beginPath()
  ctx.arc(boomEndX, boomEndY, 10, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(boomEndX, boomEndY, 5, 0, Math.PI * 2)
  ctx.stroke()

  // === LOAD LINE AND HOOK ===
  const hookDrop = cfg.loadLineLength

  // Wire rope
  ctx.beginPath()
  ctx.moveTo(boomEndX, boomEndY + 10)
  ctx.lineTo(boomEndX, boomEndY + hookDrop - 20)
  ctx.stroke()

  // Hook block
  ctx.strokeRect(boomEndX - 12, boomEndY + hookDrop - 20, 24, 22)
  // Sheaves
  ctx.beginPath()
  ctx.arc(boomEndX - 5, boomEndY + hookDrop - 10, 5, 0, Math.PI * 2)
  ctx.arc(boomEndX + 5, boomEndY + hookDrop - 10, 5, 0, Math.PI * 2)
  ctx.stroke()

  // Hook
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(boomEndX, boomEndY + hookDrop + 2)
  ctx.lineTo(boomEndX, boomEndY + hookDrop + 20)
  ctx.arc(boomEndX + 10, boomEndY + hookDrop + 20, 10, Math.PI, 0, true)
  ctx.stroke()
  ctx.lineWidth = 1.2

  // === DIMENSION LINES ===
  if (cfg.showDimensions) {
    const pxToM = 1 / 12

    // Carrier length
    drawDimensionLine(ctx, chassisLeft, groundY + 20, chassisRight, groundY + 20,
      `${(chassisLength * pxToM).toFixed(1)}m`, 0, 'below')

    // Boom length
    drawDimensionLine(ctx, pivotX, pivotY, boomEndX, boomEndY,
      `${(boomLength * pxToM).toFixed(1)}m`, 25, 'above')

    // Tip height
    const tipHeight = pivotY - boomEndY
    if (tipHeight > 20) {
      drawDimensionLine(ctx, boomEndX + 40, groundY, boomEndX + 40, boomEndY,
        `${((groundY - boomEndY) * pxToM).toFixed(1)}m`, 0, 'right')
    }

    // Working radius
    const radius = boomEndX - pivotX
    if (radius > 50) {
      drawDimensionLine(ctx, pivotX, groundY + 50, boomEndX, groundY + 50,
        `R=${(radius * pxToM).toFixed(1)}m`, 0, 'below')
    }
  }

  ctx.restore()
}

// Draw wireframe tower crane
export function drawWireframeTowerCrane(
  ctx: CanvasRenderingContext2D,
  towerHeight: number = 250,
  jibLength: number = 180,
  counterJibLength: number = 70,
  scale: number = 1.0
) {
  ctx.save()
  ctx.scale(scale, scale)
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Base/foundation
  const baseWidth = 60
  ctx.strokeRect(-baseWidth / 2, 0, baseWidth, 20)
  // Base anchor bolts
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath()
    ctx.arc(i * 20, 10, 4, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Tower mast (vertical lattice)
  const towerWidth = 25
  drawLatticeBoom(ctx, 0, 0, 0, -towerHeight, towerWidth, Math.floor(towerHeight / 25))

  // Slewing unit at top
  ctx.beginPath()
  ctx.arc(0, -towerHeight, 12, 0, Math.PI * 2)
  ctx.stroke()

  // Operator cab (below slewing)
  ctx.strokeRect(-15, -towerHeight + 15, 30, 25)
  // Cab window
  ctx.strokeRect(-12, -towerHeight + 18, 24, 12)

  // Main jib (horizontal lattice going right)
  drawLatticeBoom(ctx, 0, -towerHeight - 5, jibLength, -towerHeight - 5, 10, 12)

  // Counter jib (horizontal lattice going left)
  drawLatticeBoom(ctx, 0, -towerHeight - 5, -counterJibLength, -towerHeight - 5, 10, 5)

  // Counterweight blocks
  const cwX = -counterJibLength + 10
  ctx.strokeRect(cwX, -towerHeight - 5, 30, 25)
  // Counterweight division lines
  ctx.beginPath()
  ctx.moveTo(cwX + 10, -towerHeight - 5)
  ctx.lineTo(cwX + 10, -towerHeight + 20)
  ctx.moveTo(cwX + 20, -towerHeight - 5)
  ctx.lineTo(cwX + 20, -towerHeight + 20)
  ctx.stroke()

  // Apex/peak structure and tie rods
  const apexHeight = 30
  // Apex triangle
  ctx.beginPath()
  ctx.moveTo(0, -towerHeight - 5)
  ctx.lineTo(0, -towerHeight - 5 - apexHeight)
  ctx.lineTo(10, -towerHeight - 5)
  ctx.stroke()

  // Tie rod to jib
  ctx.beginPath()
  ctx.moveTo(0, -towerHeight - 5 - apexHeight)
  ctx.lineTo(jibLength * 0.8, -towerHeight - 5)
  ctx.stroke()

  // Tie rod to counter jib
  ctx.beginPath()
  ctx.moveTo(0, -towerHeight - 5 - apexHeight)
  ctx.lineTo(-counterJibLength * 0.8, -towerHeight - 5)
  ctx.stroke()

  // Trolley on main jib
  const trolleyX = jibLength * 0.6
  ctx.strokeRect(trolleyX - 8, -towerHeight - 5, 16, 8)
  // Trolley wheels
  ctx.beginPath()
  ctx.arc(trolleyX - 4, -towerHeight + 3, 2, 0, Math.PI * 2)
  ctx.arc(trolleyX + 4, -towerHeight + 3, 2, 0, Math.PI * 2)
  ctx.stroke()

  // Hoist rope from trolley
  const hoistLength = 80
  ctx.beginPath()
  ctx.moveTo(trolleyX, -towerHeight + 3)
  ctx.lineTo(trolleyX, -towerHeight + 3 + hoistLength)
  ctx.stroke()

  // Hook block
  ctx.strokeRect(trolleyX - 6, -towerHeight + 3 + hoistLength, 12, 10)

  // Hook
  ctx.beginPath()
  ctx.moveTo(trolleyX, -towerHeight + 3 + hoistLength + 10)
  ctx.lineTo(trolleyX, -towerHeight + 3 + hoistLength + 20)
  ctx.arc(trolleyX + 5, -towerHeight + 3 + hoistLength + 20, 5, Math.PI, 0, true)
  ctx.stroke()

  ctx.restore()
}


// Draw wireframe crawler crane (SIDE VIEW - like reference image)
export function drawWireframeCrawlerCrane(
  ctx: CanvasRenderingContext2D,
  boomAngle: number = 50,
  boomLength: number = 220,
  loadLineLength: number = 70,
  scale: number = 1.0
) {
  ctx.save()
  ctx.scale(scale, scale)
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // SIDE VIEW - Single track visible (like reference image)
  const trackLength = 180
  const trackHeight = 40
  const trackY = 20 // Ground level

  // Track outline - rounded rectangle (side view shows one track)
  const trackRadius = trackHeight / 2
  ctx.beginPath()
  ctx.moveTo(-trackLength / 2 + trackRadius, trackY)
  ctx.lineTo(trackLength / 2 - trackRadius, trackY)
  ctx.arc(trackLength / 2 - trackRadius, trackY + trackRadius, trackRadius, -Math.PI / 2, Math.PI / 2)
  ctx.lineTo(-trackLength / 2 + trackRadius, trackY + trackHeight)
  ctx.arc(-trackLength / 2 + trackRadius, trackY + trackRadius, trackRadius, Math.PI / 2, -Math.PI / 2)
  ctx.closePath()
  ctx.stroke()

  // Track treads/grooves (vertical lines)
  for (let i = -trackLength / 2 + 15; i < trackLength / 2 - 10; i += 10) {
    ctx.beginPath()
    ctx.moveTo(i, trackY + 3)
    ctx.lineTo(i, trackY + trackHeight - 3)
    ctx.stroke()
  }

  // Drive sprocket (front circle)
  ctx.beginPath()
  ctx.arc(trackLength / 2 - trackRadius - 5, trackY + trackRadius, trackRadius - 5, 0, Math.PI * 2)
  ctx.stroke()

  // Idler wheel (rear circle)
  ctx.beginPath()
  ctx.arc(-trackLength / 2 + trackRadius + 5, trackY + trackRadius, trackRadius - 5, 0, Math.PI * 2)
  ctx.stroke()

  // Carbody/superstructure (sits on top of tracks)
  const bodyWidth = 140
  const bodyHeight = 45
  const bodyY = trackY - bodyHeight
  ctx.strokeRect(-bodyWidth / 2, bodyY, bodyWidth, bodyHeight)

  // Turntable circle (visible on side)
  ctx.beginPath()
  ctx.arc(0, bodyY + bodyHeight / 2, 18, 0, Math.PI * 2)
  ctx.stroke()

  // Counterweight (rear, stacked blocks)
  const cwWidth = 50
  const cwHeight = 55
  ctx.strokeRect(-bodyWidth / 2 - cwWidth + 10, bodyY - 10, cwWidth, cwHeight)
  // Counterweight stacking lines (horizontal)
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath()
    ctx.moveTo(-bodyWidth / 2 - cwWidth + 10, bodyY - 10 + i * (cwHeight / 5))
    ctx.lineTo(-bodyWidth / 2 + 10, bodyY - 10 + i * (cwHeight / 5))
    ctx.stroke()
  }

  // Operator cab (front side)
  const cabWidth = 35
  const cabHeight = 40
  ctx.strokeRect(bodyWidth / 2 - cabWidth - 15, bodyY - cabHeight + 10, cabWidth, cabHeight)
  // Cab window
  ctx.strokeRect(bodyWidth / 2 - cabWidth - 10, bodyY - cabHeight + 15, cabWidth - 10, cabHeight / 2)

  // Engine housing (middle section)
  ctx.strokeRect(-20, bodyY, 50, bodyHeight - 5)

  // A-frame/gantry for boom support
  const aFrameHeight = 35
  const aFrameBase = bodyY
  ctx.beginPath()
  ctx.moveTo(-15, aFrameBase)
  ctx.lineTo(0, aFrameBase - aFrameHeight)
  ctx.lineTo(15, aFrameBase)
  ctx.stroke()

  // Boom pivot point (front of superstructure)
  const pivotX = bodyWidth / 2 - 30
  const pivotY = bodyY
  ctx.beginPath()
  ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2)
  ctx.stroke()

  // Calculate boom end position
  const boomRad = (boomAngle * Math.PI) / 180
  const boomEndX = pivotX + boomLength * Math.cos(boomRad)
  const boomEndY = pivotY - boomLength * Math.sin(boomRad)

  // Draw lattice boom
  drawLatticeBoom(ctx, pivotX, pivotY, boomEndX, boomEndY, 14, Math.floor(boomLength / 18))

  // Boom tip sheave housing
  ctx.strokeRect(boomEndX - 8, boomEndY - 6, 16, 12)
  // Sheave circle
  ctx.beginPath()
  ctx.arc(boomEndX, boomEndY, 4, 0, Math.PI * 2)
  ctx.stroke()

  // Load lines (multiple for realism)
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(boomEndX + i * 2, boomEndY + 6)
    ctx.lineTo(boomEndX + i * 2, boomEndY + loadLineLength - 12)
    ctx.stroke()
  }

  // Hook block
  ctx.strokeRect(boomEndX - 10, boomEndY + loadLineLength - 12, 20, 14)
  // Sheaves in block
  ctx.beginPath()
  ctx.arc(boomEndX - 4, boomEndY + loadLineLength - 5, 3, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(boomEndX + 4, boomEndY + loadLineLength - 5, 3, 0, Math.PI * 2)
  ctx.stroke()

  // Hook
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(boomEndX, boomEndY + loadLineLength + 2)
  ctx.lineTo(boomEndX, boomEndY + loadLineLength + 15)
  ctx.arc(boomEndX + 6, boomEndY + loadLineLength + 15, 6, Math.PI, 0, true)
  ctx.stroke()

  ctx.restore()
}

// Draw mobile crane PLAN VIEW (top-down) like LTM 1055-3.1 spec sheet
export function drawWireframeMobileCranePlanView(
  ctx: CanvasRenderingContext2D,
  boomAngle: number = 0,  // Rotation angle in plan view (0 = pointing right)
  boomLength: number = 200,
  scale: number = 1.0,
  config: Partial<CraneDrawingConfig> = {}
) {
  const cfg = { ...defaultCraneConfig, ...config, boomAngle, boomLength, scale }

  ctx.save()
  ctx.scale(scale, scale)
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#000000'
  ctx.lineWidth = 1.0
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // === CARRIER OUTLINE (top view) ===
  const carrierLength = 280
  const carrierWidth = 85

  // Main carrier body
  ctx.strokeRect(-carrierLength/2, -carrierWidth/2, carrierLength, carrierWidth)

  // Driver cab (front left)
  ctx.strokeRect(-carrierLength/2, -carrierWidth/2, 55, 35)

  // Axle lines (visible from top)
  const axlePositions = [-105, -75, 55, 85, 115]
  for (const x of axlePositions) {
    ctx.beginPath()
    ctx.moveTo(x, -carrierWidth/2 - 8)
    ctx.lineTo(x, carrierWidth/2 + 8)
    ctx.stroke()
    // Wheel rectangles
    ctx.strokeRect(x - 5, -carrierWidth/2 - 12, 10, 8)
    ctx.strokeRect(x - 5, carrierWidth/2 + 4, 10, 8)
  }

  // === OUTRIGGERS (extended) ===
  const outriggerSpread = 220 * cfg.outriggerExtension

  // Front outriggers
  const frontOutX = -80
  ctx.beginPath()
  ctx.moveTo(frontOutX, -carrierWidth/2)
  ctx.lineTo(frontOutX, -outriggerSpread/2)
  ctx.moveTo(frontOutX, carrierWidth/2)
  ctx.lineTo(frontOutX, outriggerSpread/2)
  ctx.stroke()
  // Pads
  ctx.fillRect(frontOutX - 15, -outriggerSpread/2 - 5, 30, 10)
  ctx.fillRect(frontOutX - 15, outriggerSpread/2 - 5, 30, 10)

  // Rear outriggers
  const rearOutX = 100
  ctx.beginPath()
  ctx.moveTo(rearOutX, -carrierWidth/2)
  ctx.lineTo(rearOutX, -outriggerSpread/2)
  ctx.moveTo(rearOutX, carrierWidth/2)
  ctx.lineTo(rearOutX, outriggerSpread/2)
  ctx.stroke()
  ctx.fillRect(rearOutX - 15, -outriggerSpread/2 - 5, 30, 10)
  ctx.fillRect(rearOutX - 15, outriggerSpread/2 - 5, 30, 10)

  // === SUPERSTRUCTURE (turntable) ===
  const superRadius = 50
  ctx.beginPath()
  ctx.arc(20, 0, superRadius, 0, Math.PI * 2)
  ctx.stroke()

  // Turntable center
  ctx.beginPath()
  ctx.arc(20, 0, 8, 0, Math.PI * 2)
  ctx.stroke()

  // === COUNTERWEIGHT ===
  const cwAngle = (boomAngle + 180) * Math.PI / 180
  const cwDist = 45
  const cwX = 20 + cwDist * Math.cos(cwAngle)
  const cwY = cwDist * Math.sin(cwAngle)

  ctx.save()
  ctx.translate(cwX, cwY)
  ctx.rotate(cwAngle)
  ctx.strokeRect(-25, -20, 50, 40)
  ctx.restore()

  // === BOOM (rotatable) ===
  const boomRad = boomAngle * Math.PI / 180
  const boomStartX = 20
  const boomStartY = 0
  const boomEndX = boomStartX + boomLength * Math.cos(boomRad)
  const boomEndY = boomLength * Math.sin(boomRad)

  // Boom outline (tapered)
  const boomBaseWidth = 18
  const boomTipWidth = 8

  ctx.save()
  ctx.translate(boomStartX, boomStartY)
  ctx.rotate(boomRad)

  ctx.beginPath()
  ctx.moveTo(0, -boomBaseWidth/2)
  ctx.lineTo(boomLength, -boomTipWidth/2)
  ctx.lineTo(boomLength, boomTipWidth/2)
  ctx.lineTo(0, boomBaseWidth/2)
  ctx.closePath()
  ctx.stroke()

  // Boom sections
  for (let i = 1; i < cfg.boomSections; i++) {
    const x = (i / cfg.boomSections) * boomLength
    const w = boomBaseWidth - (boomBaseWidth - boomTipWidth) * (i / cfg.boomSections)
    ctx.beginPath()
    ctx.moveTo(x, -w/2)
    ctx.lineTo(x, w/2)
    ctx.stroke()
  }

  ctx.restore()

  // === WORKING RADIUS ARCS ===
  if (cfg.showDimensions) {
    // Conversion: 12 pixels = 1 meter
    const pxToM = 1 / 12

    ctx.setLineDash([5, 5])
    ctx.strokeStyle = '#666666'

    // Draw radius arcs at 25%, 50%, 75%, 100% of boom length
    const radii = [boomLength * 0.25, boomLength * 0.5, boomLength * 0.75, boomLength]
    for (const r of radii) {
      ctx.beginPath()
      ctx.arc(boomStartX, boomStartY, r, 0, Math.PI * 2)
      ctx.stroke()

      // Radius label (convert pixels to meters)
      ctx.fillStyle = '#000000'
      ctx.font = '10px Arial'
      ctx.fillText(`R=${(r * pxToM).toFixed(1)}m`, boomStartX + r + 5, boomStartY)
    }

    ctx.setLineDash([])
    ctx.strokeStyle = '#000000'

    // Outrigger spread dimension (convert to meters)
    drawDimensionLine(ctx, frontOutX, -outriggerSpread/2, frontOutX, outriggerSpread/2,
      `${(outriggerSpread * pxToM).toFixed(1)}m`, 30, 'left')
  }

  ctx.restore()
}

// Main drawing dispatcher function
export function drawWireframeCrane(
  ctx: CanvasRenderingContext2D,
  craneType: 'mobile' | 'tower' | 'crawler' | 'mobile-plan',
  options: {
    boomAngle?: number
    boomLength?: number
    towerHeight?: number
    jibLength?: number
    loadLineLength?: number
    scale?: number
    config?: Partial<CraneDrawingConfig>
  } = {}
) {
  const {
    boomAngle = 45,
    boomLength = 200,
    towerHeight = 250,
    jibLength = 180,
    loadLineLength = 80,
    scale = 1.0,
    config = {}
  } = options

  switch (craneType) {
    case 'mobile':
      drawWireframeMobileCrane(ctx, boomAngle, boomLength, scale, config)
      break
    case 'mobile-plan':
      drawWireframeMobileCranePlanView(ctx, boomAngle, boomLength, scale, config)
      break
    case 'tower':
      drawWireframeTowerCrane(ctx, towerHeight, jibLength, 70, scale)
      break
    case 'crawler':
      drawWireframeCrawlerCrane(ctx, boomAngle, boomLength, loadLineLength, scale)
      break
  }
}