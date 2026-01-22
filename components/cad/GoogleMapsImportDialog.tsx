"use client"

// Declare google maps namespace for TypeScript
declare global {
  interface Window {
    google?: typeof google
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace google {
    namespace maps {
      class Map {
        constructor(element: HTMLElement, options: MapOptions)
        panTo(latLng: LatLngLiteral): void
        setZoom(zoom: number): void
        getZoom(): number | undefined
        getCenter(): LatLng | undefined
        getBounds(): LatLngBounds | undefined
        addListener(event: string, handler: () => void): void
      }
      class Marker {
        constructor(options: MarkerOptions)
        setPosition(latLng: LatLngLiteral): void
        getPosition(): LatLng | undefined
        setMap(map: Map | null): void
        addListener(event: string, handler: () => void): void
      }
      class Geocoder {
        geocode(request: { address: string }): Promise<{ results: GeocoderResult[] }>
      }
      class ElevationService {
        getElevationForLocations(request: { locations: LatLngLiteral[] }): Promise<{ results: ElevationResult[] }>
      }
      class LatLng {
        lat(): number
        lng(): number
      }
      class LatLngBounds {
        getNorthEast(): LatLng
        getSouthWest(): LatLng
      }
      interface MapOptions {
        center: LatLngLiteral
        zoom: number
        mapTypeId?: string
        mapTypeControl?: boolean
        streetViewControl?: boolean
        fullscreenControl?: boolean
        zoomControl?: boolean
        styles?: unknown[]
      }
      interface MarkerOptions {
        position: LatLngLiteral
        map: Map
        draggable?: boolean
        title?: string
      }
      interface LatLngLiteral {
        lat: number
        lng: number
      }
      interface GeocoderResult {
        formatted_address: string
        geometry: {
          location: LatLng
        }
      }
      interface ElevationResult {
        elevation: number
        location: LatLng
        resolution: number
      }
      const MapTypeId: {
        HYBRID: string
        SATELLITE: string
        ROADMAP: string
        TERRAIN: string
      }
    }
  }
}

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
  ZoomIn, ZoomOut, Move, Crosshair, Download, Loader2, AlertCircle,
  Layers, Eye, EyeOff, Lock, Unlock, RefreshCw
} from "lucide-react"
import {
  GeoCoordinates, GeoBounds, MapLocationData, MapLayer,
  DEFAULT_MAP_LAYERS, calculateBoundsDimensions, generateStaticMapUrl
} from '@/lib/google-maps-cad'

interface GoogleMapsImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: MapLocationData, layers: MapLayer[]) => void
  googleMapsApiKey?: string
}

export default function GoogleMapsImportDialog({
  isOpen,
  onClose,
  onImport,
  googleMapsApiKey
}: GoogleMapsImportDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Map state
  const [center, setCenter] = useState<GeoCoordinates>({ lat: 51.5074, lng: -0.1278 }) // London default
  const [zoom, setZoom] = useState(18)
  const [bounds, setBounds] = useState<GeoBounds | null>(null)
  const [address, setAddress] = useState('')
  
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
  const [importScale, setImportScale] = useState(1) // 1 = 1 meter per pixel
  
  // Map preview reference
  const mapContainerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null) // google.maps.Map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null) // google.maps.Marker

  // Initialize Google Maps
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return
    if (!googleMapsApiKey) {
      setError('Google Maps API key is required. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment.')
      return
    }

    // Check if Google Maps script is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      initializeMap()
      return
    }

    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places,geometry,elevation`
    script.async = true
    script.defer = true
    script.onload = initializeMap
    script.onerror = () => setError('Failed to load Google Maps API')
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }
    }
  }, [isOpen, googleMapsApiKey])

  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || typeof google === 'undefined') return

    const map = new google.maps.Map(mapContainerRef.current, {
      center,
      zoom,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
      ]
    })

    mapRef.current = map

    // Add center marker
    const marker = new google.maps.Marker({
      position: center,
      map,
      draggable: true,
      title: 'Site Location'
    })
    markerRef.current = marker

    // Update center when marker is dragged
    marker.addListener('dragend', () => {
      const pos = marker.getPosition()
      if (pos) {
        const newCenter = { lat: pos.lat(), lng: pos.lng() }
        setCenter(newCenter)
        map.panTo(newCenter)
      }
    })

    // Update bounds when map changes
    map.addListener('bounds_changed', () => {
      const mapBounds = map.getBounds()
      if (mapBounds) {
        const ne = mapBounds.getNorthEast()
        const sw = mapBounds.getSouthWest()
        setBounds({
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng()
        })
      }
    })

    map.addListener('zoom_changed', () => {
      setZoom(map.getZoom() || 18)
    })

    map.addListener('center_changed', () => {
      const mapCenter = map.getCenter()
      if (mapCenter) {
        setCenter({ lat: mapCenter.lat(), lng: mapCenter.lng() })
      }
    })
  }, [center, zoom])

  // Search for address
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !mapRef.current) return
    setIsSearching(true)
    setError(null)

    try {
      const geocoder = new google.maps.Geocoder()
      const result = await geocoder.geocode({ address: searchQuery })

      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location
        const newCenter = { lat: location.lat(), lng: location.lng() }
        setCenter(newCenter)
        setAddress(result.results[0].formatted_address)
        mapRef.current.panTo(newCenter)
        mapRef.current.setZoom(18)
        if (markerRef.current) {
          markerRef.current.setPosition(newCenter)
        }
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
        if (mapRef.current) {
          mapRef.current.panTo(newCenter)
          mapRef.current.setZoom(18)
        }
        if (markerRef.current) {
          markerRef.current.setPosition(newCenter)
        }
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

      // Create map location data
      const locationData: MapLocationData = {
        center,
        bounds,
        zoom,
        address,
        formattedAddress: address,
        widthMeters: dimensions.width,
        heightMeters: dimensions.height
      }

      // Generate satellite image URL if enabled
      if (importSatellite && googleMapsApiKey) {
        locationData.satelliteImageUrl = generateStaticMapUrl(
          center,
          zoom,
          640, // Max size for Static Maps API
          640,
          googleMapsApiKey,
          'satellite'
        )

        // Fetch and convert to data URL for offline use
        try {
          const response = await fetch(locationData.satelliteImageUrl)
          const blob = await response.blob()
          const reader = new FileReader()
          locationData.satelliteImageDataUrl = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
        } catch (err) {
          console.warn('Failed to fetch satellite image:', err)
        }
      }

      // Fetch elevation data if enabled
      if (importTerrain && typeof google !== 'undefined') {
        try {
          const elevator = new google.maps.ElevationService()
          const gridSize = 10 // 10x10 grid of elevation points
          const latStep = (bounds.north - bounds.south) / (gridSize - 1)
          const lngStep = (bounds.east - bounds.west) / (gridSize - 1)

          const locations: google.maps.LatLngLiteral[] = []
          for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
              locations.push({
                lat: bounds.south + i * latStep,
                lng: bounds.west + j * lngStep
              })
            }
          }

          const elevationResult = await elevator.getElevationForLocations({ locations })
          if (elevationResult.results) {
            const elevationGrid: MapLocationData['elevationGrid'] = []
            let minElev = Infinity
            let maxElev = -Infinity

            for (let i = 0; i < gridSize; i++) {
              const row: typeof elevationGrid[0] = []
              for (let j = 0; j < gridSize; j++) {
                const idx = i * gridSize + j
                const result = elevationResult.results[idx]
                const elev = result.elevation
                minElev = Math.min(minElev, elev)
                maxElev = Math.max(maxElev, elev)
                row.push({
                  location: { lat: result.location.lat(), lng: result.location.lng() },
                  elevation: elev,
                  resolution: result.resolution
                })
              }
              elevationGrid.push(row)
            }

            locationData.elevationGrid = elevationGrid
            locationData.minElevation = minElev
            locationData.maxElevation = maxElev
          }
        } catch (err) {
          console.warn('Failed to fetch elevation data:', err)
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
            Import Location from Google Maps
          </DialogTitle>
          <DialogDescription>
            Search for a location and import satellite imagery, terrain data, and building footprints
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

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              className="w-full h-[400px] rounded-lg border border-slate-200 bg-slate-100"
            />

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
                  <Label>Satellite Imagery</Label>
                </div>
                <Switch checked={importSatellite} onCheckedChange={setImportSatellite} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-green-500" />
                  <Label>Terrain / Elevation Data</Label>
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
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: layer.color }}
                  />
                  {getLayerIcon(layer.type)}
                  <span className="text-sm font-medium">{layer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayerVisibility(layer.id)}
                    className="h-8 w-8 p-0"
                  >
                    {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayerLock(layer.id)}
                    className="h-8 w-8 p-0"
                  >
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

