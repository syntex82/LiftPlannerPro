/**
 * 3D Crane Model Library
 * Professional 3D crane model definitions for the CAD modeler
 * Based on real-world specifications from manufacturers like Liebherr
 */

// 3D Crane Model Specification Interface
export interface Crane3DSpec {
  id: string
  manufacturer: string
  model: string
  type: 'mobile' | 'all-terrain' | 'truck' | 'crawler' | 'tower'

  // Overall dimensions in meters
  dimensions: {
    chassisLength: number
    chassisWidth: number
    chassisHeight: number
    totalHeight: number // Transport height
    weight: number // tonnes
  }

  // Axle configuration
  axles: {
    count: number
    positions: number[] // X positions relative to chassis center (meters)
    wheelRadius: number // meters
    wheelWidth: number // meters
    dualTires: boolean
  }

  // Boom configuration
  boom: {
    baseLength: number // meters (retracted)
    maxLength: number // meters (fully extended)
    sections: number
    pivotHeight: number // Height of boom pivot above ground
    pivotOffset: number // X offset from chassis center
    baseWidth: number // meters
    baseHeight: number // meters
  }

  // Superstructure (turntable and upper works)
  superstructure: {
    width: number
    length: number
    height: number
    turntableRadius: number
    offsetX: number // Position relative to chassis center
  }

  // Counterweight
  counterweight: {
    width: number
    length: number
    height: number
    mass: number // tonnes
    offsetX: number // Behind superstructure
  }

  // Operator cabs
  driverCab: {
    width: number
    length: number
    height: number
    offsetX: number
    offsetZ: number
  }

  craneCab: {
    width: number
    length: number
    height: number
    offsetX: number
    offsetZ: number
  }

  // Outriggers
  outriggers: {
    count: number // Usually 4
    beamLength: number // Extended length
    beamWidth: number
    padSize: number
    positions: { x: number; z: number }[] // Base positions
  }

  // Colors (Liebherr scheme)
  colors: {
    chassis: string
    boom: string
    counterweight: string
    cab: string
    wheels: string
    outriggerPads: string
  }

  // Capacity
  maxCapacity: number // tonnes
  maxRadius: number // meters
}

// Liebherr LTM 1055-3.1 Specification
// Real-world data: 55t capacity, 3-axle all-terrain crane
export const LTM_1055_3D_SPEC: Crane3DSpec = {
  id: 'ltm-1055-3d',
  manufacturer: 'Liebherr',
  model: 'LTM 1055-3.1',
  type: 'all-terrain',

  dimensions: {
    chassisLength: 11.36, // 11,360mm
    chassisWidth: 2.55,   // 2,550mm
    chassisHeight: 1.2,   // Chassis frame height
    totalHeight: 3.85,    // Transport height
    weight: 36            // 36 tonnes
  },

  axles: {
    count: 3,
    // 3 axles: front steering, middle, rear steering
    positions: [-3.8, 0, 3.8], // Approximate positions
    wheelRadius: 0.55,
    wheelWidth: 0.35,
    dualTires: false
  },

  boom: {
    baseLength: 10.5,
    maxLength: 40,
    sections: 5,
    pivotHeight: 3.2,
    pivotOffset: -1.5, // Slightly behind center
    baseWidth: 0.8,
    baseHeight: 0.9
  },

  superstructure: {
    width: 2.4,
    length: 3.5,
    height: 1.8,
    turntableRadius: 1.2,
    offsetX: -1.0
  },

  counterweight: {
    width: 2.2,
    length: 1.5,
    height: 1.2,
    mass: 12.5, // tonnes
    offsetX: -3.5
  },

  driverCab: {
    width: 2.3,
    length: 2.0,
    height: 1.8,
    offsetX: 4.5, // Front of chassis
    offsetZ: 0
  },

  craneCab: {
    width: 1.2,
    length: 1.5,
    height: 1.4,
    offsetX: 0.5,
    offsetZ: 1.0
  },

  outriggers: {
    count: 4,
    beamLength: 3.5,
    beamWidth: 0.15,
    padSize: 0.6,
    positions: [
      { x: 3.5, z: 1.3 },   // Front right
      { x: 3.5, z: -1.3 },  // Front left
      { x: -3.5, z: 1.3 },  // Rear right
      { x: -3.5, z: -1.3 }  // Rear left
    ]
  },

  colors: {
    chassis: '#2E8B57',      // Liebherr green
    boom: '#FFD700',         // Liebherr yellow
    counterweight: '#1a1a1a', // Dark gray/black
    cab: '#2E8B57',          // Green
    wheels: '#1a1a1a',       // Black
    outriggerPads: '#4a4a4a' // Gray
  },

  maxCapacity: 55,
  maxRadius: 40
}

// Liebherr LTM 1300-6.2 Specification (larger crane for comparison)
export const LTM_1300_3D_SPEC: Crane3DSpec = {
  id: 'ltm-1300-3d',
  manufacturer: 'Liebherr',
  model: 'LTM 1300-6.2',
  type: 'all-terrain',

  dimensions: {
    chassisLength: 16.77,
    chassisWidth: 3.0,
    chassisHeight: 1.4,
    totalHeight: 4.0,
    weight: 72
  },

  axles: {
    count: 6,
    positions: [-6.5, -4.5, -2.5, 2.5, 4.5, 6.5],
    wheelRadius: 0.6,
    wheelWidth: 0.4,
    dualTires: true
  },

  boom: {
    baseLength: 16,
    maxLength: 78,
    sections: 7,
    pivotHeight: 4.0,
    pivotOffset: -2.0,
    baseWidth: 1.0,
    baseHeight: 1.2
  },

  superstructure: {
    width: 2.8,
    length: 4.5,
    height: 2.2,
    turntableRadius: 1.5,
    offsetX: -1.5
  },

  counterweight: {
    width: 2.6,
    length: 2.0,
    height: 1.5,
    mass: 100,
    offsetX: -5.0
  },

  driverCab: {
    width: 2.5,
    length: 2.5,
    height: 2.0,
    offsetX: 6.5,
    offsetZ: 0
  },

  craneCab: {
    width: 1.4,
    length: 1.8,
    height: 1.6,
    offsetX: 0.8,
    offsetZ: 1.2
  },

  outriggers: {
    count: 4,
    beamLength: 5.0,
    beamWidth: 0.2,
    padSize: 0.8,
    positions: [
      { x: 5.5, z: 1.5 },
      { x: 5.5, z: -1.5 },
      { x: -5.5, z: 1.5 },
      { x: -5.5, z: -1.5 }
    ]
  },

  colors: {
    chassis: '#2E8B57',
    boom: '#FFD700',
    counterweight: '#1a1a1a',
    cab: '#2E8B57',
    wheels: '#1a1a1a',
    outriggerPads: '#4a4a4a'
  },

  maxCapacity: 300,
  maxRadius: 78
}

// Collection of all 3D crane models
export const CRANE_3D_MODELS: Crane3DSpec[] = [
  LTM_1055_3D_SPEC,
  LTM_1300_3D_SPEC
]

// Helper functions
export const getCrane3DById = (id: string): Crane3DSpec | undefined => {
  return CRANE_3D_MODELS.find(crane => crane.id === id)
}

export const getCrane3DByModel = (model: string): Crane3DSpec | undefined => {
  return CRANE_3D_MODELS.find(crane =>
    crane.model.toLowerCase().includes(model.toLowerCase())
  )
}

// Calculate boom tip position based on angle and extension
export const calculateBoomTip = (
  spec: Crane3DSpec,
  boomAngleDeg: number,
  extension: number // 0-1
): { x: number; y: number; z: number } => {
  const boomLength = spec.boom.baseLength +
    (spec.boom.maxLength - spec.boom.baseLength) * extension
  const angleRad = (boomAngleDeg * Math.PI) / 180

  return {
    x: spec.boom.pivotOffset + boomLength * Math.cos(angleRad),
    y: spec.boom.pivotHeight + boomLength * Math.sin(angleRad),
    z: 0
  }
}

// Calculate load capacity at given radius (simplified)
export const getCapacityAtRadius = (
  spec: Crane3DSpec,
  radius: number
): number => {
  // Simplified capacity curve - real cranes have complex load charts
  const maxR = spec.maxRadius
  const maxC = spec.maxCapacity
  if (radius <= 3) return maxC
  if (radius >= maxR) return maxC * 0.03

  // Exponential decay approximation
  const factor = Math.exp(-0.08 * (radius - 3))
  return maxC * factor
}
