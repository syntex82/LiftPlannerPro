"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  X, FileText, Loader2, Download, Package, AlertTriangle, ClipboardList, FileCheck,
  CheckCircle2, Circle, ChevronRight, ChevronLeft, Info, MapPin, Users, Settings, AlertCircle
} from "lucide-react"

interface LiftPackGeneratorProps {
  isOpen: boolean
  onClose: () => void
  projectName?: string
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
}

// Field tooltip descriptions
const fieldTooltips = {
  projectName: "Enter a unique name for this lift operation. This will appear on all documents and should be easily identifiable.",
  projectNumber: "Your internal project/job reference number for tracking and documentation purposes.",
  client: "The client or company this lift is being performed for. Important for liability documentation.",
  location: "Specific site address or area where the lift will take place. Include building/unit numbers if applicable.",
  liftDescription: "Detailed description of what is being lifted, why, and how. Be specific - this forms the basis of the lift plan.",
  loadWeight: "Total weight of the load including any rigging attachments. Critical for crane selection and capacity calculations.",
  loadDimensions: "Length x Width x Height of the load. Essential for clearance calculations and rigging selection.",
  craneType: "Type and capacity of crane to be used. E.g., '100T Liebherr LTM 1100', '50T Grove GMK3050'",
  riggingEquipment: "All rigging gear: slings, shackles, spreader beams, etc. Include SWL ratings where known.",
  liftRadius: "Distance from crane center pin to load hook position. Affects crane capacity significantly.",
  liftHeight: "Maximum height the load will reach. Include height to pick point and set-down point.",
  groundConditions: "Ground bearing capacity and surface type. Critical for crane outrigger setup and safety.",
  weatherRestrictions: "Wind speed limits, visibility requirements, or weather conditions that would halt the lift.",
  hazards: "Select all hazards identified in the area. More selections = better risk assessment.",
  personnel: "Select all personnel required for the lift. Minimum: Appointed Person, Crane Operator, Slinger/Signaller."
}

// Step definitions
const steps = [
  { id: 1, name: 'Project Details', icon: FileText, description: 'Basic project information' },
  { id: 2, name: 'Lift Details', icon: ClipboardList, description: 'Load and crane specifications' },
  { id: 3, name: 'Site Conditions', icon: MapPin, description: 'Ground and weather requirements' },
  { id: 4, name: 'Safety', icon: AlertTriangle, description: 'Hazards and personnel' },
  { id: 5, name: 'Review & Generate', icon: Settings, description: 'Final checks and options' }
]

export default function LiftPackGenerator({ isOpen, onClose, projectName: initialProjectName, canvasRef }: LiftPackGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
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

  // Validation logic
  const validation = useMemo(() => {
    const missing: { field: string; step: number; required: boolean }[] = []

    // Step 1: Project Details
    if (!formData.projectName.trim()) missing.push({ field: 'Project Name', step: 1, required: true })
    if (!formData.location.trim()) missing.push({ field: 'Location', step: 1, required: false })

    // Step 2: Lift Details
    if (!formData.liftDescription.trim()) missing.push({ field: 'Lift Description', step: 2, required: true })
    if (!formData.loadWeight.trim()) missing.push({ field: 'Load Weight', step: 2, required: true })
    if (!formData.craneType.trim()) missing.push({ field: 'Crane Type', step: 2, required: false })
    if (!formData.riggingEquipment.trim()) missing.push({ field: 'Rigging Equipment', step: 2, required: false })

    // Step 3: Site Conditions
    if (!formData.groundConditions.trim()) missing.push({ field: 'Ground Conditions', step: 3, required: false })

    // Step 4: Safety
    if (formData.hazards.length === 0) missing.push({ field: 'Hazards (select at least one)', step: 4, required: false })
    if (formData.personnel.length === 0) missing.push({ field: 'Personnel (select at least one)', step: 4, required: false })

    const requiredMissing = missing.filter(m => m.required)
    const recommendedMissing = missing.filter(m => !m.required)
    const canGenerate = requiredMissing.length === 0

    // Step completion status
    const stepComplete = {
      1: !!formData.projectName.trim(),
      2: !!formData.liftDescription.trim() && !!formData.loadWeight.trim(),
      3: true, // No required fields
      4: true, // No required fields
      5: true
    }

    return { missing, requiredMissing, recommendedMissing, canGenerate, stepComplete }
  }, [formData])

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
    if (!validation.canGenerate) return

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
        const newWindow = window.open('', '_blank')
        if (newWindow) {
          newWindow.document.write(data.html)
          newWindow.document.close()
        } else {
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

  // Tooltip-wrapped label component
  const TooltipLabel = ({ tooltip, children, required }: { tooltip: string; children: React.ReactNode; required?: boolean }) => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Label className="text-slate-300 text-xs flex items-center gap-1 cursor-help">
            {children}
            {required && <span className="text-red-400">*</span>}
            <Info className="w-3 h-3 text-slate-500" />
          </Label>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-slate-900 text-slate-100 border-slate-700">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-4xl bg-slate-800 border-slate-700 max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700 shrink-0 pb-2">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-400" />
            <div>
              <CardTitle className="text-white text-lg">Generate Complete Lift Pack</CardTitle>
              <p className="text-xs text-slate-400">Step {currentStep} of 5: {steps[currentStep - 1].name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        {/* Step Progress Indicator */}
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                    currentStep === step.id
                      ? 'bg-orange-500/20 text-orange-400'
                      : validation.stepComplete[step.id as keyof typeof validation.stepComplete]
                        ? 'text-green-400 hover:bg-slate-700'
                        : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {validation.stepComplete[step.id as keyof typeof validation.stepComplete] && currentStep !== step.id ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <step.icon className={`w-5 h-5 ${currentStep === step.id ? 'text-orange-400' : ''}`} />
                  )}
                  <span className="hidden md:inline text-sm font-medium">{step.name}</span>
                </button>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-600 mx-1" />
                )}
              </div>
            ))}
          </div>
          {/* Progress Bar */}
          <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        <CardContent className="space-y-4 p-4 overflow-y-auto flex-1">
          {/* Missing Fields Warning - Always visible if there are issues */}
          {validation.requiredMissing.length > 0 && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="text-red-300">Required fields missing ({validation.requiredMissing.length}):</strong>
                <ul className="mt-1 text-red-200 list-disc list-inside">
                  {validation.requiredMissing.map(m => (
                    <li key={m.field}>
                      {m.field}
                      <button
                        onClick={() => setCurrentStep(m.step)}
                        className="ml-1 text-red-400 hover:text-red-300 underline"
                      >
                        (Step {m.step})
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {validation.recommendedMissing.length > 0 && currentStep === 5 && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="text-yellow-300">Recommended fields ({validation.recommendedMissing.length}):</strong>
                <p className="text-yellow-200/80 mt-0.5">These fields improve the quality of your lift pack:</p>
                <ul className="mt-1 text-yellow-200/70 list-disc list-inside">
                  {validation.recommendedMissing.slice(0, 4).map(m => (
                    <li key={m.field}>
                      {m.field}
                      <button
                        onClick={() => setCurrentStep(m.step)}
                        className="ml-1 text-yellow-400 hover:text-yellow-300 underline"
                      >
                        (Step {m.step})
                      </button>
                    </li>
                  ))}
                  {validation.recommendedMissing.length > 4 && (
                    <li>...and {validation.recommendedMissing.length - 4} more</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-200">
                  <strong>Project Details:</strong> Enter the basic information about this lift operation.
                  The project name is used to identify this document and should be unique.
                </p>
              </div>

              <div>
                <TooltipLabel tooltip={fieldTooltips.projectName} required>Project Name</TooltipLabel>
                <Input
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className={`bg-slate-700 border-slate-600 text-white ${!formData.projectName.trim() ? 'border-red-500/50' : ''}`}
                  placeholder="e.g., Boiler Replacement - Unit 3"
                />
                {!formData.projectName.trim() && (
                  <p className="text-xs text-red-400 mt-1">Required - Enter a project name</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <TooltipLabel tooltip={fieldTooltips.projectNumber}>Project Number</TooltipLabel>
                  <Input
                    value={formData.projectNumber}
                    onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., PRJ-2024-001"
                  />
                </div>
                <div>
                  <TooltipLabel tooltip={fieldTooltips.client}>Client</TooltipLabel>
                  <Input
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., Shell UK Limited"
                  />
                </div>
              </div>

              <div>
                <TooltipLabel tooltip={fieldTooltips.location}>Location</TooltipLabel>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., Unit 3, Stanlow Refinery, Ellesmere Port"
                />
              </div>
            </div>
          )}

          {/* Step 2: Lift Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-200">
                  <strong>Lift Details:</strong> Provide the technical specifications for the lift.
                  Accurate weight and dimensions are critical for safe crane selection.
                </p>
              </div>

              <div>
                <TooltipLabel tooltip={fieldTooltips.liftDescription} required>Lift Description</TooltipLabel>
                <Textarea
                  value={formData.liftDescription}
                  onChange={(e) => setFormData({ ...formData, liftDescription: e.target.value })}
                  className={`bg-slate-700 border-slate-600 text-white h-24 ${!formData.liftDescription.trim() ? 'border-red-500/50' : ''}`}
                  placeholder="e.g., Removal of existing heat exchanger E-101 from structure level +15m to ground level. Single lift operation using spreader beam. Load to be placed on transport trailer."
                />
                {!formData.liftDescription.trim() && (
                  <p className="text-xs text-red-400 mt-1">Required - Describe what is being lifted and how</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <TooltipLabel tooltip={fieldTooltips.loadWeight} required>Load Weight</TooltipLabel>
                  <Input
                    value={formData.loadWeight}
                    onChange={(e) => setFormData({ ...formData, loadWeight: e.target.value })}
                    className={`bg-slate-700 border-slate-600 text-white ${!formData.loadWeight.trim() ? 'border-red-500/50' : ''}`}
                    placeholder="e.g., 15.5 tonnes (incl. rigging)"
                  />
                  {!formData.loadWeight.trim() && (
                    <p className="text-xs text-red-400 mt-1">Required</p>
                  )}
                </div>
                <div>
                  <TooltipLabel tooltip={fieldTooltips.loadDimensions}>Load Dimensions</TooltipLabel>
                  <Input
                    value={formData.loadDimensions}
                    onChange={(e) => setFormData({ ...formData, loadDimensions: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 8m L x 2.5m W x 3m H"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <TooltipLabel tooltip={fieldTooltips.craneType}>Crane Type</TooltipLabel>
                  <Input
                    value={formData.craneType}
                    onChange={(e) => setFormData({ ...formData, craneType: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 100T Liebherr LTM 1100-4.2"
                  />
                </div>
                <div>
                  <TooltipLabel tooltip={fieldTooltips.riggingEquipment}>Rigging Equipment</TooltipLabel>
                  <Input
                    value={formData.riggingEquipment}
                    onChange={(e) => setFormData({ ...formData, riggingEquipment: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 4-leg chain sling 10T SWL, 6m spreader beam"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <TooltipLabel tooltip={fieldTooltips.liftRadius}>Lift Radius</TooltipLabel>
                  <Input
                    value={formData.liftRadius}
                    onChange={(e) => setFormData({ ...formData, liftRadius: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 25m at pick, 18m at set"
                  />
                </div>
                <div>
                  <TooltipLabel tooltip={fieldTooltips.liftHeight}>Lift Height</TooltipLabel>
                  <Input
                    value={formData.liftHeight}
                    onChange={(e) => setFormData({ ...formData, liftHeight: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 20m hook height required"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Site Conditions */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-200">
                  <strong>Site Conditions:</strong> Ground conditions affect crane stability and outrigger setup.
                  Weather restrictions define safe operating limits.
                </p>
              </div>

              <div>
                <TooltipLabel tooltip={fieldTooltips.groundConditions}>Ground Conditions</TooltipLabel>
                <Textarea
                  value={formData.groundConditions}
                  onChange={(e) => setFormData({ ...formData, groundConditions: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white h-20"
                  placeholder="e.g., Crane to set up on existing concrete hardstanding. Ground bearing pressure confirmed at 40T/m². Outrigger mats required at all corners."
                />
              </div>

              <div>
                <TooltipLabel tooltip={fieldTooltips.weatherRestrictions}>Weather Restrictions</TooltipLabel>
                <Textarea
                  value={formData.weatherRestrictions}
                  onChange={(e) => setFormData({ ...formData, weatherRestrictions: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white h-20"
                  placeholder="e.g., Lift to be aborted if wind speed exceeds 25mph (measured at hook height). No operations in heavy rain, fog (visibility <50m), or lightning."
                />
              </div>
            </div>
          )}

          {/* Step 4: Safety (Hazards & Personnel) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-200">
                  <strong>Safety:</strong> Identify all hazards present in the work area and select the required personnel.
                  This information feeds directly into the RAMS document.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <TooltipLabel tooltip={fieldTooltips.hazards}>Identified Hazards</TooltipLabel>
                  {formData.hazards.length > 0 && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
                      {formData.hazards.length} selected
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-700/30 rounded-lg p-3">
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
                {formData.hazards.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-2">Recommended: Select at least one hazard for a complete risk assessment</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-blue-400" />
                  <TooltipLabel tooltip={fieldTooltips.personnel}>Required Personnel</TooltipLabel>
                  {formData.personnel.length > 0 && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                      {formData.personnel.length} selected
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-700/30 rounded-lg p-3">
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
                {formData.personnel.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-2">Recommended: Select at least Appointed Person, Crane Operator, and Slinger/Signaller</p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review & Generate */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-200">
                  <strong>Review & Generate:</strong> Review your entries below and select which documents to include.
                  {validation.canGenerate ? (
                    <span className="block mt-1 text-green-300">✓ All required fields complete - ready to generate!</span>
                  ) : (
                    <span className="block mt-1 text-red-300">✗ Please complete all required fields before generating.</span>
                  )}
                </p>
              </div>

              {/* Summary */}
              <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                <h4 className="text-white font-semibold">Summary</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-slate-400">Project:</div>
                  <div className="text-white">{formData.projectName || <span className="text-red-400">Not set</span>}</div>
                  <div className="text-slate-400">Load:</div>
                  <div className="text-white">{formData.loadWeight || <span className="text-red-400">Not set</span>}</div>
                  <div className="text-slate-400">Crane:</div>
                  <div className="text-white">{formData.craneType || <span className="text-slate-500">Not specified</span>}</div>
                  <div className="text-slate-400">Location:</div>
                  <div className="text-white">{formData.location || <span className="text-slate-500">Not specified</span>}</div>
                  <div className="text-slate-400">Hazards:</div>
                  <div className="text-white">{formData.hazards.length > 0 ? `${formData.hazards.length} identified` : <span className="text-yellow-400">None selected</span>}</div>
                  <div className="text-slate-400">Personnel:</div>
                  <div className="text-white">{formData.personnel.length > 0 ? `${formData.personnel.length} assigned` : <span className="text-yellow-400">None selected</span>}</div>
                </div>
              </div>

              {/* Include Options */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Include in Lift Pack:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white">
                          <Checkbox
                            checked={formData.includeDrawing}
                            onCheckedChange={(checked) => setFormData({ ...formData, includeDrawing: !!checked })}
                            className="border-slate-500"
                          />
                          📐 CAD Drawing
                        </label>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-slate-100 border-slate-700">
                        <p className="text-xs">Embeds your current CAD drawing in the document</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white">
                          <Checkbox
                            checked={formData.includeLiftPlan}
                            onCheckedChange={(checked) => setFormData({ ...formData, includeLiftPlan: !!checked })}
                            className="border-slate-500"
                          />
                          📋 Lift Plan
                        </label>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-slate-100 border-slate-700">
                        <p className="text-xs">Detailed lift plan with crane selection, rigging, and calculations</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white">
                          <Checkbox
                            checked={formData.includeRams}
                            onCheckedChange={(checked) => setFormData({ ...formData, includeRams: !!checked })}
                            className="border-slate-500"
                          />
                          ⚠️ RAMS
                        </label>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-slate-100 border-slate-700">
                        <p className="text-xs">Risk Assessment and Method Statement</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white">
                          <Checkbox
                            checked={formData.includeStepPlan}
                            onCheckedChange={(checked) => setFormData({ ...formData, includeStepPlan: !!checked })}
                            className="border-slate-500"
                          />
                          📝 Step Plan
                        </label>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-slate-100 border-slate-700">
                        <p className="text-xs">Step-by-step execution timeline with responsibilities</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
              className="border-slate-600 text-slate-300"
            >
              {currentStep > 1 ? (
                <>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </>
              ) : 'Cancel'}
            </Button>

            <div className="flex gap-2">
              {currentStep < 5 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={generateLiftPack}
                  disabled={isGenerating || !validation.canGenerate}
                  className={`text-white ${
                    validation.canGenerate
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-slate-600 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Lift Pack
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

