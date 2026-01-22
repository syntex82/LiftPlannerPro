"use client"

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { GeoCoordinates, GeoBounds } from '@/lib/google-maps-cad'

// Fix for default marker icons in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Tile providers (100% FREE)
const TILE_PROVIDERS = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics'
  }
}

interface LeafletMapComponentProps {
  center: GeoCoordinates
  zoom: number
  mapType: 'osm' | 'satellite'
  onBoundsChange: (bounds: GeoBounds, center: GeoCoordinates, zoom: number) => void
}

export default function LeafletMapComponent({
  center,
  zoom,
  mapType,
  onBoundsChange
}: LeafletMapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const initializedRef = useRef(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || initializedRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: true
    })

    mapRef.current = map
    initializedRef.current = true

    // Add initial tile layer
    const provider = TILE_PROVIDERS[mapType]
    tileLayerRef.current = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: 19
    }).addTo(map)

    // Add draggable marker
    const marker = L.marker([center.lat, center.lng], {
      icon: defaultIcon,
      draggable: true,
      title: 'Site Location'
    }).addTo(map)

    markerRef.current = marker

    // Update bounds when marker is dragged
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      map.panTo(pos)
      updateBounds(map)
    })

    // Update bounds when map changes
    map.on('moveend', () => updateBounds(map))
    map.on('zoomend', () => updateBounds(map))

    // Initial bounds update
    updateBounds(map)

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
      tileLayerRef.current = null
      initializedRef.current = false
    }
  }, [])

  // Update tile layer when mapType changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return

    const map = mapRef.current
    const provider = TILE_PROVIDERS[mapType]

    // Remove old tile layer and add new one
    map.removeLayer(tileLayerRef.current)
    tileLayerRef.current = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: 19
    }).addTo(map)
  }, [mapType])

  // Update map center when center prop changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return

    const map = mapRef.current
    const marker = markerRef.current

    map.setView([center.lat, center.lng], zoom)
    marker.setLatLng([center.lat, center.lng])
  }, [center.lat, center.lng, zoom])

  const updateBounds = (map: L.Map) => {
    const mapBounds = map.getBounds()
    const mapCenter = map.getCenter()
    const mapZoom = map.getZoom()

    const bounds: GeoBounds = {
      north: mapBounds.getNorth(),
      south: mapBounds.getSouth(),
      east: mapBounds.getEast(),
      west: mapBounds.getWest()
    }

    onBoundsChange(bounds, { lat: mapCenter.lat, lng: mapCenter.lng }, mapZoom)
  }

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[400px] rounded-lg border border-slate-200"
      style={{ zIndex: 0 }}
    />
  )
}

