"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Loader } from 'lucide-react'
import { LiftScenario } from '@/lib/training-lift-scenarios'

interface Step2Props {
  scenario: LiftScenario
  onComplete: () => void
  onBack: () => void
  router: ReturnType<typeof useRouter>
}

export default function Step2CADDrawing({
  scenario,
  onComplete,
  onBack,
  router
}: Step2Props) {
  const [drawingStarted, setDrawingStarted] = useState(false)
  const [drawingReturned, setDrawingReturned] = useState(false)
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0)

  // Check if user has returned from CAD editor
  useEffect(() => {
    if (drawingStarted && !drawingReturned) {
      // Check every 500ms if user has returned from CAD
      const checkInterval = setInterval(() => {
        // If we're still on this page and drawing was started, user has returned
        const hasReturned = sessionStorage.getItem('cadDrawingComplete') === 'true'
        if (hasReturned) {
          setDrawingReturned(true)
          sessionStorage.removeItem('cadDrawingComplete')
          setAutoAdvanceCountdown(3) // 3 second countdown
        }
      }, 500)

      return () => clearInterval(checkInterval)
    }
  }, [drawingStarted, drawingReturned])

  // Auto-advance countdown
  useEffect(() => {
    if (autoAdvanceCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoAdvanceCountdown(autoAdvanceCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (autoAdvanceCountdown === 0 && drawingReturned) {
      // Auto-advance to next step
      onComplete()
    }
  }, [autoAdvanceCountdown, drawingReturned, onComplete])

  const handleOpenCAD = () => {
    setDrawingStarted(true)
    sessionStorage.setItem('trainingScenario', JSON.stringify({
      title: scenario.title,
      loadName: scenario.loadName,
      loadWeight: scenario.loadWeight,
      liftHeight: scenario.liftHeight,
      constraints: scenario.constraints
    }))
    router.push('/cad')
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Step 2: Create CAD Drawing</CardTitle>
        <p className="text-slate-400 text-sm mt-2">
          Create a scale drawing (1:200) showing site layout, crane position, load position, exclusion zones, and obstructions.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scenario Info */}
        <div className="bg-slate-900/50 p-6 rounded">
          <div className="grid grid-cols-2 gap-4 mb-6">
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
              <p className="text-slate-400 text-sm">Scale Required</p>
              <p className="text-white font-semibold">1:200</p>
            </div>
          </div>

          {/* Status */}
          {!drawingStarted && (
            <Button
              onClick={handleOpenCAD}
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
            >
              Open CAD Editor
            </Button>
          )}

          {drawingStarted && !drawingReturned && (
            <div className="flex items-center gap-3 text-amber-300 bg-amber-900/20 p-4 rounded">
              <Loader className="w-5 h-5 animate-spin" />
              <span>CAD editor is open. Complete your drawing and return here...</span>
            </div>
          )}

          {drawingReturned && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-green-300 bg-green-900/20 p-4 rounded">
                <CheckCircle2 className="w-5 h-5" />
                <span>Drawing saved! Advancing to next step...</span>
              </div>
              {autoAdvanceCountdown > 0 && (
                <p className="text-slate-400 text-sm text-center">
                  Continuing in {autoAdvanceCountdown} second{autoAdvanceCountdown !== 1 ? 's' : ''}...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500/50 p-4 rounded">
          <p className="text-blue-200 text-sm font-semibold mb-2">📋 Drawing Requirements:</p>
          <ul className="text-blue-200 text-sm space-y-1 ml-4">
            <li>✓ Site layout with dimensions</li>
            <li>✓ Crane position and outrigger spread</li>
            <li>✓ Load position and lift point</li>
            <li>✓ Exclusion zones (minimum 1.5x load height)</li>
            <li>✓ Obstructions and hazards</li>
            <li>✓ Scale: 1:200</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-slate-600 text-slate-300"
            disabled={drawingStarted && !drawingReturned}
          >
            Back
          </Button>
          {drawingStarted && !drawingReturned && (
            <Button disabled className="bg-slate-600">
              Waiting for drawing...
            </Button>
          )}
          {drawingReturned && (
            <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
              Continue to Crane Selection
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

