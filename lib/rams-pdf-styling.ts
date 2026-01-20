/**
 * Professional RAMS PDF Styling Utilities
 * Provides consistent, professional styling for RAMS PDF documents
 */

export interface PDFColors {
  primary: [number, number, number]
  secondary: [number, number, number]
  accent: [number, number, number]
  success: [number, number, number]
  warning: [number, number, number]
  danger: [number, number, number]
  text: [number, number, number]
  lightText: [number, number, number]
  background: [number, number, number]
  border: [number, number, number]
}

export const professionalColors: PDFColors = {
  primary: [30, 41, 59],        // Slate-800
  secondary: [51, 65, 85],      // Slate-700
  accent: [99, 102, 241],       // Indigo-500
  success: [34, 197, 94],       // Green-500
  warning: [245, 158, 11],      // Amber-500
  danger: [239, 68, 68],        // Red-500
  text: [0, 0, 0],              // Black
  lightText: [255, 255, 255],   // White
  background: [240, 240, 240],  // Light gray
  border: [200, 200, 200]       // Medium gray
}

export interface PDFStyleConfig {
  pageWidth: number
  pageHeight: number
  marginLeft: number
  marginRight: number
  marginTop: number
  marginBottom: number
  contentWidth: number
}

export const defaultPDFConfig: PDFStyleConfig = {
  pageWidth: 210,
  pageHeight: 297,
  marginLeft: 20,
  marginRight: 20,
  marginTop: 20,
  marginBottom: 20,
  contentWidth: 170
}

export class RAMSPDFStyler {
  private doc: any
  private config: PDFStyleConfig
  private colors: PDFColors

  constructor(doc: any, config: PDFStyleConfig = defaultPDFConfig, colors: PDFColors = professionalColors) {
    this.doc = doc
    this.config = config
    this.colors = colors
  }

  /**
   * Add professional header with company branding
   */
  addHeader(title: string, subtitle: string, yPos: number = 0): number {
    // Header background
    this.doc.setFillColor(...this.colors.primary)
    this.doc.rect(0, yPos, this.config.pageWidth, 40, 'F')

    // Title
    this.doc.setTextColor(...this.colors.lightText)
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.config.pageWidth / 2, yPos + 15, { align: 'center' })

    // Subtitle
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(subtitle, this.config.pageWidth / 2, yPos + 28, { align: 'center' })

    return yPos + 45
  }

  /**
   * Add document control box
   */
  addDocumentControl(docNumber: string, issue: string, date: string, yPos: number): number {
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFillColor(...this.colors.background)
    this.doc.rect(this.config.marginLeft + 100, yPos, 55, 25, 'F')
    this.doc.rect(this.config.marginLeft + 100, yPos, 55, 25, 'S')

    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Document Control', this.config.marginLeft + 127.5, yPos + 5, { align: 'center' })

    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Doc No: ${docNumber}`, this.config.marginLeft + 102, yPos + 10)
    this.doc.text(`Issue: ${issue}`, this.config.marginLeft + 102, yPos + 15)
    this.doc.text(`Date: ${date}`, this.config.marginLeft + 102, yPos + 20)

    return yPos + 30
  }

  /**
   * Add section heading with background color
   */
  addSectionHeading(text: string, yPos: number, colorKey: keyof PDFColors = 'accent'): number {
    const color = this.colors[colorKey]
    this.doc.setFillColor(...color)
    this.doc.rect(this.config.marginLeft, yPos, this.config.contentWidth, 8, 'F')

    this.doc.setTextColor(...this.colors.lightText)
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text, this.config.marginLeft + 5, yPos + 5)

    return yPos + 12
  }

  /**
   * Add subsection heading
   */
  addSubsectionHeading(text: string, yPos: number): number {
    this.doc.setTextColor(...this.colors.primary)
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text, this.config.marginLeft, yPos)

    return yPos + 8
  }

  /**
   * Add body text with automatic line wrapping
   */
  addBodyText(text: string, yPos: number, fontSize: number = 10): number {
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'normal')

    const lines = this.doc.splitTextToSize(text, this.config.contentWidth)
    this.doc.text(lines, this.config.marginLeft, yPos)

    return yPos + lines.length * 4 + 5
  }

  /**
   * Add a professional table
   */
  addTable(
    headers: string[],
    rows: string[][],
    yPos: number,
    columnWidths?: number[]
  ): number {
    const cellHeight = 7
    const headerHeight = 8
    const defaultColWidth = this.config.contentWidth / headers.length

    if (!columnWidths) {
      columnWidths = headers.map(() => defaultColWidth)
    }

    let currentX = this.config.marginLeft
    let currentY = yPos

    // Draw header
    this.doc.setFillColor(...this.colors.accent)
    this.doc.setTextColor(...this.colors.lightText)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')

    headers.forEach((header, index) => {
      this.doc.rect(currentX, currentY, columnWidths![index], headerHeight, 'F')
      this.doc.text(header, currentX + 2, currentY + 5)
      currentX += columnWidths![index]
    })

    currentY += headerHeight
    currentX = this.config.marginLeft

    // Draw rows
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'normal')

    rows.forEach((row, rowIndex) => {
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(245, 245, 245)
        currentX = this.config.marginLeft
        this.doc.rect(currentX, currentY, this.config.contentWidth, cellHeight, 'F')
      }

      currentX = this.config.marginLeft
      row.forEach((cell, colIndex) => {
        this.doc.text(cell, currentX + 2, currentY + 4)
        currentX += columnWidths![colIndex]
      })

      currentY += cellHeight
    })

    // Draw borders
    this.doc.setDrawColor(...this.colors.border)
    this.doc.setLineWidth(0.5)
    currentX = this.config.marginLeft
    headers.forEach((_, index) => {
      this.doc.rect(currentX, yPos, columnWidths![index], headerHeight + rows.length * cellHeight)
      currentX += columnWidths![index]
    })

    return currentY + 5
  }

  /**
   * Add a highlighted information box
   */
  addInfoBox(title: string, content: string, yPos: number, colorKey: keyof PDFColors = 'accent'): number {
    const color = this.colors[colorKey]
    const boxHeight = 25

    // Background
    this.doc.setFillColor(...color)
    this.doc.setAlpha(0.1)
    this.doc.rect(this.config.marginLeft, yPos, this.config.contentWidth, boxHeight, 'F')
    this.doc.setAlpha(1)

    // Border
    this.doc.setDrawColor(...color)
    this.doc.setLineWidth(1)
    this.doc.rect(this.config.marginLeft, yPos, this.config.contentWidth, boxHeight)

    // Title
    this.doc.setTextColor(...color)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.config.marginLeft + 5, yPos + 5)

    // Content
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'normal')
    const lines = this.doc.splitTextToSize(content, this.config.contentWidth - 10)
    this.doc.text(lines, this.config.marginLeft + 5, yPos + 12)

    return yPos + boxHeight + 5
  }

  /**
   * Add a bulleted list
   */
  addBulletList(items: string[], yPos: number, fontSize: number = 9): number {
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'normal')

    let currentY = yPos
    items.forEach(item => {
      const lines = this.doc.splitTextToSize(`• ${item}`, this.config.contentWidth - 5)
      this.doc.text(lines, this.config.marginLeft + 5, currentY)
      currentY += lines.length * 4 + 2
    })

    return currentY + 3
  }

  /**
   * Add footer with page numbers
   */
  addFooter(text: string): void {
    const pageCount = this.doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'italic')
      this.doc.setTextColor(...this.colors.border)
      this.doc.text(text, this.config.pageWidth / 2, this.config.pageHeight - 5, { align: 'center' })
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.config.pageWidth / 2,
        this.config.pageHeight - 2,
        { align: 'center' }
      )
    }
  }

  /**
   * Check if we need a new page and add one if necessary
   */
  checkPageBreak(currentY: number, requiredSpace: number = 30): number {
    if (currentY + requiredSpace > this.config.pageHeight - this.config.marginBottom) {
      this.doc.addPage()
      return this.config.marginTop
    }
    return currentY
  }

  /**
   * Add a risk matrix visualization
   */
  addRiskMatrix(yPos: number): number {
    const cellSize = 20
    const startX = this.config.marginLeft + 10
    const startY = yPos

    // Title
    this.doc.setTextColor(...this.colors.primary)
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('RISK ASSESSMENT MATRIX', startX, startY)

    let currentY = startY + 10

    // Risk levels
    const riskLevels = [
      { label: 'CRITICAL', color: [220, 38, 127] },
      { label: 'HIGH', color: [239, 68, 68] },
      { label: 'MEDIUM', color: [245, 158, 11] },
      { label: 'LOW', color: [34, 197, 94] }
    ]

    riskLevels.forEach(level => {
      this.doc.setFillColor(...level.color)
      this.doc.rect(startX, currentY, 15, 6, 'F')
      this.doc.setTextColor(...this.colors.lightText)
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(level.label, startX + 2, currentY + 4)
      currentY += 8
    })

    return currentY + 5
  }
}

export function createRAMSPDFStyler(doc: any): RAMSPDFStyler {
  return new RAMSPDFStyler(doc)
}

