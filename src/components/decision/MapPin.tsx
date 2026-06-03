'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl'
import { MAPBOX_CONFIG, SIGNAL_COLORS } from '@/lib/constants'
import type { SignalType } from '@/lib/types'

interface ExistingArea {
  name: string
  lat: number
  lng: number
  signalType: string
}

interface MapPinProps {
  onPinDrop: (lat: number, lng: number) => void
  existingAreas?: ExistingArea[]
  centerOn?: { lat: number; lng: number } | null
}

function toSignalType(value: string): SignalType {
  if (value === 'good' || value === 'warn' || value === 'danger') return value
  return 'warn'
}

export default function MapPin({ onPinDrop, existingAreas = [], centerOn = null }: MapPinProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const userMarkerRef = useRef<MapboxMarker | null>(null)
  const areaMarkerRef = useRef<MapboxMarker | null>(null)
  const areaMarkersRef = useRef<MapboxMarker[]>([])
  const onPinDropRef = useRef(onPinDrop)
  const [loading, setLoading] = useState(true)
  const [pinSet, setPinSet] = useState(false)

  onPinDropRef.current = onPinDrop

  useEffect(() => {
    let cancelled = false

    async function initMap() {
      if (!mapContainerRef.current) return

      const mapboxgl = (await import('mapbox-gl')).default
      await import('mapbox-gl/dist/mapbox-gl.css')

      if (cancelled || !mapContainerRef.current) return

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: MAPBOX_CONFIG.center,
        zoom: MAPBOX_CONFIG.zoom,
        style: MAPBOX_CONFIG.style,
      })

      mapRef.current = map

      map.on('load', () => {
        if (!cancelled) setLoading(false)
      })

      map.on('click', (e) => {
        userMarkerRef.current?.remove()

        userMarkerRef.current = new mapboxgl.Marker({ color: '#1D9E75' })
          .setLngLat(e.lngLat)
          .addTo(map)

        setPinSet(true)
        onPinDropRef.current(e.lngLat.lat, e.lngLat.lng)
      })
    }

    initMap()

    return () => {
      cancelled = true
      userMarkerRef.current?.remove()
      areaMarkerRef.current?.remove()
      areaMarkersRef.current.forEach((marker) => marker.remove())
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (loading) return

    async function centerMap() {
      const map = mapRef.current
      if (!map) return

      if (!centerOn) {
        areaMarkerRef.current?.remove()
        areaMarkerRef.current = null
        return
      }

      const mapboxgl = (await import('mapbox-gl')).default

      map.flyTo({
        center: [centerOn.lng, centerOn.lat],
        zoom: 13,
        duration: 1200,
      })

      areaMarkerRef.current?.remove()
      const el = document.createElement('div')
      el.style.cssText = `
        width: 14px; height: 14px; border-radius: 50%;
        background: #185FA5; border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `
      areaMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([centerOn.lng, centerOn.lat])
        .addTo(map)
    }

    centerMap()
  }, [centerOn, loading])

  useEffect(() => {
    if (loading || !mapRef.current) return

    async function renderAreaMarkers() {
      const map = mapRef.current
      if (!map) return

      const mapboxgl = (await import('mapbox-gl')).default

      areaMarkersRef.current.forEach((marker) => marker.remove())
      areaMarkersRef.current = []

      for (const area of existingAreas) {
        const color = SIGNAL_COLORS[toSignalType(area.signalType)].color
        const dot = document.createElement('div')
        dot.title = area.name
        dot.style.width = '8px'
        dot.style.height = '8px'
        dot.style.borderRadius = '50%'
        dot.style.backgroundColor = color

        const marker = new mapboxgl.Marker({ element: dot })
          .setLngLat([area.lng, area.lat])
          .addTo(map)

        areaMarkersRef.current.push(marker)
      }
    }

    renderAreaMarkers()
  }, [existingAreas, loading])

  function handleReset() {
    userMarkerRef.current?.remove()
    userMarkerRef.current = null
    setPinSet(false)
  }

  return (
    <div>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex h-[240px] items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
            Loading map...
          </div>
        )}
        <div ref={mapContainerRef} className="h-[240px] overflow-hidden rounded-xl" />
        {!loading && (
          <div className="absolute bottom-2 left-2 flex flex-col gap-1 rounded bg-white p-1.5 text-[10px] shadow-sm">
            <span className="flex items-center gap-1">
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#1D9E75',
                }}
              />
              Your pin
            </span>
            <span className="flex items-center gap-1">
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: SIGNAL_COLORS.good.color,
                }}
              />
              Low risk area
            </span>
            <span className="flex items-center gap-1">
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: SIGNAL_COLORS.danger.color,
                }}
              />
              High risk area
            </span>
            <span className="flex items-center gap-1">
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#185FA5',
                }}
              />
              Sea / coastline
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-1 py-2">
        <span className="text-xs text-gray-400">
          {pinSet
            ? 'Pin set · click to reposition'
            : 'Click map to pin your property location'}
        </span>
        <button
          type="button"
          onClick={handleReset}
          disabled={!pinSet}
          className="text-xs text-gray-500 disabled:opacity-40"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
