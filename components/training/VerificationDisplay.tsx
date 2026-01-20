"use client"

// Verification Display Component - Shows detailed verification results for a lift plan
// Helps trainees understand what makes a lift safe or unsafe

import { LiftVerification } from '@/lib/verification-system'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react'

interface VerificationDisplayProps {
  verification: LiftVerification
}

export default function VerificationDisplay({ verification }: VerificationDisplayProps) {
  const { checks, issues, warnings, recommendations, isValid } = verification

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card className={`border-2 ${isValid ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {isValid ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-500" />
                <CardTitle className="text-green-400">Lift Plan is VALID</CardTitle>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-red-500" />
                <CardTitle className="text-red-400">Lift Plan has ISSUES</CardTitle>
              </>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Checks */}
      <div className="grid grid-cols-2 gap-4">
        {/* Capacity Check */}
        <Card className={`border-2 ${checks.capacityCheck.passed ? 'border-green-700' : 'border-red-700'}`}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {checks.capacityCheck.passed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              Load Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-slate-400">Load Weight:</p>
              <p className="text-white font-semibold">{checks.capacityCheck.loadWeight.toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-slate-400">Available Capacity:</p>
              <p className={`font-semibold ${checks.capacityCheck.passed ? 'text-green-400' : 'text-red-400'}`}>
                {checks.capacityCheck.capacityAtRadius.toLocaleString()} kg
              </p>
            </div>
            {checks.capacityCheck.passed && (
              <div>
                <p className="text-slate-400">Safety Margin:</p>
                <p className="text-green-400 font-semibold">{checks.capacityCheck.margin.toFixed(0)}%</p>
              </div>
            )}
            <p className="text-xs text-slate-300 mt-2">{checks.capacityCheck.message}</p>
          </CardContent>
        </Card>

        {/* Radius Check */}
        <Card className={`border-2 ${checks.radiusCheck.passed ? 'border-green-700' : 'border-red-700'}`}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {checks.radiusCheck.passed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              Boom Radius
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-slate-400">Required Radius:</p>
              <p className="text-white font-semibold">{checks.radiusCheck.requiredRadius.toFixed(1)} m</p>
            </div>
            <div>
              <p className="text-slate-400">Max Available:</p>
              <p className={`font-semibold ${checks.radiusCheck.passed ? 'text-green-400' : 'text-red-400'}`}>
                {checks.radiusCheck.maxRadius} m
              </p>
            </div>
            <p className="text-xs text-slate-300 mt-2">{checks.radiusCheck.message}</p>
          </CardContent>
        </Card>

        {/* Ground Bearing Check */}
        <Card className={`border-2 ${checks.groundBearingCheck.passed ? 'border-green-700' : 'border-red-700'}`}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {checks.groundBearingCheck.passed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              Ground Bearing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-slate-400">Ground Type:</p>
              <p className="text-white font-semibold capitalize">{checks.groundBearingCheck.groundType}</p>
            </div>
            <div>
              <p className="text-slate-400">Bearing Capacity:</p>
              <p className={`font-semibold ${checks.groundBearingCheck.passed ? 'text-green-400' : 'text-red-400'}`}>
                {checks.groundBearingCheck.groundBearing} kg/cm²
              </p>
            </div>
            <p className="text-xs text-slate-300 mt-2">{checks.groundBearingCheck.message}</p>
          </CardContent>
        </Card>

        {/* Obstacle Check */}
        <Card className={`border-2 ${checks.obstacleCheck.passed ? 'border-green-700' : 'border-red-700'}`}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {checks.obstacleCheck.passed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              Obstacles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-slate-400">Clearance:</p>
              <p className="text-white font-semibold">{checks.obstacleCheck.clearanceToObstacles.toFixed(1)} m</p>
            </div>
            <div>
              <p className="text-slate-400">Min Required:</p>
              <p className="text-white font-semibold">{checks.obstacleCheck.minClearance} m</p>
            </div>
            <p className="text-xs text-slate-300 mt-2">{checks.obstacleCheck.message}</p>
          </CardContent>
        </Card>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <Card className="bg-red-900/20 border border-red-700">
          <CardHeader>
            <CardTitle className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Critical Issues ({issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {issues.map((issue, i) => (
                <li key={i} className="text-sm text-red-300 flex gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="bg-yellow-900/20 border border-yellow-700">
          <CardHeader>
            <CardTitle className="text-yellow-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Warnings ({warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {warnings.map((warning, i) => (
                <li key={i} className="text-sm text-yellow-300 flex gap-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-blue-900/20 border border-blue-700">
          <CardHeader>
            <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Recommendations ({recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-blue-300 flex gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

