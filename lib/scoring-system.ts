// Scoring System - Evaluates trainee performance and provides detailed feedback
// Helps trainees understand what they did well and what to improve

import { TrainingScenario, ScenarioAttempt } from './training-scenarios'
import { CraneEquipment } from './equipment-library'
import { LiftVerification } from './verification-system'
import { RiskAssessment } from './risk-assessment'

export interface PerformanceScore {
  category: string
  score: number // 0-100
  maxScore: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

export interface ScenarioScore {
  totalScore: number // 0-100
  passed: boolean
  performanceScores: PerformanceScore[]
  overallFeedback: string
  keyLearnings: string[]
  nextSteps: string[]
}

/**
 * Calculate comprehensive score for trainee's scenario attempt
 */
export function calculateScenarioScore(
  scenario: TrainingScenario,
  attempt: ScenarioAttempt,
  verification: LiftVerification,
  riskAssessment: RiskAssessment
): ScenarioScore {
  const performanceScores: PerformanceScore[] = []

  // Score 1: Equipment Selection (20 points)
  const equipmentScore = scoreEquipmentSelection(scenario, attempt)
  performanceScores.push(equipmentScore)

  // Score 2: Positioning & Safety (20 points)
  const positioningScore = scorePositioning(verification)
  performanceScores.push(positioningScore)

  // Score 3: Hazard Identification (20 points)
  const hazardScore = scoreHazardIdentification(riskAssessment)
  performanceScores.push(hazardScore)

  // Score 4: Verification Steps (20 points)
  const verificationScore = scoreVerificationSteps(attempt, verification)
  performanceScores.push(verificationScore)

  // Score 5: Decision Making (20 points)
  const decisionScore = scoreDecisionMaking(attempt, verification, riskAssessment)
  performanceScores.push(decisionScore)

  // Calculate total
  const totalScore = performanceScores.reduce((sum, s) => sum + (s.score / s.maxScore) * 20, 0)
  const passed = totalScore >= 70

  // Generate feedback
  const overallFeedback = generateOverallFeedback(totalScore, passed, performanceScores)
  const keyLearnings = generateKeyLearnings(performanceScores)
  const nextSteps = generateNextSteps(performanceScores, passed)

  return {
    totalScore: Math.round(totalScore),
    passed,
    performanceScores,
    overallFeedback,
    keyLearnings,
    nextSteps
  }
}

function scoreEquipmentSelection(scenario: TrainingScenario, attempt: ScenarioAttempt): PerformanceScore {
  const strengths: string[] = []
  const improvements: string[] = []
  let score = 0

  if (attempt.selectedCrane) {
    score += 10
    strengths.push('Selected appropriate crane for the load')
  } else {
    improvements.push('No crane was selected')
  }

  // Check if crane capacity is sufficient
  if (attempt.selectedCrane && scenario.load.weight <= 35000) {
    score += 10
    strengths.push('Crane has sufficient capacity for load')
  } else if (!attempt.selectedCrane) {
    improvements.push('Cannot verify capacity without crane selection')
  }

  return {
    category: 'Equipment Selection',
    score,
    maxScore: 20,
    feedback: `Selected equipment appropriately. ${score === 20 ? 'Excellent choice!' : 'Consider equipment specifications more carefully.'}`,
    strengths,
    improvements
  }
}

function scorePositioning(verification: LiftVerification): PerformanceScore {
  const strengths: string[] = []
  const improvements: string[] = []
  let score = 0

  if (verification.checks.radiusCheck.passed) {
    score += 7
    strengths.push('Boom radius is sufficient')
  } else {
    improvements.push('Boom radius is insufficient - reposition crane or select larger crane')
  }

  if (verification.checks.groundBearingCheck.passed) {
    score += 7
    strengths.push('Ground bearing capacity is adequate')
  } else {
    improvements.push('Ground bearing is insufficient - use ground reinforcement or reposition')
  }

  if (verification.checks.obstacleCheck.passed) {
    score += 6
    strengths.push('Maintained safe clearance from obstructions')
  } else {
    improvements.push('Too close to obstructions - increase clearance')
  }

  return {
    category: 'Positioning & Safety',
    score,
    maxScore: 20,
    feedback: verification.isValid ? 'Excellent positioning!' : 'Positioning needs improvement.',
    strengths,
    improvements
  }
}

function scoreHazardIdentification(riskAssessment: RiskAssessment): PerformanceScore {
  const strengths: string[] = []
  const improvements: string[] = []
  let score = 0

  const hazardCount = riskAssessment.hazards.length
  const criticalHazards = riskAssessment.hazards.filter(h => h.severity === 'critical').length

  if (hazardCount >= 3) {
    score += 10
    strengths.push(`Identified ${hazardCount} hazards`)
  } else {
    improvements.push(`Only identified ${hazardCount} hazards - look for more`)
  }

  if (criticalHazards === 0) {
    score += 10
    strengths.push('No critical hazards present')
  } else {
    improvements.push(`${criticalHazards} critical hazards identified - must be resolved`)
  }

  return {
    category: 'Hazard Identification',
    score,
    maxScore: 20,
    feedback: `Identified ${hazardCount} hazards. ${riskAssessment.riskLevel === 'low' ? 'Good risk assessment!' : 'Review hazard identification.'}`,
    strengths,
    improvements
  }
}

function scoreVerificationSteps(attempt: ScenarioAttempt, verification: LiftVerification): PerformanceScore {
  const strengths: string[] = []
  const improvements: string[] = []
  let score = 0

  if (attempt.capacityChecked) {
    score += 5
    strengths.push('Verified load capacity')
  } else {
    improvements.push('Did not verify load capacity')
  }

  if (attempt.radiusVerified) {
    score += 5
    strengths.push('Verified boom radius')
  } else {
    improvements.push('Did not verify boom radius')
  }

  if (attempt.groundBearingChecked) {
    score += 5
    strengths.push('Checked ground bearing')
  } else {
    improvements.push('Did not check ground bearing')
  }

  if (attempt.obstaclesReviewed) {
    score += 5
    strengths.push('Reviewed obstructions')
  } else {
    improvements.push('Did not review obstructions')
  }

  return {
    category: 'Verification Steps',
    score,
    maxScore: 20,
    feedback: `Completed ${score / 5} of 4 verification steps.`,
    strengths,
    improvements
  }
}

function scoreDecisionMaking(
  attempt: ScenarioAttempt,
  verification: LiftVerification,
  riskAssessment: RiskAssessment
): PerformanceScore {
  const strengths: string[] = []
  const improvements: string[] = []
  let score = 0

  if (verification.isValid) {
    score += 10
    strengths.push('Made safe positioning decisions')
  } else {
    improvements.push('Positioning decisions resulted in safety issues')
  }

  if (riskAssessment.safeToProceeed) {
    score += 10
    strengths.push('Risk assessment indicates safe to proceed')
  } else {
    improvements.push('Critical hazards prevent proceeding - must resolve first')
  }

  return {
    category: 'Decision Making',
    score,
    maxScore: 20,
    feedback: verification.isValid && riskAssessment.safeToProceeed ? 'Excellent decisions!' : 'Review decision-making process.',
    strengths,
    improvements
  }
}

function generateOverallFeedback(score: number, passed: boolean, scores: PerformanceScore[]): string {
  if (score >= 90) {
    return 'Outstanding performance! You demonstrated excellent lift planning skills and safety awareness.'
  } else if (score >= 80) {
    return 'Very good work! You made sound decisions and identified most hazards. Minor improvements needed.'
  } else if (score >= 70) {
    return 'Good effort! You completed the scenario successfully. Review the areas for improvement.'
  } else if (score >= 60) {
    return 'Acceptable performance. You need to focus on hazard identification and verification steps.'
  } else {
    return 'This lift plan has significant safety issues. Review all areas and try again.'
  }
}

function generateKeyLearnings(scores: PerformanceScore[]): string[] {
  const learnings: string[] = []

  scores.forEach(score => {
    if (score.score === score.maxScore) {
      learnings.push(`✓ ${score.category}: You demonstrated mastery in this area`)
    }
  })

  if (learnings.length === 0) {
    learnings.push('Review all performance areas to identify key learnings')
  }

  return learnings
}

function generateNextSteps(scores: PerformanceScore[], passed: boolean): string[] {
  const steps: string[] = []

  if (passed) {
    steps.push('Try a more challenging scenario')
    steps.push('Review scenarios with different site conditions')
    steps.push('Practice with different equipment types')
  } else {
    const lowestScore = scores.reduce((min, s) => s.score < min.score ? s : min)
    steps.push(`Focus on improving: ${lowestScore.category}`)
    steps.push('Review the guidance for each verification step')
    steps.push('Try this scenario again to improve your score')
  }

  return steps
}

