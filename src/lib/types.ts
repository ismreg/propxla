// ============================================
// AREA TYPES — core data unit
// ============================================

export type Corridor = 'omr' | 'ecr'

export type FloodRisk = 'low' | 'moderate' | 'high' | 'very_high'

export type SignalType = 'good' | 'warn' | 'danger'

export type Intent = 'retirement' | 'investment' | 'vacation' | 'rental'

export type MetroType = 'good' | 'warn' | 'none'

export type ItType = 'good' | 'warn' | 'none'

export type GrowthType = 'good' | 'warn' | 'speculative'

// ============================================
// PRICE TREND — historical data points
// ============================================

export interface PriceTrendPoint {
  year: string
  psf: number
}

// ============================================
// TRANSACTION — registered sale record
// ============================================

export interface Transaction {
  unit: string
  date: string
  total: string
  psf: string
}

// ============================================
// AREA — main data object from Supabase
// ============================================

export interface Area {
  id: string
  slug: string
  name: string
  corridor: Corridor
  distance_from_city: number
  broker_ask_psf: number
  reg_avg_psf: number
  flood_risk: FloodRisk
  czr_risk: boolean
  metro_proximity: string
  metro_type: MetroType
  it_proximity: string
  it_type: ItType
  growth_label: string
  growth_type: GrowthType
  price_trend: PriceTrendPoint[]
  transactions: Transaction[]
  overall_score: number
  created_at: string
}

// ============================================
// SEARCH LOG — intent graph entry
// ============================================

export interface SearchLog {
  area_slug: string
  intent: Intent | null
  budget_lakhs: number | null
  corridor: Corridor | null
}

// ============================================
// SCORE RESULT — computed by scoring.ts
// ============================================

export interface ScoreResult {
  overall: number
  price: number
  risk: number
  lifestyle: number
  boost: string
  warning: string
}

// ============================================
// FLAG — risk/opportunity signal on report
// ============================================

export type FlagType = 'danger' | 'warn' | 'good'

export interface Flag {
  type: FlagType
  icon: string
  title: string
  body: string
}

// ============================================
// DISCOVERY FILTER — tab 1 quick filters
// ============================================

export interface DiscoveryFilter {
  key: string
  label: string
  corridor: Corridor
  intent: Intent
}

// ============================================
// PROPERTY PIN — decision tab map state
// ============================================

export interface PropertyPin {
  lat: number
  lng: number
  address: string
}