"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator } from "lucide-react"

export default function TensionCalculatorSimple() {
  const [legs, setLegs] = useState(2)
  const [angle, setAngle] = useState(60)
  const [loadWeight, setLoadWeight] = useState(1000)
  const [slingCapacity, setSlingCapacity] = useState(1000)
  const [safetyFactor, setSafetyFactor] = useState(6)

  const [angleMultiplier, setAngleMultiplier] = useState(0)
  const [legTension, setLegTension] = useState(0)
  const [totalCapacityRequired, setTotalCapacityRequired] = useState(0)
  const [isWithinLimits, setIsWithinLimits] = useState(false)

  const calculateTension = () => {
    console.log('Calculating with:', { legs, angle, loadWeight, slingCapacity, safetyFactor })
    
    // Convert angle to radians
    const angleRad = (angle * Math.PI) / 180
    
    // Calculate angle multiplier (tension factor)
    const multiplier = 1 / (2 * Math.sin(angleRad / 2))
    
    // Calculate tension in each leg
    const tension = (loadWeight * multiplier) / legs
    
    // Calculate total capacity required
    const totalRequired = tension * safetyFactor
    
    // Check if within safe limits
    const safe = totalRequired <= slingCapacity
    
    console.log('Results:', { multiplier, tension, totalRequired, safe })
    
    setAngleMultiplier(multiplier)
    setLegTension(tension)
    setTotalCapacityRequired(totalRequired)
    setIsWithinLimits(safe)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calculator className="w-5 h-5" />
            Simple Tension Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Number of Legs</Label>
              <Input
                type="number"
                min="1"
                max="4"
                value={legs}
                onChange={(e) => setLegs(parseInt(e.target.value) || 1)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Sling Angle (degrees)</Label>
              <Input
                type="number"
                min="15"
                max="180"
                value={angle}
                onChange={(e) => setAngle(parseFloat(e.target.value) || 0)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Load Weight (kg)</Label>
              <Input
                type="number"
                min="1"
                value={loadWeight}
                onChange={(e) => setLoadWeight(parseFloat(e.target.value) || 0)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Sling Capacity (kg)</Label>
              <Input
                type="number"
                min="1"
                value={slingCapacity}
                onChange={(e) => setSlingCapacity(parseFloat(e.target.value) || 0)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Safety Factor</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={safetyFactor}
                onChange={(e) => setSafetyFactor(parseFloat(e.target.value) || 1)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Calculate</Label>
              <Button
                onClick={calculateTension}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Calculate Tension
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {angleMultiplier.toFixed(3)}x
                  </div>
                  <div className="text-sm text-slate-300">Angle Multiplier</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {legTension.toFixed(0)} kg
                  </div>
                  <div className="text-sm text-slate-300">Tension per Leg</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {totalCapacityRequired.toFixed(0)} kg
                  </div>
                  <div className="text-sm text-slate-300">Required Capacity</div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-2 ${isWithinLimits ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {isWithinLimits ? '✅' : '❌'}
                  </div>
                  <div className="text-sm text-white">
                    {isWithinLimits ? 'SAFE' : 'UNSAFE'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Info */}
          <div className="text-white text-sm bg-slate-900 p-4 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Inputs: {legs} legs, {angle}°, {loadWeight}kg load, {slingCapacity}kg capacity, {safetyFactor}:1 safety</p>
            <p>Calculations: {angleMultiplier.toFixed(3)}x multiplier, {legTension.toFixed(0)}kg per leg, {totalCapacityRequired.toFixed(0)}kg required</p>
            <p>Status: {isWithinLimits ? 'SAFE' : 'UNSAFE'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
