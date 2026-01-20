// Verification System - Checks if a lift plan is safe and feasible
// Evaluates capacity, radius, ground bearing, and other safety factors

import { TrainingScenario, LoadSpecification } from './training-scenarios'
import { CraneEquipment } from './equipment-library'

export interface LiftVerification {
  isValid: boolean
  checks: {
    capacityCheck: CapacityCheck
    radiusCheck: RadiusCheck
    groundBearingCheck: GroundBearingCheck
    obstacleCheck: ObstacleCheck
    outriggerCheck: OutriggerCheck
  }
  issues: string[]
  warnings: string[]
  recommendations: string[]
}

export interface CapacityCheck {
  passed: boolean
  loadWeight: number
  capacityAtRadius: number
  margin: number // percentage above required
  message: string
}

export interface RadiusCheck {
  passed: boolean
  requiredRadius: number
  maxRadius: number
  message: string
}

export interface GroundBearingCheck {
  passed: boolean
  groundBearing: number
  requiredBearing: number
  groundType: string
  message: string
}

export interface ObstacleCheck {
  passed: boolean
  clearanceToObstacles: number // meters
  minClearance: number
  obstaclesNearby: string[]
  message: string
}

export interface OutriggerCheck {
  passed: boolean
  spreadRequired: number
  spreadAvailable: number
  message: string
}

/**
 * Verify a complete lift plan
 */
export function verifyLiftPlan(
  scenario: TrainingScenario,
  equipment: CraneEquipment,
  cranePosition: { x: number; y: number },
  loadPosition: { x: number; y: number }
): LiftVerification {
  const issues: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []

  // Check 1: Capacity
  const capacityCheck = checkCapacity(equipment, scenario.load, cranePosition, loadPosition)
  if (!capacityCheck.passed) issues.push(capacityCheck.message)
  if (capacityCheck.margin < 20) warnings.push('Low safety margin on capacity')

  // Check 2: Radius
  const radiusCheck = checkRadius(equipment, cranePosition, loadPosition)
  if (!radiusCheck.passed) issues.push(radiusCheck.message)

  // Check 3: Ground Bearing
  const groundBearingCheck = checkGroundBearing(scenario, equipment, cranePosition)
  if (!groundBearingCheck.passed) issues.push(groundBearingCheck.message)

  // Check 4: Obstacles
  const obstacleCheck = checkObstacles(scenario, cranePosition, equipment, loadPosition)
  if (!obstacleCheck.passed) issues.push(obstacleCheck.message)
  if (obstacleCheck.clearanceToObstacles < 2) warnings.push('Very close to obstructions')

  // Check 5: Outrigger Space
  const outriggerCheck = checkOutriggerSpace(scenario, cranePosition, equipment)
  if (!outriggerCheck.passed) issues.push(outriggerCheck.message)

  // Generate recommendations
  if (capacityCheck.margin < 50) {
    recommendations.push('Consider using a larger crane for better safety margin')
  }
  if (radiusCheck.requiredRadius > equipment.maxRadius * 0.8) {
    recommendations.push('Crane is operating near maximum radius - consider repositioning')
  }

  const isValid = issues.length === 0

  return {
    isValid,
    checks: {
      capacityCheck,
      radiusCheck,
      groundBearingCheck,
      obstacleCheck,
      outriggerCheck
    },
    issues,
    warnings,
    recommendations
  }
}

function checkCapacity(
  equipment: CraneEquipment,
  load: LoadSpecification,
  cranePos: { x: number; y: number },
  loadPos: { x: number; y: number }
): CapacityCheck {
  const radius = Math.sqrt(
    Math.pow(loadPos.x - cranePos.x, 2) + Math.pow(loadPos.y - cranePos.y, 2)
  )

  const capacityAtRadius = equipment.loadChart.find(c => c.radius >= radius)?.capacity || 0
  const passed = capacityAtRadius >= load.weight
  const margin = passed ? ((capacityAtRadius - load.weight) / load.weight) * 100 : -1

  return {
    passed,
    loadWeight: load.weight,
    capacityAtRadius,
    margin,
    message: passed
      ? `Capacity OK: ${capacityAtRadius}kg available for ${load.weight}kg load`
      : `Insufficient capacity: ${capacityAtRadius}kg available but ${load.weight}kg required`
  }
}

function checkRadius(
  equipment: CraneEquipment,
  cranePos: { x: number; y: number },
  loadPos: { x: number; y: number }
): RadiusCheck {
  const requiredRadius = Math.sqrt(
    Math.pow(loadPos.x - cranePos.x, 2) + Math.pow(loadPos.y - cranePos.y, 2)
  )
  const passed = requiredRadius <= equipment.maxRadius

  return {
    passed,
    requiredRadius,
    maxRadius: equipment.maxRadius,
    message: passed
      ? `Radius OK: ${requiredRadius.toFixed(1)}m required, ${equipment.maxRadius}m available`
      : `Radius exceeded: ${requiredRadius.toFixed(1)}m required but only ${equipment.maxRadius}m available`
  }
}

function checkGroundBearing(
  scenario: TrainingScenario,
  equipment: CraneEquipment,
  cranePos: { x: number; y: number }
): GroundBearingCheck {
  const groundCondition = scenario.groundConditions.find(
    gc =>
      cranePos.x >= gc.x &&
      cranePos.x <= gc.x + gc.width &&
      cranePos.y >= gc.y &&
      cranePos.y <= gc.y + gc.height
  )

  if (!groundCondition) {
    return {
      passed: false,
      groundBearing: 0,
      requiredBearing: equipment.groundBearing,
      groundType: 'unknown',
      message: 'Crane position outside defined ground conditions'
    }
  }

  const passed = groundCondition.bearingCapacity >= equipment.groundBearing

  return {
    passed,
    groundBearing: groundCondition.bearingCapacity,
    requiredBearing: equipment.groundBearing,
    groundType: groundCondition.type,
    message: passed
      ? `Ground bearing OK: ${groundCondition.type} ground (${groundCondition.bearingCapacity}kg/cm²)`
      : `Ground bearing insufficient: ${groundCondition.type} ground (${groundCondition.bearingCapacity}kg/cm²) but ${equipment.groundBearing}kg/cm² required`
  }
}

function checkObstacles(
  scenario: TrainingScenario,
  cranePos: { x: number; y: number },
  equipment: CraneEquipment,
  loadPos: { x: number; y: number }
): ObstacleCheck {
  const minClearance = 2 // 2 meters minimum clearance
  let minDistance = Infinity
  const obstaclesNearby: string[] = []

  scenario.obstructions.forEach(obs => {
    // Calculate distance from crane to obstruction
    const dx = Math.max(obs.x - cranePos.x, 0, cranePos.x - (obs.x + obs.width))
    const dy = Math.max(obs.y - cranePos.y, 0, cranePos.y - (obs.y + obs.height))
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < minClearance) {
      obstaclesNearby.push(obs.description)
    }
    minDistance = Math.min(minDistance, distance)
  })

  const passed = obstaclesNearby.length === 0

  return {
    passed,
    clearanceToObstacles: minDistance,
    minClearance,
    obstaclesNearby,
    message: passed
      ? `Obstacles clear: ${minDistance.toFixed(1)}m clearance maintained`
      : `Obstacles too close: ${obstaclesNearby.join(', ')}`
  }
}

function checkOutriggerSpace(
  scenario: TrainingScenario,
  cranePos: { x: number; y: number },
  equipment: CraneEquipment
): OutriggerCheck {
  const spreadRequired = equipment.outriggers.spreadWidth
  const spreadX = cranePos.x - spreadRequired / 2
  const spreadY = cranePos.y - spreadRequired / 2

  const passed =
    spreadX >= 0 &&
    spreadY >= 0 &&
    spreadX + spreadRequired <= scenario.siteWidth &&
    spreadY + spreadRequired <= scenario.siteHeight

  return {
    passed,
    spreadRequired,
    spreadAvailable: passed ? spreadRequired : 0,
    message: passed
      ? `Outrigger space OK: ${spreadRequired}m spread available`
      : `Insufficient outrigger space: ${spreadRequired}m spread required`
  }
}

