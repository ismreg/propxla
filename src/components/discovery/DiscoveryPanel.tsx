'use client'

import { useState } from 'react'
import type { Area } from '@/lib/types'
import FilterChips from '@/components/discovery/FilterChips'
import AreaCard from '@/components/discovery/AreaCard'
import { DISCOVERY_FILTERS } from '@/lib/constants'

interface DiscoveryPanelProps {
  areas: Area[]
  onAreaSelect: (slug: string) => void
}

export default function DiscoveryPanel({ areas, onAreaSelect }: DiscoveryPanelProps) {
  const [activeFilter, setActiveFilter] = useState('omr-invest')
  const [searchQuery, setSearchQuery] = useState('')

  const filter = DISCOVERY_FILTERS.find((f) => f.key === activeFilter)
  const query = searchQuery.trim().toLowerCase()

  const filtered = [...areas]
    .filter((area) => (filter ? area.corridor === filter.corridor : true))
    .filter((area) => (query ? area.name.toLowerCase().includes(query) : true))
    .sort((a, b) => b.overall_score - a.overall_score)

  return (
    <div>
      <div className="relative">
        <i
          className="ti ti-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ fontSize: 16, color: 'rgba(255,255,255,0.40)' }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search area — e.g. Sholinganallur, Kovalam..."
          className="w-full py-3 pl-10 pr-4 text-sm"
        />
      </div>

      <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          No areas found. Try a different filter.
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {filtered.map((area, index) => (
            <AreaCard
              key={area.slug}
              area={area}
              rank={index + 1}
              onClick={onAreaSelect}
            />
          ))}
        </div>
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
