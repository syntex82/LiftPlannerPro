// Training lift scenarios - realistic scenarios for step-by-step training

export interface LiftScenario {
  id: string
  title: string
  description: string
  loadName: string
  loadWeight: number // kg
  loadDimensions: { width: number; height: number; depth: number } // meters
  liftHeight: number // meters
  siteDescription: string
  constraints: string[]
  hazards: string[]
  recommendedCrane?: string
  expectedCalculations: {
    loadWeight: number
    radiusAtLift: number
    craneCapacityRequired: number
    riggingWeight: number
    safetyFactor: number
    groundBearingPressure: number
  }
}

export const TRAINING_SCENARIOS: LiftScenario[] = [
  {
    id: 'scenario-1',
    title: 'HVAC Unit to Rooftop',
    description: 'Lift a 5-tonne HVAC unit to the rooftop of a 4-storey building. The unit must be positioned on the roof and secured.',
    loadName: 'HVAC Unit',
    loadWeight: 5000,
    loadDimensions: { width: 2.5, height: 1.8, depth: 1.2 },
    liftHeight: 15,
    siteDescription: 'Urban site with narrow street access. Building has power lines nearby. Soft ground conditions.',
    constraints: [
      'Power lines 8m from building',
      'Narrow street - limited crane positioning',
      'Soft ground - requires outrigger pads',
      'Residential area - noise restrictions',
      'Working hours 8am-5pm only'
    ],
    hazards: [
      'Electrocution risk from power lines',
      'Dropped load risk over street',
      'Crane tip-over on soft ground',
      'Pedestrian safety in street'
    ],
    recommendedCrane: 'Mobile Crane 50T',
    expectedCalculations: {
      loadWeight: 5000,
      radiusAtLift: 12,
      craneCapacityRequired: 6250,
      riggingWeight: 150,
      safetyFactor: 1.25,
      groundBearingPressure: 8.5
    }
  },
  {
    id: 'scenario-2',
    title: 'Steel Beam Installation',
    description: 'Lift and position a 12-tonne steel beam for a warehouse extension. Beam must be placed 8m high on steel columns.',
    loadName: 'Steel Beam',
    loadWeight: 12000,
    loadDimensions: { width: 0.5, height: 0.8, depth: 18 },
    liftHeight: 8,
    siteDescription: 'Industrial site with hard-standing. Existing warehouse nearby. Clear weather forecast.',
    constraints: [
      'Existing building 5m away',
      'Hard-standing surface',
      'Limited swing radius',
      'Beam must be positioned precisely'
    ],
    hazards: [
      'Collision with existing building',
      'Dropped load on personnel',
      'Beam rotation during lift',
      'Rigging failure'
    ],
    recommendedCrane: 'Mobile Crane 100T',
    expectedCalculations: {
      loadWeight: 12000,
      radiusAtLift: 8,
      craneCapacityRequired: 15000,
      riggingWeight: 300,
      safetyFactor: 1.25,
      groundBearingPressure: 12.0
    }
  },
  {
    id: 'scenario-3',
    title: 'Generator Installation',
    description: 'Lift a 3-tonne diesel generator to a rooftop plant room. Access is via a narrow stairwell - must be lifted externally.',
    loadName: 'Diesel Generator',
    loadWeight: 3000,
    loadDimensions: { width: 1.5, height: 1.2, depth: 2.0 },
    liftHeight: 12,
    siteDescription: 'City center building. Narrow street. Adjacent buildings close by. Vibration-sensitive equipment nearby.',
    constraints: [
      'Narrow street - 6m wide',
      'Adjacent buildings 3m away',
      'Cannot use internal access',
      'Vibration-sensitive lab below'
    ],
    hazards: [
      'Collision with adjacent buildings',
      'Dropped load on street',
      'Vibration damage to equipment',
      'Pedestrian safety'
    ],
    recommendedCrane: 'Mobile Crane 50T',
    expectedCalculations: {
      loadWeight: 3000,
      radiusAtLift: 10,
      craneCapacityRequired: 3750,
      riggingWeight: 100,
      safetyFactor: 1.25,
      groundBearingPressure: 6.0
    }
  }
]

export function getScenario(id: string): LiftScenario | undefined {
  return TRAINING_SCENARIOS.find(s => s.id === id)
}

