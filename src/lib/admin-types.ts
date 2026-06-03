import type { PriceTrendPoint, Transaction } from '@/lib/types'

export interface AdminAreaSummary {
  id: string
  slug: string
  name: string
  corridor: string
  reg_avg_psf: number
  broker_ask_psf: number
  overall_score: number
}

export interface ParsedAreaUpdate {
  reg_avg_psf?: number
  broker_ask_psf?: number
  transactions?: Transaction[]
  price_trend?: PriceTrendPoint[]
  overall_score?: number
  growth_label?: string
}
