"use client"

// Communication Plan Component - Helps trainees document and communicate their lift plan
// Teaches professional communication and documentation

import { useState } from 'react'
import { TrainingScenario } from '@/lib/training-scenarios'
import { CraneEquipment } from '@/lib/equipment-library'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, AlertCircle, CheckCircle } from 'lucide-react'

interface CommunicationPlanProps {
  scenario: TrainingScenario
  equipment: CraneEquipment
  cranePosition?: { x: number; y: number }
  loadPosition?: { x: number; y: number }
}

export default function CommunicationPlan({
  scenario,
  equipment,
  cranePosition,
  loadPosition
}: CommunicationPlanProps) {
  const [showPlan, setShowPlan] = useState(false)

  // Generate communication plan
  const generatePlan = () => {
    return {
      briefing: generateBriefing(),
      signals: generateSignals(),
      procedures: generateProcedures(),
      emergencyPlan: generateEmergencyPlan()
    }
  }

  const generateBriefing = () => ({
    title: 'Pre-Lift Briefing',
    points: [
      `Load: ${scenario.load.name} (${scenario.load.weight}kg)`,
      `Crane: ${equipment.name} (${equipment.maxCapacity}kg capacity)`,
      `Site: ${scenario.siteDescription}`,
      'All personnel must understand their roles',
      'Review all hazards and mitigation strategies',
      'Confirm communication signals with all team members',
      'Establish exclusion zones around lift area',
      'Ensure all safety equipment is in place'
    ]
  })

  const generateSignals = () => ({
    title: 'Hand Signals & Communication',
    signals: [
      { signal: 'Thumbs Up', meaning: 'Ready to proceed / All clear' },
      { signal: 'Thumbs Down', meaning: 'Stop immediately' },
      { signal: 'Flat Hand', meaning: 'Halt / Wait' },
      { signal: 'Circular Motion', meaning: 'Rotate load' },
      { signal: 'Pointing', meaning: 'Direction of movement' },
      { signal: 'Radio Check', meaning: 'Confirm radio communication before lift' }
    ]
  })

  const generateProcedures = () => ({
    title: 'Lift Procedures',
    steps: [
      '1. Conduct pre-lift briefing with all personnel',
      '2. Verify crane position and stability',
      '3. Check load is properly rigged and balanced',
      '4. Clear exclusion zone of all unnecessary personnel',
      '5. Establish radio communication with all team members',
      '6. Perform test lift (lift load 0.5m and hold for 10 seconds)',
      '7. If test lift successful, proceed with main lift',
      '8. Maintain constant communication throughout lift',
      '9. Lower load carefully to final position',
      '10. Secure load and release rigging'
    ]
  })

  const generateEmergencyPlan = () => ({
    title: 'Emergency Procedures',
    procedures: [
      'If load becomes unstable: STOP immediately and lower to safe position',
      'If crane shows signs of instability: STOP and investigate',
      'If communication is lost: STOP all operations',
      'If weather conditions deteriorate: STOP and secure load',
      'In case of injury: Activate emergency services and secure the site',
      'All personnel must know location of emergency assembly point'
    ]
  })

  const plan = generatePlan()

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <Button
        onClick={() => setShowPlan(!showPlan)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <FileText className="w-4 h-4 mr-2" />
        {showPlan ? 'Hide' : 'Show'} Communication Plan
      </Button>

      {showPlan && (
        <>
          {/* Pre-Lift Briefing */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                {plan.briefing.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.briefing.points.map((point, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Hand Signals */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">{plan.signals.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {plan.signals.signals.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-slate-700 pb-2">
                    <span className="text-slate-300 font-semibold">{item.signal}</span>
                    <span className="text-slate-400">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lift Procedures */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">{plan.procedures.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {plan.procedures.steps.map((step, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-blue-400 font-semibold flex-shrink-0">{i + 1}.</span>
                    <span>{step.split('. ')[1]}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Emergency Procedures */}
          <Card className="bg-red-900/20 border border-red-700">
            <CardHeader>
              <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {plan.emergencyPlan.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.emergencyPlan.procedures.map((proc, i) => (
                  <li key={i} className="text-sm text-red-300 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{proc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Key Contacts */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Key Contacts & Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400">Appointed Person:</p>
                  <p className="text-white font-semibold">Overall responsibility</p>
                </div>
                <div>
                  <p className="text-slate-400">Crane Operator:</p>
                  <p className="text-white font-semibold">Equipment operation</p>
                </div>
                <div>
                  <p className="text-slate-400">Rigger:</p>
                  <p className="text-white font-semibold">Load rigging & security</p>
                </div>
                <div>
                  <p className="text-slate-400">Spotters:</p>
                  <p className="text-white font-semibold">Clearance monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

