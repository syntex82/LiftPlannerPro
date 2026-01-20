// Risk Assessment System - Identifies hazards and helps trainees plan mitigation strategies
// Teaches trainees to think about what could go wrong and how to prevent it

import { TrainingScenario, SiteObstruction, GroundCondition } from './training-scenarios'
import { CraneEquipment } from './equipment-library'

export interface Hazard {
  id: string
  category: 'structural' | 'environmental' | 'operational' | 'personnel' | 'equipment'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  source: string // What caused this hazard
  potentialConsequence: string
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost-certain'
  riskLevel: number // 1-25 based on severity and likelihood
}

export interface MitigationStrategy {
  id: string
  hazardId: string
  strategy: string
  effectiveness: 'low' | 'medium' | 'high'
  implementation: string
  responsible: string
}

export interface RiskAssessment {
  scenarioId: string
  hazards: Hazard[]
  mitigations: MitigationStrategy[]
  totalRiskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  safeToProceeed: boolean
}

// Severity and likelihood scoring
const severityScore = { low: 1, medium: 2, high: 3, critical: 5 }
const likelihoodScore = { rare: 1, unlikely: 2, possible: 3, likely: 4, 'almost-certain': 5 }

/**
 * Perform comprehensive risk assessment for a scenario
 */
export function assessRisks(
  scenario: TrainingScenario,
  equipment: CraneEquipment,
  cranePosition: { x: number; y: number },
  loadPosition: { x: number; y: number }
): RiskAssessment {
  const hazards: Hazard[] = []

  // Assess obstruction hazards
  scenario.obstructions.forEach(obs => {
    const hazard = assessObstructionHazard(obs, cranePosition, loadPosition)
    if (hazard) hazards.push(hazard)
  })

  // Assess ground condition hazards
  scenario.groundConditions.forEach(ground => {
    const hazard = assessGroundHazard(ground, cranePosition, equipment)
    if (hazard) hazards.push(hazard)
  })

  // Assess load hazards
  const loadHazards = assessLoadHazards(scenario, equipment, cranePosition, loadPosition)
  hazards.push(...loadHazards)

  // Assess equipment hazards
  const equipmentHazards = assessEquipmentHazards(equipment, scenario)
  hazards.push(...equipmentHazards)

  // Assess environmental hazards
  const envHazards = assessEnvironmentalHazards(scenario)
  hazards.push(...envHazards)

  // Calculate total risk score
  const totalRiskScore = hazards.reduce((sum, h) => sum + h.riskLevel, 0)
  const riskLevel = calculateRiskLevel(totalRiskScore)
  const safeToProceeed = riskLevel !== 'critical' && hazards.filter(h => h.severity === 'critical').length === 0

  return {
    scenarioId: scenario.id,
    hazards,
    mitigations: [],
    totalRiskScore,
    riskLevel,
    safeToProceeed
  }
}

function assessObstructionHazard(
  obstruction: SiteObstruction,
  cranePos: { x: number; y: number },
  loadPos: { x: number; y: number }
): Hazard | null {
  if (obstruction.hazardLevel === 'low') return null

  const dx = Math.max(obstruction.x - cranePos.x, 0, cranePos.x - (obstruction.x + obstruction.width))
  const dy = Math.max(obstruction.y - cranePos.y, 0, cranePos.y - (obstruction.y + obstruction.height))
  const distance = Math.sqrt(dx * dx + dy * dy)

  const severity = obstruction.hazardLevel === 'high' ? 'high' : 'medium'
  const likelihood = distance < 2 ? 'likely' : distance < 5 ? 'possible' : 'unlikely'

  return {
    id: `hazard-obs-${obstruction.id}`,
    category: 'structural',
    severity,
    description: `Proximity to ${obstruction.description}`,
    source: obstruction.description,
    potentialConsequence: `Collision with ${obstruction.description} could cause load drop or equipment damage`,
    likelihood,
    riskLevel: severityScore[severity] * likelihoodScore[likelihood]
  }
}

function assessGroundHazard(
  ground: GroundCondition,
  cranePos: { x: number; y: number },
  equipment: CraneEquipment
): Hazard | null {
  if (ground.type === 'hard') return null

  const severity = ground.riskLevel === 'high' ? 'high' : 'medium'
  const likelihood = ground.bearingCapacity < equipment.groundBearing ? 'likely' : 'possible'

  return {
    id: `hazard-ground-${ground.id}`,
    category: 'environmental',
    severity,
    description: `${ground.type} ground conditions`,
    source: ground.description,
    potentialConsequence: 'Crane could sink or tip due to insufficient ground bearing',
    likelihood,
    riskLevel: severityScore[severity] * likelihoodScore[likelihood]
  }
}

function assessLoadHazards(
  scenario: TrainingScenario,
  equipment: CraneEquipment,
  cranePos: { x: number; y: number },
  loadPos: { x: number; y: number }
): Hazard[] {
  const hazards: Hazard[] = []
  const load = scenario.load

  // Check if load is fragile
  if (load.fragile) {
    hazards.push({
      id: 'hazard-fragile-load',
      category: 'operational',
      severity: 'high',
      description: 'Fragile load requires careful handling',
      source: `${load.name} is fragile`,
      potentialConsequence: 'Load damage if tilted beyond safe angle',
      likelihood: 'possible',
      riskLevel: severityScore.high * likelihoodScore.possible
    })
  }

  // Check load weight vs capacity
  const radius = Math.sqrt(Math.pow(loadPos.x - cranePos.x, 2) + Math.pow(loadPos.y - cranePos.y, 2))
  const capacityAtRadius = equipment.loadChart.find(c => c.radius >= radius)?.capacity || 0

  if (capacityAtRadius < load.weight) {
    hazards.push({
      id: 'hazard-overload',
      category: 'operational',
      severity: 'critical',
      description: 'Load exceeds crane capacity',
      source: `Load weight (${load.weight}kg) exceeds capacity (${capacityAtRadius}kg)`,
      potentialConsequence: 'Crane failure, load drop, personnel injury or death',
      likelihood: 'almost-certain',
      riskLevel: severityScore.critical * likelihoodScore['almost-certain']
    })
  }

  return hazards
}

function assessEquipmentHazards(equipment: CraneEquipment, scenario: TrainingScenario): Hazard[] {
  const hazards: Hazard[] = []

  // Check if equipment is suitable for scenario
  if (equipment.maxCapacity < scenario.load.weight) {
    hazards.push({
      id: 'hazard-undersized-crane',
      category: 'equipment',
      severity: 'critical',
      description: 'Crane is undersized for this load',
      source: `Crane capacity (${equipment.maxCapacity}kg) less than load (${scenario.load.weight}kg)`,
      potentialConsequence: 'Crane failure and load drop',
      likelihood: 'almost-certain',
      riskLevel: severityScore.critical * likelihoodScore['almost-certain']
    })
  }

  return hazards
}

function assessEnvironmentalHazards(scenario: TrainingScenario): Hazard[] {
  const hazards: Hazard[] = []

  // Check for power lines
  const powerLines = scenario.obstructions.filter(o => o.type === 'power_line')
  if (powerLines.length > 0) {
    hazards.push({
      id: 'hazard-power-lines',
      category: 'environmental',
      severity: 'critical',
      description: 'High voltage power lines present',
      source: 'Power lines on site',
      potentialConsequence: 'Electrocution of personnel or equipment damage',
      likelihood: 'possible',
      riskLevel: severityScore.critical * likelihoodScore.possible
    })
  }

  return hazards
}

function calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 5) return 'low'
  if (score <= 15) return 'medium'
  if (score <= 25) return 'high'
  return 'critical'
}

/**
 * Get recommended mitigation strategies for a hazard
 */
export function getMitigationStrategies(hazard: Hazard): MitigationStrategy[] {
  const strategies: MitigationStrategy[] = []

  if (hazard.category === 'structural') {
    strategies.push({
      id: `mit-${hazard.id}-1`,
      hazardId: hazard.id,
      strategy: 'Maintain minimum 2m clearance from obstructions',
      effectiveness: 'high',
      implementation: 'Reposition crane or use spotters to monitor clearance',
      responsible: 'Crane operator and site supervisor'
    })
  }

  if (hazard.category === 'environmental' && hazard.description.includes('ground')) {
    strategies.push({
      id: `mit-${hazard.id}-1`,
      hazardId: hazard.id,
      strategy: 'Use ground reinforcement or matting',
      effectiveness: 'high',
      implementation: 'Place steel plates or mats under outriggers',
      responsible: 'Site supervisor'
    })
  }

  if (hazard.category === 'operational' && hazard.description.includes('Fragile')) {
    strategies.push({
      id: `mit-${hazard.id}-1`,
      hazardId: hazard.id,
      strategy: 'Use specialized rigging and limit tilt angle',
      effectiveness: 'high',
      implementation: 'Use spreader bars and angle limiters',
      responsible: 'Rigger and crane operator'
    })
  }

  if (hazard.severity === 'critical') {
    strategies.push({
      id: `mit-${hazard.id}-critical`,
      hazardId: hazard.id,
      strategy: 'DO NOT PROCEED - Resolve critical hazard first',
      effectiveness: 'high',
      implementation: 'Modify plan or select different equipment',
      responsible: 'Site supervisor and planner'
    })
  }

  return strategies
}

