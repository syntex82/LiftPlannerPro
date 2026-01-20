"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calculator, Info, AlertTriangle } from "lucide-react"
import Link from "next/link"
import TensionCalculator from "@/components/tension-calculator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TensionCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Calculator className="w-8 h-8 text-purple-400" />
                Tension Calculator
              </h1>
              <p className="text-slate-400 mt-1">
                Calculate chainblock and sling tensions for safe lifting operations
              </p>
            </div>
          </div>
        </div>

        {/* Safety Warning */}
        <Alert className="mb-6 border-yellow-600 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            <strong>Safety Notice:</strong> This calculator is for guidance only. Always consult qualified 
            lifting engineers and follow local regulations. Verify all calculations independently before use.
          </AlertDescription>
        </Alert>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                What This Calculates
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm space-y-2">
              <p>• Tension in each sling leg</p>
              <p>• Angle multiplier effects</p>
              <p>• Required sling capacity</p>
              <p>• Safety factor verification</p>
              <p>• Load distribution analysis</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Critical Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm space-y-2">
              <p>• Sling angle affects tension dramatically</p>
              <p>• Angles below 30° are dangerous</p>
              <p>• Always use appropriate safety factors</p>
              <p>• Consider dynamic loading effects</p>
              <p>• Verify sling condition and ratings</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-400" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm space-y-2">
              <p>• Use 45° - 90° sling angles</p>
              <p>• Minimum 6:1 safety factor</p>
              <p>• Equal leg lengths when possible</p>
              <p>• Consider load center of gravity</p>
              <p>• Regular equipment inspection</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Calculator */}
        <TensionCalculator />

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Understanding Angle Effects</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm space-y-3">
              <p>
                The angle between sling legs dramatically affects the tension in each leg. 
                As the angle decreases (slings become more vertical), the tension increases exponentially.
              </p>
              <div className="bg-slate-900 p-3 rounded">
                <p className="font-semibold text-white mb-2">Quick Reference:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>90° angle = 0.71x load</div>
                  <div>60° angle = 1.00x load</div>
                  <div>45° angle = 1.31x load</div>
                  <div>30° angle = 1.93x load</div>
                </div>
              </div>
              <p>
                <strong>Remember:</strong> These multipliers apply to each leg, so total sling 
                capacity must account for the increased tension.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Safety Considerations</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm space-y-3">
              <p>
                Always apply appropriate safety factors to account for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Dynamic loading during lifting</li>
                <li>Uneven load distribution</li>
                <li>Sling wear and degradation</li>
                <li>Environmental factors</li>
                <li>Human error in rigging</li>
              </ul>
              <div className="bg-red-900/20 border border-red-600 p-3 rounded">
                <p className="font-semibold text-red-300">
                  ⚠️ Never exceed working load limits
                </p>
                <p className="text-red-400 text-xs mt-1">
                  When in doubt, use higher capacity equipment or consult a lifting engineer.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>
            Lift Planner Pro - Professional lifting and rigging calculations
          </p>
          <p className="mt-1">
            Always verify calculations with qualified personnel before use
          </p>
        </div>
      </div>
    </div>
  )
}
