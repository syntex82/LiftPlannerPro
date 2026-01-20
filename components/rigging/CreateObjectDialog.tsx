"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'

interface CreateObjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const categories = [
  { id: 'hoists', name: 'Hoists' },
  { id: 'slings', name: 'Slings' },
  { id: 'shackles', name: 'Shackles' },
  { id: 'hooks', name: 'Hooks' },
  { id: 'blocks', name: 'Blocks & Pulleys' },
  { id: 'spreaders', name: 'Spreader Beams' },
  { id: 'clamps', name: 'Clamps & Grips' },
  { id: 'eyebolts', name: 'Eyebolts & Nuts' }
]

export function CreateObjectDialog({ open, onOpenChange, onSuccess }: CreateObjectDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'hoists',
    type: '',
    manufacturer: '',
    model: '',
    swl: '',
    breakingLoad: '',
    weight: '',
    dimensions: { length: '', width: '', height: '', diameter: '' },
    specifications: { material: '', finish: '', standard: '', certification: '' },
    description: '',
    safetyNotes: '',
    inspectionRequirements: '',
    applications: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDimensionChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [field]: value }
    }))
  }

  const handleSpecChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [field]: value }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!formData.name || !formData.category || !formData.type || !formData.swl) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const response = await fetch('/api/rigging/custom-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          swl: parseFloat(formData.swl),
          breakingLoad: formData.breakingLoad ? parseFloat(formData.breakingLoad) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          safetyNotes: formData.safetyNotes.split('\n').filter(s => s.trim()),
          inspectionRequirements: formData.inspectionRequirements.split('\n').filter(s => s.trim()),
          applications: formData.applications.split('\n').filter(s => s.trim())
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create equipment')
      }

      setSuccess(true)
      setTimeout(() => {
        setFormData({
          name: '',
          category: 'hoists',
          type: '',
          manufacturer: '',
          model: '',
          swl: '',
          breakingLoad: '',
          weight: '',
          dimensions: { length: '', width: '', height: '', diameter: '' },
          specifications: { material: '', finish: '', standard: '', certification: '' },
          description: '',
          safetyNotes: '',
          inspectionRequirements: '',
          applications: ''
        })
        onOpenChange(false)
        onSuccess?.()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Create Custom Rigging Equipment</DialogTitle>
          <DialogDescription className="text-slate-400">
            Add a new custom rigging equipment object to your library
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="basic" className="data-[state=active]:bg-orange-600">Basic Info</TabsTrigger>
              <TabsTrigger value="specs" className="data-[state=active]:bg-orange-600">Specifications</TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-orange-600">Details</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Equipment Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Heavy Duty Chain Hoist"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id} className="text-white">{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Type *</Label>
                  <Input
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    placeholder="e.g., Chain Block"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Manufacturer</Label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="e.g., Yale"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Model</Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="e.g., Yalelift 360"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Safe Working Load (tonnes) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.swl}
                    onChange={(e) => handleInputChange('swl', e.target.value)}
                    placeholder="e.g., 1.0"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specs" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Breaking Load (tonnes)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.breakingLoad}
                    onChange={(e) => handleInputChange('breakingLoad', e.target.value)}
                    placeholder="e.g., 4.0"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="e.g., 8.5"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Material</Label>
                  <Input
                    value={formData.specifications.material}
                    onChange={(e) => handleSpecChange('material', e.target.value)}
                    placeholder="e.g., Alloy Steel"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Finish</Label>
                  <Input
                    value={formData.specifications.finish}
                    onChange={(e) => handleSpecChange('finish', e.target.value)}
                    placeholder="e.g., Zinc Plated"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Standard</Label>
                  <Input
                    value={formData.specifications.standard}
                    onChange={(e) => handleSpecChange('standard', e.target.value)}
                    placeholder="e.g., EN 13157"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Certifications</Label>
                  <Input
                    value={formData.specifications.certification}
                    onChange={(e) => handleSpecChange('certification', e.target.value)}
                    placeholder="e.g., CE, UKCA, LOLER"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div>
                <Label className="text-slate-300">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the equipment..."
                  className="bg-slate-700 border-slate-600 text-white min-h-20"
                />
              </div>

              <div>
                <Label className="text-slate-300">Safety Notes (one per line)</Label>
                <Textarea
                  value={formData.safetyNotes}
                  onChange={(e) => handleInputChange('safetyNotes', e.target.value)}
                  placeholder="Safety note 1&#10;Safety note 2&#10;Safety note 3"
                  className="bg-slate-700 border-slate-600 text-white min-h-20"
                />
              </div>

              <div>
                <Label className="text-slate-300">Inspection Requirements (one per line)</Label>
                <Textarea
                  value={formData.inspectionRequirements}
                  onChange={(e) => handleInputChange('inspectionRequirements', e.target.value)}
                  placeholder="Inspection requirement 1&#10;Inspection requirement 2"
                  className="bg-slate-700 border-slate-600 text-white min-h-20"
                />
              </div>

              <div>
                <Label className="text-slate-300">Applications (one per line)</Label>
                <Textarea
                  value={formData.applications}
                  onChange={(e) => handleInputChange('applications', e.target.value)}
                  placeholder="Application 1&#10;Application 2"
                  className="bg-slate-700 border-slate-600 text-white min-h-20"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Error Message */}
          {error && (
            <Card className="bg-red-900/20 border-red-700">
              <CardContent className="pt-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {success && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="pt-6 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-300">Equipment created successfully!</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:text-white"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Equipment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

