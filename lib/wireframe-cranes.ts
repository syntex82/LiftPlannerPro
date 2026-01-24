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
  ctx.lineWidth = 1.0
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // === CARRIER/CHASSIS (LTM 1055 style - 5 axle) ===
  const chassisLength = 280
  const chassisHeight = 18
  const groundY = 55  // Ground level
  const chassisY = groundY - 35

  // Main chassis body - detailed profile
  ctx.beginPath()
  // Front of carrier (driver cab area)
  ctx.moveTo(-chassisLength/2, chassisY)
  ctx.lineTo(-chassisLength/2, chassisY - 25)  // Front face
  ctx.lineTo(-chassisLength/2 + 15, chassisY - 35)  // Windscreen angle
  ctx.lineTo(-chassisLength/2 + 45, chassisY - 35)  // Cab roof
  ctx.lineTo(-chassisLength/2 + 55, chassisY - 25)  // Cab rear
  ctx.lineTo(-chassisLength/2 + 55, chassisY - 15)
  // Engine compartment
  ctx.lineTo(-chassisLength/2 + 90, chassisY - 15)
  ctx.lineTo(-chassisLength/2 + 90, chassisY - 8)
  // Main chassis deck
  ctx.lineTo(chassisLength/2 - 30, chassisY - 8)
  ctx.lineTo(chassisLength/2 - 30, chassisY)
  ctx.lineTo(chassisLength/2, chassisY)
  // Bottom of chassis
  ctx.lineTo(chassisLength/2, chassisY + chassisHeight)
  ctx.lineTo(-chassisLength/2, chassisY + chassisHeight)
  ctx.closePath()
  ctx.stroke()

  // Driver cab window
  ctx.beginPath()
  ctx.moveTo(-chassisLength/2 + 18, chassisY - 32)
  ctx.lineTo(-chassisLength/2 + 42, chassisY - 32)
  ctx.lineTo(-chassisLength/2 + 42, chassisY - 20)
  ctx.lineTo(-chassisLength/2 + 18, chassisY - 25)
  ctx.closePath()
  ctx.stroke()

  // === AXLES AND WHEELS (5 axle configuration like LTM 1055) ===
  const wheelRadius = 11
  const tireWidth = 8
  const axlePositions = [
    -chassisLength/2 + 35,   // Front steering axle
    -chassisLength/2 + 65,   // Second axle
    chassisLength/2 - 85,    // Third axle
    chassisLength/2 - 55,    // Fourth axle
    chassisLength/2 - 25     // Fifth axle (rear)
  ]

  for (const axleX of axlePositions) {
    // Axle line
    ctx.beginPath()
    ctx.moveTo(axleX, chassisY + chassisHeight)
    ctx.lineTo(axleX, groundY - wheelRadius)
    ctx.stroke()

    // Tire outer
    ctx.beginPath()
    ctx.arc(axleX, groundY - wheelRadius, wheelRadius, 0, Math.PI * 2)
    ctx.stroke()

    // Tire inner (rim)
    ctx.beginPath()
    ctx.arc(axleX, groundY - wheelRadius, wheelRadius * 0.45, 0, Math.PI * 2)
    ctx.stroke()

    // Hub detail
    ctx.beginPath()
    ctx.arc(axleX, groundY - wheelRadius, 3, 0, Math.PI * 2)
    ctx.stroke()
  }

  // === OUTRIGGERS ===
  const outriggerExtend = 85 * cfg.outriggerExtension
  const outriggerY = chassisY + 8

  // Front outrigger (left side visible in side view)
  const frontOutX = -chassisLength/2 + 75
  ctx.beginPath()
  ctx.moveTo(frontOutX, outriggerY)
  ctx.lineTo(frontOutX, outriggerY + 12)
  ctx.lineTo(frontOutX - outriggerExtend, outriggerY + 12)
  ctx.lineTo(frontOutX - outriggerExtend, groundY + 3)
  ctx.stroke()
  // Outrigger pad
  ctx.fillRect(frontOutX - outriggerExtend - 12, groundY + 3, 24, 5)
  ctx.strokeRect(frontOutX - outriggerExtend - 12, groundY + 3, 24, 5)

  // Rear outrigger
  const rearOutX = chassisLength/2 - 45
  ctx.beginPath()
  ctx.moveTo(rearOutX, outriggerY)
  ctx.lineTo(rearOutX, outriggerY + 12)
  ctx.lineTo(rearOutX + outriggerExtend, outriggerY + 12)
  ctx.lineTo(rearOutX + outriggerExtend, groundY + 3)
  ctx.stroke()
  ctx.fillRect(rearOutX + outriggerExtend - 12, groundY + 3, 24, 5)
  ctx.strokeRect(rearOutX + outriggerExtend - 12, groundY + 3, 24, 5)

  // === SUPERSTRUCTURE (Slewing platform) ===
  const superX = -20
  const superY = chassisY - 8
  const superWidth = 120
  const superHeight = 35

  // Turntable ring
  ctx.beginPath()
  ctx.arc(superX + 40, chassisY, 18, 0, Math.PI * 2)
  ctx.stroke()

  // Superstructure body
  ctx.beginPath()
  ctx.moveTo(superX, superY)
  ctx.lineTo(superX + superWidth, superY)
  ctx.lineTo(superX + superWidth, superY + superHeight - 5)
  ctx.lineTo(superX + superWidth - 15, superY + superHeight)
  ctx.lineTo(superX + 15, superY + superHeight)
  ctx.lineTo(superX, superY + superHeight - 5)
  ctx.closePath()
  ctx.stroke()

  // === OPERATOR CAB (Crane cab) ===
  const cabX = superX + superWidth - 5
  const cabY = superY - 30
  ctx.beginPath()
  ctx.moveTo(cabX, superY)
  ctx.lineTo(cabX, cabY + 5)
  ctx.lineTo(cabX + 8, cabY)
  ctx.lineTo(cabX + 35, cabY)
  ctx.lineTo(cabX + 40, cabY + 8)
  ctx.lineTo(cabX + 40, superY)
  ctx.closePath()
  ctx.stroke()

  // Cab windows
  ctx.strokeRect(cabX + 5, cabY + 3, 12, 18)
  ctx.strokeRect(cabX + 20, cabY + 3, 15, 18)

  // === COUNTERWEIGHT ===
  const cwX = superX - 55
  const cwY = superY - 5
  const cwWidth = 50
  const cwHeight = 40

  // Counterweight blocks (stacked)
  ctx.strokeRect(cwX, cwY, cwWidth, cwHeight)
  // Division lines for weight blocks
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath()
    ctx.moveTo(cwX, cwY + i * (cwHeight / 4))
    ctx.lineTo(cwX + cwWidth, cwY + i * (cwHeight / 4))
    ctx.stroke()
  }
  // Counterweight label
  ctx.font = '8px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${cfg.counterweightTons}t`, cwX + cwWidth/2, cwY + cwHeight/2 + 3)

  // === BOOM ===
  const pivotX = superX + 50
  const pivotY = superY - 5

  // Boom foot pivot
  ctx.beginPath()
  ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2)
  ctx.stroke()

  // Calculate boom geometry
  const boomRad = (boomAngle * Math.PI) / 180
  const boomEndX = pivotX + boomLength * Math.cos(boomRad)
  const boomEndY = pivotY - boomLength * Math.sin(boomRad)

  // Telescopic boom (tapered)
  const boomBaseWidth = 22
  const boomTipWidth = 12
  const sections = cfg.boomSections

  ctx.save()
  ctx.translate(pivotX, pivotY)
  ctx.rotate(-boomRad)

  // Draw boom sections
  for (let s = 0; s < sections; s++) {
    const sectionStart = (s / sections) * boomLength
    const sectionEnd = ((s + 1) / sections) * boomLength
    const startWidth = boomBaseWidth - (boomBaseWidth - boomTipWidth) * (s / sections)
    const endWidth = boomBaseWidth - (boomBaseWidth - boomTipWidth) * ((s + 1) / sections)

    // Section outline
    ctx.beginPath()
    ctx.moveTo(sectionStart, -startWidth/2)
    ctx.lineTo(sectionEnd, -endWidth/2)
    ctx.lineTo(sectionEnd, endWidth/2)
    ctx.lineTo(sectionStart, startWidth/2)
    ctx.closePath()
    ctx.stroke()

    // Section joint line
    if (s > 0) {
      ctx.beginPath()
      ctx.moveTo(sectionStart, -startWidth/2 - 2)
      ctx.lineTo(sectionStart, startWidth/2 + 2)
      ctx.stroke()
    }
  }

  ctx.restore()

  // === BOOM HEAD / SHEAVE ===
  ctx.beginPath()
  ctx.arc(boomEndX, boomEndY, 8, 0, Math.PI * 2)
  ctx.stroke()
  // Sheave detail
  ctx.beginPath()
  ctx.arc(boomEndX, boomEndY, 4, 0, Math.PI * 2)
  ctx.stroke()

  // === LOAD LINE AND HOOK ===
  const hookDrop = cfg.loadLineLength

  // Wire rope
  ctx.beginPath()
  ctx.moveTo(boomEndX, boomEndY + 8)
  ctx.lineTo(boomEndX, boomEndY + hookDrop - 15)
  ctx.stroke()

  // Hook block
  ctx.strokeRect(boomEndX - 10, boomEndY + hookDrop - 15, 20, 18)
  // Sheaves in block
  ctx.beginPath()
  ctx.arc(boomEndX - 4, boomEndY + hookDrop - 8, 4, 0, Math.PI * 2)
  ctx.arc(boomEndX + 4, boomEndY + hookDrop - 8, 4, 0, Math.PI * 2)
  ctx.stroke()

  // Hook
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(boomEndX, boomEndY + hookDrop + 3)
  ctx.lineTo(boomEndX, boomEndY + hookDrop + 18)
  ctx.arc(boomEndX + 8, boomEndY + hookDrop + 18, 8, Math.PI, 0, true)
  ctx.stroke()
  ctx.lineWidth = 1

  // === DIMENSION LINES (if enabled) ===
  if (cfg.showDimensions) {
    // Overall length
    drawDimensionLine(ctx, -chassisLength/2, groundY, chassisLength/2, groundY,
      `${(chassisLength * 0.033).toFixed(1)}m`, 25, 'below')

    // Boom length
    drawDimensionLine(ctx, pivotX, pivotY, boomEndX, boomEndY,
      `${(boomLength * 0.15).toFixed(1)}m`, 20, 'above')

    // Height to boom tip
    const tipHeight = pivotY - boomEndY
    drawDimensionLine(ctx, boomEndX + 30, pivotY, boomEndX + 30, boomEndY,
      `${(tipHeight * 0.1).toFixed(1)}m`, 15, 'right')

    // Working radius
    const radius = boomEndX - pivotX
    drawDimensionLine(ctx, pivotX, groundY + 40, boomEndX, groundY + 40,
      `R=${(radius * 0.1).toFixed(1)}m`, 0, 'below')
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
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = '#666666'

    // Draw radius arcs
    const radii = [boomLength * 0.5, boomLength * 0.75, boomLength]
    for (const r of radii) {
      ctx.beginPath()
      ctx.arc(boomStartX, boomStartY, r, 0, Math.PI * 2)
      ctx.stroke()

      // Radius label
      ctx.fillStyle = '#000000'
      ctx.font = '9px Arial'
      ctx.fillText(`R=${(r * 0.1).toFixed(0)}m`, boomStartX + r + 5, boomStartY)
    }

    ctx.setLineDash([])
    ctx.strokeStyle = '#000000'

    // Outrigger spread dimension
    drawDimensionLine(ctx, frontOutX, -outriggerSpread/2, frontOutX, outriggerSpread/2,
      `${(outriggerSpread * 0.033).toFixed(1)}m`, 30, 'left')
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