// Configurable Crane Generator - Creates dynamic crane models based on user parameters
import { CraneSpecifications, Point } from './crane-models'

export type OutriggerPattern = 'H-pattern' | 'X-pattern' | 'box-pattern'

export interface ConfigurableCraneParams {
  name: string
  capacity: number // tonnes (30-300)
  axleCount: number // 2-6 axles
  wheelbase: number // mm - total distance from first to last axle
  boomBaseLength: number // meters
  boomMaxLength: number // meters
  boomSections: number // 3-8 sections
  craneLength: number // mm - overall chassis length
  craneWidth: number // mm - chassis width
  craneHeight: number // mm - transport height
  craneWeight: number // tonnes - base weight without counterweight
  counterweightMass: number // tonnes
  // Outrigger configuration
  outriggerSpan: number // mm - distance outriggers extend from chassis edge
  outriggerPattern: OutriggerPattern // pattern of outrigger deployment
  // Wheel configuration
  wheelDiameter: number // mm - tire diameter for CAD accuracy
  dualTires: boolean // whether axles have dual tires (common on heavy cranes)
}

/**
 * Generate a configurable crane specification based on parameters
 */
export const generateConfigurableCrane = (params: ConfigurableCraneParams): CraneSpecifications => {
  // Apply defaults for optional parameters
  const fullParams: ConfigurableCraneParams = {
    ...params,
    outriggerSpan: params.outriggerSpan || 4000,
    outriggerPattern: params.outriggerPattern || 'X-pattern',
    wheelDiameter: params.wheelDiameter || 1200,
    dualTires: params.dualTires ?? (params.capacity >= 100) // Default to dual tires for heavier cranes
  }

  // Calculate derived values
  const maxRadius = calculateMaxRadius(fullParams.capacity, fullParams.boomMaxLength)
  const maxHeight = calculateMaxHeight(fullParams.boomMaxLength)
  const enginePower = calculateEnginePower(fullParams.capacity)
  const loadChart = generateLoadChart(fullParams.capacity, fullParams.boomMaxLength)
  const cadData = generateCADData(fullParams)

  // Calculate axle positions for use in rendering
  const axlePositions: number[] = []
  const wheelbaseMeters = fullParams.wheelbase / 1000 // Convert mm to meters
  if (fullParams.axleCount === 1) {
    axlePositions.push(0)
  } else {
    const spacing = wheelbaseMeters / (fullParams.axleCount - 1)
    const startPos = -wheelbaseMeters / 2
    for (let i = 0; i < fullParams.axleCount; i++) {
      axlePositions.push(startPos + (i * spacing))
    }
  }

  return {
    id: `custom-crane-${Date.now()}`,
    manufacturer: 'Custom',
    model: fullParams.name,
    type: fullParams.axleCount >= 4 ? 'all-terrain' : 'truck',
    category: 'mobile',

    maxCapacity: fullParams.capacity,
    maxRadius,
    maxHeight,

    dimensions: {
      length: fullParams.craneLength,
      width: fullParams.craneWidth,
      height: fullParams.craneHeight,
      weight: fullParams.craneWeight,
      wheelbase: fullParams.wheelbase
    },

    // Axle configuration for CAD drawing
    axles: {
      count: fullParams.axleCount,
      positions: axlePositions, // Positions in meters relative to chassis center
      wheelDiameter: fullParams.wheelDiameter,
      dualTires: fullParams.dualTires
    },

    // Outrigger configuration
    outriggers: {
      span: fullParams.outriggerSpan,
      pattern: fullParams.outriggerPattern
    },

    boom: {
      baseLength: fullParams.boomBaseLength,
      maxLength: fullParams.boomMaxLength,
      sections: fullParams.boomSections,
      luffingAngle: { min: 0, max: 85 },
      telescopic: true
    },

    loadChart,

    engine: {
      manufacturer: 'Custom',
      model: `${fullParams.capacity}t Engine`,
      power: enginePower,
      fuelType: 'diesel',
      emissions: 'EU Stage V'
    },

    operational: {
      workingSpeed: {
        hoist: 100 + (fullParams.capacity / 3),
        boom: 2.5 + (fullParams.capacity / 100),
        swing: 2.0 + (fullParams.capacity / 150),
        travel: 80 + (fullParams.capacity / 10)
      },
      gradeability: 65 + (fullParams.axleCount * 0.5),
      groundPressure: calculateGroundPressure(fullParams)
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData,

    certification: {
      standards: ['EN 13000', 'ASME B30.5', 'CE'],
      certificationBody: 'TÜV Rheinland'
    }
  }
}

/**
 * Calculate ground pressure based on crane weight and footprint
 */
const calculateGroundPressure = (params: ConfigurableCraneParams): number => {
  // Approximate ground pressure in kg/cm²
  // Based on total weight distributed over outrigger pads
  const totalWeight = (params.craneWeight + params.counterweightMass) * 1000 // kg
  const padSize = 60 * 60 // 60cm x 60cm pad, typical
  const numPads = 4
  return Math.round((totalWeight / (padSize * numPads)) * 10) / 10
}

/**
 * Calculate maximum radius based on capacity and boom length
 */
const calculateMaxRadius = (capacity: number, boomMaxLength: number): number => {
  // Typical ratio: radius ≈ 0.85 * boom length
  return Math.round(boomMaxLength * 0.85)
}

/**
 * Calculate maximum height based on boom length
 */
const calculateMaxHeight = (boomMaxLength: number): number => {
  // Typical ratio: height ≈ 1.2 * boom length (accounting for angle)
  return Math.round(boomMaxLength * 1.2)
}

/**
 * Calculate engine power based on capacity
 */
const calculateEnginePower = (capacity: number): number => {
  // Rough estimate: 1.2-1.5 kW per tonne
  return Math.round(capacity * 1.3)
}

/**
 * Generate load chart based on capacity and boom length
 */
const generateLoadChart = (capacity: number, boomMaxLength: number): Array<{ radius: number; capacity: number }> => {
  const chart = []
  const maxRadius = calculateMaxRadius(capacity, boomMaxLength)
  
  // Generate points from 2m to max radius
  for (let radius = 2; radius <= maxRadius; radius += Math.max(2, Math.floor(maxRadius / 10))) {
    // Capacity decreases with radius (parabolic relationship)
    const radiusRatio = radius / maxRadius
    const capacityAtRadius = capacity * Math.pow(1 - radiusRatio * 0.8, 2)
    chart.push({
      radius,
      capacity: Math.max(1, Math.round(capacityAtRadius * 10) / 10)
    })
  }
  
  // Ensure we have the max radius point
  chart.push({
    radius: maxRadius,
    capacity: Math.round(capacity * 0.05 * 10) / 10
  })
  
  return chart
}

/**
 * Generate CAD drawing data based on parameters
 * Creates dynamic axle/wheel positions based on axle count and wheelbase
 */
const generateCADData = (params: ConfigurableCraneParams) => {
  // Convert mm to drawing units (1:10 scale)
  const baseLength = params.craneLength / 100
  const baseWidth = params.craneWidth / 100
  const wheelbase = params.wheelbase / 100
  const outriggerSpan = (params.outriggerSpan || 4000) / 100
  const wheelRadius = (params.wheelDiameter || 1200) / 200 // Radius in drawing units

  // Base points (chassis rectangle)
  const basePoints: Point[] = [
    { x: -baseLength / 2, y: -baseWidth / 2 },
    { x: baseLength / 2, y: -baseWidth / 2 },
    { x: baseLength / 2, y: baseWidth / 2 },
    { x: -baseLength / 2, y: baseWidth / 2 }
  ]

  // Generate dynamic axle/wheel positions based on axle count
  // Axles are evenly distributed across the wheelbase
  const wheelPoints: Point[] = []
  const axlePositions: number[] = []

  if (params.axleCount === 1) {
    // Single axle at center
    axlePositions.push(0)
  } else {
    // Distribute axles evenly across wheelbase
    const axleSpacing = wheelbase / (params.axleCount - 1)
    const startX = -wheelbase / 2
    for (let i = 0; i < params.axleCount; i++) {
      axlePositions.push(startX + (i * axleSpacing))
    }
  }

  // Generate wheel points for each axle (left and right wheels)
  axlePositions.forEach(axleX => {
    // Left wheel
    wheelPoints.push({
      x: axleX,
      y: -baseWidth / 2 - wheelRadius
    })
    // Right wheel
    wheelPoints.push({
      x: axleX,
      y: baseWidth / 2 + wheelRadius
    })

    // Add dual tire positions if enabled
    if (params.dualTires) {
      wheelPoints.push({
        x: axleX,
        y: -baseWidth / 2 - wheelRadius * 2.5
      })
      wheelPoints.push({
        x: axleX,
        y: baseWidth / 2 + wheelRadius * 2.5
      })
    }
  })

  // Counterweight at rear of crane
  const cwWidth = baseLength * 0.25
  const cwDepth = baseWidth * 0.8
  const counterweightPoints: Point[] = [
    { x: -baseLength / 2 + 2, y: -cwDepth / 2 },
    { x: -baseLength / 2 + cwWidth, y: -cwDepth / 2 },
    { x: -baseLength / 2 + cwWidth, y: cwDepth / 2 },
    { x: -baseLength / 2 + 2, y: cwDepth / 2 }
  ]

  // Cab at front-right of crane
  const cabWidth = baseLength * 0.18
  const cabDepth = baseWidth * 0.65
  const cabPoints: Point[] = [
    { x: baseLength / 2 - cabWidth - 2, y: -cabDepth / 2 },
    { x: baseLength / 2 - 2, y: -cabDepth / 2 },
    { x: baseLength / 2 - 2, y: cabDepth / 2 },
    { x: baseLength / 2 - cabWidth - 2, y: cabDepth / 2 }
  ]

  // Generate outrigger positions based on pattern
  const outriggerPoints: Point[] = generateOutriggerPoints(
    baseLength,
    baseWidth,
    outriggerSpan,
    params.outriggerPattern || 'X-pattern'
  )

  return {
    basePoints,
    boomPoints: [{ x: 0, y: 0 }], // Boom pivot at center
    counterweightPoints,
    cabPoints,
    trackPoints: wheelPoints, // Using trackPoints for wheel positions
    outriggerPoints,
    // Additional data for enhanced rendering
    axleCount: params.axleCount,
    axlePositions,
    wheelRadius,
    dualTires: params.dualTires,
    outriggerSpan,
    outriggerPattern: params.outriggerPattern,
    scale: 1.0,
    color: '#FF6B35', // Orange for custom cranes
    lineWeight: 2
  }
}

/**
 * Generate outrigger points based on pattern
 */
const generateOutriggerPoints = (
  baseLength: number,
  baseWidth: number,
  outriggerSpan: number,
  pattern: OutriggerPattern
): Point[] => {
  const points: Point[] = []
  const halfLength = baseLength / 2
  const halfWidth = baseWidth / 2
  const spanOffset = outriggerSpan / 2

  switch (pattern) {
    case 'H-pattern':
      // H-pattern: outriggers extend straight out from sides
      // Front pair
      points.push({ x: halfLength - 10, y: -halfWidth - spanOffset })
      points.push({ x: halfLength - 10, y: halfWidth + spanOffset })
      // Rear pair
      points.push({ x: -halfLength + 10, y: -halfWidth - spanOffset })
      points.push({ x: -halfLength + 10, y: halfWidth + spanOffset })
      break

    case 'box-pattern':
      // Box pattern: outriggers at corners extend straight out
      // Front-left, Front-right, Rear-right, Rear-left
      points.push({ x: halfLength - 5, y: -halfWidth - spanOffset })
      points.push({ x: halfLength - 5, y: halfWidth + spanOffset })
      points.push({ x: -halfLength + 5, y: halfWidth + spanOffset })
      points.push({ x: -halfLength + 5, y: -halfWidth - spanOffset })
      break

    case 'X-pattern':
    default:
      // X-pattern: outriggers extend diagonally from corners (most common)
      const diagOffset = spanOffset * 0.7 // 45-degree diagonal
      // Front-left (extends forward-left)
      points.push({ x: halfLength + diagOffset, y: -halfWidth - diagOffset })
      // Front-right (extends forward-right)
      points.push({ x: halfLength + diagOffset, y: halfWidth + diagOffset })
      // Rear-right (extends back-right)
      points.push({ x: -halfLength - diagOffset, y: halfWidth + diagOffset })
      // Rear-left (extends back-left)
      points.push({ x: -halfLength - diagOffset, y: -halfWidth - diagOffset })
      break
  }

  return points
}

