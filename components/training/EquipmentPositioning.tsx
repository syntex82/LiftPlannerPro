"use client"

// Equipment Positioning Component - Allows trainees to position cranes on the site
// Shows snap-to-grid, collision detection, and ground bearing checks

import { useRef, useEffect, useState } from 'react'
import { TrainingScenario } from '@/lib/training-scenarios'
import { CraneEquipment } from '@/lib/equipment-library'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from 'lucide-react'

interface EquipmentPositioningProps {
  scenario: TrainingScenario
  equipment: CraneEquipment
  onPositionSelected?: (x: number, y: number) => void
}

interface PositionCheck {
  canPlace: boolean
  collisionDetected: boolean
  groundBearingOK: boolean
  outriggersSpaceOK: boolean
  issues: string[]
}

export default function EquipmentPositioning({
  scenario,
  equipment,
  onPositionSelected
}: EquipmentPositioningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null)
  const [positionCheck, setPositionCheck] = useState<PositionCheck | null>(null)
  const [gridSize] = useState(1) // 1 meter grid

  // Draw site with equipment preview
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const scaleX = canvasWidth / scenario.siteWidth
    const scaleY = canvasHeight / scenario.siteHeight
    const scale = Math.min(scaleX, scaleY) * 0.95

    // Clear canvas
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw grid
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    for (let x = 0; x < canvasWidth; x += scale * gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
    }
    for (let y = 0; y < canvasHeight; y += scale * gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
    }

    // Draw obstructions
    scenario.obstructions.forEach(obs => {
      ctx.fillStyle = '#cccccc'
      ctx.globalAlpha = 0.5
      ctx.fillRect(obs.x * scale, obs.y * scale, obs.width * scale, obs.height * scale)
      ctx.globalAlpha = 1.0
    })

    // Draw load
    ctx.fillStyle = '#ffff00'
    ctx.globalAlpha = 0.5
    const loadX = (scenario.siteWidth / 2 - scenario.load.width / 2) * scale
    const loadY = (scenario.siteHeight / 2 - scenario.load.height / 2) * scale
    ctx.fillRect(loadX, loadY, scenario.load.width * scale, scenario.load.height * scale)
    ctx.globalAlpha = 1.0

    // Draw equipment preview if position selected
    if (selectedPosition) {
      const eqX = selectedPosition.x * scale
      const eqY = selectedPosition.y * scale
      const eqWidth = equipment.dimensions.width * scale
      const eqHeight = equipment.dimensions.length * scale

      // Color based on validity
      if (positionCheck?.canPlace) {
        ctx.fillStyle = '#00ff00'
        ctx.globalAlpha = 0.3
      } else {
        ctx.fillStyle = '#ff0000'
        ctx.globalAlpha = 0.3
      }

      ctx.fillRect(eqX, eqY, eqWidth, eqHeight)
      ctx.globalAlpha = 1.0

      // Draw border
      ctx.strokeStyle = positionCheck?.canPlace ? '#00aa00' : '#aa0000'
      ctx.lineWidth = 3
      ctx.strokeRect(eqX, eqY, eqWidth, eqHeight)

      // Draw outrigger spread
      ctx.strokeStyle = '#0000ff'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      const spreadX = eqX + eqWidth / 2 - (equipment.outriggers.spreadWidth / 2) * scale
      const spreadY = eqY + eqHeight / 2 - (equipment.outriggers.spreadWidth / 2) * scale
      ctx.strokeRect(
        spreadX,
        spreadY,
        equipment.outriggers.spreadWidth * scale,
        equipment.outriggers.spreadWidth * scale
      )
      ctx.setLineDash([])
    }

    // Draw site boundary
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3
    ctx.strokeRect(0, 0, scenario.siteWidth * scale, scenario.siteHeight * scale)
  }, [scenario, equipment, selectedPosition, positionCheck, gridSize])

  // Handle canvas click to position equipment
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / (rect.width / scenario.siteWidth)
    const y = (e.clientY - rect.top) / (rect.height / scenario.siteHeight)

    // Snap to grid
    const snappedX = Math.round(x / gridSize) * gridSize
    const snappedY = Math.round(y / gridSize) * gridSize

    // Check if position is valid
    const check = checkPosition(snappedX, snappedY, scenario, equipment)
    setSelectedPosition({ x: snappedX, y: snappedY })
    setPositionCheck(check)
  }

  // Confirm position
  const handleConfirmPosition = () => {
    if (selectedPosition && positionCheck?.canPlace && onPositionSelected) {
      onPositionSelected(selectedPosition.x, selectedPosition.y)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Position {equipment.name}</CardTitle>
          <p className="text-xs text-slate-400 mt-1">Click on the site to position the crane. Green = valid, Red = invalid</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            className="border border-slate-700 bg-white rounded w-full cursor-crosshair"
          />

          {selectedPosition && positionCheck && (
            <div className="space-y-2">
              <div className="text-sm text-slate-300">
                Position: {selectedPosition.x.toFixed(1)}m, {selectedPosition.y.toFixed(1)}m
              </div>

              {positionCheck.issues.length > 0 ? (
                <div className="bg-red-900/30 border border-red-700 rounded p-3 space-y-1">
                  {positionCheck.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-red-300">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-900/30 border border-green-700 rounded p-3">
                  <div className="flex items-center gap-2 text-sm text-green-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>Position is valid - all checks passed</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleConfirmPosition}
                disabled={!positionCheck.canPlace}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-semibold"
              >
                Confirm Position
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Check if a position is valid for equipment placement
function checkPosition(
  x: number,
  y: number,
  scenario: TrainingScenario,
  equipment: CraneEquipment
): PositionCheck {
  const issues: string[] = []
  let canPlace = true

  // Check 1: Equipment within site bounds
  if (
    x < 0 ||
    y < 0 ||
    x + equipment.dimensions.width > scenario.siteWidth ||
    y + equipment.dimensions.length > scenario.siteHeight
  ) {
    issues.push('Equipment extends outside site boundary')
    canPlace = false
  }

  // Check 2: Collision with obstructions
  const collisionDetected = scenario.obstructions.some(obs => {
    return !(
      x + equipment.dimensions.width < obs.x ||
      x > obs.x + obs.width ||
      y + equipment.dimensions.length < obs.y ||
      y > obs.y + obs.height
    )
  })

  if (collisionDetected) {
    issues.push('Equipment collides with obstruction')
    canPlace = false
  }

  // Check 3: Ground bearing capacity
  const groundCondition = scenario.groundConditions.find(
    gc =>
      x >= gc.x &&
      x + equipment.dimensions.width <= gc.x + gc.width &&
      y >= gc.y &&
      y + equipment.dimensions.length <= gc.y + gc.height
  )

  if (groundCondition && groundCondition.bearingCapacity < equipment.groundBearing) {
    issues.push(
      `Ground bearing insufficient (${groundCondition.bearingCapacity} vs ${equipment.groundBearing} required)`
    )
    canPlace = false
  }

  // Check 4: Outrigger spread space
  const outriggerSpreadX = x - equipment.outriggers.spreadWidth / 2
  const outriggerSpreadY = y - equipment.outriggers.spreadWidth / 2

  if (
    outriggerSpreadX < 0 ||
    outriggerSpreadY < 0 ||
    outriggerSpreadX + equipment.outriggers.spreadWidth > scenario.siteWidth ||
    outriggerSpreadY + equipment.outriggers.spreadWidth > scenario.siteHeight
  ) {
    issues.push('Insufficient space for outrigger spread')
    canPlace = false
  }

  return {
    canPlace,
    collisionDetected,
    groundBearingOK: !issues.some(i => i.includes('bearing')),
    outriggersSpaceOK: !issues.some(i => i.includes('outrigger')),
    issues
  }
}

