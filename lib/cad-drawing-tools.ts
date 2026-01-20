/**
 * Advanced CAD Drawing Tools
 * Advanced dimension tools and utilities
 */

export interface Point {
  x: number
  y: number
}

export interface DrawingElement {
  id: string
  type: string
  points: Point[]
  style: any
  [key: string]: any
}

// Advanced Dimension Tool - Linear dimensions
export function createLinearDimension(
  point1: Point,
  point2: Point,
  offset: number = 30,
  style: any = {}
): DrawingElement {
  const distance = Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  )

  // Calculate perpendicular offset for dimension line
  const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x)
  const perpAngle = angle + Math.PI / 2

  const dimPoint1 = {
    x: point1.x + offset * Math.cos(perpAngle),
    y: point1.y + offset * Math.sin(perpAngle)
  }

  const dimPoint2 = {
    x: point2.x + offset * Math.cos(perpAngle),
    y: point2.y + offset * Math.sin(perpAngle)
  }

  return {
    id: `dimension-${Date.now()}`,
    type: 'linearDimension',
    points: [point1, point2, dimPoint1, dimPoint2],
    style: {
      stroke: style.stroke || '#ffff00',
      strokeWidth: style.strokeWidth || 1,
      fontSize: style.fontSize || 12,
      fontFamily: style.fontFamily || 'Arial'
    },
    distance: distance.toFixed(2),
    offset,
    text: `${distance.toFixed(2)}`
  }
}

// Angular Dimension Tool
export function createAngularDimension(
  vertex: Point,
  point1: Point,
  point2: Point,
  radius: number = 50,
  style: any = {}
): DrawingElement {
  const angle1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x)
  const angle2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x)
  let angleDiff = angle2 - angle1

  // Normalize angle to 0-360
  if (angleDiff < 0) angleDiff += Math.PI * 2
  if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff

  const degrees = (angleDiff * 180) / Math.PI

  return {
    id: `angularDim-${Date.now()}`,
    type: 'angularDimension',
    points: [vertex, point1, point2],
    style: {
      stroke: style.stroke || '#ffff00',
      strokeWidth: style.strokeWidth || 1,
      fontSize: style.fontSize || 12
    },
    angle: degrees.toFixed(2),
    radius,
    text: `${degrees.toFixed(2)}°`
  }
}

// Radial Dimension Tool
export function createRadialDimension(
  center: Point,
  point: Point,
  style: any = {}
): DrawingElement {
  const radius = Math.sqrt(
    Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
  )

  return {
    id: `radialDim-${Date.now()}`,
    type: 'radialDimension',
    points: [center, point],
    style: {
      stroke: style.stroke || '#ffff00',
      strokeWidth: style.strokeWidth || 1,
      fontSize: style.fontSize || 12
    },
    radius: radius.toFixed(2),
    text: `R${radius.toFixed(2)}`
  }
}

// Extend Tool - Extend lines to intersection
export function extendLineToIntersection(
  line: DrawingElement,
  targetLine: DrawingElement,
  tolerance: number = 5
): DrawingElement {
  if (line.type !== 'line' || targetLine.type !== 'line') {
    return line
  }

  const p1 = line.points[0]
  const p2 = line.points[1]
  const p3 = targetLine.points[0]
  const p4 = targetLine.points[1]

  // Find intersection point
  const intersection = findLineIntersection(p1, p2, p3, p4)

  if (intersection) {
    return {
      ...line,
      points: [p1, intersection]
    }
  }

  return line
}

// Break/Split Tool - Split element at point
export function breakElementAtPoint(
  element: DrawingElement,
  breakPoint: Point,
  tolerance: number = 5
): DrawingElement[] {
  if (element.type === 'line' && element.points.length >= 2) {
    const p1 = element.points[0]
    const p2 = element.points[1]

    // Check if point is on line
    const distance = pointToLineDistance(breakPoint, p1, p2)

    if (distance <= tolerance) {
      // Create two new lines
      return [
        {
          ...element,
          id: `${element.id}-1`,
          points: [p1, breakPoint]
        },
        {
          ...element,
          id: `${element.id}-2`,
          points: [breakPoint, p2]
        }
      ]
    }
  }

  return [element]
}

// Stretch Tool - Stretch selected elements
export function stretchElements(
  elements: DrawingElement[],
  fromPoint: Point,
  toPoint: Point,
  selectionBox: any
): DrawingElement[] {
  const deltaX = toPoint.x - fromPoint.x
  const deltaY = toPoint.y - fromPoint.y

  return elements.map(element => {
    // Only stretch points within selection box
    const newPoints = element.points.map(point => {
      if (
        point.x >= selectionBox.minX &&
        point.x <= selectionBox.maxX &&
        point.y >= selectionBox.minY &&
        point.y <= selectionBox.maxY
      ) {
        return {
          x: point.x + deltaX,
          y: point.y + deltaY
        }
      }
      return point
    })

    return {
      ...element,
      points: newPoints
    }
  })
}

// Align Tool - Align selected elements
export function alignElements(
  elements: DrawingElement[],
  alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v'
): DrawingElement[] {
  if (elements.length < 2) return elements

  // Calculate bounds for all elements
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity

  elements.forEach(element => {
    element.points.forEach(point => {
      minX = Math.min(minX, point.x)
      maxX = Math.max(maxX, point.x)
      minY = Math.min(minY, point.y)
      maxY = Math.max(maxY, point.y)
    })
  })

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  return elements.map(element => {
    const elementMinX = Math.min(...element.points.map(p => p.x))
    const elementMaxX = Math.max(...element.points.map(p => p.x))
    const elementMinY = Math.min(...element.points.map(p => p.y))
    const elementMaxY = Math.max(...element.points.map(p => p.y))

    let offsetX = 0,
      offsetY = 0

    switch (alignment) {
      case 'left':
        offsetX = minX - elementMinX
        break
      case 'right':
        offsetX = maxX - elementMaxX
        break
      case 'top':
        offsetY = minY - elementMinY
        break
      case 'bottom':
        offsetY = maxY - elementMaxY
        break
      case 'center-h':
        offsetX = centerX - (elementMinX + elementMaxX) / 2
        break
      case 'center-v':
        offsetY = centerY - (elementMinY + elementMaxY) / 2
        break
    }

    return {
      ...element,
      points: element.points.map(p => ({
        x: p.x + offsetX,
        y: p.y + offsetY
      }))
    }
  })
}

// Helper: Find line intersection
function findLineIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  const x1 = p1.x,
    y1 = p1.y
  const x2 = p2.x,
    y2 = p2.y
  const x3 = p3.x,
    y3 = p3.y
  const x4 = p4.x,
    y4 = p4.y

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

  if (Math.abs(denom) < 0.0001) return null

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom

  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1)
  }
}

// Helper: Point to line distance
function pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.x - lineStart.x
  const B = point.y - lineStart.y
  const C = lineEnd.x - lineStart.x
  const D = lineEnd.y - lineStart.y

  const dot = A * C + B * D
  const lenSq = C * C + D * D

  let param = -1
  if (lenSq !== 0) param = dot / lenSq

  let xx, yy

  if (param < 0) {
    xx = lineStart.x
    yy = lineStart.y
  } else if (param > 1) {
    xx = lineEnd.x
    yy = lineEnd.y
  } else {
    xx = lineStart.x + param * C
    yy = lineStart.y + param * D
  }

  const dx = point.x - xx
  const dy = point.y - yy

  return Math.sqrt(dx * dx + dy * dy)
}

