/**
 * Professional CAD Tools for Realistic Crane Modeling
 * Includes: Wheels, Hooks, Wire Ropes, Hoist Drums, Boom Heads
 */

import * as THREE from 'three'

/**
 * Create a realistic wheel with tread pattern
 * @param diameter - Wheel diameter in meters
 * @param width - Wheel width in meters
 * @param treadDepth - Tread pattern depth (0-0.05m)
 * @param rimType - 'solid' | 'spoked' | 'disc'
 */
export function createRealisticWheel(
  diameter: number = 1.2,
  width: number = 0.4,
  treadDepth: number = 0.02,
  rimType: 'solid' | 'spoked' | 'disc' = 'solid'
): THREE.BufferGeometry {
  const geoms: THREE.BufferGeometry[] = []
  const radius = diameter / 2
  const rimRadius = radius - 0.05

  // Main tire (outer cylinder with tread pattern)
  const tireGeom = new THREE.CylinderGeometry(radius, radius, width, 64, 32)
  
  // Add tread pattern by modifying vertices
  const positions = tireGeom.attributes.position as THREE.BufferAttribute
  const posArray = positions.array as Float32Array
  for (let i = 0; i < posArray.length; i += 3) {
    const x = posArray[i]
    const y = posArray[i + 1]
    const z = posArray[i + 2]
    const dist = Math.sqrt(x * x + z * z)
    
    // Add tread pattern (sine wave)
    if (Math.abs(dist - radius) < 0.01) {
      const angle = Math.atan2(z, x)
      const treadPattern = Math.sin(angle * 12) * treadDepth
      const scale = (radius + treadPattern) / dist
      posArray[i] = x * scale
      posArray[i + 2] = z * scale
    }
  }
  positions.needsUpdate = true
  tireGeom.computeVertexNormals()
  geoms.push(tireGeom)

  // Rim
  if (rimType === 'solid') {
    const rimGeom = new THREE.CylinderGeometry(rimRadius, rimRadius, width * 0.8, 32, 8)
    rimGeom.translate(0, 0, 0)
    geoms.push(rimGeom)
  } else if (rimType === 'spoked') {
    // Hub
    const hubGeom = new THREE.CylinderGeometry(radius * 0.15, radius * 0.15, width * 0.6, 16, 4)
    geoms.push(hubGeom)
    
    // Spokes (6 spokes)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const spokeGeom = new THREE.BoxGeometry(0.02, width * 0.7, rimRadius * 1.8)
      const m = new THREE.Matrix4()
      m.makeRotationZ(angle)
      spokeGeom.applyMatrix4(m)
      geoms.push(spokeGeom)
    }
  }

  return mergeGeometries(geoms) || new THREE.CylinderGeometry(radius, radius, width, 32)
}

/**
 * Create a DIN-standard hook with proper geometry
 * @param capacity - Hook capacity in tons (25, 50, 100, 150, 200)
 * @param standard - 'DIN 15401' | 'DIN 15402'
 */
export function createDINHook(
  capacity: 25 | 50 | 100 | 150 | 200 = 100,
  standard: 'DIN 15401' | 'DIN 15402' = 'DIN 15401'
): THREE.BufferGeometry {
  const dims = getDINHookDimensions(capacity, standard)
  const geoms: THREE.BufferGeometry[] = []

  // Hook shank (vertical part)
  const shankGeom = new THREE.CylinderGeometry(
    dims.shank / 2000,
    dims.shank / 2000,
    dims.height / 1000,
    24,
    8
  )
  shankGeom.translate(0, dims.height / 2000, 0)
  geoms.push(shankGeom)

  // Hook curve (the actual hook part)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, dims.height / 1000, 0),
    new THREE.Vector3(dims.opening / 2000, dims.height / 1000 - dims.throat / 1000 * 0.3, 0),
    new THREE.Vector3(dims.opening / 2000, dims.height / 1000 - dims.throat / 1000 * 0.7, 0),
    new THREE.Vector3(dims.opening / 2000 - dims.thickness / 1000, dims.height / 1000 - dims.throat / 1000, 0),
  ])

  const tubeGeom = new THREE.TubeGeometry(curve, 20, dims.thickness / 2000, 8, false)
  geoms.push(tubeGeom)

  // Latch (if applicable)
  const latchGeom = new THREE.BoxGeometry(
    dims.thickness / 1000,
    dims.thickness / 1000 * 0.5,
    dims.opening / 1000 * 0.3
  )
  latchGeom.translate(dims.opening / 2000 - dims.thickness / 2000, dims.height / 1000 - dims.throat / 1000 * 0.5, 0)
  geoms.push(latchGeom)

  return mergeGeometries(geoms) || new THREE.BoxGeometry(0.1, 0.6, 0.1)
}

/**
 * Create wire rope with realistic geometry
 * @param length - Rope length in meters
 * @param diameter - Rope diameter in meters
 * @param segments - Number of segments
 * @param twistFactor - How much the rope twists (0-1)
 */
export function createWireRope(
  length: number = 5,
  diameter: number = 0.016,
  segments: number = 100,
  twistFactor: number = 0.3
): THREE.BufferGeometry {
  const curve = new THREE.LineCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -length, 0)
  )

  // Create twisted tube for rope
  const tubeGeom = new THREE.TubeGeometry(curve, segments, diameter / 2, 8, false)

  // Add twist by rotating vertices
  const positions = tubeGeom.attributes.position as THREE.BufferAttribute
  const posArray = positions.array as Float32Array
  
  for (let i = 0; i < posArray.length; i += 3) {
    const y = posArray[i + 1]
    const x = posArray[i]
    const z = posArray[i + 2]
    
    const t = (y + length) / length
    const angle = t * Math.PI * 2 * twistFactor
    
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    posArray[i] = x * cos - z * sin
    posArray[i + 2] = x * sin + z * cos
  }
  
  positions.needsUpdate = true
  tubeGeom.computeVertexNormals()
  
  return tubeGeom
}

/**
 * Create a hoist drum with rope wound on it
 * @param drumDiameter - Drum diameter in meters
 * @param drumWidth - Drum width in meters
 * @param ropeCount - Number of rope wraps
 * @param ropeDiameter - Rope diameter in meters
 */
export function createHoistDrum(
  drumDiameter: number = 0.8,
  drumWidth: number = 0.6,
  ropeCount: number = 4,
  ropeDiameter: number = 0.016
): THREE.BufferGeometry {
  const geoms: THREE.BufferGeometry[] = []
  const drumRadius = drumDiameter / 2

  // Main drum cylinder - smooth surface (NO FLANGES)
  const drumGeom = new THREE.CylinderGeometry(drumRadius, drumRadius, drumWidth, 64, 16)
  geoms.push(drumGeom)

  // Rope wraps - simple, clean spiral
  const ropeSpacing = drumWidth * 0.75 / ropeCount

  for (let wrap = 0; wrap < ropeCount; wrap++) {
    // Position along drum width
    const zOffset = -drumWidth * 0.375 + wrap * ropeSpacing

    // Create rope as a simple torus-like wrap around the drum
    const ropeRadius = drumRadius + ropeDiameter
    const segments = 64
    const points: THREE.Vector3[] = []

    // Create a circular path for the rope at this height
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      points.push(new THREE.Vector3(
        Math.cos(angle) * ropeRadius,
        0,
        Math.sin(angle) * ropeRadius
      ))
    }

    const curve = new THREE.CatmullRomCurve3(points)
    const ropeGeom = new THREE.TubeGeometry(curve, segments, ropeDiameter / 2, 8, false)
    ropeGeom.translate(0, zOffset, 0)
    geoms.push(ropeGeom)
  }

  return mergeGeometries(geoms) || new THREE.CylinderGeometry(drumRadius, drumRadius, drumWidth, 32)
}

/**
 * Create a boom head (connection point)
 * @param type - 'pin' | 'clevis' | 'trunnion'
 * @param pinDiameter - Pin diameter in meters
 */
export function createBoomHead(
  type: 'pin' | 'clevis' | 'trunnion' = 'pin',
  pinDiameter: number = 0.05
): THREE.BufferGeometry {
  const geoms: THREE.BufferGeometry[] = []

  if (type === 'pin') {
    // Simple pin connection
    const pinGeom = new THREE.CylinderGeometry(pinDiameter / 2, pinDiameter / 2, pinDiameter * 3, 16, 4)
    geoms.push(pinGeom)
    
    // Flanges
    const flangeGeom = new THREE.CylinderGeometry(pinDiameter * 1.5, pinDiameter * 1.5, 0.01, 16, 2)
    flangeGeom.translate(0, pinDiameter * 1.5, 0)
    geoms.push(flangeGeom)
  } else if (type === 'clevis') {
    // Clevis connection (fork-like)
    const armGeom = new THREE.BoxGeometry(pinDiameter * 0.5, pinDiameter * 4, pinDiameter * 0.5)
    armGeom.translate(pinDiameter * 1.5, 0, 0)
    geoms.push(armGeom)
    
    const arm2Geom = new THREE.BoxGeometry(pinDiameter * 0.5, pinDiameter * 4, pinDiameter * 0.5)
    arm2Geom.translate(-pinDiameter * 1.5, 0, 0)
    geoms.push(arm2Geom)
    
    // Pin hole
    const pinGeom = new THREE.CylinderGeometry(pinDiameter / 2, pinDiameter / 2, pinDiameter * 4, 16, 4)
    geoms.push(pinGeom)
  } else if (type === 'trunnion') {
    // Trunnion connection (rotating mount)
    const baseGeom = new THREE.BoxGeometry(pinDiameter * 3, pinDiameter * 2, pinDiameter * 3)
    geoms.push(baseGeom)
    
    const pinGeom = new THREE.CylinderGeometry(pinDiameter / 2, pinDiameter / 2, pinDiameter * 4, 16, 4)
    pinGeom.rotateZ(Math.PI / 2)
    geoms.push(pinGeom)
  }

  return mergeGeometries(geoms) || new THREE.BoxGeometry(0.1, 0.1, 0.1)
}

/**
 * Helper function to get DIN hook dimensions
 */
function getDINHookDimensions(
  capacity: 25 | 50 | 100 | 150 | 200,
  standard: 'DIN 15401' | 'DIN 15402'
): Record<string, number> {
  const table: Record<string, Record<number, Record<string, number>>> = {
    'DIN 15401': {
      25: { opening: 110, throat: 120, thickness: 45, shank: 60, height: 360 },
      50: { opening: 140, throat: 160, thickness: 60, shank: 80, height: 470 },
      100: { opening: 190, throat: 220, thickness: 80, shank: 110, height: 620 },
      150: { opening: 230, throat: 260, thickness: 95, shank: 130, height: 740 },
      200: { opening: 260, throat: 300, thickness: 110, shank: 150, height: 840 },
    },
    'DIN 15402': {
      25: { opening: 120, throat: 130, thickness: 48, shank: 65, height: 380 },
      50: { opening: 150, throat: 175, thickness: 64, shank: 85, height: 500 },
      100: { opening: 200, throat: 235, thickness: 86, shank: 115, height: 660 },
      150: { opening: 245, throat: 280, thickness: 100, shank: 135, height: 790 },
      200: { opening: 275, throat: 320, thickness: 115, shank: 160, height: 900 },
    },
  }
  return table[standard][capacity]
}

/**
 * Merge geometries helper
 */
function mergeGeometries(geoms: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (geoms.length === 0) return null
  if (geoms.length === 1) return geoms[0]
  
  // Simple merge by combining positions and indices
  const merged = new THREE.BufferGeometry()
  let vertexOffset = 0
  const positions: number[] = []
  const indices: number[] = []
  const normals: number[] = []

  geoms.forEach(geom => {
    const pos = geom.attributes.position?.array as Float32Array
    const idx = geom.index?.array as Uint32Array | Uint16Array
    const norm = geom.attributes.normal?.array as Float32Array

    if (pos) {
      positions.push(...Array.from(pos))
      if (norm) normals.push(...Array.from(norm))
      if (idx) {
        indices.push(...Array.from(idx).map(i => i + vertexOffset))
        vertexOffset += pos.length / 3
      }
    }
  })

  merged.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
  if (normals.length > 0) {
    merged.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
  }
  if (indices.length > 0) {
    merged.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
  }

  return merged
}

