"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, CheckCircle2 } from 'lucide-react'
import { LiftScenario } from '@/lib/training-lift-scenarios'

interface Crane {
  id: string
  name: string
  capacity: number // tonnes
  reach: number // meters
  maxRadius: number // meters
  outriggerSpread: number // meters
  description: string
}

const AVAILABLE_CRANES: Crane[] = [
  {
    id: 'crane-1',
    name: 'Mobile Crane 50T',
    capacity: 50,
    reach: 40,
    maxRadius: 35,
    outriggerSpread: 8,
    description: 'Versatile 50-tonne capacity crane. Good for urban sites with limited space.'
  },
  {
    id: 'crane-2',
    name: 'Mobile Crane 100T',
    capacity: 100,
    reach: 50,
    maxRadius: 45,
    outriggerSpread: 10,
    description: 'Heavy-duty 100-tonne crane. Suitable for large industrial lifts.'
  },
  {
    id: 'crane-3',
    name: 'Telehandler 3T',
    capacity: 3,
    reach: 17,
    maxRadius: 15,
    outriggerSpread: 4,
    description: 'Compact 3-tonne telehandler. Best for small loads and tight spaces.'
  },
  {
    id: 'crane-4',
    name: 'Crawler Crane 300T',
    capacity: 300,
    reach: 80,
    maxRadius: 75,
    outriggerSpread: 12,
    description: 'Massive 300-tonne crawler crane. For heavy industrial projects.'
  },
  {
    id: 'crane-5',
    name: 'Tower Crane 10T',
    capacity: 10,
    reach: 60,
    maxRadius: 55,
    outriggerSpread: 0,
    description: 'Fixed tower crane. Ideal for high-rise construction.'
  }
]

interface Step3Props {
  scenario: LiftScenario
  onNext: (craneId: string, justification: string) => void
  onBack: () => void
}

export default function Step3CraneSelection({ scenario, onNext, onBack }: Step3Props) {
  const [selectedCrane, setSelectedCrane] = useState<string | null>(null)
  const [justification, setJustification] = useState('')

  const handleNext = () => {
    if (selectedCrane && justification.trim()) {
      onNext(selectedCrane, justification)
    }
  }

  const requiredCapacity = scenario.expectedCalculations.craneCapacityRequired

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Select Appropriate Crane
          </CardTitle>
          <p className="text-slate-400 text-sm mt-2">
            Required capacity: {requiredCapacity.toLocaleString()} kg ({(requiredCapacity / 1000).toFixed(1)}T)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {AVAILABLE_CRANES.map(crane => {
              const isSuitable = crane.capacity * 1000 >= requiredCapacity
              const isSelected = selectedCrane === crane.id

              return (
                <div
                  key={crane.id}
                  onClick={() => setSelectedCrane(crane.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-900/30 border-blue-500'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">{crane.name}</h3>
                        {isSuitable && (
                          <Badge className="bg-green-600">Suitable</Badge>
                        )}
                        {!isSuitable && (
                          <Badge className="bg-red-600">Insufficient Capacity</Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mt-1">{crane.description}</p>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-slate-500 text-xs">Capacity</p>
                          <p className="text-white font-semibold">{crane.capacity}T</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Reach</p>
                          <p className="text-white font-semibold">{crane.reach}m</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Max Radius</p>
                          <p className="text-white font-semibold">{crane.maxRadius}m</p>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0 ml-4" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Justification */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Justify Your Selection</CardTitle>
          <p className="text-slate-400 text-sm mt-2">Explain why you selected this crane for this lift</p>
        </CardHeader>
        <CardContent>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Consider: capacity requirements, site constraints, reach needed, ground conditions, cost-effectiveness..."
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded text-white p-3 focus:outline-none focus:border-blue-500"
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="border-slate-600 text-slate-300">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedCrane || !justification.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          Proceed to Calculations
        </Button>
      </div>
    </div>
  )
}

