"use client"

// Scenario Results Component - Shows trainee feedback and score after completing a scenario
// Helps trainees learn from their decisions

import { ScenarioAttempt, TrainingScenario } from '@/lib/training-scenarios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, BarChart3 } from 'lucide-react'

interface ScenarioResultsProps {
  attempt: ScenarioAttempt
  scenario: TrainingScenario
  onRetry?: () => void
  onExit?: () => void
}

export default function ScenarioResults({
  attempt,
  scenario,
  onRetry,
  onExit
}: ScenarioResultsProps) {
  // Determine pass/fail color
  const resultColor = attempt.passed ? 'text-green-500' : 'text-red-500'
  const resultBg = attempt.passed ? 'bg-green-900/20' : 'bg-red-900/20'
  const resultBorder = attempt.passed ? 'border-green-700' : 'border-red-700'

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className={`${resultBg} border-2 ${resultBorder}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`text-2xl ${resultColor}`}>
              {attempt.passed ? '✓ Scenario Complete!' : '✗ Scenario Failed'}
            </CardTitle>
            <div className="text-4xl font-bold text-white">{attempt.score}%</div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            {attempt.passed
              ? 'Excellent work! You successfully planned this lift.'
              : 'This lift plan has issues that need to be addressed. Review the feedback below.'}
          </p>
        </CardContent>
      </Card>

      {/* Verification Results */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Verification Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: 'Load Capacity Verified', checked: attempt.capacityChecked },
            { label: 'Boom Radius Checked', checked: attempt.radiusVerified },
            { label: 'Ground Bearing Verified', checked: attempt.groundBearingChecked },
            { label: 'Obstructions Reviewed', checked: attempt.obstaclesReviewed }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {item.checked ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={item.checked ? 'text-green-400' : 'text-red-400'}>
                {item.label}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-slate-300 whitespace-pre-wrap">
            {attempt.feedback}
          </div>
        </CardContent>
      </Card>

      {/* Common Mistakes */}
      {attempt.mistakesMade.length > 0 && (
        <Card className="bg-yellow-900/20 border border-yellow-700">
          <CardHeader>
            <CardTitle className="text-yellow-400 text-sm">Common Mistakes You Made</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-yellow-300">
              {attempt.mistakesMade.map((mistake, i) => (
                <li key={i}>• {mistake}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Learning Summary */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">What You Learned</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm text-slate-300">
            {scenario.learningObjectives.map((obj, i) => (
              <li key={i}>• {obj}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        )}
        {onExit && (
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1"
          >
            Back to Scenarios
          </Button>
        )}
      </div>

      {/* Statistics */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Attempt Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-400">
          <p>Started: {new Date(attempt.startedAt).toLocaleTimeString()}</p>
          {attempt.completedAt && (
            <p>Completed: {new Date(attempt.completedAt).toLocaleTimeString()}</p>
          )}
          <p>Difficulty: <span className="capitalize text-white">{scenario.difficulty}</span></p>
          <p>Category: {scenario.category}</p>
        </CardContent>
      </Card>
    </div>
  )
}

