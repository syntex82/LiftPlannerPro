"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface LiftPlanningAIProps {
  isOpen: boolean
  onClose: () => void
}

const LIFT_METHODS = [
  { id: 'mobile', label: 'A. Mobile Crane', icon: '🏗️' },
  { id: 'crawler', label: 'B. Crawler Crane', icon: '🚜' },
  { id: 'tower', label: 'C. Tower Crane', icon: '🏢' },
  { id: 'gantry', label: 'D. Gantry / A-Frame', icon: '⚙️' },
  { id: 'forklift', label: 'E. Forklift / Telehandler', icon: '🚛' },
  { id: 'hydraulic', label: 'F. Hydraulic Jacking or Skidding', icon: '⚡' },
  { id: 'other', label: 'G. Other Mechanical System', icon: '🔧' },
]

export default function LiftPlanningAI({ isOpen, onClose }: LiftPlanningAIProps) {
  const [step, setStep] = useState<'method' | 'details' | 'report'>('method')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Form data - Comprehensive lift planning inputs
  const [formData, setFormData] = useState({
    // Project Information
    jobName: '',
    projectLocation: '',
    clientName: '',
    contractorName: '',
    planningDate: new Date().toISOString().split('T')[0],
    plannedLiftDate: '',

    // Load Specifications
    loadDescription: '',
    loadWeight: '',
    loadWeightUnit: 'kg',
    loadLength: '',
    loadWidth: '',
    loadHeight: '',
    cogOffsetX: '',
    cogOffsetY: '',
    cogOffsetZ: '',
    loadType: 'general', // general, machinery, structural, hazmat

    // Lifting Equipment
    equipmentType: '',
    equipmentCapacity: '',
    equipmentCapacityUnit: 'tonnes',
    equipmentManufacturer: '',
    equipmentModel: '',
    equipmentCertification: '',

    // Rigging & Slings
    slingType: '', // wire rope, synthetic, chain, etc
    slingCount: '',
    slingCapacity: '',
    slingAngle: '',
    riggingConfiguration: '', // 2-leg, 4-leg, spreader bar, etc
    spreaderBarLength: '',

    // Lift Geometry
    pickRadius: '',
    setRadius: '',
    pickHeight: '',
    setHeight: '',
    liftDistance: '',
    swingAngle: '',

    // Site Conditions
    groundType: '', // concrete, asphalt, soil, etc
    groundBearing: '',
    groundBearingUnit: 'kPa',
    groundPreparation: '',
    accessRestrictions: '',

    // Environmental Conditions
    windSpeed: '',
    windSpeedUnit: 'km/h',
    temperature: '',
    weatherConditions: '',
    visibility: '',

    // Safety & Compliance
    exclusionZoneRadius: '',
    personnelCount: '',
    spotterRequired: '',
    communicationMethod: '',
    emergencyProcedures: '',

    // Risk Assessment
    hazardsIdentified: '',
    mitigationMeasures: '',
    insuranceDetails: '',

    // Additional Information
    specialRequirements: '',
    previousLiftExperience: '',
    additionalNotes: '',
  })

  const [report, setReport] = useState('')
  const [aiModel, setAiModel] = useState<'huggingface' | 'openai' | 'deepseek'>('huggingface')

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    setStep('details')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // NEW: Generate HTML lift plan with AI
  const generateAILiftPlan = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-lift-plan-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, model: aiModel })
      })

      const data = await response.json()
      if (data.success && data.html) {
        // Open HTML in new window
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
          a.download = `lift-plan-${formData.jobName?.replace(/\s+/g, '_') || 'document'}-${Date.now()}.html`
          a.click()
          URL.revokeObjectURL(url)
        }
        setReport('HTML Generated Successfully')
        setStep('report')
      } else {
        throw new Error(data.error || 'Failed to generate lift plan')
      }
    } catch (error) {
      console.error('AI generation failed:', error)
      alert(`Failed to generate lift plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateReport = async () => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf')

      const methodLabel = LIFT_METHODS.find(m => m.id === selectedMethod)?.label || 'Unknown'

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      let yPosition = 15
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 12
      const contentWidth = pageWidth - (margin * 2)

      // Color scheme
      const colors = {
        primary: { r: 25, g: 118, b: 210 },      // Blue
        secondary: { r: 56, g: 142, b: 60 },     // Green
        accent: { r: 251, g: 140, b: 0 },        // Orange
        dark: { r: 33, g: 33, b: 33 },           // Dark gray
        light: { r: 245, g: 245, b: 245 },       // Light gray
        border: { r: 189, g: 189, b: 189 },      // Border gray
      }

      // Helper function to add section header with background
      const addSectionHeader = (title: string, number: number) => {
        checkPageBreak(12)
        // Background rectangle
        pdf.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
        pdf.rect(margin, yPosition - 4, contentWidth, 8, 'F')

        // Text
        pdf.setFont("Helvetica", 'bold')
        pdf.setFontSize(11)
        pdf.setTextColor(255, 255, 255)
        pdf.text(`${number}. ${title}`, margin + 2, yPosition + 2)
        pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
        yPosition += 10
        return yPosition
      }

      // Helper function to add text with wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 9, isBold: boolean = false) => {
        pdf.setFontSize(fontSize)
        pdf.setFont("Helvetica", isBold ? 'bold' : 'normal')
        const lines = pdf.splitTextToSize(text, maxWidth)
        pdf.text(lines, x, y)
        return y + (lines.length * 4.5)
      }

      // Helper function to add key-value pair
      const addKeyValue = (key: string, value: string) => {
        pdf.setFont("Helvetica", 'bold')
        pdf.setFontSize(9)
        pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
        pdf.text(`${key}:`, margin + 2, yPosition)

        pdf.setFont("Helvetica", 'normal')
        pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
        const valueLines = pdf.splitTextToSize(value || 'Not specified', contentWidth - 40)
        pdf.text(valueLines, margin + 50, yPosition)

        return yPosition + Math.max(5, valueLines.length * 4.5)
      }

      // Helper function to check page break
      const checkPageBreak = (neededSpace: number) => {
        if (yPosition + neededSpace > pageHeight - 15) {
          // Add footer to current page
          pdf.setFontSize(7)
          pdf.setFont("Helvetica", 'italic')
          pdf.setTextColor(150, 150, 150)
          pdf.text(`Page ${pdf.internal.pages.length - 1}`, pageWidth - margin - 10, pageHeight - 8)

          pdf.addPage()
          yPosition = 15

          // Add header to new page
          pdf.setFontSize(8)
          pdf.setFont("Helvetica", 'normal')
          pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
          pdf.text('LIFT PLAN REPORT (Continued)', margin, yPosition)
          yPosition += 8
        }
      }

      // ===== HEADER PAGE =====
      // Company branding area
      pdf.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b)
      pdf.rect(0, 0, pageWidth, 25, 'F')

      pdf.setFont("Helvetica", 'bold')
      pdf.setFontSize(20)
      pdf.setTextColor(255, 255, 255)
      pdf.text('LIFT PLANNER PRO', margin, 12)

      pdf.setFontSize(10)
      pdf.setTextColor(200, 220, 255)
      pdf.text('Professional Lift Planning & Crane Safety', margin, 18)

      yPosition = 35

      // Title
      pdf.setFont("Helvetica", 'bold')
      pdf.setFontSize(16)
      pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
      pdf.text('PROFESSIONAL LIFT PLAN REPORT', margin, yPosition)
      yPosition += 8

      // Metadata box
      pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b)
      pdf.setLineWidth(0.5)
      pdf.rect(margin, yPosition, contentWidth, 18)

      pdf.setFont("Helvetica", 'normal')
      pdf.setFontSize(9)
      pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
      pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin + 2, yPosition + 4)
      pdf.text(`Lift Method: ${methodLabel}`, margin + 2, yPosition + 8)
      pdf.text(`Status: DRAFT - Requires Professional Review`, margin + 2, yPosition + 12)
      pdf.text(`Report ID: LP-${Date.now().toString().slice(-8)}`, margin + 2, yPosition + 16)

      yPosition += 22

      // ===== SECTION 1: PROJECT INFORMATION =====
      yPosition = addSectionHeader('PROJECT INFORMATION', 1)
      yPosition = addKeyValue('Job Name', formData.jobName)
      yPosition = addKeyValue('Location', formData.projectLocation)
      yPosition = addKeyValue('Client', formData.clientName)
      yPosition = addKeyValue('Contractor', formData.contractorName)
      yPosition = addKeyValue('Planning Date', formData.planningDate)
      yPosition = addKeyValue('Planned Lift Date', formData.plannedLiftDate)
      yPosition += 3

      // ===== SECTION 2: LOAD SPECIFICATIONS =====
      yPosition = addSectionHeader('LOAD SPECIFICATIONS', 2)
      yPosition = addKeyValue('Description', formData.loadDescription)
      yPosition = addKeyValue('Weight', `${formData.loadWeight} ${formData.loadWeightUnit}`)
      yPosition = addKeyValue('Dimensions (L×W×H)', `${formData.loadLength} × ${formData.loadWidth} × ${formData.loadHeight} mm`)
      yPosition = addKeyValue('Load Type', formData.loadType)
      yPosition = addKeyValue('COG Offset', `X: ${formData.cogOffsetX} mm, Y: ${formData.cogOffsetY} mm, Z: ${formData.cogOffsetZ} mm`)
      yPosition += 3

      // ===== SECTION 3: LIFTING EQUIPMENT =====
      yPosition = addSectionHeader('LIFTING EQUIPMENT', 3)
      yPosition = addKeyValue('Equipment Type', formData.equipmentType)
      yPosition = addKeyValue('Capacity', `${formData.equipmentCapacity} ${formData.equipmentCapacityUnit}`)
      yPosition = addKeyValue('Manufacturer', formData.equipmentManufacturer)
      yPosition = addKeyValue('Model', formData.equipmentModel)
      yPosition = addKeyValue('Certification', formData.equipmentCertification)
      yPosition = addKeyValue('Lift Method', methodLabel)
      yPosition += 3

      // ===== SECTION 4: RIGGING & SLINGS =====
      yPosition = addSectionHeader('RIGGING & SLINGS', 4)
      yPosition = addKeyValue('Sling Type', formData.slingType)
      yPosition = addKeyValue('Sling Count', formData.slingCount)
      yPosition = addKeyValue('Capacity per Sling', formData.slingCapacity)
      yPosition = addKeyValue('Sling Angle', `${formData.slingAngle}°`)
      yPosition = addKeyValue('Configuration', formData.riggingConfiguration)
      yPosition = addKeyValue('Spreader Bar Length', `${formData.spreaderBarLength} mm`)
      yPosition += 3

      // ===== SECTION 5: LIFT GEOMETRY =====
      yPosition = addSectionHeader('LIFT GEOMETRY', 5)
      yPosition = addKeyValue('Pick Radius', `${formData.pickRadius} m`)
      yPosition = addKeyValue('Set Radius', `${formData.setRadius} m`)
      yPosition = addKeyValue('Pick Height', `${formData.pickHeight} m`)
      yPosition = addKeyValue('Set Height', `${formData.setHeight} m`)
      yPosition = addKeyValue('Lift Distance', `${formData.liftDistance} m`)
      yPosition = addKeyValue('Swing Angle', `${formData.swingAngle}°`)
      yPosition += 3

      // ===== SECTION 6: SITE CONDITIONS =====
      yPosition = addSectionHeader('SITE CONDITIONS', 6)
      yPosition = addKeyValue('Ground Type', formData.groundType)
      yPosition = addKeyValue('Bearing Capacity', `${formData.groundBearing} ${formData.groundBearingUnit}`)
      yPosition = addKeyValue('Ground Preparation', formData.groundPreparation)
      yPosition = addKeyValue('Access Restrictions', formData.accessRestrictions)
      yPosition += 3

      // ===== SECTION 7: ENVIRONMENTAL CONDITIONS =====
      yPosition = addSectionHeader('ENVIRONMENTAL CONDITIONS', 7)
      yPosition = addKeyValue('Wind Speed', `${formData.windSpeed} ${formData.windSpeedUnit}`)
      yPosition = addKeyValue('Temperature', `${formData.temperature}°C`)
      yPosition = addKeyValue('Weather Conditions', formData.weatherConditions)
      yPosition = addKeyValue('Visibility', formData.visibility)
      yPosition += 3

      // ===== SECTION 8: SAFETY & PERSONNEL =====
      yPosition = addSectionHeader('SAFETY & PERSONNEL', 8)
      yPosition = addKeyValue('Exclusion Zone Radius', `${formData.exclusionZoneRadius} m`)
      yPosition = addKeyValue('Personnel Count', formData.personnelCount)
      yPosition = addKeyValue('Spotter Required', formData.spotterRequired)
      yPosition = addKeyValue('Communication Method', formData.communicationMethod)
      yPosition += 3

      // ===== SECTION 9: RISK ASSESSMENT =====
      yPosition = addSectionHeader('RISK ASSESSMENT', 9)
      pdf.setFont("Helvetica", 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
      pdf.text('Hazards Identified:', margin + 2, yPosition)
      yPosition += 4
      pdf.setFont("Helvetica", 'normal')
      pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
      yPosition = addWrappedText(formData.hazardsIdentified || 'None specified', margin + 4, yPosition, contentWidth - 4, 8)
      yPosition += 3

      pdf.setFont("Helvetica", 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
      pdf.text('Mitigation Measures:', margin + 2, yPosition)
      yPosition += 4
      pdf.setFont("Helvetica", 'normal')
      pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
      yPosition = addWrappedText(formData.mitigationMeasures || 'None specified', margin + 4, yPosition, contentWidth - 4, 8)
      yPosition += 3

      // ===== SECTION 10: SAFETY CHECKLIST =====
      yPosition = addSectionHeader('PRE-LIFT SAFETY CHECKLIST', 10)
      const checklist = [
        '✓ Equipment inspection completed and certified',
        '✓ Load weight verified and documented',
        '✓ Rigging equipment certified and inspected',
        '✓ Ground conditions assessed and prepared',
        '✓ Weather conditions acceptable for lift',
        '✓ All personnel briefed on lift plan',
        '✓ Emergency procedures reviewed',
        '✓ Exclusion zones established and marked',
        '✓ Communication systems tested',
        '✓ Spotter positioned and briefed',
        '✓ Load secured and balanced',
        '✓ Lift path clear of obstructions',
      ]
      checklist.forEach((item, idx) => {
        pdf.setFont("Helvetica", 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b)
        pdf.text(item, margin + 2, yPosition)
        yPosition += 4
      })
      yPosition += 3

      // ===== SECTION 11: APPROVALS & SIGNATURES =====
      yPosition = addSectionHeader('APPROVALS & SIGNATURES', 11)

      const signatureBlocks = [
        'Professional Engineer',
        'Site Supervisor',
        'Safety Officer',
        'Lift Director'
      ]

      signatureBlocks.forEach((role) => {
        pdf.setFont("Helvetica", 'bold')
        pdf.setFontSize(9)
        pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b)
        pdf.text(role, margin + 2, yPosition)
        yPosition += 4

        pdf.setFont("Helvetica", 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b)
        pdf.text('Signature: ________________________     Date: __________', margin + 2, yPosition)
        yPosition += 6
      })

      // ===== FOOTER =====
      pdf.setFontSize(7)
      pdf.setFont("Helvetica", 'italic')
      pdf.setTextColor(150, 150, 150)
      pdf.text('This report is AI-generated and requires professional review before use on site.', margin, pageHeight - 12)
      pdf.text('Always follow local regulations and standards. Status: DRAFT - NOT YET APPROVED', margin, pageHeight - 8)
      pdf.text(`Report ID: LP-${Date.now().toString().slice(-8)} | Generated: ${new Date().toLocaleDateString()}`, margin, pageHeight - 4)

      // Save PDF
      pdf.save(`lift-plan-${formData.jobName.replace(/\s+/g, '_')}-${new Date().getTime()}.pdf`)

      setReport('PDF Generated Successfully')
      setStep('report')
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReport = () => {
    // PDF is already downloaded in generateReport
    resetForm()
  }

  const resetForm = () => {
    setStep('method')
    setSelectedMethod('')
    setFormData({
      jobName: '',
      projectLocation: '',
      clientName: '',
      contractorName: '',
      planningDate: new Date().toISOString().split('T')[0],
      plannedLiftDate: '',
      loadDescription: '',
      loadWeight: '',
      loadWeightUnit: 'kg',
      loadLength: '',
      loadWidth: '',
      loadHeight: '',
      cogOffsetX: '',
      cogOffsetY: '',
      cogOffsetZ: '',
      loadType: 'general',
      equipmentType: '',
      equipmentCapacity: '',
      equipmentCapacityUnit: 'tonnes',
      equipmentManufacturer: '',
      equipmentModel: '',
      equipmentCertification: '',
      slingType: '',
      slingCount: '',
      slingCapacity: '',
      slingAngle: '',
      riggingConfiguration: '',
      spreaderBarLength: '',
      pickRadius: '',
      setRadius: '',
      pickHeight: '',
      setHeight: '',
      liftDistance: '',
      swingAngle: '',
      groundType: '',
      groundBearing: '',
      groundBearingUnit: 'kPa',
      groundPreparation: '',
      accessRestrictions: '',
      windSpeed: '',
      windSpeedUnit: 'km/h',
      temperature: '',
      weatherConditions: '',
      visibility: '',
      exclusionZoneRadius: '',
      personnelCount: '',
      spotterRequired: '',
      communicationMethod: '',
      emergencyProcedures: '',
      hazardsIdentified: '',
      mitigationMeasures: '',
      insuranceDetails: '',
      specialRequirements: '',
      previousLiftExperience: '',
      additionalNotes: '',
    })
    setReport('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Lift Planning AI Assistant</DialogTitle>
          <DialogDescription className="text-slate-400">
            Generate professional lift plans with AI guidance
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Method Selection */}
        {step === 'method' && (
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-300 text-sm">
                Select the lifting method for your project. This determines the equipment and safety requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {LIFT_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className="p-3 text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <span className="text-white font-medium">{method.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details Collection */}
        {step === 'details' && (
          <div className="space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-300 text-sm">
                Method selected: <strong>{LIFT_METHODS.find(m => m.id === selectedMethod)?.label}</strong>
              </p>
            </div>

            <div className="space-y-4">
              {/* Project Information */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-slate-300 text-xs">Job Name *</Label>
                    <Input name="jobName" value={formData.jobName} onChange={handleInputChange} placeholder="e.g., Building Roof Installation" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Location</Label>
                      <Input name="projectLocation" value={formData.projectLocation} onChange={handleInputChange} placeholder="Site location" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Client Name</Label>
                      <Input name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="Client" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Contractor</Label>
                      <Input name="contractorName" value={formData.contractorName} onChange={handleInputChange} placeholder="Contractor" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Planned Lift Date</Label>
                      <Input name="plannedLiftDate" type="date" value={formData.plannedLiftDate} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Load Specifications */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Load Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-slate-300 text-xs">Load Description</Label>
                    <Input name="loadDescription" value={formData.loadDescription} onChange={handleInputChange} placeholder="e.g., Steel beam, HVAC unit" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Weight *</Label>
                      <Input name="loadWeight" value={formData.loadWeight} onChange={handleInputChange} placeholder="e.g., 5000" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Unit</Label>
                      <Select value={formData.loadWeightUnit} onValueChange={(v) => setFormData({...formData, loadWeightUnit: v})}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="tonnes">tonnes</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Length (mm)</Label>
                      <Input name="loadLength" value={formData.loadLength} onChange={handleInputChange} placeholder="Length" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Width (mm)</Label>
                      <Input name="loadWidth" value={formData.loadWidth} onChange={handleInputChange} placeholder="Width" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Height (mm)</Label>
                      <Input name="loadHeight" value={formData.loadHeight} onChange={handleInputChange} placeholder="Height" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">COG Offset X (mm)</Label>
                      <Input name="cogOffsetX" value={formData.cogOffsetX} onChange={handleInputChange} placeholder="0" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">COG Offset Y (mm)</Label>
                      <Input name="cogOffsetY" value={formData.cogOffsetY} onChange={handleInputChange} placeholder="0" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">COG Offset Z (mm)</Label>
                      <Input name="cogOffsetZ" value={formData.cogOffsetZ} onChange={handleInputChange} placeholder="0" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Equipment */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Lifting Equipment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-slate-300 text-xs">Equipment Type *</Label>
                    <Input name="equipmentType" value={formData.equipmentType} onChange={handleInputChange} placeholder="e.g., Mobile Crane, Tower Crane" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Capacity</Label>
                      <Input name="equipmentCapacity" value={formData.equipmentCapacity} onChange={handleInputChange} placeholder="e.g., 100" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Unit</Label>
                      <Select value={formData.equipmentCapacityUnit} onValueChange={(v) => setFormData({...formData, equipmentCapacityUnit: v})}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="tonnes">tonnes</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Manufacturer</Label>
                      <Input name="equipmentManufacturer" value={formData.equipmentManufacturer} onChange={handleInputChange} placeholder="e.g., Liebherr" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Model</Label>
                      <Input name="equipmentModel" value={formData.equipmentModel} onChange={handleInputChange} placeholder="e.g., LTM 1200" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Certification/Inspection Date</Label>
                    <Input name="equipmentCertification" value={formData.equipmentCertification} onChange={handleInputChange} placeholder="e.g., 2024-01-15" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                </CardContent>
              </Card>

              {/* Rigging */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Rigging & Slings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Sling Type</Label>
                      <Input name="slingType" value={formData.slingType} onChange={handleInputChange} placeholder="e.g., Wire rope" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Count</Label>
                      <Input name="slingCount" value={formData.slingCount} onChange={handleInputChange} placeholder="e.g., 4" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Capacity per Sling</Label>
                      <Input name="slingCapacity" value={formData.slingCapacity} onChange={handleInputChange} placeholder="e.g., 2000 kg" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Sling Angle (°)</Label>
                      <Input name="slingAngle" value={formData.slingAngle} onChange={handleInputChange} placeholder="e.g., 45" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Configuration</Label>
                    <Input name="riggingConfiguration" value={formData.riggingConfiguration} onChange={handleInputChange} placeholder="e.g., 4-leg with spreader bar" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Spreader Bar Length (mm)</Label>
                    <Input name="spreaderBarLength" value={formData.spreaderBarLength} onChange={handleInputChange} placeholder="e.g., 3000" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                </CardContent>
              </Card>

              {/* Geometry */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Lift Geometry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Pick Radius (m)</Label>
                      <Input name="pickRadius" value={formData.pickRadius} onChange={handleInputChange} placeholder="e.g., 15" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Set Radius (m)</Label>
                      <Input name="setRadius" value={formData.setRadius} onChange={handleInputChange} placeholder="e.g., 20" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Pick Height (m)</Label>
                      <Input name="pickHeight" value={formData.pickHeight} onChange={handleInputChange} placeholder="e.g., 5" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Set Height (m)</Label>
                      <Input name="setHeight" value={formData.setHeight} onChange={handleInputChange} placeholder="e.g., 25" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Lift Distance (m)</Label>
                      <Input name="liftDistance" value={formData.liftDistance} onChange={handleInputChange} placeholder="e.g., 20" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Swing Angle (°)</Label>
                      <Input name="swingAngle" value={formData.swingAngle} onChange={handleInputChange} placeholder="e.g., 90" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Site Conditions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Site Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Ground Type</Label>
                      <Input name="groundType" value={formData.groundType} onChange={handleInputChange} placeholder="e.g., Concrete" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Bearing Capacity</Label>
                      <Input name="groundBearing" value={formData.groundBearing} onChange={handleInputChange} placeholder="e.g., 50" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Ground Preparation</Label>
                    <Input name="groundPreparation" value={formData.groundPreparation} onChange={handleInputChange} placeholder="e.g., Leveled, compacted" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Access Restrictions</Label>
                    <Input name="accessRestrictions" value={formData.accessRestrictions} onChange={handleInputChange} placeholder="e.g., Limited access, narrow roads" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                </CardContent>
              </Card>

              {/* Environmental */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Environmental Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Wind Speed</Label>
                      <Input name="windSpeed" value={formData.windSpeed} onChange={handleInputChange} placeholder="e.g., 15" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Temperature (°C)</Label>
                      <Input name="temperature" value={formData.temperature} onChange={handleInputChange} placeholder="e.g., 20" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Weather Conditions</Label>
                    <Input name="weatherConditions" value={formData.weatherConditions} onChange={handleInputChange} placeholder="e.g., Clear, no rain" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Visibility</Label>
                    <Input name="visibility" value={formData.visibility} onChange={handleInputChange} placeholder="e.g., Good, > 100m" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                </CardContent>
              </Card>

              {/* Safety */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Safety & Personnel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-slate-300 text-xs">Exclusion Zone Radius (m)</Label>
                      <Input name="exclusionZoneRadius" value={formData.exclusionZoneRadius} onChange={handleInputChange} placeholder="e.g., 50" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Personnel Count</Label>
                      <Input name="personnelCount" value={formData.personnelCount} onChange={handleInputChange} placeholder="e.g., 8" className="bg-slate-700 border-slate-600 text-white text-sm" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Spotter Required</Label>
                    <Select value={formData.spotterRequired} onValueChange={(v) => setFormData({...formData, spotterRequired: v})}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-sm h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Communication Method</Label>
                    <Input name="communicationMethod" value={formData.communicationMethod} onChange={handleInputChange} placeholder="e.g., Radio, hand signals" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-slate-300 text-xs">Hazards Identified</Label>
                    <Textarea name="hazardsIdentified" value={formData.hazardsIdentified} onChange={handleInputChange} placeholder="List potential hazards..." className="bg-slate-700 border-slate-600 text-white text-sm min-h-16" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Mitigation Measures</Label>
                    <Textarea name="mitigationMeasures" value={formData.mitigationMeasures} onChange={handleInputChange} placeholder="Describe mitigation measures..." className="bg-slate-700 border-slate-600 text-white text-sm min-h-16" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Insurance Details</Label>
                    <Input name="insuranceDetails" value={formData.insuranceDetails} onChange={handleInputChange} placeholder="e.g., Policy number, coverage" className="bg-slate-700 border-slate-600 text-white text-sm" />
                  </div>
                </CardContent>
              </Card>

              {/* Additional */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-slate-300 text-xs">Special Requirements</Label>
                    <Textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleInputChange} placeholder="Any special requirements..." className="bg-slate-700 border-slate-600 text-white text-sm min-h-12" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Previous Lift Experience</Label>
                    <Textarea name="previousLiftExperience" value={formData.previousLiftExperience} onChange={handleInputChange} placeholder="Relevant experience..." className="bg-slate-700 border-slate-600 text-white text-sm min-h-12" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Additional Notes</Label>
                    <Textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} placeholder="Any other information..." className="bg-slate-700 border-slate-600 text-white text-sm min-h-12" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Report */}
        {step === 'report' && (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">Report Generated Successfully!</h3>
              <p className="text-green-300 mb-4">
                Your professional lift plan PDF has been generated and downloaded automatically.
              </p>
              <p className="text-slate-300 text-sm">
                The report includes all sections: Project Information, Load Specifications, Equipment Details, Rigging Configuration, Lift Geometry, Site Conditions, Environmental Conditions, Safety Checklist, Risk Assessment, and Signature Blocks.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 justify-between">
          {step !== 'method' && (
            <Button
              variant="outline"
              onClick={() => step === 'report' ? resetForm() : setStep('method')}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              {step === 'report' ? 'Create Another' : 'Back'}
            </Button>
          )}

          <div className="flex gap-2 ml-auto flex-wrap">
            {step === 'details' && (
              <>
                {/* AI Model Selector */}
                <Select value={aiModel} onValueChange={(v: 'huggingface' | 'openai' | 'deepseek') => setAiModel(v)}>
                  <SelectTrigger className="w-[140px] bg-slate-700 border-slate-600 text-white text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="huggingface">🤗 Hugging Face</SelectItem>
                    <SelectItem value="openai">✨ OpenAI</SelectItem>
                    <SelectItem value="deepseek">🔮 DeepSeek</SelectItem>
                  </SelectContent>
                </Select>

                {/* AI Generate Button - Main action */}
                <Button
                  onClick={generateAILiftPlan}
                  disabled={isGenerating || !formData.jobName || !formData.loadWeight}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI Generating...
                    </>
                  ) : (
                    '🤖 Generate with AI'
                  )}
                </Button>

                {/* PDF Button - Secondary */}
                <Button
                  onClick={generateReport}
                  disabled={isGenerating || !formData.jobName || !formData.loadWeight || !formData.equipmentType}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  📄 PDF Only
                </Button>
              </>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

