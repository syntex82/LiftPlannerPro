// Sample Training Scenarios for Lift Planner Pro
// These demonstrate the types of scenarios trainees will work through

import { TrainingScenario } from './training-scenarios'

// Scenario 1: Urban Building Lift - Beginner
export const urbanBuildingLift: TrainingScenario = {
  id: 'scenario-urban-001',
  title: 'Urban Building Lift - Narrow Street',
  description: 'Lift a 2-tonne load to the roof of a 3-storey building in a narrow urban street. Limited space, power lines overhead, soft ground on one side.',
  difficulty: 'beginner',
  
  // Site layout
  siteWidth: 30,
  siteHeight: 40,
  siteDescription: 'Narrow urban street with 3-storey building on one side, parked vehicles, power lines',
  
  obstructions: [
    {
      id: 'building-1',
      type: 'building',
      x: 20,
      y: 5,
      width: 8,
      height: 12,
      depth: 10,
      description: '3-storey residential building',
      hazardLevel: 'high',
      notes: 'Load must be lifted to roof (12m height)'
    },
    {
      id: 'power-line-1',
      type: 'power_line',
      x: 0,
      y: 8,
      width: 30,
      height: 0.5,
      description: 'High voltage power lines',
      hazardLevel: 'high',
      notes: 'Minimum 5m clearance required'
    },
    {
      id: 'vehicle-1',
      type: 'vehicle',
      x: 5,
      y: 15,
      width: 2,
      height: 4,
      description: 'Parked car',
      hazardLevel: 'medium',
      notes: 'Can be moved if needed'
    }
  ],
  
  groundConditions: [
    {
      id: 'ground-hard',
      type: 'hard',
      x: 0,
      y: 0,
      width: 20,
      height: 40,
      bearingCapacity: 50, // kg/cm²
      description: 'Tarmac road - hard surface',
      riskLevel: 'low'
    },
    {
      id: 'ground-soft',
      type: 'soft',
      x: 20,
      y: 0,
      width: 10,
      height: 40,
      bearingCapacity: 15, // kg/cm² - much lower
      description: 'Grass verge - soft ground',
      riskLevel: 'high',
      notes: 'Cannot support heavy crane outriggers'
    }
  ],
  
  // Load to be lifted
  load: {
    id: 'load-1',
    name: 'HVAC Unit',
    weight: 2000, // kg
    width: 2,
    height: 1.5,
    depth: 1.5,
    centerOfGravity: { x: 0, y: 0 },
    description: 'Heating/cooling unit for building roof',
    fragile: false,
    maxTiltAngle: 45,
    notes: 'Standard commercial HVAC unit'
  },
  
  // Available equipment
  availableEquipment: ['crane-mobile-25t', 'crane-mobile-35t', 'crane-mobile-50t'],
  restrictedEquipment: ['crane-mobile-100t'], // Too large for this site
  
  // Success criteria
  successCriteria: {
    safePositioning: true,
    capacityVerified: true,
    radiusCorrect: true,
    groundBearingOK: true,
    obstaclesCleared: true,
    riskIdentified: true
  },
  
  // Learning objectives
  learningObjectives: [
    'Assess site constraints and obstructions',
    'Select appropriate crane size for load and space',
    'Position crane to avoid power lines',
    'Check ground bearing capacity',
    'Verify boom radius is sufficient',
    'Identify all hazards before lift'
  ],
  
  commonMistakes: [
    'Selecting crane too small for load',
    'Positioning crane under power lines',
    'Placing outriggers on soft ground',
    'Not checking boom radius to building',
    'Ignoring parked vehicle as obstruction'
  ],
  
  createdBy: 'trainer-001',
  createdAt: '2024-01-15T10:00:00Z',
  category: 'Urban',
  estimatedTime: 20
}

// Scenario 2: Industrial Site Lift - Intermediate
export const industrialSiteLift: TrainingScenario = {
  id: 'scenario-industrial-001',
  title: 'Industrial Equipment Lift - Confined Space',
  description: 'Lift a 5-tonne industrial motor into a confined factory space. Multiple obstructions, uneven ground, limited crane positioning options.',
  difficulty: 'intermediate',
  
  siteWidth: 50,
  siteHeight: 60,
  siteDescription: 'Industrial factory floor with machinery, limited access points',
  
  obstructions: [
    {
      id: 'machinery-1',
      type: 'other',
      x: 10,
      y: 10,
      width: 8,
      height: 6,
      description: 'Existing machinery - cannot be moved',
      hazardLevel: 'high'
    },
    {
      id: 'machinery-2',
      type: 'other',
      x: 35,
      y: 15,
      width: 10,
      height: 8,
      description: 'Production line equipment',
      hazardLevel: 'high'
    },
    {
      id: 'fence-1',
      type: 'fence',
      x: 0,
      y: 0,
      width: 50,
      height: 1,
      description: 'Safety fence around work area',
      hazardLevel: 'medium'
    }
  ],
  
  groundConditions: [
    {
      id: 'ground-concrete',
      type: 'hard',
      x: 0,
      y: 0,
      width: 50,
      height: 60,
      bearingCapacity: 60,
      description: 'Concrete factory floor',
      riskLevel: 'low'
    }
  ],
  
  load: {
    id: 'load-2',
    name: 'Industrial Motor',
    weight: 5000,
    width: 2.5,
    height: 2,
    depth: 2,
    centerOfGravity: { x: 0, y: 0 },
    description: 'Heavy industrial electric motor',
    fragile: true,
    maxTiltAngle: 15,
    notes: 'Sensitive equipment - minimal tilting allowed'
  },
  
  availableEquipment: ['crane-mobile-35t', 'crane-mobile-50t'],
  
  successCriteria: {
    safePositioning: true,
    capacityVerified: true,
    radiusCorrect: true,
    groundBearingOK: true,
    obstaclesCleared: true,
    riskIdentified: true
  },
  
  learningObjectives: [
    'Work in confined spaces with multiple obstructions',
    'Calculate safe working radius around machinery',
    'Position crane to avoid existing equipment',
    'Handle sensitive/fragile loads',
    'Plan approach and retreat paths'
  ],
  
  commonMistakes: [
    'Crane positioned too close to machinery',
    'Insufficient boom radius to reach target',
    'Not accounting for load swing',
    'Ignoring fragile load requirements'
  ],
  
  createdBy: 'trainer-001',
  createdAt: '2024-01-15T11:00:00Z',
  category: 'Industrial',
  estimatedTime: 30
}

