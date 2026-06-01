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
}: DecisionPanelProps) {
  const initialArea = findAreaBySlug(areas, initialSlug)

  const [address, setAddress] = useState(initialArea?.name ?? '')
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null)
  const [pinDropped, setPinDropped] = useState(!!initialSlug)
  const [selectedArea, setSelectedArea] = useState<Area | null>(initialArea)

  useEffect(() => {
    if (!initialSlug) return
    const area = findAreaBySlug(areas, initialSlug)
    if (area) {
      setSelectedArea(area)
      setAddress(area.name)
      setPinDropped(true)
    }
  }, [initialSlug, areas])

  function handleAddressChange(value: string) {
    setAddress(value)

    const match = areas.find((area) =>
      area.name.toLowerCase().includes(value.toLowerCase())
    )

    if (match && value.trim()) {
      setSelectedArea(match)
      setPinDropped(true)
    }
  }

  function handlePinDrop(_lat: number, _lng: number) {
    setPinDropped(true)
    setSelectedArea((current) => current ?? areas[0] ?? null)
  }

  function handleIntentSelect(intent: string) {
    setSelectedIntent(intent)
    onIntentSelect?.(intent)
  }

  const showReport = pinDropped && selectedIntent && selectedArea
  const showNotFound = pinDropped && selectedIntent && !selectedArea

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex items-start">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.number, pinDropped, selectedIntent)

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
                    className={`whitespace-nowrap text-center text-[10px] ${
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
                    {step.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <input
        type="text"
        value={address}
        onChange={(e) => handleAddressChange(e.target.value)}
        placeholder="Enter address or project name..."
        className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
      />

      <MapPin onPinDrop={handlePinDrop} />

      {pinDropped && (
        <IntentSelector
          selectedIntent={selectedIntent}
          onIntentSelect={handleIntentSelect}
        />
      )}

      {showReport && selectedArea && (
        <PropertyReport
          area={selectedArea}
          intent={selectedIntent}
          address={address}
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
