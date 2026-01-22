// Route Planner Types for Heavy/Oversized Load Transportation

import { GeoCoordinates } from './google-maps-cad'

// Load specifications
export interface LoadSpecifications {
  height: number // meters
  width: number // meters
  length: number // meters
  weight: number // tonnes
}

// Vehicle specifications
export interface VehicleSpecifications {
  totalHeight: number // meters (when loaded)
  axleWeight: number // tonnes per axle
  numberOfAxles: number
  turningRadius: number // meters
  vehicleLength: number // meters
}

// Route hazard types
export type HazardType = 
  | 'low_bridge'
  | 'weight_restriction'
  | 'width_restriction'
  | 'height_restriction'
  | 'sharp_turn'
  | 'overhead_lines'
  | 'narrow_road'
  | 'level_crossing'
  | 'tunnel'

// Hazard severity
export type HazardSeverity = 'safe' | 'caution' | 'unsafe'

// Route hazard
export interface RouteHazard {
  id: string
  type: HazardType
  location: GeoCoordinates
  name?: string
  description: string
  clearance?: number // meters (for bridges, tunnels)
  weightLimit?: number // tonnes (for weight restrictions)
  widthLimit?: number // meters (for width restrictions)
  severity: HazardSeverity
  osmId?: string // OpenStreetMap ID for reference
  recommendedSpeed?: number // km/h
}

// Turn-by-turn direction step
export interface DirectionStep {
  instruction: string
  distance: number // meters
  duration: number // seconds
  coordinates: GeoCoordinates
  hazards: RouteHazard[]
  roadName?: string
  turnType?: 'left' | 'right' | 'straight' | 'u-turn' | 'slight-left' | 'slight-right'
}

// Route option with full analysis
export interface RouteOption {
  id: string
  name: string
  geometry: GeoCoordinates[] // Route polyline
  distance: number // meters
  duration: number // seconds
  hazards: RouteHazard[]
  steps: DirectionStep[]
  overallSeverity: HazardSeverity
  safetyScore: number // 0-100
  summary: string
}

// Route plan (saved with project)
export interface RoutePlan {
  id: string
  projectId?: string
  name: string
  createdAt: Date
  updatedAt: Date
  startLocation: {
    coordinates: GeoCoordinates
    address: string
  }
  endLocation: {
    coordinates: GeoCoordinates
    address: string
  }
  waypoints: {
    coordinates: GeoCoordinates
    address: string
  }[]
  loadSpecs: LoadSpecifications
  vehicleSpecs: VehicleSpecifications
  selectedRoute?: RouteOption
  alternativeRoutes: RouteOption[]
  notes?: string
  emergencyContacts: EmergencyContact[]
}

// Emergency contact for route plan
export interface EmergencyContact {
  name: string
  role: string
  phone: string
  email?: string
}

// Hazard display configuration
export const HAZARD_CONFIG: Record<HazardType, { label: string; icon: string; color: string }> = {
  low_bridge: { label: 'Low Bridge', icon: '🌉', color: '#ef4444' },
  weight_restriction: { label: 'Weight Restriction', icon: '⚖️', color: '#f97316' },
  width_restriction: { label: 'Width Restriction', icon: '↔️', color: '#f59e0b' },
  height_restriction: { label: 'Height Restriction', icon: '📏', color: '#ef4444' },
  sharp_turn: { label: 'Sharp Turn', icon: '↩️', color: '#eab308' },
  overhead_lines: { label: 'Overhead Lines', icon: '⚡', color: '#a855f7' },
  narrow_road: { label: 'Narrow Road', icon: '🛣️', color: '#f59e0b' },
  level_crossing: { label: 'Level Crossing', icon: '🚂', color: '#3b82f6' },
  tunnel: { label: 'Tunnel', icon: '🚇', color: '#6366f1' }
}

// Severity colors
export const SEVERITY_COLORS: Record<HazardSeverity, string> = {
  safe: '#22c55e',
  caution: '#f59e0b',
  unsafe: '#ef4444'
}

// Default emergency contacts template
export const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: '', role: 'Transport Manager', phone: '', email: '' },
  { name: '', role: 'Site Contact', phone: '', email: '' },
  { name: 'Emergency Services', role: 'Emergency', phone: '999', email: '' }
]

// Calculate hazard severity based on load/vehicle specs
export function calculateHazardSeverity(
  hazard: Partial<RouteHazard>,
  loadSpecs: LoadSpecifications,
  vehicleSpecs: VehicleSpecifications
): HazardSeverity {
  const totalHeight = vehicleSpecs.totalHeight
  const totalWidth = loadSpecs.width
  const totalWeight = loadSpecs.weight

  if (hazard.clearance !== undefined) {
    const margin = hazard.clearance - totalHeight
    if (margin < 0) return 'unsafe'
    if (margin < 0.3) return 'caution' // Less than 30cm clearance
    return 'safe'
  }

  if (hazard.weightLimit !== undefined) {
    if (totalWeight > hazard.weightLimit) return 'unsafe'
    if (totalWeight > hazard.weightLimit * 0.9) return 'caution'
    return 'safe'
  }

  if (hazard.widthLimit !== undefined) {
    const margin = hazard.widthLimit - totalWidth
    if (margin < 0) return 'unsafe'
    if (margin < 0.5) return 'caution'
    return 'safe'
  }

  // Default for other hazard types
  return 'caution'
}

