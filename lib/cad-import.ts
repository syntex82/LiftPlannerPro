/**
 * CAD File Import - DXF/DWG Parser
 * Parses DXF and DWG files and converts them to DrawingElement format
 */

export interface Point {
  x: number
  y: number
}

export interface DrawingElement {
  id: string
  type: 'line' | 'rectangle' | 'circle' | 'polyline' | 'arc' | 'text' | 'dimension' | 'spline' | 'table' | 'titleblock' | 'logo' | 'image' | 'block' | 'arcDimension'
  points: Point[]
  style: {
    stroke: string
    strokeWidth: number
    fill?: string
    fillOpacity?: number
    lineType?: 'solid' | 'dashed' | 'dotted'
    lineCap?: 'butt' | 'round' | 'square'
    lineJoin?: 'miter' | 'round' | 'bevel'
    fontSize?: number
    fontFamily?: string
  }
  layer?: string
  locked?: boolean
  radius?: number
  text?: string
  [key: string]: any
}

/**
 * Parse DXF file content
 * DXF format: code on one line, value on next line
 */
export const parseDXF = (content: string): DrawingElement[] => {
  const elements: DrawingElement[] = []
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  console.log('DXF file has', lines.length, 'lines')
  console.log('First 20 lines:', lines.slice(0, 20))

  // Find ENTITIES section
  let entitiesStart = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === 'ENTITIES') {
      entitiesStart = i + 1
      console.log('Found ENTITIES section at line', i)
      break
    }
  }

  if (entitiesStart === -1) {
    console.warn('No ENTITIES section found in DXF file')
    // Try to parse anyway - some files might not have proper sections
    return parseSimpleDXF(lines)
  }

  // Parse entities
  let i = entitiesStart
  while (i < lines.length) {
    const line = lines[i]

    if (line === 'ENDSEC' || line === 'EOF') break

    // Entity type is always after code 0
    if (line === '0') {
      const entityType = lines[i + 1] || ''
      console.log('Found entity type:', entityType, 'at line', i)

      if (entityType === 'LINE') {
        const element = parseDXFLine(lines, i + 2)
        if (element) {
          elements.push(element)
          console.log('Added LINE element')
        }
      } else if (entityType === 'CIRCLE') {
        const element = parseDXFCircle(lines, i + 2)
        if (element) {
          elements.push(element)
          console.log('Added CIRCLE element')
        }
      } else if (entityType === 'LWPOLYLINE' || entityType === 'POLYLINE') {
        const element = parseDXFPolyline(lines, i + 2)
        if (element) {
          elements.push(element)
          console.log('Added POLYLINE element')
        }
      } else if (entityType === 'ARC') {
        const element = parseDXFArc(lines, i + 2)
        if (element) {
          elements.push(element)
          console.log('Added ARC element')
        }
      } else if (entityType === 'TEXT') {
        const element = parseDXFText(lines, i + 2)
        if (element) {
          elements.push(element)
          console.log('Added TEXT element')
        }
      }
    }
    i++
  }

  console.log('Parsed', elements.length, 'elements from DXF')
  return elements
}

/**
 * Parse simple DXF format without proper sections
 */
const parseSimpleDXF = (lines: string[]): DrawingElement[] => {
  const elements: DrawingElement[] = []

  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '0') {
      const entityType = lines[i + 1] || ''

      if (entityType === 'LINE') {
        const element = parseDXFLine(lines, i + 2)
        if (element) elements.push(element)
      } else if (entityType === 'CIRCLE') {
        const element = parseDXFCircle(lines, i + 2)
        if (element) elements.push(element)
      } else if (entityType === 'LWPOLYLINE' || entityType === 'POLYLINE') {
        const element = parseDXFPolyline(lines, i + 2)
        if (element) elements.push(element)
      } else if (entityType === 'ARC') {
        const element = parseDXFArc(lines, i + 2)
        if (element) elements.push(element)
      } else if (entityType === 'TEXT') {
        const element = parseDXFText(lines, i + 2)
        if (element) elements.push(element)
      }
    }
  }

  return elements
}

/**
 * Parse DXF LINE entity
 * startIndex points to first code after entity type
 */
const parseDXFLine = (lines: string[], startIndex: number): DrawingElement | null => {
  let x1 = 0, y1 = 0, x2 = 0, y2 = 0
  let hasX1 = false, hasX2 = false

  for (let i = startIndex; i < Math.min(startIndex + 50, lines.length); i += 2) {
    const code = parseInt(lines[i] || '0')
    const value = lines[i + 1] || ''

    console.log('LINE: code', code, 'value', value)

    if (code === 10) { x1 = parseFloat(value); hasX1 = true }
    if (code === 20) y1 = parseFloat(value)
    if (code === 11) { x2 = parseFloat(value); hasX2 = true }
    if (code === 21) y2 = parseFloat(value)
    if (code === 0) break // Next entity
  }

  if (!hasX1 || !hasX2) {
    console.log('LINE: missing coordinates - hasX1:', hasX1, 'hasX2:', hasX2)
    return null
  }

  console.log('LINE: parsed', x1, y1, 'to', x2, y2)

  return {
    id: `line-${Date.now()}-${Math.random()}`,
    type: 'line',
    points: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
    style: {
      stroke: '#3b82f6',
      strokeWidth: 2
    }
  }
}

/**
 * Parse DXF CIRCLE entity
 */
const parseDXFCircle = (lines: string[], startIndex: number): DrawingElement | null => {
  let cx = 0, cy = 0, radius = 0
  let hasRadius = false

  for (let i = startIndex; i < Math.min(startIndex + 30, lines.length); i += 2) {
    const code = parseInt(lines[i] || '0')
    const value = lines[i + 1] || ''

    console.log('CIRCLE: code', code, 'value', value)

    if (code === 10) cx = parseFloat(value)
    if (code === 20) cy = parseFloat(value)
    if (code === 40) { radius = parseFloat(value); hasRadius = true }
    if (code === 0) break // Next entity
  }

  if (!hasRadius || radius === 0) {
    console.log('CIRCLE: missing radius')
    return null
  }

  console.log('CIRCLE: parsed center', cx, cy, 'radius', radius)

  return {
    id: `circle-${Date.now()}-${Math.random()}`,
    type: 'circle',
    points: [{ x: cx, y: cy }],
    style: {
      stroke: '#3b82f6',
      strokeWidth: 2
    },
    radius
  }
}

/**
 * Parse DXF POLYLINE entity
 */
const parseDXFPolyline = (lines: string[], startIndex: number): DrawingElement | null => {
  const points: Point[] = []
  let i = startIndex

  while (i < Math.min(startIndex + 200, lines.length)) {
    const code = parseInt(lines[i] || '0')
    const value = lines[i + 1] || ''

    console.log('POLYLINE: code', code, 'value', value)

    if (code === 10) {
      const x = parseFloat(value)
      // Y coordinate is always 2 lines after X (code 20, then value)
      const y = parseFloat(lines[i + 3] || '0')
      points.push({ x, y })
      console.log('POLYLINE: added point', x, y)
      i += 4 // Skip past the Y coordinate
    } else if (code === 0) {
      break // Next entity
    } else {
      i += 2
    }
  }

  if (points.length < 1) {
    console.log('POLYLINE: no points found')
    return null
  }

  console.log('POLYLINE: parsed', points.length, 'points')

  return {
    id: `polyline-${Date.now()}-${Math.random()}`,
    type: 'polyline',
    points,
    style: {
      stroke: '#3b82f6',
      strokeWidth: 2
    }
  }
}

/**
 * Parse DXF ARC entity
 */
const parseDXFArc = (lines: string[], startIndex: number): DrawingElement | null => {
  let cx = 0, cy = 0, radius = 0, startAngle = 0, endAngle = 0
  let hasRadius = false

  for (let i = startIndex; i < Math.min(startIndex + 40, lines.length); i += 2) {
    const code = parseInt(lines[i] || '0')
    const value = lines[i + 1] || ''

    console.log('ARC: code', code, 'value', value)

    if (code === 10) cx = parseFloat(value)
    if (code === 20) cy = parseFloat(value)
    if (code === 40) { radius = parseFloat(value); hasRadius = true }
    if (code === 50) startAngle = parseFloat(value) * (Math.PI / 180)
    if (code === 51) endAngle = parseFloat(value) * (Math.PI / 180)
    if (code === 0) break // Next entity
  }

  if (!hasRadius || radius === 0) {
    console.log('ARC: missing radius')
    return null
  }

  const startPoint = {
    x: cx + radius * Math.cos(startAngle),
    y: cy + radius * Math.sin(startAngle)
  }

  const endPoint = {
    x: cx + radius * Math.cos(endAngle),
    y: cy + radius * Math.sin(endAngle)
  }

  console.log('ARC: parsed center', cx, cy, 'radius', radius)

  return {
    id: `arc-${Date.now()}-${Math.random()}`,
    type: 'arc',
    points: [{ x: cx, y: cy }, startPoint, endPoint],
    style: {
      stroke: '#3b82f6',
      strokeWidth: 2
    },
    radius,
    startAngle,
    endAngle
  }
}

/**
 * Parse DXF TEXT entity
 */
const parseDXFText = (lines: string[], startIndex: number): DrawingElement | null => {
  let x = 0, y = 0, text = '', height = 12

  for (let i = startIndex; i < Math.min(startIndex + 30, lines.length); i += 2) {
    const code = parseInt(lines[i] || '0')
    const value = lines[i + 1] || ''

    console.log('TEXT: code', code, 'value', value)

    if (code === 10) x = parseFloat(value)
    if (code === 20) y = parseFloat(value)
    if (code === 1) text = value
    if (code === 40) height = parseFloat(value)
    if (code === 0) break // Next entity
  }

  if (!text) {
    console.log('TEXT: missing text content')
    return null
  }

  console.log('TEXT: parsed', text, 'at', x, y)

  return {
    id: `text-${Date.now()}-${Math.random()}`,
    type: 'text',
    points: [{ x, y }],
    text,
    style: {
      stroke: '#3b82f6',
      strokeWidth: 1,
      fontSize: height,
      fontFamily: 'Arial'
    }
  }
}

/**
 * Parse DWG file (simplified - treats as DXF)
 * Note: True DWG parsing requires binary format handling
 */
export const parseDWG = (content: string): DrawingElement[] => {
  // For now, treat DWG as DXF since true DWG is binary
  // In production, you'd use a library like dxf-parser or dwg-parser
  return parseDXF(content)
}

/**
 * Import CAD file
 */
export const importCADFile = async (file: File): Promise<DrawingElement[]> => {
  const filename = file.name.toLowerCase()
  const content = await file.text()
  
  if (filename.endsWith('.dxf')) {
    return parseDXF(content)
  } else if (filename.endsWith('.dwg')) {
    return parseDWG(content)
  } else {
    throw new Error(`Unsupported file format: ${filename}`)
  }
}

