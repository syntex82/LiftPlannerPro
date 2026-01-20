// Equipment Library - Defines available cranes and their specifications for training scenarios

// Represents a crane's specifications for training
export interface CraneEquipment {
  id: string
  name: string
  type: 'mobile' | 'tower' | 'crawler' | 'rough-terrain'
  maxCapacity: number // kg
  maxRadius: number // meters
  maxHeight: number // meters
  
  // Physical dimensions
  dimensions: {
    length: number // meters
    width: number
    height: number
    wheelbase?: number
  }
  
  // Outrigger specifications
  outriggers: {
    count: number
    spreadWidth: number // meters between outriggers
    minSpread: number // minimum spread required
    maxSpread: number
  }
  
  // Ground bearing
  groundBearing: number // kg/cm² - how much pressure it exerts
  
  // Boom specifications
  boom: {
    baseLength: number // meters
    maxExtension: number
    sections: number
    luffingAngle: {
      min: number // degrees
      max: number
    }
  }
  
  // Load chart - capacity at different radii
  loadChart: Array<{
    radius: number // meters
    capacity: number // kg
  }>
  
  description: string
  imageUrl?: string
}

// Equipment library with sample cranes
export const equipmentLibrary: Map<string, CraneEquipment> = new Map([
  [
    'crane-mobile-25t',
    {
      id: 'crane-mobile-25t',
      name: 'Mobile Crane 25T',
      type: 'mobile',
      maxCapacity: 25000,
      maxRadius: 35,
      maxHeight: 40,
      
      dimensions: {
        length: 10,
        width: 2.5,
        height: 3.5,
        wheelbase: 6
      },
      
      outriggers: {
        count: 4,
        spreadWidth: 6,
        minSpread: 4,
        maxSpread: 8
      },
      
      groundBearing: 35,
      
      boom: {
        baseLength: 15,
        maxExtension: 35,
        sections: 3,
        luffingAngle: { min: 0, max: 85 }
      },
      
      loadChart: [
        { radius: 5, capacity: 25000 },
        { radius: 10, capacity: 20000 },
        { radius: 15, capacity: 15000 },
        { radius: 20, capacity: 10000 },
        { radius: 25, capacity: 7000 },
        { radius: 30, capacity: 4000 },
        { radius: 35, capacity: 2000 }
      ],
      
      description: 'Compact mobile crane suitable for urban sites and confined spaces'
    }
  ],
  [
    'crane-mobile-35t',
    {
      id: 'crane-mobile-35t',
      name: 'Mobile Crane 35T',
      type: 'mobile',
      maxCapacity: 35000,
      maxRadius: 45,
      maxHeight: 50,
      
      dimensions: {
        length: 12,
        width: 2.8,
        height: 4,
        wheelbase: 7
      },
      
      outriggers: {
        count: 4,
        spreadWidth: 7,
        minSpread: 5,
        maxSpread: 9
      },
      
      groundBearing: 40,
      
      boom: {
        baseLength: 18,
        maxExtension: 45,
        sections: 4,
        luffingAngle: { min: 0, max: 85 }
      },
      
      loadChart: [
        { radius: 5, capacity: 35000 },
        { radius: 10, capacity: 28000 },
        { radius: 15, capacity: 22000 },
        { radius: 20, capacity: 16000 },
        { radius: 25, capacity: 12000 },
        { radius: 30, capacity: 8000 },
        { radius: 35, capacity: 5000 },
        { radius: 40, capacity: 3000 },
        { radius: 45, capacity: 1500 }
      ],
      
      description: 'Mid-range mobile crane for general industrial lifting'
    }
  ],
  [
    'crane-mobile-50t',
    {
      id: 'crane-mobile-50t',
      name: 'Mobile Crane 50T',
      type: 'mobile',
      maxCapacity: 50000,
      maxRadius: 55,
      maxHeight: 60,
      
      dimensions: {
        length: 14,
        width: 3,
        height: 4.5,
        wheelbase: 8
      },
      
      outriggers: {
        count: 4,
        spreadWidth: 8,
        minSpread: 6,
        maxSpread: 10
      },
      
      groundBearing: 45,
      
      boom: {
        baseLength: 20,
        maxExtension: 55,
        sections: 5,
        luffingAngle: { min: 0, max: 85 }
      },
      
      loadChart: [
        { radius: 5, capacity: 50000 },
        { radius: 10, capacity: 40000 },
        { radius: 15, capacity: 32000 },
        { radius: 20, capacity: 24000 },
        { radius: 25, capacity: 18000 },
        { radius: 30, capacity: 13000 },
        { radius: 35, capacity: 9000 },
        { radius: 40, capacity: 6000 },
        { radius: 45, capacity: 4000 },
        { radius: 50, capacity: 2500 },
        { radius: 55, capacity: 1500 }
      ],
      
      description: 'Heavy-duty mobile crane for major industrial projects'
    }
  ]
])

/**
 * Get equipment by ID
 */
export function getEquipment(equipmentId: string): CraneEquipment | null {
  return equipmentLibrary.get(equipmentId) || null
}

/**
 * Get all available equipment
 */
export function getAllEquipment(): CraneEquipment[] {
  return Array.from(equipmentLibrary.values())
}

/**
 * Get equipment suitable for a load
 */
export function getEquipmentForLoad(
  loadWeight: number,
  requiredRadius: number
): CraneEquipment[] {
  return Array.from(equipmentLibrary.values()).filter(crane => {
    // Check if crane can lift the load at the required radius
    const capacityAtRadius = crane.loadChart.find(
      chart => chart.radius >= requiredRadius
    )
    return capacityAtRadius && capacityAtRadius.capacity >= loadWeight
  })
}

/**
 * Check if equipment can support its own weight on ground
 */
export function canEquipmentSupportItself(
  equipment: CraneEquipment,
  groundBearing: number
): boolean {
  // Simplified: assume crane weight is roughly 1/3 of max capacity
  const craneWeight = equipment.maxCapacity / 3
  const requiredBearing = craneWeight / (equipment.dimensions.width * equipment.dimensions.length * 10000)
  return groundBearing >= requiredBearing
}

