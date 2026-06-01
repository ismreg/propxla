import type { Area, Intent, ScoreResult } from './types'

// ============================================
// INTENT MODIFIERS
// weights shift the base score per intent
// ============================================

const INTENT_MODIFIERS: Record<Intent, {
  priceWeight:     number
  riskWeight:      number
  lifestyleWeight: number
  boost:           string
  warning:         string
}> = {
  retirement: {
    priceWeight:     0.25,
    riskWeight:      0.45,
    lifestyleWeight: 0.30,
    boost:   'Low density and beach proximity boost retirement suitability.',
    warning: 'Flood and CRZ risk are critical for a permanent dwelling.',
  },
  investment: {
    priceWeight:     0.50,
    riskWeight:      0.30,
    lifestyleWeight: 0.20,
    boost:   'Price momentum and IT corridor proximity drive investment score.',
    warning: 'Illiquid market. Verify exit options before committing capital.',
  },
  vacation: {
    priceWeight:     0.20,
    riskWeight:      0.35,
    lifestyleWeight: 0.45,
    boost:   'Beach access and low density ideal for seasonal use.',
    warning: 'Off-season rental yield is weak. Factor in caretaking costs.',
  },
  rental: {
    priceWeight:     0.40,
    riskWeight:      0.30,
    lifestyleWeight: 0.30,
    boost:   'IT corridor proximity drives consistent rental demand.',
    warning: 'No year-round rental market without active platform strategy.',
  },
}

// ============================================
// BASE SCORE COMPONENTS
// derived from area data, 0–100 each
// ============================================

function getPriceScore(area: Area): number {
  const gap = (area.broker_ask_psf - area.reg_avg_psf) / area.reg_avg_psf
  if (gap <= 0.10) return 90
  if (gap <= 0.20) return 75
  if (gap <= 0.35) return 55
  if (gap <= 0.50) return 35
  return 20
}

function getRiskScore(area: Area): number {
  const floodBase: Record<string, number> = {
    low: 85, moderate: 65, high: 35, very_high: 15,
  }
  const base = floodBase[area.flood_risk] ?? 50
  return area.czr_risk ? Math.max(base - 20, 10) : base
}

function getLifestyleScore(area: Area): number {
  let score = 60
  if (area.metro_type === 'good') score += 20
  if (area.metro_type === 'warn') score += 5
  if (area.it_type    === 'good') score += 15
  if (area.it_type    === 'warn') score += 5
  if (area.growth_type === 'good')        score += 5
  if (area.growth_type === 'speculative') score -= 10
  return Math.min(score, 100)
}

// ============================================
// MAIN SCORING FUNCTION
// ============================================

export function computeScore(area: Area, intent: Intent): ScoreResult {
  const m = INTENT_MODIFIERS[intent]

  const price     = getPriceScore(area)
  const risk      = getRiskScore(area)
  const lifestyle = getLifestyleScore(area)

  const overall = Math.round(
    price     * m.priceWeight +
    risk      * m.riskWeight  +
    lifestyle * m.lifestyleWeight
  )

  return {
    overall,
    price,
    risk,
    lifestyle,
    boost:   m.boost,
    warning: m.warning,
  }
}

// ============================================
// BROKER GAP CALCULATOR
// ============================================

export function getBrokerGap(area: Area): number {
  return Math.round(
    ((area.broker_ask_psf - area.reg_avg_psf) / area.reg_avg_psf) * 100
  )
}