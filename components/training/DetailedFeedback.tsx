"use client"

// Detailed Feedback Component - Provides comprehensive feedback on trainee performance
// Helps trainees understand their strengths and areas for improvement

import { ScenarioScore } from '@/lib/scoring-system'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react'

interface DetailedFeedbackProps {
  score: ScenarioScore
}

export default function DetailedFeedback({ score }: DetailedFeedbackProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400'
    if (percentage >= 80) return 'text-green-400'
    if (percentage >= 70) return 'text-yellow-400'
    if (percentage >= 60) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-900/20 border-green-700'
    if (percentage >= 80) return 'bg-green-900/20 border-green-700'
    if (percentage >= 70) return 'bg-yellow-900/20 border-yellow-700'
    if (percentage >= 60) return 'bg-orange-900/20 border-orange-700'
    return 'bg-red-900/20 border-red-700'
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className={`border-2 ${getScoreBg(score.totalScore)}`}>
        <CardHeader>
          <CardTitle className="text-white">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Overall Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(score.totalScore)}`}>
                {score.totalScore}%
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${score.passed ? 'text-green-400' : 'text-red-400'}`}>
                {score.passed ? '✓ PASSED' : '✗ FAILED'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {score.passed ? 'Ready for next scenario' : 'Try again to improve'}
              </p>
            </div>
          </div>

          <p className="text-slate-300 text-sm">{score.overallFeedback}</p>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Performance Breakdown</h3>
        <div className="space-y-3">
          {score.performanceScores.map((perf, i) => {
            const percentage = (perf.score / perf.maxScore) * 100
            return (
              <Card key={i} className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">{perf.category}</CardTitle>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                        {perf.score}/{perf.maxScore}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress bar */}
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="text-sm text-slate-300">{perf.feedback}</p>

                  {/* Strengths */}
                  {perf.strengths.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-green-300 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Strengths:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1 ml-5">
                        {perf.strengths.map((strength, j) => (
                          <li key={j}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {perf.improvements.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-yellow-300 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Areas for Improvement:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1 ml-5">
                        {perf.improvements.map((improvement, j) => (
                          <li key={j}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Key Learnings */}
      <Card className="bg-blue-900/20 border border-blue-700">
        <CardHeader>
          <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Key Learnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {score.keyLearnings.map((learning, i) => (
              <li key={i} className="text-sm text-blue-300 flex gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>{learning}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {score.nextSteps.map((step, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-blue-400 font-semibold flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Comparison to Expert */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">How You Compare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Score:</span>
              <span className="text-white font-semibold">{score.totalScore}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Expert Score:</span>
              <span className="text-green-400 font-semibold">95%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Average Trainee:</span>
              <span className="text-yellow-400 font-semibold">72%</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {score.totalScore >= 90
              ? 'Excellent! You performed better than most trainees.'
              : score.totalScore >= 70
              ? 'Good performance. Keep practicing to reach expert level.'
              : 'Keep practicing. Review the feedback and try again.'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

