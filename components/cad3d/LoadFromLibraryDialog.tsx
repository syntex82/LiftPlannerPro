"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader, Download } from 'lucide-react'

interface Equipment {
  id: string
  type: string
  category: string
  manufacturer: string
  model: string
  workingLoadLimit: number
  notes: string
  createdAt: string
}

interface LoadFromLibraryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoadEquipment: (equipment: Equipment, cadData: any) => void
}

export function LoadFromLibraryDialog({ 
  open, 
  onOpenChange,
  onLoadEquipment
}: LoadFromLibraryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  useEffect(() => {
    if (open) {
      fetchEquipment()
    }
  }, [open])

  const fetchEquipment = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/rigging/custom-equipment')
      if (!response.ok) {
        throw new Error('Failed to fetch equipment')
      }
      const data = await response.json()
      setEquipment(data.equipment || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadEquipment = (eq: Equipment) => {
    try {
      const notes = JSON.parse(eq.notes)
      if (!notes.cadData) {
        setError('This equipment has no CAD data to load')
        return
      }
      const cadData = JSON.parse(notes.cadData)
      onLoadEquipment(eq, cadData)
      onOpenChange(false)
    } catch (err) {
      setError('Failed to load equipment data')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-slate-800 border-slate-700 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Load Equipment from Library</DialogTitle>
          <DialogDescription className="text-slate-400">
            Select custom equipment to load into the CAD editor
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-orange-400 mr-2" />
            <span className="text-slate-300">Loading equipment...</span>
          </div>
        ) : equipment.length === 0 ? (
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-center">No custom equipment found in library</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {equipment.map((eq) => {
              const notes = JSON.parse(eq.notes)
              const hasCadData = !!notes.cadData
              return (
                <Card 
                  key={eq.id} 
                  className={`bg-slate-700/50 border-slate-600 cursor-pointer transition-all ${
                    selectedEquipment?.id === eq.id ? 'border-orange-500 bg-slate-700' : 'hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedEquipment(eq)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{eq.type}</h3>
                        <p className="text-slate-400 text-sm">
                          {eq.manufacturer} {eq.model}
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          Category: <span className="text-slate-300">{eq.category}</span>
                        </p>
                        <p className="text-slate-400 text-sm">
                          SWL: <span className="text-slate-300">{eq.workingLoadLimit} tonnes</span>
                        </p>
                        {notes.description && (
                          <p className="text-slate-400 text-sm mt-2">{notes.description}</p>
                        )}
                        <p className="text-slate-500 text-xs mt-2">
                          Created: {new Date(eq.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {hasCadData ? (
                          <div className="flex items-center gap-1 text-green-400 text-xs">
                            <CheckCircle className="w-4 h-4" />
                            <span>CAD Data</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-500 text-xs">
                            <AlertCircle className="w-4 h-4" />
                            <span>No CAD</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={() => selectedEquipment && handleLoadEquipment(selectedEquipment)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={!selectedEquipment || loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Load Equipment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

