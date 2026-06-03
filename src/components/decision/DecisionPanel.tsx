'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Area } from '@/lib/types'
import IntentSelector from '@/components/decision/IntentSelector'

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

const AREA_COORDINATES: Record<string, [number, number]> = {
  sholinganallur: [80.2278, 12.9010],
  kelambakkam: [80.2167, 12.7833],
  perumbakkam: [80.2000, 12.9167],
  siruseri: [80.2333, 12.8167],
  pallikaranai: [80.2000, 12.9333],
  thiruvanmiyur: [80.2667, 12.9833],
  neelankarai: [80.2500, 12.9667],
  muttukadu: [80.2500, 12.8167],
  kovalam: [80.2500, 12.7833],
  kuvathur: [80.2500, 12.6167],
}

function findAreaBySlug(areas: Area[], slug: string | null | undefined): Area | null {
  if (!slug) return null
  return areas.find((area) => area.slug === slug) ?? null
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
  const initialArea = findAreaBySlug(areas, initialSlug)

  const [inputValue, setInputValue] = useState(initialArea?.name ?? '')
  const [suggestions, setSuggestions] = useState<Area[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState<Area | null>(initialArea)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)

  const reportReady = Boolean(selectedIntent && selectedArea)

  function flyToArea(slug: string) {
    const coords = AREA_COORDINATES[slug]
    if (coords) {
      setMapCenter({ lng: coords[0], lat: coords[1] })
    }
  }

  useEffect(() => {
    if (!initialSlug) return
    const area = findAreaBySlug(areas, initialSlug)
    if (area) {
      setSelectedArea(area)
      setInputValue(area.name)
      flyToArea(initialSlug)
    }
  }, [initialSlug, areas])

  function handleInputChange(value: string) {
    setInputValue(value)
    const matches = areas.filter((area) =>
      area.name.toLowerCase().includes(value.toLowerCase())
    )
    setSuggestions(matches.slice(0, 5))
    setShowSuggestions(value.length > 0)
  }

  function selectArea(area: Area) {
    setInputValue(area.name)
    setSelectedArea(area)
    setShowSuggestions(false)
    flyToArea(area.slug)
  }

  function handlePinDrop(_lat: number, _lng: number) {
    setSelectedArea((current) => current ?? areas[0] ?? null)
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

      <IntentSelector
        selectedIntent={selectedIntent}
        onIntentSelect={handleIntentSelect}
      />

      <div className="relative mb-3">
        <i
          className="ti ti-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ fontSize: 16, color: 'rgba(255,255,255,0.40)' }}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (inputValue.length > 0) setShowSuggestions(true)
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150)
          }}
          placeholder="Search area — e.g. Sholinganallur, Kovalam..."
          className="w-full py-3 pl-10 pr-4 text-sm"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl"
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
        <MapPin onPinDrop={handlePinDrop} centerOn={mapCenter} />
      </div>

      {selectedArea && (
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
