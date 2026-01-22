"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin, Search, Satellite, Mountain, Building2, Milestone, Tag,
  Crosshair, Download, Loader2, AlertCircle,
  Layers, Eye, EyeOff, Lock, Unlock
} from "lucide-react"
import {
  GeoCoordinates, GeoBounds, MapLocationData, MapLayer,
  DEFAULT_MAP_LAYERS, calculateBoundsDimensions
} from '@/lib/google-maps-cad'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet components (they require window object)
const MapWithNoSSR = dynamic(() => import('./LeafletMapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-slate-100 rounded-lg flex items-center justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
  </div>
})

// Tile providers (100% FREE)
export const TILE_PROVIDERS = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics'
  }
}

interface LeafletMapImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: MapLocationData, layers: MapLayer[]) => void
}

export default function LeafletMapImportDialog({
  isOpen,
  onClose,
  onImport
}: LeafletMapImportDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Map state
  const [center, setCenter] = useState<GeoCoordinates>({ lat: 51.5074, lng: -0.1278 }) // London default
  const [zoom, setZoom] = useState(18)
  const [bounds, setBounds] = useState<GeoBounds | null>(null)
  const [address, setAddress] = useState('')
  const [mapType, setMapType] = useState<'osm' | 'satellite'>('satellite')
  
  // Layer toggles
  const [layers, setLayers] = useState<MapLayer[]>(
    DEFAULT_MAP_LAYERS.map((layer, index) => ({
      ...layer,
      id: `map-layer-${index}`
    }))
  )
  
  // Import options
  const [importSatellite, setImportSatellite] = useState(true)
  const [importTerrain, setImportTerrain] = useState(true)
  const [importBuildings, setImportBuildings] = useState(true)
  const [importScale, setImportScale] = useState(1)

  // Search for address using Nominatim (OpenStreetMap's free geocoder)
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { 'User-Agent': 'LiftPlannerPro/1.0' } }
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        const newCenter = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
        setCenter(newCenter)
        setAddress(result.display_name)
        setZoom(18)
      } else {
        setError('Location not found. Try a different search term.')
      }
    } catch (err) {
      setError('Failed to search location. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery])

  // Get current location
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setCenter(newCenter)
        setZoom(18)
        setIsLoading(false)
      },
      (err) => {
        setError('Failed to get current location: ' + err.message)
        setIsLoading(false)
      }
    )
  }, [])

  // Toggle layer visibility
  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ))
  }

  // Toggle layer lock
  const toggleLayerLock = (layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ))
  }

  // Handle map bounds change
  const handleBoundsChange = useCallback((newBounds: GeoBounds, newCenter: GeoCoordinates, newZoom: number) => {
    setBounds(newBounds)
    setCenter(newCenter)
    setZoom(newZoom)
  }, [])

  // Fetch elevation data from Open-Elevation API (FREE)
  const fetchElevationData = async (bounds: GeoBounds): Promise<{
    grid: MapLocationData['elevationGrid'],
    min: number,
    max: number
  } | null> => {
    try {
      const gridSize = 10
      const latStep = (bounds.north - bounds.south) / (gridSize - 1)
      const lngStep = (bounds.east - bounds.west) / (gridSize - 1)

      const locations: { latitude: number; longitude: number }[] = []
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          locations.push({
            latitude: bounds.south + i * latStep,
            longitude: bounds.west + j * lngStep
          })
        }
      }

      const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations })
      })

      if (!response.ok) throw new Error('Elevation API failed')

      const data = await response.json()
      const results = data.results

      const grid: MapLocationData['elevationGrid'] = []
      let minElev = Infinity
      let maxElev = -Infinity

      for (let i = 0; i < gridSize; i++) {
        const row: typeof grid[0] = []
        for (let j = 0; j < gridSize; j++) {
          const idx = i * gridSize + j
          const result = results[idx]
          const elev = result.elevation
          minElev = Math.min(minElev, elev)
          maxElev = Math.max(maxElev, elev)
          row.push({
            location: { lat: result.latitude, lng: result.longitude },
            elevation: elev,
            resolution: 30 // SRTM resolution
          })
        }
        grid.push(row)
      }

      return { grid, min: minElev, max: maxElev }
    } catch (err) {
      console.warn('Failed to fetch elevation data:', err)
      return null
    }
  }

  // Handle import
  const handleImport = async () => {
    if (!bounds) {
      setError('Please select a location on the map first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const dimensions = calculateBoundsDimensions(bounds)

      const locationData: MapLocationData = {
        center,
        bounds,
        zoom,
        address,
        formattedAddress: address,
        widthMeters: dimensions.width,
        heightMeters: dimensions.height
      }

      // Generate satellite image URL from Esri (FREE)
      if (importSatellite) {
        // Use static tile URL for the center point
        const tileZ = zoom
        const tileX = Math.floor((center.lng + 180) / 360 * Math.pow(2, tileZ))
        const latRad = center.lat * Math.PI / 180
        const tileY = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, tileZ))

        locationData.satelliteImageUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${tileZ}/${tileY}/${tileX}`
      }

      // Fetch elevation data if enabled
      if (importTerrain) {
        const elevationResult = await fetchElevationData(bounds)
        if (elevationResult) {
          locationData.elevationGrid = elevationResult.grid
          locationData.minElevation = elevationResult.min
          locationData.maxElevation = elevationResult.max
        }
      }

      // Filter layers based on import options
      const importLayers = layers.filter(layer => {
        if (layer.type === 'satellite' && !importSatellite) return false
        if (layer.type === 'terrain' && !importTerrain) return false
        if (layer.type === 'buildings' && !importBuildings) return false
        return true
      })

      onImport(locationData, importLayers)
      onClose()
    } catch (err) {
      setError('Failed to import location data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getLayerIcon = (type: MapLayer['type']) => {
    switch (type) {
      case 'satellite': return <Satellite className="w-4 h-4" />
      case 'terrain': return <Mountain className="w-4 h-4" />
      case 'buildings': return <Building2 className="w-4 h-4" />
      case 'roads': return <Milestone className="w-4 h-4" />
      case 'labels': return <Tag className="w-4 h-4" />
      default: return <Layers className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Import Location from OpenStreetMap
          </DialogTitle>
          <DialogDescription>
            Search for a location and import satellite imagery and terrain data (100% FREE - No API key required)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for an address or location..."
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </Button>
              <Button variant="outline" onClick={handleGetCurrentLocation} disabled={isLoading}>
                <Crosshair className="w-4 h-4" />
              </Button>
            </div>

            {/* Map Type Toggle */}
            <div className="flex gap-2">
              <Button
                variant={mapType === 'satellite' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapType('satellite')}
              >
                <Satellite className="w-4 h-4 mr-1" /> Satellite
              </Button>
              <Button
                variant={mapType === 'osm' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapType('osm')}
              >
                <Layers className="w-4 h-4 mr-1" /> Street Map
              </Button>
            </div>

            {/* Map Container - Using dynamic import */}
            {isOpen && (
              <MapWithNoSSR
                center={center}
                zoom={zoom}
                mapType={mapType}
                onBoundsChange={handleBoundsChange}
              />
            )}

            {/* Location Info */}
            {address && (
              <Card className="p-3 bg-slate-50">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{address}</p>
                    <p className="text-xs text-slate-500">
                      {center.lat.toFixed(6)}, {center.lng.toFixed(6)} | Zoom: {zoom}
                    </p>
                    {bounds && (
                      <p className="text-xs text-slate-500">
                        Area: {calculateBoundsDimensions(bounds).width.toFixed(0)}m × {calculateBoundsDimensions(bounds).height.toFixed(0)}m
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="p-4 space-y-4">
              <h4 className="font-medium">Import Options</h4>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-blue-500" />
                  <Label>Satellite Imagery (Esri - FREE)</Label>
                </div>
                <Switch checked={importSatellite} onCheckedChange={setImportSatellite} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-green-500" />
                  <Label>Terrain / Elevation Data (Open-Elevation - FREE)</Label>
                </div>
                <Switch checked={importTerrain} onCheckedChange={setImportTerrain} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  <Label>Building Footprints</Label>
                </div>
                <Switch checked={importBuildings} onCheckedChange={setImportBuildings} />
              </div>
            </Card>

            <Card className="p-4 space-y-4">
              <h4 className="font-medium">Scale Settings</h4>
              <div className="space-y-2">
                <Label>Import Scale: 1:{importScale}</Label>
                <Slider
                  value={[importScale]}
                  onValueChange={([v]) => setImportScale(v)}
                  min={1}
                  max={100}
                  step={1}
                />
                <p className="text-xs text-slate-500">
                  1:1 = Real-world scale (1 pixel = 1 meter in CAD)
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Layers Tab */}
          <TabsContent value="layers" className="space-y-2">
            {layers.map(layer => (
              <Card key={layer.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: layer.color }} />
                  {getLayerIcon(layer.type)}
                  <span className="text-sm font-medium">{layer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleLayerVisibility(layer.id)} className="h-8 w-8 p-0">
                    {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleLayerLock(layer.id)} className="h-8 w-8 p-0">
                    {layer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-slate-400" />}
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <Card className="p-3 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleImport} disabled={isLoading || !bounds}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Import Location
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

