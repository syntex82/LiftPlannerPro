/**
 * CAD Paper Sizes and Print Layout System
 * Supports standard ISO 216 paper sizes with WYSIWYG layout
 */

export interface PaperSize {
  id: string
  name: string
  width: number  // in mm
  height: number // in mm
  displayName: string
}

export interface PrintLayout {
  paperSize: PaperSize
  orientation: 'portrait' | 'landscape'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  scale: number
  centerDrawing: boolean
}

// Standard ISO 216 Paper Sizes
export const PAPER_SIZES: PaperSize[] = [
  {
    id: 'a4',
    name: 'A4',
    width: 210,
    height: 297,
    displayName: 'A4 (210 × 297 mm)'
  },
  {
    id: 'a3',
    name: 'A3',
    width: 297,
    height: 420,
    displayName: 'A3 (297 × 420 mm)'
  },
  {
    id: 'a2',
    name: 'A2',
    width: 420,
    height: 594,
    displayName: 'A2 (420 × 594 mm)'
  },
  {
    id: 'a1',
    name: 'A1',
    width: 594,
    height: 841,
    displayName: 'A1 (594 × 841 mm)'
  },
  {
    id: 'a0',
    name: 'A0',
    width: 841,
    height: 1189,
    displayName: 'A0 (841 × 1189 mm)'
  }
]

// Get paper size by ID
export const getPaperSize = (id: string): PaperSize | undefined => {
  return PAPER_SIZES.find(p => p.id === id)
}

// Calculate print dimensions in pixels (at 96 DPI)
export const calculatePrintDimensions = (
  paperSize: PaperSize,
  orientation: 'portrait' | 'landscape',
  dpi: number = 96
) => {
  const mmToInch = 1 / 25.4
  const widthInches = paperSize.width * mmToInch
  const heightInches = paperSize.height * mmToInch
  
  const widthPx = Math.round(widthInches * dpi)
  const heightPx = Math.round(heightInches * dpi)
  
  if (orientation === 'landscape') {
    return {
      width: heightPx,
      height: widthPx,
      widthMm: paperSize.height,
      heightMm: paperSize.width
    }
  }
  
  return {
    width: widthPx,
    height: heightPx,
    widthMm: paperSize.width,
    heightMm: paperSize.height
  }
}

// Calculate scale to fit drawing on paper
export const calculateFitScale = (
  drawingWidth: number,
  drawingHeight: number,
  paperWidth: number,
  paperHeight: number,
  margins: { top: number; right: number; bottom: number; left: number }
): number => {
  const availableWidth = paperWidth - margins.left - margins.right
  const availableHeight = paperHeight - margins.top - margins.bottom
  
  const scaleX = availableWidth / drawingWidth
  const scaleY = availableHeight / drawingHeight
  
  return Math.min(scaleX, scaleY, 1) // Don't scale up
}

// Get default print layout
export const getDefaultPrintLayout = (paperSizeId: string = 'a4'): PrintLayout => {
  const paperSize = getPaperSize(paperSizeId) || PAPER_SIZES[0]
  
  return {
    paperSize,
    orientation: 'landscape',
    margins: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    },
    scale: 1,
    centerDrawing: true
  }
}

// Convert mm to pixels at given DPI
export const mmToPixels = (mm: number, dpi: number = 96): number => {
  return Math.round((mm / 25.4) * dpi)
}

// Convert pixels to mm at given DPI
export const pixelsToMm = (pixels: number, dpi: number = 96): number => {
  return (pixels * 25.4) / dpi
}

