import type { DiscoveryFilter, FloodRisk, SignalType } from './types'

// ============================================
// CORRIDORS
// ============================================

export const CORRIDORS = {
  omr: { label: 'OMR corridor', color: '#185FA5', bg: '#E6F1FB' },
  ecr: { label: 'ECR corridor', color: '#0F6E56', bg: '#E1F5EE' },
} as const

// ============================================
// INTENTS
// ============================================

export const INTENTS = {
  retirement: { label: 'Retirement home', icon: 'ti-home' },
  investment:  { label: 'Investment',      icon: 'ti-trending-up' },
  vacation:    { label: 'Vacation villa',  icon: 'ti-beach' },
  rental:      { label: 'Rental income',   icon: 'ti-key' },
} as const

// ============================================
// DISCOVERY QUICK FILTERS
// ============================================

export const DISCOVERY_FILTERS: DiscoveryFilter[] = [
  { key: 'omr-invest',  label: 'OMR · Investment', corridor: 'omr', intent: 'investment' },
  { key: 'ecr-retire',  label: 'ECR · Retirement', corridor: 'ecr', intent: 'retirement' },
  { key: 'ecr-villa',   label: 'ECR · Villa',       corridor: 'ecr', intent: 'vacation'   },
  { key: 'omr-rental',  label: 'OMR · Rental',      corridor: 'omr', intent: 'rental'     },
]

// ============================================
// SIGNAL COLORS
// ============================================

export const SIGNAL_COLORS: Record<SignalType, { bg: string; color: string; border: string }> = {
  good:   { bg: '#EAF3DE', color: '#3B6D11', border: '#C0DD97' },
  warn:   { bg: '#FAEEDA', color: '#854F0B', border: '#FAC775' },
  danger: { bg: '#FCEBEB', color: '#A32D2D', border: '#F7C1C1' },
}

// ============================================
// FLOOD RISK → SIGNAL TYPE
// ============================================

export const FLOOD_SIGNAL: Record<FloodRisk, SignalType> = {
  low:       'good',
  moderate:  'warn',
  high:      'danger',
  very_high: 'danger',
}

// ============================================
// SCORE → VERDICT
// ============================================

export function getVerdict(score: number): {
  label: string
  type: SignalType
} {
  if (score >= 80) return { label: 'Strong buy',        type: 'good'   }
  if (score >= 65) return { label: 'Good pick',         type: 'good'   }
  if (score >= 50) return { label: 'Proceed with care', type: 'warn'   }
  return               { label: 'High risk',           type: 'danger' }
}

// ============================================
// MAPBOX CONFIG
// ============================================

export const MAPBOX_CONFIG = {
  center: [80.26, 12.85] as [number, number],
  zoom: 10.5,
  style: 'mapbox://styles/mapbox/light-v11',
}

// ============================================
// BROKER PREMIUM LABEL
// ============================================

export function getPremiumLabel(gap: number): {
  label: string
  type: SignalType
} {
  if (gap <= 10) return { label: 'Fair pricing',             type: 'good'   }
  if (gap <= 25) return { label: 'Overpriced',               type: 'warn'   }
  return               { label: 'Significantly overpriced', type: 'danger' }
}