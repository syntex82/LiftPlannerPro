'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calculator, AlertTriangle, CheckCircle, Info, Download } from 'lucide-react'

interface GroundBearingCalculatorProps {
  open: boolean
  onClose: () => void
}

// Ground bearing capacities in kN/m² (typical values)
const groundTypes = [
  { id: 'rock', name: 'Sound Rock', capacity: 10000, color: '#1e3a5f' },
  { id: 'gravel-dense', name: 'Dense Gravel/Sand', capacity: 600, color: '#4a5568' },
  { id: 'gravel-medium', name: 'Medium Gravel/Sand', capacity: 300, color: '#718096' },
  { id: 'gravel-loose', name: 'Loose Gravel/Sand', capacity: 100, color: '#a0aec0' },
  { id: 'clay-stiff', name: 'Stiff Clay', capacity: 300, color: '#744210' },
  { id: 'clay-firm', name: 'Firm Clay', capacity: 150, color: '#975a16' },
  { id: 'clay-soft', name: 'Soft Clay', capacity: 75, color: '#b7791f' },
  { id: 'peat', name: 'Peat/Made Ground', capacity: 25, color: '#2d3748' },
  { id: 'tarmac', name: 'Tarmac/Asphalt', capacity: 200, color: '#1a202c' },
  { id: 'concrete', name: 'Concrete (150mm)', capacity: 400, color: '#e2e8f0' },
  { id: 'custom', name: 'Custom Value', capacity: 0, color: '#805ad5' }
]

// Standard mat sizes (in mm)
const standardMats = [
  { name: '1.0m x 1.0m', width: 1000, length: 1000 },
  { name: '1.2m x 1.2m', width: 1200, length: 1200 },
  { name: '1.5m x 1.5m', width: 1500, length: 1500 },
  { name: '2.0m x 1.0m', width: 2000, length: 1000 },
  { name: '2.0m x 2.0m', width: 2000, length: 2000 },
  { name: '2.4m x 1.2m', width: 2400, length: 1200 },
  { name: '3.0m x 1.0m', width: 3000, length: 1000 },
  { name: '3.0m x 3.0m', width: 3000, length: 3000 }
]

export function GroundBearingCalculator({ open, onClose }: GroundBearingCalculatorProps) {
  // Input states
  const [outriggerLoad, setOutriggerLoad] = useState<number>(50) // tonnes
  const [selectedGround, setSelectedGround] = useState(groundTypes[2])
  const [customCapacity, setCustomCapacity] = useState<number>(300)
  const [safetyFactor, setSafetyFactor] = useState<number>(1.5)
  const [matWidth, setMatWidth] = useState<number>(1500) // mm
  const [matLength, setMatLength] = useState<number>(1500) // mm
  const [padDiameter, setPadDiameter] = useState<number>(400) // mm (outrigger pad)

  // Calculations
  const calculations = useMemo(() => {
    const groundCapacity = selectedGround.id === 'custom' ? customCapacity : selectedGround.capacity
    const loadKN = outriggerLoad * 9.81 // Convert tonnes to kN
    
    // Calculate pad area (circular outrigger pad)
    const padAreaM2 = Math.PI * Math.pow(padDiameter / 2000, 2)
    const padPressure = loadKN / padAreaM2
    
    // Calculate mat area
    const matAreaM2 = (matWidth / 1000) * (matLength / 1000)
    const matPressure = loadKN / matAreaM2
    
    // Allowable pressure with safety factor
    const allowablePressure = groundCapacity / safetyFactor
    
    // Check if mat is adequate
    const matAdequate = matPressure <= allowablePressure
    const padAdequate = padPressure <= allowablePressure
    
    // Calculate minimum mat size needed
    const minMatArea = loadKN / allowablePressure
    const minMatSide = Math.sqrt(minMatArea) * 1000 // Convert to mm
    
    // Utilization percentages
    const matUtilization = (matPressure / allowablePressure) * 100
    const padUtilization = (padPressure / allowablePressure) * 100
    
    return {
      loadKN: loadKN.toFixed(1),
      groundCapacity,
      allowablePressure: allowablePressure.toFixed(1),
      padAreaM2: padAreaM2.toFixed(3),
      padPressure: padPressure.toFixed(1),
      matAreaM2: matAreaM2.toFixed(2),
      matPressure: matPressure.toFixed(1),
      matAdequate,
      padAdequate,
      minMatSide: Math.ceil(minMatSide / 100) * 100, // Round up to nearest 100mm
      matUtilization: Math.min(matUtilization, 999).toFixed(0),
      padUtilization: Math.min(padUtilization, 999).toFixed(0)
    }
  }, [outriggerLoad, selectedGround, customCapacity, safetyFactor, matWidth, matLength, padDiameter])

  const handleSelectMat = (mat: typeof standardMats[0]) => {
    setMatWidth(mat.width)
    setMatLength(mat.length)
  }

  const exportReport = () => {
    const report = `
GROUND BEARING PRESSURE CALCULATION REPORT
==========================================
Generated: ${new Date().toLocaleString()}

INPUT DATA
----------
Outrigger Load: ${outriggerLoad} tonnes (${calculations.loadKN} kN)
Ground Type: ${selectedGround.name}
Ground Bearing Capacity: ${calculations.groundCapacity} kN/m²
Safety Factor: ${safetyFactor}
Allowable Pressure: ${calculations.allowablePressure} kN/m²

OUTRIGGER PAD (Direct on Ground)
--------------------------------
Pad Diameter: ${padDiameter} mm
Pad Area: ${calculations.padAreaM2} m²
Ground Pressure: ${calculations.padPressure} kN/m²
Utilization: ${calculations.padUtilization}%
Status: ${calculations.padAdequate ? 'ADEQUATE' : 'INADEQUATE - MAT REQUIRED'}

SPREADER MAT ANALYSIS
---------------------
Mat Size: ${matWidth}mm x ${matLength}mm
Mat Area: ${calculations.matAreaM2} m²
Ground Pressure: ${calculations.matPressure} kN/m²
Utilization: ${calculations.matUtilization}%
Status: ${calculations.matAdequate ? 'ADEQUATE' : 'INADEQUATE - LARGER MAT REQUIRED'}

RECOMMENDATION
--------------
Minimum Mat Size Required: ${calculations.minMatSide}mm x ${calculations.minMatSide}mm (square)

Note: This calculation is for guidance only. Always verify ground conditions 
on site and consult a geotechnical engineer for critical lifts.
    `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ground-bearing-calc-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            Ground Bearing Pressure Calculator
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Calculate outrigger loads, ground pressure, and determine appropriate mat sizes for safe crane operations.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Input Section */}
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700 p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" /> Load Input
              </h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-300">Outrigger Load (tonnes)</Label>
                  <Input
                    type="number"
                    value={outriggerLoad}
                    onChange={(e) => setOutriggerLoad(parseFloat(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    min={0}
                    step={1}
                  />
                  <p className="text-xs text-slate-500 mt-1">= {calculations.loadKN} kN</p>
                </div>
                <div>
                  <Label className="text-slate-300">Outrigger Pad Diameter (mm)</Label>
                  <Input
                    type="number"
                    value={padDiameter}
                    onChange={(e) => setPadDiameter(parseFloat(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    min={100}
                    step={50}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Safety Factor</Label>
                  <Input
                    type="number"
                    value={safetyFactor}
                    onChange={(e) => setSafetyFactor(parseFloat(e.target.value) || 1)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    min={1}
                    max={3}
                    step={0.1}
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-4">
              <h3 className="text-white font-semibold mb-3">Ground Type</h3>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {groundTypes.map(ground => (
                  <button
                    key={ground.id}
                    onClick={() => setSelectedGround(ground)}
                    className={`p-2 rounded text-left text-sm transition-all ${
                      selectedGround.id === ground.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <div className="font-medium">{ground.name}</div>
                    {ground.id !== 'custom' && (
                      <div className="text-xs opacity-75">{ground.capacity} kN/m²</div>
                    )}
                  </button>
                ))}
              </div>
              {selectedGround.id === 'custom' && (
                <div className="mt-3">
                  <Label className="text-slate-300">Custom Capacity (kN/m²)</Label>
                  <Input
                    type="number"
                    value={customCapacity}
                    onChange={(e) => setCustomCapacity(parseFloat(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    min={0}
                  />
                </div>
              )}
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-4">
              <h3 className="text-white font-semibold mb-3">Spreader Mat Size</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-slate-300">Width (mm)</Label>
                  <Input
                    type="number"
                    value={matWidth}
                    onChange={(e) => setMatWidth(parseFloat(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    min={100}
                    step={100}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Length (mm)</Label>
                  <Input
                    type="number"
                    value={matLength}
                    onChange={(e) => setMatLength(parseFloat(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    min={100}
                    step={100}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {standardMats.map(mat => (
                  <button
                    key={mat.name}
                    onClick={() => handleSelectMat(mat)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      matWidth === mat.width && matLength === mat.length
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {mat.name}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <Card className={`p-4 border-2 ${
              calculations.padAdequate ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'
            }`}>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                {calculations.padAdequate ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                Direct on Ground (No Mat)
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">Pad Area:</div>
                <div className="text-white">{calculations.padAreaM2} m²</div>
                <div className="text-slate-400">Ground Pressure:</div>
                <div className="text-white font-bold">{calculations.padPressure} kN/m²</div>
                <div className="text-slate-400">Allowable:</div>
                <div className="text-white">{calculations.allowablePressure} kN/m²</div>
                <div className="text-slate-400">Utilization:</div>
                <div className={`font-bold ${parseFloat(calculations.padUtilization) > 100 ? 'text-red-400' : 'text-green-400'}`}>
                  {calculations.padUtilization}%
                </div>
              </div>
              <Badge className={`mt-2 ${calculations.padAdequate ? 'bg-green-600' : 'bg-red-600'}`}>
                {calculations.padAdequate ? 'ADEQUATE' : 'MAT REQUIRED'}
              </Badge>
            </Card>

            <Card className={`p-4 border-2 ${
              calculations.matAdequate ? 'bg-green-900/30 border-green-600' : 'bg-amber-900/30 border-amber-600'
            }`}>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                {calculations.matAdequate ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                With Spreader Mat
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">Mat Size:</div>
                <div className="text-white">{matWidth}mm × {matLength}mm</div>
                <div className="text-slate-400">Mat Area:</div>
                <div className="text-white">{calculations.matAreaM2} m²</div>
                <div className="text-slate-400">Ground Pressure:</div>
                <div className="text-white font-bold">{calculations.matPressure} kN/m²</div>
                <div className="text-slate-400">Allowable:</div>
                <div className="text-white">{calculations.allowablePressure} kN/m²</div>
                <div className="text-slate-400">Utilization:</div>
                <div className={`font-bold ${parseFloat(calculations.matUtilization) > 100 ? 'text-amber-400' : 'text-green-400'}`}>
                  {calculations.matUtilization}%
                </div>
              </div>
              <Badge className={`mt-2 ${calculations.matAdequate ? 'bg-green-600' : 'bg-amber-600'}`}>
                {calculations.matAdequate ? 'ADEQUATE' : 'LARGER MAT NEEDED'}
              </Badge>
            </Card>

            <Card className="bg-blue-900/30 border-blue-600 border-2 p-4">
              <h3 className="text-white font-semibold mb-2">Recommendation</h3>
              <p className="text-slate-300 text-sm">
                Minimum square mat size required: <strong className="text-white">{calculations.minMatSide}mm × {calculations.minMatSide}mm</strong>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Based on {outriggerLoad}t load, {selectedGround.name} ground, and {safetyFactor}× safety factor.
              </p>
            </Card>

            <Button onClick={exportReport} className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" /> Export Calculation Report
            </Button>

            <p className="text-xs text-slate-500 text-center">
              ⚠️ This calculator is for guidance only. Always verify ground conditions on site.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

