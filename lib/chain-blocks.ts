/**
 * Chain Block / Chain Hoist CAD Drawing Library
 * Configurable chain blocks for rigging operations
 */

export interface ChainBlockConfig {
  // Basic properties
  capacity: number // tonnes (0.5, 1, 2, 3, 5, 10, 20)
  chainLength: number // metres
  liftHeight: number // current lift height in metres
  
  // Angles
  chainAngle: number // degrees from vertical (-45 to 45)
  bodyRotation: number // degrees (0, 90, 180, 270 for different views)
  
  // Visual options
  showLoadChain: boolean
  showHandChain: boolean
  showHook: boolean
  showCapacityLabel: boolean
  
  // Style
  scale: number
  lineWeight: number
  color: string
}

export const DEFAULT_CHAIN_BLOCK_CONFIG: ChainBlockConfig = {
  capacity: 2,
  chainLength: 3,
  liftHeight: 1.5,
  chainAngle: 0,
  bodyRotation: 0,
  showLoadChain: true,
  showHandChain: true,
  showHook: true,
  showCapacityLabel: true,
  scale: 1,
  lineWeight: 2,
  color: '#000000'
}

// Standard chain block capacities
export const CHAIN_BLOCK_CAPACITIES = [0.5, 1, 2, 3, 5, 10, 20] as const

// Chain block body dimensions (scaled by capacity)
const getBodyDimensions = (capacity: number) => {
  const baseWidth = 30 + capacity * 3
  const baseHeight = 40 + capacity * 4
  return { width: baseWidth, height: baseHeight }
}

/**
 * Draw a chain block on canvas
 */
export function drawChainBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  config: ChainBlockConfig
) {
  const { capacity, chainLength, liftHeight, chainAngle, bodyRotation, 
          showLoadChain, showHandChain, showHook, showCapacityLabel,
          scale, lineWeight, color } = config
  
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.rotate((bodyRotation * Math.PI) / 180)
  
  ctx.strokeStyle = color
  ctx.lineWidth = lineWeight
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  const { width, height } = getBodyDimensions(capacity)
  const halfW = width / 2
  
  // Top hook/suspension point
  drawTopHook(ctx, 0, -height/2 - 15)
  
  // Main body (housing)
  drawChainBlockBody(ctx, 0, 0, width, height, capacity)
  
  // Hand chain (left side)
  if (showHandChain) {
    const handChainX = -halfW - 10
    drawChain(ctx, handChainX, height/2, chainLength * 30, 0, 'hand')
  }
  
  // Load chain (bottom)
  if (showLoadChain) {
    const loadChainLength = liftHeight * 30 // pixels per metre
    const angleRad = (chainAngle * Math.PI) / 180
    drawChain(ctx, 0, height/2, loadChainLength, angleRad, 'load')
    
    // Bottom hook
    if (showHook) {
      const hookX = Math.sin(angleRad) * loadChainLength
      const hookY = height/2 + Math.cos(angleRad) * loadChainLength
      drawBottomHook(ctx, hookX, hookY, chainAngle)
    }
  }
  
  // Capacity label
  if (showCapacityLabel) {
    ctx.fillStyle = color
    ctx.font = `bold ${10 + capacity}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${capacity}T`, 0, 0)
  }
  
  ctx.restore()
}

// Draw top suspension hook
function drawTopHook(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath()
  // Hook shape
  ctx.moveTo(x, y - 10)
  ctx.lineTo(x, y)
  ctx.arc(x + 8, y, 8, Math.PI, 0, true)
  ctx.lineTo(x + 16, y - 5)
  ctx.stroke()
  
  // Swivel
  ctx.beginPath()
  ctx.rect(x - 5, y + 2, 10, 8)
  ctx.stroke()
}

// Draw chain block main body
function drawChainBlockBody(
  ctx: CanvasRenderingContext2D, 
  x: number, y: number, 
  width: number, height: number,
  capacity: number
) {
  const halfW = width / 2
  const halfH = height / 2
  
  // Main housing - rounded rectangle
  ctx.beginPath()
  const radius = 5
  ctx.moveTo(x - halfW + radius, y - halfH)
  ctx.lineTo(x + halfW - radius, y - halfH)
  ctx.arcTo(x + halfW, y - halfH, x + halfW, y - halfH + radius, radius)
  ctx.lineTo(x + halfW, y + halfH - radius)
  ctx.arcTo(x + halfW, y + halfH, x + halfW - radius, y + halfH, radius)
  ctx.lineTo(x - halfW + radius, y + halfH)
  ctx.arcTo(x - halfW, y + halfH, x - halfW, y + halfH - radius, radius)
  ctx.lineTo(x - halfW, y - halfH + radius)
  ctx.arcTo(x - halfW, y - halfH, x - halfW + radius, y - halfH, radius)
  ctx.closePath()
  ctx.stroke()
  
  // Gear wheel circle
  const gearRadius = Math.min(halfW, halfH) * 0.6
  ctx.beginPath()
  ctx.arc(x, y, gearRadius, 0, Math.PI * 2)
  ctx.stroke()
  
  // Inner circle
  ctx.beginPath()
  ctx.arc(x, y, gearRadius * 0.3, 0, Math.PI * 2)
  ctx.stroke()

  // Side plates detail
  ctx.beginPath()
  ctx.moveTo(x - halfW + 3, y - halfH + 10)
  ctx.lineTo(x - halfW + 3, y + halfH - 10)
  ctx.moveTo(x + halfW - 3, y - halfH + 10)
  ctx.lineTo(x + halfW - 3, y + halfH - 10)
  ctx.stroke()
}

// Draw chain links
function drawChain(
  ctx: CanvasRenderingContext2D,
  startX: number, startY: number,
  length: number, angle: number,
  type: 'load' | 'hand'
) {
  const linkHeight = type === 'load' ? 8 : 6
  const linkWidth = type === 'load' ? 5 : 4
  const numLinks = Math.floor(length / linkHeight)

  ctx.save()
  ctx.translate(startX, startY)
  ctx.rotate(angle)

  for (let i = 0; i < numLinks; i++) {
    const y = i * linkHeight
    const isEven = i % 2 === 0

    ctx.beginPath()
    if (isEven) {
      // Vertical link (oval)
      ctx.ellipse(0, y + linkHeight/2, linkWidth/2, linkHeight/2, 0, 0, Math.PI * 2)
    } else {
      // Horizontal link (smaller oval rotated)
      ctx.ellipse(0, y + linkHeight/2, linkHeight/2 - 1, linkWidth/2 - 1, 0, 0, Math.PI * 2)
    }
    ctx.stroke()
  }

  ctx.restore()
}

// Draw bottom load hook
function drawBottomHook(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((angle * Math.PI) / 180)

  // Hook body
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, 10)

  // Hook curve
  ctx.arc(10, 10, 10, Math.PI, Math.PI * 0.3, true)
  ctx.stroke()

  // Safety latch
  ctx.beginPath()
  ctx.moveTo(5, 5)
  ctx.quadraticCurveTo(15, 0, 18, 8)
  ctx.stroke()

  // Swivel at top
  ctx.beginPath()
  ctx.rect(-4, -8, 8, 8)
  ctx.stroke()

  ctx.restore()
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
    blockRotation: 0
  }
}

/**
 * Get chain block presets for common configurations
 */
export const CHAIN_BLOCK_PRESETS = [
  {
    id: 'cb-0.5t-standard',
    name: '0.5T Chain Block',
    description: 'Light duty, 3m chain',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 0.5, chainLength: 3 }
  },
  {
    id: 'cb-1t-standard',
    name: '1T Chain Block',
    description: 'Standard duty, 3m chain',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 1, chainLength: 3 }
  },
  {
    id: 'cb-2t-standard',
    name: '2T Chain Block',
    description: 'Medium duty, 3m chain',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 2, chainLength: 3 }
  },
  {
    id: 'cb-5t-standard',
    name: '5T Chain Block',
    description: 'Heavy duty, 3m chain',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 5, chainLength: 3 }
  },
  {
    id: 'cb-10t-standard',
    name: '10T Chain Block',
    description: 'Extra heavy duty, 3m chain',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 10, chainLength: 3 }
  },
  {
    id: 'cb-20t-standard',
    name: '20T Chain Block',
    description: 'Super heavy duty, 3m chain',
    config: { ...DEFAULT_CHAIN_BLOCK_CONFIG, capacity: 20, chainLength: 3 }
  }
] as const

