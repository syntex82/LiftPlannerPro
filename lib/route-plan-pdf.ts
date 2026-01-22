// Route Plan PDF Export Service

import {
  RouteOption,
  RoutePlan,
  LoadSpecifications,
  VehicleSpecifications,
  EmergencyContact,
  HAZARD_CONFIG,
  SEVERITY_COLORS
} from './route-planner-types'
import { GeoCoordinates } from './google-maps-cad'

interface RoutePlanPDFOptions {
  route: RouteOption
  startLocation: { coordinates: GeoCoordinates; address: string }
  endLocation: { coordinates: GeoCoordinates; address: string }
  waypoints: { coordinates: GeoCoordinates; address: string }[]
  loadSpecs: LoadSpecifications
  vehicleSpecs: VehicleSpecifications
  emergencyContacts: EmergencyContact[]
  mapImageDataUrl?: string
  projectName?: string
  notes?: string
}

// Format distance for display
function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

// Format duration for display
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins} min`
}

// Generate Route Plan PDF
export async function generateRoutePlanPDF(options: RoutePlanPDFOptions): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  let y = margin

  // Helper to add text
  const addText = (text: string, x: number, yPos: number, options?: { fontSize?: number; bold?: boolean; color?: string }) => {
    pdf.setFontSize(options?.fontSize || 10)
    pdf.setFont('helvetica', options?.bold ? 'bold' : 'normal')
    if (options?.color) {
      const hex = options.color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      pdf.setTextColor(r, g, b)
    } else {
      pdf.setTextColor(0, 0, 0)
    }
    pdf.text(text, x, yPos)
    return yPos + (options?.fontSize || 10) * 0.4
  }

  // Header
  pdf.setFillColor(30, 41, 59) // slate-800
  pdf.rect(0, 0, pageWidth, 25, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text('ROUTE PLAN - HEAVY LOAD TRANSPORT', margin, 16)
  
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - margin - 60, 16)
  
  y = 35

  // Safety Status Banner
  const severityColor = SEVERITY_COLORS[options.route.overallSeverity]
  pdf.setFillColor(...hexToRgb(severityColor))
  pdf.rect(margin, y, pageWidth - margin * 2, 10, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  const statusText = `ROUTE STATUS: ${options.route.overallSeverity.toUpperCase()} - Safety Score: ${options.route.safetyScore}/100`
  pdf.text(statusText, pageWidth / 2 - pdf.getTextWidth(statusText) / 2, y + 7)
  y += 18

  // Route Summary Section
  y = addText('ROUTE SUMMARY', margin, y, { fontSize: 12, bold: true })
  y += 2
  pdf.setDrawColor(200, 200, 200)
  pdf.line(margin, y, pageWidth - margin, y)
  y += 6

  // Two column layout for summary
  const col2 = pageWidth / 2
  y = addText(`From: ${options.startLocation.address.substring(0, 50)}...`, margin, y)
  y = addText(`To: ${options.endLocation.address.substring(0, 50)}...`, margin, y)
  y += 2
  const summaryY = y
  addText(`Total Distance: ${formatDistance(options.route.distance)}`, margin, y)
  addText(`Estimated Time: ${formatDuration(options.route.duration)}`, col2, y)
  y = addText(`Number of Hazards: ${options.route.hazards.length}`, margin, y + 5)
  
  if (options.waypoints.length > 0) {
    y = addText(`Waypoints: ${options.waypoints.length}`, col2, y - 5)
  }
  y += 8

  // Load & Vehicle Specifications
  y = addText('LOAD & VEHICLE SPECIFICATIONS', margin, y, { fontSize: 12, bold: true })
  y += 2
  pdf.line(margin, y, pageWidth - margin, y)
  y += 6

  // Load specs (left column)
  addText('Load Specifications:', margin, y, { bold: true })
  y = addText(`  Height: ${options.loadSpecs.height}m`, margin, y + 5)
  y = addText(`  Width: ${options.loadSpecs.width}m`, margin, y)
  y = addText(`  Length: ${options.loadSpecs.length}m`, margin, y)
  y = addText(`  Weight: ${options.loadSpecs.weight} tonnes`, margin, y)

  // Vehicle specs (right column)
  const specY = y - 20
  addText('Vehicle Specifications:', col2, specY - 5, { bold: true })
  addText(`  Total Height (loaded): ${options.vehicleSpecs.totalHeight}m`, col2, specY)
  addText(`  Axle Weight: ${options.vehicleSpecs.axleWeight}t`, col2, specY + 5)
  addText(`  Number of Axles: ${options.vehicleSpecs.numberOfAxles}`, col2, specY + 10)
  addText(`  Turning Radius: ${options.vehicleSpecs.turningRadius}m`, col2, specY + 15)
  
  y += 10

  // Hazards Section
  y = addText('IDENTIFIED HAZARDS', margin, y, { fontSize: 12, bold: true })
  y += 2
  pdf.line(margin, y, pageWidth - margin, y)
  y += 6

  if (options.route.hazards.length === 0) {
    y = addText('No hazards identified on this route.', margin, y, { color: '#22c55e' })
  } else {
    for (const hazard of options.route.hazards.slice(0, 10)) { // Limit to 10 hazards per page
      const config = HAZARD_CONFIG[hazard.type]
      const sevColor = SEVERITY_COLORS[hazard.severity]
      
      pdf.setFillColor(...hexToRgb(sevColor))
      pdf.circle(margin + 3, y - 1, 2, 'F')
      
      y = addText(`${config.label}: ${hazard.name || 'Unknown'}`, margin + 8, y, { bold: true })
      y = addText(`   ${hazard.description}`, margin + 8, y)
      
      if (hazard.clearance !== undefined) {
        const margin_val = hazard.clearance - options.vehicleSpecs.totalHeight
        const marginText = margin_val >= 0 
          ? `Clearance margin: ${margin_val.toFixed(2)}m` 
          : `INSUFFICIENT CLEARANCE: ${Math.abs(margin_val).toFixed(2)}m short`
        y = addText(`   ${marginText}`, margin + 8, y, { 
          color: margin_val >= 0 ? '#22c55e' : '#ef4444' 
        })
      }
      y += 3
    }
  }
  
  if (options.route.hazards.length > 10) {
    y = addText(`... and ${options.route.hazards.length - 10} more hazards`, margin, y)
  }

  y += 5

  // Check if we need a new page for directions
  if (y > pageHeight - 80) {
    pdf.addPage()
    y = margin
  }

  // Turn-by-Turn Directions
  y = addText('TURN-BY-TURN DIRECTIONS', margin, y, { fontSize: 12, bold: true })
  y += 2
  pdf.line(margin, y, pageWidth - margin, y)
  y += 6

  let stepNum = 1
  for (const step of options.route.steps.slice(0, 20)) { // Limit steps
    if (y > pageHeight - 30) {
      pdf.addPage()
      y = margin
    }

    const turnIcon = step.turnType === 'left' ? '⬅' :
                     step.turnType === 'right' ? '➡' :
                     step.turnType === 'u-turn' ? '↩' : '⬆'

    y = addText(`${stepNum}. ${step.instruction}`, margin, y)
    y = addText(`     Distance: ${formatDistance(step.distance)} | Road: ${step.roadName || 'Unknown'}`, margin, y, { color: '#6b7280' })

    if (step.hazards.length > 0) {
      y = addText(`     ⚠️ ${step.hazards.length} hazard(s) on this section`, margin, y, { color: '#f59e0b' })
    }
    y += 2
    stepNum++
  }

  if (options.route.steps.length > 20) {
    y = addText(`... and ${options.route.steps.length - 20} more steps`, margin, y)
  }

  // New page for emergency contacts
  pdf.addPage()
  y = margin

  // Emergency Contacts Section
  y = addText('EMERGENCY CONTACTS', margin, y, { fontSize: 12, bold: true })
  y += 2
  pdf.line(margin, y, pageWidth - margin, y)
  y += 6

  for (const contact of options.emergencyContacts) {
    if (contact.name || contact.phone) {
      y = addText(`${contact.role}:`, margin, y, { bold: true })
      if (contact.name) y = addText(`   Name: ${contact.name}`, margin, y)
      if (contact.phone) y = addText(`   Phone: ${contact.phone}`, margin, y)
      if (contact.email) y = addText(`   Email: ${contact.email}`, margin, y)
      y += 3
    }
  }

  y += 10

  // Notes Section
  y = addText('ADDITIONAL NOTES', margin, y, { fontSize: 12, bold: true })
  y += 2
  pdf.line(margin, y, pageWidth - margin, y)
  y += 6

  if (options.notes) {
    const lines = pdf.splitTextToSize(options.notes, pageWidth - margin * 2)
    for (const line of lines) {
      y = addText(line, margin, y)
    }
  } else {
    y = addText('No additional notes.', margin, y)
  }

  y += 15

  // Signature Section
  y = addText('DRIVER ACKNOWLEDGMENT', margin, y, { fontSize: 12, bold: true })
  y += 2
  pdf.line(margin, y, pageWidth - margin, y)
  y += 10

  addText('I confirm I have read and understood this route plan and all identified hazards.', margin, y)
  y += 15

  pdf.line(margin, y, margin + 60, y)
  pdf.line(col2, y, col2 + 60, y)
  y += 5
  addText('Driver Signature', margin, y)
  addText('Date', col2, y)

  y += 15
  pdf.line(margin, y, margin + 60, y)
  pdf.line(col2, y, col2 + 60, y)
  y += 5
  addText('Transport Manager Signature', margin, y)
  addText('Date', col2, y)

  // Footer
  pdf.setFillColor(30, 41, 59)
  pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(8)
  pdf.text('Generated by Lift Planner Pro - www.liftplannerpro.org', margin, pageHeight - 4)
  pdf.text(`Page ${pdf.getNumberOfPages()}`, pageWidth - margin - 15, pageHeight - 4)

  return pdf.output('blob')
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0]
}

// Download PDF helper
export async function downloadRoutePlanPDF(options: RoutePlanPDFOptions, filename?: string): Promise<void> {
  const blob = await generateRoutePlanPDF(options)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `route-plan-${new Date().toISOString().split('T')[0]}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

