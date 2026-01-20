"use client"

// Progress Tracking Component - Shows trainee's progress across all scenarios
// Helps trainees and trainers monitor learning progress

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Award, Target, Calendar } from 'lucide-react'

interface AttemptRecord {
  scenarioId: string
  scenarioTitle: string
  difficulty: string
  score: number
  passed: boolean
  date: string
  attempts: number
}

interface ProgressTrackingProps {
  traineeId: string
  attempts?: AttemptRecord[]
}

export default function ProgressTracking({ traineeId, attempts = [] }: ProgressTrackingProps) {
  // Calculate statistics
  const totalAttempts = attempts.length
  const passedAttempts = attempts.filter(a => a.passed).length
  const averageScore = attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0

  // Group by difficulty
  const byDifficulty = {
    beginner: attempts.filter(a => a.difficulty === 'beginner'),
    intermediate: attempts.filter(a => a.difficulty === 'intermediate'),
    advanced: attempts.filter(a => a.difficulty === 'advanced')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-900/20 border-green-700'
      case 'intermediate': return 'bg-yellow-900/20 border-yellow-700'
      case 'advanced': return 'bg-red-900/20 border-red-700'
      default: return 'bg-slate-900/20 border-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Total Attempts</p>
              <p className="text-3xl font-bold text-white mt-2">{totalAttempts}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-900/20 border-green-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-green-400 text-sm">Passed</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{passedAttempts}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-blue-400 text-sm">Average Score</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{averageScore}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-900/20 border-purple-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-purple-400 text-sm">Best Score</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">{bestScore}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress by Difficulty */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Target className="w-4 h-4" />
            Progress by Difficulty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { level: 'Beginner', data: byDifficulty.beginner, color: 'bg-green-600' },
            { level: 'Intermediate', data: byDifficulty.intermediate, color: 'bg-yellow-600' },
            { level: 'Advanced', data: byDifficulty.advanced, color: 'bg-red-600' }
          ].map(({ level, data, color }) => {
            const passed = data.filter(a => a.passed).length
            const total = data.length
            const percentage = total > 0 ? (passed / total) * 100 : 0

            return (
              <div key={level}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{level}</span>
                  <span className="text-slate-400">{passed}/{total} passed</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Recent Attempts */}
      {attempts.length > 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recent Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attempts.slice(-5).reverse().map((attempt, i) => (
                <div key={i} className={`p-3 rounded border ${getDifficultyColor(attempt.difficulty)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{attempt.scenarioTitle}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(attempt.date).toLocaleDateString()} • Attempt {attempt.attempts}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${attempt.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {attempt.score}%
                      </p>
                      <p className="text-xs text-slate-400">
                        {attempt.passed ? '✓ Passed' : '✗ Failed'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card className="bg-purple-900/20 border-purple-700">
        <CardHeader>
          <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
            <Award className="w-4 h-4" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {passedAttempts >= 1 && (
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <Award className="w-4 h-4" />
              <span>First Scenario Passed</span>
            </div>
          )}
          {passedAttempts >= 3 && (
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <Award className="w-4 h-4" />
              <span>3 Scenarios Passed</span>
            </div>
          )}
          {averageScore >= 80 && (
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <Award className="w-4 h-4" />
              <span>High Achiever (80%+ average)</span>
            </div>
          )}
          {byDifficulty.advanced.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <Award className="w-4 h-4" />
              <span>Advanced Scenarios Attempted</span>
            </div>
          )}
          {passedAttempts === 0 && (
            <p className="text-sm text-slate-400">Complete scenarios to earn achievements</p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-blue-900/20 border-blue-700">
        <CardHeader>
          <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-300">
          {totalAttempts === 0 && (
            <p>Start with a beginner scenario to learn the basics of lift planning.</p>
          )}
          {passedAttempts === 0 && totalAttempts > 0 && (
            <p>Review the feedback from your attempts and try again. Focus on hazard identification.</p>
          )}
          {averageScore < 70 && passedAttempts > 0 && (
            <p>You're making progress! Review the verification steps and try intermediate scenarios.</p>
          )}
          {averageScore >= 70 && byDifficulty.advanced.length === 0 && (
            <p>Great work! You're ready to try advanced scenarios to challenge yourself further.</p>
          )}
          {byDifficulty.advanced.length > 0 && passedAttempts >= 3 && (
            <p>Excellent progress! You've mastered the training scenarios. Consider mentoring other trainees.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

