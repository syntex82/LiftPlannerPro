"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { X, Plus, Truck, Settings, Maximize2, Weight, ChevronDown, ChevronUp, Info } from "lucide-react"
import { ConfigurableCraneParams, generateConfigurableCrane, OutriggerPattern } from '@/lib/configurable-crane-generator'
import { CraneSpecifications } from '@/lib/crane-models'

interface ConfigurableCraneDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateCrane: (crane: CraneSpecifications) => void
}

// Collapsible section component
const CollapsibleSection = ({
  title,
  icon,
  children,
  defaultOpen = true
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2 text-slate-200">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  )
}

// Tooltip component for parameter explanations
const ParamTooltip = ({ text }: { text: string }) => (
  <span className="group relative ml-1">
    <Info className="w-3 h-3 text-slate-500 inline cursor-help" />
    <span className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-slate-700 text-xs text-slate-200 p-2 rounded shadow-lg w-48 z-10">
      {text}
    </span>
  </span>
)

export default function ConfigurableCraneDialog({ isOpen, onClose, onCreateCrane }: ConfigurableCraneDialogProps) {
  const [params, setParams] = useState<ConfigurableCraneParams>({
    name: 'Custom Crane',
    capacity: 100,
    axleCount: 4,
    wheelbase: 8000,
    boomBaseLength: 12,
    boomMaxLength: 50,
    boomSections: 5,
    craneLength: 14000,
    craneWidth: 2800,
    craneHeight: 3800,
    craneWeight: 45,
    counterweightMass: 15,
    outriggerSpan: 6000,
    outriggerPattern: 'X-pattern',
    wheelDiameter: 1200,
    dualTires: true
  })

  const handleParamChange = (key: keyof ConfigurableCraneParams, value: number | string | boolean) => {
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Info */}
          <CollapsibleSection title="Basic Information" icon={<Truck className="w-4 h-4" />} defaultOpen={true}>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Crane Name</label>
              <Input
                value={params.name}
                onChange={(e) => handleParamChange('name', e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="e.g., My Custom 100t Crane"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Lifting Capacity: <span className="text-orange-400">{params.capacity}t</span>
                <ParamTooltip text="Maximum lifting capacity at minimum radius. Typical range: 30t (small mobile) to 300t (large all-terrain)." />
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
          </CollapsibleSection>

          {/* Chassis Configuration */}
          <CollapsibleSection title="Chassis & Axles" icon={<Settings className="w-4 h-4" />} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Axle Count: <span className="text-orange-400">{params.axleCount}</span>
                  <ParamTooltip text="Number of axles. More axles = better weight distribution. 4+ axles typically for cranes over 100t." />
                </label>
                <Slider
                  value={[params.axleCount]}
                  onValueChange={(value) => handleParamChange('axleCount', value[0])}
                  min={2}
                  max={6}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>2-axle</span>
                  <span>6-axle</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Wheelbase: <span className="text-orange-400">{(params.wheelbase / 1000).toFixed(1)}m</span>
                  <ParamTooltip text="Distance from first to last axle. Longer wheelbase = more stability but less maneuverability." />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Wheel Diameter: <span className="text-orange-400">{params.wheelDiameter}mm</span>
                </label>
                <Slider
                  value={[params.wheelDiameter]}
                  onValueChange={(value) => handleParamChange('wheelDiameter', value[0])}
                  min={800}
                  max={1600}
                  step={100}
                  className="w-full"
                />
              </div>

              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.dualTires}
                    onChange={(e) => handleParamChange('dualTires', e.target.checked)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm text-slate-300">Dual Tires</span>
                  <ParamTooltip text="Dual tires on each axle for increased load capacity. Common on heavy-duty cranes." />
                </label>
              </div>
            </div>
          </CollapsibleSection>

          {/* Boom Configuration */}
          <CollapsibleSection title="Boom Configuration" icon={<Maximize2 className="w-4 h-4" />} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Base Length: <span className="text-orange-400">{params.boomBaseLength}m</span>
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
                  Max Length: <span className="text-orange-400">{params.boomMaxLength}m</span>
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

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Telescopic Sections: <span className="text-orange-400">{params.boomSections}</span>
                <ParamTooltip text="Number of telescopic boom sections. More sections = greater extension range but more complexity." />
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
          </CollapsibleSection>

          {/* Outrigger Configuration */}
          <CollapsibleSection title="Outrigger Configuration" icon={<Maximize2 className="w-4 h-4" />} defaultOpen={false}>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Outrigger Span: <span className="text-orange-400">{(params.outriggerSpan / 1000).toFixed(1)}m</span>
                <ParamTooltip text="How far outriggers extend from chassis edge. Wider span = more stability but larger footprint." />
              </label>
              <Slider
                value={[params.outriggerSpan]}
                onValueChange={(value) => handleParamChange('outriggerSpan', value[0])}
                min={3000}
                max={8000}
                step={500}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Outrigger Pattern
                <ParamTooltip text="X-pattern: diagonal deployment (most common). H-pattern: side-only. Box: rectangular footprint." />
              </label>
              <div className="flex gap-2">
                {(['X-pattern', 'H-pattern', 'box-pattern'] as OutriggerPattern[]).map(pattern => (
                  <button
                    key={pattern}
                    onClick={() => setParams(prev => ({ ...prev, outriggerPattern: pattern }))}
                    className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                      params.outriggerPattern === pattern
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Physical Dimensions */}
          <CollapsibleSection title="Physical Dimensions" icon={<Maximize2 className="w-4 h-4" />} defaultOpen={false}>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Length (mm)</label>
                <Input
                  type="number"
                  value={params.craneLength}
                  onChange={(e) => handleParamChange('craneLength', parseInt(e.target.value) || 14000)}
                  className="bg-slate-800 border-slate-600 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Width (mm)</label>
                <Input
                  type="number"
                  value={params.craneWidth}
                  onChange={(e) => handleParamChange('craneWidth', parseInt(e.target.value) || 2800)}
                  className="bg-slate-800 border-slate-600 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Height (mm)</label>
                <Input
                  type="number"
                  value={params.craneHeight}
                  onChange={(e) => handleParamChange('craneHeight', parseInt(e.target.value) || 3800)}
                  className="bg-slate-800 border-slate-600 text-white text-sm"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Weight Configuration */}
          <CollapsibleSection title="Weight Configuration" icon={<Weight className="w-4 h-4" />} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Base Weight: <span className="text-orange-400">{params.craneWeight}t</span>
                  <ParamTooltip text="Weight of crane without counterweight. Heavier base = more stable but requires more axles." />
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
                  <ParamTooltip text="Additional counterweight mass. Required to balance loads at greater radii." />
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
          </CollapsibleSection>

          {/* Summary Preview */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Configuration Summary</h4>
            <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
              <div><span className="text-slate-500">Capacity:</span> {params.capacity}t</div>
              <div><span className="text-slate-500">Axles:</span> {params.axleCount}</div>
              <div><span className="text-slate-500">Boom:</span> {params.boomBaseLength}-{params.boomMaxLength}m</div>
              <div><span className="text-slate-500">Wheelbase:</span> {(params.wheelbase / 1000).toFixed(1)}m</div>
              <div><span className="text-slate-500">Outriggers:</span> {params.outriggerPattern}</div>
              <div><span className="text-slate-500">Total Weight:</span> {params.craneWeight + params.counterweightMass}t</div>
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

