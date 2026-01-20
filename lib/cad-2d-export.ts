/**
 * 2D CAD Export Formats
 * Supports PDF, DWG, and DXF export
 */

import { DrawingElement } from '@/lib/cad-drawing-tools'
import { PrintLayout, mmToPixels } from './cad-paper-sizes'

export interface ExportOptions {
  format: 'pdf' | 'dwg' | 'dxf'
  filename: string
  paperSize: string
  orientation: 'portrait' | 'landscape'
  scale: number
  includeMetadata: boolean
  author?: string
  title?: string
}

/**
 * Generate PDF content using canvas
 */
export const generatePDF = async (
  canvas: HTMLCanvasElement,
  elements: DrawingElement[],
  layout: PrintLayout,
  options: ExportOptions
): Promise<Blob> => {
  // Dynamic import of jsPDF to avoid SSR issues
  const { jsPDF } = await import('jspdf')
  
  const orientation = options.orientation === 'landscape' ? 'l' : 'p'
  const paperSize = options.paperSize.toLowerCase()
  
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: paperSize as any
  })
  
  // Add metadata
  if (options.includeMetadata) {
    pdf.setProperties({
      title: options.title || 'CAD Drawing',
      author: options.author || 'Lift Planner Pro',
      subject: 'CAD Drawing Export',
      keywords: 'CAD, Drawing, Export'
    })
  }
  
  // Get canvas image
  const imgData = canvas.toDataURL('image/png')
  
  // Calculate dimensions
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const availableWidth = pageWidth - (margin * 2)
  const availableHeight = pageHeight - (margin * 2)
  
  // Calculate aspect ratio and fit
  const canvasAspect = canvas.width / canvas.height
  let imgWidth = availableWidth
  let imgHeight = imgWidth / canvasAspect
  
  if (imgHeight > availableHeight) {
    imgHeight = availableHeight
    imgWidth = imgHeight * canvasAspect
  }
  
  // Center on page
  const x = (pageWidth - imgWidth) / 2
  const y = (pageHeight - imgHeight) / 2
  
  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
  
  return pdf.output('blob')
}

// Helper function to convert hex color to DXF color code
function getColorCode(hexColor: string): number {
  // Map common colors to DXF color codes (1-255)
  const colorMap: Record<string, number> = {
    '#ff0000': 1,   // Red
    '#ffff00': 2,   // Yellow
    '#00ff00': 3,   // Green
    '#00ffff': 4,   // Cyan
    '#0000ff': 5,   // Blue
    '#ff00ff': 6,   // Magenta
    '#ffffff': 7,   // White
    '#3b82f6': 5,   // Blue (default)
    '#000000': 0,   // Black
  }

  return colorMap[hexColor.toLowerCase()] || 256 // 256 = use layer color
}

/**
 * Generate DXF content
 * DXF is a text-based format used by AutoCAD
 * Format: code on one line, value on next line
 */
export const generateDXF = (
  elements: DrawingElement[],
  layout: PrintLayout,
  options: ExportOptions
): string => {
  let dxf = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1021
9
$EXTMIN
10
0.0
20
0.0
9
$EXTMAX
10
1000.0
20
1000.0
0
ENDSEC
0
SECTION
2
ENTITIES
`

  // Add elements to DXF
  elements.forEach(element => {
    const layerName = element.layer || '0'
    const colorCode = getColorCode(element.style?.stroke || '#3b82f6')

    if (element.type === 'line' && element.points.length >= 2) {
      const p1 = element.points[0]
      const p2 = element.points[1]

      dxf += `0
LINE
8
${layerName}
62
${colorCode}
10
${p1.x}
20
${p1.y}
11
${p2.x}
21
${p2.y}
`
    } else if (element.type === 'rectangle' && element.points.length >= 2) {
      const p1 = element.points[0]
      const p2 = element.points[1]

      // Draw rectangle as 4 lines
      const corners = [
        [p1.x, p1.y],
        [p2.x, p1.y],
        [p2.x, p2.y],
        [p1.x, p2.y],
        [p1.x, p1.y]
      ]

      for (let i = 0; i < corners.length - 1; i++) {
        dxf += `0
LINE
8
${layerName}
62
${colorCode}
10
${corners[i][0]}
20
${corners[i][1]}
11
${corners[i + 1][0]}
21
${corners[i + 1][1]}
`
      }
    } else if (element.type === 'circle' && element.points.length >= 1) {
      const center = element.points[0]
      const radius = element.radius || 50

      dxf += `0
CIRCLE
8
${layerName}
62
${colorCode}
10
${center.x}
20
${center.y}
40
${radius}
`
    } else if (element.type === 'arc' && element.points.length >= 1) {
      const center = element.points[0]
      const radius = element.radius || 50
      const startAngle = (element.startAngle || 0) * (180 / Math.PI)
      const endAngle = (element.endAngle || Math.PI * 2) * (180 / Math.PI)

      dxf += `0
ARC
8
${layerName}
62
${colorCode}
10
${center.x}
20
${center.y}
40
${radius}
50
${startAngle}
51
${endAngle}
`
    } else if (element.type === 'polyline' && element.points.length >= 2) {
      dxf += `0
LWPOLYLINE
8
${layerName}
62
${colorCode}
90
${element.points.length}
`
      element.points.forEach(point => {
        dxf += `10
${point.x}
20
${point.y}
`
      })
    } else if (element.type === 'text' && element.text) {
      const pos = element.points[0]
      dxf += `0
TEXT
8
${layerName}
62
${colorCode}
10
${pos.x}
20
${pos.y}
1
${element.text}
40
${element.style.fontSize || 10}
`
    } else if (element.type === 'dimension' && element.points.length >= 2) {
      // Export dimension as text with line
      const p1 = element.points[0]
      const p2 = element.points[1]
      const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))

      dxf += `0
LINE
8
${layerName}
62
${colorCode}
10
${p1.x}
20
${p1.y}
11
${p2.x}
21
${p2.y}
`

      dxf += `0
TEXT
8
${layerName}
62
${colorCode}
10
${(p1.x + p2.x) / 2}
20
${(p1.y + p2.y) / 2}
1
${distance.toFixed(2)}
40
${element.style.fontSize || 10}
`
    }
  })

  dxf += `0
ENDSEC
0
EOF
`

  return dxf
}

/**
 * Generate DWG-like format (simplified)
 * Note: True DWG is proprietary. This generates a DXF-compatible format
 */
export const generateDWG = (
  elements: DrawingElement[],
  layout: PrintLayout,
  options: ExportOptions
): string => {
  // DWG is binary and proprietary, so we export as DXF instead
  // which can be opened by AutoCAD and converted to DWG
  return generateDXF(elements, layout, options)
}

/**
 * Download file helper
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export drawing to specified format
 */
export const exportDrawing = async (
  canvas: HTMLCanvasElement,
  elements: DrawingElement[],
  layout: PrintLayout,
  options: ExportOptions
) => {
  let blob: Blob
  
  switch (options.format) {
    case 'pdf':
      blob = await generatePDF(canvas, elements, layout, options)
      break
    case 'dxf':
      const dxfContent = generateDXF(elements, layout, options)
      blob = new Blob([dxfContent], { type: 'application/dxf' })
      break
    case 'dwg':
      const dwgContent = generateDWG(elements, layout, options)
      blob = new Blob([dwgContent], { type: 'application/dwg' })
      break
    default:
      throw new Error(`Unsupported format: ${options.format}`)
  }
  
  downloadFile(blob, options.filename)
}

