"use client"

// Risk Assessment Display Component - Shows identified hazards and mitigation strategies
// Teaches trainees to think about safety and risk management

import { RiskAssessment, getMitigationStrategies } from '@/lib/risk-assessment'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, CheckCircle, Lightbulb, Shield } from 'lucide-react'

interface RiskAssessmentDisplayProps {
  assessment: RiskAssessment
}

export default function RiskAssessmentDisplay({ assessment }: RiskAssessmentDisplayProps) {
  const { hazards, totalRiskScore, riskLevel, safeToProceeed } = assessment

  // Get color based on risk level
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-900/20 border-green-700'
      case 'medium': return 'bg-yellow-900/20 border-yellow-700'
      case 'high': return 'bg-orange-900/20 border-orange-700'
      case 'critical': return 'bg-red-900/20 border-red-700'
      default: return 'bg-slate-900/20 border-slate-700'
    }
  }

  const getRiskTextColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'critical': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default: return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Overall Risk Status */}
      <Card className={`border-2 ${getRiskColor(riskLevel)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              <CardTitle className={`${getRiskTextColor(riskLevel)}`}>
                Risk Level: {riskLevel.toUpperCase()}
              </CardTitle>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Total Risk Score</p>
              <p className={`text-3xl font-bold ${getRiskTextColor(riskLevel)}`}>{totalRiskScore}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {safeToProceeed ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-300">Lift can proceed with proper mitigation</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-300">DO NOT PROCEED - Critical hazards must be resolved</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hazards by Category */}
      {hazards.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Identified Hazards ({hazards.length})</h3>

          {hazards.map(hazard => {
            const mitigations = getMitigationStrategies(hazard)
            const severityColor = hazard.severity === 'critical' ? 'border-red-700' : 'border-slate-700'

            return (
              <Card key={hazard.id} className={`bg-slate-900 border-2 ${severityColor}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(hazard.severity)}
                      <div>
                        <CardTitle className="text-white text-sm">{hazard.description}</CardTitle>
                        <p className="text-xs text-slate-400 mt-1">Source: {hazard.source}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Risk Score</p>
                      <p className="text-lg font-bold text-white">{hazard.riskLevel}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Consequence */}
                  <div>
                    <p className="text-xs font-semibold text-slate-300 mb-1">Potential Consequence:</p>
                    <p className="text-sm text-slate-400">{hazard.potentialConsequence}</p>
                  </div>

                  {/* Severity and Likelihood */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400">Severity:</p>
                      <p className="text-white font-semibold capitalize">{hazard.severity}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Likelihood:</p>
                      <p className="text-white font-semibold capitalize">{hazard.likelihood}</p>
                    </div>
                  </div>

                  {/* Mitigation Strategies */}
                  {mitigations.length > 0 && (
                    <div className="bg-slate-800 rounded p-3 space-y-2">
                      <p className="text-xs font-semibold text-blue-300 flex items-center gap-1">
                        <Lightbulb className="w-4 h-4" />
                        Mitigation Strategies:
                      </p>
                      {mitigations.map(mit => (
                        <div key={mit.id} className="text-xs space-y-1">
                          <p className="text-slate-300 font-semibold">{mit.strategy}</p>
                          <p className="text-slate-400">Implementation: {mit.implementation}</p>
                          <p className="text-slate-400">Responsible: {mit.responsible}</p>
                          <p className="text-blue-300">Effectiveness: {mit.effectiveness}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-green-900/20 border border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="w-5 h-5" />
              <span>No hazards identified - this is a low-risk lift</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Summary */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Risk Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400">Total Hazards:</p>
              <p className="text-white font-semibold">{hazards.length}</p>
            </div>
            <div>
              <p className="text-slate-400">Critical Hazards:</p>
              <p className="text-red-400 font-semibold">{hazards.filter(h => h.severity === 'critical').length}</p>
            </div>
            <div>
              <p className="text-slate-400">High Hazards:</p>
              <p className="text-orange-400 font-semibold">{hazards.filter(h => h.severity === 'high').length}</p>
            </div>
            <div>
              <p className="text-slate-400">Medium Hazards:</p>
              <p className="text-yellow-400 font-semibold">{hazards.filter(h => h.severity === 'medium').length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

