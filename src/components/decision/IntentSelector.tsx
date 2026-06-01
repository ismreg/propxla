'use client'

import { INTENTS } from '@/lib/constants'

interface IntentSelectorProps {
  selectedIntent: string | null
  onIntentSelect: (intent: string) => void
}

export default function IntentSelector({ selectedIntent, onIntentSelect }: IntentSelectorProps) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-2">
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
              className={`p-3 border rounded-xl cursor-pointer text-center transition-colors ${
                isSelected ? '' : 'bg-white border-gray-200'
              }`}
              style={
                isSelected
                  ? { backgroundColor: '#E1F5EE', borderColor: '#5DCAA5', color: '#0F6E56' }
                  : undefined
              }
            >
              <i
                className={`ti ${intent.icon} mb-1 ${isSelected ? '' : 'text-gray-400'}`}
                style={{ fontSize: 18, display: 'block' }}
              />
              <span className={`text-xs ${isSelected ? '' : 'text-gray-500'}`}>
                {intent.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
