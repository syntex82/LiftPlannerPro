// Site Objects Library - Industrial Equipment for Oil Refineries, Chemical Plants, etc.
// These are 2D CAD blocks representing typical equipment that needs lifting

export interface SiteObjectBlock {
  id: string
  name: string
  category: 'vessels' | 'exchangers' | 'columns' | 'tanks' | 'pumps' | 'compressors' | 'reactors' | 'piping' | 'structures'
  description: string
  weight?: string // Typical weight range
  lines: number[][] // [x1, y1, x2, y2]
  circles?: number[][] // [cx, cy, radius]
  arcs?: number[][] // [cx, cy, radius, startAngle, endAngle]
  rects?: number[][] // [x, y, width, height]
  ellipses?: number[][] // [cx, cy, rx, ry] for cylinder ends
  width: number
  height: number
}

export const SITE_OBJECT_CATEGORIES = [
  { id: 'vessels', name: 'Pressure Vessels', icon: '🛢️' },
  { id: 'exchangers', name: 'Heat Exchangers', icon: '🔥' },
  { id: 'columns', name: 'Columns & Towers', icon: '🗼' },
  { id: 'tanks', name: 'Storage Tanks', icon: '⛽' },
  { id: 'pumps', name: 'Pumps', icon: '💧' },
  { id: 'compressors', name: 'Compressors', icon: '🌀' },
  { id: 'reactors', name: 'Reactors', icon: '⚗️' },
  { id: 'piping', name: 'Piping & Valves', icon: '🔧' },
  { id: 'structures', name: 'Structures', icon: '🏗️' },
]

// Helper to create horizontal cylinder (side view)
function createHorizontalCylinder(width: number, height: number, hasLegs: boolean = true): Partial<SiteObjectBlock> {
  const bodyTop = 10
  const bodyBottom = bodyTop + height
  const bodyLeft = 20
  const bodyRight = bodyLeft + width
  const endRadius = height / 2
  
  const lines: number[][] = [
    // Top line
    [bodyLeft, bodyTop, bodyRight, bodyTop],
    // Bottom line
    [bodyLeft, bodyBottom, bodyRight, bodyBottom],
  ]
  
  // Legs/saddles
  if (hasLegs) {
    const legWidth = 15
    const legHeight = 20
    // Left saddle
    lines.push([bodyLeft + 20, bodyBottom, bodyLeft + 20, bodyBottom + legHeight])
    lines.push([bodyLeft + 20 - legWidth/2, bodyBottom + legHeight, bodyLeft + 20 + legWidth/2, bodyBottom + legHeight])
    // Right saddle
    lines.push([bodyRight - 20, bodyBottom, bodyRight - 20, bodyBottom + legHeight])
    lines.push([bodyRight - 20 - legWidth/2, bodyBottom + legHeight, bodyRight - 20 + legWidth/2, bodyBottom + legHeight])
  }
  
  // Elliptical ends (represented as arcs)
  const arcs: number[][] = [
    // Left end (half ellipse)
    [bodyLeft, bodyTop + endRadius, endRadius * 0.3, endRadius, Math.PI/2, -Math.PI/2],
    // Right end (half ellipse)  
    [bodyRight, bodyTop + endRadius, endRadius * 0.3, endRadius, -Math.PI/2, Math.PI/2],
  ]
  
  return { lines, arcs, width: width + 50, height: height + (hasLegs ? 30 : 10) }
}

// Helper to create vertical cylinder (column/tower)
function createVerticalCylinder(width: number, height: number, hasPlatforms: boolean = false): Partial<SiteObjectBlock> {
  const bodyLeft = 20
  const bodyRight = bodyLeft + width
  const bodyTop = 10
  const bodyBottom = bodyTop + height
  
  const lines: number[][] = [
    // Left side
    [bodyLeft, bodyTop, bodyLeft, bodyBottom],
    // Right side
    [bodyRight, bodyTop, bodyRight, bodyBottom],
    // Base
    [bodyLeft - 10, bodyBottom, bodyRight + 10, bodyBottom],
    [bodyLeft - 10, bodyBottom, bodyLeft - 10, bodyBottom + 5],
    [bodyRight + 10, bodyBottom, bodyRight + 10, bodyBottom + 5],
  ]
  
  // Top dome
  const arcs: number[][] = [
    [bodyLeft + width/2, bodyTop, width/2, width/4, Math.PI, 0],
  ]
  
  // Platforms
  if (hasPlatforms) {
    const platformSpacing = height / 4
    for (let i = 1; i < 4; i++) {
      const y = bodyTop + i * platformSpacing
      lines.push([bodyLeft - 15, y, bodyLeft, y])
      lines.push([bodyRight, y, bodyRight + 15, y])
      lines.push([bodyLeft - 15, y, bodyLeft - 15, y + 3])
      lines.push([bodyRight + 15, y, bodyRight + 15, y + 3])
    }
  }
  
  return { lines, arcs, width: width + 50, height: height + 20 }
}

export const SITE_OBJECTS: SiteObjectBlock[] = [
  // PRESSURE VESSELS
  {
    id: 'horizontal-vessel-small',
    name: 'Horizontal Vessel (Small)',
    category: 'vessels',
    description: '2m x 1m pressure vessel',
    weight: '2-5 tonnes',
    lines: [
      // Body
      [20, 10, 120, 10], // top
      [20, 50, 120, 50], // bottom
      // Left end cap
      [20, 10, 10, 30], [10, 30, 20, 50],
      // Right end cap
      [120, 10, 130, 30], [130, 30, 120, 50],
      // Saddles
      [40, 50, 40, 70], [30, 70, 50, 70],
      [100, 50, 100, 70], [90, 70, 110, 70],
      // Nozzles
      [50, 10, 50, 0], [45, 0, 55, 0],
      [90, 10, 90, 0], [85, 0, 95, 0],
    ],
    circles: [],
    width: 140,
    height: 80
  },
  {
    id: 'horizontal-vessel-medium',
    name: 'Horizontal Vessel (Medium)',
    category: 'vessels',
    description: '4m x 1.5m pressure vessel',
    weight: '8-15 tonnes',
    lines: [
      // Body
      [20, 10, 180, 10], // top
      [20, 55, 180, 55], // bottom
      // Left end cap (dished)
      [20, 10, 8, 32.5], [8, 32.5, 20, 55],
      // Right end cap (dished)
      [180, 10, 192, 32.5], [192, 32.5, 180, 55],
      // Saddles
      [50, 55, 50, 80], [35, 80, 65, 80],
      [150, 55, 150, 80], [135, 80, 165, 80],
      // Nozzles on top
      [70, 10, 70, 0], [65, 0, 75, 0],
      [100, 10, 100, 0], [95, 0, 105, 0],
      [130, 10, 130, 0], [125, 0, 135, 0],
      // Manway
      [160, 10, 160, 5], [155, 5, 165, 5], [155, 5, 155, 0], [165, 5, 165, 0],
    ],
    circles: [],
    width: 200,
    height: 90
  },
  {
    id: 'horizontal-vessel-large',
    name: 'Horizontal Vessel (Large)',
    category: 'vessels',
    description: '8m x 2.5m pressure vessel',
    weight: '25-50 tonnes',
    lines: [
      // Body
      [20, 10, 260, 10], // top
      [20, 70, 260, 70], // bottom
      // Left end cap
      [20, 10, 5, 40], [5, 40, 20, 70],
      // Right end cap
      [260, 10, 275, 40], [275, 40, 260, 70],
      // Saddles (3 for large vessel)
      [60, 70, 60, 95], [45, 95, 75, 95],
      [140, 70, 140, 95], [125, 95, 155, 95],
      [220, 70, 220, 95], [205, 95, 235, 95],
      // Nozzles
      [80, 10, 80, 0], [75, 0, 85, 0],
      [120, 10, 120, 0], [115, 0, 125, 0],
      [160, 10, 160, 0], [155, 0, 165, 0],
      [200, 10, 200, 0], [195, 0, 205, 0],
      // Manway
      [240, 10, 240, 3], [233, 3, 247, 3],
    ],
    circles: [],
    width: 285,
    height: 105
  },

  // HEAT EXCHANGERS
  {
    id: 'shell-tube-exchanger-small',
    name: 'Shell & Tube Exchanger (Small)',
    category: 'exchangers',
    description: '3m shell & tube heat exchanger',
    weight: '3-8 tonnes',
    lines: [
      // Shell body
      [30, 15, 150, 15], // top
      [30, 55, 150, 55], // bottom
      // Left channel head
      [30, 15, 30, 55],
      [30, 15, 15, 25], [15, 25, 15, 45], [15, 45, 30, 55],
      // Right channel head
      [150, 15, 150, 55],
      [150, 15, 165, 25], [165, 25, 165, 45], [165, 45, 150, 55],
      // Tube sheet lines
      [30, 20, 30, 50],
      [150, 20, 150, 50],
      // Saddles
      [55, 55, 55, 75], [45, 75, 65, 75],
      [125, 55, 125, 75], [115, 75, 135, 75],
      // Shell nozzles
      [50, 15, 50, 5], [45, 5, 55, 5],
      [130, 55, 130, 65], [125, 65, 135, 65],
      // Channel nozzles
      [15, 30, 5, 30], [5, 25, 5, 35],
      [165, 40, 175, 40], [175, 35, 175, 45],
    ],
    circles: [],
    width: 180,
    height: 85
  },
  {
    id: 'shell-tube-exchanger-large',
    name: 'Shell & Tube Exchanger (Large)',
    category: 'exchangers',
    description: '6m shell & tube heat exchanger',
    weight: '15-35 tonnes',
    lines: [
      // Shell body
      [30, 15, 230, 15], // top
      [30, 65, 230, 65], // bottom
      // Left channel head (larger)
      [30, 15, 30, 65],
      [30, 15, 10, 28], [10, 28, 10, 52], [10, 52, 30, 65],
      // Right floating head
      [230, 15, 230, 65],
      [230, 15, 250, 28], [250, 28, 250, 52], [250, 52, 230, 65],
      // Tube sheets
      [30, 18, 30, 62],
      [230, 18, 230, 62],
      // Saddles
      [70, 65, 70, 90], [55, 90, 85, 90],
      [130, 65, 130, 90], [115, 90, 145, 90],
      [190, 65, 190, 90], [175, 90, 205, 90],
      // Shell nozzles
      [60, 15, 60, 3], [55, 3, 65, 3],
      [100, 15, 100, 3], [95, 3, 105, 3],
      [160, 65, 160, 77], [155, 77, 165, 77],
      [200, 65, 200, 77], [195, 77, 205, 77],
      // Channel nozzles
      [10, 35, 0, 35], [0, 30, 0, 40],
      [250, 45, 260, 45], [260, 40, 260, 50],
    ],
    circles: [],
    width: 270,
    height: 100
  },
  {
    id: 'air-cooler',
    name: 'Air Cooled Exchanger',
    category: 'exchangers',
    description: 'Fin-fan air cooler',
    weight: '10-25 tonnes',
    lines: [
      // Header box left
      [10, 30, 10, 60], [10, 30, 30, 30], [30, 30, 30, 60], [10, 60, 30, 60],
      // Header box right
      [170, 30, 170, 60], [170, 30, 190, 30], [190, 30, 190, 60], [170, 60, 190, 60],
      // Tube bundle (finned tubes)
      [30, 35, 170, 35], [30, 40, 170, 40], [30, 45, 170, 45],
      [30, 50, 170, 50], [30, 55, 170, 55],
      // Fan housing
      [50, 60, 50, 100], [150, 60, 150, 100],
      [50, 100, 150, 100],
      // Fan motor
      [90, 100, 90, 115], [110, 100, 110, 115],
      [90, 115, 110, 115],
      // Support structure
      [40, 100, 40, 130], [160, 100, 160, 130],
      [40, 130, 160, 130],
      // Nozzles
      [10, 40, 0, 40], [0, 35, 0, 45],
      [190, 50, 200, 50], [200, 45, 200, 55],
    ],
    circles: [
      [100, 80, 25], // Fan circle
    ],
    width: 210,
    height: 140
  },

  // COLUMNS & TOWERS
  {
    id: 'distillation-column-small',
    name: 'Distillation Column (Small)',
    category: 'columns',
    description: '15m tall, 1.5m diameter',
    weight: '20-40 tonnes',
    lines: [
      // Column body
      [30, 10, 30, 180], // left
      [70, 10, 70, 180], // right
      // Top dome
      [30, 10, 40, 3], [40, 3, 60, 3], [60, 3, 70, 10],
      // Bottom cone
      [30, 180, 40, 195], [70, 180, 60, 195], [40, 195, 60, 195],
      // Skirt
      [35, 195, 35, 210], [65, 195, 65, 210],
      [25, 210, 75, 210],
      // Trays (internal)
      [32, 30, 68, 30], [32, 50, 68, 50], [32, 70, 68, 70],
      [32, 90, 68, 90], [32, 110, 68, 110], [32, 130, 68, 130],
      [32, 150, 68, 150], [32, 170, 68, 170],
      // Feed nozzle
      [70, 100, 85, 100], [85, 95, 85, 105],
      // Overhead nozzle
      [50, 3, 50, -7], [45, -7, 55, -7],
      // Bottom nozzle
      [50, 195, 50, 205],
      // Reboiler return
      [70, 175, 85, 175], [85, 170, 85, 180],
      // Platforms
      [20, 40, 30, 40], [70, 40, 80, 40],
      [20, 80, 30, 80], [70, 80, 80, 80],
      [20, 120, 30, 120], [70, 120, 80, 120],
      [20, 160, 30, 160], [70, 160, 80, 160],
    ],
    circles: [],
    width: 100,
    height: 220
  },
  {
    id: 'distillation-column-large',
    name: 'Distillation Column (Large)',
    category: 'columns',
    description: '30m tall, 3m diameter',
    weight: '80-150 tonnes',
    lines: [
      // Column body
      [20, 10, 20, 280], // left
      [80, 10, 80, 280], // right
      // Top dome
      [20, 10, 35, 0], [35, 0, 65, 0], [65, 0, 80, 10],
      // Bottom cone
      [20, 280, 35, 300], [80, 280, 65, 300], [35, 300, 65, 300],
      // Skirt
      [25, 300, 25, 320], [75, 300, 75, 320],
      [15, 320, 85, 320],
      // Trays
      [22, 30, 78, 30], [22, 50, 78, 50], [22, 70, 78, 70],
      [22, 90, 78, 90], [22, 110, 78, 110], [22, 130, 78, 130],
      [22, 150, 78, 150], [22, 170, 78, 170], [22, 190, 78, 190],
      [22, 210, 78, 210], [22, 230, 78, 230], [22, 250, 78, 250],
      [22, 270, 78, 270],
      // Feed nozzles
      [80, 140, 100, 140], [100, 135, 100, 145],
      [80, 200, 100, 200], [100, 195, 100, 205],
      // Overhead
      [50, 0, 50, -15], [45, -15, 55, -15],
      // Bottom
      [50, 300, 50, 315],
      // Platforms
      [10, 50, 20, 50], [80, 50, 90, 50],
      [10, 100, 20, 100], [80, 100, 90, 100],
      [10, 150, 20, 150], [80, 150, 90, 150],
      [10, 200, 20, 200], [80, 200, 90, 200],
      [10, 250, 20, 250], [80, 250, 90, 250],
    ],
    circles: [],
    width: 110,
    height: 335
  },

  // STORAGE TANKS
  {
    id: 'storage-tank-small',
    name: 'Storage Tank (Small)',
    category: 'tanks',
    description: '5m diameter x 6m tall',
    weight: '15-25 tonnes (empty)',
    lines: [
      // Tank body
      [20, 20, 20, 100], // left
      [100, 20, 100, 100], // right
      // Cone roof
      [20, 20, 60, 5], [60, 5, 100, 20],
      // Bottom
      [20, 100, 100, 100],
      // Foundation ring
      [15, 100, 105, 100], [15, 100, 15, 105], [105, 100, 105, 105],
      // Nozzles
      [20, 40, 10, 40], [10, 35, 10, 45],
      [20, 70, 10, 70], [10, 65, 10, 75],
      [100, 50, 110, 50], [110, 45, 110, 55],
      // Vent
      [60, 5, 60, 0], [55, 0, 65, 0],
      // Ladder
      [100, 25, 108, 25], [108, 25, 108, 100],
      // Stairway platform
      [100, 20, 115, 20], [115, 20, 115, 25],
    ],
    circles: [],
    width: 125,
    height: 115
  },
  {
    id: 'storage-tank-large',
    name: 'Storage Tank (Large)',
    category: 'tanks',
    description: '20m diameter x 12m tall',
    weight: '100-200 tonnes (empty)',
    lines: [
      // Tank body
      [20, 30, 20, 150], // left
      [180, 30, 180, 150], // right
      // Floating roof (shown slightly below top)
      [22, 35, 178, 35],
      // Bottom
      [20, 150, 180, 150],
      // Foundation
      [10, 150, 190, 150], [10, 150, 10, 158], [190, 150, 190, 158],
      // Wind girder
      [20, 30, 180, 30],
      [20, 28, 20, 32], [180, 28, 180, 32],
      // Nozzles
      [20, 60, 5, 60], [5, 55, 5, 65],
      [20, 100, 5, 100], [5, 95, 5, 105],
      [20, 140, 5, 140], [5, 135, 5, 145],
      [180, 80, 195, 80], [195, 75, 195, 85],
      [180, 120, 195, 120], [195, 115, 195, 125],
      // Spiral stairway (simplified)
      [180, 35, 195, 35], [195, 35, 195, 150],
      [180, 70, 195, 70], [180, 105, 195, 105], [180, 140, 195, 140],
      // Roof drain
      [100, 35, 100, 30], [95, 30, 105, 30],
    ],
    circles: [],
    width: 205,
    height: 168
  },

  // PUMPS
  {
    id: 'centrifugal-pump',
    name: 'Centrifugal Pump',
    category: 'pumps',
    description: 'Horizontal centrifugal pump',
    weight: '0.5-3 tonnes',
    lines: [
      // Pump casing
      [30, 25, 30, 55], [30, 55, 70, 55], [70, 55, 70, 25], [70, 25, 30, 25],
      // Suction nozzle
      [30, 40, 15, 40], [15, 35, 15, 45],
      // Discharge nozzle
      [50, 25, 50, 10], [45, 10, 55, 10],
      // Motor
      [75, 30, 75, 50], [75, 50, 120, 50], [120, 50, 120, 30], [120, 30, 75, 30],
      // Coupling guard
      [70, 35, 75, 35], [70, 45, 75, 45],
      // Baseplate
      [20, 55, 130, 55], [20, 55, 20, 60], [130, 55, 130, 60],
      [20, 60, 130, 60],
      // Foundation bolts
      [25, 60, 25, 65], [45, 60, 45, 65],
      [105, 60, 105, 65], [125, 60, 125, 65],
    ],
    circles: [
      [50, 40, 18], // Pump volute
    ],
    width: 140,
    height: 75
  },
  {
    id: 'vertical-pump',
    name: 'Vertical Pump',
    category: 'pumps',
    description: 'Vertical inline pump',
    weight: '1-5 tonnes',
    lines: [
      // Pump body
      [30, 50, 30, 90], [70, 50, 70, 90],
      [30, 90, 70, 90],
      // Suction (bottom)
      [40, 90, 40, 105], [60, 90, 60, 105],
      [40, 105, 60, 105],
      // Discharge (side)
      [70, 70, 90, 70], [90, 65, 90, 75],
      // Motor on top
      [35, 20, 35, 50], [65, 20, 65, 50],
      [35, 20, 65, 20],
      // Motor top
      [40, 20, 40, 10], [60, 20, 60, 10],
      [40, 10, 60, 10],
      // Coupling
      [45, 50, 55, 50],
      // Base
      [25, 105, 75, 105], [25, 105, 25, 110], [75, 105, 75, 110],
    ],
    circles: [],
    width: 100,
    height: 120
  },

  // COMPRESSORS
  {
    id: 'reciprocating-compressor',
    name: 'Reciprocating Compressor',
    category: 'compressors',
    description: 'Multi-stage reciprocating compressor',
    weight: '20-80 tonnes',
    lines: [
      // Crankcase
      [20, 50, 20, 90], [20, 90, 120, 90], [120, 90, 120, 50], [120, 50, 20, 50],
      // Cylinders (2 stages)
      [30, 50, 30, 25], [55, 50, 55, 25], [30, 25, 55, 25],
      [75, 50, 75, 30], [95, 50, 95, 30], [75, 30, 95, 30],
      // Piston rods
      [42, 25, 42, 15], [85, 30, 85, 20],
      // Crossheads
      [35, 15, 50, 15], [80, 20, 90, 20],
      // Motor/driver
      [130, 55, 130, 85], [130, 85, 180, 85], [180, 85, 180, 55], [180, 55, 130, 55],
      // Coupling
      [120, 65, 130, 65], [120, 75, 130, 75],
      // Suction/discharge piping
      [30, 25, 20, 25], [20, 20, 20, 30],
      [55, 25, 65, 25], [65, 20, 65, 30],
      [75, 30, 70, 30], [70, 25, 70, 35],
      [95, 30, 105, 30], [105, 25, 105, 35],
      // Foundation
      [10, 90, 190, 90], [10, 90, 10, 100], [190, 90, 190, 100],
    ],
    circles: [],
    width: 200,
    height: 110
  },
  {
    id: 'centrifugal-compressor',
    name: 'Centrifugal Compressor',
    category: 'compressors',
    description: 'Multi-stage centrifugal compressor',
    weight: '30-100 tonnes',
    lines: [
      // Compressor casing
      [30, 30, 30, 80], [30, 80, 130, 80], [130, 80, 130, 30], [130, 30, 30, 30],
      // Inlet
      [30, 55, 15, 55], [15, 45, 15, 65],
      // Discharge
      [80, 30, 80, 15], [70, 15, 90, 15],
      // Bearing housings
      [25, 45, 30, 45], [25, 65, 30, 65],
      [130, 45, 135, 45], [130, 65, 135, 65],
      // Gearbox
      [140, 40, 140, 70], [140, 70, 170, 70], [170, 70, 170, 40], [170, 40, 140, 40],
      // Motor/turbine driver
      [180, 35, 180, 75], [180, 75, 240, 75], [240, 75, 240, 35], [240, 35, 180, 35],
      // Couplings
      [130, 50, 140, 50], [130, 60, 140, 60],
      [170, 50, 180, 50], [170, 60, 180, 60],
      // Foundation
      [20, 80, 250, 80], [20, 80, 20, 90], [250, 80, 250, 90],
    ],
    circles: [],
    width: 260,
    height: 100
  },

  // REACTORS
  {
    id: 'reactor-vessel',
    name: 'Reactor Vessel',
    category: 'reactors',
    description: 'Catalytic reactor vessel',
    weight: '50-150 tonnes',
    lines: [
      // Vessel body
      [30, 30, 30, 180], // left
      [90, 30, 90, 180], // right
      // Top head (hemispherical)
      [30, 30, 45, 15], [45, 15, 75, 15], [75, 15, 90, 30],
      // Bottom head
      [30, 180, 45, 195], [45, 195, 75, 195], [75, 195, 90, 180],
      // Skirt
      [35, 195, 35, 220], [85, 195, 85, 220],
      [25, 220, 95, 220],
      // Catalyst bed supports
      [32, 60, 88, 60], [32, 120, 88, 120],
      // Inlet distributor
      [60, 15, 60, 5], [55, 5, 65, 5],
      [60, 30, 60, 45],
      // Outlet collector
      [60, 180, 60, 195],
      // Thermowells
      [90, 80, 100, 80], [90, 140, 100, 140],
      // Manways
      [30, 90, 20, 90], [20, 85, 20, 95],
      [30, 150, 20, 150], [20, 145, 20, 155],
      // Platforms
      [20, 50, 30, 50], [90, 50, 100, 50],
      [20, 100, 30, 100], [90, 100, 100, 100],
      [20, 160, 30, 160], [90, 160, 100, 160],
    ],
    circles: [],
    width: 110,
    height: 230
  },

  // PIPING & VALVES
  {
    id: 'gate-valve',
    name: 'Gate Valve',
    category: 'piping',
    description: 'Large gate valve',
    weight: '0.2-2 tonnes',
    lines: [
      // Body
      [10, 30, 10, 50], [10, 50, 30, 50], [30, 50, 30, 30], [30, 30, 10, 30],
      [50, 30, 50, 50], [50, 50, 70, 50], [70, 50, 70, 30], [70, 30, 50, 30],
      // Wedge housing
      [30, 25, 30, 55], [50, 25, 50, 55],
      [30, 25, 35, 15], [50, 25, 45, 15], [35, 15, 45, 15],
      // Stem
      [40, 15, 40, 0],
      // Handwheel
      [30, 0, 50, 0], [35, 0, 35, -5], [45, 0, 45, -5],
      // Flanges
      [5, 30, 5, 50], [75, 30, 75, 50],
      // Pipe stubs
      [0, 35, 5, 35], [0, 45, 5, 45],
      [75, 35, 80, 35], [75, 45, 80, 45],
    ],
    circles: [],
    width: 85,
    height: 65
  },
  {
    id: 'pipe-spool',
    name: 'Pipe Spool',
    category: 'piping',
    description: 'Fabricated pipe spool with flanges',
    weight: '0.5-5 tonnes',
    lines: [
      // Main pipe
      [20, 30, 20, 50], [180, 30, 180, 50],
      [20, 30, 180, 30], [20, 50, 180, 50],
      // Left flange
      [10, 25, 10, 55], [10, 25, 20, 25], [10, 55, 20, 55],
      // Right flange
      [190, 25, 190, 55], [180, 25, 190, 25], [180, 55, 190, 55],
      // Elbow
      [80, 30, 80, 10], [100, 30, 100, 10],
      [80, 10, 100, 10],
      // Branch connection
      [130, 30, 130, 15], [145, 30, 145, 15],
      [130, 15, 145, 15],
      // Weld lines
      [50, 30, 50, 50], [150, 30, 150, 50],
    ],
    circles: [],
    width: 200,
    height: 65
  },

  // STRUCTURES
  {
    id: 'pipe-rack',
    name: 'Pipe Rack Section',
    category: 'structures',
    description: '6m wide pipe rack section',
    weight: '5-15 tonnes',
    lines: [
      // Left column
      [20, 10, 20, 120], [30, 10, 30, 120],
      [20, 10, 30, 10], [20, 120, 30, 120],
      // Right column
      [150, 10, 150, 120], [160, 10, 160, 120],
      [150, 10, 160, 10], [150, 120, 160, 120],
      // Top beam
      [30, 15, 150, 15], [30, 25, 150, 25],
      // Bottom beam
      [30, 80, 150, 80], [30, 90, 150, 90],
      // Bracing
      [30, 25, 150, 80], [150, 25, 30, 80],
      // Pipe supports on top
      [50, 15, 50, 10], [80, 15, 80, 10],
      [110, 15, 110, 10], [140, 15, 140, 10],
      // Foundation
      [10, 120, 40, 120], [140, 120, 170, 120],
    ],
    circles: [],
    width: 180,
    height: 130
  },
  {
    id: 'platform-structure',
    name: 'Access Platform',
    category: 'structures',
    description: 'Steel access platform',
    weight: '2-8 tonnes',
    lines: [
      // Platform deck
      [20, 20, 150, 20], [20, 25, 150, 25],
      // Handrails
      [20, 5, 20, 20], [150, 5, 150, 20],
      [20, 5, 150, 5],
      // Mid rail
      [20, 12, 150, 12],
      // Support columns
      [30, 25, 30, 80], [140, 25, 140, 80],
      // Bracing
      [30, 25, 60, 80], [140, 25, 110, 80],
      // Stair
      [150, 20, 180, 50], [155, 25, 185, 55],
      [180, 50, 180, 80], [185, 55, 185, 80],
      // Stair handrail
      [150, 5, 180, 35], [180, 35, 180, 50],
      // Base
      [20, 80, 190, 80],
    ],
    circles: [],
    width: 195,
    height: 90
  },
]

