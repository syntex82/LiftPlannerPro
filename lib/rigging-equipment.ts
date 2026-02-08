/**
 * Rigging Equipment Library for CAD
 * Professional lifting equipment for 2D CAD and 3D Modeler
 * Includes shackles, hooks, slings, chains, spreader beams, lifting beams, etc.
 */

// 2D Equipment Block Definition (same structure as personnel-blocks)
export interface RiggingBlock2D {
  id: string
  name: string
  category: 'shackles' | 'hooks' | 'slings' | 'chains' | 'beams' | 'hardware' | 'accessories'
  description: string
  swl?: string // Safe Working Load
  lines: number[][] // [x1, y1, x2, y2]
  circles?: number[][] // [cx, cy, radius]
  arcs?: number[][] // [cx, cy, radius, startAngle, endAngle]
  rects?: number[][] // [x, y, width, height]
  width: number
  height: number
}

// 3D Equipment Definition
export interface RiggingEquipment3D {
  id: string
  name: string
  category: 'shackles' | 'hooks' | 'slings' | 'chains' | 'beams' | 'hardware' | 'accessories'
  description: string
  swl?: string
  // 3D geometry type
  geometryType: 'box' | 'cylinder' | 'sphere' | 'composite'
  // Dimensions in meters
  dimensions: {
    length?: number
    width?: number
    height?: number
    radius?: number
    thickness?: number
  }
  color: string
  // For composite objects, define sub-parts
  parts?: Array<{
    type: 'box' | 'cylinder' | 'sphere'
    position: [number, number, number]
    rotation?: [number, number, number]
    size?: [number, number, number]
    radius?: number
    height?: number
    color?: string
  }>
}

// Categories
export const RIGGING_CATEGORIES = [
  { id: 'shackles', name: 'Shackles', icon: '🔗' },
  { id: 'hooks', name: 'Hooks', icon: '🪝' },
  { id: 'slings', name: 'Slings', icon: '⛓️' },
  { id: 'chains', name: 'Chains', icon: '⛓' },
  { id: 'beams', name: 'Lifting Beams', icon: '📏' },
  { id: 'hardware', name: 'Hardware', icon: '🔩' },
  { id: 'accessories', name: 'Accessories', icon: '🛠️' },
] as const

// ==================== 2D EQUIPMENT BLOCKS ====================
export const RIGGING_BLOCKS_2D: RiggingBlock2D[] = [
  // ==================== SHACKLES ====================
  {
    id: 'bow-shackle',
    name: 'Bow Shackle',
    category: 'shackles',
    description: 'D-ring bow shackle',
    swl: '2-50t',
    lines: [
      // Pin
      [-20, 0, 20, 0],
      // Clevis pin ends
      [-20, -5, -20, 5],
      [20, -5, 20, 5],
      // Pin cotter
      [25, 0, 30, -5],
      [25, 0, 30, 5],
    ],
    circles: [
      [0, 30, 25], // Bow body
    ],
    arcs: [
      [-20, 0, 20, 0, 180], // Upper curve connecting to pin
    ],
    width: 70,
    height: 60
  },
  {
    id: 'dee-shackle',
    name: 'D-Shackle',
    category: 'shackles',
    description: 'Standard D-shackle',
    swl: '1-25t',
    lines: [
      // Pin at top
      [-15, 0, 15, 0],
      [-15, -4, -15, 4],
      [15, -4, 15, 4],
      // Straight sides
      [-15, 0, -15, 35],
      [15, 0, 15, 35],
      // Bottom curve (approximated with lines)
      [-15, 35, -10, 42],
      [-10, 42, 0, 45],
      [0, 45, 10, 42],
      [10, 42, 15, 35],
    ],
    width: 40,
    height: 50
  },
  {
    id: 'large-bow-shackle',
    name: 'Heavy Bow Shackle',
    category: 'shackles',
    description: 'Heavy duty bow shackle 25-150t',
    swl: '25-150t',
    lines: [
      // Thick pin
      [-30, 0, 30, 0],
      [-30, -8, -30, 8],
      [30, -8, 30, 8],
      // Pin details
      [-35, -3, -30, -3],
      [-35, 3, -30, 3],
      [30, -3, 35, -3],
      [30, 3, 35, 3],
      [-35, -3, -35, 3],
      [35, -3, 35, 3],
    ],
    circles: [
      [0, 45, 35], // Large bow
    ],
    width: 90,
    height: 85
  },

  // ==================== HOOKS ====================
  {
    id: 'crane-hook',
    name: 'Crane Hook',
    category: 'hooks',
    description: 'Standard crane hook with safety latch',
    swl: '5-100t',
    lines: [
      // Shank
      [-8, 0, 8, 0],
      [-8, 0, -8, 30],
      [8, 0, 8, 30],
      // Hook throat start
      [-8, 30, -15, 50],
      [8, 30, 15, 50],
      // Hook curve outer
      [15, 50, 20, 70],
      [20, 70, 15, 90],
      [15, 90, 0, 100],
      // Hook curve inner
      [-15, 50, -10, 65],
      [-10, 65, 0, 75],
      [0, 75, 10, 70],
      // Hook tip
      [0, 100, -10, 95],
      [-10, 95, -15, 85],
      // Safety latch
      [-5, 30, 0, 25],
      [0, 25, 5, 30],
      [0, 25, 0, 20],
    ],
    circles: [
      [0, -10, 15], // Swivel eye
    ],
    width: 50,
    height: 125
  },
  {
    id: 'hook-block',
    name: 'Hook Block',
    category: 'hooks',
    description: 'Multi-sheave hook block',
    swl: '20-500t',
    lines: [
      // Top bail/shackle attachment
      [-10, 0, 10, 0],
      [-10, 0, -10, 15],
      [10, 0, 10, 15],
      // Block frame
      [-25, 15, 25, 15],
      [-25, 15, -25, 60],
      [25, 15, 25, 60],
      [-25, 60, 25, 60],
      // Sheave dividers
      [-25, 30, 25, 30],
      [-25, 45, 25, 45],
      // Bottom plate
      [-20, 60, -20, 70],
      [20, 60, 20, 70],
      [-20, 70, 20, 70],
    ],
    circles: [
      [0, 22, 6], // Sheave 1
      [0, 37, 6], // Sheave 2
      [0, 52, 6], // Sheave 3
      [0, 85, 12], // Hook swivel
    ],
    width: 60,
    height: 100
  },
  {
    id: 'swivel-hook',
    name: 'Swivel Hook',
    category: 'hooks',
    description: 'Hook with swivel bearing',
    swl: '1-25t',
    lines: [
      // Hook shape
      [-6, 20, -12, 40],
      [6, 20, 12, 40],
      [12, 40, 15, 60],
      [15, 60, 10, 75],
      [10, 75, 0, 80],
      [0, 80, -8, 75],
      [-12, 40, -8, 55],
      [-8, 55, 0, 60],
      [0, 60, 8, 55],
      // Latch
      [-3, 25, 3, 25],
    ],
    circles: [
      [0, 10, 10], // Swivel
      [0, -5, 8], // Eye
    ],
    width: 40,
    height: 95
  },

  // ==================== SLINGS ====================
  {
    id: 'wire-rope-sling',
    name: 'Wire Rope Sling',
    category: 'slings',
    description: 'Eye-eye wire rope sling',
    swl: '1-50t',
    lines: [
      // Top eye thimble
      [-10, 10, 10, 10],
      // Rope going down
      [-3, 10, -3, 80],
      [3, 10, 3, 80],
      // Ferrule/splice marks
      [-5, 15, 5, 15],
      [-5, 20, 5, 20],
      // Bottom eye thimble
      [-10, 80, 10, 80],
      // Ferrule at bottom
      [-5, 75, 5, 75],
      [-5, 70, 5, 70],
    ],
    circles: [
      [0, 5, 8], // Top eye
      [0, 85, 8], // Bottom eye
    ],
    width: 25,
    height: 95
  },
  {
    id: 'chain-sling-4leg',
    name: '4-Leg Chain Sling',
    category: 'slings',
    description: 'Four leg chain sling assembly',
    swl: '2-50t',
    lines: [
      // Master link at top
      [-8, 0, 8, 0],
      [-8, 0, -8, 15],
      [8, 0, 8, 15],
      [-8, 15, 8, 15],
      // Four legs spreading out
      [-5, 15, -40, 70],
      [-3, 15, -20, 70],
      [3, 15, 20, 70],
      [5, 15, 40, 70],
      // Chain link suggestions
      [-25, 35, -22, 38],
      [-12, 35, -10, 38],
      [10, 35, 12, 38],
      [22, 35, 25, 38],
    ],
    circles: [
      [-40, 75, 5], // Hook 1
      [-20, 75, 5], // Hook 2
      [20, 75, 5], // Hook 3
      [40, 75, 5], // Hook 4
    ],
    width: 100,
    height: 85
  },
  {
    id: 'webbing-sling',
    name: 'Webbing Sling',
    category: 'slings',
    description: 'Flat webbing sling',
    swl: '0.5-10t',
    lines: [
      // Top eye
      [-12, 0, 12, 0],
      [-12, 0, -12, 12],
      [12, 0, 12, 12],
      // Webbing body (wide)
      [-10, 12, -10, 75],
      [10, 12, 10, 75],
      // Stitching lines
      [-8, 15, -8, 72],
      [8, 15, 8, 72],
      // Bottom eye
      [-12, 75, -12, 87],
      [12, 75, 12, 87],
      [-12, 87, 12, 87],
    ],
    width: 30,
    height: 92
  },

  // ==================== CHAINS ====================
  {
    id: 'chain-section',
    name: 'Chain Section',
    category: 'chains',
    description: 'Grade 80 chain section',
    swl: '1-50t',
    lines: [
      // Chain link pattern (oval links)
      [-5, 0, 5, 0],
      [-5, 0, -5, 12],
      [5, 0, 5, 12],
      [-5, 12, 5, 12],
      // Second link (rotated)
      [0, 10, 0, 25],
      [-3, 15, 3, 15],
      [-3, 20, 3, 20],
      // Third link
      [-5, 23, 5, 23],
      [-5, 23, -5, 35],
      [5, 23, 5, 35],
      [-5, 35, 5, 35],
      // Fourth link
      [0, 33, 0, 48],
      [-3, 38, 3, 38],
      [-3, 43, 3, 43],
      // Fifth link
      [-5, 46, 5, 46],
      [-5, 46, -5, 58],
      [5, 46, 5, 58],
      [-5, 58, 5, 58],
    ],
    width: 15,
    height: 63
  },

  // ==================== LIFTING BEAMS ====================
  {
    id: 'spreader-beam',
    name: 'Spreader Beam',
    category: 'beams',
    description: 'Adjustable spreader beam',
    swl: '5-100t',
    lines: [
      // Main beam I-section profile
      [-80, 0, 80, 0], // Top flange
      [-80, 5, 80, 5],
      [-80, 0, -80, 5],
      [80, 0, 80, 5],
      // Web
      [-2, 5, -2, 25],
      [2, 5, 2, 25],
      // Bottom flange
      [-80, 25, 80, 25],
      [-80, 30, 80, 30],
      [-80, 25, -80, 30],
      [80, 25, 80, 30],
      // Center lifting lug
      [-8, -15, 8, -15],
      [-8, -15, -8, 0],
      [8, -15, 8, 0],
      // End lifting points
      [-70, 30, -70, 40],
      [-75, 40, -65, 40],
      [70, 30, 70, 40],
      [65, 40, 75, 40],
    ],
    circles: [
      [0, -20, 8], // Top shackle point
      [-70, 45, 5], // Left hook point
      [70, 45, 5], // Right hook point
    ],
    width: 175,
    height: 75
  },
  {
    id: 'lifting-beam',
    name: 'Lifting Beam',
    category: 'beams',
    description: 'Single point lifting beam',
    swl: '2-50t',
    lines: [
      // Beam body
      [-60, 10, 60, 10],
      [-60, 20, 60, 20],
      [-60, 10, -60, 20],
      [60, 10, 60, 20],
      // Web stiffeners
      [-40, 10, -40, 20],
      [0, 10, 0, 20],
      [40, 10, 40, 20],
      // Top lugs
      [-5, 0, 5, 0],
      [-5, 0, -5, 10],
      [5, 0, 5, 10],
      // Bottom lugs
      [-50, 20, -50, 30],
      [-55, 30, -45, 30],
      [50, 20, 50, 30],
      [45, 30, 55, 30],
    ],
    circles: [
      [0, -5, 5], // Top point
      [-50, 35, 4], // Left point
      [50, 35, 4], // Right point
    ],
    width: 135,
    height: 50
  },

  // ==================== HARDWARE ====================
  {
    id: 'master-link',
    name: 'Master Link',
    category: 'hardware',
    description: 'Oval master link',
    swl: '2-100t',
    lines: [],
    circles: [],
    rects: [
      [-15, 5, 30, 40], // Outer
    ],
    width: 40,
    height: 55
  },
  {
    id: 'swivel',
    name: 'Swivel',
    category: 'hardware',
    description: 'Load bearing swivel',
    swl: '1-50t',
    lines: [
      // Top eye
      [-8, 0, 8, 0],
      [-8, 0, -8, 10],
      [8, 0, 8, 10],
      [-8, 10, 8, 10],
      // Body
      [-5, 10, -5, 20],
      [5, 10, 5, 20],
      // Bearing line
      [-6, 20, 6, 20],
      // Lower body
      [-5, 20, -5, 30],
      [5, 20, 5, 30],
      // Bottom eye
      [-8, 30, 8, 30],
      [-8, 30, -8, 40],
      [8, 30, 8, 40],
      [-8, 40, 8, 40],
    ],
    circles: [
      [0, -5, 6], // Top hole
      [0, 45, 6], // Bottom hole
    ],
    width: 25,
    height: 60
  },
  {
    id: 'turnbuckle',
    name: 'Turnbuckle',
    category: 'hardware',
    description: 'Adjustable turnbuckle',
    swl: '0.5-10t',
    lines: [
      // Top eye
      [-6, 0, 6, 0],
      [-6, 0, -3, 10],
      [6, 0, 3, 10],
      // Top thread
      [-2, 10, -2, 20],
      [2, 10, 2, 20],
      // Body
      [-6, 20, 6, 20],
      [-6, 20, -6, 50],
      [6, 20, 6, 50],
      [-6, 50, 6, 50],
      // Thread marks
      [-4, 25, 4, 25],
      [-4, 30, 4, 30],
      [-4, 40, 4, 40],
      [-4, 45, 4, 45],
      // Bottom thread
      [-2, 50, -2, 60],
      [2, 50, 2, 60],
      // Bottom eye
      [-3, 60, -6, 70],
      [3, 60, 6, 70],
      [-6, 70, 6, 70],
    ],
    circles: [
      [0, -5, 5], // Top hole
      [0, 75, 5], // Bottom hole
    ],
    width: 20,
    height: 85
  },
  {
    id: 'eyebolt',
    name: 'Eyebolt',
    category: 'hardware',
    description: 'Forged eyebolt',
    swl: '0.25-5t',
    lines: [
      // Eye top
      [-10, 0, 10, 0],
      // Eye sides curving to shank
      [-10, 0, -10, 15],
      [10, 0, 10, 15],
      [-10, 15, -3, 20],
      [10, 15, 3, 20],
      // Shank
      [-3, 20, -3, 50],
      [3, 20, 3, 50],
      // Thread marks
      [-4, 30, 4, 30],
      [-4, 35, 4, 35],
      [-4, 40, 4, 40],
      [-4, 45, 4, 45],
    ],
    circles: [
      [0, -8, 7], // Eye hole
    ],
    width: 25,
    height: 60
  },

  // ==================== ACCESSORIES ====================
  {
    id: 'tagline',
    name: 'Tagline',
    category: 'accessories',
    description: 'Load control tagline rope',
    lines: [
      // Rope
      [0, 0, 0, 80],
      // Texture/twist marks
      [-2, 10, 2, 15],
      [-2, 25, 2, 30],
      [-2, 40, 2, 45],
      [-2, 55, 2, 60],
      [-2, 70, 2, 75],
    ],
    circles: [
      [0, -5, 5], // Top loop
      [0, 85, 3], // Handle/knot
    ],
    width: 15,
    height: 95
  },
  {
    id: 'load-cell',
    name: 'Load Cell',
    category: 'accessories',
    description: 'Digital load indicator',
    swl: '1-500t',
    lines: [
      // Top shackle attachment
      [-8, 0, 8, 0],
      [-8, 0, -8, 8],
      [8, 0, 8, 8],
      // Body
      [-15, 8, 15, 8],
      [-15, 8, -15, 45],
      [15, 8, 15, 45],
      [-15, 45, 15, 45],
      // Display window
      [-12, 15, 12, 15],
      [-12, 15, -12, 30],
      [12, 15, 12, 30],
      [-12, 30, 12, 30],
      // Display segments
      [-8, 20, 8, 20],
      [-8, 25, 8, 25],
      // Bottom shackle
      [-8, 45, -8, 53],
      [8, 45, 8, 53],
      [-8, 53, 8, 53],
    ],
    circles: [
      [0, -5, 6], // Top hole
      [0, 58, 6], // Bottom hole
    ],
    width: 40,
    height: 70
  },
]

// ==================== 3D EQUIPMENT ====================
export const RIGGING_EQUIPMENT_3D: RiggingEquipment3D[] = [
  // Shackles
  {
    id: 'bow-shackle-3d',
    name: 'Bow Shackle',
    category: 'shackles',
    description: 'D-ring bow shackle',
    swl: '2-50t',
    geometryType: 'composite',
    dimensions: { width: 0.15, height: 0.12 },
    color: '#4a5568',
    parts: [
      { type: 'cylinder', position: [0, 0.06, 0], rotation: [Math.PI/2, 0, 0], radius: 0.01, height: 0.12, color: '#4a5568' }, // Pin
      { type: 'cylinder', position: [0, 0, 0], radius: 0.05, height: 0.02, color: '#4a5568' }, // Bow body (simplified)
    ]
  },
  {
    id: 'dee-shackle-3d',
    name: 'D-Shackle',
    category: 'shackles',
    description: 'Standard D-shackle',
    swl: '1-25t',
    geometryType: 'composite',
    dimensions: { width: 0.08, height: 0.1 },
    color: '#4a5568',
    parts: [
      { type: 'cylinder', position: [0, 0.05, 0], rotation: [Math.PI/2, 0, 0], radius: 0.008, height: 0.06, color: '#4a5568' },
      { type: 'box', position: [0, 0, 0], size: [0.05, 0.08, 0.02], color: '#4a5568' },
    ]
  },
  // Hooks
  {
    id: 'crane-hook-3d',
    name: 'Crane Hook',
    category: 'hooks',
    description: 'Standard crane hook',
    swl: '5-100t',
    geometryType: 'composite',
    dimensions: { width: 0.2, height: 0.4 },
    color: '#f59e0b',
    parts: [
      { type: 'cylinder', position: [0, 0.18, 0], radius: 0.04, height: 0.08, color: '#374151' }, // Shank
      { type: 'cylinder', position: [0, 0.05, 0], radius: 0.08, height: 0.06, color: '#f59e0b' }, // Hook body (simplified)
      { type: 'sphere', position: [0, -0.05, 0], radius: 0.03, color: '#f59e0b' }, // Hook tip
    ]
  },
  {
    id: 'hook-block-3d',
    name: 'Hook Block',
    category: 'hooks',
    description: 'Multi-sheave hook block',
    swl: '20-500t',
    geometryType: 'box',
    dimensions: { length: 0.4, width: 0.3, height: 0.5 },
    color: '#374151',
  },
  // Slings
  {
    id: 'wire-rope-sling-3d',
    name: 'Wire Rope Sling',
    category: 'slings',
    description: 'Eye-eye wire rope sling',
    swl: '1-50t',
    geometryType: 'cylinder',
    dimensions: { radius: 0.015, height: 2 },
    color: '#6b7280',
  },
  {
    id: 'chain-sling-3d',
    name: 'Chain Sling',
    category: 'chains',
    description: 'Grade 80 lifting chain',
    swl: '1-50t',
    geometryType: 'cylinder',
    dimensions: { radius: 0.01, height: 1.5 },
    color: '#1f2937',
  },
  // Beams
  {
    id: 'spreader-beam-3d',
    name: 'Spreader Beam',
    category: 'beams',
    description: 'Adjustable spreader beam',
    swl: '5-100t',
    geometryType: 'box',
    dimensions: { length: 4, width: 0.3, height: 0.4 },
    color: '#fbbf24',
  },
  {
    id: 'lifting-beam-3d',
    name: 'Lifting Beam',
    category: 'beams',
    description: 'Single point lifting beam',
    swl: '2-50t',
    geometryType: 'box',
    dimensions: { length: 3, width: 0.25, height: 0.3 },
    color: '#f59e0b',
  },
  // Hardware
  {
    id: 'master-link-3d',
    name: 'Master Link',
    category: 'hardware',
    description: 'Oval master link',
    swl: '2-100t',
    geometryType: 'cylinder',
    dimensions: { radius: 0.06, height: 0.1 },
    color: '#4a5568',
  },
  {
    id: 'swivel-3d',
    name: 'Swivel',
    category: 'hardware',
    description: 'Load bearing swivel',
    swl: '1-50t',
    geometryType: 'cylinder',
    dimensions: { radius: 0.04, height: 0.15 },
    color: '#6b7280',
  },
  // Accessories
  {
    id: 'load-cell-3d',
    name: 'Load Cell',
    category: 'accessories',
    description: 'Digital load indicator',
    swl: '1-500t',
    geometryType: 'box',
    dimensions: { length: 0.15, width: 0.1, height: 0.2 },
    color: '#3b82f6',
  },
]

// Helper functions
export const getBlocks2DByCategory = (category: RiggingBlock2D['category']): RiggingBlock2D[] => {
  return RIGGING_BLOCKS_2D.filter(b => b.category === category)
}

export const getEquipment3DByCategory = (category: RiggingEquipment3D['category']): RiggingEquipment3D[] => {
  return RIGGING_EQUIPMENT_3D.filter(e => e.category === category)
}


