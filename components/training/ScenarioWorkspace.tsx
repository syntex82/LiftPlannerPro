"use client"

// Scenario Workspace Component - Main interface where trainees work through a training scenario
// Shows site layout, load info, available equipment, and decision-making tools

import { useState } from 'react'
import { TrainingScenario, ScenarioAttempt } from '@/lib/training-scenarios'
import { startAttempt, updateAttempt, completeAttempt } from '@/lib/scenario-manager'
import SiteVisualization from './SiteVisualization'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Clock, Target } from 'lucide-react'

interface ScenarioWorkspaceProps {
  scenario: TrainingScenario
  traineeId: string
  onComplete?: (attempt: ScenarioAttempt) => void
}

export default function ScenarioWorkspace({
  scenario,
  traineeId,
  onComplete
}: ScenarioWorkspaceProps) {
  const [attempt, setAttempt] = useState<ScenarioAttempt | null>(null)
  const [selectedCrane, setSelectedCrane] = useState<string | null>(null)
  const [showChecklist, setShowChecklist] = useState(false)

  // Start the scenario
  const handleStartScenario = () => {
    const newAttempt = startAttempt(scenario.id, traineeId)
    setAttempt(newAttempt)
  }

  // Mark a verification step as complete
  const handleVerificationStep = (step: keyof Omit<ScenarioAttempt, 'id' | 'scenarioId' | 'traineeId' | 'startedAt' | 'completedAt' | 'selectedCrane' | 'cranePosition' | 'craneRotation' | 'boomConfiguration' | 'passed' | 'score' | 'feedback' | 'mistakesMade'>) => {
    if (!attempt) return
    const updated = updateAttempt(attempt.id, traineeId, {
      [step]: true
    })
    if (updated) setAttempt(updated)
  }

  // Complete the scenario
  const handleCompleteScenario = () => {
    if (!attempt) return
    const completed = completeAttempt(attempt.id, traineeId)
    if (completed) {
      setAttempt(completed)
      if (onComplete) onComplete(completed)
    }
  }

  // If scenario not started, show start screen
  if (!attempt) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">{scenario.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">{scenario.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Scenario Info</h3>
                <div className="space-y-1 text-sm text-slate-400">
                  <p>Difficulty: <span className="capitalize font-semibold">{scenario.difficulty}</span></p>
                  <p>Category: {scenario.category}</p>
                  <p>Estimated Time: {scenario.estimatedTime} minutes</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Learning Objectives</h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  {scenario.learningObjectives.map((obj, i) => (
                    <li key={i}>• {obj}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              onClick={handleStartScenario}
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
            >
              <Target className="w-5 h-5 mr-2" />
              Start Scenario
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Scenario in progress
  return (
    <div className="space-y-6">
      {/* Header with timer */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{scenario.title}</h1>
          <p className="text-slate-400">Work through this scenario step by step</p>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-5 h-5" />
          <span>Est. {scenario.estimatedTime} min</span>
        </div>
      </div>

      {/* Main workspace grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Site Visualization */}
        <div className="col-span-2">
          <SiteVisualization scenario={scenario} />
        </div>

        {/* Right: Decision Panel */}
        <div className="space-y-4">
          {/* Load Information */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Load Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-slate-400">Name:</p>
                <p className="text-white font-semibold">{scenario.load.name}</p>
              </div>
              <div>
                <p className="text-slate-400">Weight:</p>
                <p className="text-white font-semibold">{scenario.load.weight} kg</p>
              </div>
              <div>
                <p className="text-slate-400">Dimensions:</p>
                <p className="text-white font-semibold">
                  {scenario.load.width}m × {scenario.load.height}m × {scenario.load.depth}m
                </p>
              </div>
              {scenario.load.fragile && (
                <div className="bg-red-900/30 border border-red-700 rounded p-2 mt-2">
                  <p className="text-red-300 text-xs">⚠ Fragile load - max tilt {scenario.load.maxTiltAngle}°</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment Selection */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Select Crane</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {scenario.availableEquipment.map(craneId => (
                <Button
                  key={craneId}
                  variant={selectedCrane === craneId ? "default" : "outline"}
                  onClick={() => setSelectedCrane(craneId)}
                  className="w-full justify-start text-xs"
                >
                  {craneId}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Verification Checklist */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Verification Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { key: 'capacityChecked', label: 'Verify Load Capacity' },
                { key: 'radiusVerified', label: 'Check Boom Radius' },
                { key: 'groundBearingChecked', label: 'Check Ground Bearing' },
                { key: 'obstaclesReviewed', label: 'Review Obstructions' }
              ].map(item => (
                <Button
                  key={item.key}
                  variant="outline"
                  onClick={() => handleVerificationStep(item.key as any)}
                  className={`w-full justify-start text-xs ${
                    (attempt as any)[item.key] ? 'bg-green-900/30 border-green-700' : ''
                  }`}
                >
                  {(attempt as any)[item.key] ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                  )}
                  {item.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Complete Button */}
          <Button
            onClick={handleCompleteScenario}
            className="w-full bg-green-600 hover:bg-green-700 py-6"
          >
            Complete Scenario
          </Button>
        </div>
      </div>
    </div>
  )
}

