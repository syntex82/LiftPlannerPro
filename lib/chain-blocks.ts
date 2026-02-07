/**
 * Chain Block / Chain Hoist CAD Drawing Library
 * Professional detailed chain blocks for rigging operations
 * Based on technical engineering drawings
 */

export interface ChainBlockConfig {
  capacity: number        // tonnes (0.5, 1, 2, 3, 5, 10, 20)
  chainLength: number     // metres - total chain length
  liftHeight: number      // current drop/lift height in metres
  rotation: number        // degrees rotation of entire assembly
  showLoadChain: boolean
  showHandChain: boolean
  showHook: boolean
  showCapacityLabel: boolean
  scale: number
  lineWeight: number
  color: string
}

export const DEFAULT_CHAIN_BLOCK_CONFIG: ChainBlockConfig = {
  capacity: 2,
  chainLength: 3,
  liftHeight: 1.5,
  rotation: 0,
  showLoadChain: true,
  showHandChain: true,
  showHook: true,
  showCapacityLabel: true,
  scale: 1,
  lineWeight: 1,
  color: '#000000'
}

export const CHAIN_BLOCK_CAPACITIES = [0.5, 1, 2, 3, 5, 10, 20] as const

// Scale body size based on capacity
const getScale = (capacity: number) => 0.8 + Math.log10(capacity + 1) * 0.4

/**
 * Draw professional chain block on canvas
 * Chains always hang straight down (gravity)
 */
export function drawChainBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  config: ChainBlockConfig
) {
  // Safety checks for missing/undefined config values
  if (!config || !ctx) return

  const capacity = config.capacity ?? 2
  const liftHeight = config.liftHeight ?? 1.5
  const showLoadChain = config.showLoadChain ?? true
  const showHandChain = config.showHandChain ?? true
  const showHook = config.showHook ?? true
  const showCapacityLabel = config.showCapacityLabel ?? true
  const scale = config.scale ?? 1
  const lineWeight = config.lineWeight ?? 1
  const color = config.color ?? '#000000'

  const bodyScale = getScale(capacity) * scale

  ctx.save()
  ctx.translate(x, y)

  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lineWeight
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // === TOP SUSPENSION HOOK ===
  drawTopHook(ctx, 0, 0, bodyScale, lineWeight)

  // === MAIN BODY ===
  const bodyTop = 45 * bodyScale
  drawBody(ctx, 0, bodyTop, bodyScale, lineWeight, capacity, showCapacityLabel, color)

  const bodyHeight = 70 * bodyScale
  const bodyBottom = bodyTop + bodyHeight

  // === HAND CHAIN (left side loop) ===
  if (showHandChain) {
    const handChainX = -45 * bodyScale
    drawHandChain(ctx, handChainX, bodyTop + 20 * bodyScale, liftHeight * 25, bodyScale, lineWeight)
  }

  // === LOAD CHAIN (center, going straight down) ===
  if (showLoadChain) {
    const loadChainLength = liftHeight * 50
    drawLoadChain(ctx, 0, bodyBottom, loadChainLength, bodyScale, lineWeight)

    // === BOTTOM HOOK ===
    if (showHook) {
      drawBottomHook(ctx, 0, bodyBottom + loadChainLength, bodyScale, lineWeight)
    }
  }

  ctx.restore()
}

// Professional top suspension hook with swivel
function drawTopHook(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, lw: number) {
  // Suspension eye/ring at very top
  ctx.beginPath()
  ctx.arc(x, y - 8 * s, 6 * s, 0, Math.PI * 2)
  ctx.stroke()

  // Suspension pin through eye
  ctx.beginPath()
  ctx.moveTo(x - 8 * s, y - 8 * s)
  ctx.lineTo(x + 8 * s, y - 8 * s)
  ctx.stroke()

  // Hook shank going down from eye
  ctx.beginPath()
  ctx.moveTo(x, y - 2 * s)
  ctx.lineTo(x, y + 15 * s)
  ctx.stroke()

  // Hook curve - proper hook shape opening to the right
  ctx.beginPath()
  ctx.arc(x + 12 * s, y + 15 * s, 12 * s, Math.PI, Math.PI * 0.15, true)
  ctx.stroke()

  // Hook tip curving inward
  const tipX = x + 12 * s + 12 * s * Math.cos(Math.PI * 0.15)
  const tipY = y + 15 * s + 12 * s * Math.sin(Math.PI * 0.15)
  ctx.beginPath()
  ctx.moveTo(tipX, tipY)
  ctx.quadraticCurveTo(tipX + 2 * s, tipY - 6 * s, tipX - 5 * s, tipY - 8 * s)
  ctx.stroke()

  // Safety latch
  ctx.beginPath()
  ctx.moveTo(x + 3 * s, y + 8 * s)
  ctx.quadraticCurveTo(x + 20 * s, y + 5 * s, x + 20 * s, y + 18 * s)
  ctx.stroke()

  // Swivel body below hook
  const swivelY = y + 30 * s
  ctx.beginPath()
  ctx.rect(x - 8 * s, swivelY, 16 * s, 12 * s)
  ctx.stroke()

  // Swivel detail lines
  ctx.beginPath()
  ctx.moveTo(x - 8 * s, swivelY + 4 * s)
  ctx.lineTo(x + 8 * s, swivelY + 4 * s)
  ctx.moveTo(x - 8 * s, swivelY + 8 * s)
  ctx.lineTo(x + 8 * s, swivelY + 8 * s)
  ctx.stroke()
}

// Main chain block body - detailed housing
function drawBody(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, lw: number,
                  capacity: number, showLabel: boolean, color: string) {
  const w = 40 * s  // half width
  const h = 70 * s  // full height

  // Side cheek plates (left and right)
  // Left plate
  ctx.beginPath()
  ctx.moveTo(x - w, y)
  ctx.lineTo(x - w, y + h)
  ctx.lineTo(x - w + 8 * s, y + h)
  ctx.lineTo(x - w + 8 * s, y)
  ctx.closePath()
  ctx.stroke()

  // Right plate
  ctx.beginPath()
  ctx.moveTo(x + w, y)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x + w - 8 * s, y + h)
  ctx.lineTo(x + w - 8 * s, y)
  ctx.closePath()
  ctx.stroke()

  // Main gear housing - center body with rounded top
  ctx.beginPath()
  ctx.moveTo(x - w + 8 * s, y + 5 * s)
  ctx.lineTo(x - w + 8 * s, y + h)
  ctx.lineTo(x + w - 8 * s, y + h)
  ctx.lineTo(x + w - 8 * s, y + 5 * s)
  // Rounded top
  ctx.quadraticCurveTo(x + w - 8 * s, y, x + w - 20 * s, y)
  ctx.lineTo(x - w + 20 * s, y)
  ctx.quadraticCurveTo(x - w + 8 * s, y, x - w + 8 * s, y + 5 * s)
  ctx.stroke()

  // Top mounting bracket
  ctx.beginPath()
  ctx.rect(x - 12 * s, y - 3 * s, 24 * s, 6 * s)
  ctx.stroke()

  // Bolts on top bracket
  const boltY = y
  ctx.beginPath()
  ctx.arc(x - 8 * s, boltY, 2 * s, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x + 8 * s, boltY, 2 * s, 0, Math.PI * 2)
  ctx.stroke()

  // Large gear wheel circle (main wheel)
  const gearCenterY = y + 35 * s
  const gearRadius = 25 * s
  ctx.beginPath()
  ctx.arc(x, gearCenterY, gearRadius, 0, Math.PI * 2)
  ctx.stroke()

  // Gear hub (center)
  ctx.beginPath()
  ctx.arc(x, gearCenterY, 8 * s, 0, Math.PI * 2)
  ctx.stroke()

  // Center bolt
  ctx.beginPath()
  ctx.arc(x, gearCenterY, 3 * s, 0, Math.PI * 2)
  ctx.fill()

  // Gear teeth indication (spokes)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(angle) * 10 * s, gearCenterY + Math.sin(angle) * 10 * s)
    ctx.lineTo(x + Math.cos(angle) * 22 * s, gearCenterY + Math.sin(angle) * 22 * s)
    ctx.stroke()
  }

  // Side bolts on cheek plates
  const boltPositions = [y + 10 * s, y + 35 * s, y + 60 * s]
  boltPositions.forEach(by => {
    // Left bolts
    ctx.beginPath()
    ctx.arc(x - w + 4 * s, by, 2 * s, 0, Math.PI * 2)
    ctx.stroke()
    // Right bolts
    ctx.beginPath()
    ctx.arc(x + w - 4 * s, by, 2 * s, 0, Math.PI * 2)
    ctx.stroke()
  })

  // Bottom chain guide/exit
  ctx.beginPath()
  ctx.moveTo(x - 6 * s, y + h)
  ctx.lineTo(x - 6 * s, y + h + 8 * s)
  ctx.lineTo(x + 6 * s, y + h + 8 * s)
  ctx.lineTo(x + 6 * s, y + h)
  ctx.stroke()

  // Capacity label
  if (showLabel) {
    ctx.save()
    ctx.fillStyle = color
    ctx.font = `bold ${12 * s}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${capacity}T`, x, gearCenterY)
    ctx.restore()
  }
}

// Hand chain - continuous loop on side
function drawHandChain(ctx: CanvasRenderingContext2D, x: number, y: number,
                        length: number, s: number, lw: number) {
  const linkH = 6 * s
  const linkW = 4 * s
  const numLinks = Math.floor(length / linkH)

  // Draw chain going down
  for (let i = 0; i < numLinks; i++) {
    const ly = y + i * linkH
    drawChainLink(ctx, x, ly, linkW, linkH, i % 2 === 0, lw)
  }

  // Draw return chain (slightly offset)
  const returnX = x - 8 * s
  for (let i = 0; i < numLinks; i++) {
    const ly = y + i * linkH
    drawChainLink(ctx, returnX, ly, linkW, linkH, i % 2 === 1, lw)
  }

  // Bottom loop connecting the two
  const bottomY = y + numLinks * linkH
  ctx.beginPath()
  ctx.arc(x - 4 * s, bottomY, 4 * s, 0, Math.PI)
  ctx.stroke()
}

// Load chain - main lifting chain
function drawLoadChain(ctx: CanvasRenderingContext2D, x: number, y: number,
                        length: number, s: number, lw: number) {
  const linkH = 10 * s
  const linkW = 6 * s
  const numLinks = Math.floor(length / linkH)

  for (let i = 0; i < numLinks; i++) {
    const ly = y + i * linkH
    drawChainLink(ctx, x, ly, linkW, linkH, i % 2 === 0, lw)
  }
}

// Individual chain link - proper figure-8 interlocking style
function drawChainLink(ctx: CanvasRenderingContext2D, x: number, y: number,
                        w: number, h: number, vertical: boolean, lw: number) {
  ctx.beginPath()
  if (vertical) {
    // Vertical oval link
    const rx = w / 2
    const ry = h / 2
    ctx.ellipse(x, y + h / 2, rx, ry, 0, 0, Math.PI * 2)
  } else {
    // Horizontal oval link (appears to pass through vertical)
    const rx = h / 2 - 1
    const ry = w / 2 - 1
    ctx.ellipse(x, y + h / 2, rx, ry, Math.PI / 2, 0, Math.PI * 2)
  }
  ctx.stroke()
}

// Professional bottom load hook with safety latch
function drawBottomHook(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, lw: number) {
  // Swivel block at top
  ctx.beginPath()
  ctx.rect(x - 10 * s, y, 20 * s, 15 * s)
  ctx.stroke()

  // Swivel detail
  ctx.beginPath()
  ctx.moveTo(x - 10 * s, y + 5 * s)
  ctx.lineTo(x + 10 * s, y + 5 * s)
  ctx.moveTo(x - 10 * s, y + 10 * s)
  ctx.lineTo(x + 10 * s, y + 10 * s)
  ctx.stroke()

  // Hook shank
  const shankTop = y + 15 * s
  ctx.beginPath()
  ctx.moveTo(x - 3 * s, shankTop)
  ctx.lineTo(x - 3 * s, shankTop + 15 * s)
  ctx.moveTo(x + 3 * s, shankTop)
  ctx.lineTo(x + 3 * s, shankTop + 15 * s)
  ctx.stroke()

  // Hook curve - large curved hook
  const hookCenterY = shankTop + 15 * s
  const hookRadius = 18 * s

  // Main hook body - thick hook shape
  ctx.beginPath()
  ctx.arc(x + hookRadius, hookCenterY, hookRadius, Math.PI, Math.PI * 0.2, true)
  ctx.stroke()

  // Inner hook curve
  ctx.beginPath()
  ctx.arc(x + hookRadius, hookCenterY, hookRadius - 6 * s, Math.PI, Math.PI * 0.3, true)
  ctx.stroke()

  // Connect inner and outer at top
  ctx.beginPath()
  ctx.moveTo(x, hookCenterY)
  ctx.lineTo(x + 6 * s, hookCenterY)
  ctx.stroke()

  // Hook tip - curving inward
  const tipAngle = Math.PI * 0.2
  const outerTipX = x + hookRadius + hookRadius * Math.cos(tipAngle)
  const outerTipY = hookCenterY + hookRadius * Math.sin(tipAngle)
  const innerTipX = x + hookRadius + (hookRadius - 6 * s) * Math.cos(Math.PI * 0.3)
  const innerTipY = hookCenterY + (hookRadius - 6 * s) * Math.sin(Math.PI * 0.3)

  // Close the tip
  ctx.beginPath()
  ctx.moveTo(outerTipX, outerTipY)
  ctx.quadraticCurveTo(outerTipX + 3 * s, outerTipY - 8 * s, innerTipX, innerTipY)
  ctx.stroke()

  // Safety latch
  ctx.beginPath()
  ctx.moveTo(x + 5 * s, hookCenterY - 5 * s)
  ctx.quadraticCurveTo(x + 30 * s, hookCenterY - 10 * s, x + 32 * s, hookCenterY + 10 * s)
  ctx.stroke()

  // Latch spring
  ctx.beginPath()
  ctx.arc(x + 8 * s, hookCenterY - 3 * s, 3 * s, 0, Math.PI * 2)
  ctx.stroke()
}

/**
 * Generate DrawingElement for a chain block
 */
export function createChainBlockElement(
  config: ChainBlockConfig,
  position: { x: number, y: number }
): any {
  return {
    id: `chain-block-${Date.now()}`,
    type: 'block',
    points: [position],
    style: {
      stroke: config.color,
      strokeWidth: config.lineWeight
    },
    layer: 'layer1',
    chainBlockConfig: config,
    blockScale: config.scale,
    blockRotation: config.rotation
  }
}

/**
 * Get chain block presets
 */
export const CHAIN_BLOCK_PRESETS = [
  {
    id: 'cb-0.5t',
    name: '0.5T Chain Block',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 0.5 }
  },
  {
    id: 'cb-1t',
    name: '1T Chain Block',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 1 }
  },
  {
    id: 'cb-2t',
    name: '2T Chain Block',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 2 }
  },
  {
    id: 'cb-5t',
    name: '5T Chain Block',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 5 }
  },
  {
    id: 'cb-10t',
    name: '10T Chain Block',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 10 }
  },
  {
    id: 'cb-20t',
    name: '20T Chain Block',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 20 }
  }
] as const

