"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Trophy } from 'lucide-react'
import { LiftScenario } from '@/lib/training-lift-scenarios'

interface Step6Props {
  scenario: LiftScenario
  craneId: string
  craneName: string
  justification: string
  calculations: Record<string, number>
  checklist: Record<number, boolean>
  onRestart: () => void
}

export default function Step6ReviewSubmit({
  scenario,
  craneId,
  craneName,
  justification,
  calculations,
  checklist,
  onRestart
}: Step6Props) {
  // Calculate pass/fail
  const checklistComplete = Object.values(checklist).every(v => v === true)
  const calculationsAccurate = Object.keys(calculations).length > 0
  const craneSelected = !!craneId

  const passed = checklistComplete && calculationsAccurate && craneSelected

  return (
    <div className="space-y-6">
      {/* Result Banner */}
      <Card className={`${
        passed
          ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/50'
          : 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-500/50'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {passed ? (
              <Trophy className="w-12 h-12 text-green-400" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-400" />
            )}
            <div>
              <h2 className={`text-2xl font-bold ${passed ? 'text-green-300' : 'text-red-300'}`}>
                {passed ? 'Lift Plan APPROVED ✓' : 'Lift Plan INCOMPLETE'}
              </h2>
              <p className={`text-sm mt-1 ${passed ? 'text-green-200' : 'text-red-200'}`}>
                {passed
                  ? 'All requirements met. This lift is safe to proceed.'
                  : 'Some requirements are not met. Please review and complete all steps.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Scenario Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Scenario</p>
              <p className="text-white font-semibold">{scenario.title}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Load</p>
              <p className="text-white font-semibold">{scenario.loadName} ({scenario.loadWeight}kg)</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Lift Height</p>
              <p className="text-white font-semibold">{scenario.liftHeight}m</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Site</p>
              <p className="text-white font-semibold">{scenario.constraints.length} constraints</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crane Selection */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {craneSelected ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            Crane Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-slate-400 text-sm">Selected Crane</p>
            <p className="text-white font-semibold text-lg">{craneName}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Justification</p>
            <p className="text-slate-300 bg-slate-900/50 p-3 rounded">{justification}</p>
          </div>
        </CardContent>
      </Card>

      {/* Calculations */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {calculationsAccurate ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            Calculations Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(calculations).map(([key, value]) => (
              <div key={key} className="bg-slate-900/50 p-3 rounded">
                <p className="text-slate-400 text-xs capitalize">{key.replace('-', ' ')}</p>
                <p className="text-white font-semibold">{typeof value === 'number' ? value.toFixed(2) : value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checklist Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {checklistComplete ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            Pre-Lift Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Items Completed</span>
            <span className="text-white font-bold text-lg">
              {Object.values(checklist).filter(v => v).length}/{Object.keys(checklist).length}
            </span>
          </div>
          {checklistComplete && (
            <Badge className="bg-green-600 mt-3">All items checked</Badge>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button onClick={onRestart} variant="outline" className="border-slate-600 text-slate-300">
          Start New Scenario
        </Button>
        {passed && (
          <Button className="bg-green-600 hover:bg-green-700">
            Download Lift Plan
          </Button>
        )}
      </div>
    </div>
  )
}

