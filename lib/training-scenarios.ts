// Training Scenario Framework for Lift Planner Pro
// Defines the structure of training scenarios that trainees work through

// Represents a physical obstruction on the site (building, tree, power line, etc.)
export interface SiteObstruction {
  id: string
  type: 'building' | 'tree' | 'power_line' | 'fence' | 'vehicle' | 'other'
  x: number // Position on site (meters)
  y: number
  width: number // Dimensions (meters)
  height: number
  depth?: number // For 3D visualization
  description: string // What is it?
  hazardLevel: 'low' | 'medium' | 'high' // How dangerous is it?
  notes?: string // Additional info for trainees
}

// Represents ground conditions at different areas of the site
export interface GroundCondition {
  id: string
  type: 'hard' | 'soft' | 'sloped' | 'uneven' | 'water'
  x: number // Area location
  y: number
  width: number // Area size
  height: number
  bearingCapacity: number // kg/cm² - how much weight it can support
  description: string
  riskLevel: 'low' | 'medium' | 'high'
  notes?: string
}

// Represents the load to be lifted
export interface LoadSpecification {
  id: string
  name: string
  weight: number // kg
  width: number // Dimensions (meters)
  height: number
  depth: number
  centerOfGravity: { x: number; y: number } // Offset from center
  description: string
  fragile: boolean // Can it be tilted/rotated?
  maxTiltAngle?: number // Degrees
  notes?: string
}

// Represents a complete training scenario
export interface TrainingScenario {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  
  // Site information
  siteWidth: number // meters
  siteHeight: number
  siteDescription: string
  obstructions: SiteObstruction[]
  groundConditions: GroundCondition[]
  
  // Load information
  load: LoadSpecification
  
  // Equipment constraints
  availableEquipment: string[] // IDs of cranes that can be used
  restrictedEquipment?: string[] // Cranes that shouldn't be used (for learning)
  
  // Success criteria
  successCriteria: {
    safePositioning: boolean // Crane must be positioned safely
    capacityVerified: boolean // Trainee must check load capacity
    radiusCorrect: boolean // Boom radius must be sufficient
    groundBearingOK: boolean // Ground must support crane weight
    obstaclesCleared: boolean // No collisions with obstructions
    riskIdentified: boolean // Trainee must identify all hazards
  }
  
  // Learning objectives
  learningObjectives: string[] // What should trainees learn?
  commonMistakes: string[] // Errors trainees often make
  
  // Metadata
  createdBy: string // Trainer who created it
  createdAt: string // ISO timestamp
  category: string // e.g., "Urban", "Industrial", "Confined Space"
  estimatedTime: number // minutes to complete
}

// Represents a trainee's attempt at a scenario
export interface ScenarioAttempt {
  id: string
  scenarioId: string
  traineeId: string
  startedAt: string // ISO timestamp
  completedAt?: string
  
  // Trainee's decisions
  selectedCrane?: string // Which crane did they choose?
  cranePosition?: { x: number; y: number } // Where did they place it?
  craneRotation?: number // Degrees
  boomConfiguration?: {
    angle: number
    extension: number
  }
  
  // Verification steps
  capacityChecked: boolean
  radiusVerified: boolean
  groundBearingChecked: boolean
  obstaclesReviewed: boolean
  risksIdentified: string[] // Which hazards did they identify?
  
  // Results
  passed: boolean
  score: number // 0-100
  feedback: string // What did they do well/poorly?
  mistakesMade: string[] // Which common mistakes did they make?
}

// Represents a training session (multiple scenarios)
export interface TrainingSession {
  id: string
  title: string
  trainerId: string
  scenarios: string[] // IDs of scenarios in this session
  createdAt: string
  description: string
  targetAudience: string // e.g., "Level 1 AP Training"
}

