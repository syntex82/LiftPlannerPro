"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react'
import { LiftScenario } from '@/lib/training-lift-scenarios'

interface CalculationField {
  id: string
  label: string
  unit: string
  expected: number
  tolerance: number // percentage
  hint: string
}

const CALCULATION_FIELDS: CalculationField[] = [
  {
    id: 'load-weight',
    label: 'Load Weight Verification',
    unit: 'kg',
    expected: 0, // Will be set from scenario
    tolerance: 0,
    hint: 'Verify the total weight of the load including rigging'
  },
  {
    id: 'radius',
    label: 'Radius at Lift Point',
    unit: 'm',
    expected: 0,
    tolerance: 5,
    hint: 'Horizontal distance from crane center to load center'
  },
  {
    id: 'capacity-required',
    label: 'Crane Capacity Required',
    unit: 'kg',
    expected: 0,
    tolerance: 5,
    hint: 'Load weight × safety factor (typically 1.25)'
  },
  {
    id: 'rigging-weight',
    label: 'Rigging Weight',
    unit: 'kg',
    expected: 0,
    tolerance: 10,
    hint: 'Weight of slings, shackles, and lifting lugs'
  },
  {
    id: 'safety-factor',
    label: 'Safety Factor',
    unit: 'ratio',
    expected: 1.25,
    tolerance: 0,
    hint: 'Typically 1.25 for standard lifts'
  },
  {
    id: 'ground-pressure',
    label: 'Ground Bearing Pressure',
    unit: 'tonnes/m²',
    expected: 0,
    tolerance: 10,
    hint: 'Total load divided by outrigger pad area'
  }
]

interface Step4Props {
  scenario: LiftScenario
  onNext: (calculations: Record<string, number>) => void
  onBack: () => void
}

export default function Step4LiftCalculations({ scenario, onNext, onBack }: Step4Props) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fields = CALCULATION_FIELDS.map(field => ({
    ...field,
    expected: scenario.expectedCalculations[field.id as keyof typeof scenario.expectedCalculations] || field.expected
  }))

  const handleChange = (id: string, value: string) => {
    setValues(prev => ({ ...prev, [id]: value }))
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }))
    }
  }

  const validateCalculations = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach(field => {
      const value = parseFloat(values[field.id] || '')
      if (isNaN(value)) {
        newErrors[field.id] = 'Required'
        return
      }

      const tolerance = (field.expected * field.tolerance) / 100
      const min = field.expected - tolerance
      const max = field.expected + tolerance

      if (value < min || value > max) {
        newErrors[field.id] = `Expected ~${field.expected.toFixed(1)} (±${field.tolerance}%)`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCalculations()) {
      const calculations = Object.entries(values).reduce((acc, [key, val]) => {
        acc[key] = parseFloat(val)
        return acc
      }, {} as Record<string, number>)
      onNext(calculations)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Lift Calculations
          </CardTitle>
          <p className="text-slate-400 text-sm mt-2">Complete all required calculations for this lift</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.id} className="bg-slate-900/50 p-4 rounded">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <label className="text-white font-semibold">{field.label}</label>
                    <p className="text-slate-400 text-sm">{field.hint}</p>
                  </div>
                  <Badge variant="outline" className="text-slate-400">{field.unit}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={values[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={`Expected: ${field.expected.toFixed(1)}`}
                    className={`flex-1 bg-slate-800 border rounded px-3 py-2 text-white focus:outline-none ${
                      errors[field.id]
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-600 focus:border-blue-500'
                    }`}
                  />
                  {values[field.id] && !errors[field.id] && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {errors[field.id] && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                {errors[field.id] && (
                  <p className="text-red-400 text-sm mt-1">{errors[field.id]}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="border-slate-600 text-slate-300">
          Back
        </Button>
        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
          Proceed to Checklist
        </Button>
      </div>
    </div>
  )
}

