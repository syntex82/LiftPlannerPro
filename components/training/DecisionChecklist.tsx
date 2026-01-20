"use client"

// Decision Checklist Component - Guides trainees through critical decisions
// Ensures all important factors are considered before proceeding

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'

interface ChecklistItem {
  id: string
  category: string
  question: string
  guidance: string
  critical: boolean
}

interface DecisionChecklistProps {
  onComplete?: (checklist: ChecklistItem[]) => void
}

export default function DecisionChecklist({ onComplete }: DecisionChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(getDefaultChecklist())
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newCompleted = new Set(completedItems)
    if (newCompleted.has(id)) {
      newCompleted.delete(id)
    } else {
      newCompleted.add(id)
    }
    setCompletedItems(newCompleted)
  }

  const handleComplete = () => {
    if (onComplete) {
      onComplete(checklist)
    }
  }

  const allCriticalComplete = checklist
    .filter(item => item.critical)
    .every(item => completedItems.has(item.id))

  const allComplete = checklist.length === completedItems.size

  // Group by category
  const grouped = checklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Decision Checklist Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Completed:</span>
              <span className="text-white font-semibold">{completedItems.size} / {checklist.length}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(completedItems.size / checklist.length) * 100}%` }}
              />
            </div>
            {!allCriticalComplete && (
              <p className="text-xs text-yellow-300">⚠ Complete all critical items before proceeding</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checklist by Category */}
      {Object.entries(grouped).map(([category, items]) => (
        <Card key={category} className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="space-y-2">
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`w-full text-left p-3 rounded border-2 transition-colors ${
                    completedItems.has(item.id)
                      ? 'bg-green-900/20 border-green-700'
                      : item.critical
                      ? 'bg-red-900/10 border-red-700 hover:bg-red-900/20'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {completedItems.has(item.id) ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : item.critical ? (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-slate-500 rounded flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${completedItems.has(item.id) ? 'text-green-300' : 'text-white'}`}>
                        {item.question}
                      </p>
                      {item.critical && !completedItems.has(item.id) && (
                        <p className="text-xs text-red-300 mt-1">⚠ Critical - Must complete</p>
                      )}
                    </div>
                  </div>
                </button>

                {/* Guidance */}
                <div className="ml-7 p-2 bg-slate-800 rounded text-xs text-slate-300 flex gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p>{item.guidance}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleComplete}
          disabled={!allCriticalComplete}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
        >
          {allComplete ? 'All Items Complete - Proceed' : 'Complete Checklist'}
        </Button>
      </div>
    </div>
  )
}

function getDefaultChecklist(): ChecklistItem[] {
  return [
    // Site Assessment
    {
      id: 'site-1',
      category: 'Site Assessment',
      question: 'Have you identified all obstructions on the site?',
      guidance: 'Walk the site and mark all buildings, trees, power lines, and other obstacles. Verify clearances.',
      critical: true
    },
    {
      id: 'site-2',
      category: 'Site Assessment',
      question: 'Have you assessed ground conditions?',
      guidance: 'Check ground bearing capacity in all areas where crane will be positioned. Look for soft spots, water, or uneven surfaces.',
      critical: true
    },
    {
      id: 'site-3',
      category: 'Site Assessment',
      question: 'Have you identified exclusion zones?',
      guidance: 'Mark areas where personnel cannot be during the lift. Consider load swing radius and boom movement.',
      critical: true
    },

    // Equipment Selection
    {
      id: 'equip-1',
      category: 'Equipment Selection',
      question: 'Is the selected crane suitable for this load?',
      guidance: 'Verify crane capacity exceeds load weight with safety margin. Check boom length is sufficient.',
      critical: true
    },
    {
      id: 'equip-2',
      category: 'Equipment Selection',
      question: 'Can the crane be positioned safely on this site?',
      guidance: 'Ensure ground can support crane weight. Verify outrigger spread space is available.',
      critical: true
    },
    {
      id: 'equip-3',
      category: 'Equipment Selection',
      question: 'Is the crane in good working condition?',
      guidance: 'Check maintenance records. Verify all safety systems are functional.',
      critical: false
    },

    // Load Assessment
    {
      id: 'load-1',
      category: 'Load Assessment',
      question: 'Is the load properly rigged?',
      guidance: 'Verify rigging equipment is rated for load weight. Check slings are not damaged. Ensure load is balanced.',
      critical: true
    },
    {
      id: 'load-2',
      category: 'Load Assessment',
      question: 'Have you verified the load weight?',
      guidance: 'Weigh the load or verify weight from documentation. Do not estimate.',
      critical: true
    },
    {
      id: 'load-3',
      category: 'Load Assessment',
      question: 'Is the load center of gravity known?',
      guidance: 'Determine where the load will balance. Mark the center of gravity on the load.',
      critical: false
    },

    // Hazard Management
    {
      id: 'hazard-1',
      category: 'Hazard Management',
      question: 'Have you identified all hazards?',
      guidance: 'Review site conditions, equipment, load, and personnel. Consider what could go wrong.',
      critical: true
    },
    {
      id: 'hazard-2',
      category: 'Hazard Management',
      question: 'Have you planned mitigation for each hazard?',
      guidance: 'For each hazard, identify how you will prevent or control it. Assign responsibility.',
      critical: true
    },
    {
      id: 'hazard-3',
      category: 'Hazard Management',
      question: 'Have you communicated hazards to the team?',
      guidance: 'Brief all personnel on identified hazards and mitigation strategies before the lift.',
      critical: true
    },

    // Team & Communication
    {
      id: 'team-1',
      category: 'Team & Communication',
      question: 'Are all team members trained and competent?',
      guidance: 'Verify operator, rigger, and spotters have required qualifications and experience.',
      critical: true
    },
    {
      id: 'team-2',
      category: 'Team & Communication',
      question: 'Have you established communication signals?',
      guidance: 'Confirm hand signals and radio procedures with all team members. Test communication.',
      critical: true
    },
    {
      id: 'team-3',
      category: 'Team & Communication',
      question: 'Is there a clear chain of command?',
      guidance: 'Designate Appointed Person. Ensure everyone knows who makes final decisions.',
      critical: true
    },

    // Final Approval
    {
      id: 'final-1',
      category: 'Final Approval',
      question: 'Have you conducted a pre-lift briefing?',
      guidance: 'Brief all personnel on the lift plan, hazards, procedures, and emergency response.',
      critical: true
    },
    {
      id: 'final-2',
      category: 'Final Approval',
      question: 'Is the lift plan documented?',
      guidance: 'Record the lift plan, hazards, and mitigation strategies. Keep for records.',
      critical: false
    },
    {
      id: 'final-3',
      category: 'Final Approval',
      question: 'Do you approve this lift to proceed?',
      guidance: 'As Appointed Person, you are responsible for this decision. Only approve if safe.',
      critical: true
    }
  ]
}

