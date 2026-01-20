/**
 * Professional CAD Export Formats
 * Supports DWG, DXF, SVG, PDF, PNG, JPG, EPS
 */

export interface DrawingElement {
  id: string
  type: string
  points: Array<{ x: number; y: number }>
  style: {
    stroke: string
    strokeWidth: number
    fill?: string
    fillOpacity?: number
    lineType?: string
    fontSize?: number
    fontFamily?: string
  }
  text?: string
  layer?: string
}

export interface ExportOptions {
  format: string
  filename: string
  quality: 'low' | 'medium' | 'high' | 'ultra'
  resolution: number
  scale: number
  units: 'mm' | 'cm' | 'm' | 'in' | 'ft'
  includeMetadata: boolean
  includeLayers: boolean
  includeGrid: boolean
  includeDimensions: boolean
  paperSize: string
  orientation: 'portrait' | 'landscape'
  margins: number
  author: string
  title: string
  subject: string
  keywords: string
}

// DXF Export - Universal CAD format
export function generateDXFContent(
  elements: DrawingElement[],
  options: ExportOptions,
  canvasWidth: number,
  canvasHeight: number
): string {
  let dxf = `  0\nSECTION\n  2\nHEADER\n`
  dxf += `  9\n$ACADVER\n  1\nAC1021\n` // AutoCAD 2000 format
  dxf += `  9\n$EXTMIN\n 10\n0.0\n 20\n0.0\n`
  dxf += `  9\n$EXTMAX\n 10\n${canvasWidth}\n 20\n${canvasHeight}\n`
  dxf += `  0\nENDSEC\n`

  // Tables section
  dxf += `  0\nSECTION\n  2\nTABLES\n`
  dxf += `  0\nTABLE\n  2\nLAYER\n 70\n1\n`
  dxf += `  0\nLAYER\n  2\n0\n 70\n0\n 62\n7\n  6\nCONTINUOUS\n`
  dxf += `  0\nENDTAB\n`
  dxf += `  0\nENDSEC\n`

  // Entities section
  dxf += `  0\nSECTION\n  2\nENTITIES\n`

  elements.forEach(element => {
    switch (element.type) {
      case 'line':
        if (element.points.length >= 2) {
          dxf += `  0\nLINE\n  8\n0\n 10\n${element.points[0].x}\n 20\n${element.points[0].y}\n`
          dxf += ` 11\n${element.points[1].x}\n 21\n${element.points[1].y}\n`
        }
        break
      case 'rectangle':
        if (element.points.length >= 2) {
          const x1 = element.points[0].x
          const y1 = element.points[0].y
          const x2 = element.points[1].x
          const y2 = element.points[1].y
          // Draw rectangle as 4 lines
          dxf += `  0\nLINE\n  8\n0\n 10\n${x1}\n 20\n${y1}\n 11\n${x2}\n 21\n${y1}\n`
          dxf += `  0\nLINE\n  8\n0\n 10\n${x2}\n 20\n${y1}\n 11\n${x2}\n 21\n${y2}\n`
          dxf += `  0\nLINE\n  8\n0\n 10\n${x2}\n 20\n${y2}\n 11\n${x1}\n 21\n${y2}\n`
          dxf += `  0\nLINE\n  8\n0\n 10\n${x1}\n 20\n${y2}\n 11\n${x1}\n 21\n${y1}\n`
        }
        break
      case 'circle':
        if (element.points.length >= 2) {
          const radius = Math.sqrt(
            Math.pow(element.points[1].x - element.points[0].x, 2) +
            Math.pow(element.points[1].y - element.points[0].y, 2)
          )
          dxf += `  0\nCIRCLE\n  8\n0\n 10\n${element.points[0].x}\n 20\n${element.points[0].y}\n 40\n${radius}\n`
        }
        break
      case 'text':
        if (element.text) {
          dxf += `  0\nTEXT\n  8\n0\n 10\n${element.points[0].x}\n 20\n${element.points[0].y}\n`
          dxf += ` 40\n${element.style.fontSize || 10}\n  1\n${element.text}\n`
        }
        break
    }
  })

  dxf += `  0\nENDSEC\n  0\nEOF\n`
  return dxf
}

// SVG Export - Vector format
export function generateSVGContent(
  elements: DrawingElement[],
  options: ExportOptions,
  canvasWidth: number,
  canvasHeight: number
): string {
  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`
  svg += `<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">\n`
  svg += `  <defs>\n    <style>\n      .grid { stroke: #e0e0e0; stroke-width: 0.5; }\n    </style>\n  </defs>\n`

  // Add grid if requested
  if (options.includeGrid) {
    const gridSize = 50
    for (let x = 0; x < canvasWidth; x += gridSize) {
      svg += `  <line x1="${x}" y1="0" x2="${x}" y2="${canvasHeight}" class="grid"/>\n`
    }
    for (let y = 0; y < canvasHeight; y += gridSize) {
      svg += `  <line x1="0" y1="${y}" x2="${canvasWidth}" y2="${y}" class="grid"/>\n`
    }
  }

  // Add elements
  elements.forEach(element => {
    switch (element.type) {
      case 'line':
        if (element.points.length >= 2) {
          svg += `  <line x1="${element.points[0].x}" y1="${element.points[0].y}" `
          svg += `x2="${element.points[1].x}" y2="${element.points[1].y}" `
          svg += `stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}"/>\n`
        }
        break
      case 'rectangle':
        if (element.points.length >= 2) {
          const width = element.points[1].x - element.points[0].x
          const height = element.points[1].y - element.points[0].y
          svg += `  <rect x="${element.points[0].x}" y="${element.points[0].y}" `
          svg += `width="${width}" height="${height}" `
          svg += `stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}" `
          svg += `fill="${element.style.fill || 'none'}"/>\n`
        }
        break
      case 'circle':
        if (element.points.length >= 2) {
          const radius = Math.sqrt(
            Math.pow(element.points[1].x - element.points[0].x, 2) +
            Math.pow(element.points[1].y - element.points[0].y, 2)
          )
          svg += `  <circle cx="${element.points[0].x}" cy="${element.points[0].y}" `
          svg += `r="${radius}" stroke="${element.style.stroke}" `
          svg += `stroke-width="${element.style.strokeWidth}" fill="${element.style.fill || 'none'}"/>\n`
        }
        break
      case 'text':
        if (element.text) {
          svg += `  <text x="${element.points[0].x}" y="${element.points[0].y}" `
          svg += `font-size="${element.style.fontSize || 12}" font-family="${element.style.fontFamily || 'Arial'}">`
          svg += `${element.text}</text>\n`
        }
        break
    }
  })

  svg += `</svg>\n`
  return svg
}

// EPS Export - PostScript format for printing
export function generateEPSContent(
  elements: DrawingElement[],
  options: ExportOptions,
  canvasWidth: number,
  canvasHeight: number
): string {
  let eps = `%!PS-Adobe-3.0 EPSF-3.0\n`
  eps += `%%BoundingBox: 0 0 ${canvasWidth} ${canvasHeight}\n`
  eps += `%%Title: ${options.title}\n`
  eps += `%%Creator: LiftPlanner CAD\n`
  eps += `%%CreationDate: ${new Date().toISOString()}\n`
  eps += `%%EndComments\n\n`

  eps += `/setlinewidth { setlinewidth } def\n`
  eps += `/moveto { moveto } def\n`
  eps += `/lineto { lineto } def\n`
  eps += `/stroke { stroke } def\n\n`

  elements.forEach(element => {
    switch (element.type) {
      case 'line':
        if (element.points.length >= 2) {
          eps += `${element.style.strokeWidth} setlinewidth\n`
          eps += `${element.points[0].x} ${element.points[0].y} moveto\n`
          eps += `${element.points[1].x} ${element.points[1].y} lineto\n`
          eps += `stroke\n`
        }
        break
      case 'rectangle':
        if (element.points.length >= 2) {
          const width = element.points[1].x - element.points[0].x
          const height = element.points[1].y - element.points[0].y
          eps += `${element.style.strokeWidth} setlinewidth\n`
          eps += `${element.points[0].x} ${element.points[0].y} moveto\n`
          eps += `${width} 0 rlineto\n`
          eps += `0 ${height} rlineto\n`
          eps += `${-width} 0 rlineto\n`
          eps += `closepath stroke\n`
        }
        break
    }
  })

  eps += `\n%%EOF\n`
  return eps
}

// Utility to convert hex color to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 255, g: 255, b: 255 }
}

// Utility to download file
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

