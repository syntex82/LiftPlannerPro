// Scenario Manager - Handles loading, creating, and managing training scenarios
// This is the interface between the UI and scenario data

import { TrainingScenario, ScenarioAttempt, TrainingSession } from './training-scenarios'
import { urbanBuildingLift, industrialSiteLift } from './sample-scenarios'

// In-memory scenario library (will be replaced with database)
const scenarioLibrary: Map<string, TrainingScenario> = new Map([
  [urbanBuildingLift.id, urbanBuildingLift],
  [industrialSiteLift.id, industrialSiteLift]
])

// In-memory attempts storage (will be replaced with database)
const attemptHistory: Map<string, ScenarioAttempt[]> = new Map()

/**
 * Get all available training scenarios
 * Can filter by difficulty or category
 */
export function getAllScenarios(
  difficulty?: 'beginner' | 'intermediate' | 'advanced',
  category?: string
): TrainingScenario[] {
  let scenarios = Array.from(scenarioLibrary.values())
  
  if (difficulty) {
    scenarios = scenarios.filter(s => s.difficulty === difficulty)
  }
  
  if (category) {
    scenarios = scenarios.filter(s => s.category === category)
  }
  
  return scenarios
}

/**
 * Get a specific scenario by ID
 */
export function getScenario(scenarioId: string): TrainingScenario | null {
  return scenarioLibrary.get(scenarioId) || null
}

/**
 * Create a new training scenario
 * (For trainers to create custom scenarios)
 */
export function createScenario(scenario: TrainingScenario): void {
  scenarioLibrary.set(scenario.id, scenario)
}

/**
 * Start a new attempt at a scenario
 * Records when trainee begins working on a scenario
 */
export function startAttempt(
  scenarioId: string,
  traineeId: string
): ScenarioAttempt {
  const attempt: ScenarioAttempt = {
    id: `attempt-${Date.now()}`,
    scenarioId,
    traineeId,
    startedAt: new Date().toISOString(),
    capacityChecked: false,
    radiusVerified: false,
    groundBearingChecked: false,
    obstaclesReviewed: false,
    risksIdentified: [],
    passed: false,
    score: 0,
    feedback: '',
    mistakesMade: []
  }
  
  // Store attempt
  if (!attemptHistory.has(traineeId)) {
    attemptHistory.set(traineeId, [])
  }
  attemptHistory.get(traineeId)!.push(attempt)
  
  return attempt
}

/**
 * Update an attempt with trainee's decisions
 */
export function updateAttempt(
  attemptId: string,
  traineeId: string,
  updates: Partial<ScenarioAttempt>
): ScenarioAttempt | null {
  const attempts = attemptHistory.get(traineeId)
  if (!attempts) return null
  
  const attempt = attempts.find(a => a.id === attemptId)
  if (!attempt) return null
  
  Object.assign(attempt, updates)
  return attempt
}

/**
 * Complete an attempt and calculate score
 */
export function completeAttempt(
  attemptId: string,
  traineeId: string
): ScenarioAttempt | null {
  const attempt = updateAttempt(attemptId, traineeId, {
    completedAt: new Date().toISOString()
  })
  
  if (!attempt) return null
  
  // Calculate score based on criteria met
  const scenario = getScenario(attempt.scenarioId)
  if (!scenario) return attempt
  
  let score = 0
  let criteriaCount = 0
  
  // Check each success criterion
  if (scenario.successCriteria.safePositioning && attempt.cranePosition) score += 20
  if (scenario.successCriteria.capacityVerified && attempt.capacityChecked) score += 20
  if (scenario.successCriteria.radiusCorrect && attempt.radiusVerified) score += 20
  if (scenario.successCriteria.groundBearingOK && attempt.groundBearingChecked) score += 20
  if (scenario.successCriteria.obstaclesCleared && attempt.obstaclesReviewed) score += 20
  
  attempt.score = score
  attempt.passed = score >= 80 // 80% or higher = pass
  
  // Generate feedback
  attempt.feedback = generateFeedback(attempt, scenario)
  
  return attempt
}

/**
 * Generate feedback for trainee based on their attempt
 */
function generateFeedback(attempt: ScenarioAttempt, scenario: TrainingScenario): string {
  const feedback: string[] = []
  
  if (attempt.passed) {
    feedback.push('✓ Excellent work! You successfully planned this lift.')
  } else {
    feedback.push('✗ This lift plan has issues that need to be addressed.')
  }
  
  if (!attempt.capacityChecked) {
    feedback.push('• You did not verify the crane has sufficient capacity for the load.')
  }
  
  if (!attempt.radiusVerified) {
    feedback.push('• You did not check if the boom radius is sufficient to reach the target.')
  }
  
  if (!attempt.groundBearingChecked) {
    feedback.push('• You did not verify the ground can support the crane weight.')
  }
  
  if (!attempt.obstaclesReviewed) {
    feedback.push('• You did not identify all obstructions on the site.')
  }
  
  if (attempt.risksIdentified.length === 0) {
    feedback.push('• You did not identify any hazards. Review the site carefully.')
  }
  
  return feedback.join('\n')
}

/**
 * Get trainee's attempt history
 */
export function getAttemptHistory(traineeId: string): ScenarioAttempt[] {
  return attemptHistory.get(traineeId) || []
}

/**
 * Get trainee's progress on a specific scenario
 */
export function getScenarioProgress(
  traineeId: string,
  scenarioId: string
): ScenarioAttempt[] {
  const attempts = attemptHistory.get(traineeId) || []
  return attempts.filter(a => a.scenarioId === scenarioId)
}

