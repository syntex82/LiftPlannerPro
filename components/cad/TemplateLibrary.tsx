'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { drawingTemplates, templateCategories, DrawingTemplate } from '@/lib/drawing-templates'
import { FileText, Map, Truck, AlertTriangle, Link, Layers, Check, X } from 'lucide-react'

interface TemplateLibraryProps {
  open: boolean
  onClose: () => void
  onSelectTemplate: (template: DrawingTemplate) => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  'lift-plan': <FileText className="w-5 h-5" />,
  'site-layout': <Map className="w-5 h-5" />,
  'crane-setup': <Truck className="w-5 h-5" />,
  'safety-zone': <AlertTriangle className="w-5 h-5" />,
  'rigging': <Link className="w-5 h-5" />
}

export function TemplateLibrary({ open, onClose, onSelectTemplate }: TemplateLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<DrawingTemplate | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)

  const filteredTemplates = selectedCategory
    ? drawingTemplates.filter(t => t.category === selectedCategory)
    : drawingTemplates

  const handleSelectTemplate = (template: DrawingTemplate) => {
    setSelectedTemplate(template)
    setConfirmReplace(true)
  }

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate)
      setConfirmReplace(false)
      setSelectedTemplate(null)
      onClose()
    }
  }

  const handleCancel = () => {
    setConfirmReplace(false)
    setSelectedTemplate(null)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Drawing Templates Library
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose a template to start your drawing. Templates include pre-configured layers, title blocks, and common elements.
          </DialogDescription>
        </DialogHeader>

        {confirmReplace && selectedTemplate ? (
          <div className="p-6 text-center">
            <div className="mb-4">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Replace Current Drawing?</h3>
              <p className="text-slate-400 mb-4">
                Loading the template <strong className="text-white">{selectedTemplate.name}</strong> will replace your current drawing.
                Make sure to save your work first if needed.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleCancel} className="border-slate-600 text-slate-300">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
                <Check className="w-4 h-4 mr-2" /> Load Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 h-[60vh]">
            {/* Category Sidebar */}
            <div className="w-48 border-r border-slate-700 pr-4 space-y-2">
              <Button
                variant={selectedCategory === null ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => setSelectedCategory(null)}
              >
                <Layers className="w-4 h-4 mr-2" /> All Templates
              </Button>
              {templateCategories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {categoryIcons[cat.id]}
                  <span className="ml-2 truncate">{cat.name}</span>
                </Button>
              ))}
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                {filteredTemplates.map(template => (
                  <Card
                    key={template.id}
                    className="bg-slate-800 border-slate-700 hover:border-blue-500 cursor-pointer transition-all group"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="p-4">
                      {/* Template Preview */}
                      <div className="h-32 bg-slate-700/50 rounded-lg mb-3 flex items-center justify-center border border-slate-600 group-hover:border-blue-500/50">
                        <div className="text-center">
                          {categoryIcons[template.category]}
                          <p className="text-xs text-slate-500 mt-1">{template.elements.length} elements</p>
                        </div>
                      </div>
                      {/* Template Info */}
                      <h4 className="font-semibold text-white mb-1">{template.name}</h4>
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">{template.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {template.drawingScale}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {template.drawingUnits}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

