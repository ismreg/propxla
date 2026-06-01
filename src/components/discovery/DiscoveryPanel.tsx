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
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search area — e.g. Sholinganallur, Kovalam..."
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full"
      />

      <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {filtered.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-8">
          No areas found. Try a different filter.
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-3">
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

      <div className="text-xs text-gray-400 mt-3 text-center">
        Click any area to check a specific property there →
      </div>
    </div>
  )
}
