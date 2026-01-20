// Represents a single crane part in the assembly
export interface AssembledCranePart {
  id: string // Unique identifier for this part instance
  type: 'chassis' | 'boom' | 'counterweight' | 'outrigger' | 'cab' | 'jib' | 'turntable' | 'hook' // Type of crane part
  x: number // X position on canvas
  y: number // Y position on canvas
  width: number // Width of the part in pixels
  height: number // Height of the part in pixels
  rotation: number // Rotation angle in degrees
  color: string // Hex color code for rendering
  zIndex: number // Layer order (higher = on top)
  label: string // Display name of the part
}

// Represents a complete assembled crane made up of multiple parts
export interface AssembledCrane {
  id: string // Unique identifier for this crane
  name: string // User-provided name for the crane
  parts: AssembledCranePart[] // Array of all parts in this crane
  createdAt: string // ISO timestamp of when crane was created
}

