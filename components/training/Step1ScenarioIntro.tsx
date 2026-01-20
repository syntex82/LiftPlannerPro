"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Package, Ruler, ArrowUp, MapPin } from 'lucide-react'
import { LiftScenario } from '@/lib/training-lift-scenarios'

interface Step1Props {
  scenario: LiftScenario
  onNext: () => void
}

export default function Step1ScenarioIntro({ scenario, onNext }: Step1Props) {
  return (
    <div className="space-y-6">
      {/* Main Scenario Card */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-white">{scenario.title}</CardTitle>
              <p className="text-slate-300 mt-2">{scenario.description}</p>
            </div>
            <Badge className="bg-blue-600">Scenario</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Load Details */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Load Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded">
              <p className="text-slate-400 text-sm">Load Name</p>
              <p className="text-white font-semibold text-lg">{scenario.loadName}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded">
              <p className="text-slate-400 text-sm">Weight</p>
              <p className="text-white font-semibold text-lg">{scenario.loadWeight.toLocaleString()} kg</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded">
              <p className="text-slate-400 text-sm">Dimensions (W×H×D)</p>
              <p className="text-white font-semibold">
                {scenario.loadDimensions.width}m × {scenario.loadDimensions.height}m × {scenario.loadDimensions.depth}m
              </p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded">
              <p className="text-slate-400 text-sm">Lift Height</p>
              <p className="text-white font-semibold text-lg">{scenario.liftHeight}m</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Information */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Site Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300">{scenario.siteDescription}</p>
          
          <div>
            <h4 className="text-white font-semibold mb-2">Constraints:</h4>
            <ul className="space-y-2">
              {scenario.constraints.map((constraint, idx) => (
                <li key={idx} className="flex items-start text-slate-300">
                  <span className="text-blue-400 mr-2">•</span>
                  {constraint}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Hazards */}
      <Card className="bg-red-900/20 border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-300 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Identified Hazards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {scenario.hazards.map((hazard, idx) => (
              <li key={idx} className="flex items-start text-red-200">
                <span className="text-red-400 mr-2">⚠</span>
                {hazard}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next Button */}
      <div className="flex justify-end">
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
          Proceed to CAD Drawing
        </Button>
      </div>
    </div>
  )
}

