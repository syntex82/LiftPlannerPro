"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { ModelerObject } from './modelerStore'

interface SaveToLibraryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedObjects: ModelerObject[]
  onSuccess?: () => void
  editingEquipment?: {
    id: string
    type: string
    category: string
    manufacturer: string
    model: string
    workingLoadLimit: number
    notes: string
  } | null
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

export function SaveToLibraryDialog({
  open,
  onOpenChange,
  selectedObjects,
  onSuccess,
  editingEquipment
}: SaveToLibraryDialogProps) {
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
    description: ''
  })

  // Initialize form with editing equipment data
  useEffect(() => {
    if (editingEquipment && open) {
      try {
        const notes = JSON.parse(editingEquipment.notes)
        setFormData({
          name: editingEquipment.type,
          category: editingEquipment.category,
          type: editingEquipment.type,
          manufacturer: editingEquipment.manufacturer,
          model: editingEquipment.model,
          swl: editingEquipment.workingLoadLimit.toString(),
          breakingLoad: notes.breakingLoad?.toString() || '',
          weight: notes.weight?.toString() || '',
          description: notes.description || ''
        })
      } catch (e) {
        console.error('Failed to parse equipment notes:', e)
      }
    } else if (open) {
      setFormData({
        name: '',
        category: 'hoists',
        type: '',
        manufacturer: '',
        model: '',
        swl: '',
        breakingLoad: '',
        weight: '',
        description: ''
      })
    }
  }, [editingEquipment, open])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

      if (selectedObjects.length === 0) {
        setError('No objects selected to save')
        setLoading(false)
        return
      }

      // Serialize the selected objects
      const cadData = JSON.stringify(selectedObjects)

      const response = await fetch('/api/rigging/custom-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          swl: parseFloat(formData.swl),
          breakingLoad: formData.breakingLoad ? parseFloat(formData.breakingLoad) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          safetyNotes: [],
          inspectionRequirements: [],
          applications: [],
          cadData: cadData,
          objectCount: selectedObjects.length
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save to library')
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
          description: ''
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
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Save to Rigging Library</DialogTitle>
          <DialogDescription className="text-slate-400">
            Save your CAD design to the rigging equipment library
            {selectedObjects.length > 0 && (
              <span className="block mt-2 text-orange-400">
                {selectedObjects.length} object(s) selected
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Equipment Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Custom Lifting Rig"
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
                placeholder="e.g., Custom Assembly"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Manufacturer</Label>
              <Input
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="Your company name"
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
                placeholder="Model number"
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
                placeholder="e.g., 5.0"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Breaking Load (tonnes)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.breakingLoad}
                onChange={(e) => handleInputChange('breakingLoad', e.target.value)}
                placeholder="e.g., 20.0"
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
                placeholder="e.g., 150"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your custom equipment..."
              className="bg-slate-700 border-slate-600 text-white min-h-20"
            />
          </div>

          {/* CAD Data Info */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-300">
                <strong>CAD Data:</strong> {selectedObjects.length} object(s) will be saved with this equipment
              </p>
            </CardContent>
          </Card>

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
                <p className="text-green-300">Saved to library successfully!</p>
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
              disabled={loading || selectedObjects.length === 0}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save to Library'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

