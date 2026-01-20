"use client"

import React, { useState, useRef, useEffect } from 'react'
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
import { FileDown, Eye, Download } from 'lucide-react'
import { PAPER_SIZES, calculatePrintDimensions, PrintLayout, getDefaultPrintLayout } from '@/lib/cad-paper-sizes'
import { DrawingElement } from '@/lib/cad-drawing-tools'

interface CADExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: string, options: any) => void
  elements: any[]
  canvasRef: React.RefObject<HTMLCanvasElement>
  isExporting?: boolean
}

export default function CADExportDialog({
  isOpen,
  onClose,
  onExport,
  elements,
  canvasRef,
  isExporting = false
}: CADExportDialogProps) {
  const [format, setFormat] = useState<'pdf' | 'dwg' | 'dxf'>('pdf')
  const [paperSize, setPaperSize] = useState('a4')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')
  const [filename, setFilename] = useState('drawing')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [author, setAuthor] = useState('Lift Planner Pro')
  const [title, setTitle] = useState('CAD Drawing')
  const [scale, setScale] = useState(1)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Update preview when settings change
  useEffect(() => {
    if (previewCanvasRef.current && canvasRef.current) {
      drawPreview()
    }
  }, [paperSize, orientation, scale])

  const drawPreview = () => {
    const previewCanvas = previewCanvasRef.current
    const sourceCanvas = canvasRef.current
    
    if (!previewCanvas || !sourceCanvas) return

    const ctx = previewCanvas.getContext('2d')
    if (!ctx) return

    // Get paper dimensions
    const paperSizeObj = PAPER_SIZES.find(p => p.id === paperSize)
    if (!paperSizeObj) return

    const dims = calculatePrintDimensions(paperSizeObj, orientation)
    
    // Set preview canvas size (scaled down for display)
    const displayScale = 0.3
    previewCanvas.width = dims.width * displayScale
    previewCanvas.height = dims.height * displayScale

    // Draw paper background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height)

    // Draw border
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, previewCanvas.width, previewCanvas.height)

    // Draw margins
    const marginPx = 10 * displayScale
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.strokeRect(marginPx, marginPx, previewCanvas.width - marginPx * 2, previewCanvas.height - marginPx * 2)
    ctx.setLineDash([])

    // Draw scaled drawing preview
    ctx.drawImage(
      sourceCanvas,
      marginPx,
      marginPx,
      previewCanvas.width - marginPx * 2,
      previewCanvas.height - marginPx * 2
    )
  }

  const handleExport = () => {
    const fileExtensions: Record<string, string> = {
      pdf: '.pdf',
      dwg: '.dwg',
      dxf: '.dxf'
    }

    const finalFilename = filename + fileExtensions[format]

    onExport(format, {
      format,
      filename: finalFilename,
      paperSize,
      orientation,
      scale,
      includeMetadata,
      author,
      title
    })

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Export CAD Drawing
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure export settings and preview your drawing layout
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2 overflow-y-auto flex-1 min-h-0">
          {/* Settings Panel */}
          <div className="space-y-2 overflow-visible">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="py-2 px-4">
                <CardTitle className="text-white text-xs">Export Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 py-2 px-4">
                <div>
                  <Label className="text-slate-300 text-xs">Format</Label>
                  <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 z-50">
                      <SelectItem value="pdf">📄 PDF (Portable Document)</SelectItem>
                      <SelectItem value="dxf">📐 DXF (Drawing Exchange)</SelectItem>
                      <SelectItem value="dwg">🏗️ DWG (AutoCAD Format)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300 text-xs">Paper Size</Label>
                  <Select value={paperSize} onValueChange={setPaperSize}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {PAPER_SIZES.map(size => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300 text-xs">Orientation</Label>
                  <Select value={orientation} onValueChange={(v: any) => setOrientation(v)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300 text-xs">Scale</Label>
                  <Input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="bg-slate-700 border-slate-600 text-white h-8 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 text-xs">Filename</Label>
                  <Input
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white h-8 text-xs"
                    placeholder="drawing"
                  />
                </div>

                <div className="pt-1 border-t border-slate-700">
                  <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                      className="rounded"
                    />
                    Include Metadata
                  </label>
                </div>

                {includeMetadata && (
                  <>
                    <div>
                      <Label className="text-slate-300 text-xs">Author</Label>
                      <Input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-xs">Title</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="py-2 px-4">
                <CardTitle className="text-white text-xs flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  Print Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center bg-slate-700/50 rounded p-2">
                <canvas
                  ref={previewCanvasRef}
                  className="border border-slate-600 bg-white"
                  style={{ maxWidth: '100%', maxHeight: '250px' }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t border-slate-700 pt-3 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-slate-300 h-8 text-xs"
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 h-8 text-xs"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-3 h-3" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

