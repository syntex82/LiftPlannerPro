"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'

interface ChecklistItem {
  id: number
  title: string
  description: string
  category: 'equipment' | 'site' | 'personnel' | 'documentation'
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 1,
    title: 'Crane Inspection',
    description: 'Visual inspection of crane structure, boom, and hydraulics. Check for damage or leaks.',
    category: 'equipment'
  },
  {
    id: 2,
    title: 'Load Verification',
    description: 'Confirm load weight, dimensions, and center of gravity. Check load documentation.',
    category: 'equipment'
  },
  {
    id: 3,
    title: 'Rigging Inspection',
    description: 'Inspect all slings, shackles, lifting lugs, and spreader bars. Check SWL and certification.',
    category: 'equipment'
  },
  {
    id: 4,
    title: 'Site Assessment',
    description: 'Check ground conditions, bearing capacity, and stability. Verify outrigger pad placement.',
    category: 'site'
  },
  {
    id: 5,
    title: 'Hazard Assessment',
    description: 'Identify all hazards: power lines, obstructions, pedestrians, weather. Plan mitigations.',
    category: 'site'
  },
  {
    id: 6,
    title: 'Weather Check',
    description: 'Verify wind speed, visibility, and forecast. Confirm within safe operating limits.',
    category: 'site'
  },
  {
    id: 7,
    title: 'Exclusion Zone',
    description: 'Establish and mark exclusion zone. Ensure no unauthorized personnel in area.',
    category: 'personnel'
  },
  {
    id: 8,
    title: 'Communication Test',
    description: 'Test radio communication between crane operator, slinger, and Appointed Person.',
    category: 'personnel'
  },
  {
    id: 9,
    title: 'Trial Lift',
    description: 'Perform trial lift to test stability and rigging. Check for any issues before full lift.',
    category: 'documentation'
  },
  {
    id: 10,
    title: 'Final Approval',
    description: 'Appointed Person reviews all checks and approves lift. Sign off on lift plan.',
    category: 'documentation'
  }
]

interface Step5Props {
  onNext: (checklist: Record<number, boolean>) => void
  onBack: () => void
}

export default function Step5PreLiftChecklist({ onNext, onBack }: Step5Props) {
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  const toggleItem = (id: number) => {
    const newCompleted = new Set(completed)
    if (newCompleted.has(id)) {
      newCompleted.delete(id)
    } else {
      newCompleted.add(id)
    }
    setCompleted(newCompleted)
  }

  const completionPercentage = Math.round((completed.size / CHECKLIST_ITEMS.length) * 100)
  const allComplete = completed.size === CHECKLIST_ITEMS.length

  const categories = ['equipment', 'site', 'personnel', 'documentation'] as const
  const categoryLabels = {
    equipment: 'Equipment Checks',
    site: 'Site Checks',
    personnel: 'Personnel & Safety',
    documentation: 'Documentation & Approval'
  }

  const handleNext = () => {
    if (allComplete) {
      const checklistRecord = CHECKLIST_ITEMS.reduce((acc, item) => {
        acc[item.id] = completed.has(item.id)
        return acc
      }, {} as Record<number, boolean>)
      onNext(checklistRecord)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Completion Progress</span>
            <span className="text-blue-400 font-bold">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist by Category */}
      {categories.map(category => {
        const items = CHECKLIST_ITEMS.filter(item => item.category === category)
        return (
          <Card key={category} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">{categoryLabels[category]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    completed.has(item.id)
                      ? 'bg-green-900/20 border-green-500'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completed.has(item.id) ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{item.title}</h4>
                      <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      {/* Warning if not complete */}
      {!allComplete && (
        <Card className="bg-amber-900/20 border-amber-500/50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-200 font-semibold">All items must be completed</p>
              <p className="text-amber-300 text-sm mt-1">You cannot proceed to review until all checklist items are checked.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="border-slate-600 text-slate-300">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!allComplete}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          Proceed to Review
        </Button>
      </div>
    </div>
  )
}

