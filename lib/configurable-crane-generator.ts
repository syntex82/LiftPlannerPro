// Configurable Crane Generator - Creates dynamic crane models based on user parameters
import { CraneSpecifications, Point } from './crane-models'

export interface ConfigurableCraneParams {
  name: string
  capacity: number // tonnes (30-300)
  axleCount: number // 2-6 axles
  wheelbase: number // mm
  boomBaseLength: number // meters
  boomMaxLength: number // meters
  boomSections: number // 3-8 sections
  craneLength: number // mm
  craneWidth: number // mm
  craneHeight: number // mm
  craneWeight: number // tonnes
  counterweightMass: number // tonnes
}

/**
 * Generate a configurable crane specification based on parameters
 */
export const generateConfigurableCrane = (params: ConfigurableCraneParams): CraneSpecifications => {
  // Calculate derived values
  const maxRadius = calculateMaxRadius(params.capacity, params.boomMaxLength)
  const maxHeight = calculateMaxHeight(params.boomMaxLength)
  const enginePower = calculateEnginePower(params.capacity)
  const loadChart = generateLoadChart(params.capacity, params.boomMaxLength)
  const cadData = generateCADData(params)

  return {
    id: `custom-crane-${Date.now()}`,
    manufacturer: 'Custom',
    model: params.name,
    type: params.axleCount >= 4 ? 'all-terrain' : 'truck',
    category: 'mobile',

    maxCapacity: params.capacity,
    maxRadius,
    maxHeight,

    dimensions: {
      length: params.craneLength,
      width: params.craneWidth,
      height: params.craneHeight,
      weight: params.craneWeight,
      wheelbase: params.wheelbase
    },

    boom: {
      baseLength: params.boomBaseLength,
      maxLength: params.boomMaxLength,
      sections: params.boomSections,
      luffingAngle: { min: 0, max: 85 },
      telescopic: true
    },

    loadChart,

    engine: {
      manufacturer: 'Custom',
      model: `${params.capacity}t Engine`,
      power: enginePower,
      fuelType: 'diesel',
      emissions: 'EU Stage V'
    },

    operational: {
      workingSpeed: {
        hoist: 100 + (params.capacity / 3),
        boom: 2.5 + (params.capacity / 100),
        swing: 2.0 + (params.capacity / 150),
        travel: 80 + (params.capacity / 10)
      },
      gradeability: 65 + (params.axleCount * 0.5),
      groundPressure: 0
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
 */
const generateCADData = (params: ConfigurableCraneParams) => {
  const baseLength = params.craneLength / 10 // Convert mm to drawing units
  const baseWidth = params.craneWidth / 10
  const axleSpacing = params.wheelbase / (params.axleCount - 1) / 10

  // Base points (chassis)
  const basePoints: Point[] = [
    { x: -baseLength / 2, y: -baseWidth / 2 },
    { x: baseLength / 2, y: -baseWidth / 2 },
    { x: baseLength / 2, y: baseWidth / 2 },
    { x: -baseLength / 2, y: baseWidth / 2 }
  ]

  // Axle/wheel points
  const wheelPoints: Point[] = []
  const startX = -params.wheelbase / 20
  for (let i = 0; i < params.axleCount; i++) {
    wheelPoints.push({
      x: startX + (i * axleSpacing),
      y: -baseWidth / 2 - 5
    })
  }

  // Counterweight points
  const counterweightPoints: Point[] = [
    { x: -baseLength / 2 + 10, y: -baseWidth / 2 + 5 },
    { x: -baseLength / 2 + 30, y: -baseWidth / 2 + 5 },
    { x: -baseLength / 2 + 30, y: baseWidth / 2 - 5 },
    { x: -baseLength / 2 + 10, y: baseWidth / 2 - 5 }
  ]

  // Cab points
  const cabPoints: Point[] = [
    { x: baseLength / 2 - 30, y: -baseWidth / 2 + 5 },
    { x: baseLength / 2 - 5, y: -baseWidth / 2 + 5 },
    { x: baseLength / 2 - 5, y: baseWidth / 2 - 5 },
    { x: baseLength / 2 - 30, y: baseWidth / 2 - 5 }
  ]

  // Outrigger points
  const outriggerPoints: Point[] = [
    { x: -baseLength / 2 - 5, y: -baseWidth / 2 - 10 },
    { x: baseLength / 2 + 5, y: -baseWidth / 2 - 10 },
    { x: baseLength / 2 + 5, y: baseWidth / 2 + 10 },
    { x: -baseLength / 2 - 5, y: baseWidth / 2 + 10 }
  ]

  return {
    basePoints,
    boomPoints: [{ x: 0, y: 0 }],
    counterweightPoints,
    cabPoints,
    trackPoints: wheelPoints,
    outriggerPoints,
    scale: 1.0,
    color: '#FF6B35', // Orange for custom cranes
    lineWeight: 2
  }
}

