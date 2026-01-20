"use client"

// React hooks for state management and DOM references
import { useState, useRef, useEffect } from 'react'
// UI component imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// Icon imports from lucide-react
import { X, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react"
// Import types for assembled crane parts and cranes
import { AssembledCranePart, AssembledCrane } from '@/lib/crane-builder-generator'

// Props interface for the CranePartsBuilder component
interface CranePartsBuilderProps {
  isOpen: boolean // Controls whether the dialog is visible
  onClose: () => void // Callback when user closes the dialog
  onCreateCrane: (crane: AssembledCrane) => void // Callback when user creates a crane
}

// Define templates for each crane part type with default dimensions, colors, and labels
// These are used when adding new parts to the assembly
const PART_TEMPLATES = {
  chassis: { width: 200, height: 40, color: '#FFD700', label: 'Chassis' }, // Gold - base of crane
  boom: { width: 150, height: 15, color: '#FF6B35', label: 'Boom Section' }, // Orange - lifting arm
  counterweight: { width: 50, height: 50, color: '#666666', label: 'Counterweight' }, // Gray - balance weight
  outrigger: { width: 80, height: 10, color: '#555555', label: 'Outrigger' }, // Dark gray - stabilizer
  cab: { width: 40, height: 35, color: '#4A90E2', label: 'Cab' }, // Blue - operator cabin
  jib: { width: 100, height: 8, color: '#FF8C00', label: 'Jib' }, // Orange - auxiliary boom
  turntable: { width: 60, height: 60, color: '#999999', label: 'Turntable' }, // Gray - rotating base
  hook: { width: 20, height: 30, color: '#FFD700', label: 'Hook' } // Gold - load attachment
}

// Main component for building custom cranes by assembling individual parts
export default function CranePartsBuilder({ isOpen, onClose, onCreateCrane }: CranePartsBuilderProps) {
  // Reference to the HTML canvas element for drawing parts
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // State management for crane assembly
  const [parts, setParts] = useState<AssembledCranePart[]>([]) // Array of all parts in the assembly
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null) // ID of currently selected part
  const [draggingPartId, setDraggingPartId] = useState<string | null>(null) // ID of part being dragged
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }) // Offset between mouse and part position during drag
  const [craneName, setCraneName] = useState('Custom Crane') // Name of the crane being built

  // Redraw canvas whenever parts change or selection changes
  useEffect(() => {
    drawCanvas()
  }, [parts, selectedPartId])

  // Render the assembly canvas with all parts
  const drawCanvas = () => {
    // Get canvas element and 2D context
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines to help with alignment (20px spacing)
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1
    // Draw vertical grid lines
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    // Draw horizontal grid lines
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Sort parts by z-index (lower z-index drawn first = appears behind)
    const sortedParts = [...parts].sort((a, b) => a.zIndex - b.zIndex)

    // Draw each part
    sortedParts.forEach(part => {
      ctx.save() // Save canvas state before transformations

      // Translate to part center and rotate
      ctx.translate(part.x + part.width / 2, part.y + part.height / 2)
      ctx.rotate((part.rotation * Math.PI) / 180)

      // Fill part with its color
      ctx.fillStyle = part.color
      ctx.fillRect(-part.width / 2, -part.height / 2, part.width, part.height)

      // Draw border - thicker and blue if selected, thin and dark if not
      if (selectedPartId === part.id) {
        ctx.strokeStyle = '#0066ff' // Blue border for selected part
        ctx.lineWidth = 3
      } else {
        ctx.strokeStyle = '#333333' // Dark border for unselected parts
        ctx.lineWidth = 1
      }
      ctx.strokeRect(-part.width / 2, -part.height / 2, part.width, part.height)

      // Draw part label text in center
      ctx.fillStyle = '#000000'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(part.label, 0, 4)

      ctx.restore() // Restore canvas state
    })
  }

  // Handle mouse down on canvas - select or start dragging a part
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check parts from top to bottom (reverse order) to find which part was clicked
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i]
      // Check if click is within part bounds
      if (x >= part.x && x <= part.x + part.width && y >= part.y && y <= part.y + part.height) {
        // Select this part and start dragging
        setSelectedPartId(part.id)
        setDraggingPartId(part.id)
        // Store offset between click point and part's top-left corner
        setDragOffset({ x: x - part.x, y: y - part.y })
        return
      }
    }
    // If no part was clicked, deselect current selection
    setSelectedPartId(null)
  }

  // Handle mouse move on canvas - drag selected part
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only move if a part is being dragged
    if (!draggingPartId) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Get current mouse position relative to canvas
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x // Subtract offset to keep click point consistent
    const y = e.clientY - rect.top - dragOffset.y

    // Update position of dragged part
    setParts(parts.map(p => p.id === draggingPartId ? { ...p, x, y } : p))
  }

  // Handle mouse up on canvas - stop dragging
  const handleCanvasMouseUp = () => {
    setDraggingPartId(null)
  }

  // Add a new part to the assembly
  const addPart = (type: keyof typeof PART_TEMPLATES) => {
    // Get template for this part type
    const template = PART_TEMPLATES[type]

    // Create new part with template properties
    const newPart: AssembledCranePart = {
      id: Date.now().toString(), // Unique ID based on timestamp
      type: type as 'chassis' | 'boom' | 'counterweight' | 'outrigger' | 'cab' | 'jib' | 'turntable' | 'hook',
      x: 100, // Default position
      y: 100,
      width: template.width, // Use template dimensions
      height: template.height,
      color: template.color, // Use template color
      label: template.label, // Use template label
      rotation: 0, // No rotation initially
      zIndex: Math.max(...parts.map(p => p.zIndex), 0) + 1 // Place on top of all existing parts
    }
    // Add new part to parts array
    setParts([...parts, newPart])
  }

  // Remove a part from the assembly
  const deletePart = (id: string) => {
    // Filter out the part with matching ID
    setParts(parts.filter(p => p.id !== id))
    // If deleted part was selected, clear selection
    if (selectedPartId === id) setSelectedPartId(null)
  }

  // Send selected part to back (lowest z-index)
  const sendToBack = (id: string) => {
    // Find minimum z-index among all parts
    const minZ = Math.min(...parts.map(p => p.zIndex))
    // Set target part's z-index to one less than minimum (sends it behind everything)
    setParts(parts.map(p => p.id === id ? { ...p, zIndex: minZ - 1 } : p))
  }

  // Bring selected part to front (highest z-index)
  const bringToFront = (id: string) => {
    // Find maximum z-index among all parts
    const maxZ = Math.max(...parts.map(p => p.zIndex))
    // Set target part's z-index to one more than maximum (brings it in front of everything)
    setParts(parts.map(p => p.id === id ? { ...p, zIndex: maxZ + 1 } : p))
  }

  // Don't render if dialog is not open
  if (!isOpen) return null

  return (
    // Modal overlay with semi-transparent black background
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* Main dialog card */}
      <Card className="bg-slate-900 border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header with title and close button */}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Crane Parts Builder</CardTitle>
          {/* Close button */}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        {/* Main content area */}
        <CardContent className="space-y-4">
          {/* Crane name input */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Crane Name</label>
            <Input
              value={craneName}
              onChange={(e) => setCraneName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* Main layout: canvas on left (2/3), controls on right (1/3) */}
          <div className="grid grid-cols-3 gap-4">
            {/* Assembly Canvas - where user builds the crane */}
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-white mb-2">Assembly Canvas</h3>
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="border border-slate-700 bg-white rounded cursor-move"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp} // Stop dragging if mouse leaves canvas
              />
            </div>

            {/* Right panel with part buttons and controls */}
            <div className="space-y-4">
              {/* Add Parts section - buttons to insert new parts */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Add Parts</h3>
                <div className="space-y-2">
                  {/* Create a button for each part type */}
                  {Object.entries(PART_TEMPLATES).map(([key, template]) => (
                    <Button
                      key={key}
                      size="sm"
                      onClick={() => addPart(key as any)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {template.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Part Controls - only show if a part is selected */}
              {selectedPartId && (
                <div className="bg-slate-800 p-3 rounded space-y-2">
                  <h4 className="text-xs font-semibold text-white">Selected Part</h4>

                  {/* Bring to Front button - moves part above all others */}
                  <Button
                    size="sm"
                    onClick={() => bringToFront(selectedPartId)}
                    className="w-full bg-green-600 hover:bg-green-700 text-xs"
                  >
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Bring to Front
                  </Button>

                  {/* Send to Back button - moves part below all others */}
                  <Button
                    size="sm"
                    onClick={() => sendToBack(selectedPartId)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-xs"
                  >
                    <ArrowDown className="w-3 h-3 mr-1" />
                    Send to Back
                  </Button>

                  {/* Delete button - removes selected part */}
                  <Button
                    size="sm"
                    onClick={() => deletePart(selectedPartId)}
                    className="w-full bg-red-600 hover:bg-red-700 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Footer with action buttons */}
          <div className="flex gap-3 justify-end border-t border-slate-700 pt-4">
            {/* Cancel button - closes dialog without saving */}
            <Button variant="outline" onClick={onClose}>Cancel</Button>

            {/* Create Crane button - saves the assembled crane */}
            <Button onClick={() => {
              // Validate that at least one part exists
              if (parts.length === 0) {
                alert('Please add at least one part to the crane')
                return
              }

              // Create the assembled crane object with all parts
              const assembledCrane: AssembledCrane = {
                id: `assembled-${Date.now()}`, // Unique ID based on timestamp
                name: craneName, // User-provided name
                parts: parts, // All assembled parts
                createdAt: new Date().toISOString() // Creation timestamp
              }

              // Call parent callback to insert crane into CAD
              onCreateCrane(assembledCrane)
              // Close the dialog
              onClose()
            }} className="bg-green-600 hover:bg-green-700" disabled={parts.length === 0}>
              Create Crane
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

