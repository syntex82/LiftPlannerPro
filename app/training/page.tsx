"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from 'lucide-react'
import { TRAINING_SCENARIOS, getScenario } from '@/lib/training-lift-scenarios'
import Step1ScenarioIntro from '@/components/training/Step1ScenarioIntro'
import Step2CADDrawing from '@/components/training/Step2CADDrawing'
import Step3CraneSelection from '@/components/training/Step3CraneSelection'
import Step4LiftCalculations from '@/components/training/Step4LiftCalculations'
import Step5PreLiftChecklist from '@/components/training/Step5PreLiftChecklist'
import Step6ReviewSubmit from '@/components/training/Step6ReviewSubmit'

type TrainingStep = 'scenario-select' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6'

interface WorkflowState {
  currentStep: TrainingStep
  selectedScenarioId: string | null
  cadDrawingComplete: boolean
  selectedCraneId: string | null
  selectedCraneName: string | null
  craneJustification: string | null
  calculations: Record<string, number> | null
  checklist: Record<number, boolean> | null
}

const STEPS = [
  { id: 'step1', label: 'Scenario', number: 1 },
  { id: 'step2', label: 'CAD Drawing', number: 2 },
  { id: 'step3', label: 'Crane Selection', number: 3 },
  { id: 'step4', label: 'Calculations', number: 4 },
  { id: 'step5', label: 'Checklist', number: 5 },
  { id: 'step6', label: 'Review', number: 6 }
]

export default function TrainingPage() {
  const router = useRouter()

  // Initialize state from localStorage or use defaults
  const [state, setState] = useState<WorkflowState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trainingWorkflowState')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved state:', e)
        }
      }
    }
    return {
      currentStep: 'scenario-select',
      selectedScenarioId: null,
      cadDrawingComplete: false,
      selectedCraneId: null,
      selectedCraneName: null,
      craneJustification: null,
      calculations: null,
      checklist: null
    }
  })

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trainingWorkflowState', JSON.stringify(state))
    }
  }, [state])

  // Check if returning from CAD editor
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('cadDrawingComplete') === 'true') {
      setState(prev => ({ ...prev, cadDrawingComplete: true, currentStep: 'step3' }))
      sessionStorage.removeItem('cadDrawingComplete')
    }
  }, [])

  const currentScenario = state.selectedScenarioId ? getScenario(state.selectedScenarioId) : null

  const handleScenarioSelect = (scenarioId: string) => {
    setState(prev => ({
      ...prev,
      selectedScenarioId: scenarioId,
      currentStep: 'step1'
    }))
  }

  const handleStep1Next = () => {
    setState(prev => ({ ...prev, currentStep: 'step2' }))
  }

  const handleStep2Complete = () => {
    setState(prev => ({ ...prev, cadDrawingComplete: true, currentStep: 'step3' }))
  }

  const handleStep3Next = (craneId: string, justification: string) => {
    const craneNames: Record<string, string> = {
      'crane-1': 'Mobile Crane 50T',
      'crane-2': 'Mobile Crane 100T',
      'crane-3': 'Telehandler 3T',
      'crane-4': 'Crawler Crane 300T',
      'crane-5': 'Tower Crane 10T'
    }
    setState(prev => ({
      ...prev,
      selectedCraneId: craneId,
      selectedCraneName: craneNames[craneId] || 'Unknown',
      craneJustification: justification,
      currentStep: 'step4'
    }))
  }

  const handleStep4Next = (calculations: Record<string, number>) => {
    setState(prev => ({ ...prev, calculations, currentStep: 'step5' }))
  }

  const handleStep5Next = (checklist: Record<number, boolean>) => {
    setState(prev => ({ ...prev, checklist, currentStep: 'step6' }))
  }

  const handleBack = () => {
    const stepOrder: TrainingStep[] = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6']
    const currentIndex = stepOrder.indexOf(state.currentStep)
    if (currentIndex > 0) {
      setState(prev => ({ ...prev, currentStep: stepOrder[currentIndex - 1] }))
    }
  }

  const handleRestart = () => {
    const newState = {
      currentStep: 'scenario-select' as TrainingStep,
      selectedScenarioId: null,
      cadDrawingComplete: false,
      selectedCraneId: null,
      selectedCraneName: null,
      craneJustification: null,
      calculations: null,
      checklist: null
    }
    setState(newState)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('trainingWorkflowState')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Lift Planning Training</h1>
              <p className="text-slate-400 mt-1">Complete step-by-step lift planning exercise</p>
            </div>
            {state.currentStep !== 'scenario-select' && (
              <Button
                onClick={handleRestart}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Back to Scenarios
              </Button>
            )}
          </div>

          {/* Progress Steps */}
          {state.currentStep !== 'scenario-select' && (
            <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
              {STEPS.map((step, idx) => {
                const stepOrder: TrainingStep[] = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6']
                const currentIndex = stepOrder.indexOf(state.currentStep)
                const stepIndex = idx
                const isComplete = stepIndex < currentIndex
                const isCurrent = stepIndex === currentIndex

                return (
                  <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        isComplete
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {isComplete ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                    </div>
                    <span className={`text-sm font-medium ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-8 h-0.5 ${isComplete ? 'bg-green-600' : 'bg-slate-700'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-8">
          {/* Scenario Selection */}
          {state.currentStep === 'scenario-select' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Select a Training Scenario</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TRAINING_SCENARIOS.map(scenario => (
                  <Card
                    key={scenario.id}
                    className="bg-slate-800/50 border-slate-700 hover:border-blue-500 cursor-pointer transition-all"
                    onClick={() => handleScenarioSelect(scenario.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{scenario.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-slate-300 text-sm">{scenario.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Load:</span>
                          <span className="text-white font-semibold">{scenario.loadWeight}kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Height:</span>
                          <span className="text-white font-semibold">{scenario.liftHeight}m</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Constraints:</span>
                          <span className="text-white font-semibold">{scenario.constraints.length}</span>
                        </div>
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                        Start Scenario
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Scenario Introduction */}
          {state.currentStep === 'step1' && currentScenario && (
            <Step1ScenarioIntro scenario={currentScenario} onNext={handleStep1Next} />
          )}

          {/* Step 2: CAD Drawing */}
          {state.currentStep === 'step2' && currentScenario && (
            <Step2CADDrawing
              scenario={currentScenario}
              onComplete={handleStep2Complete}
              onBack={handleBack}
              router={router}
            />
          )}

          {/* Step 3: Crane Selection */}
          {state.currentStep === 'step3' && currentScenario && (
            <Step3CraneSelection
              scenario={currentScenario}
              onNext={handleStep3Next}
              onBack={handleBack}
            />
          )}

          {/* Step 4: Lift Calculations */}
          {state.currentStep === 'step4' && currentScenario && (
            <Step4LiftCalculations
              scenario={currentScenario}
              onNext={handleStep4Next}
              onBack={handleBack}
            />
          )}

          {/* Step 5: Pre-Lift Checklist */}
          {state.currentStep === 'step5' && (
            <Step5PreLiftChecklist onNext={handleStep5Next} onBack={handleBack} />
          )}

          {/* Step 6: Review & Submit */}
          {state.currentStep === 'step6' && currentScenario && state.selectedCraneName && state.calculations && state.checklist && (
            <Step6ReviewSubmit
              scenario={currentScenario}
              craneId={state.selectedCraneId || ''}
              craneName={state.selectedCraneName}
              justification={state.craneJustification || ''}
              calculations={state.calculations}
              checklist={state.checklist}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </div>
  )
}

