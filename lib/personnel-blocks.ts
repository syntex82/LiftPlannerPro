/**
 * Lifting Operations Personnel CAD Blocks
 * Line-based figures for slingers, signallers, banksmen, riggers, crane operators
 * All figures are drawn at origin and scaled/positioned when inserted
 */

export interface PersonnelBlock {
  id: string
  name: string
  category: 'slinger' | 'signaller' | 'banksman' | 'rigger' | 'operator' | 'supervisor' | 'general'
  description: string
  // Lines are defined as [x1, y1, x2, y2] relative to origin
  lines: number[][]
  // Circles are defined as [cx, cy, radius]
  circles?: number[][]
  // Arcs are defined as [cx, cy, radius, startAngle, endAngle]
  arcs?: number[][]
  width: number
  height: number
}

// Helper to create head circle
const HEAD = (x: number, y: number): number[] => [x, y, 8]

// Scale factor for all figures (base height ~60 pixels)
const S = 1

export const PERSONNEL_BLOCKS: PersonnelBlock[] = [
  // ==================== SIGNALLERS - Hand Signals ====================
  {
    id: 'signaller-stop',
    name: 'Stop Signal',
    category: 'signaller',
    description: 'Arm extended, palm down',
    lines: [
      // Body
      [0, 16, 0, 45], // torso
      [0, 45, -10, 70], // left leg
      [0, 45, 10, 70], // right leg
      // Arms extended horizontally
      [-30, 25, 30, 25], // both arms out
      // Hand detail
      [-30, 22, -30, 28], // left palm
      [30, 22, 30, 28], // right palm
    ],
    circles: [[0, 8, 8]], // head
    width: 60,
    height: 70
  },
  {
    id: 'signaller-hoist',
    name: 'Hoist Up Signal',
    category: 'signaller',
    description: 'Arm raised, finger pointing up, circular motion',
    lines: [
      [0, 16, 0, 45], // torso
      [0, 45, -10, 70], // left leg
      [0, 45, 10, 70], // right leg
      // Right arm up
      [0, 25, 15, 5], // arm up
      [15, 5, 15, -5], // pointing up
      // Left arm down
      [0, 25, -15, 35], // arm down at side
    ],
    circles: [[0, 8, 8]],
    width: 40,
    height: 75
  },
  {
    id: 'signaller-lower',
    name: 'Lower Signal',
    category: 'signaller',
    description: 'Arm extended down, palm down',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Right arm pointing down
      [0, 25, 20, 45],
      [20, 45, 20, 50], // hand pointing down
      // Left arm at side
      [0, 25, -12, 40],
    ],
    circles: [[0, 8, 8]],
    width: 40,
    height: 70
  },
  {
    id: 'signaller-slew-left',
    name: 'Slew Left Signal',
    category: 'signaller',
    description: 'Arm extended pointing left',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Left arm extended pointing
      [0, 25, -35, 25],
      [-35, 25, -40, 22], // arrow tip
      [-35, 25, -40, 28],
      // Right arm at side
      [0, 25, 12, 40],
    ],
    circles: [[0, 8, 8]],
    width: 55,
    height: 70
  },
  {
    id: 'signaller-slew-right',
    name: 'Slew Right Signal',
    category: 'signaller',
    description: 'Arm extended pointing right',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Right arm extended pointing
      [0, 25, 35, 25],
      [35, 25, 40, 22],
      [35, 25, 40, 28],
      // Left arm at side
      [0, 25, -12, 40],
    ],
    circles: [[0, 8, 8]],
    width: 55,
    height: 70
  },
  {
    id: 'signaller-boom-up',
    name: 'Boom Up Signal',
    category: 'signaller',
    description: 'Thumb up, arm extended',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Right arm out with thumb up
      [0, 25, 25, 20],
      [25, 20, 25, 10], // thumb up
      [25, 20, 30, 25], // fist
      // Left at side
      [0, 25, -12, 40],
    ],
    circles: [[0, 8, 8]],
    width: 45,
    height: 70
  },
  {
    id: 'signaller-boom-down',
    name: 'Boom Down Signal',
    category: 'signaller',
    description: 'Thumb down, arm extended',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Right arm out with thumb down
      [0, 25, 25, 30],
      [25, 30, 25, 40], // thumb down
      [25, 30, 30, 25], // fist
      [0, 25, -12, 40],
    ],
    circles: [[0, 8, 8]],
    width: 45,
    height: 70
  },
  {
    id: 'signaller-emergency-stop',
    name: 'Emergency Stop',
    category: 'signaller',
    description: 'Both arms waving',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      [0, 25, -25, 5],
      [0, 25, 25, 5],
      [-25, 5, -30, 0],
      [25, 5, 30, 0],
    ],
    circles: [[0, 8, 8]],
    width: 60,
    height: 70
  },

  // ==================== SLINGERS ====================
  {
    id: 'slinger-attaching',
    name: 'Slinger Attaching',
    category: 'slinger',
    description: 'Bending to attach sling',
    lines: [
      [0, 16, -5, 35], // torso bent
      [-5, 35, -15, 60], // left leg
      [-5, 35, 10, 55], // right leg back
      // Arms reaching down
      [0, 20, -20, 45],
      [0, 20, -15, 50],
      // Sling indication
      [-20, 45, -25, 50],
      [-25, 50, -15, 55],
    ],
    circles: [[0, 8, 8]],
    width: 45,
    height: 65
  },
  {
    id: 'slinger-guiding',
    name: 'Slinger Guiding Load',
    category: 'slinger',
    description: 'Hands on load, guiding',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Both arms forward
      [0, 25, 20, 30],
      [0, 25, 20, 35],
      // Load outline
      [25, 25, 45, 25],
      [45, 25, 45, 45],
      [45, 45, 25, 45],
      [25, 45, 25, 25],
    ],
    circles: [[0, 8, 8]],
    width: 50,
    height: 70
  },
  {
    id: 'slinger-checking',
    name: 'Slinger Checking Slings',
    category: 'slinger',
    description: 'Inspecting sling connections',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Arms up checking
      [0, 25, 15, 10],
      [0, 25, -10, 15],
      // Sling lines above
      [15, 5, 15, -15],
      [15, -15, -5, -15],
      [-5, -15, -5, 10],
    ],
    circles: [[0, 8, 8]],
    width: 40,
    height: 85
  },
  {
    id: 'slinger-tagline',
    name: 'Holding Tagline',
    category: 'slinger',
    description: 'Worker holding tagline rope',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Arms holding rope
      [0, 25, 15, 30],
      [0, 25, 12, 35],
      // Tagline going up
      [15, 30, 25, 10],
      [25, 10, 30, -10],
    ],
    circles: [[0, 8, 8]],
    width: 40,
    height: 80
  },

  // ==================== RIGGERS ====================
  {
    id: 'rigger-kneeling',
    name: 'Rigger Kneeling',
    category: 'rigger',
    description: 'Kneeling position working',
    lines: [
      [0, 16, 0, 35], // torso
      [0, 35, -15, 45], // left leg kneeling
      [-15, 45, -15, 60], // lower leg
      [0, 35, 15, 50], // right leg out
      // Arms working
      [0, 22, 15, 35],
      [0, 22, 10, 40],
    ],
    circles: [[0, 8, 8]],
    width: 35,
    height: 60
  },
  {
    id: 'rigger-climbing',
    name: 'Rigger Climbing',
    category: 'rigger',
    description: 'Climbing ladder or structure',
    lines: [
      [0, 16, 0, 40], // torso
      [0, 40, -8, 55],
      [0, 40, 8, 60],
      // Arms up on ladder
      [0, 22, -10, 5],
      [0, 22, 10, 10],
      // Ladder indication
      [-15, 0, -15, 65],
      [-5, 0, -5, 65],
      [-15, 15, -5, 15],
      [-15, 35, -5, 35],
      [-15, 55, -5, 55],
    ],
    circles: [[0, 8, 8]],
    width: 30,
    height: 70
  },
  {
    id: 'rigger-inspecting',
    name: 'Rigger Inspecting',
    category: 'rigger',
    description: 'Inspecting rigging equipment',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Holding equipment up
      [0, 25, 20, 15],
      [0, 25, 15, 20],
      // Shackle outline
      [22, 10, 28, 10],
      [28, 10, 28, 20],
      [28, 20, 22, 20],
      [22, 20, 22, 10],
    ],
    circles: [[0, 8, 8]],
    width: 40,
    height: 70
  },

  // ==================== OPERATORS ====================
  {
    id: 'operator-seated',
    name: 'Crane Operator Seated',
    category: 'operator',
    description: 'Seated at controls',
    lines: [
      [0, 16, 0, 35], // torso
      [0, 35, 15, 35], // seat
      [0, 35, -10, 55], // leg
      [15, 35, 25, 55], // leg forward
      // Arms on controls
      [0, 22, 15, 28],
      [0, 22, -8, 30],
      // Seat back
      [-5, 16, -5, 40],
    ],
    circles: [[0, 8, 8]],
    width: 35,
    height: 55
  },
  {
    id: 'operator-standing',
    name: 'Operator with Radio',
    category: 'operator',
    description: 'Standing with radio to ear',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Right arm with radio to ear
      [0, 25, 12, 15],
      [12, 15, 10, 8], // radio at ear
      // Left arm at side
      [0, 25, -12, 40],
    ],
    circles: [[0, 8, 8]],
    width: 30,
    height: 70
  },

  // ==================== SUPERVISORS ====================
  {
    id: 'supervisor-clipboard',
    name: 'Supervisor with Clipboard',
    category: 'supervisor',
    description: 'Holding clipboard, reviewing',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Arms holding clipboard
      [0, 25, 15, 30],
      [0, 25, 10, 32],
      // Clipboard
      [12, 25, 25, 25],
      [25, 25, 25, 45],
      [25, 45, 12, 45],
      [12, 45, 12, 25],
    ],
    circles: [[0, 8, 8]],
    width: 35,
    height: 70
  },
  {
    id: 'supervisor-pointing',
    name: 'Supervisor Directing',
    category: 'supervisor',
    description: 'Pointing and directing',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Right arm pointing
      [0, 25, 35, 20],
      [35, 20, 42, 18],
      // Left hand on hip
      [0, 25, -12, 35],
      [-12, 35, -8, 40],
    ],
    circles: [[0, 8, 8]],
    width: 50,
    height: 70
  },

  // ==================== GENERAL WORKERS ====================
  {
    id: 'worker-standing',
    name: 'Worker Standing',
    category: 'general',
    description: 'Basic standing figure with hard hat',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      [0, 25, -12, 40],
      [0, 25, 12, 40],
      // Hard hat brim
      [-10, 0, 10, 0],
    ],
    circles: [[0, 8, 8]],
    width: 30,
    height: 70
  },
  {
    id: 'worker-walking',
    name: 'Worker Walking',
    category: 'general',
    description: 'Walking pose',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -15, 70], // leg forward
      [0, 45, 12, 65], // leg back
      [0, 25, -15, 35], // arm back
      [0, 25, 18, 30], // arm forward
    ],
    circles: [[0, 8, 8]],
    width: 35,
    height: 70
  },
  {
    id: 'worker-bending',
    name: 'Worker Bending',
    category: 'general',
    description: 'Bending forward',
    lines: [
      [0, 16, 15, 35], // torso bent forward
      [15, 35, 5, 60], // legs
      [15, 35, 25, 55],
      // Arms hanging
      [5, 22, 25, 50],
      [5, 22, 20, 52],
    ],
    circles: [[0, 8, 8]],
    width: 35,
    height: 60
  },
  {
    id: 'worker-crouching',
    name: 'Worker Crouching',
    category: 'general',
    description: 'Crouched position',
    lines: [
      [0, 16, 0, 30], // short torso
      [0, 30, -15, 40], // leg bent
      [-15, 40, -10, 55],
      [0, 30, 15, 40],
      [15, 40, 20, 55],
      // Arms on knees
      [0, 22, -10, 38],
      [0, 22, 10, 38],
    ],
    circles: [[0, 8, 8]],
    width: 40,
    height: 55
  },
  {
    id: 'worker-carrying',
    name: 'Worker Carrying',
    category: 'general',
    description: 'Carrying object',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Arms carrying box
      [0, 25, 12, 30],
      [0, 25, 12, 38],
      // Box
      [15, 25, 35, 25],
      [35, 25, 35, 45],
      [35, 45, 15, 45],
      [15, 45, 15, 25],
    ],
    circles: [[0, 8, 8]],
    width: 45,
    height: 70
  },
  {
    id: 'worker-looking-up',
    name: 'Worker Looking Up',
    category: 'general',
    description: 'Looking up at load',
    lines: [
      [0, 20, 0, 48], // torso (head positioned higher)
      [0, 48, -10, 73],
      [0, 48, 10, 73],
      // Arms shading eyes
      [0, 28, 12, 18],
      [0, 28, -12, 35],
    ],
    circles: [[0, 10, 8]], // head tilted up
    width: 30,
    height: 73
  },
  {
    id: 'worker-waving',
    name: 'Worker Waving',
    category: 'general',
    description: 'Arm raised waving',
    lines: [
      [0, 16, 0, 45],
      [0, 45, -10, 70],
      [0, 45, 10, 70],
      // Right arm up waving
      [0, 25, 20, 0],
      [20, 0, 25, -5],
      // Left arm at side
      [0, 25, -12, 40],
    ],
    circles: [[0, 8, 8]],
    width: 35,
    height: 75
  },
]

// Get blocks by category
export const getBlocksByCategory = (category: PersonnelBlock['category']): PersonnelBlock[] => {
  return PERSONNEL_BLOCKS.filter(b => b.category === category)
}

// Get all categories
export const PERSONNEL_CATEGORIES = [
  { id: 'signaller', name: 'Signallers', icon: '🖐️' },
  { id: 'slinger', name: 'Slingers', icon: '🔗' },
  { id: 'rigger', name: 'Riggers', icon: '⚙️' },
  { id: 'operator', name: 'Operators', icon: '🎮' },
  { id: 'supervisor', name: 'Supervisors', icon: '📋' },
  { id: 'general', name: 'General Workers', icon: '👷' },
] as const

