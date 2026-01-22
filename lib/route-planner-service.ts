// Route Planner Service - Route calculation and hazard detection

import { GeoCoordinates } from './google-maps-cad'
import {
  RouteOption,
  RouteHazard,
  DirectionStep,
  LoadSpecifications,
  VehicleSpecifications,
  HazardType,
  calculateHazardSeverity
} from './route-planner-types'

// OpenRouteService API (free tier: 2000 requests/day)
const ORS_API_URL = 'https://api.openrouteservice.org/v2'

// Nominatim for geocoding (free, no key needed)
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'

// Overpass API for hazard data (free, no key needed)
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// Geocode an address to coordinates
export async function geocodeAddress(address: string): Promise<{ coordinates: GeoCoordinates; displayName: string } | null> {
  try {
    const response = await fetch(
      `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'User-Agent': 'LiftPlannerPro/1.0' } }
    )
    const results = await response.json()
    
    if (results.length > 0) {
      return {
        coordinates: { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) },
        displayName: results[0].display_name
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Reverse geocode coordinates to address
export async function reverseGeocode(coords: GeoCoordinates): Promise<string> {
  try {
    const response = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`,
      { headers: { 'User-Agent': 'LiftPlannerPro/1.0' } }
    )
    const result = await response.json()
    return result.display_name || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
  } catch {
    return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
  }
}

// Calculate routes using OpenRouteService (or fallback to OSRM)
export async function calculateRoutes(
  start: GeoCoordinates,
  end: GeoCoordinates,
  waypoints: GeoCoordinates[] = [],
  apiKey?: string
): Promise<RouteOption[]> {
  // Try OpenRouteService first if API key provided
  if (apiKey) {
    try {
      return await calculateRoutesORS(start, end, waypoints, apiKey)
    } catch (error) {
      console.warn('ORS failed, falling back to OSRM:', error)
    }
  }
  
  // Fallback to OSRM (free, no key needed)
  return await calculateRoutesOSRM(start, end, waypoints)
}

// Calculate routes using OSRM (free, no API key)
async function calculateRoutesOSRM(
  start: GeoCoordinates,
  end: GeoCoordinates,
  waypoints: GeoCoordinates[]
): Promise<RouteOption[]> {
  const allPoints = [start, ...waypoints, end]
  const coordsString = allPoints.map(p => `${p.lng},${p.lat}`).join(';')
  
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson&steps=true&alternatives=true`
  
  const response = await fetch(url)
  const data = await response.json()
  
  if (data.code !== 'Ok' || !data.routes) {
    throw new Error('Failed to calculate route')
  }
  
  return data.routes.map((route: any, index: number): RouteOption => {
    const geometry: GeoCoordinates[] = route.geometry.coordinates.map(
      (coord: [number, number]) => ({ lat: coord[1], lng: coord[0] })
    )
    
    const steps: DirectionStep[] = route.legs.flatMap((leg: any) =>
      leg.steps.map((step: any): DirectionStep => ({
        instruction: step.maneuver?.instruction || step.name || 'Continue',
        distance: step.distance,
        duration: step.duration,
        coordinates: { lat: step.maneuver.location[1], lng: step.maneuver.location[0] },
        hazards: [],
        roadName: step.name,
        turnType: mapOSRMTurnType(step.maneuver?.type, step.maneuver?.modifier)
      }))
    )
    
    return {
      id: `route-${index}-${Date.now()}`,
      name: index === 0 ? 'Recommended Route' : `Alternative ${index}`,
      geometry,
      distance: route.distance,
      duration: route.duration,
      hazards: [],
      steps,
      overallSeverity: 'safe',
      safetyScore: 100,
      summary: route.legs.map((l: any) => l.summary).join(' → ')
    }
  })
}

function mapOSRMTurnType(type?: string, modifier?: string): DirectionStep['turnType'] {
  if (type === 'turn') {
    if (modifier?.includes('left')) return 'left'
    if (modifier?.includes('right')) return 'right'
    if (modifier?.includes('straight')) return 'straight'
  }
  if (type === 'uturn') return 'u-turn'
  return 'straight'
}

// Calculate routes using OpenRouteService
async function calculateRoutesORS(
  start: GeoCoordinates,
  end: GeoCoordinates,
  waypoints: GeoCoordinates[],
  apiKey: string
): Promise<RouteOption[]> {
  const coordinates = [
    [start.lng, start.lat],
    ...waypoints.map(w => [w.lng, w.lat]),
    [end.lng, end.lat]
  ]
  
  const response = await fetch(`${ORS_API_URL}/directions/driving-hgv/geojson`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    },
    body: JSON.stringify({
      coordinates,
      alternative_routes: { target_count: 3 },
      instructions: true,
      geometry: true
    })
  })
  
  if (!response.ok) throw new Error('ORS API error')
  const data = await response.json()
  // Parse ORS response (similar structure to above)
  return [] // Simplified - full implementation would parse ORS response
}

// Query Overpass API for hazards along a route
export async function fetchRouteHazards(
  routeGeometry: GeoCoordinates[],
  loadSpecs: LoadSpecifications,
  vehicleSpecs: VehicleSpecifications
): Promise<RouteHazard[]> {
  // Create bounding box from route
  const lats = routeGeometry.map(p => p.lat)
  const lngs = routeGeometry.map(p => p.lng)
  const bbox = {
    south: Math.min(...lats) - 0.01,
    north: Math.max(...lats) + 0.01,
    west: Math.min(...lngs) - 0.01,
    east: Math.max(...lngs) + 0.01
  }

  // Overpass query for bridges, tunnels, and restrictions
  const query = `
    [out:json][timeout:25];
    (
      // Bridges with height restrictions
      way["bridge"="yes"]["maxheight"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["man_made"="bridge"]["maxheight"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      // Tunnels
      way["tunnel"="yes"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      // Weight restrictions
      way["maxweight"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["hgv:conditional"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      // Width restrictions
      way["maxwidth"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      // Level crossings
      node["railway"="level_crossing"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      // Power lines
      way["power"="line"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
    );
    out center;
  `

  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`
    })
    const data = await response.json()

    const hazards: RouteHazard[] = []

    for (const element of data.elements || []) {
      const hazard = parseOSMElement(element, loadSpecs, vehicleSpecs)
      if (hazard) {
        // Only include hazards near the route
        const nearRoute = isNearRoute(hazard.location, routeGeometry, 100) // 100m buffer
        if (nearRoute) {
          hazards.push(hazard)
        }
      }
    }

    return hazards
  } catch (error) {
    console.error('Overpass API error:', error)
    return []
  }
}

// Parse OSM element into hazard
function parseOSMElement(
  element: any,
  loadSpecs: LoadSpecifications,
  vehicleSpecs: VehicleSpecifications
): RouteHazard | null {
  const tags = element.tags || {}
  const location: GeoCoordinates = element.center
    ? { lat: element.center.lat, lng: element.center.lon }
    : { lat: element.lat, lng: element.lon }

  let hazard: Partial<RouteHazard> = {
    id: `osm-${element.id}`,
    location,
    osmId: element.id.toString()
  }

  // Height restriction (bridges, tunnels)
  if (tags.maxheight) {
    const height = parseFloat(tags.maxheight)
    hazard = {
      ...hazard,
      type: tags.tunnel === 'yes' ? 'tunnel' : 'low_bridge',
      name: tags.name || (tags.tunnel === 'yes' ? 'Tunnel' : 'Bridge'),
      clearance: height,
      description: `Height restriction: ${height}m`
    }
  }
  // Weight restriction
  else if (tags.maxweight) {
    const weight = parseFloat(tags.maxweight)
    hazard = {
      ...hazard,
      type: 'weight_restriction',
      name: tags.name || 'Weight Restricted Road',
      weightLimit: weight,
      description: `Weight limit: ${weight}t`
    }
  }
  // Width restriction
  else if (tags.maxwidth) {
    const width = parseFloat(tags.maxwidth)
    hazard = {
      ...hazard,
      type: 'width_restriction',
      name: tags.name || 'Width Restriction',
      widthLimit: width,
      description: `Width limit: ${width}m`
    }
  }
  // Level crossing
  else if (tags.railway === 'level_crossing') {
    hazard = {
      ...hazard,
      type: 'level_crossing',
      name: 'Railway Level Crossing',
      description: 'Slow down - railway crossing ahead'
    }
  }
  // Power lines
  else if (tags.power === 'line') {
    hazard = {
      ...hazard,
      type: 'overhead_lines',
      name: 'Overhead Power Lines',
      description: 'Caution: overhead power lines'
    }
  }
  else {
    return null
  }

  hazard.severity = calculateHazardSeverity(hazard, loadSpecs, vehicleSpecs)
  return hazard as RouteHazard
}

// Check if a point is near the route
function isNearRoute(point: GeoCoordinates, route: GeoCoordinates[], bufferMeters: number): boolean {
  for (const routePoint of route) {
    const distance = haversineDistance(point, routePoint)
    if (distance <= bufferMeters) return true
  }
  return false
}

// Haversine distance in meters
function haversineDistance(p1: GeoCoordinates, p2: GeoCoordinates): number {
  const R = 6371000
  const lat1 = p1.lat * Math.PI / 180
  const lat2 = p2.lat * Math.PI / 180
  const dLat = (p2.lat - p1.lat) * Math.PI / 180
  const dLng = (p2.lng - p1.lng) * Math.PI / 180

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Analyze routes and add hazard information
export async function analyzeRoutes(
  routes: RouteOption[],
  loadSpecs: LoadSpecifications,
  vehicleSpecs: VehicleSpecifications
): Promise<RouteOption[]> {
  const analyzedRoutes: RouteOption[] = []

  for (const route of routes) {
    const hazards = await fetchRouteHazards(route.geometry, loadSpecs, vehicleSpecs)

    // Calculate overall severity and safety score
    const unsafeCount = hazards.filter(h => h.severity === 'unsafe').length
    const cautionCount = hazards.filter(h => h.severity === 'caution').length

    let overallSeverity: RouteOption['overallSeverity'] = 'safe'
    if (unsafeCount > 0) overallSeverity = 'unsafe'
    else if (cautionCount > 0) overallSeverity = 'caution'

    // Safety score: 100 - (unsafe * 20) - (caution * 5)
    const safetyScore = Math.max(0, 100 - (unsafeCount * 20) - (cautionCount * 5))

    // Assign hazards to steps
    const stepsWithHazards = route.steps.map(step => ({
      ...step,
      hazards: hazards.filter(h => haversineDistance(h.location, step.coordinates) < 500)
    }))

    analyzedRoutes.push({
      ...route,
      hazards,
      steps: stepsWithHazards,
      overallSeverity,
      safetyScore
    })
  }

  // Sort by safety score (highest first)
  return analyzedRoutes.sort((a, b) => b.safetyScore - a.safetyScore)
}

