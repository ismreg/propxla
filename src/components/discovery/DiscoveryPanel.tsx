'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Area } from '@/lib/types'
import AreaCard from '@/components/discovery/AreaCard'
import { DISCOVERY_FILTERS } from '@/lib/constants'

interface DiscoveryPanelProps {
  areas: Area[]
  onAreaSelect: (slug: string) => void
}

export default function DiscoveryPanel({ areas, onAreaSelect }: DiscoveryPanelProps) {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('omr-invest')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareSelections, setCompareSelections] = useState<string[]>([])

  const filter = DISCOVERY_FILTERS.find((f) => f.key === activeFilter)
  const query = searchQuery.trim().toLowerCase()

  const filteredAreas = [...areas]
    .filter((area) => {
      if (activeFilter === 'all-chennai') return true
      if (filter) return area.corridor === filter.corridor
      return true
    })
    .filter((area) => (query ? area.name.toLowerCase().includes(query) : true))
    .sort((a, b) => b.overall_score - a.overall_score)

  const compareAreas = compareSelections
    .map((slug) => areas.find((area) => area.slug === slug))
    .filter((area): area is Area => area !== undefined)

  function handleCompareToggle() {
    if (compareMode) {
      setCompareMode(false)
      setCompareSelections([])
      return
    }
    setCompareMode(true)
  }

  function handleCompareSelect(slug: string) {
    setCompareSelections((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug)
      if (prev.length >= 2) return prev
      return [...prev, slug]
    })
  }

  function handleRemoveCompare(slug: string) {
    setCompareSelections((prev) => prev.filter((s) => s !== slug))
  }

  function handleCompareNavigate() {
    if (compareSelections.length !== 2) return
    router.push(`/compare/${compareSelections[0]}-vs-${compareSelections[1]}`)
  }

  return (
    <div>
      <div
        className="mb-4"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '20px 16px 16px',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <h2
          className="text-center"
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}
        >
          Find your next property in Chennai
        </h2>
        <p
          className="text-center"
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.40)',
            marginBottom: 16,
          }}
        >
          Real registered prices · Flood risk · Growth signals
        </p>

        <div className="relative w-full">
          <i
            className="ti ti-search pointer-events-none absolute top-1/2 -translate-y-1/2"
            style={{
              left: 16,
              fontSize: 18,
              color: searchFocused ? '#1D9E75' : 'rgba(255,255,255,0.50)',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search area — e.g. Sholinganallur, Kovalam..."
            className="hero-search-input w-full text-white"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.30)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            Quick filters
          </div>
          <div className="flex flex-wrap gap-2">
            {DISCOVERY_FILTERS.map((f) => {
              const isActive = f.key === activeFilter
              return (
                <span
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className="cursor-pointer"
                  style={{
                    fontSize: 12,
                    padding: '4px 12px',
                    borderRadius: 999,
                    fontWeight: isActive ? 500 : 400,
                    ...(isActive
                      ? {
                          background: '#1D9E75',
                          color: 'white',
                          border: 'none',
                        }
                      : {
                          background: 'rgba(255,255,255,0.08)',
                          border: '0.5px solid rgba(255,255,255,0.12)',
                          color: 'rgba(255,255,255,0.50)',
                        }),
                  }}
                >
                  {f.label}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div
        className="mb-2 flex items-center justify-between gap-2 uppercase tracking-wide"
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        <span>
          Ranked areas · {filteredAreas.length} areas
        </span>
        <button
          type="button"
          onClick={handleCompareToggle}
          className="flex items-center gap-1.5 normal-case tracking-normal transition-opacity hover:opacity-90"
          style={
            compareMode
              ? {
                  fontSize: 12,
                  background: 'rgba(29,158,117,0.20)',
                  border: '0.5px solid rgba(29,158,117,0.40)',
                  color: '#5DCAA5',
                  padding: '5px 12px',
                  borderRadius: 8,
                }
              : {
                  fontSize: 12,
                  background: 'rgba(255,255,255,0.08)',
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.60)',
                  padding: '5px 12px',
                  borderRadius: 8,
                }
          }
        >
          {!compareMode && <i className="ti ti-arrows-diff" />}
          {compareMode ? 'Cancel compare' : 'Compare areas'}
        </button>
      </div>

      {compareMode && (
        <div className="glass mb-3 rounded-xl" style={{ padding: '12px 14px' }}>
          <div className="mb-2 text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Select 2 areas to compare
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((slot) => {
              const area = compareAreas[slot]
              if (!area) {
                return (
                  <div
                    key={slot}
                    className="rounded-lg p-2 text-center text-xs"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '0.5px dashed rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.25)',
                    }}
                  >
                    Pick an area below
                  </div>
                )
              }
              return (
                <div
                  key={slot}
                  className="flex items-center justify-between rounded-lg p-2"
                  style={{
                    background: 'rgba(29,158,117,0.12)',
                    border: '0.5px solid rgba(29,158,117,0.30)',
                  }}
                >
                  <div>
                    <div className="text-xs font-medium text-white">{area.name}</div>
                    <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
                      {area.corridor.toUpperCase()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCompare(area.slug)}
                    className="text-gray-400 transition-colors hover:text-white"
                    aria-label={`Remove ${area.name}`}
                  >
                    <i className="ti ti-x" style={{ fontSize: 14 }} />
                  </button>
                </div>
              )
            })}
          </div>
          {compareSelections.length === 2 && compareAreas.length === 2 && (
            <button
              type="button"
              onClick={handleCompareNavigate}
              className="mt-2 w-full cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #1D9E75, #185FA5)',
                border: 'none',
              }}
            >
              Compare {compareAreas[0].name} vs {compareAreas[1].name} →
            </button>
          )}
        </div>
      )}

      {filteredAreas.length === 0 ? (
        <div className="py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          No areas found. Try a different filter.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {filteredAreas.map((area, index) => (
              <AreaCard
                key={area.slug}
                area={area}
                rank={index + 1}
                onClick={onAreaSelect}
                compareMode={compareMode}
                isSelected={compareSelections.includes(area.slug)}
                isDisabled={
                  compareMode &&
                  compareSelections.length === 2 &&
                  !compareSelections.includes(area.slug)
                }
                onCompareToggle={handleCompareSelect}
              />
            ))}
          </div>
          {filteredAreas.length > 6 && (
            <div
              style={{
                textAlign: 'center',
                fontSize: 11,
                color: 'rgba(255,255,255,0.20)',
                paddingTop: 8,
                paddingBottom: 4,
              }}
            >
              Scroll for more · {filteredAreas.length} areas total
            </div>
          )}
        </>
      )}

      <div
        className="mt-3 text-center text-xs"
        style={{ color: 'rgba(255,255,255,0.30)' }}
      >
        Click any area to check a specific property there →
      </div>
    </div>
  )
}
