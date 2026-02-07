/**
 * Lifting Operations Personnel CAD Blocks
 * Professional detailed figures for slingers, signallers, banksmen, riggers, crane operators
 * All figures are drawn at origin and scaled/positioned when inserted
 * Scale: 1 unit = approximately 10mm at 1:50 scale
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
  // Arcs are defined as [cx, cy, radius, startAngle, endAngle] in degrees
  arcs?: number[][]
  // Rectangles [x, y, width, height]
  rects?: number[][]
  // Ellipses [cx, cy, rx, ry]
  ellipses?: number[][]
  width: number
  height: number
}

// Professional figure proportions (standing height ~180 units = 1.8m)
// Head: 20 units, Torso: 50 units, Legs: 90 units, Arms: 60 units span

export const PERSONNEL_BLOCKS: PersonnelBlock[] = [
  // ==================== SIGNALLERS - Hand Signals ====================
  {
    id: 'signaller-stop',
    name: 'STOP Signal',
    category: 'signaller',
    description: 'Both arms extended horizontally - EMERGENCY STOP',
    lines: [
      // Hard hat brim
      [-14, 0, 14, 0],
      // Neck
      [0, 22, 0, 30],
      // Shoulders
      [-20, 30, 20, 30],
      // Torso - left side
      [-20, 30, -18, 80],
      // Torso - right side
      [20, 30, 18, 80],
      // Torso bottom
      [-18, 80, 18, 80],
      // Belt
      [-18, 75, 18, 75],
      // Left leg outer
      [-18, 80, -22, 170],
      // Left leg inner
      [-8, 80, -12, 170],
      // Right leg outer
      [18, 80, 22, 170],
      // Right leg inner
      [8, 80, 12, 170],
      // Left foot
      [-26, 170, -10, 170],
      // Right foot
      [10, 170, 26, 170],
      // LEFT ARM - extended horizontal
      [-20, 35, -70, 35],
      // Left upper arm thickness
      [-20, 30, -20, 40],
      [-45, 30, -45, 40],
      // Left forearm
      [-45, 32, -70, 32],
      [-45, 38, -70, 38],
      // Left hand (palm down)
      [-70, 28, -70, 42],
      [-70, 28, -80, 32],
      [-70, 42, -80, 38],
      [-80, 32, -80, 38],
      // RIGHT ARM - extended horizontal
      [20, 35, 70, 35],
      // Right upper arm thickness
      [20, 30, 20, 40],
      [45, 30, 45, 40],
      // Right forearm
      [45, 32, 70, 32],
      [45, 38, 70, 38],
      // Right hand (palm down)
      [70, 28, 70, 42],
      [70, 28, 80, 32],
      [70, 42, 80, 38],
      [80, 32, 80, 38],
      // Hi-vis stripes on torso
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [
      [0, 12, 12], // Head
    ],
    ellipses: [
      [0, 5, 16, 8], // Hard hat dome
    ],
    width: 170,
    height: 175
  },
  {
    id: 'signaller-hoist',
    name: 'HOIST Signal',
    category: 'signaller',
    description: 'Right arm up, finger pointing up with circular motion',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck
      [0, 22, 0, 30],
      // Shoulders
      [-20, 30, 20, 30],
      // Torso
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // LEFT ARM - at side
      [-20, 35, -25, 70],
      [-20, 40, -25, 72],
      // RIGHT ARM - raised up pointing
      [20, 30, 35, -20],
      [20, 35, 38, -18],
      // Pointing finger
      [35, -20, 35, -40],
      [38, -18, 38, -38],
      [35, -40, 38, -38],
      // Circular motion indicator
      [45, -25, 50, -35],
      [50, -35, 55, -30],
      [55, -30, 50, -20],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [
      [0, 12, 12],
    ],
    ellipses: [
      [0, 5, 16, 8],
    ],
    width: 100,
    height: 210
  },
  {
    id: 'signaller-lower',
    name: 'LOWER Signal',
    category: 'signaller',
    description: 'Right arm extended down, palm down',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // Left arm at side
      [-20, 35, -25, 70],
      [-20, 40, -25, 72],
      // Right arm pointing down at 45 degrees
      [20, 35, 55, 80],
      [20, 40, 58, 82],
      // Hand palm down
      [55, 78, 55, 88],
      [58, 78, 58, 88],
      [55, 88, 65, 85],
      [58, 88, 68, 85],
      // Down arrow indicator
      [70, 75, 70, 95],
      [65, 90, 70, 95],
      [75, 90, 70, 95],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 110,
    height: 175
  },
  {
    id: 'signaller-slew-left',
    name: 'SLEW LEFT Signal',
    category: 'signaller',
    description: 'Left arm extended pointing left',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // Right arm at side
      [20, 35, 25, 70],
      [20, 40, 25, 72],
      // LEFT ARM extended pointing left
      [-20, 35, -75, 35],
      [-20, 40, -75, 40],
      // Pointing hand
      [-75, 32, -90, 35],
      [-75, 43, -90, 40],
      [-90, 35, -90, 40],
      // Arrow indicator
      [-95, 30, -105, 37],
      [-95, 45, -105, 37],
      [-105, 37, -115, 37],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 140,
    height: 175
  },
  {
    id: 'signaller-slew-right',
    name: 'SLEW RIGHT Signal',
    category: 'signaller',
    description: 'Right arm extended pointing right',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // Left arm at side
      [-20, 35, -25, 70],
      [-20, 40, -25, 72],
      // RIGHT ARM extended pointing right
      [20, 35, 75, 35],
      [20, 40, 75, 40],
      // Pointing hand
      [75, 32, 90, 35],
      [75, 43, 90, 40],
      [90, 35, 90, 40],
      // Arrow indicator
      [95, 30, 105, 37],
      [95, 45, 105, 37],
      [105, 37, 115, 37],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 140,
    height: 175
  },
  {
    id: 'signaller-travel-to-me',
    name: 'TRAVEL TO ME Signal',
    category: 'signaller',
    description: 'Both arms beckoning towards body',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // LEFT ARM bent beckoning
      [-20, 35, -45, 25],
      [-20, 40, -48, 28],
      [-45, 25, -35, 45],
      [-48, 28, -38, 48],
      // RIGHT ARM bent beckoning
      [20, 35, 45, 25],
      [20, 40, 48, 28],
      [45, 25, 35, 45],
      [48, 28, 38, 48],
      // Motion arrows
      [-55, 35, -45, 35],
      [-55, 30, -55, 40],
      [55, 35, 45, 35],
      [55, 30, 55, 40],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 120,
    height: 175
  },
  {
    id: 'signaller-emergency-stop',
    name: 'EMERGENCY STOP',
    category: 'signaller',
    description: 'Both arms waving overhead - EMERGENCY',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs - wide stance
      [-18, 80, -28, 170],
      [-8, 80, -18, 170],
      [18, 80, 28, 170],
      [8, 80, 18, 170],
      [-32, 170, -16, 170],
      [16, 170, 32, 170],
      // LEFT ARM - waving up
      [-20, 30, -50, -15],
      [-20, 35, -53, -12],
      [-50, -15, -45, -35],
      [-53, -12, -48, -32],
      // RIGHT ARM - waving up
      [20, 30, 50, -15],
      [20, 35, 53, -12],
      [50, -15, 45, -35],
      [53, -12, 48, -32],
      // Motion lines
      [-55, -20, -60, -10],
      [55, -20, 60, -10],
      [-48, -40, -55, -35],
      [48, -40, 55, -35],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 130,
    height: 210
  },

  // ==================== SLINGERS ====================
  {
    id: 'slinger-attaching',
    name: 'Slinger Attaching Sling',
    category: 'slinger',
    description: 'Bending to attach sling to load',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Head tilted forward
      [0, 22, 10, 35],
      // Shoulders & torso bent forward
      [-10, 35, 30, 40],
      [30, 40, 35, 80],
      [30, 45, 35, 82],
      [-10, 35, -5, 80],
      [-10, 40, -3, 82],
      // Belt
      [-5, 75, 35, 78],
      // Legs bent
      [-5, 80, -20, 140],
      [5, 80, -10, 140],
      [35, 80, 45, 140],
      [35, 85, 48, 142],
      // Feet
      [-25, 140, -8, 140],
      [40, 140, 52, 140],
      // LEFT ARM reaching down to sling
      [-10, 38, -30, 90],
      [-10, 42, -28, 92],
      // RIGHT ARM reaching down
      [30, 42, 50, 95],
      [30, 46, 52, 97],
      // Sling on ground
      [-35, 95, -25, 100],
      [-25, 100, 60, 105],
      [60, 105, 70, 100],
      // Hi-vis on back
      [-8, 55, 33, 58],
      [-6, 60, 34, 63],
    ],
    circles: [[8, 12, 12]],
    ellipses: [[8, 5, 16, 8]],
    width: 110,
    height: 145
  },
  {
    id: 'slinger-guiding',
    name: 'Slinger Guiding Load',
    category: 'slinger',
    description: 'Hands on suspended load, guiding',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // Both arms reaching forward to load
      [20, 35, 55, 40],
      [20, 40, 55, 45],
      [-20, 35, -55, 40],
      [-20, 40, -55, 45],
      // Load (suspended box)
      [-70, 30, 70, 30],
      [70, 30, 70, 70],
      [70, 70, -70, 70],
      [-70, 70, -70, 30],
      // Sling lines going up
      [-50, 30, -40, -20],
      [50, 30, 40, -20],
      [-40, -20, 40, -20],
      [0, -20, 0, -40],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 150,
    height: 210
  },
  {
    id: 'slinger-checking',
    name: 'Slinger Checking Slings',
    category: 'slinger',
    description: 'Inspecting sling connections overhead',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // Both arms raised checking slings above
      [-20, 30, -35, -10],
      [-20, 35, -38, -8],
      [20, 30, 35, -10],
      [20, 35, 38, -8],
      // Hands on sling hardware
      [-35, -10, -25, -15],
      [35, -10, 25, -15],
      // Sling arrangement above
      [-40, -15, -40, -50],
      [40, -15, 40, -50],
      [-40, -50, 0, -65],
      [40, -50, 0, -65],
      [0, -65, 0, -85],
      // Shackle
      [-5, -35, 5, -35],
      [5, -35, 5, -45],
      [-5, -45, 5, -45],
      [-5, -35, -5, -45],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 100,
    height: 255
  },
  {
    id: 'slinger-tagline',
    name: 'Slinger with Tagline',
    category: 'slinger',
    description: 'Holding tagline rope controlling load',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs - slight stance
      [-18, 80, -24, 170],
      [-8, 80, -14, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-28, 170, -12, 170],
      [10, 170, 26, 170],
      // Both arms holding rope
      [20, 35, 40, 50],
      [20, 40, 42, 52],
      [-20, 35, -10, 55],
      [-20, 40, -8, 57],
      // Tagline rope going up at angle
      [40, 50, 45, 55],
      [45, 55, 60, 20],
      [60, 20, 80, -40],
      // Rope texture lines
      [50, 35, 55, 30],
      [65, 10, 70, 5],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 110,
    height: 210
  },

  // ==================== RIGGERS ====================
  {
    id: 'rigger-kneeling',
    name: 'Rigger Kneeling',
    category: 'rigger',
    description: 'Kneeling position working on equipment',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & torso
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // LEFT LEG - kneeling (bent under)
      [-18, 80, -35, 100],
      [-8, 80, -25, 100],
      [-35, 100, -30, 130],
      [-25, 100, -20, 130],
      [-35, 130, -15, 130],
      // RIGHT LEG - knee on ground
      [18, 80, 40, 110],
      [8, 80, 30, 110],
      [40, 110, 50, 130],
      [30, 110, 40, 130],
      [35, 130, 55, 130],
      // Arms reaching forward working
      [-20, 35, -50, 70],
      [-20, 40, -48, 72],
      [20, 35, 45, 60],
      [20, 40, 47, 62],
      // Equipment on ground (shackle)
      [-60, 75, -45, 75],
      [-45, 75, -45, 90],
      [-45, 90, -60, 90],
      [-60, 90, -60, 75],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 120,
    height: 135
  },
  {
    id: 'rigger-climbing',
    name: 'Rigger on Ladder',
    category: 'rigger',
    description: 'Climbing ladder or structure',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // LEFT LEG - on ladder rung
      [-18, 80, -30, 120],
      [-8, 80, -20, 120],
      [-35, 120, -18, 120],
      // RIGHT LEG - lower rung
      [18, 80, 25, 150],
      [8, 80, 18, 150],
      [12, 150, 32, 150],
      // LEFT ARM - gripping high
      [-20, 30, -45, -10],
      [-20, 35, -43, -8],
      // RIGHT ARM - gripping mid
      [20, 35, 45, 25],
      [20, 40, 47, 28],
      // LADDER
      [-55, -30, -55, 170],
      [-40, -30, -40, 170],
      // Rungs
      [-55, -10, -40, -10],
      [-55, 25, -40, 25],
      [-55, 60, -40, 60],
      [-55, 95, -40, 95],
      [-55, 130, -40, 130],
      [-55, 165, -40, 165],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 100,
    height: 200
  },
  {
    id: 'rigger-inspecting',
    name: 'Rigger Inspecting Equipment',
    category: 'rigger',
    description: 'Inspecting shackle or rigging hardware',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // LEFT ARM holding shackle up
      [-20, 35, -35, 15],
      [-20, 40, -33, 18],
      // RIGHT ARM supporting
      [20, 35, 35, 20],
      [20, 40, 37, 23],
      // Shackle being inspected
      [-45, 5, -25, 5],
      [-25, 5, -25, 25],
      [-45, 25, -25, 25],
      [-45, 5, -45, 25],
      [-35, 5, -35, -5],
      [-38, -5, -32, -5],
      // Pin
      [-48, 15, -42, 15],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 90,
    height: 175
  },

  // ==================== OPERATORS ====================
  {
    id: 'operator-seated',
    name: 'Crane Operator Seated',
    category: 'operator',
    description: 'Seated at crane controls',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 65],
      [20, 30, 18, 65],
      [-18, 65, 18, 65],
      // Belt
      [-18, 60, 18, 60],
      // Legs forward (seated)
      [-18, 65, -10, 70],
      [-10, 70, 40, 70],
      [18, 65, 25, 70],
      [25, 70, 60, 70],
      // Lower legs down
      [40, 70, 45, 110],
      [60, 70, 65, 110],
      [50, 70, 55, 110],
      // Feet
      [40, 110, 70, 110],
      // LEFT ARM on joystick
      [-20, 35, -45, 55],
      [-20, 40, -43, 57],
      // Joystick
      [-50, 50, -50, 70],
      [-55, 70, -45, 70],
      // RIGHT ARM on lever
      [20, 35, 50, 50],
      [20, 40, 52, 52],
      // Lever
      [55, 45, 55, 70],
      // SEAT
      [-25, 65, 25, 65],
      [-25, 65, -30, 100],
      [25, 65, 25, 100],
      [-30, 100, 25, 100],
      // Seat back
      [-30, 30, -30, 65],
      [-30, 30, -25, 30],
      // Hi-vis
      [-18, 45, 18, 45],
      [-18, 50, 18, 50],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 100,
    height: 115
  },
  {
    id: 'operator-standing',
    name: 'Operator with Radio',
    category: 'operator',
    description: 'Standing operator using two-way radio',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // LEFT ARM at side
      [-20, 35, -25, 70],
      [-20, 40, -23, 72],
      // RIGHT ARM bent holding radio to ear
      [20, 35, 30, 25],
      [20, 40, 32, 28],
      [30, 25, 18, 12],
      [32, 28, 20, 15],
      // Radio handset
      [14, 8, 22, 8],
      [22, 8, 22, 22],
      [14, 22, 22, 22],
      [14, 8, 14, 22],
      // Antenna
      [18, 8, 18, -5],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 70,
    height: 175
  },

  // ==================== SUPERVISORS ====================
  {
    id: 'supervisor-clipboard',
    name: 'Supervisor with Clipboard',
    category: 'supervisor',
    description: 'Reviewing lift plan on clipboard',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // LEFT ARM supporting clipboard
      [-20, 35, -10, 55],
      [-20, 40, -8, 57],
      [-10, 55, 25, 45],
      // RIGHT ARM writing/pointing at clipboard
      [20, 35, 30, 45],
      [20, 40, 32, 47],
      // CLIPBOARD
      [25, 35, 55, 35],
      [55, 35, 55, 75],
      [55, 75, 25, 75],
      [25, 75, 25, 35],
      // Clipboard clip
      [35, 35, 45, 35],
      [35, 32, 45, 32],
      // Paper lines
      [30, 45, 50, 45],
      [30, 52, 50, 52],
      [30, 59, 50, 59],
      [30, 66, 45, 66],
      // Pen in hand
      [32, 47, 38, 55],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 90,
    height: 175
  },
  {
    id: 'supervisor-pointing',
    name: 'Supervisor Directing',
    category: 'supervisor',
    description: 'Pointing and directing operations',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs - confident stance
      [-18, 80, -25, 170],
      [-8, 80, -15, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-30, 170, -12, 170],
      [10, 170, 26, 170],
      // LEFT ARM on hip
      [-20, 35, -35, 55],
      [-20, 40, -33, 57],
      [-35, 55, -25, 70],
      [-33, 57, -23, 72],
      // RIGHT ARM pointing forward
      [20, 35, 70, 30],
      [20, 40, 70, 35],
      // Pointing hand
      [70, 28, 85, 30],
      [70, 37, 85, 35],
      [85, 30, 85, 35],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 115,
    height: 175
  },

  // ==================== GENERAL WORKERS ====================
  {
    id: 'worker-standing',
    name: 'Worker Standing',
    category: 'general',
    description: 'Standard standing worker with PPE',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // Arms at sides
      [-20, 35, -28, 70],
      [-20, 40, -26, 72],
      [20, 35, 28, 70],
      [20, 40, 26, 72],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 65,
    height: 175
  },
  {
    id: 'worker-walking',
    name: 'Worker Walking',
    category: 'general',
    description: 'Walking stride pose',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // LEFT LEG forward
      [-18, 80, -40, 170],
      [-8, 80, -30, 170],
      [-45, 170, -28, 170],
      // RIGHT LEG back
      [18, 80, 35, 165],
      [8, 80, 28, 165],
      [25, 165, 40, 165],
      // LEFT ARM back (opposite to leg)
      [-20, 35, -10, 70],
      [-20, 40, -8, 72],
      // RIGHT ARM forward
      [20, 35, 40, 55],
      [20, 40, 42, 57],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 90,
    height: 175
  },
  {
    id: 'worker-bending',
    name: 'Worker Bending',
    category: 'general',
    description: 'Bending forward at waist',
    lines: [
      // Hard hat (tilted forward)
      [-14, 0, 14, 0],
      // Neck going to bent torso
      [0, 22, 15, 35],
      // Torso bent horizontal
      [0, 35, 50, 45],
      [0, 40, 52, 50],
      [-5, 35, -3, 80],
      // Hips
      [50, 45, 52, 80],
      [50, 50, 50, 82],
      // Belt
      [-3, 75, 50, 78],
      // Legs straight
      [-3, 80, -8, 170],
      [7, 80, 2, 170],
      [50, 80, 55, 170],
      [52, 82, 60, 172],
      // Feet
      [-15, 170, 5, 170],
      [48, 172, 68, 172],
      // Arms hanging down
      [15, 38, 30, 100],
      [17, 42, 32, 102],
      [50, 48, 65, 95],
      [52, 52, 67, 97],
      // Hi-vis on back
      [5, 42, 45, 48],
      [8, 47, 47, 53],
    ],
    circles: [[8, 12, 12]],
    ellipses: [[8, 5, 16, 8]],
    width: 80,
    height: 175
  },
  {
    id: 'worker-crouching',
    name: 'Worker Crouching',
    category: 'general',
    description: 'Crouched low position',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body (shortened, crouched)
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -22, 60],
      [20, 30, 22, 60],
      [-22, 60, 22, 60],
      // Belt
      [-22, 55, 22, 55],
      // LEFT LEG bent under
      [-22, 60, -45, 85],
      [-12, 60, -35, 85],
      [-45, 85, -50, 110],
      [-35, 85, -40, 110],
      [-55, 110, -38, 110],
      // RIGHT LEG bent
      [22, 60, 45, 85],
      [12, 60, 35, 85],
      [45, 85, 55, 110],
      [35, 85, 48, 110],
      [48, 110, 62, 110],
      // Arms on knees
      [-20, 35, -40, 75],
      [-20, 40, -38, 77],
      [20, 35, 40, 75],
      [20, 40, 42, 77],
      // Hi-vis
      [-20, 42, 20, 42],
      [-20, 47, 20, 47],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 125,
    height: 115
  },
  {
    id: 'worker-carrying',
    name: 'Worker Carrying Box',
    category: 'general',
    description: 'Carrying box or equipment',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // Arms carrying box in front
      [-20, 35, -15, 50],
      [20, 35, 15, 50],
      [-20, 40, -13, 52],
      [20, 40, 13, 52],
      // Box being carried
      [-25, 40, 60, 40],
      [60, 40, 60, 80],
      [60, 80, -25, 80],
      [-25, 80, -25, 40],
      // Box detail lines
      [-25, 60, 60, 60],
      [20, 40, 20, 80],
      // Hi-vis
      [-18, 50, -15, 50],
      [-18, 55, -13, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 95,
    height: 175
  },
  {
    id: 'worker-looking-up',
    name: 'Worker Looking Up',
    category: 'general',
    description: 'Looking up at suspended load',
    lines: [
      // Hard hat tilted back
      [-14, 3, 14, 3],
      // Neck & body
      [0, 25, 0, 33],
      [-20, 33, 20, 33],
      [-20, 33, -18, 83],
      [20, 33, 18, 83],
      [-18, 83, 18, 83],
      [-18, 78, 18, 78],
      // Legs
      [-18, 83, -22, 173],
      [-8, 83, -12, 173],
      [18, 83, 22, 173],
      [8, 83, 12, 173],
      [-26, 173, -10, 173],
      [10, 173, 26, 173],
      // RIGHT ARM shading eyes
      [20, 38, 35, 20],
      [20, 43, 37, 23],
      [35, 20, 25, 12],
      [37, 23, 27, 15],
      // LEFT ARM at side
      [-20, 38, -28, 73],
      [-20, 43, -26, 75],
      // Sight line going up (dashed effect)
      [15, 0, 25, -30],
      [28, -35, 35, -55],
      // Hi-vis
      [-18, 53, 18, 53],
      [-18, 58, 18, 58],
    ],
    circles: [[0, 15, 12]], // Head tilted back
    ellipses: [[0, 8, 16, 8]],
    width: 75,
    height: 230
  },
  {
    id: 'worker-waving',
    name: 'Worker Waving',
    category: 'general',
    description: 'Arm raised signaling/waving',
    lines: [
      // Hard hat
      [-14, 0, 14, 0],
      // Neck & body
      [0, 22, 0, 30],
      [-20, 30, 20, 30],
      [-20, 30, -18, 80],
      [20, 30, 18, 80],
      [-18, 80, 18, 80],
      [-18, 75, 18, 75],
      // Legs
      [-18, 80, -22, 170],
      [-8, 80, -12, 170],
      [18, 80, 22, 170],
      [8, 80, 12, 170],
      [-26, 170, -10, 170],
      [10, 170, 26, 170],
      // LEFT ARM at side
      [-20, 35, -28, 70],
      [-20, 40, -26, 72],
      // RIGHT ARM raised waving
      [20, 30, 45, -15],
      [20, 35, 48, -12],
      // Hand waving
      [45, -15, 55, -25],
      [48, -12, 58, -22],
      [55, -25, 60, -20],
      [58, -22, 63, -17],
      // Motion lines
      [62, -30, 68, -25],
      [65, -20, 72, -18],
      // Hi-vis
      [-18, 50, 18, 50],
      [-18, 55, 18, 55],
    ],
    circles: [[0, 12, 12]],
    ellipses: [[0, 5, 16, 8]],
    width: 95,
    height: 200
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

