"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calculator, Download, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TensionResult {
  legTension: number
  angleMultiplier: number
  totalCapacityRequired: number
  safetyFactor: number
  isWithinLimits: boolean
  recommendations: string[]
}

interface SlingConfiguration {
  legs: number
  angle: number
  loadWeight: number
  slingCapacity: number
  safetyFactor: number
  units: 'metric' | 'imperial'
}

export default function TensionCalculator() {
  const [config, setConfig] = useState<SlingConfiguration>({
    legs: 2,
    angle: 60,
    loadWeight: 1000,
    slingCapacity: 1000,
    safetyFactor: 6,
    units: 'metric'
  })

  const [result, setResult] = useState<TensionResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const calculateTension = () => {
    console.log('calculateTension called with config:', config)

    const { legs, angle, loadWeight, slingCapacity, safetyFactor } = config

    // Validate inputs - allow 0 but not null/undefined
    if (angle === null || angle === undefined ||
        loadWeight === null || loadWeight === undefined ||
        slingCapacity === null || slingCapacity === undefined ||
        legs === null || legs === undefined) {
      console.log('Missing required inputs:', { angle, loadWeight, slingCapacity, legs })
      return
    }

    try {
      // Convert angle to radians
      const angleRad = (angle * Math.PI) / 180

      // Calculate angle multiplier (tension factor)
      const angleMultiplier = 1 / (2 * Math.sin(angleRad / 2))

      // Calculate tension in each leg
      const legTension = (loadWeight * angleMultiplier) / legs

      // Calculate total capacity required
      const totalCapacityRequired = legTension * safetyFactor

      // Check if within safe limits
      const isWithinLimits = totalCapacityRequired <= slingCapacity

      // Generate recommendations
      const recommendations: string[] = []

      if (angle < 30) {
        recommendations.push("⚠️ Sling angle too shallow - increases tension significantly")
      }
      if (angle > 120) {
        recommendations.push("⚠️ Sling angle too wide - reduces load stability")
      }
      if (angleMultiplier > 2) {
        recommendations.push("🔴 High angle multiplier - consider increasing sling angle")
      }
      if (!isWithinLimits) {
        recommendations.push("🚨 UNSAFE: Tension exceeds sling capacity")
      }
      if (safetyFactor < 5) {
        recommendations.push("⚠️ Safety factor below recommended minimum (5:1)")
      }
      if (isWithinLimits && angle >= 45 && angle <= 90) {
        recommendations.push("✅ Configuration within safe parameters")
      }

      const newResult = {
        legTension,
        angleMultiplier,
        totalCapacityRequired,
        safetyFactor,
        isWithinLimits,
        recommendations
      }

      console.log('Setting result:', newResult)
      setResult(newResult)

    } catch (error) {
      console.error('Error in calculation:', error)
    }
  }

  // Calculate tension when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateTension()
    }, 100)
    return () => clearTimeout(timer)
  }, [config.legs, config.angle, config.loadWeight, config.slingCapacity, config.safetyFactor])

  const getAngleMultiplierTable = () => {
    const angles = [30, 45, 60, 90, 120]
    return angles.map(angle => {
      const angleRad = (angle * Math.PI) / 180
      const multiplier = 1 / (2 * Math.sin(angleRad / 2))
      return { angle, multiplier }
    })
  }

  const generateProfessionalHTML = () => {
    if (!result) return ''

    const { legs, angle, loadWeight, slingCapacity, safetyFactor, units } = config
    const weightUnit = units === 'metric' ? 'kg' : 'lbs'
    const timestamp = new Date().toLocaleString()
    const date = new Date().toLocaleDateString()

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chainblock Tension Calculation Report</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .header h2 {
            color: #64748b;
            margin: 5px 0 0 0;
            font-size: 16px;
            font-weight: normal;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h3 {
            color: #1e40af;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .config-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        .config-item {
            background: #f8fafc;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
        }
        .config-label {
            font-weight: bold;
            color: #475569;
            font-size: 14px;
        }
        .config-value {
            font-size: 18px;
            color: #1e293b;
            margin-top: 2px;
        }
        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .result-card {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 2px solid #e2e8f0;
        }
        .result-value {
            font-size: 24px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 5px;
        }
        .result-label {
            font-size: 14px;
            color: #64748b;
        }
        .status-safe {
            background: #dcfce7;
            border-color: #16a34a;
            color: #15803d;
        }
        .status-unsafe {
            background: #fef2f2;
            border-color: #dc2626;
            color: #dc2626;
        }
        .recommendations {
            background: #fffbeb;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
        }
        .recommendations h4 {
            color: #92400e;
            margin-top: 0;
        }
        .recommendations ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .recommendations li {
            margin-bottom: 5px;
            color: #78350f;
        }
        .reference-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .reference-table th,
        .reference-table td {
            border: 1px solid #e2e8f0;
            padding: 10px;
            text-align: center;
        }
        .reference-table th {
            background: #f1f5f9;
            color: #1e40af;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
        .warning {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .warning h4 {
            color: #dc2626;
            margin-top: 0;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CHAINBLOCK TENSION CALCULATION REPORT</h1>
            <h2>Professional Rigging Analysis</h2>
            <p><strong>Generated:</strong> ${timestamp}</p>
        </div>

        <div class="section">
            <h3>Configuration Parameters</h3>
            <div class="config-grid">
                <div class="config-item">
                    <div class="config-label">Number of Legs</div>
                    <div class="config-value">${legs}</div>
                </div>
                <div class="config-item">
                    <div class="config-label">Sling Angle</div>
                    <div class="config-value">${angle}°</div>
                </div>
                <div class="config-item">
                    <div class="config-label">Load Weight</div>
                    <div class="config-value">${loadWeight.toLocaleString()} ${weightUnit}</div>
                </div>
                <div class="config-item">
                    <div class="config-label">Sling Capacity</div>
                    <div class="config-value">${slingCapacity.toLocaleString()} ${weightUnit}</div>
                </div>
                <div class="config-item">
                    <div class="config-label">Safety Factor</div>
                    <div class="config-value">${safetyFactor}:1</div>
                </div>
                <div class="config-item">
                    <div class="config-label">Units</div>
                    <div class="config-value">${units === 'metric' ? 'Metric' : 'Imperial'}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Calculation Results</h3>
            <div class="results-grid">
                <div class="result-card">
                    <div class="result-value">${result.angleMultiplier.toFixed(3)}x</div>
                    <div class="result-label">Angle Multiplier</div>
                </div>
                <div class="result-card">
                    <div class="result-value">${result.legTension.toFixed(0)}</div>
                    <div class="result-label">Tension per Leg (${weightUnit})</div>
                </div>
                <div class="result-card">
                    <div class="result-value">${result.totalCapacityRequired.toFixed(0)}</div>
                    <div class="result-label">Required Capacity (${weightUnit})</div>
                </div>
                <div class="result-card ${result.isWithinLimits ? 'status-safe' : 'status-unsafe'}">
                    <div class="result-value">${result.isWithinLimits ? '✅ SAFE' : '❌ UNSAFE'}</div>
                    <div class="result-label">Safety Status</div>
                </div>
            </div>
        </div>

        ${!result.isWithinLimits ? `
        <div class="warning">
            <h4>⚠️ SAFETY WARNING</h4>
            <p><strong>This configuration exceeds safe working limits.</strong> Do not proceed with this rigging setup. Review load requirements, increase sling capacity, or modify the configuration.</p>
        </div>
        ` : ''}

        <div class="section">
            <h3>Recommendations</h3>
            <div class="recommendations">
                <h4>Professional Analysis</h4>
                <ul>
                    ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="section">
            <h3>Angle Multiplier Reference</h3>
            <table class="reference-table">
                <thead>
                    <tr>
                        <th>Sling Angle</th>
                        <th>Multiplier</th>
                        <th>Tension Factor</th>
                    </tr>
                </thead>
                <tbody>
                    ${getAngleMultiplierTable().map(({ angle, multiplier }) => `
                    <tr>
                        <td>${angle}°</td>
                        <td>${multiplier.toFixed(3)}x</td>
                        <td>${multiplier < 1 ? 'Reduced' : multiplier > 1.5 ? 'High' : 'Standard'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p><strong>Lift Planner Pro - Professional Rigging Software</strong></p>
            <p>Generated on ${date} | DarkSpace Software & Security</p>
            <p><em>This calculation is for guidance only. Always consult qualified lifting engineers and follow local regulations.</em></p>
        </div>
    </div>
</body>
</html>
    `
  }

  const exportToHTML = () => {
    if (!result) return

    const htmlContent = generateProfessionalHTML()
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tension_calculation_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToPDF = async () => {
    if (!result) return

    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF('p', 'mm', 'a4')

      const { legs, angle, loadWeight, slingCapacity, safetyFactor, units } = config
      const weightUnit = units === 'metric' ? 'kg' : 'lbs'

      // Header
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('CHAINBLOCK TENSION CALCULATION', 105, 20, { align: 'center' })
      doc.setFontSize(16)
      doc.text('Professional Rigging Analysis', 105, 30, { align: 'center' })

      let yPos = 50

      // Configuration Section
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('CONFIGURATION PARAMETERS', 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Number of legs: ${legs}`, 20, yPos)
      doc.text(`Sling angle: ${angle}°`, 110, yPos)
      yPos += 6
      doc.text(`Load weight: ${loadWeight.toLocaleString()} ${weightUnit}`, 20, yPos)
      doc.text(`Sling capacity: ${slingCapacity.toLocaleString()} ${weightUnit}`, 110, yPos)
      yPos += 6
      doc.text(`Safety factor: ${safetyFactor}:1`, 20, yPos)
      doc.text(`Units: ${units === 'metric' ? 'Metric' : 'Imperial'}`, 110, yPos)
      yPos += 15

      // Results Section
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('CALCULATION RESULTS', 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Angle multiplier: ${result.angleMultiplier.toFixed(3)}x`, 20, yPos)
      doc.text(`Tension per leg: ${result.legTension.toFixed(0)} ${weightUnit}`, 110, yPos)
      yPos += 6
      doc.text(`Required capacity: ${result.totalCapacityRequired.toFixed(0)} ${weightUnit}`, 20, yPos)

      // Safety Status
      doc.setFont('helvetica', 'bold')
      if (result.isWithinLimits) {
        doc.setTextColor(0, 128, 0)
        doc.text('STATUS: SAFE ✓', 110, yPos)
      } else {
        doc.setTextColor(255, 0, 0)
        doc.text('STATUS: UNSAFE ✗', 110, yPos)
      }
      doc.setTextColor(0, 0, 0)
      yPos += 15

      // Safety Warning
      if (!result.isWithinLimits) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 0, 0)
        doc.text('⚠ SAFETY WARNING', 20, yPos)
        yPos += 8
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('This configuration exceeds safe working limits.', 20, yPos)
        yPos += 5
        doc.text('Do not proceed with this rigging setup.', 20, yPos)
        doc.setTextColor(0, 0, 0)
        yPos += 15
      }

      // Recommendations
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('RECOMMENDATIONS', 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      result.recommendations.forEach(rec => {
        const cleanRec = rec.replace(/[⚠️🔴🚨✅]/g, '').trim()
        doc.text(`• ${cleanRec}`, 25, yPos)
        yPos += 5
      })
      yPos += 10

      // Angle Reference Table
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('ANGLE MULTIPLIER REFERENCE', 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Angle', 30, yPos)
      doc.text('Multiplier', 70, yPos)
      doc.text('Effect', 120, yPos)
      yPos += 5

      doc.setFont('helvetica', 'normal')
      getAngleMultiplierTable().forEach(({ angle, multiplier }) => {
        doc.text(`${angle}°`, 30, yPos)
        doc.text(`${multiplier.toFixed(3)}x`, 70, yPos)
        doc.text(multiplier > 1.5 ? 'High tension' : multiplier < 1 ? 'Reduced' : 'Standard', 120, yPos)
        yPos += 5
      })

      // Footer
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.text('Generated by Lift Planner Pro - DarkSpace Software & Security', 105, 280, { align: 'center' })
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' })
      doc.text('This calculation is for guidance only. Consult qualified engineers.', 105, 290, { align: 'center' })

      // Save PDF
      doc.save(`tension_calculation_${new Date().toISOString().split('T')[0]}.pdf`)

    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('PDF generation failed. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calculator className="w-5 h-5" />
            Chainblock Tension Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Number of Legs</Label>
              <Select value={config.legs.toString()} onValueChange={(value) => 
                setConfig(prev => ({ ...prev, legs: parseInt(value) }))
              }>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="1">1 Leg (Vertical)</SelectItem>
                  <SelectItem value="2">2 Legs</SelectItem>
                  <SelectItem value="3">3 Legs</SelectItem>
                  <SelectItem value="4">4 Legs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Sling Angle (degrees)</Label>
              <Input
                type="number"
                min="15"
                max="180"
                value={config.angle}
                onChange={(e) => setConfig(prev => ({ ...prev, angle: parseFloat(e.target.value) || 0 }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Units</Label>
              <Select value={config.units} onValueChange={(value: 'metric' | 'imperial') => 
                setConfig(prev => ({ ...prev, units: value }))
              }>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="metric">Metric (kg)</SelectItem>
                  <SelectItem value="imperial">Imperial (lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">
                Load Weight ({config.units === 'metric' ? 'kg' : 'lbs'})
              </Label>
              <Input
                type="number"
                min="1"
                value={config.loadWeight}
                onChange={(e) => setConfig(prev => ({ ...prev, loadWeight: parseFloat(e.target.value) || 0 }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">
                Sling Capacity ({config.units === 'metric' ? 'kg' : 'lbs'})
              </Label>
              <Input
                type="number"
                min="1"
                value={config.slingCapacity}
                onChange={(e) => setConfig(prev => ({ ...prev, slingCapacity: parseFloat(e.target.value) || 0 }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Safety Factor</Label>
              <Select value={config.safetyFactor.toString()} onValueChange={(value) => 
                setConfig(prev => ({ ...prev, safetyFactor: parseFloat(value) }))
              }>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="4">4:1 (Minimum)</SelectItem>
                  <SelectItem value="5">5:1 (Recommended)</SelectItem>
                  <SelectItem value="6">6:1 (Standard)</SelectItem>
                  <SelectItem value="8">8:1 (High Safety)</SelectItem>
                  <SelectItem value="10">10:1 (Critical Loads)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Manual Calculate Button */}
          <div className="flex justify-center">
            <Button onClick={calculateTension} className="bg-green-600 hover:bg-green-700">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Tension
            </Button>
          </div>

          {/* Results Display */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {result.angleMultiplier.toFixed(3)}x
                      </div>
                      <div className="text-sm text-slate-300">Angle Multiplier</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {result.legTension.toFixed(0)}
                      </div>
                      <div className="text-sm text-slate-300">
                        Tension per Leg ({config.units === 'metric' ? 'kg' : 'lbs'})
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {result.totalCapacityRequired.toFixed(0)}
                      </div>
                      <div className="text-sm text-slate-300">
                        Required Capacity ({config.units === 'metric' ? 'kg' : 'lbs'})
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-2 ${result.isWithinLimits ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {result.isWithinLimits ? '✅' : '❌'}
                      </div>
                      <div className="text-sm text-white">
                        {result.isWithinLimits ? 'SAFE' : 'UNSAFE'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Safety Alerts */}
              {!result.isWithinLimits && (
                <Alert className="border-red-600 bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    <strong>DANGER:</strong> The calculated tension exceeds the sling capacity. 
                    Do not proceed with this configuration.
                  </AlertDescription>
                </Alert>
              )}

              {/* Recommendations */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setShowDetails(!showDetails)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
                <Button
                  onClick={exportToHTML}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export HTML
                </Button>
                <Button
                  onClick={exportToPDF}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>

              {/* Detailed Information */}
              {showDetails && (
                <div className="space-y-4">
                  {/* Angle Multiplier Reference Table */}
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Angle Multiplier Reference</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {getAngleMultiplierTable().map(({ angle, multiplier }) => (
                          <div key={angle} className="text-center p-3 bg-slate-800 rounded">
                            <div className="text-lg font-bold text-white">{angle}°</div>
                            <div className="text-sm text-slate-300">{multiplier.toFixed(3)}x</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-sm text-slate-400">
                        <strong>Note:</strong> As the sling angle decreases, the tension multiplier increases significantly.
                        Optimal angles are between 45° and 90°.
                      </div>
                    </CardContent>
                  </Card>

                  {/* Safety Guidelines */}
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Safety Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold text-white mb-2">Recommended Angles:</h4>
                          <ul className="space-y-1 text-slate-300">
                            <li>• <span className="text-green-400">45° - 90°:</span> Optimal range</li>
                            <li>• <span className="text-yellow-400">30° - 45°:</span> Acceptable with caution</li>
                            <li>• <span className="text-red-400">&lt; 30°:</span> Dangerous - avoid</li>
                            <li>• <span className="text-red-400">&gt; 120°:</span> Unstable - avoid</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">Safety Factors:</h4>
                          <ul className="space-y-1 text-slate-300">
                            <li>• <span className="text-green-400">6:1 or higher:</span> Standard practice</li>
                            <li>• <span className="text-yellow-400">5:1:</span> Minimum recommended</li>
                            <li>• <span className="text-red-400">4:1:</span> Regulatory minimum</li>
                            <li>• <span className="text-blue-400">10:1:</span> Critical/personnel loads</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Calculation Formula */}
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Calculation Formula</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm text-slate-300">
                        <div>
                          <strong className="text-white">Angle Multiplier:</strong>
                          <div className="font-mono bg-slate-800 p-2 rounded mt-1">
                            Multiplier = 1 / (2 × sin(angle/2))
                          </div>
                        </div>
                        <div>
                          <strong className="text-white">Tension per Leg:</strong>
                          <div className="font-mono bg-slate-800 p-2 rounded mt-1">
                            Tension = (Load Weight × Angle Multiplier) / Number of Legs
                          </div>
                        </div>
                        <div>
                          <strong className="text-white">Required Capacity:</strong>
                          <div className="font-mono bg-slate-800 p-2 rounded mt-1">
                            Required = Tension per Leg × Safety Factor
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
