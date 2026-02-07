"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Link2 } from "lucide-react"
import { 
  ChainBlockConfig, 
  DEFAULT_CHAIN_BLOCK_CONFIG, 
  CHAIN_BLOCK_CAPACITIES,
  CHAIN_BLOCK_PRESETS,
  drawChainBlock,
  createChainBlockElement
} from '@/lib/chain-blocks'

interface ChainBlockConfigDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (element: any) => void
  editingConfig?: ChainBlockConfig | null
  onUpdate?: (config: ChainBlockConfig) => void
}

export default function ChainBlockConfigDialog({ isOpen, onClose, onInsert, editingConfig, onUpdate }: ChainBlockConfigDialogProps) {
  const [config, setConfig] = useState<ChainBlockConfig>({ ...DEFAULT_CHAIN_BLOCK_CONFIG })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isEditing = !!editingConfig

  // Load existing config when editing
  useEffect(() => {
    if (editingConfig) {
      setConfig({ ...editingConfig })
    } else {
      setConfig({ ...DEFAULT_CHAIN_BLOCK_CONFIG })
    }
  }, [editingConfig, isOpen])

  // Update preview when config changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw chain block preview
    drawChainBlock(ctx, canvas.width / 2, 80, config)
  }, [config])

  if (!isOpen) return null

  const handleInsert = () => {
    if (isEditing && onUpdate) {
      onUpdate(config)
    } else {
      const element = createChainBlockElement(config, { x: 300, y: 300 })
      onInsert(element)
    }
    onClose()
  }

  const loadPreset = (presetId: string) => {
    const preset = CHAIN_BLOCK_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setConfig({ ...preset.config })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-orange-400" />
            <CardTitle className="text-white">Chain Block Configuration</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            <canvas ref={canvasRef} width={300} height={280} className="rounded border border-slate-600" />
          </div>

          {/* Presets */}
          <div>
            <Label className="text-slate-300 text-sm">Quick Presets</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CHAIN_BLOCK_PRESETS.map(preset => (
                <Button
                  key={preset.id}
                  size="sm"
                  variant="outline"
                  onClick={() => loadPreset(preset.id)}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Capacity */}
            <div>
              <Label className="text-slate-300 text-sm">Capacity (Tonnes)</Label>
              <Select
                value={config.capacity.toString()}
                onValueChange={(v) => setConfig({ ...config, capacity: parseFloat(v) })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHAIN_BLOCK_CAPACITIES.map(cap => (
                    <SelectItem key={cap} value={cap.toString()}>{cap}T</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chain Length */}
            <div>
              <Label className="text-slate-300 text-sm">Chain Length (m): {config.chainLength}</Label>
              <Slider
                value={[config.chainLength]}
                onValueChange={([v]) => setConfig({ ...config, chainLength: v })}
                min={1} max={10} step={0.5}
                className="mt-2"
              />
            </div>

            {/* Lift Height */}
            <div>
              <Label className="text-slate-300 text-sm">Lift Height (m): {config.liftHeight}</Label>
              <Slider
                value={[config.liftHeight]}
                onValueChange={([v]) => setConfig({ ...config, liftHeight: Math.min(v, config.chainLength) })}
                min={0.5} max={config.chainLength} step={0.25}
                className="mt-2"
              />
            </div>

            {/* Rotation */}
            <div>
              <Label className="text-slate-300 text-sm">Rotation: {config.rotation}°</Label>
              <Slider
                value={[config.rotation]}
                onValueChange={([v]) => setConfig({ ...config, rotation: v })}
                min={0} max={360} step={15}
                className="mt-2"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">Show Load Chain</Label>
              <Switch checked={config.showLoadChain} onCheckedChange={(v) => setConfig({ ...config, showLoadChain: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">Show Hand Chain</Label>
              <Switch checked={config.showHandChain} onCheckedChange={(v) => setConfig({ ...config, showHandChain: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">Show Hook</Label>
              <Switch checked={config.showHook} onCheckedChange={(v) => setConfig({ ...config, showHook: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">Show Capacity Label</Label>
              <Switch checked={config.showCapacityLabel} onCheckedChange={(v) => setConfig({ ...config, showCapacityLabel: v })} />
            </div>
          </div>

          {/* Scale and Line Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Scale: {config.scale.toFixed(1)}x</Label>
              <Slider
                value={[config.scale]}
                onValueChange={([v]) => setConfig({ ...config, scale: v })}
                min={0.5} max={3} step={0.1}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Line Weight: {config.lineWeight}</Label>
              <Slider
                value={[config.lineWeight]}
                onValueChange={([v]) => setConfig({ ...config, lineWeight: v })}
                min={1} max={5} step={1}
                className="mt-2"
              />
            </div>
          </div>

          {/* Insert/Update Button */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleInsert} className="bg-orange-600 hover:bg-orange-700">
              {isEditing ? 'Update Chain Block' : 'Insert Chain Block'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

