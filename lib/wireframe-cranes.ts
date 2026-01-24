/**
 * Professional Wireframe Crane Drawing Library
 * Creates technical line drawings of cranes for CAD canvas
 */

// Draw lattice boom structure with cross-bracing pattern
export function drawLatticeBoom(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  width: number = 12,
  segments: number = 8
) {
  const dx = endX - startX
  const dy = endY - startY
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)

  ctx.save()
  ctx.translate(startX, startY)
  ctx.rotate(angle)

  // Top and bottom chords
  ctx.beginPath()
  ctx.moveTo(0, -width / 2)
  ctx.lineTo(length, -width / 2)
  ctx.moveTo(0, width / 2)
  ctx.lineTo(length, width / 2)
  ctx.stroke()

  // Cross-bracing (X pattern)
  const segmentLength = length / segments
  for (let i = 0; i < segments; i++) {
    const x1 = i * segmentLength
    const x2 = (i + 1) * segmentLength
    ctx.beginPath()
    ctx.moveTo(x1, -width / 2)
    ctx.lineTo(x2, width / 2)
    ctx.moveTo(x1, width / 2)
    ctx.lineTo(x2, -width / 2)
    ctx.stroke()

    // Vertical members at segment ends
    ctx.beginPath()
    ctx.moveTo(x2, -width / 2)
    ctx.lineTo(x2, width / 2)
    ctx.stroke()
  }

  ctx.restore()
}

// Draw wireframe mobile/truck crane
export function drawWireframeMobileCrane(
  ctx: CanvasRenderingContext2D,
  boomAngle: number = 45,
  boomLength: number = 200,
  scale: number = 1.0
) {
  ctx.save()
  ctx.scale(scale, scale)
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Carrier/chassis - rectangle with wheels
  const chassisWidth = 180
  const chassisHeight = 25
  ctx.strokeRect(-chassisWidth / 2, 0, chassisWidth, chassisHeight)

  // Wheels (6 axles)
  const wheelRadius = 12
  const wheelPositions = [-70, -45, -20, 20, 45, 70]
  for (const wx of wheelPositions) {
    ctx.beginPath()
    ctx.arc(wx, chassisHeight + wheelRadius, wheelRadius, 0, Math.PI * 2)
    ctx.stroke()
    // Inner circle for tire detail
    ctx.beginPath()
    ctx.arc(wx, chassisHeight + wheelRadius, wheelRadius * 0.5, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Outriggers (extended)
  const outriggerExtend = 60
  // Left front
  ctx.beginPath()
  ctx.moveTo(-chassisWidth / 2 + 20, chassisHeight / 2)
  ctx.lineTo(-chassisWidth / 2 - outriggerExtend, chassisHeight / 2)
  ctx.lineTo(-chassisWidth / 2 - outriggerExtend, chassisHeight + wheelRadius + 5)
  ctx.stroke()
  // Pad
  ctx.strokeRect(-chassisWidth / 2 - outriggerExtend - 8, chassisHeight + wheelRadius + 5, 16, 4)

  // Right front
  ctx.beginPath()
  ctx.moveTo(chassisWidth / 2 - 20, chassisHeight / 2)
  ctx.lineTo(chassisWidth / 2 + outriggerExtend, chassisHeight / 2)
  ctx.lineTo(chassisWidth / 2 + outriggerExtend, chassisHeight + wheelRadius + 5)
  ctx.stroke()
  ctx.strokeRect(chassisWidth / 2 + outriggerExtend - 8, chassisHeight + wheelRadius + 5, 16, 4)

  // Left rear
  ctx.beginPath()
  ctx.moveTo(-chassisWidth / 2 + 20, chassisHeight / 2)
  ctx.lineTo(-chassisWidth / 2 - outriggerExtend + 10, chassisHeight / 2)
  ctx.stroke()

  // Right rear
  ctx.beginPath()
  ctx.moveTo(chassisWidth / 2 - 20, chassisHeight / 2)
  ctx.lineTo(chassisWidth / 2 + outriggerExtend - 10, chassisHeight / 2)
  ctx.stroke()

  // Superstructure/turntable
  ctx.strokeRect(-30, -20, 60, 20)

  // Operator cab
  ctx.strokeRect(30, -35, 30, 35)
  // Cab window
  ctx.strokeRect(35, -30, 20, 15)

  // Counterweight
  ctx.strokeRect(-70, -25, 35, 25)
  // Counterweight detail lines
  for (let i = 1; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(-70 + i * 8.75, -25)
    ctx.lineTo(-70 + i * 8.75, 0)
    ctx.stroke()
  }

  // Boom pivot point
  const pivotX = 0
  const pivotY = -20
  ctx.beginPath()
  ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2)
  ctx.stroke()

  // Calculate boom end position
  const boomRad = (boomAngle * Math.PI) / 180
  const boomEndX = pivotX + boomLength * Math.cos(boomRad)
  const boomEndY = pivotY - boomLength * Math.sin(boomRad)

  // Draw lattice boom
  drawLatticeBoom(ctx, pivotX, pivotY, boomEndX, boomEndY, 14, 10)

  // Boom tip sheave/pulley
  ctx.beginPath()
  ctx.arc(boomEndX, boomEndY, 4, 0, Math.PI * 2)
  ctx.stroke()

  // Load lines (multiple)
  const hookDropLength = 60
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(boomEndX + i * 2, boomEndY)
    ctx.lineTo(boomEndX + i * 2, boomEndY + hookDropLength - 10)
    ctx.stroke()
  }

  // Hook block
  ctx.strokeRect(boomEndX - 8, boomEndY + hookDropLength - 10, 16, 12)

  // Hook
  ctx.beginPath()
  ctx.moveTo(boomEndX, boomEndY + hookDropLength + 2)
  ctx.lineTo(boomEndX, boomEndY + hookDropLength + 15)
  ctx.arc(boomEndX + 6, boomEndY + hookDropLength + 15, 6, Math.PI, 0, true)
  ctx.stroke()

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

// Main drawing dispatcher function
export function drawWireframeCrane(
  ctx: CanvasRenderingContext2D,
  craneType: 'mobile' | 'tower' | 'crawler',
  options: {
    boomAngle?: number
    boomLength?: number
    towerHeight?: number
    jibLength?: number
    scale?: number
  } = {}
) {
  const { boomAngle = 45, boomLength = 200, towerHeight = 250, jibLength = 180, scale = 1.0 } = options

  switch (craneType) {
    case 'mobile':
      drawWireframeMobileCrane(ctx, boomAngle, boomLength, scale)
      break
    case 'tower':
      drawWireframeTowerCrane(ctx, towerHeight, jibLength, 70, scale)
      break
    case 'crawler':
      drawWireframeCrawlerCrane(ctx, boomAngle, boomLength, scale)
      break
  }
}