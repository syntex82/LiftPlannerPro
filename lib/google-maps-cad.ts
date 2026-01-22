// Google Maps CAD Integration Types and Utilities

export interface GeoCoordinates {
  lat: number
  lng: number
}

export interface GeoBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface ElevationPoint {
  location: GeoCoordinates
  elevation: number // meters above sea level
  resolution: number // meters
}

export interface MapLocationData {
  center: GeoCoordinates
  bounds: GeoBounds
  zoom: number
  address?: string
  formattedAddress?: string
  // Real-world dimensions in meters
  widthMeters: number
  heightMeters: number
  // Elevation data for terrain
  elevationGrid?: ElevationPoint[][]
  minElevation?: number
  maxElevation?: number
  // Building footprints from Places API
  buildings?: BuildingFootprint[]
  // Satellite imagery URL (Static Maps API)
  satelliteImageUrl?: string
  satelliteImageDataUrl?: string // Base64 data URL for offline use
}

export interface BuildingFootprint {
  id: string
  name?: string
  coordinates: GeoCoordinates[]
  height?: number // estimated height in meters
  type?: 'residential' | 'commercial' | 'industrial' | 'other'
}

export interface MapLayer {
  id: string
  name: string
  type: 'satellite' | 'terrain' | 'buildings' | 'roads' | 'labels'
  visible: boolean
  locked: boolean
  opacity: number
  color: string
  data?: any // Layer-specific data
}

// Calculate the real-world distance between two geo coordinates using Haversine formula
export function calculateGeoDistance(point1: GeoCoordinates, point2: GeoCoordinates): number {
  const R = 6371000 // Earth's radius in meters
  const lat1Rad = (point1.lat * Math.PI) / 180
  const lat2Rad = (point2.lat * Math.PI) / 180
  const deltaLat = ((point2.lat - point1.lat) * Math.PI) / 180
  const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Calculate bounds dimensions in meters
export function calculateBoundsDimensions(bounds: GeoBounds): { width: number; height: number } {
  const width = calculateGeoDistance(
    { lat: bounds.south, lng: bounds.west },
    { lat: bounds.south, lng: bounds.east }
  )
  const height = calculateGeoDistance(
    { lat: bounds.south, lng: bounds.west },
    { lat: bounds.north, lng: bounds.west }
  )
  return { width, height }
}

// Convert geo coordinates to CAD coordinates (meters from origin)
export function geoToCADCoordinates(
  point: GeoCoordinates,
  origin: GeoCoordinates,
  scale: number = 1
): { x: number; y: number } {
  // Calculate east-west distance (x)
  const x = calculateGeoDistance(
    { lat: point.lat, lng: origin.lng },
    { lat: point.lat, lng: point.lng }
  ) * (point.lng > origin.lng ? 1 : -1)

  // Calculate north-south distance (y)
  const y = calculateGeoDistance(
    { lat: origin.lat, lng: point.lng },
    { lat: point.lat, lng: point.lng }
  ) * (point.lat > origin.lat ? 1 : -1)

  return { x: x * scale, y: y * scale }
}

// Convert CAD coordinates back to geo coordinates
export function cadToGeoCoordinates(
  point: { x: number; y: number },
  origin: GeoCoordinates,
  scale: number = 1
): GeoCoordinates {
  const xMeters = point.x / scale
  const yMeters = point.y / scale

  // Approximate conversion (works well for small areas)
  const metersPerDegreeLat = 111320
  const metersPerDegreeLng = 111320 * Math.cos((origin.lat * Math.PI) / 180)

  return {
    lat: origin.lat + yMeters / metersPerDegreeLat,
    lng: origin.lng + xMeters / metersPerDegreeLng
  }
}

// Generate Static Maps API URL for satellite imagery
export function generateStaticMapUrl(
  center: GeoCoordinates,
  zoom: number,
  width: number,
  height: number,
  apiKey: string,
  mapType: 'satellite' | 'hybrid' | 'roadmap' | 'terrain' = 'satellite'
): string {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=${width}x${height}&maptype=${mapType}&key=${apiKey}`
}

// Default map layers for CAD integration
export const DEFAULT_MAP_LAYERS: Omit<MapLayer, 'id'>[] = [
  { name: 'Satellite Imagery', type: 'satellite', visible: true, locked: true, opacity: 0.8, color: '#4a5568' },
  { name: 'Terrain', type: 'terrain', visible: false, locked: false, opacity: 0.6, color: '#48bb78' },
  { name: 'Buildings', type: 'buildings', visible: true, locked: false, opacity: 0.7, color: '#ed8936' },
  { name: 'Roads', type: 'roads', visible: true, locked: false, opacity: 0.5, color: '#a0aec0' },
  { name: 'Labels', type: 'labels', visible: false, locked: false, opacity: 1, color: '#2d3748' }
]

// Generate terrain mesh data from elevation grid
export interface TerrainMeshData {
  vertices: [number, number, number][]
  faces: [number, number, number][]
  uvs: [number, number][]
  minElevation: number
  maxElevation: number
}

export function generateTerrainMesh(
  elevationGrid: ElevationPoint[][],
  widthMeters: number,
  heightMeters: number,
  elevationScale: number = 1
): TerrainMeshData {
  const gridRows = elevationGrid.length
  const gridCols = elevationGrid[0]?.length || 0

  if (gridRows < 2 || gridCols < 2) {
    throw new Error('Elevation grid must be at least 2x2')
  }

  const vertices: [number, number, number][] = []
  const faces: [number, number, number][] = []
  const uvs: [number, number][] = []

  let minElev = Infinity
  let maxElev = -Infinity

  // Generate vertices and UVs
  for (let z = 0; z < gridRows; z++) {
    for (let x = 0; x < gridCols; x++) {
      const elevation = elevationGrid[z][x].elevation * elevationScale
      minElev = Math.min(minElev, elevation)
      maxElev = Math.max(maxElev, elevation)

      // Position: x centered, y is elevation, z centered
      const posX = (x / (gridCols - 1) - 0.5) * widthMeters
      const posY = elevation
      const posZ = (z / (gridRows - 1) - 0.5) * heightMeters

      vertices.push([posX, posY, posZ])
      uvs.push([x / (gridCols - 1), z / (gridRows - 1)])
    }
  }

  // Generate faces (triangles)
  for (let z = 0; z < gridRows - 1; z++) {
    for (let x = 0; x < gridCols - 1; x++) {
      const topLeft = z * gridCols + x
      const topRight = topLeft + 1
      const bottomLeft = (z + 1) * gridCols + x
      const bottomRight = bottomLeft + 1

      // Two triangles per grid cell
      faces.push([topLeft, bottomLeft, topRight])
      faces.push([topRight, bottomLeft, bottomRight])
    }
  }

  return {
    vertices,
    faces,
    uvs,
    minElevation: minElev,
    maxElevation: maxElev
  }
}

// Get color for elevation (gradient from green valleys to brown/white peaks)
export function getElevationColor(elevation: number, minElev: number, maxElev: number): string {
  const range = maxElev - minElev
  if (range === 0) return '#48bb78' // Flat terrain

  const normalized = (elevation - minElev) / range

  // Green -> Brown -> White gradient
  if (normalized < 0.5) {
    // Green to brown
    const t = normalized * 2
    const r = Math.round(72 + (139 - 72) * t)
    const g = Math.round(187 + (90 - 187) * t)
    const b = Math.round(120 + (43 - 120) * t)
    return `rgb(${r}, ${g}, ${b})`
  } else {
    // Brown to white
    const t = (normalized - 0.5) * 2
    const r = Math.round(139 + (255 - 139) * t)
    const g = Math.round(90 + (255 - 90) * t)
    const b = Math.round(43 + (255 - 43) * t)
    return `rgb(${r}, ${g}, ${b})`
  }
}

