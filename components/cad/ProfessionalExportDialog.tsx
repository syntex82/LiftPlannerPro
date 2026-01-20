"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileDown, Settings, X, Download, Info } from 'lucide-react'

interface ExportFormat {
  id: string
  name: string
  description: string
  extension: string
  category: 'cad' | 'vector' | 'raster' | 'document'
  supportsLayers: boolean
  supportsMetadata: boolean
  supportsScale: boolean
  icon: string
}

interface ExportOptions {
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
  paperSize: 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'Letter' | 'Tabloid'
  orientation: 'portrait' | 'landscape'
  margins: number
  author: string
  title: string
  subject: string
  keywords: string
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'dwg',
    name: 'DWG (AutoCAD)',
    description: 'Industry-standard CAD format. Best for professional CAD software compatibility.',
    extension: '.dwg',
    category: 'cad',
    supportsLayers: true,
    supportsMetadata: true,
    supportsScale: true,
    icon: '📐'
  },
  {
    id: 'dxf',
    name: 'DXF (Drawing Exchange)',
    description: 'Universal CAD format. Compatible with all CAD software.',
    extension: '.dxf',
    category: 'cad',
    supportsLayers: true,
    supportsMetadata: true,
    supportsScale: true,
    icon: '📋'
  },
  {
    id: 'svg',
    name: 'SVG (Scalable Vector)',
    description: 'Vector format for web and print. Infinitely scalable.',
    extension: '.svg',
    category: 'vector',
    supportsLayers: false,
    supportsMetadata: true,
    supportsScale: true,
    icon: '🎨'
  },
  {
    id: 'pdf',
    name: 'PDF (Portable Document)',
    description: 'Professional document format. Best for sharing and printing.',
    extension: '.pdf',
    category: 'document',
    supportsLayers: false,
    supportsMetadata: true,
    supportsScale: true,
    icon: '📄'
  },
  {
    id: 'eps',
    name: 'EPS (PostScript)',
    description: 'Professional printing format. Used by print shops.',
    extension: '.eps',
    category: 'vector',
    supportsLayers: false,
    supportsMetadata: true,
    supportsScale: true,
    icon: '🖨️'
  },
  {
    id: 'png',
    name: 'PNG (Raster Image)',
    description: 'High-quality raster format with transparency support.',
    extension: '.png',
    category: 'raster',
    supportsLayers: false,
    supportsMetadata: false,
    supportsScale: false,
    icon: '🖼️'
  },
  {
    id: 'jpg',
    name: 'JPG (JPEG Image)',
    description: 'Compressed raster format. Smaller file size.',
    extension: '.jpg',
    category: 'raster',
    supportsLayers: false,
    supportsMetadata: false,
    supportsScale: false,
    icon: '📸'
  }
]

interface ProfessionalExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: string, options: ExportOptions) => void
  projectName: string
}

export default function ProfessionalExportDialog({
  isOpen,
  onClose,
  onExport,
  projectName
}: ProfessionalExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState('pdf')
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    filename: projectName || 'drawing',
    quality: 'high',
    resolution: 300,
    scale: 1,
    units: 'mm',
    includeMetadata: true,
    includeLayers: true,
    includeGrid: false,
    includeDimensions: true,
    paperSize: 'A4',
    orientation: 'landscape',
    margins: 10,
    author: '',
    title: projectName || 'CAD Drawing',
    subject: 'CAD Drawing Export',
    keywords: 'cad,drawing,export'
  })

  const selectedFormatInfo = EXPORT_FORMATS.find(f => f.id === selectedFormat)

  const handleExport = () => {
    const finalOptions = {
      ...options,
      format: selectedFormat,
      filename: options.filename + (selectedFormatInfo?.extension || '')
    }
    onExport(selectedFormat, finalOptions)
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Professional Export
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose export format and configure options for your CAD drawing
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="format" className="text-slate-300">Format</TabsTrigger>
            <TabsTrigger value="options" className="text-slate-300">Options</TabsTrigger>
            <TabsTrigger value="metadata" className="text-slate-300">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {EXPORT_FORMATS.map(format => (
                <Card
                  key={format.id}
                  className={`p-3 cursor-pointer transition-all ${
                    selectedFormat === format.id
                      ? 'bg-blue-900 border-blue-500'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedFormat(format.id)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{format.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">{format.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{format.description}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {format.supportsLayers && <span className="text-xs bg-slate-700 px-2 py-1 rounded">Layers</span>}
                        {format.supportsMetadata && <span className="text-xs bg-slate-700 px-2 py-1 rounded">Metadata</span>}
                        {format.supportsScale && <span className="text-xs bg-slate-700 px-2 py-1 rounded">Scale</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-300">Filename</label>
                <Input
                  value={options.filename}
                  onChange={(e) => setOptions(prev => ({ ...prev, filename: e.target.value }))}
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                  placeholder="Enter filename"
                />
              </div>

              {['raster', 'document'].includes(selectedFormatInfo?.category || '') && (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Quality</label>
                    <select
                      value={options.quality}
                      onChange={(e) => setOptions(prev => ({ ...prev, quality: e.target.value as any }))}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded px-3 py-2"
                    >
                      <option value="low">Low (Smaller file)</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="ultra">Ultra (Largest file)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">Resolution (DPI)</label>
                    <Input
                      type="number"
                      value={options.resolution}
                      onChange={(e) => setOptions(prev => ({ ...prev, resolution: parseInt(e.target.value) || 300 }))}
                      className="mt-1 bg-slate-800 border-slate-700 text-white"
                      min="72"
                      max="600"
                      step="50"
                    />
                  </div>
                </>
              )}

              {selectedFormatInfo?.supportsScale && (
                <div>
                  <label className="text-sm font-medium text-slate-300">Scale</label>
                  <Input
                    type="number"
                    value={options.scale}
                    onChange={(e) => setOptions(prev => ({ ...prev, scale: parseFloat(e.target.value) || 1 }))}
                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                    min="0.1"
                    max="10"
                    step="0.1"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-300">Units</label>
                <select
                  value={options.units}
                  onChange={(e) => setOptions(prev => ({ ...prev, units: e.target.value as any }))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded px-3 py-2"
                >
                  <option value="mm">Millimeters (mm)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="m">Meters (m)</option>
                  <option value="in">Inches (in)</option>
                  <option value="ft">Feet (ft)</option>
                </select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={options.includeDimensions}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeDimensions: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Include Dimensions
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={options.includeGrid}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeGrid: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Include Grid
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-300">Title</label>
                <Input
                  value={options.title}
                  onChange={(e) => setOptions(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Author</label>
                <Input
                  value={options.author}
                  onChange={(e) => setOptions(prev => ({ ...prev, author: e.target.value }))}
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Subject</label>
                <Input
                  value={options.subject}
                  onChange={(e) => setOptions(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Keywords</label>
                <Input
                  value={options.keywords}
                  onChange={(e) => setOptions(prev => ({ ...prev, keywords: e.target.value }))}
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                  placeholder="Separate with commas"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
            Cancel
          </Button>
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export as {selectedFormatInfo?.name}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

