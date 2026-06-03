'use client'

import { useRouter } from 'next/navigation'
import PropertyReport from '@/components/decision/PropertyReport'
import { INTENTS } from '@/lib/constants'
import { computeScore, getBrokerGap } from '@/lib/scoring'
import type { Area, Intent } from '@/lib/types'

interface ReportPageClientProps {
  area: Area
  intent: Intent
}

export default function ReportPageClient({ area, intent }: ReportPageClientProps) {
  const router = useRouter()
  const intentLabel = INTENTS[intent]?.label ?? intent
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

  return (
    <div className="relative z-10 min-h-screen">
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />

      <header
        className="sticky top-0 z-10 flex items-center justify-between gap-2"
        style={{
          background: 'rgba(15,36,25,0.90)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '0.5px solid rgba(255,255,255,0.10)',
          padding: '12px 16px',
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex flex-shrink-0 items-center gap-2 text-sm transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.60)' }}
        >
          <i className="ti ti-arrow-left" />
          Back
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2">
          <span className="truncate text-sm font-semibold text-white">{area.name}</span>
          <span
            className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px]"
            style={{
              background: 'rgba(29,158,117,0.20)',
              color: '#5DCAA5',
            }}
          >
            {intentLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#25D366' }}
        >
          <i className="ti ti-brand-whatsapp" style={{ fontSize: 14 }} />
          Share
        </button>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-20 pt-4 md:max-w-3xl md:px-8">
        <PropertyReport area={area} intent={intent} address={area.name} />
      </div>
    </div>
  )
}
