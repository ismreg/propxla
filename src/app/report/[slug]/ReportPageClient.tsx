'use client'

import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import PropertyReport from '@/components/decision/PropertyReport'
import { computeScore, getBrokerGap } from '@/lib/scoring'
import type { Area, Intent } from '@/lib/types'

interface ReportPageClientProps {
  area: Area
  intent: Intent
}

export default function ReportPageClient({ area, intent }: ReportPageClientProps) {
  const router = useRouter()
  const result = computeScore(area, intent)
  const gap = getBrokerGap(area)

  function handleShare() {
    const url = window.location.href
    const message = `Checked ${area.name} on PropXLA — scored ${result.overall}/100 for ${intent}. Broker is ${gap}% above registered prices.`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const topBarCenter = (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{area.name}</div>
      <div
        style={{
          fontSize: 10,
          background: 'rgba(29,158,117,0.20)',
          color: '#5DCAA5',
          padding: '1px 8px',
          borderRadius: 999,
          display: 'inline-block',
          marginTop: 2,
        }}
      >
        {intent.charAt(0).toUpperCase() + intent.slice(1)}
      </div>
    </div>
  )

  const topBarLeft = (
    <button
      type="button"
      onClick={() => router.back()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        color: 'rgba(255,255,255,0.60)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
      Back
    </button>
  )

  const topBarRight = (
    <button
      type="button"
      onClick={handleShare}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#25D366',
        color: 'white',
        fontSize: 12,
        fontWeight: 600,
        padding: '7px 14px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <i className="ti ti-brand-whatsapp" style={{ fontSize: 14 }} />
      Share
    </button>
  )

  return (
    <AppShell topBarLeft={topBarLeft} topBarCenter={topBarCenter} topBarRight={topBarRight}>
      <div style={{ paddingTop: 16, paddingBottom: 80 }}>
        <PropertyReport area={area} intent={intent} address={area.name} />
      </div>
    </AppShell>
  )
}
