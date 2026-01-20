/**
 * Advanced CAD Utilities for Professional Engineering Features
 * Includes snapping, transformations, measurements, and analysis tools
 */

export interface Point {
  x: number
  y: number
}

export interface SnapPoint {
  point: Point
  type: 'endpoint' | 'midpoint' | 'center' | 'intersection' | 'perpendicular' | 'tangent' | 'nearest' | 'grid'
  distance: number
}

export interface Measurement {
  id: string
  type: 'distance' | 'angle' | 'area' | 'perimeter'
  value: number
  points: Point[]
  label?: string
}

export interface LoadAnalysis {
  totalLoad: number
  centerOfGravity: Point
  momentArm: number
  stressDistribution: number[]
  safetyFactor: number
}

// ============ SNAPPING UTILITIES ============

export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

export const calculateMidpoint = (p1: Point, p2: Point): Point => {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
}

export const calculateAngle = (p1: Point, p2: Point): number => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI)
}

export const findEndpointSnap = (mousePos: Point, elements: any[], tolerance: number): SnapPoint | null => {
  let closest: SnapPoint | null = null
  
  elements.forEach(element => {
    if (element.points && Array.isArray(element.points)) {
      element.points.forEach((point: Point) => {
        const distance = calculateDistance(mousePos, point)
        if (distance < tolerance) {
          if (!closest || distance < closest.distance) {
            closest = { point, type: 'endpoint', distance }
          }
        }
      })
    }
  })
  
  return closest
}

export const findMidpointSnap = (mousePos: Point, elements: any[], tolerance: number): SnapPoint | null => {
  let closest: SnapPoint | null = null
  
  elements.forEach(element => {
    if (element.points && element.points.length >= 2) {
      for (let i = 0; i < element.points.length - 1; i++) {
        const midpoint = calculateMidpoint(element.points[i], element.points[i + 1])
        const distance = calculateDistance(mousePos, midpoint)
        if (distance < tolerance) {
          if (!closest || distance < closest.distance) {
            closest = { point: midpoint, type: 'midpoint', distance }
          }
        }
      }
    }
  })
  
  return closest
}

export const findCenterSnap = (mousePos: Point, elements: any[], tolerance: number): SnapPoint | null => {
  let closest: SnapPoint | null = null
  
  elements.forEach(element => {
    if (element.type === 'circle' && element.points.length > 0) {
      const center = element.points[0]
      const distance = calculateDistance(mousePos, center)
      if (distance < tolerance) {
        if (!closest || distance < closest.distance) {
          closest = { point: center, type: 'center', distance }
        }
      }
    }
  })
  
  return closest
}

export const findIntersectionSnap = (mousePos: Point, elements: any[], tolerance: number): SnapPoint | null => {
  let closest: SnapPoint | null = null
  
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const intersection = findLineIntersection(elements[i], elements[j])
      if (intersection) {
        const distance = calculateDistance(mousePos, intersection)
        if (distance < tolerance) {
          if (!closest || distance < closest.distance) {
            closest = { point: intersection, type: 'intersection', distance }
          }
        }
      }
    }
  }
  
  return closest
}

export const findLineIntersection = (line1: any, line2: any): Point | null => {
  if (!line1.points || !line2.points || line1.points.length < 2 || line2.points.length < 2) {
    return null
  }
  
  const p1 = line1.points[0]
  const p2 = line1.points[line1.points.length - 1]
  const p3 = line2.points[0]
  const p4 = line2.points[line2.points.length - 1]
  
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)
  if (Math.abs(denom) < 0.0001) return null
  
  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom
  
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  }
}

// ============ TRANSFORMATION UTILITIES ============

export const mirrorElement = (element: any, mirrorLine: { p1: Point; p2: Point }): any => {
  const mirrored = { ...element, points: element.points.map((p: Point) => mirrorPoint(p, mirrorLine)) }
  return mirrored
}

export const mirrorPoint = (point: Point, mirrorLine: { p1: Point; p2: Point }): Point => {
  const { p1, p2 } = mirrorLine
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const a = (dx * dx - dy * dy) / (dx * dx + dy * dy)
  const b = (2 * dx * dy) / (dx * dx + dy * dy)
  
  const cx = point.x - p1.x
  const cy = point.y - p1.y
  
  return {
    x: p1.x + a * cx + b * cy,
    y: p1.y + b * cx - a * cy
  }
}

export const offsetElement = (element: any, distance: number): any => {
  if (element.type === 'line' || element.type === 'polyline') {
    return offsetPolyline(element, distance)
  }
  return element
}

export const offsetPolyline = (element: any, distance: number): any => {
  const offsetPoints = offsetPoints_impl(element.points, distance)
  return { ...element, points: offsetPoints }
}

export const offsetPoints_impl = (points: Point[], distance: number): Point[] => {
  if (points.length < 2) return points
  
  const result: Point[] = []
  for (let i = 0; i < points.length; i++) {
    const prev = points[i - 1] || points[i]
    const curr = points[i]
    const next = points[i + 1] || points[i]
    
    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)
    const angle = (angle1 + angle2) / 2
    
    result.push({
      x: curr.x + distance * Math.cos(angle + Math.PI / 2),
      y: curr.y + distance * Math.sin(angle + Math.PI / 2)
    })
  }
  
  return result
}

// ============ MEASUREMENT UTILITIES ============

export const calculateArea = (points: Point[]): number => {
  if (points.length < 3) return 0
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }
  return Math.abs(area) / 2
}

export const calculatePerimeter = (points: Point[]): number => {
  if (points.length < 2) return 0
  let perimeter = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    perimeter += calculateDistance(points[i], points[j])
  }
  return perimeter
}

export const calculateCenterOfGravity = (points: Point[]): Point => {
  if (points.length === 0) return { x: 0, y: 0 }
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
  return { x: sum.x / points.length, y: sum.y / points.length }
}

// ============ ARRAY UTILITIES ============

export const createRectangularArray = (element: any, rows: number, cols: number, spacingX: number, spacingY: number): any[] => {
  const result: any[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = c * spacingX
      const offsetY = r * spacingY
      const newElement = {
        ...element,
        id: `${element.id}_array_${r}_${c}`,
        points: element.points.map((p: Point) => ({ x: p.x + offsetX, y: p.y + offsetY }))
      }
      result.push(newElement)
    }
  }
  return result
}

export const createPolarArray = (element: any, count: number, radius: number, center: Point): any[] => {
  const result: any[] = []
  const angleStep = (2 * Math.PI) / count
  
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep
    const offsetX = radius * Math.cos(angle)
    const offsetY = radius * Math.sin(angle)
    
    const newElement = {
      ...element,
      id: `${element.id}_polar_${i}`,
      points: element.points.map((p: Point) => ({
        x: center.x + (p.x - center.x) * Math.cos(angle) - (p.y - center.y) * Math.sin(angle) + offsetX,
        y: center.y + (p.x - center.x) * Math.sin(angle) + (p.y - center.y) * Math.cos(angle) + offsetY
      }))
    }
    result.push(newElement)
  }
  
  return result
}

