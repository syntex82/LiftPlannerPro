"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FileText,
  Download,
  MapPin,
  Users,
  Zap,
  AlertTriangle,
  Shield,
  Calendar,
  Lightbulb
} from "lucide-react"
import { getLiftCategoryTemplate, getLiftCategoryNames } from '@/lib/lift-categories'
import { createRAMSPDFStyler } from '@/lib/rams-pdf-styling'

// RAMS Schema
const ramsSchema = z.object({
  // Project Information
  projectName: z.string().min(1, "Project name is required"),
  projectNumber: z.string().min(1, "Project number is required"),
  projectDescription: z.string().min(10, "Project description must be at least 10 characters"),
  clientName: z.string().min(1, "Client name is required"),
  contractorName: z.string().min(1, "Contractor name is required"),
  location: z.string().min(1, "Location is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  estimatedDuration: z.string().min(1, "Estimated duration is required"),
  
  // Personnel
  supervisor: z.string().min(1, "Supervisor name is required"),
  appointedPerson: z.string().min(1, "Appointed person is required"),
  signalPerson: z.string().min(1, "Signal person is required"),
  craneOperator: z.string().min(1, "Crane operator is required"),
  banksman: z.string().min(1, "Banksman is required"),
  
  // Lift Details
  liftType: z.string().min(1, "Lift type is required"),
  liftPurpose: z.string().min(1, "Lift purpose is required"),
  equipmentUsed: z.string().min(1, "Equipment details are required"),
  maxWeight: z.string().min(1, "Maximum weight is required"),
  craneCapacity: z.string().min(1, "Crane capacity is required"),
  radiusOfOperation: z.string().min(1, "Radius of operation is required"),
  liftHeight: z.string().min(1, "Lift height is required"),
  
  // Environmental Conditions
  weatherConditions: z.string().min(1, "Weather conditions are required"),
  windSpeed: z.string().min(1, "Wind speed is required"),
  visibility: z.string().min(1, "Visibility conditions are required"),
  groundConditions: z.string().min(1, "Ground conditions are required"),
  
  // Risk Assessment
  hazards: z.array(z.string()).min(1, "At least one hazard must be identified"),
  
  // Safety Measures
  controlMeasures: z.string().min(1, "Control measures are required"),
  ppe: z.array(z.string()).min(1, "PPE requirements must be specified"),
  exclusionZones: z.string().min(1, "Exclusion zones are required"),
  
  // Emergency Procedures
  emergencyProcedures: z.string().min(1, "Emergency procedures are required"),
  emergencyContacts: z.string().min(1, "Emergency contacts are required"),
  firstAidArrangements: z.string().min(1, "First aid arrangements are required"),
  
  // Communication
  communicationMethod: z.string().min(1, "Communication method is required"),
  signallingMethod: z.string().min(1, "Signalling method is required"),
  
  // Permits and Approvals
  permitToWork: z.boolean(),
  hotWorkPermit: z.boolean(),
  confinedSpacePermit: z.boolean(),
  roadClosurePermit: z.boolean(),
  
  // Equipment Checks
  craneInspection: z.boolean(),
  riggingInspection: z.boolean(),
  loadTestCertificate: z.boolean(),
  
  // Competency
  operatorCompetency: z.string().min(1, "Operator competency is required"),
  teamBriefing: z.boolean(),
  
  // Review and Approval
  reviewedBy: z.string().min(1, "Reviewed by is required"),
  approvedBy: z.string().min(1, "Approved by is required"),
  reviewDate: z.string().min(1, "Review date is required")
})

type RAMSFormData = z.infer<typeof ramsSchema>

const commonHazards = [
  "Overhead power lines",
  "Underground electrical cables",
  "Unstable ground conditions",
  "Weather conditions (wind, rain, snow, ice)",
  "Load swing/rotation",
  "Load drop/falling objects",
  "Crane overturning",
  "Equipment failure",
  "Human error",
  "Inadequate communication"
]

const ppeOptions = [
  "Hard hat/Safety helmet",
  "High-visibility vest/jacket",
  "Safety boots/footwear",
  "Safety glasses/goggles",
  "Hearing protection",
  "Work gloves",
  "Fall arrest harness",
  "Respiratory protection"
]

const liftTypes = [
  "Mobile crane lift",
  "Tower crane lift",
  "Crawler crane lift",
  "All-terrain crane lift",
  "Rough terrain crane lift",
  "Truck-mounted crane lift",
  "Critical lift",
  "Tandem lift (two cranes)"
]

export default function ComprehensiveRAMS() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedHazards, setSelectedHazards] = useState<string[]>([])
  const [selectedPPE, setSelectedPPE] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('project-info')
  const [selectedLiftCategory, setSelectedLiftCategory] = useState<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RAMSFormData>({
    resolver: zodResolver(ramsSchema),
    defaultValues: {
      hazards: [],
      ppe: [],
      permitToWork: false,
      hotWorkPermit: false,
      confinedSpacePermit: false,
      roadClosurePermit: false,
      craneInspection: false,
      riggingInspection: false,
      loadTestCertificate: false,
      teamBriefing: false,
      date: new Date().toISOString().split('T')[0],
      reviewDate: new Date().toISOString().split('T')[0]
    }
  })

  const handleHazardChange = (hazard: string, checked: boolean) => {
    if (checked) {
      setSelectedHazards([...selectedHazards, hazard])
    } else {
      setSelectedHazards(selectedHazards.filter(h => h !== hazard))
    }
  }

  const handlePPEChange = (ppe: string, checked: boolean) => {
    if (checked) {
      setSelectedPPE([...selectedPPE, ppe])
    } else {
      setSelectedPPE(selectedPPE.filter(p => p !== ppe))
    }
  }

  const handleLiftCategoryChange = (categoryId: string) => {
    setSelectedLiftCategory(categoryId)
    const template = getLiftCategoryTemplate(categoryId)
    if (template) {
      // Auto-populate fields from template
      setValue('liftType', template.name)
      setValue('liftPurpose', template.description)
      setValue('equipmentUsed', template.equipmentUsed)
      setValue('maxWeight', template.typicalWeight)
      setValue('liftHeight', template.typicalHeight)
      setValue('controlMeasures', template.controlMeasures)
      setValue('emergencyProcedures', template.emergencyProcedures)

      // Set hazards
      setSelectedHazards(template.hazards)

      // Set PPE
      setSelectedPPE(template.ppe)

      // Set permits
      setValue('permitToWork', template.permits.permitToWork)
      setValue('hotWorkPermit', template.permits.hotWorkPermit)
      setValue('confinedSpacePermit', template.permits.confinedSpacePermit)
      setValue('roadClosurePermit', template.permits.roadClosurePermit)

      // Set equipment checks
      setValue('craneInspection', template.equipmentChecks.craneInspection)
      setValue('riggingInspection', template.equipmentChecks.riggingInspection)
      setValue('loadTestCertificate', template.equipmentChecks.loadTestCertificate)
    }
  }

  const onSubmit = async (data: RAMSFormData) => {
    // Validate that hazards and PPE are selected
    if (selectedHazards.length === 0) {
      alert('Please select at least one hazard in the Risk Assessment tab')
      return
    }
    if (selectedPPE.length === 0) {
      alert('Please select at least one PPE item in the Safety Measures tab')
      return
    }

    setIsGenerating(true)
    try {
      // Ensure hazards and PPE are in the form data
      const completeData = {
        ...data,
        hazards: selectedHazards,
        ppe: selectedPPE
      }

      // Generate PDF with selected hazards and PPE
      await generateRAMSPDF(completeData)
    } catch (error) {
      console.error('Error generating RAMS:', error)
      alert('Error generating RAMS document. Please check all required fields are filled and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateRAMSPDF = async (data: RAMSFormData) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF('portrait', 'mm', 'a4')
    const styler = createRAMSPDFStyler(doc)

    // Add professional header
    let yPos = styler.addHeader(
      'RISK ASSESSMENT & METHOD STATEMENT',
      'LIFTING OPERATIONS - COMPREHENSIVE SAFETY DOCUMENT'
    )

    // Add document control
    const docNumber = `RAMS-${Date.now().toString().slice(-6)}`
    yPos = styler.addDocumentControl(docNumber, '1.0', new Date().toLocaleDateString(), yPos)

    yPos += 5

    // Executive Summary Section
    yPos = styler.addSectionHeading('EXECUTIVE SUMMARY', yPos, 'accent')
    const summaryText = `This Risk Assessment and Method Statement (RAMS) document provides comprehensive safety planning for the lifting operation "${data.projectName}". The document identifies potential hazards, assesses associated risks, and outlines control measures to ensure safe execution of the lifting activities. All personnel must read and understand this document before commencing work.`
    yPos = styler.addBodyText(summaryText, yPos, 10)
    yPos += 5

    // Project Information Section
    yPos = styler.addSectionHeading('1. PROJECT INFORMATION', yPos, 'accent')

    const projectInfoTable = [
      ['Project Name', data.projectName],
      ['Project Number', data.projectNumber],
      ['Client', data.clientName || 'Not specified'],
      ['Contractor', data.contractorName || 'Not specified'],
      ['Location', data.location],
      ['Date', data.date],
      ['Start Time', data.startTime],
      ['End Time', data.endTime],
      ['Duration', data.estimatedDuration || 'Not specified']
    ]

    yPos = styler.addTable(['Field', 'Details'], projectInfoTable, yPos, [50, 120])
    yPos += 5

    // Project Description Section
    yPos = styler.addSectionHeading('2. PROJECT DESCRIPTION & SCOPE', yPos, 'secondary')
    const descriptionText = data.projectDescription || 'No detailed project description provided.'
    yPos = styler.addBodyText(descriptionText, yPos, 10)
    yPos += 5

    // Risk Assessment Matrix Section
    yPos = styler.addSectionHeading('3. COMPREHENSIVE RISK ASSESSMENT MATRIX', yPos, 'danger')
    yPos = styler.addRiskMatrix(yPos)
    yPos += 5

    // Check if we need a new page
    yPos = styler.checkPageBreak(yPos, 50)

    // Personnel Section with detailed responsibilities
    yPos = styler.addSectionHeading('4. PERSONNEL & RESPONSIBILITIES', yPos, 'success')

    const personnelTable = [
      ['Supervisor', data.supervisor, 'Overall responsibility for safe execution'],
      ['Appointed Person', data.appointedPerson, 'Planning and coordination'],
      ['Signal Person', data.signalPerson, 'Communication between crane and team'],
      ['Crane Operator', data.craneOperator, 'Safe crane operation'],
      ['Banksman', data.banksman, 'Ground-level coordination']
    ]

    yPos = styler.addTable(['Role', 'Name', 'Responsibility'], personnelTable, yPos, [40, 50, 80])
    yPos += 5

    // Check if we need a new page
    yPos = styler.checkPageBreak(yPos, 50)

    // Lift Details Section with Technical Specifications
    yPos = styler.addSectionHeading('5. TECHNICAL LIFT SPECIFICATIONS', yPos, 'primary')

    const safetyFactor = (parseFloat(data.craneCapacity) / parseFloat(data.maxWeight)).toFixed(2)
    const liftDetailsTable = [
      ['Lift Type', data.liftType],
      ['Lift Purpose', data.liftPurpose],
      ['Equipment Used', data.equipmentUsed],
      ['Maximum Load Weight', `${data.maxWeight} tonnes`],
      ['Crane Capacity', `${data.craneCapacity} tonnes`],
      ['Operating Radius', `${data.radiusOfOperation} metres`],
      ['Maximum Lift Height', `${data.liftHeight} metres`],
      ['Safety Factor', `${safetyFactor}:1`]
    ]

    yPos = styler.addTable(['Specification', 'Value'], liftDetailsTable, yPos, [60, 110])
    yPos += 5

    // Check if we need a new page
    yPos = styler.checkPageBreak(yPos, 50)

    // Environmental Conditions Section
    yPos = styler.addSectionHeading('6. ENVIRONMENTAL CONDITIONS & CONSTRAINTS', yPos, 'warning')

    const envConditionsTable = [
      ['Weather Conditions', data.weatherConditions],
      ['Wind Speed', `${data.windSpeed} (Max 12 m/s)`],
      ['Visibility', data.visibility],
      ['Ground Conditions', data.groundConditions],
      ['Temperature Range', 'Suitable for equipment operation']
    ]

    yPos = styler.addTable(['Condition', 'Details'], envConditionsTable, yPos, [60, 110])
    yPos += 5

    // Check if we need a new page
    yPos = styler.checkPageBreak(yPos, 50)

    // Comprehensive Hazard Analysis
    yPos = styler.addSectionHeading('7. DETAILED HAZARD IDENTIFICATION & ANALYSIS', yPos, 'danger')
    yPos = styler.addBulletList(selectedHazards, yPos, 9)
    yPos += 5

    // Check if we need a new page
    yPos = styler.checkPageBreak(yPos, 40)

    // PPE Section
    yPos = styler.addSectionHeading('8. REQUIRED PERSONAL PROTECTIVE EQUIPMENT (PPE)', yPos, 'warning')
    yPos = styler.addBulletList(selectedPPE, yPos, 9)
    yPos += 5

    // Check if we need a new page
    yPos = styler.checkPageBreak(yPos, 40)

    // Approval Section
    yPos = styler.addSectionHeading('9. APPROVAL & AUTHORIZATION', yPos, 'accent')

    const approvalTable = [
      ['Reviewed By', data.reviewedBy],
      ['Approved By', data.approvedBy],
      ['Review Date', data.reviewDate]
    ]

    yPos = styler.addTable(['Field', 'Details'], approvalTable, yPos, [60, 110])
    yPos += 10

    // Add footer
    styler.addFooter('Generated by Lift Planner Pro - DarkSpace Software & Security')

    // Save the PDF with professional filename
    const timestamp = new Date().toISOString().split('T')[0]
    const projectCode = data.projectNumber || 'PROJ'
    doc.save(`RAMS_${projectCode}_${data.projectName.replace(/\s+/g, '_')}_${timestamp}.pdf`)
  }

  // Function to add comprehensive risk matrix
  const addRiskMatrix = (doc: any, startY: number, data: RAMSFormData): number => {
    let yPos = startY
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)

    // Risk Matrix Description
    doc.setFont('helvetica', 'normal')
    const matrixDesc = 'This matrix evaluates the likelihood and severity of identified hazards to determine overall risk levels and required control measures.'
    const descLines = doc.splitTextToSize(matrixDesc, 170)
    doc.text(descLines, 20, yPos)
    yPos += descLines.length * 4 + 8

    // Risk Matrix Header
    doc.setFont('helvetica', 'bold')
    doc.text('LIKELIHOOD vs SEVERITY MATRIX', 25, yPos)
    yPos += 8

    // Draw risk matrix table
    const cellWidth = 25
    const cellHeight = 8
    const matrixStartX = 25
    const matrixStartY = yPos

    // Headers
    const severityLevels = ['', 'Minor (1)', 'Moderate (2)', 'Major (3)', 'Severe (4)', 'Critical (5)']
    const likelihoodLevels = ['Very Unlikely (1)', 'Unlikely (2)', 'Possible (3)', 'Likely (4)', 'Very Likely (5)']

    // Draw severity headers
    severityLevels.forEach((level, index) => {
      doc.setFillColor(230, 230, 230)
      doc.rect(matrixStartX + index * cellWidth, matrixStartY, cellWidth, cellHeight, 'FD')
      if (level) {
        doc.setFontSize(6)
        doc.text(level, matrixStartX + index * cellWidth + cellWidth/2, matrixStartY + 5, { align: 'center' })
      }
    })

    // Draw likelihood levels and risk cells
    likelihoodLevels.forEach((level, rowIndex) => {
      const y = matrixStartY + (rowIndex + 1) * cellHeight

      // Likelihood label
      doc.setFillColor(230, 230, 230)
      doc.rect(matrixStartX, y, cellWidth, cellHeight, 'FD')
      doc.setFontSize(5)
      doc.text(level, matrixStartX + cellWidth/2, y + 5, { align: 'center' })

      // Risk level cells with color coding
      for (let colIndex = 1; colIndex <= 5; colIndex++) {
        const riskScore = (rowIndex + 1) * colIndex
        const riskLevel = getRiskLevel(riskScore)
        const color = getRiskColor(riskLevel)

        doc.setFillColor(color.r, color.g, color.b)
        doc.rect(matrixStartX + colIndex * cellWidth, y, cellWidth, cellHeight, 'FD')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(6)
        doc.text(`${riskScore}`, matrixStartX + colIndex * cellWidth + cellWidth/2, y + 3, { align: 'center' })
        doc.text(riskLevel, matrixStartX + colIndex * cellWidth + cellWidth/2, y + 6, { align: 'center' })
        doc.setTextColor(0, 0, 0)
      }
    })

    yPos += (likelihoodLevels.length + 2) * cellHeight + 10

    // Risk Legend with detailed descriptions
    doc.setFont('helvetica', 'bold')
    doc.text('RISK LEVELS & REQUIRED ACTIONS:', 25, yPos)
    yPos += 6

    const riskLevels = [
      { level: 'LOW (1-4)', color: { r: 34, g: 197, b: 94 }, description: 'Acceptable risk - Standard precautions sufficient' },
      { level: 'MEDIUM (5-9)', color: { r: 251, g: 191, b: 36 }, description: 'Tolerable risk - Additional controls required' },
      { level: 'HIGH (10-16)', color: { r: 239, g: 68, b: 68 }, description: 'Unacceptable risk - Immediate action required' },
      { level: 'CRITICAL (20-25)', color: { r: 127, g: 29, b: 29 }, description: 'Stop work - Comprehensive mitigation needed' }
    ]

    riskLevels.forEach((risk) => {
      doc.setFillColor(risk.color.r, risk.color.g, risk.color.b)
      doc.rect(25, yPos - 3, 12, 4, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(risk.level, 40, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(risk.description, 80, yPos)
      yPos += 6
    })

    return yPos + 10
  }

  // Helper functions for risk matrix
  const getRiskLevel = (score: number): string => {
    if (score <= 4) return 'LOW'
    if (score <= 9) return 'MEDIUM'
    if (score <= 16) return 'HIGH'
    return 'CRITICAL'
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return { r: 34, g: 197, b: 94 }
      case 'MEDIUM': return { r: 251, g: 191, b: 36 }
      case 'HIGH': return { r: 239, g: 68, b: 68 }
      case 'CRITICAL': return { r: 127, g: 29, b: 29 }
      default: return { r: 156, g: 163, b: 175 }
    }
  }

  // Helper functions for hazard analysis
  const getHazardLikelihood = (hazard: string): number => {
    const hazardLikelihoods: { [key: string]: number } = {
      'Overhead power lines': 2,
      'Underground electrical cables': 2,
      'Unstable ground conditions': 3,
      'Weather conditions (wind, rain, snow, ice)': 4,
      'Load swing/rotation': 3,
      'Load drop/falling objects': 2,
      'Crane overturning': 1,
      'Equipment failure': 2,
      'Human error': 3,
      'Inadequate communication': 3
    }
    return hazardLikelihoods[hazard] || 3
  }

  const getHazardSeverity = (hazard: string): number => {
    const hazardSeverities: { [key: string]: number } = {
      'Overhead power lines': 5,
      'Underground electrical cables': 4,
      'Unstable ground conditions': 4,
      'Weather conditions (wind, rain, snow, ice)': 3,
      'Load swing/rotation': 3,
      'Load drop/falling objects': 4,
      'Crane overturning': 5,
      'Equipment failure': 4,
      'Human error': 3,
      'Inadequate communication': 3
    }
    return hazardSeverities[hazard] || 3
  }

  const getHazardControls = (hazard: string): string => {
    const hazardControls: { [key: string]: string } = {
      'Overhead power lines': 'Maintain safe clearance distances, use spotter, isolate power if possible',
      'Underground electrical cables': 'Locate and mark all underground services, use safe digging practices',
      'Unstable ground conditions': 'Ground assessment, use outrigger pads, level crane properly',
      'Weather conditions (wind, rain, snow, ice)': 'Monitor weather conditions, stop work if unsafe',
      'Load swing/rotation': 'Use tag lines, control load movement, maintain exclusion zones',
      'Load drop/falling objects': 'Inspect rigging equipment, use proper lifting points, exclusion zones',
      'Crane overturning': 'Stay within load chart limits, level crane, use outriggers properly',
      'Equipment failure': 'Pre-use inspections, maintenance schedules, competent operators',
      'Human error': 'Training, supervision, clear communication protocols',
      'Inadequate communication': 'Establish clear signals, use radios, designated signal person'
    }
    return hazardControls[hazard] || 'Implement appropriate control measures and supervision'
  }

  // Calculate completion percentage
  const calculateProgress = () => {
    const formData = watch()
    let completed = 0
    let total = 0

    // Count required fields
    const requiredFields = [
      'projectName', 'projectNumber', 'location', 'date', 'startTime', 'endTime',
      'supervisor', 'appointedPerson', 'signalPerson', 'craneOperator', 'banksman',
      'liftType', 'liftPurpose', 'maxWeight', 'craneCapacity', 'radiusOfOperation', 'liftHeight',
      'weatherConditions', 'windSpeed', 'visibility', 'groundConditions',
      'controlMeasures', 'exclusionZones', 'emergencyProcedures', 'emergencyContacts',
      'firstAidArrangements', 'communicationMethod', 'signallingMethod',
      'operatorCompetency', 'reviewedBy', 'approvedBy', 'reviewDate'
    ]

    requiredFields.forEach(field => {
      total++
      if (formData[field as keyof RAMSFormData] && formData[field as keyof RAMSFormData] !== '') {
        completed++
      }
    })

    // Add hazards and PPE
    total += 2
    if (selectedHazards.length > 0) completed++
    if (selectedPPE.length > 0) completed++

    return Math.round((completed / total) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 font-medium">RAMS Completion</span>
            <span className="text-white font-bold">{calculateProgress()}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="flex flex-wrap border-b border-slate-700">
          {[
            { id: 'project-info', label: 'Project Info', icon: MapPin },
            { id: 'personnel', label: 'Personnel', icon: Users },
            { id: 'lift-details', label: 'Lift Details', icon: Zap },
            { id: 'risk-assessment', label: 'Risk Assessment', icon: AlertTriangle },
            { id: 'safety-measures', label: 'Safety Measures', icon: Shield },
            { id: 'review', label: 'Review & Approval', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400 bg-slate-700/50'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Information Tab */}
        {activeTab === 'project-info' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectName" className="text-slate-300">Project Name *</Label>
                  <Input
                    id="projectName"
                    {...register('projectName')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter project name"
                  />
                  {errors.projectName && (
                    <p className="text-red-400 text-sm mt-1">{errors.projectName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="projectNumber" className="text-slate-300">Project Number *</Label>
                  <Input
                    id="projectNumber"
                    {...register('projectNumber')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter project number"
                  />
                  {errors.projectNumber && (
                    <p className="text-red-400 text-sm mt-1">{errors.projectNumber.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location" className="text-slate-300">Location *</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Project location"
                  />
                  {errors.location && (
                    <p className="text-red-400 text-sm mt-1">{errors.location.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="date" className="text-slate-300">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date')}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  {errors.date && (
                    <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="startTime" className="text-slate-300">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register('startTime')}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  {errors.startTime && (
                    <p className="text-red-400 text-sm mt-1">{errors.startTime.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-slate-300">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    {...register('endTime')}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  {errors.endTime && (
                    <p className="text-red-400 text-sm mt-1">{errors.endTime.message}</p>
                  )}
                </div>
              </div>

              {/* Additional Project Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectDescription" className="text-slate-300">Project Description *</Label>
                  <textarea
                    id="projectDescription"
                    {...register('projectDescription')}
                    className="w-full bg-slate-700 border-slate-600 text-white rounded-md p-3 min-h-[100px]"
                    placeholder="Provide a detailed description of the lifting operation, including purpose, scope, and key requirements..."
                  />
                  {errors.projectDescription && (
                    <p className="text-red-400 text-sm mt-1">{errors.projectDescription.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="clientName" className="text-slate-300">Client Name *</Label>
                    <Input
                      id="clientName"
                      {...register('clientName')}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Client organization"
                    />
                    {errors.clientName && (
                      <p className="text-red-400 text-sm mt-1">{errors.clientName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="contractorName" className="text-slate-300">Contractor Name *</Label>
                    <Input
                      id="contractorName"
                      {...register('contractorName')}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Contractor organization"
                    />
                    {errors.contractorName && (
                      <p className="text-red-400 text-sm mt-1">{errors.contractorName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="estimatedDuration" className="text-slate-300">Estimated Duration *</Label>
                    <Input
                      id="estimatedDuration"
                      {...register('estimatedDuration')}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g., 4 hours, 2 days"
                    />
                    {errors.estimatedDuration && (
                      <p className="text-red-400 text-sm mt-1">{errors.estimatedDuration.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personnel Tab */}
        {activeTab === 'personnel' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Personnel & Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supervisor" className="text-slate-300">Supervisor *</Label>
                  <Input
                    id="supervisor"
                    {...register('supervisor')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Site supervisor name"
                  />
                  {errors.supervisor && (
                    <p className="text-red-400 text-sm mt-1">{errors.supervisor.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="appointedPerson" className="text-slate-300">Appointed Person *</Label>
                  <Input
                    id="appointedPerson"
                    {...register('appointedPerson')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Appointed person for lifting"
                  />
                  {errors.appointedPerson && (
                    <p className="text-red-400 text-sm mt-1">{errors.appointedPerson.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="signalPerson" className="text-slate-300">Signal Person *</Label>
                  <Input
                    id="signalPerson"
                    {...register('signalPerson')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Signal person name"
                  />
                  {errors.signalPerson && (
                    <p className="text-red-400 text-sm mt-1">{errors.signalPerson.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="craneOperator" className="text-slate-300">Crane Operator *</Label>
                  <Input
                    id="craneOperator"
                    {...register('craneOperator')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Crane operator name"
                  />
                  {errors.craneOperator && (
                    <p className="text-red-400 text-sm mt-1">{errors.craneOperator.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="banksman" className="text-slate-300">Banksman *</Label>
                  <Input
                    id="banksman"
                    {...register('banksman')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Banksman name"
                  />
                  {errors.banksman && (
                    <p className="text-red-400 text-sm mt-1">{errors.banksman.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="operatorCompetency" className="text-slate-300">Operator Competency *</Label>
                  <Textarea
                    id="operatorCompetency"
                    {...register('operatorCompetency')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Operator qualifications and competency details"
                    rows={3}
                  />
                  {errors.operatorCompetency && (
                    <p className="text-red-400 text-sm mt-1">{errors.operatorCompetency.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lift Details Tab */}
        {activeTab === 'lift-details' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Lift Details & Equipment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lift Category Selector */}
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-blue-300 font-semibold mb-3">Quick Start: Select Lift Category</h3>
                    <p className="text-blue-200 text-sm mb-3">
                      Choose a pre-defined lift category to automatically populate relevant fields with industry-standard data and best practices.
                    </p>
                    <Select value={selectedLiftCategory} onValueChange={handleLiftCategoryChange}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select a lift category to auto-populate..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {getLiftCategoryNames().map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="liftType" className="text-slate-300">Lift Type *</Label>
                  <Select onValueChange={(value) => setValue('liftType', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select lift type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {liftTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.liftType && (
                    <p className="text-red-400 text-sm mt-1">{errors.liftType.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="liftPurpose" className="text-slate-300">Lift Purpose *</Label>
                  <Input
                    id="liftPurpose"
                    {...register('liftPurpose')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Purpose of the lift"
                  />
                  {errors.liftPurpose && (
                    <p className="text-red-400 text-sm mt-1">{errors.liftPurpose.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="maxWeight" className="text-slate-300">Maximum Weight (tonnes) *</Label>
                  <Input
                    id="maxWeight"
                    {...register('maxWeight')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Maximum load weight"
                  />
                  {errors.maxWeight && (
                    <p className="text-red-400 text-sm mt-1">{errors.maxWeight.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="craneCapacity" className="text-slate-300">Crane Capacity (tonnes) *</Label>
                  <Input
                    id="craneCapacity"
                    {...register('craneCapacity')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Crane lifting capacity"
                  />
                  {errors.craneCapacity && (
                    <p className="text-red-400 text-sm mt-1">{errors.craneCapacity.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="radiusOfOperation" className="text-slate-300">Radius of Operation (m) *</Label>
                  <Input
                    id="radiusOfOperation"
                    {...register('radiusOfOperation')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Operating radius"
                  />
                  {errors.radiusOfOperation && (
                    <p className="text-red-400 text-sm mt-1">{errors.radiusOfOperation.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="liftHeight" className="text-slate-300">Lift Height (m) *</Label>
                  <Input
                    id="liftHeight"
                    {...register('liftHeight')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Maximum lift height"
                  />
                  {errors.liftHeight && (
                    <p className="text-red-400 text-sm mt-1">{errors.liftHeight.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="equipmentUsed" className="text-slate-300">Equipment Used *</Label>
                <Textarea
                  id="equipmentUsed"
                  {...register('equipmentUsed')}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Detailed list of all equipment to be used (crane, slings, shackles, etc.)"
                  rows={4}
                />
                {errors.equipmentUsed && (
                  <p className="text-red-400 text-sm mt-1">{errors.equipmentUsed.message}</p>
                )}
              </div>

              {/* Environmental Conditions */}
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-4">Environmental Conditions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weatherConditions" className="text-slate-300">Weather Conditions *</Label>
                    <Input
                      id="weatherConditions"
                      {...register('weatherConditions')}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Current weather conditions"
                    />
                    {errors.weatherConditions && (
                      <p className="text-red-400 text-sm mt-1">{errors.weatherConditions.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="windSpeed" className="text-slate-300">Wind Speed (mph) *</Label>
                    <Input
                      id="windSpeed"
                      {...register('windSpeed')}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Current wind speed"
                    />
                    {errors.windSpeed && (
                      <p className="text-red-400 text-sm mt-1">{errors.windSpeed.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="visibility" className="text-slate-300">Visibility *</Label>
                    <Input
                      id="visibility"
                      {...register('visibility')}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Visibility conditions"
                    />
                    {errors.visibility && (
                      <p className="text-red-400 text-sm mt-1">{errors.visibility.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="groundConditions" className="text-slate-300">Ground Conditions *</Label>
                    <Input
                      id="groundConditions"
                      {...register('groundConditions')}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Ground stability and conditions"
                    />
                    {errors.groundConditions && (
                      <p className="text-red-400 text-sm mt-1">{errors.groundConditions.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Assessment Tab */}
        {activeTab === 'risk-assessment' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hazard Identification */}
              <div>
                <h3 className="text-white font-semibold mb-4">Hazard Identification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {commonHazards.map((hazard) => (
                    <div key={hazard} className="flex items-center space-x-2">
                      <Checkbox
                        id={hazard}
                        checked={selectedHazards.includes(hazard)}
                        onCheckedChange={(checked) => {
                          handleHazardChange(hazard, checked as boolean)
                          setValue('hazards', checked ? [...selectedHazards, hazard] : selectedHazards.filter(h => h !== hazard))
                        }}
                        className="border-slate-600"
                      />
                      <Label htmlFor={hazard} className="text-slate-300 text-sm">{hazard}</Label>
                    </div>
                  ))}
                </div>
                {errors.hazards && (
                  <p className="text-red-400 text-sm mt-2">{errors.hazards.message}</p>
                )}
              </div>

              {/* Control Measures */}
              <div>
                <Label htmlFor="controlMeasures" className="text-slate-300">Control Measures *</Label>
                <Textarea
                  id="controlMeasures"
                  {...register('controlMeasures')}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Detailed control measures to mitigate identified hazards"
                  rows={6}
                />
                {errors.controlMeasures && (
                  <p className="text-red-400 text-sm mt-1">{errors.controlMeasures.message}</p>
                )}
              </div>

              {/* Emergency Procedures */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="emergencyProcedures" className="text-slate-300">Emergency Procedures *</Label>
                  <Textarea
                    id="emergencyProcedures"
                    {...register('emergencyProcedures')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Emergency response procedures and evacuation plans"
                    rows={4}
                  />
                  {errors.emergencyProcedures && (
                    <p className="text-red-400 text-sm mt-1">{errors.emergencyProcedures.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="emergencyContacts" className="text-slate-300">Emergency Contacts *</Label>
                  <Textarea
                    id="emergencyContacts"
                    {...register('emergencyContacts')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Emergency contact numbers and personnel"
                    rows={3}
                  />
                  {errors.emergencyContacts && (
                    <p className="text-red-400 text-sm mt-1">{errors.emergencyContacts.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="firstAidArrangements" className="text-slate-300">First Aid Arrangements *</Label>
                  <Textarea
                    id="firstAidArrangements"
                    {...register('firstAidArrangements')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="First aid facilities and trained personnel on site"
                    rows={3}
                  />
                  {errors.firstAidArrangements && (
                    <p className="text-red-400 text-sm mt-1">{errors.firstAidArrangements.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Safety Measures Tab */}
        {activeTab === 'safety-measures' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Safety Measures & PPE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PPE Requirements */}
              <div>
                <h3 className="text-white font-semibold mb-4">Personal Protective Equipment (PPE)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ppeOptions.map((ppe) => (
                    <div key={ppe} className="flex items-center space-x-2">
                      <Checkbox
                        id={ppe}
                        checked={selectedPPE.includes(ppe)}
                        onCheckedChange={(checked) => {
                          handlePPEChange(ppe, checked as boolean)
                          setValue('ppe', checked ? [...selectedPPE, ppe] : selectedPPE.filter(p => p !== ppe))
                        }}
                        className="border-slate-600"
                      />
                      <Label htmlFor={ppe} className="text-slate-300 text-sm">{ppe}</Label>
                    </div>
                  ))}
                </div>
                {errors.ppe && (
                  <p className="text-red-400 text-sm mt-2">{errors.ppe.message}</p>
                )}
              </div>

              {/* Exclusion Zones */}
              <div>
                <Label htmlFor="exclusionZones" className="text-slate-300">Exclusion Zones *</Label>
                <Textarea
                  id="exclusionZones"
                  {...register('exclusionZones')}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Define exclusion zones and barriers around the lifting operation"
                  rows={4}
                />
                {errors.exclusionZones && (
                  <p className="text-red-400 text-sm mt-1">{errors.exclusionZones.message}</p>
                )}
              </div>

              {/* Communication Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="communicationMethod" className="text-slate-300">Communication Method *</Label>
                  <Input
                    id="communicationMethod"
                    {...register('communicationMethod')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Radio, hand signals, etc."
                  />
                  {errors.communicationMethod && (
                    <p className="text-red-400 text-sm mt-1">{errors.communicationMethod.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="signallingMethod" className="text-slate-300">Signalling Method *</Label>
                  <Input
                    id="signallingMethod"
                    {...register('signallingMethod')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Standard hand signals, radio codes, etc."
                  />
                  {errors.signallingMethod && (
                    <p className="text-red-400 text-sm mt-1">{errors.signallingMethod.message}</p>
                  )}
                </div>
              </div>

              {/* Permits and Checks */}
              <div>
                <h3 className="text-white font-semibold mb-4">Permits & Equipment Checks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-slate-300 font-medium">Permits Required</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="permitToWork"
                          {...register('permitToWork')}
                          className="border-slate-600"
                        />
                        <Label htmlFor="permitToWork" className="text-slate-300">Permit to Work</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hotWorkPermit"
                          {...register('hotWorkPermit')}
                          className="border-slate-600"
                        />
                        <Label htmlFor="hotWorkPermit" className="text-slate-300">Hot Work Permit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="confinedSpacePermit"
                          {...register('confinedSpacePermit')}
                          className="border-slate-600"
                        />
                        <Label htmlFor="confinedSpacePermit" className="text-slate-300">Confined Space Permit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="roadClosurePermit"
                          {...register('roadClosurePermit')}
                          className="border-slate-600"
                        />
                        <Label htmlFor="roadClosurePermit" className="text-slate-300">Road Closure Permit</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-slate-300 font-medium">Equipment Checks</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="craneInspection"
                          {...register('craneInspection')}
                          className="border-slate-600"
                        />
                        <Label htmlFor="craneInspection" className="text-slate-300">Crane Inspection Complete</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="riggingInspection"
                          {...register('riggingInspection')}
                          className="border-slate-600"
                        />
                        <Label htmlFor="riggingInspection" className="text-slate-300">Rigging Inspection Complete</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="loadTestCertificate"
                          {...register('loadTestCertificate')}
                          className="border-slate-600"
                        />
                        <Label htmlFor="loadTestCertificate" className="text-slate-300">Load Test Certificate Valid</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="teamBriefing"
                          {...register('teamBriefing')}
                          className="border-slate-600"
                        />
                        <Label htmlFor="teamBriefing" className="text-slate-300">Team Briefing Complete</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review & Approval Tab */}
        {activeTab === 'review' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Review & Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reviewedBy" className="text-slate-300">Reviewed By *</Label>
                  <Input
                    id="reviewedBy"
                    {...register('reviewedBy')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Name of reviewer"
                  />
                  {errors.reviewedBy && (
                    <p className="text-red-400 text-sm mt-1">{errors.reviewedBy.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="approvedBy" className="text-slate-300">Approved By *</Label>
                  <Input
                    id="approvedBy"
                    {...register('approvedBy')}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Name of approver"
                  />
                  {errors.approvedBy && (
                    <p className="text-red-400 text-sm mt-1">{errors.approvedBy.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="reviewDate" className="text-slate-300">Review Date *</Label>
                  <Input
                    id="reviewDate"
                    type="date"
                    {...register('reviewDate')}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  {errors.reviewDate && (
                    <p className="text-red-400 text-sm mt-1">{errors.reviewDate.message}</p>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-white font-semibold mb-3">RAMS Summary</h3>
                <div className="text-slate-300 text-sm space-y-2">
                  <p><strong>Project:</strong> {watch('projectName') || 'Not specified'}</p>
                  <p><strong>Location:</strong> {watch('location') || 'Not specified'}</p>
                  <p><strong>Date:</strong> {watch('date') || 'Not specified'}</p>
                  <p><strong>Supervisor:</strong> {watch('supervisor') || 'Not specified'}</p>
                  <p><strong>Lift Type:</strong> {watch('liftType') || 'Not specified'}</p>
                  <p><strong>Max Weight:</strong> {watch('maxWeight') || 'Not specified'} tonnes</p>
                  <p><strong>Hazards Identified:</strong> {selectedHazards.length} hazards</p>
                  <p><strong>PPE Required:</strong> {selectedPPE.length} items</p>
                </div>
              </div>

              {/* Declaration */}
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                <h3 className="text-blue-300 font-semibold mb-2">Declaration</h3>
                <p className="text-blue-200 text-sm">
                  By generating this RAMS document, I confirm that all information provided is accurate and complete.
                  This risk assessment has been conducted in accordance with current health and safety regulations
                  and industry best practices. All personnel involved in this lifting operation have been briefed
                  on the contents of this RAMS and understand their roles and responsibilities.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Generate RAMS PDF
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
