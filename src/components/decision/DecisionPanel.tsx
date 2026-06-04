'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Area } from '@/lib/types'
import IntentSelector from '@/components/decision/IntentSelector'
import { AREA_COORDINATES } from '@/lib/constants'

const MapPin = dynamic(
  () => import('@/components/decision/MapPin'),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-60 w-full items-center justify-center rounded-xl text-xs"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '0.5px solid rgba(255,255,255,0.10)',
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        Loading map...
      </div>
    ),
  }
)

interface DecisionPanelProps {
  areas: Area[]
  initialSlug?: string | null
  onIntentSelect?: (intent: string) => void
}

type NearestAreaMatch = {
  area: Area
  distance: number
  area_lat: number
  area_lng: number
}

function findAreaBySlug(areas: Area[], slug: string | null | undefined): Area | null {
  if (!slug) return null
  return areas.find((area) => area.slug === slug) ?? null
}

function findNearestArea(
  areas: Area[],
  lat: number,
  lng: number
): NearestAreaMatch | null {
  let nearest: NearestAreaMatch | null = null
  let minDist = Infinity

  for (const area of areas) {
    const coords = AREA_COORDINATES[area.slug]
    if (!coords) continue

    const R = 6371
    const dLat = ((lat - coords[1]) * Math.PI) / 180
    const dLng = ((lng - coords[0]) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coords[1] * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    if (dist < minDist) {
      minDist = dist
      nearest = {
        area,
        distance: dist,
        area_lat: coords[1],
        area_lng: coords[0],
      }
    }
  }

  return nearest
}

async function logAddressSearch(
  address: string,
  lat: number,
  lng: number,
  matchedSlug?: string,
  isInServiceArea?: boolean
) {
  fetch('/api/log-address-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address,
      lat,
      lng,
      matched_area_slug: matchedSlug || null,
      is_in_service_area: isInServiceArea || false,
    }),
  }).catch(() => {})
}

const STEPS = [
  { number: 1, label: 'Select intent', icon: 'ti-target' },
  { number: 2, label: 'Pin location', icon: 'ti-map-pin' },
  { number: 3, label: 'View report', icon: 'ti-file-analytics' },
] as const

function getStepStatus(
  step: 1 | 2 | 3,
  selectedIntent: string | null,
  selectedArea: Area | null
): 'active' | 'completed' | 'inactive' {
  if (step === 1) {
    if (!selectedIntent) return 'active'
    return 'completed'
  }
  if (step === 2) {
    if (!selectedIntent) return 'inactive'
    if (!selectedArea) return 'active'
    return 'completed'
  }
  if (!selectedIntent || !selectedArea) return 'inactive'
  return 'active'
}

export default function DecisionPanel({
  areas,
  initialSlug = null,
  onIntentSelect,
}: DecisionPanelProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const initialArea = findAreaBySlug(areas, initialSlug)

  const [inputValue, setInputValue] = useState(initialArea?.name ?? '')
  const [suggestions, setSuggestions] = useState<Area[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState<Area | null>(initialArea)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [pinDropped, setPinDropped] = useState(Boolean(initialArea))
  const [outOfServiceArea, setOutOfServiceArea] = useState(false)
  const [outOfServiceAddress, setOutOfServiceAddress] = useState('')

  const reportReady = Boolean(selectedIntent && selectedArea)

  const flyToArea = useCallback((slug: string) => {
    const coords = AREA_COORDINATES[slug]
    if (coords) {
      setMapCenter({ lng: coords[0], lat: coords[1] })
    }
  }, [])

  const handleAddressSelected = useCallback(
    async (lat: number, lng: number, address: string) => {
      setInputValue(address)
      setShowSuggestions(false)

      const matched = findNearestArea(areas, lat, lng)
      const inService = Boolean(matched && matched.distance <= 3.0)

      await logAddressSearch(
        address,
        lat,
        lng,
        inService && matched ? matched.area.slug : undefined,
        inService
      )

      if (inService && matched) {
        setSelectedArea(matched.area)
        setPinDropped(true)
        setMapCenter({ lat: matched.area_lat, lng: matched.area_lng })
        setOutOfServiceArea(false)
        setOutOfServiceAddress('')
      } else {
        setSelectedArea(null)
        setPinDropped(true)
        setOutOfServiceArea(true)
        setOutOfServiceAddress(address)
        setMapCenter({ lat, lng })
      }
    },
    [areas]
  )

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value)
      setOutOfServiceArea((wasOutOfService) => {
        if (wasOutOfService) {
          setOutOfServiceAddress('')
          return false
        }
        return wasOutOfService
      })

      const matches = areas.filter((area) =>
        area.name.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(matches.slice(0, 5))
      setShowSuggestions(value.length > 0)
    },
    [areas]
  )

  const initAutocomplete = useCallback(() => {
    if (autocompleteRef.current) return

    const input = document.getElementById(
      'address-search-input'
    ) as HTMLInputElement | null
    if (!input || !window.google?.maps?.places) return

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'in' },
        types: ['geocode', 'establishment'],
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.geometry?.location) return

        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        const address = place.formatted_address || place.name || ''

        handleAddressSelected(lat, lng, address)
      })

      autocompleteRef.current = autocomplete
    } catch (err) {
      console.log('Places autocomplete not available:', err)
    }
  }, [handleAddressSelected])

  useEffect(() => {
    if (!initialSlug) return
    const area = findAreaBySlug(areas, initialSlug)
    if (area) {
      setSelectedArea(area)
      setInputValue(area.name)
      setPinDropped(true)
      setOutOfServiceArea(false)
      flyToArea(initialSlug)
    }
  }, [initialSlug, areas, flyToArea])

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY
    if (!apiKey) return

    let cancelled = false

    const runInit = () => {
      if (cancelled) return
      initAutocomplete()
    }

    if (window.google?.maps?.places) {
      runInit()
      return () => {
        cancelled = true
      }
    }

    const existing = document.querySelector('script[data-google-places]')
    if (existing) {
      existing.addEventListener('load', runInit)
      return () => {
        cancelled = true
        existing.removeEventListener('load', runInit)
      }
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
    script.async = true
    script.dataset.googlePlaces = 'true'
    script.onload = runInit
    document.head.appendChild(script)

    return () => {
      cancelled = true
      script.onload = null
      autocompleteRef.current = null
    }
  }, [initAutocomplete])

  function selectArea(area: Area) {
    setInputValue(area.name)
    setSelectedArea(area)
    setPinDropped(true)
    setShowSuggestions(false)
    setOutOfServiceArea(false)
    setOutOfServiceAddress('')
    flyToArea(area.slug)
  }

  function handleSearchAnotherArea() {
    setOutOfServiceArea(false)
    setOutOfServiceAddress('')
    setInputValue('')
    setSelectedArea(null)
    setPinDropped(false)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function handleUseNearestArea() {
    const lat = mapCenter?.lat ?? 12.9
    const lng = mapCenter?.lng ?? 80.2
    const nearest = findNearestArea(areas, lat, lng)
    if (!nearest) return

    setSelectedArea(nearest.area)
    setOutOfServiceArea(false)
    setOutOfServiceAddress('')
    setInputValue(`${nearest.area.name} (nearest area)`)
    setPinDropped(true)
    setMapCenter({ lat: nearest.area_lat, lng: nearest.area_lng })
  }

  function handleIntentSelect(intent: string) {
    setSelectedIntent(intent)
    onIntentSelect?.(intent)
  }

  function handleGenerateReport() {
    if (!selectedArea) return
    const intent = selectedIntent || 'investment'
    router.push(`/report/${selectedArea.slug}?intent=${intent}`)
  }

  const showAreaFallback = showSuggestions && suggestions.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex items-start">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.number, selectedIntent, selectedArea)
          const stepLabel =
            step.number === 2 && selectedArea ? selectedArea.name : step.label
          const isStep3Clickable = step.number === 3 && reportReady

          return (
            <div key={step.number} className="contents">
              {index > 0 && (
                <div
                  className="mx-2 mt-3 h-px flex-1"
                  style={{ background: 'rgba(255,255,255,0.10)' }}
                />
              )}
              <div
                className={`flex flex-col items-center gap-1 rounded-lg px-1 transition-colors ${
                  isStep3Clickable
                    ? 'cursor-pointer hover:bg-[rgba(29,158,117,0.12)]'
                    : ''
                }`}
                onClick={isStep3Clickable ? handleGenerateReport : undefined}
                onKeyDown={
                  isStep3Clickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleGenerateReport()
                        }
                      }
                    : undefined
                }
                role={isStep3Clickable ? 'button' : undefined}
                tabIndex={isStep3Clickable ? 0 : undefined}
                style={isStep3Clickable ? { cursor: 'pointer' } : undefined}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors"
                  style={
                    status === 'active'
                      ? { backgroundColor: '#1D9E75', color: '#FFFFFF' }
                      : status === 'completed'
                      ? { backgroundColor: 'rgba(29,158,117,0.20)', color: '#5DCAA5' }
                      : {
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.35)',
                        }
                  }
                >
                  {status === 'completed' ? (
                    <i className="ti ti-check" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <i
                    className={`ti ${step.icon}`}
                    style={{
                      fontSize: 14,
                      color:
                        status === 'active'
                          ? '#5DCAA5'
                          : status === 'completed'
                          ? '#5DCAA5'
                          : 'rgba(255,255,255,0.35)',
                    }}
                  />
                  <span
                    className="max-w-[72px] truncate text-center text-[10px]"
                    style={{
                      color:
                        status === 'active'
                          ? '#FFFFFF'
                          : status === 'completed'
                          ? '#5DCAA5'
                          : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {stepLabel}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!outOfServiceArea && (
        <IntentSelector
          selectedIntent={selectedIntent}
          onIntentSelect={handleIntentSelect}
        />
      )}

      <div className="relative mb-3">
        <i
          className="ti ti-search pointer-events-none absolute top-1/2 z-10 -translate-y-1/2"
          style={{
            left: 12,
            fontSize: 16,
            color: 'rgba(255,255,255,0.40)',
          }}
        />
        <input
          ref={inputRef}
          id="address-search-input"
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (inputValue.length > 0) setShowSuggestions(true)
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150)
          }}
          placeholder="Enter address or project name..."
          autoComplete="off"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            border: '0.5px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            padding: '10px 14px 10px 40px',
            fontSize: 14,
            color: 'white',
            outline: 'none',
          }}
        />
        {showAreaFallback && (
          <div
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl"
            style={{
              background: '#0F2D1E',
              border: '0.5px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {suggestions.map((area) => (
              <button
                key={area.slug}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectArea(area)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left last:border-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor: area.corridor === 'omr' ? '#185FA5' : '#1D9E75',
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">{area.name}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    {area.corridor.toUpperCase()} · {area.distance_from_city} km from city
                  </div>
                </div>
                <span
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={
                    area.overall_score >= 65
                      ? { background: 'rgba(29,158,117,0.20)', color: '#5DCAA5' }
                      : { background: 'rgba(186,117,23,0.15)', color: '#FAC775' }
                  }
                >
                  {area.overall_score}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full">
        <MapPin
          onPinDrop={() => {}}
          centerOn={mapCenter}
          disablePinDrop
        />
      </div>

      {outOfServiceArea && (
        <div
          style={{
            background: 'rgba(186,117,23,0.10)',
            border: '0.5px solid rgba(186,117,23,0.25)',
            borderRadius: 16,
            padding: '16px 20px',
            marginTop: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <i
              className="ti ti-map-off"
              style={{
                fontSize: 20,
                color: '#FAC775',
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#FAC775' }}>
                Outside our current service area
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(250,199,117,0.70)',
                  marginTop: 4,
                  lineHeight: 1.6,
                }}
              >
                We currently cover OMR and ECR corridors in Chennai.
                <br />
                <span style={{ color: '#FAC775', fontWeight: 500 }}>
                  {outOfServiceAddress}
                </span>{' '}
                is not yet in our database.
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(93,202,165,0.80)',
                  marginTop: 8,
                }}
              >
                ✓ We&apos;ve noted your search. This area will be added soon.
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleSearchAnotherArea}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.60)',
                    border: '0.5px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    padding: '7px 14px',
                    cursor: 'pointer',
                  }}
                >
                  Search another area
                </button>

                <button
                  type="button"
                  onClick={handleUseNearestArea}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    background: 'rgba(29,158,117,0.15)',
                    color: '#5DCAA5',
                    border: '0.5px solid rgba(29,158,117,0.30)',
                    borderRadius: 8,
                    padding: '7px 14px',
                    cursor: 'pointer',
                  }}
                >
                  Use nearest area instead →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedArea && !outOfServiceArea && (
        <div
          className="mt-3 flex items-center justify-between gap-3"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '0.5px solid rgba(255,255,255,0.10)',
            borderRadius: 16,
            padding: '14px 16px',
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex flex-shrink-0 items-center justify-center rounded-full"
              style={{
                width: 36,
                height: 36,
                background: 'rgba(29,158,117,0.20)',
              }}
            >
              <i className="ti ti-check" style={{ fontSize: 16, color: '#1D9E75' }} />
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-white">{selectedArea.name}</div>
              <div
                className="mt-0.5 text-[11px]"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                {selectedArea.corridor.toUpperCase()} corridor · Score:{' '}
                {selectedArea.overall_score}/100
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={!reportReady}
            className="flex-shrink-0 whitespace-nowrap transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              boxShadow: '0 4px 12px rgba(249,115,22,0.30)',
            }}
          >
            Generate Report
          </button>
        </div>
      )}
    </div>
  )
}
