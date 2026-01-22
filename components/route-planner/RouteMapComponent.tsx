"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { GeoCoordinates } from '@/lib/google-maps-cad'
import { RouteOption, HAZARD_CONFIG, SEVERITY_COLORS } from '@/lib/route-planner-types'

// Custom marker icons
const createIcon = (color: string, size: number = 25) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [size, size],
  iconAnchor: [size/2, size/2]
})

const startIcon = createIcon('#22c55e', 30)
const endIcon = createIcon('#ef4444', 30)
const waypointIcon = createIcon('#3b82f6', 20)
const hazardIcon = (color: string) => createIcon(color, 16)

interface RouteMapComponentProps {
  startCoords: GeoCoordinates | null
  endCoords: GeoCoordinates | null
  waypoints: GeoCoordinates[]
  routes: RouteOption[]
  selectedRouteId: string | null
  onMapClick: (coords: GeoCoordinates, type: 'start' | 'end' | 'waypoint') => void
}

export default function RouteMapComponent({
  startCoords,
  endCoords,
  waypoints,
  routes,
  selectedRouteId,
  onMapClick
}: RouteMapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const routeLinesRef = useRef<L.Polyline[]>([])
  const hazardMarkersRef = useRef<L.Marker[]>([])
  const [clickMode, setClickMode] = useState<'start' | 'end' | 'waypoint'>('start')

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [54.5, -3], // UK center
      zoom: 6,
      zoomControl: true
    })

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Handle map clicks
    map.on('click', (e: L.LeafletMouseEvent) => {
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng }
      onMapClick(coords, clickMode)
      
      // Auto-progress click mode
      if (clickMode === 'start') setClickMode('end')
      else if (clickMode === 'end') setClickMode('waypoint')
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update click mode based on existing points
  useEffect(() => {
    if (!startCoords) setClickMode('start')
    else if (!endCoords) setClickMode('end')
    else setClickMode('waypoint')
  }, [startCoords, endCoords])

  // Update markers when coords change
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Add start marker
    if (startCoords) {
      const marker = L.marker([startCoords.lat, startCoords.lng], { icon: startIcon })
        .addTo(map)
        .bindPopup('Start Location')
      markersRef.current.push(marker)
    }

    // Add end marker
    if (endCoords) {
      const marker = L.marker([endCoords.lat, endCoords.lng], { icon: endIcon })
        .addTo(map)
        .bindPopup('Destination')
      markersRef.current.push(marker)
    }

    // Add waypoint markers
    waypoints.forEach((wp, i) => {
      const marker = L.marker([wp.lat, wp.lng], { icon: waypointIcon })
        .addTo(map)
        .bindPopup(`Waypoint ${i + 1}`)
      markersRef.current.push(marker)
    })

    // Fit bounds to markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.2))
    }
  }, [startCoords, endCoords, waypoints])

  // Update route lines
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    // Clear existing route lines
    routeLinesRef.current.forEach(l => l.remove())
    routeLinesRef.current = []

    // Draw routes
    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId
      const color = isSelected ? SEVERITY_COLORS[route.overallSeverity] : '#6b7280'
      const weight = isSelected ? 6 : 3
      const opacity = isSelected ? 0.9 : 0.5

      const line = L.polyline(
        route.geometry.map(p => [p.lat, p.lng]),
        { color, weight, opacity }
      ).addTo(map)

      if (isSelected) {
        line.bringToFront()
      }

      routeLinesRef.current.push(line)
    })
  }, [routes, selectedRouteId])

  // Update hazard markers for selected route
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    // Clear existing hazard markers
    hazardMarkersRef.current.forEach(m => m.remove())
    hazardMarkersRef.current = []

    // Add hazard markers for selected route
    const selectedRoute = routes.find(r => r.id === selectedRouteId)
    if (selectedRoute) {
      selectedRoute.hazards.forEach(hazard => {
        const config = HAZARD_CONFIG[hazard.type]
        const marker = L.marker([hazard.location.lat, hazard.location.lng], {
          icon: hazardIcon(SEVERITY_COLORS[hazard.severity])
        })
          .addTo(map)
          .bindPopup(`
            <strong>${config.icon} ${hazard.name || config.label}</strong><br/>
            ${hazard.description}<br/>
            <span style="color: ${SEVERITY_COLORS[hazard.severity]}">
              ${hazard.severity.toUpperCase()}
            </span>
          `)
        hazardMarkersRef.current.push(marker)
      })
    }
  }, [routes, selectedRouteId])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 0 }} />
      
      {/* Click Mode Indicator */}
      <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-700">
        <p className="text-xs text-slate-400">Click to set:</p>
        <p className="text-sm font-medium" style={{ color: 
          clickMode === 'start' ? '#22c55e' : 
          clickMode === 'end' ? '#ef4444' : '#3b82f6' 
        }}>
          {clickMode === 'start' ? '📍 Start Location' : 
           clickMode === 'end' ? '🏁 Destination' : '📌 Waypoint'}
        </p>
      </div>
    </div>
  )
}

