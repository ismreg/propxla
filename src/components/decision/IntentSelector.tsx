'use client'

import { INTENTS } from '@/lib/constants'

interface IntentSelectorProps {
  selectedIntent: string | null
  onIntentSelect: (intent: string) => void
}

export default function IntentSelector({ selectedIntent, onIntentSelect }: IntentSelectorProps) {
  return (
    <div>
      <div className="mb-2 text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
        What are you buying this for?
      </div>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(INTENTS) as (keyof typeof INTENTS)[]).map((key) => {
          const intent = INTENTS[key]
          const isSelected = key === selectedIntent

          return (
            <div
              key={key}
              onClick={() => onIntentSelect(key)}
              className="cursor-pointer rounded-xl p-3 text-center transition-colors"
              style={
                isSelected
                  ? {
                      background: 'rgba(29,158,117,0.20)',
                      border: '0.5px solid #1D9E75',
                    }
                  : {
                      background: 'rgba(255,255,255,0.07)',
                      border: '0.5px solid rgba(255,255,255,0.10)',
                    }
              }
            >
              <i
                className={`ti ${intent.icon} mb-1`}
                style={{
                  fontSize: 18,
                  display: 'block',
                  color: isSelected ? '#5DCAA5' : 'rgba(255,255,255,0.35)',
                }}
              />
              <span
                className="text-xs"
                style={{
                  color: isSelected ? '#5DCAA5' : 'rgba(255,255,255,0.40)',
                }}
              >
                {intent.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
