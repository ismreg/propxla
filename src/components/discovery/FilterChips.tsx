'use client'

import { DISCOVERY_FILTERS } from '@/lib/constants'

interface FilterChipsProps {
  activeFilter: string
  onFilterChange: (key: string) => void
}

export default function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {DISCOVERY_FILTERS.map((filter) => {
        const isActive = filter.key === activeFilter

        return (
          <span
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`cursor-pointer ${
              isActive ? '' : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
            style={{
              fontSize: 12,
              padding: '4px 12px',
              borderRadius: 999,
              ...(isActive
                ? {
                    backgroundColor: '#E1F5EE',
                    color: '#0F6E56',
                    border: '0.5px solid #5DCAA5',
                  }
                : {}),
            }}
          >
            {filter.label}
          </span>
        )
      })}
    </div>
  )
}
