"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, Download, Upload, Settings, Layers, BookOpen
} from "lucide-react"

interface ProfessionalFeaturesPanelProps {
  projectInfo?: any
  setProjectInfo?: (info: any) => void
  exportConfig?: any
  setExportConfig?: (config: any) => void
  onExport?: (format: string) => void
  drawingScale?: string
  setDrawingScale?: (scale: string) => void
}

const TEMPLATES = [
  { id: 'iso-a4', name: 'ISO A4', width: 210, height: 297 },
  { id: 'iso-a3', name: 'ISO A3', width: 297, height: 420 },
  { id: 'ansi-letter', name: 'ANSI Letter', width: 216, height: 279 },
  { id: 'ansi-tabloid', name: 'ANSI Tabloid', width: 279, height: 432 },
]

const SCALES = [
  '1:1', '1:2', '1:5', '1:10', '1:20', '1:50', '1:100', '1:200', '1:500', '1:1000'
]

const STANDARDS = [
  { id: 'iso', name: 'ISO', description: 'International Organization for Standardization' },
  { id: 'ansi', name: 'ANSI', description: 'American National Standards Institute' },
  { id: 'din', name: 'DIN', description: 'Deutsches Institut für Normung' },
  { id: 'bs', name: 'BS', description: 'British Standards' },
]

export default function ProfessionalFeaturesPanel({
  projectInfo,
  setProjectInfo,
  exportConfig,
  setExportConfig,
  onExport,
  drawingScale = '1:1',
  setDrawingScale,
}: ProfessionalFeaturesPanelProps) {
  const [selectedStandard, setSelectedStandard] = useState('iso')

  const handleLoadTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId)
    if (template && setProjectInfo) {
      setProjectInfo({
        ...projectInfo,
        paperSize: templateId,
        width: template.width,
        height: template.height,
      })
    }
  }

  const handleScaleChange = (scale: string) => {
    if (setDrawingScale) {
      setDrawingScale(scale)
    }
  }

  const handleExportDXF = () => {
    if (onExport) {
      onExport('dxf')
    }
  }

  const handleExportPDF = () => {
    if (onExport) {
      onExport('pdf')
    }
  }

  const handleImportDXF = () => {
    // Trigger file input for DXF import
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.dxf'
    input.onchange = (e: any) => {
      const file = e.target.files?.[0]
      if (file) {
        // Handle DXF import
        console.log('Importing DXF file:', file.name)
      }
    }
    input.click()
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-orange-400" />
        <h3 className="text-sm font-semibold text-white">Professional Features</h3>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-700 text-xs">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-3">
          {/* Paper Templates */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Paper Templates</label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  onClick={() => handleLoadTemplate(template.id)}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <label className="text-xs font-medium text-slate-300">Drawing Scale</label>
            <div className="grid grid-cols-5 gap-1">
              {SCALES.map((scale) => (
                <Button
                  key={scale}
                  size="sm"
                  variant={drawingScale === scale ? 'default' : 'outline'}
                  className="text-xs h-7 px-2"
                  onClick={() => handleScaleChange(scale)}
                >
                  {scale}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-3">
          {/* Export Options */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Export Drawing</label>
            
            <Button
              size="sm"
              className="w-full text-xs h-8"
              onClick={handleExportDXF}
            >
              <Download className="w-3 h-3 mr-1" />
              Export as DXF
            </Button>

            <Button
              size="sm"
              className="w-full text-xs h-8"
              onClick={handleExportPDF}
            >
              <Download className="w-3 h-3 mr-1" />
              Export as PDF
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-8"
              onClick={handleImportDXF}
            >
              <Upload className="w-3 h-3 mr-1" />
              Import DXF
            </Button>
          </div>

          {/* Export Info */}
          <div className="bg-slate-700 p-2 rounded text-xs text-slate-300 space-y-1">
            <div>• DXF: AutoCAD compatible format</div>
            <div>• PDF: Print-ready format</div>
            <div>• Preserves all layers and properties</div>
          </div>
        </TabsContent>

        <TabsContent value="standards" className="space-y-3">
          {/* Standards Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Drawing Standards</label>
            <div className="space-y-2">
              {STANDARDS.map((standard) => (
                <div
                  key={standard.id}
                  onClick={() => setSelectedStandard(standard.id)}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedStandard === standard.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="font-medium text-xs">{standard.name}</div>
                  <div className="text-xs opacity-75">{standard.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Info */}
          <div className="bg-slate-700 p-2 rounded text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-600">
            <div className="font-medium mb-1">Selected: {selectedStandard.toUpperCase()}</div>
            <div>• Applies standard conventions</div>
            <div>• Sets default line weights</div>
            <div>• Configures dimension styles</div>
            <div>• Defines text standards</div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

