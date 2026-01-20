"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { X, Plus } from "lucide-react"
import { ConfigurableCraneParams, generateConfigurableCrane } from '@/lib/configurable-crane-generator'
import { CraneSpecifications } from '@/lib/crane-models'

interface ConfigurableCraneDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateCrane: (crane: CraneSpecifications) => void
}

export default function ConfigurableCraneDialog({ isOpen, onClose, onCreateCrane }: ConfigurableCraneDialogProps) {
  const [params, setParams] = useState<ConfigurableCraneParams>({
    name: 'Custom Crane',
    capacity: 100,
    axleCount: 3,
    wheelbase: 8000,
    boomBaseLength: 12,
    boomMaxLength: 50,
    boomSections: 5,
    craneLength: 14000,
    craneWidth: 2800,
    craneHeight: 3800,
    craneWeight: 45,
    counterweightMass: 15
  })

  const handleParamChange = (key: keyof ConfigurableCraneParams, value: number | string) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const handleCreate = () => {
    const crane = generateConfigurableCrane(params)
    onCreateCrane(crane)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Plus className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Create Custom Crane</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Crane Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Crane Name</label>
            <Input
              value={params.name}
              onChange={(e) => handleParamChange('name', e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="e.g., My Custom 100t Crane"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Lifting Capacity: <span className="text-orange-400">{params.capacity}t</span>
            </label>
            <Slider
              value={[params.capacity]}
              onValueChange={(value) => handleParamChange('capacity', value[0])}
              min={30}
              max={300}
              step={10}
              className="w-full"
            />
            <div className="text-xs text-slate-400 mt-1">Range: 30t - 300t</div>
          </div>

          {/* Axle Configuration */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Axle Count: <span className="text-orange-400">{params.axleCount}</span>
            </label>
            <Slider
              value={[params.axleCount]}
              onValueChange={(value) => handleParamChange('axleCount', value[0])}
              min={2}
              max={6}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-slate-400 mt-1">2-6 axles (affects weight distribution)</div>
          </div>

          {/* Wheelbase */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Wheelbase: <span className="text-orange-400">{params.wheelbase}mm</span>
            </label>
            <Slider
              value={[params.wheelbase]}
              onValueChange={(value) => handleParamChange('wheelbase', value[0])}
              min={5000}
              max={12000}
              step={500}
              className="w-full"
            />
          </div>

          {/* Boom Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Boom Base: <span className="text-orange-400">{params.boomBaseLength}m</span>
              </label>
              <Slider
                value={[params.boomBaseLength]}
                onValueChange={(value) => handleParamChange('boomBaseLength', value[0])}
                min={8}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Boom Max: <span className="text-orange-400">{params.boomMaxLength}m</span>
              </label>
              <Slider
                value={[params.boomMaxLength]}
                onValueChange={(value) => handleParamChange('boomMaxLength', value[0])}
                min={30}
                max={80}
                step={2}
                className="w-full"
              />
            </div>
          </div>

          {/* Boom Sections */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Boom Sections: <span className="text-orange-400">{params.boomSections}</span>
            </label>
            <Slider
              value={[params.boomSections]}
              onValueChange={(value) => handleParamChange('boomSections', value[0])}
              min={3}
              max={8}
              step={1}
              className="w-full"
            />
          </div>

          {/* Physical Dimensions */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Length (mm)</label>
              <Input
                type="number"
                value={params.craneLength}
                onChange={(e) => handleParamChange('craneLength', parseInt(e.target.value))}
                className="bg-slate-800 border-slate-600 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Width (mm)</label>
              <Input
                type="number"
                value={params.craneWidth}
                onChange={(e) => handleParamChange('craneWidth', parseInt(e.target.value))}
                className="bg-slate-800 border-slate-600 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Height (mm)</label>
              <Input
                type="number"
                value={params.craneHeight}
                onChange={(e) => handleParamChange('craneHeight', parseInt(e.target.value))}
                className="bg-slate-800 border-slate-600 text-white text-sm"
              />
            </div>
          </div>

          {/* Weight Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Crane Weight: <span className="text-orange-400">{params.craneWeight}t</span>
              </label>
              <Slider
                value={[params.craneWeight]}
                onValueChange={(value) => handleParamChange('craneWeight', value[0])}
                min={15}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Counterweight: <span className="text-orange-400">{params.counterweightMass}t</span>
              </label>
              <Slider
                value={[params.counterweightMass]}
                onValueChange={(value) => handleParamChange('counterweightMass', value[0])}
                min={5}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
            Cancel
          </Button>
          <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Crane
          </Button>
        </div>
      </div>
    </div>
  )
}

