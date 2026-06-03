'use client'

import { DISCOVERY_FILTERS } from '@/lib/constants'

interface FilterChipsProps {
  activeFilter: string
  onFilterChange: (key: string) => void
}

export default function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {DISCOVERY_FILTERS.map((filter) => {
        const isActive = filter.key === activeFilter

        return (
          <span
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className="cursor-pointer"
            style={{
              fontSize: 12,
              padding: '4px 12px',
              borderRadius: 999,
              ...(isActive
                ? {
                    background: 'rgba(29,158,117,0.25)',
                    border: '0.5px solid #1D9E75',
                    color: '#5DCAA5',
                  }
                : {
                    background: 'rgba(255,255,255,0.06)',
                    border: '0.5px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.45)',
                  }),
            }}
          >
            {filter.label}
          </span>
        )
      })}
    </div>
  )
}
