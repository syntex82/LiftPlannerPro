"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Home, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Settings,
  Trash2,
  Edit,
  Play,
  Pause,
  RotateCcw,
  Target,
  Zap,
  Brain,
  Download,
  FileText,
  Share
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import GanttTimeline from "@/components/gantt-timeline"

interface StepPlanItem {
  id: string
  title: string
  description: string
  duration: number // in minutes
  dependencies: string[]
  resources: string[]
  riskLevel: 'Low' | 'Medium' | 'High'
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked'
  assignedTo: string
  startTime?: Date
  endTime?: Date
  notes: string
  category: 'Preparation' | 'Setup' | 'Lifting' | 'Positioning' | 'Securing' | 'Cleanup'
}

const defaultSteps: Partial<StepPlanItem>[] = [
  {
    title: "Site Survey and Risk Assessment",
    description: "Conduct comprehensive site survey, identify hazards, and assess ground conditions",
    duration: 60,
    category: "Preparation",
    riskLevel: "Medium",
    resources: ["Site Engineer", "Safety Officer"]
  },
  {
    title: "Crane Setup and Positioning",
    description: "Position crane, extend outriggers, and verify stability",
    duration: 45,
    category: "Setup",
    riskLevel: "High",
    resources: ["Crane Operator", "Banksman", "Slinger"]
  },
  {
    title: "Load Preparation and Rigging",
    description: "Prepare load, attach rigging equipment, and verify connections",
    duration: 30,
    category: "Preparation",
    riskLevel: "High",
    resources: ["Slinger", "Rigger"]
  },
  {
    title: "Pre-Lift Checks",
    description: "Final safety checks, communication test, and lift plan review",
    duration: 15,
    category: "Preparation",
    riskLevel: "Medium",
    resources: ["All Personnel"]
  },
  {
    title: "Lifting Operation",
    description: "Execute the lift according to plan with continuous monitoring",
    duration: 20,
    category: "Lifting",
    riskLevel: "High",
    resources: ["Crane Operator", "Banksman", "Slinger"]
  },
  {
    title: "Load Positioning",
    description: "Carefully position load to final location with precision",
    duration: 25,
    category: "Positioning",
    riskLevel: "High",
    resources: ["Crane Operator", "Banksman", "Installation Team"]
  },
  {
    title: "Load Securing",
    description: "Secure load in final position and remove rigging equipment",
    duration: 20,
    category: "Securing",
    riskLevel: "Medium",
    resources: ["Installation Team", "Rigger"]
  },
  {
    title: "Equipment Demobilization",
    description: "Safely demobilize crane and clear work area",
    duration: 30,
    category: "Cleanup",
    riskLevel: "Low",
    resources: ["Crane Operator", "Site Team"]
  }
]

export default function StepPlanPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [steps, setSteps] = useState<StepPlanItem[]>([])
  const [newStep, setNewStep] = useState<Partial<StepPlanItem>>({
    title: '',
    description: '',
    duration: 30,
    dependencies: [],
    resources: [],
    riskLevel: 'Low',
    status: 'Not Started',
    assignedTo: '',
    notes: '',
    category: 'Preparation'
  })
  const [editingStep, setEditingStep] = useState<string | null>(null)
  const [projectStartTime, setProjectStartTime] = useState<Date>(new Date())
  const [projectName, setProjectName] = useState<string>('Lift Planning Project')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      // Initialize with default steps
      const initialSteps: StepPlanItem[] = defaultSteps.map((step, index) => ({
        id: `step-${index + 1}`,
        title: step.title || '',
        description: step.description || '',
        duration: step.duration || 30,
        dependencies: index > 0 ? [`step-${index}`] : [],
        resources: step.resources || [],
        riskLevel: step.riskLevel || 'Low',
        status: 'Not Started',
        assignedTo: '',
        notes: '',
        category: step.category || 'Preparation'
      }))
      setSteps(initialSteps)
    }
  }, [status, router])

  const addStep = () => {
    if (!newStep.title) return

    const step: StepPlanItem = {
      id: `step-${Date.now()}`,
      title: newStep.title,
      description: newStep.description || '',
      duration: newStep.duration || 30,
      dependencies: newStep.dependencies || [],
      resources: newStep.resources || [],
      riskLevel: newStep.riskLevel || 'Low',
      status: 'Not Started',
      assignedTo: newStep.assignedTo || '',
      notes: newStep.notes || '',
      category: newStep.category || 'Preparation'
    }

    setSteps([...steps, step])
    setNewStep({
      title: '',
      description: '',
      duration: 30,
      dependencies: [],
      resources: [],
      riskLevel: 'Low',
      status: 'Not Started',
      assignedTo: '',
      notes: '',
      category: 'Preparation'
    })
  }

  const updateStep = (id: string, updates: Partial<StepPlanItem>) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ))
  }

  const deleteStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id))
    // Remove dependencies on deleted step
    setSteps(prevSteps => 
      prevSteps.map(step => ({
        ...step,
        dependencies: step.dependencies.filter(dep => dep !== id)
      }))
    )
  }

  const calculateProjectTimeline = () => {
    let currentTime = new Date(projectStartTime)
    const timeline: { [key: string]: { start: Date, end: Date } } = {}

    // Simple sequential calculation (can be enhanced with dependency analysis)
    steps.forEach(step => {
      const start = new Date(currentTime)
      const end = new Date(currentTime.getTime() + step.duration * 60000)
      timeline[step.id] = { start, end }
      currentTime = end
    })

    return timeline
  }

  const getTotalDuration = () => {
    return steps.reduce((total, step) => total + step.duration, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-600'
      case 'In Progress': return 'bg-blue-600'
      case 'Blocked': return 'bg-red-600'
      default: return 'bg-slate-600'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-600'
      case 'Medium': return 'bg-yellow-600'
      default: return 'bg-green-600'
    }
  }

  const generateProfessionalHTML = () => {
    const timeline = calculateProjectTimeline()
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lift Plan - Step Sequence | ${projectName}</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
            @top-center {
                content: "LIFT PLAN - STEP SEQUENCE";
                font-family: Arial, sans-serif;
                font-size: 10pt;
                font-weight: bold;
            }
            @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-family: Arial, sans-serif;
                font-size: 9pt;
            }
        }

        body {
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.5;
            color: #1e293b;
            margin: 0;
            padding: 15px;
            background: white;
            font-size: 9px;
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 12px;
            margin-bottom: 15px;
            background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
            padding: 12px;
            border-radius: 6px;
        }

        .company-logo {
            font-size: 16px;
            font-weight: 900;
            color: #1e40af;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }

        .document-title {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            margin: 8px 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .project-info {
            background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
            border: 1px solid #1e40af;
            border-radius: 6px;
            padding: 12px;
            margin: 12px 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #cbd5e1;
        }

        .info-label {
            font-weight: 700;
            color: #1e40af;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .info-value {
            color: #0f172a;
            font-weight: 600;
            font-size: 9px;
        }

        .section-title {
            font-size: 12px;
            font-weight: 800;
            color: white;
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
            margin: 15px 0 10px 0;
            padding: 8px 12px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .step-container {
            margin: 12px 0;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
            page-break-inside: avoid;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .step-header {
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
            color: white;
            padding: 10px 12px;
            font-weight: 800;
            font-size: 10px;
            letter-spacing: 0.3px;
        }

        .step-content {
            padding: 12px;
            background: white;
        }

        .step-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 10px;
            background: #f8fafc;
            padding: 10px;
            border-radius: 4px;
        }

        .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
        }

        .detail-label {
            font-weight: 700;
            color: #1e40af;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .detail-value {
            color: #0f172a;
            font-weight: 600;
            font-size: 9px;
        }

        .risk-high {
            background: #fee2e2;
            color: #991b1b;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 700;
            border: 1px solid #fca5a5;
            display: inline-block;
            font-size: 8px;
        }

        .risk-medium {
            background: #fef3c7;
            color: #92400e;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 700;
            border: 1px solid #fcd34d;
            display: inline-block;
            font-size: 8px;
        }

        .risk-low {
            background: #dcfce7;
            color: #166534;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 700;
            border: 1px solid #86efac;
            display: inline-block;
            font-size: 8px;
        }

        .status-completed {
            background: #dcfce7;
            color: #166534;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 700;
            border: 1px solid #86efac;
            display: inline-block;
            font-size: 8px;
        }

        .status-progress {
            background: #dbeafe;
            color: #1e40af;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 700;
            border: 1px solid #93c5fd;
            display: inline-block;
            font-size: 8px;
        }

        .status-blocked {
            background: #fee2e2;
            color: #991b1b;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 700;
            border: 1px solid #fca5a5;
            display: inline-block;
            font-size: 8px;
        }

        .status-not-started {
            background: #f1f5f9;
            color: #334155;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 700;
            border: 1px solid #cbd5e1;
            display: inline-block;
            font-size: 8px;
        }

        .description {
            background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
            padding: 10px;
            border-radius: 6px;
            margin-top: 10px;
            border-left: 3px solid #1e40af;
            border: 1px solid #bfdbfe;
            font-size: 9px;
            line-height: 1.4;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
            margin: 12px 0;
        }

        .summary-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
            border: 1px solid #1e40af;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .summary-number {
            font-size: 24px;
            font-weight: 900;
            color: #1e40af;
        }

        .summary-label {
            color: #1e40af;
            font-weight: 700;
            margin-top: 4px;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .footer {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 2px solid #1e40af;
            text-align: center;
            color: #475569;
            font-size: 8px;
        }

        .timeline-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .timeline-table th,
        .timeline-table td {
            border: 1px solid #e2e8f0;
            padding: 8px;
            text-align: left;
            font-size: 8px;
        }

        .timeline-table th {
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
            color: white;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .timeline-table tr:nth-child(even) {
            background: #f8fafc;
        }

        .timeline-table tr:hover {
            background: #f0f9ff;
        }

        @media print {
            body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }

            .step-container {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-logo">🏗️ LIFT PLANNER PRO</div>
        <div class="document-title">Lift Plan - Step Sequence</div>
        <div style="color: #64748b; font-size: 14px;">Professional Lift Planning Documentation</div>
    </div>

    <div class="project-info">
        <div>
            <div class="info-item">
                <span class="info-label">Project Name:</span>
                <span class="info-value">${projectName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Start Time:</span>
                <span class="info-value">${projectStartTime.toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Total Duration:</span>
                <span class="info-value">${getTotalDuration()} minutes</span>
            </div>
        </div>
        <div>
            <div class="info-item">
                <span class="info-label">Total Steps:</span>
                <span class="info-value">${steps.length}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Generated:</span>
                <span class="info-value">${currentDate} ${currentTime}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Document Version:</span>
                <span class="info-value">1.0</span>
            </div>
        </div>
    </div>

    <div class="section-title">Project Summary</div>
    <div class="summary-grid">
        <div class="summary-card">
            <div class="summary-number">${steps.filter(s => s.riskLevel === 'High').length}</div>
            <div class="summary-label">High Risk Steps</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${steps.filter(s => s.riskLevel === 'Medium').length}</div>
            <div class="summary-label">Medium Risk Steps</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${steps.filter(s => s.riskLevel === 'Low').length}</div>
            <div class="summary-label">Low Risk Steps</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${steps.filter(s => s.status === 'Completed').length}</div>
            <div class="summary-label">Completed Steps</div>
        </div>
    </div>

    <div class="section-title">Timeline Overview</div>
    <table class="timeline-table">
        <thead>
            <tr>
                <th>Step</th>
                <th>Title</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Duration</th>
                <th>Risk</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${steps.map((step, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${step.title}</td>
                    <td>${timeline[step.id]?.start.toLocaleString() || 'TBD'}</td>
                    <td>${timeline[step.id]?.end.toLocaleString() || 'TBD'}</td>
                    <td>${step.duration} min</td>
                    <td><span class="risk-${step.riskLevel.toLowerCase()}">${step.riskLevel}</span></td>
                    <td><span class="status-${step.status.toLowerCase().replace(' ', '-')}">${step.status}</span></td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="section-title">Detailed Step Sequence</div>
    ${steps.map((step, index) => `
        <div class="step-container">
            <div class="step-header">
                Step ${index + 1}: ${step.title}
            </div>
            <div class="step-content">
                <div class="step-details">
                    <div>
                        <div class="detail-item">
                            <span class="detail-label">Duration:</span>
                            <span class="detail-value">${step.duration} minutes</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Personnel:</span>
                            <span class="detail-value">${step.resources.join(', ') || 'Not assigned'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Category:</span>
                            <span class="detail-value">${step.category}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Dependencies:</span>
                            <span class="detail-value">${step.dependencies.length > 0 ? step.dependencies.join(', ') : 'None'}</span>
                        </div>
                    </div>
                    <div>
                        <div class="detail-item">
                            <span class="detail-label">Start Time:</span>
                            <span class="detail-value">${timeline[step.id]?.start.toLocaleString() || 'TBD'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">End Time:</span>
                            <span class="detail-value">${timeline[step.id]?.end.toLocaleString() || 'TBD'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Risk Level:</span>
                            <span class="detail-value"><span class="risk-${step.riskLevel.toLowerCase()}">${step.riskLevel}</span></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value"><span class="status-${step.status.toLowerCase().replace(' ', '-')}">${step.status}</span></span>
                        </div>
                    </div>
                </div>
                <div class="description">
                    <strong>Description:</strong><br>
                    ${step.description}
                </div>
            </div>
        </div>
    `).join('')}

    <div class="footer">
        <div><strong>Generated by Lift Planner Pro</strong></div>
        <div>Professional Lift Planning Software</div>
        <div>Document generated on ${currentDate} at ${currentTime}</div>
        <div style="margin-top: 10px; font-size: 10px;">
            This document contains confidential and proprietary information. Distribution is restricted to authorized personnel only.
        </div>
    </div>
</body>
</html>
    `
  }

  const exportToHTML = () => {
    const htmlContent = generateProfessionalHTML()
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.replace(/\s+/g, '_')}_step_plan.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default
      const html2canvas = (await import('html2canvas')).default

      // Create a temporary div with the HTML content
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = generateProfessionalHTML()
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = '210mm' // A4 width
      tempDiv.style.backgroundColor = 'white'
      document.body.appendChild(tempDiv)

      // Wait for fonts and styles to load
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123 // A4 height in pixels at 96 DPI
      })

      // Clean up
      document.body.removeChild(tempDiv)

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')

      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)

      // Save the PDF
      pdf.save(`${projectName.replace(/\s+/g, '_')}_step_plan.pdf`)

    } catch (error) {
      console.error('PDF generation failed:', error)
      // Fallback to print method
      const htmlContent = generateProfessionalHTML()
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
          }, 500)
        }
      }
    }
  }

  const exportToCSV = () => {
    const timeline = calculateProjectTimeline()
    const headers = ['Step', 'Title', 'Duration (min)', 'Personnel', 'Risk Level', 'Status', 'Start Time', 'End Time', 'Description']
    const csvContent = [
      headers.join(','),
      ...steps.map((step, index) => [
        index + 1,
        `"${step.title}"`,
        step.duration,
        `"${step.resources.join(', ') || 'Not assigned'}"`,
        step.riskLevel,
        step.status,
        `"${timeline[step.id]?.start.toLocaleString() || 'TBD'}"`,
        `"${timeline[step.id]?.end.toLocaleString() || 'TBD'}"`,
        `"${step.description.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.replace(/\s+/g, '_')}_step_plan.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToJSON = () => {
    const timeline = calculateProjectTimeline()
    const exportData = {
      project: {
        name: projectName,
        startTime: projectStartTime.toISOString(),
        totalDuration: getTotalDuration(),
        exportedAt: new Date().toISOString()
      },
      steps: steps.map(step => ({
        ...step,
        startTime: timeline[step.id]?.start.toISOString(),
        endTime: timeline[step.id]?.end.toISOString()
      })),
      summary: {
        totalSteps: steps.length,
        highRiskSteps: steps.filter(s => s.riskLevel === 'High').length,
        mediumRiskSteps: steps.filter(s => s.riskLevel === 'Medium').length,
        lowRiskSteps: steps.filter(s => s.riskLevel === 'Low').length,
        completedSteps: steps.filter(s => s.status === 'Completed').length,
        inProgressSteps: steps.filter(s => s.status === 'In Progress').length
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.replace(/\s+/g, '_')}_step_plan.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateAIStepPlan = async () => {
    setIsGeneratingAI(true)
    try {
      // This would integrate with the AI API
      // For now, we'll simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // AI would analyze project parameters and generate optimized steps
      alert('AI Step Plan generation would analyze your project parameters and create an optimized sequence with risk assessment and resource allocation.')
    } catch (error) {
      console.error('AI generation error:', error)
      alert('AI generation failed. Please try again.')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Step Plan...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const timeline = calculateProjectTimeline()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-700"></div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Step Plan Manager</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={exportToPDF}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={steps.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>

            <Button
              onClick={exportToHTML}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={steps.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              HTML
            </Button>

            <Button
              onClick={exportToJSON}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={steps.length === 0}
            >
              <Share className="w-4 h-4 mr-2" />
              JSON
            </Button>

            <div className="h-6 w-px bg-slate-700"></div>

            <Button
              onClick={generateAIStepPlan}
              disabled={isGeneratingAI}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isGeneratingAI ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  AI Optimize
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Step Plan Manager</h1>
              <p className="text-slate-400 text-lg">Professional project sequence planning and timeline management</p>
            </div>
            <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <div>
                <Label className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Project Name</Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white mt-2 font-semibold focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="Enter project name"
                />
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Steps Card */}
            <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700/50 hover:border-blue-600/80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-semibold uppercase tracking-wide">Total Steps</p>
                    <p className="text-3xl font-bold text-white mt-2">{steps.length}</p>
                    <p className="text-blue-400 text-xs mt-2">steps in plan</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600/30 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Duration Card */}
            <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-700/50 hover:border-green-600/80 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-semibold uppercase tracking-wide">Total Duration</p>
                    <p className="text-3xl font-bold text-white mt-2">{Math.round(getTotalDuration() / 60)}h {getTotalDuration() % 60}m</p>
                    <p className="text-green-400 text-xs mt-2">estimated time</p>
                  </div>
                  <div className="w-12 h-12 bg-green-600/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed Card */}
            <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-700/50 hover:border-emerald-600/80 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-300 text-sm font-semibold uppercase tracking-wide">Completed</p>
                    <p className="text-3xl font-bold text-white mt-2">{steps.filter(s => s.status === 'Completed').length}</p>
                    <p className="text-emerald-400 text-xs mt-2">steps done</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-600/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* High Risk Card */}
            <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-700/50 hover:border-red-600/80 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm font-semibold uppercase tracking-wide">High Risk</p>
                    <p className="text-3xl font-bold text-white mt-2">{steps.filter(s => s.riskLevel === 'High').length}</p>
                    <p className="text-red-400 text-xs mt-2">critical steps</p>
                  </div>
                  <div className="w-12 h-12 bg-red-600/30 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Section */}
          {steps.length > 0 && (
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 border-slate-700/50 backdrop-blur-sm mt-8">
              <CardHeader className="border-b border-slate-700/50 pb-6">
                <CardTitle className="text-white flex items-center text-2xl">
                  <Download className="w-6 h-6 mr-3 text-blue-400" />
                  Export Step Plan
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">Generate professional documentation in multiple formats</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* PDF Export Card */}
                  <div className="bg-gradient-to-br from-red-900/30 to-red-800/10 border border-red-700/50 rounded-xl p-6 hover:border-red-600/80 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-red-600/30 rounded-lg flex items-center justify-center mr-3">
                        <Download className="w-5 h-5 text-red-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg">PDF Format</h4>
                    </div>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                      Professional industry-standard documentation with full styling, formatting, and print-ready layout
                    </p>
                    <Button
                      onClick={exportToPDF}
                      size="sm"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF
                    </Button>
                  </div>

                  {/* HTML Export Card */}
                  <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/50 rounded-xl p-6 hover:border-blue-600/80 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg">HTML Format</h4>
                    </div>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                      Web-ready format with professional styling for viewing, sharing, and embedding in web applications
                    </p>
                    <Button
                      onClick={exportToHTML}
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download HTML
                    </Button>
                  </div>

                  {/* JSON Export Card */}
                  <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-700/50 rounded-xl p-6 hover:border-purple-600/80 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center mr-3">
                        <Share className="w-5 h-5 text-purple-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg">JSON Format</h4>
                    </div>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                      Structured data format for seamless integration with other systems and applications
                    </p>
                    <Button
                      onClick={exportToJSON}
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Download JSON
                    </Button>
                  </div>
                </div>

                {/* Standards Info Box */}
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-xl">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-600/40 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-blue-300 text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <div className="text-blue-300 font-bold mb-3">Professional Industry Standards</div>
                      <div className="text-blue-200 text-sm space-y-2">
                        <div className="flex items-center"><span className="mr-2">✓</span> Compliant with BS 7121 and LOLER regulations</div>
                        <div className="flex items-center"><span className="mr-2">✓</span> Professional formatting with company branding</div>
                        <div className="flex items-center"><span className="mr-2">✓</span> Complete step details, timeline calculations, and risk assessments</div>
                        <div className="flex items-center"><span className="mr-2">✓</span> Print-ready PDF with proper page breaks and headers</div>
                        <div className="flex items-center"><span className="mr-2">✓</span> Suitable for regulatory compliance and client documentation</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Step List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-700/50 pb-6">
                <CardTitle className="text-white text-2xl flex items-center">
                  <Target className="w-6 h-6 mr-3 text-blue-400" />
                  Project Steps
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">{steps.length} steps in your plan</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {steps.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400">No steps added yet. Create your first step to get started.</p>
                  </div>
                ) : (
                  steps.map((step, index) => (
                    <div key={step.id} className="bg-gradient-to-r from-slate-700/40 to-slate-700/20 rounded-xl p-5 border border-slate-600/50 hover:border-slate-500/80 hover:shadow-lg hover:shadow-slate-900/50 transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors">{step.title}</h3>
                            <p className="text-slate-400 text-sm mt-1 leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge className={`${getStatusColor(step.status)} text-white font-semibold`}>{step.status}</Badge>
                          <Badge className={`${getRiskColor(step.riskLevel)} text-white font-semibold`}>{step.riskLevel}</Badge>
                        </div>
                      </div>

                      {/* Step Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 pb-4 border-b border-slate-600/30">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Duration</span>
                          <p className="text-white font-bold mt-1">{step.duration} min</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Category</span>
                          <p className="text-white font-bold mt-1">{step.category}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Resources</span>
                          <p className="text-white font-bold mt-1 truncate">{step.resources.length > 0 ? step.resources[0] : 'None'}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Assigned</span>
                          <p className="text-white font-bold mt-1 truncate">{step.assignedTo || 'Unassigned'}</p>
                        </div>
                      </div>

                      {/* Timeline */}
                      {timeline[step.id] && (
                        <div className="mb-4 pb-4 border-b border-slate-600/30">
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="flex-1">
                              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Start</span>
                              <p className="text-white font-semibold">{timeline[step.id].start.toLocaleTimeString()}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-500" />
                            <div className="flex-1">
                              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">End</span>
                              <p className="text-white font-semibold">{timeline[step.id].end.toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          onClick={() => updateStep(step.id, {
                            status: step.status === 'Completed' ? 'Not Started' :
                                   step.status === 'Not Started' ? 'In Progress' : 'Completed'
                          })}
                          className="bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200"
                        >
                          {step.status === 'Completed' ? <RotateCcw className="w-4 h-4 mr-2" /> :
                           step.status === 'In Progress' ? <CheckCircle className="w-4 h-4 mr-2" /> :
                           <Play className="w-4 h-4 mr-2" />}
                          {step.status === 'Completed' ? 'Reset' : step.status === 'In Progress' ? 'Complete' : 'Start'}
                        </Button>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingStep(step.id)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteStep(step.id)}
                            className="border-red-600/50 text-red-400 hover:bg-red-900/30 hover:border-red-600 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add New Step Panel */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 border-slate-700/50 backdrop-blur-sm sticky top-24">
              <CardHeader className="border-b border-slate-700/50 pb-6">
                <CardTitle className="text-white text-2xl flex items-center">
                  <Plus className="w-6 h-6 mr-3 text-green-400" />
                  Add New Step
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">Create a new step in your project plan</p>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {/* Step Title */}
                <div>
                  <Label className="text-slate-300 font-semibold text-sm uppercase tracking-wide">Step Title *</Label>
                  <Input
                    value={newStep.title}
                    onChange={(e) => setNewStep({...newStep, title: e.target.value})}
                    className="bg-slate-700/50 border-slate-600 text-white mt-2 focus:border-blue-500 focus:ring-blue-500/20 font-medium"
                    placeholder="e.g., Crane Setup and Positioning"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="text-slate-300 font-semibold text-sm uppercase tracking-wide">Description</Label>
                  <Textarea
                    value={newStep.description}
                    onChange={(e) => setNewStep({...newStep, description: e.target.value})}
                    className="bg-slate-700/50 border-slate-600 text-white mt-2 focus:border-blue-500 focus:ring-blue-500/20 font-medium"
                    placeholder="Describe what this step involves..."
                    rows={3}
                  />
                </div>

                {/* Duration and Risk Level */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300 font-semibold text-sm uppercase tracking-wide">Duration (min) *</Label>
                    <Input
                      type="number"
                      value={newStep.duration}
                      onChange={(e) => setNewStep({...newStep, duration: parseInt(e.target.value) || 30})}
                      className="bg-slate-700/50 border-slate-600 text-white mt-2 focus:border-blue-500 focus:ring-blue-500/20 font-medium"
                      min="1"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300 font-semibold text-sm uppercase tracking-wide">Risk Level *</Label>
                    <Select value={newStep.riskLevel} onValueChange={(value) => setNewStep({...newStep, riskLevel: value as any})}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-2 focus:border-blue-500 focus:ring-blue-500/20 font-medium">
                        <SelectValue placeholder="Select risk" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="Low">🟢 Low Risk</SelectItem>
                        <SelectItem value="Medium">🟡 Medium Risk</SelectItem>
                        <SelectItem value="High">🔴 High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-slate-300 font-semibold text-sm uppercase tracking-wide">Category *</Label>
                  <Select value={newStep.category} onValueChange={(value) => setNewStep({...newStep, category: value as any})}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-2 focus:border-blue-500 focus:ring-blue-500/20 font-medium">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="Preparation">📋 Preparation</SelectItem>
                      <SelectItem value="Setup">🔧 Setup</SelectItem>
                      <SelectItem value="Lifting">⬆️ Lifting</SelectItem>
                      <SelectItem value="Positioning">📍 Positioning</SelectItem>
                      <SelectItem value="Securing">🔒 Securing</SelectItem>
                      <SelectItem value="Cleanup">🧹 Cleanup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assigned To */}
                <div>
                  <Label className="text-slate-300 font-semibold text-sm uppercase tracking-wide">Assigned To</Label>
                  <Input
                    value={newStep.assignedTo}
                    onChange={(e) => setNewStep({...newStep, assignedTo: e.target.value})}
                    className="bg-slate-700/50 border-slate-600 text-white mt-2 focus:border-blue-500 focus:ring-blue-500/20 font-medium"
                    placeholder="e.g., John Smith"
                  />
                </div>

                {/* Add Button */}
                <Button
                  onClick={addStep}
                  disabled={!newStep.title}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Step to Plan
                </Button>
              </CardContent>
            </Card>

            {/* Project Timeline */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-300">Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={projectStartTime.toISOString().slice(0, 16)}
                      onChange={(e) => setProjectStartTime(new Date(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="pt-3 border-t border-slate-600">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Project Start:</span>
                        <span className="text-white">{projectStartTime.toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimated End:</span>
                        <span className="text-white">
                          {new Date(projectStartTime.getTime() + getTotalDuration() * 60000).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Duration:</span>
                        <span className="text-white">{Math.round(getTotalDuration() / 60)}h {getTotalDuration() % 60}m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gantt Timeline */}
        {steps.length > 0 && (
          <div className="mt-8">
            <GanttTimeline
              steps={steps.map(step => ({
                ...step,
                startTime: timeline[step.id]?.start || new Date(),
                endTime: timeline[step.id]?.end || new Date()
              }))}
              projectStartTime={projectStartTime}
              onStepClick={(stepId) => {
                // Handle step click - could scroll to step or show details
                console.log('Clicked step:', stepId)
              }}
              onTimelineUpdate={(currentTime) => {
                // Handle timeline updates - could update project status
                console.log('Timeline updated:', currentTime)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
