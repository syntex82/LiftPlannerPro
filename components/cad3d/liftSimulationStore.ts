import { create } from 'zustand'

// Load object that can be attached to crane hook
export interface LoadObject {
  id: string
  name: string
  type: 'box' | 'cylinder' | 'sphere' | 'vessel' | 'column' | 'exchanger' | 'reactor' | 'drum' | 'compressor' | 'pump' | 'pipe-spool' | 'valve' | 'motor' | 'custom'
  // Dimensions (meters)
  width: number
  height: number
  depth: number
  radius?: number // for cylinder/sphere
  // Physical properties
  weight: number // kg
  color: string
  // Position when not attached (world coords)
  position: [number, number, number]
  rotation: [number, number, number]
  // Attachment state
  attachedToCraneId: string | null
  // Rigging offset from hook
  riggingOffset: [number, number, number]
  // Physics state for swinging
  swingAngleX: number // radians
  swingAngleZ: number // radians
  swingVelocityX: number
  swingVelocityZ: number
}

// Keyframe for animation recording
export interface CraneKeyframe {
  id: string
  time: number // seconds from start
  craneId: string
  // Crane state at this keyframe
  boomAngle: number
  boomExtend: number
  slew: number
  loadLine: number
  position: [number, number, number]
  // Easing for interpolation to next keyframe
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
}

export interface LiftSimulationState {
  // Load objects
  loadObjects: LoadObject[]
  selectedLoadId: string | null
  
  // Keyframe animation
  keyframes: CraneKeyframe[]
  currentTime: number // seconds
  duration: number // total animation duration
  isPlaying: boolean
  isPaused: boolean
  playbackSpeed: number // 1.0 = normal, 0.5 = half, 2.0 = double
  isRecording: boolean
  
  // Physics settings
  enablePhysics: boolean
  gravity: number // m/s^2
  damping: number // swing damping factor
  
  // Actions - Load Objects
  addLoadObject: (load: Omit<LoadObject, 'id'>) => string
  updateLoadObject: (id: string, updates: Partial<LoadObject>) => void
  removeLoadObject: (id: string) => void
  setSelectedLoadId: (id: string | null) => void
  attachLoadToCrane: (loadId: string, craneId: string) => void
  detachLoad: (loadId: string) => void
  
  // Actions - Keyframes
  addKeyframe: (keyframe: Omit<CraneKeyframe, 'id'>) => string
  updateKeyframe: (id: string, updates: Partial<CraneKeyframe>) => void
  removeKeyframe: (id: string) => void
  clearKeyframes: () => void
  
  // Actions - Playback
  play: () => void
  pause: () => void
  stop: () => void
  setCurrentTime: (time: number) => void
  setPlaybackSpeed: (speed: number) => void
  setIsRecording: (recording: boolean) => void
  
  // Actions - Physics
  setEnablePhysics: (enabled: boolean) => void
  updateSwingPhysics: (loadId: string, deltaTime: number, hookAcceleration: [number, number, number]) => void
  
  // Utility
  getInterpolatedCraneState: (craneId: string, time: number) => Partial<CraneKeyframe> | null
  exportKeyframes: () => string
  importKeyframes: (json: string) => boolean
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export const useLiftSimulationStore = create<LiftSimulationState>((set, get) => ({
  // Initial state
  loadObjects: [],
  selectedLoadId: null,
  keyframes: [],
  currentTime: 0,
  duration: 30, // 30 seconds default
  isPlaying: false,
  isPaused: false,
  playbackSpeed: 1.0,
  isRecording: false,
  enablePhysics: true,
  gravity: 9.81,
  damping: 0.95,

  // Load Object Actions
  addLoadObject: (load) => {
    const id = generateId()
    set(state => ({
      loadObjects: [...state.loadObjects, { ...load, id }]
    }))
    return id
  },

  updateLoadObject: (id, updates) => {
    set(state => ({
      loadObjects: state.loadObjects.map(l => 
        l.id === id ? { ...l, ...updates } : l
      )
    }))
  },

  removeLoadObject: (id) => {
    set(state => ({
      loadObjects: state.loadObjects.filter(l => l.id !== id),
      selectedLoadId: state.selectedLoadId === id ? null : state.selectedLoadId
    }))
  },

  setSelectedLoadId: (id) => set({ selectedLoadId: id }),

  attachLoadToCrane: (loadId, craneId) => {
    set(state => ({
      loadObjects: state.loadObjects.map(l =>
        l.id === loadId ? { ...l, attachedToCraneId: craneId, swingAngleX: 0, swingAngleZ: 0, swingVelocityX: 0, swingVelocityZ: 0 } : l
      )
    }))
  },

  detachLoad: (loadId) => {
    set(state => ({
      loadObjects: state.loadObjects.map(l =>
        l.id === loadId ? { ...l, attachedToCraneId: null } : l
      )
    }))
  },

  // Keyframe Actions
  addKeyframe: (keyframe) => {
    const id = generateId()
    set(state => {
      const newKeyframes = [...state.keyframes, { ...keyframe, id }]
      newKeyframes.sort((a, b) => a.time - b.time)
      const maxTime = Math.max(...newKeyframes.map(k => k.time), state.duration)
      return { keyframes: newKeyframes, duration: maxTime }
    })
    return id
  },

  updateKeyframe: (id, updates) => {
    set(state => {
      const newKeyframes = state.keyframes.map(k => k.id === id ? { ...k, ...updates } : k)
      newKeyframes.sort((a, b) => a.time - b.time)
      return { keyframes: newKeyframes }
    })
  },

  removeKeyframe: (id) => {
    set(state => ({
      keyframes: state.keyframes.filter(k => k.id !== id)
    }))
  },

  clearKeyframes: () => set({ keyframes: [], currentTime: 0 }),

  // Playback Actions
  play: () => set({ isPlaying: true, isPaused: false }),
  pause: () => set({ isPlaying: false, isPaused: true }),
  stop: () => set({ isPlaying: false, isPaused: false, currentTime: 0 }),
  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: Math.max(0.1, Math.min(4, speed)) }),
  setIsRecording: (recording) => set({ isRecording: recording }),

  // Physics Actions
  setEnablePhysics: (enabled) => set({ enablePhysics: enabled }),

  updateSwingPhysics: (loadId, deltaTime, hookAcceleration) => {
    const state = get()
    const load = state.loadObjects.find(l => l.id === loadId)
    if (!load || !load.attachedToCraneId || !state.enablePhysics) return

    // Simple pendulum physics
    const g = state.gravity
    const damping = state.damping

    // Calculate angular acceleration from hook movement
    const angularAccelX = -hookAcceleration[0] / g - Math.sin(load.swingAngleX)
    const angularAccelZ = -hookAcceleration[2] / g - Math.sin(load.swingAngleZ)

    // Update velocities
    let newVelX = (load.swingVelocityX + angularAccelX * deltaTime) * damping
    let newVelZ = (load.swingVelocityZ + angularAccelZ * deltaTime) * damping

    // Clamp velocities
    const maxVel = 2.0
    newVelX = Math.max(-maxVel, Math.min(maxVel, newVelX))
    newVelZ = Math.max(-maxVel, Math.min(maxVel, newVelZ))

    // Update angles
    const newAngleX = load.swingAngleX + newVelX * deltaTime
    const newAngleZ = load.swingAngleZ + newVelZ * deltaTime

    // Clamp angles to reasonable range
    const maxAngle = Math.PI / 6 // 30 degrees max swing

    set(state => ({
      loadObjects: state.loadObjects.map(l =>
        l.id === loadId ? {
          ...l,
          swingAngleX: Math.max(-maxAngle, Math.min(maxAngle, newAngleX)),
          swingAngleZ: Math.max(-maxAngle, Math.min(maxAngle, newAngleZ)),
          swingVelocityX: newVelX,
          swingVelocityZ: newVelZ
        } : l
      )
    }))
  },

  // Interpolation
  getInterpolatedCraneState: (craneId, time) => {
    const state = get()
    const craneKeyframes = state.keyframes.filter(k => k.craneId === craneId)
    if (craneKeyframes.length === 0) return null
    if (craneKeyframes.length === 1) return craneKeyframes[0]

    // Find surrounding keyframes
    let before: CraneKeyframe | null = null
    let after: CraneKeyframe | null = null

    for (const kf of craneKeyframes) {
      if (kf.time <= time) before = kf
      if (kf.time > time && !after) after = kf
    }

    if (!before) return craneKeyframes[0]
    if (!after) return before

    // Interpolate
    const t = (time - before.time) / (after.time - before.time)
    const easedT = easingFunctions[before.easing](t)

    return {
      craneId,
      time,
      boomAngle: before.boomAngle + (after.boomAngle - before.boomAngle) * easedT,
      boomExtend: before.boomExtend + (after.boomExtend - before.boomExtend) * easedT,
      slew: before.slew + (after.slew - before.slew) * easedT,
      loadLine: before.loadLine + (after.loadLine - before.loadLine) * easedT,
      position: [
        before.position[0] + (after.position[0] - before.position[0]) * easedT,
        before.position[1] + (after.position[1] - before.position[1]) * easedT,
        before.position[2] + (after.position[2] - before.position[2]) * easedT
      ] as [number, number, number],
      easing: before.easing
    }
  },

  // Export/Import
  exportKeyframes: () => {
    const state = get()
    return JSON.stringify({
      keyframes: state.keyframes,
      loadObjects: state.loadObjects,
      duration: state.duration
    }, null, 2)
  },

  importKeyframes: (json) => {
    try {
      const data = JSON.parse(json)
      if (data.keyframes && Array.isArray(data.keyframes)) {
        set({
          keyframes: data.keyframes,
          loadObjects: data.loadObjects || [],
          duration: data.duration || 30
        })
        return true
      }
      return false
    } catch {
      return false
    }
  }
}))

