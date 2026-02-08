"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { X, FileText, Loader2, Download, Package, AlertTriangle, ClipboardList, FileCheck } from "lucide-react"

interface LiftPackGeneratorProps {
  isOpen: boolean
  onClose: () => void
  projectName?: string
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
}

export default function LiftPackGenerator({ isOpen, onClose, projectName: initialProjectName, canvasRef }: LiftPackGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    projectName: initialProjectName || '',
    projectNumber: '',
    client: '',
    location: '',
    liftDescription: '',
    loadWeight: '',
    loadDimensions: '',
    craneType: '',
    riggingEquipment: '',
    liftRadius: '',
    liftHeight: '',
    groundConditions: '',
    weatherRestrictions: '',
    hazards: [] as string[],
    personnel: [] as string[],
    includeDrawing: true,
    includeRams: true,
    includeStepPlan: true,
    includeLiftPlan: true,
  })

  const hazardOptions = [
    'Overhead power lines', 'Underground services', 'Confined space', 'Working at height',
    'Moving machinery', 'Pedestrian traffic', 'Vehicle traffic', 'Adverse weather',
    'Poor ground conditions', 'Limited visibility', 'Noise', 'Manual handling',
    'Suspended loads', 'Pinch points', 'Falling objects', 'Structural instability'
  ]

  const personnelOptions = [
    'Appointed Person', 'Crane Operator', 'Slinger/Signaller', 'Banksman',
    'Site Supervisor', 'Safety Officer', 'Rigger', 'Spotter'
  ]

  if (!isOpen) return null

  const handleHazardToggle = (hazard: string) => {
    setFormData(prev => ({
      ...prev,
      hazards: prev.hazards.includes(hazard)
        ? prev.hazards.filter(h => h !== hazard)
        : [...prev.hazards, hazard]
    }))
  }

  const handlePersonnelToggle = (person: string) => {
    setFormData(prev => ({
      ...prev,
      personnel: prev.personnel.includes(person)
        ? prev.personnel.filter(p => p !== person)
        : [...prev.personnel, person]
    }))
  }

  const getDrawingDataUrl = (): string | undefined => {
    if (!canvasRef?.current || !formData.includeDrawing) return undefined
    try {
      return canvasRef.current.toDataURL('image/png', 0.9)
    } catch {
      console.error('Failed to capture canvas')
      return undefined
    }
  }

  const generateLiftPack = async () => {
    if (!formData.projectName || !formData.liftDescription || !formData.loadWeight) {
      alert('Please fill in Project Name, Lift Description, and Load Weight')
      return
    }

    setIsGenerating(true)
    try {
      const drawingDataUrl = getDrawingDataUrl()
      
      const response = await fetch('/api/ai/generate-lift-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          drawingDataUrl,
          model: 'openai'
        })
      })

      const data = await response.json()
      
      if (data.success && data.html) {
        // Open in new window
        const newWindow = window.open('', '_blank')
        if (newWindow) {
          newWindow.document.write(data.html)
          newWindow.document.close()
        } else {
          // Fallback: download as file
          const blob = new Blob([data.html], { type: 'text/html' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `LiftPack-${formData.projectName.replace(/\s+/g, '_')}-${data.documentNumber}.html`
          a.click()
          URL.revokeObjectURL(url)
        }
        onClose()
      } else {
        throw new Error(data.error || 'Failed to generate lift pack')
      }
    } catch (error) {
      console.error('Lift pack generation failed:', error)
      alert(`Failed to generate lift pack: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-4xl bg-slate-800 border-slate-700 max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-400" />
            <CardTitle className="text-white">Generate Complete Lift Pack</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-4 overflow-y-auto flex-1">
          {/* Info Banner */}
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-3 flex items-start gap-3">
            <FileCheck className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="text-sm text-orange-200">
              <strong>Complete Lift Pack</strong> combines your CAD drawing, AI-generated lift plan, 
              RAMS (Risk Assessment & Method Statement), and step-by-step execution plan into one 
              professional document ready for site use.
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Details */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" /> Project Details
              </h3>
              <div>
                <Label className="text-slate-300 text-xs">Project Name *</Label>
                <Input
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., Boiler Replacement - Unit 3"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-slate-300 text-xs">Project Number</Label>
                  <Input
                    value={formData.projectNumber}
                    onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="PRJ-001"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs">Client</Label>
                  <Input
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Client name"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Site address or area"
                />
              </div>
            </div>

            {/* Lift Details */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Lift Details
              </h3>
              <div>
                <Label className="text-slate-300 text-xs">Lift Description *</Label>
                <Textarea
                  value={formData.liftDescription}
                  onChange={(e) => setFormData({ ...formData, liftDescription: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white h-20"
                  placeholder="Describe the lift operation in detail..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-slate-300 text-xs">Load Weight *</Label>
                  <Input
                    value={formData.loadWeight}
                    onChange={(e) => setFormData({ ...formData, loadWeight: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 15 tonnes"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs">Load Dimensions</Label>
                  <Input
                    value={formData.loadDimensions}
                    onChange={(e) => setFormData({ ...formData, loadDimensions: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="L x W x H"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-slate-300 text-xs">Crane Type</Label>
                  <Input
                    value={formData.craneType}
                    onChange={(e) => setFormData({ ...formData, craneType: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 100T Mobile Crane"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs">Rigging Equipment</Label>
                  <Input
                    value={formData.riggingEquipment}
                    onChange={(e) => setFormData({ ...formData, riggingEquipment: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 4-leg chain sling"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-slate-300 text-xs">Lift Radius</Label>
                  <Input
                    value={formData.liftRadius}
                    onChange={(e) => setFormData({ ...formData, liftRadius: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 25m"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs">Lift Height</Label>
                  <Input
                    value={formData.liftHeight}
                    onChange={(e) => setFormData({ ...formData, liftHeight: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 30m"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Site Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-xs">Ground Conditions</Label>
              <Input
                value={formData.groundConditions}
                onChange={(e) => setFormData({ ...formData, groundConditions: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., Compacted hardcore, concrete pad"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Weather Restrictions</Label>
              <Input
                value={formData.weatherRestrictions}
                onChange={(e) => setFormData({ ...formData, weatherRestrictions: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., Max wind speed 25mph"
              />
            </div>
          </div>

          {/* Hazards */}
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" /> Identified Hazards
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {hazardOptions.map(hazard => (
                <label key={hazard} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-white">
                  <Checkbox
                    checked={formData.hazards.includes(hazard)}
                    onCheckedChange={() => handleHazardToggle(hazard)}
                    className="border-slate-500"
                  />
                  {hazard}
                </label>
              ))}
            </div>
          </div>

          {/* Personnel */}
          <div>
            <h3 className="text-white font-semibold mb-2">Required Personnel</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {personnelOptions.map(person => (
                <label key={person} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-white">
                  <Checkbox
                    checked={formData.personnel.includes(person)}
                    onCheckedChange={() => handlePersonnelToggle(person)}
                    className="border-slate-500"
                  />
                  {person}
                </label>
              ))}
            </div>
          </div>

          {/* Include Options */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Include in Lift Pack:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <Checkbox
                  checked={formData.includeDrawing}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeDrawing: !!checked })}
                  className="border-slate-500"
                />
                CAD Drawing
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <Checkbox
                  checked={formData.includeLiftPlan}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeLiftPlan: !!checked })}
                  className="border-slate-500"
                />
                Lift Plan
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <Checkbox
                  checked={formData.includeRams}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeRams: !!checked })}
                  className="border-slate-500"
                />
                RAMS
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <Checkbox
                  checked={formData.includeStepPlan}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeStepPlan: !!checked })}
                  className="border-slate-500"
                />
                Step Plan
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button
              onClick={generateLiftPack}
              disabled={isGenerating}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Lift Pack...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Complete Lift Pack
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

