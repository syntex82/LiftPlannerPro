"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home, MapPin, Truck, Package, Route, AlertTriangle, CheckCircle,
  Download, Save, Search, Navigation, Plus, Trash2, RefreshCw,
  FileText, Phone, Mail, Clock, Ruler
} from "lucide-react"
import {
  LoadSpecifications,
  VehicleSpecifications,
  RouteOption,
  RoutePlan,
  EmergencyContact,
  DEFAULT_EMERGENCY_CONTACTS,
  HAZARD_CONFIG,
  SEVERITY_COLORS
} from '@/lib/route-planner-types'
import { GeoCoordinates } from '@/lib/google-maps-cad'
import {
  geocodeAddress,
  reverseGeocode,
  calculateRoutes,
  analyzeRoutes
} from '@/lib/route-planner-service'
import { downloadRoutePlanPDF } from '@/lib/route-plan-pdf'

// Dynamically import the map component (no SSR)
const RouteMapComponent = dynamic(
  () => import('@/components/route-planner/RouteMapComponent'),
  { ssr: false, loading: () => <div className="w-full h-[500px] bg-slate-800 animate-pulse rounded-lg" /> }
)

export default function RoutePlannerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Location state
  const [startAddress, setStartAddress] = useState('')
  const [endAddress, setEndAddress] = useState('')
  const [startCoords, setStartCoords] = useState<GeoCoordinates | null>(null)
  const [endCoords, setEndCoords] = useState<GeoCoordinates | null>(null)
  const [waypoints, setWaypoints] = useState<{ coords: GeoCoordinates; address: string }[]>([])

  // Specifications state
  const [loadSpecs, setLoadSpecs] = useState<LoadSpecifications>({
    height: 3.0,
    width: 3.0,
    length: 12.0,
    weight: 40
  })
  const [vehicleSpecs, setVehicleSpecs] = useState<VehicleSpecifications>({
    totalHeight: 4.5,
    axleWeight: 10,
    numberOfAxles: 4,
    turningRadius: 12,
    vehicleLength: 18
  })

  // Route state
  const [routes, setRoutes] = useState<RouteOption[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Emergency contacts
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    DEFAULT_EMERGENCY_CONTACTS
  )

  // Active tab
  const [activeTab, setActiveTab] = useState('specifications')

  // Get selected route
  const selectedRoute = routes.find(r => r.id === selectedRouteId)

  // Handle address search
  const handleSearchStart = async () => {
    if (!startAddress.trim()) return
    const result = await geocodeAddress(startAddress)
    if (result) {
      setStartCoords(result.coordinates)
      setStartAddress(result.displayName)
    } else {
      setError('Could not find start address')
    }
  }

  const handleSearchEnd = async () => {
    if (!endAddress.trim()) return
    const result = await geocodeAddress(endAddress)
    if (result) {
      setEndCoords(result.coordinates)
      setEndAddress(result.displayName)
    } else {
      setError('Could not find destination address')
    }
  }

  // Handle map clicks for setting locations
  const handleMapClick = useCallback(async (coords: GeoCoordinates, type: 'start' | 'end' | 'waypoint') => {
    const address = await reverseGeocode(coords)
    if (type === 'start') {
      setStartCoords(coords)
      setStartAddress(address)
    } else if (type === 'end') {
      setEndCoords(coords)
      setEndAddress(address)
    } else {
      setWaypoints(prev => [...prev, { coords, address }])
    }
  }, [])

  // Calculate routes
  const handleCalculateRoutes = async () => {
    if (!startCoords || !endCoords) {
      setError('Please set both start and end locations')
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      const waypointCoords = waypoints.map(w => w.coords)
      const rawRoutes = await calculateRoutes(startCoords, endCoords, waypointCoords)
      const analyzedRoutes = await analyzeRoutes(rawRoutes, loadSpecs, vehicleSpecs)
      setRoutes(analyzedRoutes)
      if (analyzedRoutes.length > 0) {
        setSelectedRouteId(analyzedRoutes[0].id)
      }
      setActiveTab('routes')
    } catch (err) {
      setError('Failed to calculate routes. Please try again.')
      console.error(err)
    } finally {
      setIsCalculating(false)
    }
  }

  // Generate PDF
  const handleGeneratePDF = async () => {
    if (!selectedRoute || !startCoords || !endCoords) return

    setIsGeneratingPDF(true)
    try {
      await downloadRoutePlanPDF({
        route: selectedRoute,
        startLocation: { coordinates: startCoords, address: startAddress },
        endLocation: { coordinates: endCoords, address: endAddress },
        waypoints: waypoints.map(w => ({ coordinates: w.coords, address: w.address })),
        loadSpecs,
        vehicleSpecs,
        emergencyContacts
      })
    } catch (err) {
      setError('Failed to generate PDF. Please try again.')
      console.error(err)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
    return `${Math.round(meters)} m`
  }

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins} min`
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Route className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Route Planner</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Plan
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Panel - Controls */}
        <div className="w-[400px] bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-slate-900">
              <TabsTrigger value="specifications">Specs</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="p-4 space-y-4">
              {/* Location Inputs */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-white flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-green-400" />
                    Start Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex space-x-2">
                    <Input
                      value={startAddress}
                      onChange={(e) => setStartAddress(e.target.value)}
                      placeholder="Enter start address..."
                      className="bg-slate-600 border-slate-500 text-white"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchStart()}
                    />
                    <Button size="sm" onClick={handleSearchStart}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  {startCoords && (
                    <p className="text-xs text-green-400 mt-1">
                      ✓ {startCoords.lat.toFixed(4)}, {startCoords.lng.toFixed(4)}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-white flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-red-400" />
                    Destination
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex space-x-2">
                    <Input
                      value={endAddress}
                      onChange={(e) => setEndAddress(e.target.value)}
                      placeholder="Enter destination address..."
                      className="bg-slate-600 border-slate-500 text-white"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchEnd()}
                    />
                    <Button size="sm" onClick={handleSearchEnd}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  {endCoords && (
                    <p className="text-xs text-green-400 mt-1">
                      ✓ {endCoords.lat.toFixed(4)}, {endCoords.lng.toFixed(4)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Load Specifications */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-white flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-400" />
                    Load Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-300">Height (m)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={loadSpecs.height}
                        onChange={(e) => setLoadSpecs(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Width (m)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={loadSpecs.width}
                        onChange={(e) => setLoadSpecs(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Length (m)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={loadSpecs.length}
                        onChange={(e) => setLoadSpecs(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Weight (tonnes)</Label>
                      <Input
                        type="number"
                        step="1"
                        value={loadSpecs.weight}
                        onChange={(e) => setLoadSpecs(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Specifications */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-white flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-orange-400" />
                    Vehicle Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-300">Total Height (m)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={vehicleSpecs.totalHeight}
                        onChange={(e) => setVehicleSpecs(prev => ({ ...prev, totalHeight: parseFloat(e.target.value) || 0 }))}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Axle Weight (t)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={vehicleSpecs.axleWeight}
                        onChange={(e) => setVehicleSpecs(prev => ({ ...prev, axleWeight: parseFloat(e.target.value) || 0 }))}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Number of Axles</Label>
                      <Input
                        type="number"
                        value={vehicleSpecs.numberOfAxles}
                        onChange={(e) => setVehicleSpecs(prev => ({ ...prev, numberOfAxles: parseInt(e.target.value) || 0 }))}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Turning Radius (m)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={vehicleSpecs.turningRadius}
                        onChange={(e) => setVehicleSpecs(prev => ({ ...prev, turningRadius: parseFloat(e.target.value) || 0 }))}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Calculate Button */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleCalculateRoutes}
                disabled={!startCoords || !endCoords || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Route className="w-4 h-4 mr-2" />
                    Calculate Routes
                  </>
                )}
              </Button>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
            </TabsContent>

            {/* Routes Tab */}
            <TabsContent value="routes" className="p-4 space-y-4">
              {routes.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <Route className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No routes calculated yet</p>
                  <p className="text-sm">Set locations and calculate routes</p>
                </div>
              ) : (
                routes.map((route, index) => (
                  <Card
                    key={route.id}
                    className={`cursor-pointer transition-all ${
                      selectedRouteId === route.id
                        ? 'bg-blue-900 border-blue-500'
                        : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => setSelectedRouteId(route.id)}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{route.name}</span>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: SEVERITY_COLORS[route.overallSeverity] }}
                        >
                          {route.overallSeverity.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-slate-300">
                        <div className="flex items-center">
                          <Ruler className="w-3 h-3 mr-1" />
                          {formatDistance(route.distance)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(route.duration)}
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {route.hazards.length} hazards
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${route.safetyScore}%`,
                              backgroundColor: SEVERITY_COLORS[route.overallSeverity]
                            }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Safety Score: {route.safetyScore}/100
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {/* Hazard List for Selected Route */}
              {selectedRoute && selectedRoute.hazards.length > 0 && (
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm text-white flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
                      Route Hazards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedRoute.hazards.map((hazard) => (
                      <div
                        key={hazard.id}
                        className="flex items-start space-x-2 p-2 bg-slate-800 rounded"
                      >
                        <span className="text-lg">{HAZARD_CONFIG[hazard.type].icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {hazard.name || HAZARD_CONFIG[hazard.type].label}
                          </p>
                          <p className="text-xs text-slate-400">{hazard.description}</p>
                          {hazard.clearance && (
                            <p className="text-xs mt-1" style={{ color: SEVERITY_COLORS[hazard.severity] }}>
                              Clearance: {hazard.clearance}m | Your height: {vehicleSpecs.totalHeight}m
                              {hazard.severity === 'unsafe' && ' ⚠️ NOT SAFE'}
                            </p>
                          )}
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{ backgroundColor: SEVERITY_COLORS[hazard.severity], color: '#fff' }}
                        >
                          {hazard.severity}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="p-4 space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-white flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-green-400" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="space-y-2 p-2 bg-slate-800 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{contact.role}</span>
                        {index > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-400"
                            onClick={() => setEmergencyContacts(prev => prev.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Name"
                        value={contact.name}
                        onChange={(e) => {
                          const updated = [...emergencyContacts]
                          updated[index] = { ...updated[index], name: e.target.value }
                          setEmergencyContacts(updated)
                        }}
                        className="bg-slate-600 border-slate-500 text-white text-sm h-8"
                      />
                      <Input
                        placeholder="Phone"
                        value={contact.phone}
                        onChange={(e) => {
                          const updated = [...emergencyContacts]
                          updated[index] = { ...updated[index], phone: e.target.value }
                          setEmergencyContacts(updated)
                        }}
                        className="bg-slate-600 border-slate-500 text-white text-sm h-8"
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setEmergencyContacts(prev => [...prev, { name: '', role: 'Contact', phone: '', email: '' }])}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </CardContent>
              </Card>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!selectedRoute || isGeneratingPDF}
                onClick={handleGeneratePDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Route Plan PDF
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 relative">
          <RouteMapComponent
            startCoords={startCoords}
            endCoords={endCoords}
            waypoints={waypoints.map(w => w.coords)}
            routes={routes}
            selectedRouteId={selectedRouteId}
            onMapClick={handleMapClick}
          />

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400 mb-2 font-medium">Click map to set:</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center text-green-400">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                Start (1st click)
              </div>
              <div className="flex items-center text-red-400">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                End (2nd click)
              </div>
              <div className="flex items-center text-blue-400">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                Waypoint (subsequent)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
