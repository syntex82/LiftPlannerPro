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
  // Custom crane axle configuration
  axleCount?: number          // Number of axles (2-6)
  axlePositions?: number[]    // Axle positions in meters relative to chassis center
  wheelDiameter?: number      // Wheel diameter in mm (for scaling)
  dualTires?: boolean         // Whether to show dual tires on each axle
  // Custom crane dimensions
  chassisLengthM?: number     // Chassis length in meters (default 11.4m like LTM 1055)
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
// LTM 1055-3.1 real dimensions: carrier length ~11.4m, boom 10.5-40m
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

  // Scale: 12 pixels = 1 meter
  // LTM 1055-3.1 carrier is ~11.4m = ~137 pixels
  // Ground level and base measurements
  const groundY = 70
  // Use custom wheel diameter if provided, otherwise default to 1m (12px)
  const wheelRadius = cfg.wheelDiameter ? (cfg.wheelDiameter / 1000) * 12 / 2 : 12  // Convert mm to pixels
  const wheelY = groundY - wheelRadius

  // === CARRIER/CHASSIS - configurable length ===
  const carrierLengthM = cfg.chassisLengthM || 11.4  // Default to LTM 1055 length
  const carrierLengthPx = carrierLengthM * 12  // pixels
  const chassisLeft = -carrierLengthPx / 2
  const chassisRight = carrierLengthPx / 2
  const chassisLength = carrierLengthPx
  const chassisTop = groundY - 35
  const chassisBottom = groundY - 18

  // Main chassis frame
  ctx.strokeRect(chassisLeft, chassisTop, chassisLength, chassisBottom - chassisTop)

  // === DRIVER CAB (Front - Left side, ~2.5m wide) ===
  const cabWidth = 2.5 * 12  // 30px
  const cabLeft = chassisLeft
  const cabRight = chassisLeft + cabWidth
  const cabTop = chassisTop - 20

  ctx.beginPath()
  ctx.moveTo(cabLeft, chassisTop)
  ctx.lineTo(cabLeft, cabTop + 5)
  ctx.lineTo(cabLeft + 5, cabTop)  // Windscreen angle
  ctx.lineTo(cabRight - 3, cabTop)
  ctx.lineTo(cabRight, cabTop + 5)
  ctx.lineTo(cabRight, chassisTop)
  ctx.stroke()

  // Cab window
  ctx.strokeRect(cabLeft + 6, cabTop + 3, cabWidth - 12, 12)

  // === ENGINE COMPARTMENT (~2m) ===
  const engineWidth = 2 * 12  // 24px
  const engineLeft = cabRight + 2
  const engineRight = engineLeft + engineWidth
  const engineTop = chassisTop - 12
  ctx.strokeRect(engineLeft, engineTop, engineWidth, chassisTop - engineTop + 3)
  // Engine vents
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(engineLeft + 4 + i * 8, engineTop + 2)
    ctx.lineTo(engineLeft + 4 + i * 8, chassisTop - 1)
    ctx.stroke()
  }

  // === SUPERSTRUCTURE (sits on turntable, ~4m wide) ===
  const superWidth = 4 * 12  // 48px
  const superCenterX = chassisRight - superWidth / 2 - 10  // Near rear of carrier
  const superLeft = superCenterX - superWidth / 2
  const superRight = superCenterX + superWidth / 2
  const superTop = chassisTop - 28
  const superBottom = chassisTop + 3

  // Turntable ring
  ctx.beginPath()
  ctx.arc(superCenterX, chassisTop, 15, 0, Math.PI * 2)
  ctx.stroke()

  // Superstructure body
  ctx.beginPath()
  ctx.moveTo(superLeft, superBottom)
  ctx.lineTo(superLeft, superTop + 8)
  ctx.lineTo(superLeft + 8, superTop)
  ctx.lineTo(superRight - 10, superTop)
  ctx.lineTo(superRight, superTop + 10)
  ctx.lineTo(superRight, superBottom)
  ctx.closePath()
  ctx.stroke()

  // === CRANE OPERATOR CAB (on superstructure) ===
  const craneCabLeft = superLeft - 3
  const craneCabTop = superTop - 15
  ctx.beginPath()
  ctx.moveTo(craneCabLeft, superTop)
  ctx.lineTo(craneCabLeft, craneCabTop + 5)
  ctx.lineTo(craneCabLeft + 5, craneCabTop)
  ctx.lineTo(craneCabLeft + 22, craneCabTop)
  ctx.lineTo(craneCabLeft + 25, craneCabTop + 6)
  ctx.lineTo(craneCabLeft + 25, superTop)
  ctx.stroke()
  // Crane cab window
  ctx.strokeRect(craneCabLeft + 4, craneCabTop + 3, 16, 10)

  // === COUNTERWEIGHT (REAR - behind superstructure, ~2m) ===
  const cwWidth = 2 * 12  // 24px
  const cwLeft = superRight + 5
  const cwRight = cwLeft + cwWidth
  const cwTop = superTop + 3
  const cwBottom = superBottom - 3
  const cwHeight = cwBottom - cwTop

  ctx.strokeRect(cwLeft, cwTop, cwWidth, cwHeight)
  // Counterweight stacking lines
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath()
    ctx.moveTo(cwLeft, cwTop + i * (cwHeight / 3))
    ctx.lineTo(cwRight, cwTop + i * (cwHeight / 3))
    ctx.stroke()
  }
  // Counterweight label
  ctx.font = '8px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${cfg.counterweightTons}t`, (cwLeft + cwRight) / 2, cwTop + cwHeight / 2 + 3)

  // === AXLES AND WHEELS - Configurable ===
  // Use custom axle positions if provided, otherwise default to 5 axles like LTM 1055
  let allAxles: number[] = []

  if (cfg.axlePositions && cfg.axlePositions.length > 0) {
    // Convert axle positions from meters to pixels (relative to chassis center)
    allAxles = cfg.axlePositions.map(posM => posM * 12)
  } else if (cfg.axleCount && cfg.axleCount > 0) {
    // Generate axle positions based on count if no positions provided
    const axleCount = cfg.axleCount
    const axleSpacing = 1.5 * 12  // 18px (~1.5m spacing)
    if (axleCount === 1) {
      allAxles = [0]
    } else if (axleCount === 2) {
      allAxles = [chassisLeft + 25, chassisRight - 25]
    } else if (axleCount === 3) {
      allAxles = [chassisLeft + 25, 0, chassisRight - 25]
    } else if (axleCount === 4) {
      allAxles = [chassisLeft + 25, chassisLeft + 25 + axleSpacing, chassisRight - 25 - axleSpacing, chassisRight - 25]
    } else {
      // 5+ axles - distribute evenly with front/rear grouping
      const frontAxle1 = chassisLeft + 20
      const frontAxle2 = frontAxle1 + axleSpacing
      const rearAxleN = chassisRight - 15
      const rearAxleNm1 = rearAxleN - axleSpacing
      const rearAxleNm2 = rearAxleNm1 - axleSpacing
      if (axleCount === 5) {
        allAxles = [frontAxle1, frontAxle2, rearAxleNm2, rearAxleNm1, rearAxleN]
      } else {
        // 6 axles
        allAxles = [frontAxle1, frontAxle2, frontAxle2 + axleSpacing, rearAxleNm2, rearAxleNm1, rearAxleN]
      }
    }
  } else {
    // Default 5 axles like LTM 1055
    const axleSpacing = 1.5 * 12
    const frontAxle1 = chassisLeft + 20
    const frontAxle2 = frontAxle1 + axleSpacing
    const rearAxle3 = chassisRight - 15
    const rearAxle2 = rearAxle3 - axleSpacing
    const rearAxle1 = rearAxle2 - axleSpacing
    allAxles = [frontAxle1, frontAxle2, rearAxle1, rearAxle2, rearAxle3]
  }

  // Draw each axle with wheels
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

    // Dual tires (second tire behind if enabled) - draw smaller inner circles to indicate dual
    if (cfg.dualTires) {
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.arc(axleX, wheelY, wheelRadius * 0.35, 0, Math.PI * 2)
      ctx.stroke()
      ctx.lineWidth = 1.2
    }
  }

  // === OUTRIGGERS (extend ~3.5m each side) ===
  const outriggerExtend = 3.5 * 12 * cfg.outriggerExtension  // 42px at full extension

  // Get front and rear axle positions for outrigger placement
  const frontAxleForOutrigger = allAxles.length >= 2 ? allAxles[1] : allAxles[0] || chassisLeft + 40
  const rearAxleForOutrigger = allAxles.length >= 3 ? allAxles[allAxles.length - 3] : allAxles[allAxles.length - 1] || chassisRight - 40

  // Front outrigger (near front axle group)
  const frontOutX = frontAxleForOutrigger + 5
  if (cfg.outriggerExtension > 0) {
    ctx.beginPath()
    ctx.moveTo(frontOutX, chassisBottom)
    ctx.lineTo(frontOutX - outriggerExtend, chassisBottom)
    ctx.lineTo(frontOutX - outriggerExtend, groundY + 3)
    ctx.stroke()
    // Pad
    ctx.fillRect(frontOutX - outriggerExtend - 8, groundY + 3, 16, 5)
  }

  // Rear outrigger (near rear axle group)
  const rearOutX = rearAxleForOutrigger - 5
  if (cfg.outriggerExtension > 0) {
    ctx.beginPath()
    ctx.moveTo(rearOutX, chassisBottom)
    ctx.lineTo(rearOutX + outriggerExtend, chassisBottom)
    ctx.lineTo(rearOutX + outriggerExtend, groundY + 3)
    ctx.stroke()
    // Pad
    ctx.fillRect(rearOutX + outriggerExtend - 8, groundY + 3, 16, 5)
  }

  // === BOOM ===
  // Boom pivot is on the superstructure
  const pivotX = superCenterX
  const pivotY = superTop - 3

  // Boom foot pivot circle
  ctx.beginPath()
  ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2)
  ctx.stroke()

  // Calculate boom end position
  const boomRad = (boomAngle * Math.PI) / 180
  const boomEndX = pivotX + boomLength * Math.cos(boomRad)
  const boomEndY = pivotY - boomLength * Math.sin(boomRad)

  // Telescopic boom sections (boom base ~0.8m wide, tip ~0.4m)
  const boomBaseWidth = 0.8 * 12  // 10px
  const boomTipWidth = 0.4 * 12   // 5px
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
  ctx.arc(boomEndX, boomEndY, 6, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(boomEndX, boomEndY, 3, 0, Math.PI * 2)
  ctx.stroke()

  // === LOAD LINE AND HOOK ===
  const hookDrop = cfg.loadLineLength

  // Wire rope
  ctx.beginPath()
  ctx.moveTo(boomEndX, boomEndY + 6)
  ctx.lineTo(boomEndX, boomEndY + hookDrop - 12)
  ctx.stroke()

  // Hook block
  ctx.strokeRect(boomEndX - 8, boomEndY + hookDrop - 12, 16, 14)
  // Sheaves
  ctx.beginPath()
  ctx.arc(boomEndX - 3, boomEndY + hookDrop - 6, 3, 0, Math.PI * 2)
  ctx.arc(boomEndX + 3, boomEndY + hookDrop - 6, 3, 0, Math.PI * 2)
  ctx.stroke()

  // Hook
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(boomEndX, boomEndY + hookDrop + 2)
  ctx.lineTo(boomEndX, boomEndY + hookDrop + 12)
  ctx.arc(boomEndX + 6, boomEndY + hookDrop + 12, 6, Math.PI, 0, true)
  ctx.stroke()
  ctx.lineWidth = 1.2

  // === DIMENSION LINES ===
  if (cfg.showDimensions) {
    const pxToM = 1 / 12

    // Carrier length
    drawDimensionLine(ctx, chassisLeft, groundY + 15, chassisRight, groundY + 15,
      `${(chassisLength * pxToM).toFixed(1)}m`, 0, 'below')

    // Boom length
    drawDimensionLine(ctx, pivotX, pivotY, boomEndX, boomEndY,
      `${(boomLength * pxToM).toFixed(1)}m`, 15, 'above')

    // Tip height (from ground to boom tip)
    const tipHeight = groundY - boomEndY
    if (tipHeight > 30) {
      drawDimensionLine(ctx, boomEndX + 25, groundY, boomEndX + 25, boomEndY,
        `${(tipHeight * pxToM).toFixed(1)}m`, 0, 'right')
    }

    // Working radius (from pivot to boom tip horizontal)
    const radius = boomEndX - pivotX
    if (radius > 30) {
      drawDimensionLine(ctx, pivotX, groundY + 35, boomEndX, groundY + 35,
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