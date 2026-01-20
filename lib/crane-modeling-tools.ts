/**
 * Comprehensive Crane Modeling Tools
 * Tools for creating professional crane models in 3D CAD
 */

export interface CraneComponent {
  id: string
  type: 'boom' | 'jib' | 'trolley' | 'hoist' | 'counterweight' | 'outrigger' | 'hook' | 'sling' | 'load' | 'cab' | 'chassis'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color?: string
  material?: 'steel' | 'aluminum' | 'composite'
  // Boom specific
  boomLength?: number
  boomAngle?: number
  boomSections?: number
  telescopic?: boolean
  // Jib specific
  jibLength?: number
  jibAngle?: number
  // Trolley specific
  trolleyTravel?: number
  trolleyPosition?: number
  // Hoist specific
  hoistCapacity?: number
  hoistSpeed?: number
  ropeCount?: number
  // Counterweight specific
  counterweightMass?: number
  // Outrigger specific
  outriggerExtension?: number
  outriggerCount?: number
  // Hook specific
  hookSize?: number
  sheaveCount?: number
  // Load specific
  loadMass?: number
  loadDimensions?: [number, number, number]
}

export const createBoom = (
  length: number = 30,
  angle: number = 45,
  sections: number = 1,
  telescopic: boolean = false,
  position: [number, number, number] = [0, 5, 0]
): CraneComponent => ({
  id: `boom-${Date.now()}`,
  type: 'boom',
  position,
  rotation: [0, 0, (angle * Math.PI) / 180],
  scale: [1, 1, 1],
  color: '#FFD700',
  material: 'steel',
  boomLength: length,
  boomAngle: angle,
  boomSections: sections,
  telescopic,
})

export const createJib = (
  length: number = 10,
  angle: number = 0,
  position: [number, number, number] = [0, 0, 0]
): CraneComponent => ({
  id: `jib-${Date.now()}`,
  type: 'jib',
  position,
  rotation: [0, (angle * Math.PI) / 180, 0],
  scale: [1, 1, 1],
  color: '#FFD700',
  material: 'steel',
  jibLength: length,
  jibAngle: angle,
})

export const createTrolley = (
  capacity: number = 50,
  position: [number, number, number] = [0, 0, 0]
): CraneComponent => ({
  id: `trolley-${Date.now()}`,
  type: 'trolley',
  position,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#2E8B57',
  material: 'steel',
  hoistCapacity: capacity,
})

export const createHoist = (
  capacity: number = 50,
  speed: number = 1.5,
  ropeCount: number = 4,
  position: [number, number, number] = [0, 0, 0]
): CraneComponent => ({
  id: `hoist-${Date.now()}`,
  type: 'hoist',
  position,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#2E8B57',
  material: 'steel',
  hoistCapacity: capacity,
  hoistSpeed: speed,
  ropeCount,
})

export const createCounterweight = (
  mass: number = 100,
  position: [number, number, number] = [0, 5, 0]
): CraneComponent => ({
  id: `counterweight-${Date.now()}`,
  type: 'counterweight',
  position,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#696969',
  material: 'steel',
  counterweightMass: mass,
})

export const createOutrigger = (
  extension: number = 5,
  count: number = 4,
  position: [number, number, number] = [0, 0, 0]
): CraneComponent => ({
  id: `outrigger-${Date.now()}`,
  type: 'outrigger',
  position,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#2E8B57',
  material: 'steel',
  outriggerExtension: extension,
  outriggerCount: count,
})

export const createHook = (
  size: number = 1,
  sheaveCount: number = 4,
  position: [number, number, number] = [0, 0, 0]
): CraneComponent => ({
  id: `hook-${Date.now()}`,
  type: 'hook',
  position,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#696969',
  material: 'steel',
  hookSize: size,
  sheaveCount,
})

export const createSling = (
  ropeCount: number = 4,
  position: [number, number, number] = [0, 0, 0]
): CraneComponent => ({
  id: `sling-${Date.now()}`,
  type: 'sling',
  position,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#FFD700',
  material: 'steel',
  ropeCount,
})

export const createLoad = (
  mass: number = 50,
  dimensions: [number, number, number] = [2, 2, 2],
  position: [number, number, number] = [0, 0, 0]
): CraneComponent => ({
  id: `load-${Date.now()}`,
  type: 'load',
  position,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#FF6347',
  material: 'steel',
  loadMass: mass,
  loadDimensions: dimensions,
})

export const createCab = (
  position: [number, number, number] = [0, 5, 0]
): CraneComponent => ({
  id: `cab-${Date.now()}`,
  type: 'cab',
  position,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#2E8B57',
  material: 'aluminum',
})

export const createChassis = (
  length: number = 15,
  width: number = 3,
  position: [number, number, number] = [0, 0, 0]
): CraneComponent => ({
  id: `chassis-${Date.now()}`,
  type: 'chassis',
  position,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#2E8B57',
  material: 'steel',
})

// Helper function to calculate boom tip position
export const calculateBoomTipPosition = (
  basePosition: [number, number, number],
  boomLength: number,
  boomAngle: number,
  boomRotation: number = 0
): [number, number, number] => {
  const angleRad = (boomAngle * Math.PI) / 180
  const rotRad = (boomRotation * Math.PI) / 180
  
  const x = basePosition[0] + boomLength * Math.cos(angleRad) * Math.cos(rotRad)
  const y = basePosition[1] + boomLength * Math.sin(angleRad)
  const z = basePosition[2] + boomLength * Math.cos(angleRad) * Math.sin(rotRad)
  
  return [x, y, z]
}

// Helper function to calculate load capacity based on radius
export const calculateLoadCapacity = (
  maxCapacity: number,
  radius: number,
  maxRadius: number
): number => {
  // Linear interpolation for load capacity
  return Math.max(0, maxCapacity * (1 - (radius / maxRadius) * 0.8))
}

// Helper function to validate crane configuration
export const validateCraneConfig = (components: CraneComponent[]): string[] => {
  const errors: string[] = []
  
  const hasBoom = components.some(c => c.type === 'boom')
  const hasHook = components.some(c => c.type === 'hook')
  const hasHoist = components.some(c => c.type === 'hoist')
  
  if (!hasBoom) errors.push('Crane must have a boom')
  if (!hasHook) errors.push('Crane must have a hook')
  if (!hasHoist) errors.push('Crane must have a hoist')
  
  return errors
}

