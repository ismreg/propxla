import type { Corridor, DiscoveryFilter, FloodRisk, Intent, SignalType } from './types'

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
  {
    key: 'all-chennai',
    label: 'All Chennai',
    corridor: 'omr' as Corridor,
    intent: 'investment' as Intent,
  },
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
  center: [80.18, 12.88] as [number, number],
  zoom: 9.5,
  style: 'mapbox://styles/mapbox/dark-v11',
}

// ============================================
// AREA COORDINATES — [lng, lat] for map & SEO geo
// ============================================

export const AREA_COORDINATES: Record<string, [number, number]> = {
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
  medavakkam: [80.1954, 12.9174],
  navalur: [80.2267, 12.8441],
  padur: [80.2267, 12.8167],
  karapakkam: [80.2267, 12.9000],
  'okkiyam-thoraipakkam': [80.2456, 12.9456],
  sozhanganallur: [80.2100, 12.8800],
  guduvanchery: [80.0570, 12.8450],
  vandalur: [80.0833, 12.8833],
  palavakkam: [80.2600, 12.9950],
  injambakkam: [80.2600, 12.9600],
  akkarai: [80.2650, 12.9400],
  uthandi: [80.2650, 12.9200],
  kanathur: [80.2650, 12.8900],
  mahabalipuram: [80.1928, 12.6167],
  poonamallee: [80.1167, 13.0500],
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