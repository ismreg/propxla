'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Area } from '@/lib/types'
import IntentSelector from '@/components/decision/IntentSelector'
import PropertyReport from '@/components/decision/PropertyReport'

const MapPin = dynamic(
  () => import('@/components/decision/MapPin'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-60 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
        Loading map...
      </div>
    ),
  }
)

interface DecisionPanelProps {
  areas: Area[]
  initialSlug?: string | null
  onIntentSelect?: (intent: string) => void
  onReportView?: () => boolean
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
  { number: 1, label: 'Pin location', icon: 'ti-map-pin' },
  { number: 2, label: 'Select intent', icon: 'ti-target' },
  { number: 3, label: 'View report', icon: 'ti-file-analytics' },
] as const

function getStepStatus(
  step: 1 | 2 | 3,
  pinDropped: boolean,
  selectedIntent: string | null
): 'active' | 'completed' | 'inactive' {
  if (step === 1) {
    if (!pinDropped) return 'active'
    return 'completed'
  }
  if (step === 2) {
    if (!pinDropped) return 'inactive'
    if (!selectedIntent) return 'active'
    return 'completed'
  }
  if (!pinDropped || !selectedIntent) return 'inactive'
  return 'active'
}

export default function DecisionPanel({
  areas,
  initialSlug = null,
  onIntentSelect,
  onReportView,
}: DecisionPanelProps) {
  const initialArea = findAreaBySlug(areas, initialSlug)

  const [inputValue, setInputValue] = useState(initialArea?.name ?? '')
  const [suggestions, setSuggestions] = useState<Area[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null)
  const [pinDropped, setPinDropped] = useState(!!initialSlug)
  const [selectedArea, setSelectedArea] = useState<Area | null>(initialArea)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [canShowReport, setCanShowReport] = useState(false)

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
      setPinDropped(true)
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
    setPinDropped(true)
    setShowSuggestions(false)
    flyToArea(area.slug)
  }

  function handlePinDrop(_lat: number, _lng: number) {
    setPinDropped(true)
    setSelectedArea((current) => current ?? areas[0] ?? null)
  }

  function handleIntentSelect(intent: string) {
    setSelectedIntent(intent)
    onIntentSelect?.(intent)
  }

  function handleChangeArea() {
    setSelectedArea(null)
    setInputValue('')
    setPinDropped(false)
    setMapCenter(null)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const showNotFound = pinDropped && selectedIntent && !selectedArea

  useEffect(() => {
    if (!pinDropped || !selectedIntent || !selectedArea) {
      setCanShowReport(false)
      return
    }
    const allowed = onReportView ? onReportView() : true
    setCanShowReport(allowed)
  }, [pinDropped, selectedIntent, selectedArea?.slug, onReportView, selectedArea])

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex items-start">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.number, pinDropped, selectedIntent)
          const stepLabel =
            step.number === 1 && selectedArea ? selectedArea.name : step.label

          return (
            <div key={step.number} className="contents">
              {index > 0 && <div className="mx-2 mt-3 h-px flex-1 bg-gray-200" />}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                    status === 'inactive' ? 'bg-gray-100 text-gray-400' : ''
                  }`}
                  style={
                    status === 'active'
                      ? { backgroundColor: '#E1F5EE', color: '#0F6E56' }
                      : status === 'completed'
                      ? { backgroundColor: '#EAF3DE', color: '#3B6D11' }
                      : undefined
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
                    className={`ti ${step.icon} ${
                      status === 'inactive' ? 'text-gray-400' : ''
                    }`}
                    style={
                      status === 'active'
                        ? { color: '#0F6E56', fontSize: 14 }
                        : status === 'completed'
                        ? { color: '#3B6D11', fontSize: 14 }
                        : { fontSize: 14 }
                    }
                  />
                  <span
                    className={`max-w-[72px] truncate text-center text-[10px] ${
                      status === 'inactive' ? 'text-gray-400' : ''
                    }`}
                    style={
                      status === 'active'
                        ? { color: '#0F6E56' }
                        : status === 'completed'
                        ? { color: '#3B6D11' }
                        : undefined
                    }
                  >
                    {stepLabel}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative mb-3">
        <i
          className="ti ti-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          style={{ fontSize: 16 }}
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
          className="w-full rounded-xl border border-[#E8E6E1] bg-white py-3 pl-10 pr-4 text-sm"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-[#E8E6E1] bg-white shadow-lg">
            {suggestions.map((area) => (
              <button
                key={area.slug}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectArea(area)}
                className="flex w-full cursor-pointer items-center gap-3 border-b border-[#F7F6F3] px-4 py-3 text-left last:border-0 hover:bg-[#F7F6F3]"
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor: area.corridor === 'omr' ? '#185FA5' : '#1D9E75',
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-800">{area.name}</div>
                  <div className="text-xs text-gray-400">
                    {area.corridor.toUpperCase()} · {area.distance_from_city} km from city
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    area.overall_score >= 65
                      ? 'bg-[#E1F5EE] text-[#0F6E56]'
                      : 'bg-[#FAEEDA] text-[#854F0B]'
                  }`}
                >
                  {area.overall_score}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <MapPin onPinDrop={handlePinDrop} centerOn={mapCenter} />

      {selectedArea && pinDropped && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#9FE1CB] bg-[#E1F5EE] px-4 py-3">
          <i className="ti ti-circle-check text-lg text-[#0F6E56]" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-[#085041]">
              {selectedArea.name} selected
            </div>
            <div className="mt-0.5 text-xs text-[#0F6E56]">
              {selectedArea.corridor.toUpperCase()} corridor · Overall score:{' '}
              {selectedArea.overall_score}/100
            </div>
          </div>
          <button
            type="button"
            onClick={handleChangeArea}
            className="flex-shrink-0 text-xs text-[#0F6E56] underline hover:text-[#085041]"
          >
            Change
          </button>
        </div>
      )}

      {pinDropped && (
        <IntentSelector
          selectedIntent={selectedIntent}
          onIntentSelect={handleIntentSelect}
        />
      )}

      {canShowReport && selectedArea && selectedIntent && (
        <PropertyReport
          area={selectedArea}
          intent={selectedIntent}
          address={inputValue}
        />
      )}

      {showNotFound && (
        <div className="py-4 text-center text-sm text-gray-400">
          Area not found in our database yet. Try searching Sholinganallur,
          Kelambakkam, or other OMR/ECR areas.
        </div>
      )}
    </div>
  )
}
