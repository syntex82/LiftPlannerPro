import * as THREE from 'three'

/**
 * Export 3D scene to PDF with 2D projection
 */
export async function exportSceneToPDF(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  filename: string,
  options: {
    width?: number
    height?: number
    title?: string
    description?: string
    includeGrid?: boolean
    backgroundColor?: string
  } = {}
) {
  try {
    // Dynamic import of jsPDF and html2canvas
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(renderer.domElement, {
      backgroundColor: options.backgroundColor || '#ffffff',
      scale: 2
    })

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const imgData = canvas.toDataURL('image/png')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Add title
    if (options.title) {
      pdf.setFontSize(16)
      pdf.text(options.title, 10, 15)
    }

    // Add description
    if (options.description) {
      pdf.setFontSize(10)
      pdf.text(options.description, 10, 25)
    }

    // Add image
    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const yPosition = options.title ? 35 : 10

    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight)

    // Add metadata
    pdf.setFontSize(8)
    const timestamp = new Date().toLocaleString()
    pdf.text(`Generated: ${timestamp}`, 10, pageHeight - 10)

    pdf.save(filename)
    return { success: true, message: 'PDF exported successfully' }
  } catch (error) {
    console.error('PDF export error:', error)
    return { success: false, message: `PDF export failed: ${error}` }
  }
}

/**
 * Export 3D scene to SVG (2D projection)
 */
export async function exportSceneToSVG(
  scene: THREE.Scene,
  camera: THREE.Camera,
  filename: string,
  options: {
    width?: number
    height?: number
    title?: string
  } = {}
) {
  try {
    const { SVGRenderer } = await import('three/examples/jsm/renderers/SVGRenderer.js')
    
    const width = options.width || 1200
    const height = options.height || 800

    const svgRenderer = new SVGRenderer()
    svgRenderer.setSize(width, height)
    svgRenderer.render(scene, camera)

    const svgElement = svgRenderer.domElement
    const svgString = new XMLSerializer().serializeToString(svgElement)

    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)

    return { success: true, message: 'SVG exported successfully' }
  } catch (error) {
    console.error('SVG export error:', error)
    return { success: false, message: `SVG export failed: ${error}` }
  }
}

/**
 * Export 3D scene to PNG image
 */
export function exportSceneToPNG(
  renderer: THREE.WebGLRenderer,
  filename: string,
  options: {
    width?: number
    height?: number
  } = {}
) {
  try {
    const canvas = renderer.domElement
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = filename
    link.click()

    return { success: true, message: 'PNG exported successfully' }
  } catch (error) {
    console.error('PNG export error:', error)
    return { success: false, message: `PNG export failed: ${error}` }
  }
}

/**
 * Export 3D scene to technical drawing (blueprint style)
 */
export async function exportSceneToBlueprint(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  filename: string,
  options: {
    width?: number
    height?: number
    title?: string
    scale?: string
    projection?: 'orthographic' | 'perspective'
  } = {}
) {
  try {
    const { jsPDF } = await import('jspdf')
    
    // Create blueprint style canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = options.width || 1200
    canvas.height = options.height || 800

    // Blueprint background (dark blue)
    ctx.fillStyle = '#003366'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grid pattern
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 0.5
    const gridSize = 20
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Render scene to canvas
    const renderCanvas = renderer.domElement
    const imageData = renderCanvas.toDataURL('image/png')
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Add title
      if (options.title) {
        ctx.fillStyle = '#00ff00'
        ctx.font = 'bold 24px monospace'
        ctx.fillText(options.title, 20, 40)
      }

      // Add scale
      if (options.scale) {
        ctx.fillStyle = '#00ff00'
        ctx.font = '12px monospace'
        ctx.fillText(`Scale: ${options.scale}`, 20, canvas.height - 20)
      }

      // Export to PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const imgData = canvas.toDataURL('image/png')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      pdf.save(filename)
    }
    img.src = imageData

    return { success: true, message: 'Blueprint exported successfully' }
  } catch (error) {
    console.error('Blueprint export error:', error)
    return { success: false, message: `Blueprint export failed: ${error}` }
  }
}

/**
 * Generate technical drawing with dimensions
 */
export async function generateTechnicalDrawing(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  filename: string,
  dimensions: Array<{ label: string; value: string }>
) {
  try {
    const { jsPDF } = await import('jspdf')

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Render scene
    const canvas = renderer.domElement
    const imgData = canvas.toDataURL('image/png')

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Add title
    pdf.setFontSize(16)
    pdf.text('Technical Drawing', 10, 15)

    // Add image
    const imgWidth = pageWidth * 0.6
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight)

    // Add dimensions table
    const tableX = imgWidth + 20
    let tableY = 25

    pdf.setFontSize(12)
    pdf.text('Dimensions:', tableX, tableY)
    tableY += 10

    pdf.setFontSize(10)
    dimensions.forEach((dim) => {
      pdf.text(`${dim.label}: ${dim.value}`, tableX, tableY)
      tableY += 8
    })

    pdf.save(filename)
    return { success: true, message: 'Technical drawing exported successfully' }
  } catch (error) {
    console.error('Technical drawing export error:', error)
    return { success: false, message: `Technical drawing export failed: ${error}` }
  }
}

