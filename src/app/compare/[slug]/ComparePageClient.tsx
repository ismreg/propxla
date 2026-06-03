'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import CompareCard from '@/components/shared/CompareCard'
import { computeScore } from '@/lib/scoring'
import { INTENTS } from '@/lib/constants'
import type { Area, Intent } from '@/lib/types'

interface ComparePageClientProps {
  area1: Area
  area2: Area
  intent: Intent
}

const INTENT_KEYS = Object.keys(INTENTS) as (keyof typeof INTENTS)[]

export default function ComparePageClient({
  area1,
  area2,
  intent,
}: ComparePageClientProps) {
  const router = useRouter()
  const [activeIntent, setActiveIntent] = useState<Intent>(intent)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setActiveIntent(intent)
  }, [intent])

  const score1 = computeScore(area1, activeIntent).overall
  const score2 = computeScore(area2, activeIntent).overall
  const winner = score1 >= score2 ? 'area1' : 'area2'

  const winnerArea = winner === 'area1' ? area1 : area2
  const winnerScore = winner === 'area1' ? score1 : score2
  const loserScore = winner === 'area1' ? score2 : score1

  function buildShareMessage() {
    return `Compared ${area1.name} vs ${area2.name} for ${activeIntent} on PropXLA — ${winnerArea.name} wins with ${winnerScore}/100`
  }

  function handleShare() {
    const url = window.location.href
    const message = `${buildShareMessage()} ${url}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleIntentChange(newIntent: Intent) {
    setActiveIntent(newIntent)
    router.replace(`/compare/${area1.slug}-vs-${area2.slug}?intent=${newIntent}`)
  }

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

  const topBarCenter = (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>
        {area1.name} vs {area2.name}
      </div>
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
        {activeIntent.charAt(0).toUpperCase() + activeIntent.slice(1)}
      </div>
    </div>
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
        <div className="flex flex-wrap gap-2">
          {INTENT_KEYS.map((key) => {
            const isActive = key === activeIntent
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleIntentChange(key)}
                className="cursor-pointer rounded-full px-3 py-1.5 text-xs transition-opacity hover:opacity-90"
                style={
                  isActive
                    ? { background: '#1D9E75', color: 'white', fontWeight: 500 }
                    : {
                        background: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.45)',
                      }
                }
              >
                {INTENTS[key].label}
              </button>
            )
          })}
        </div>

        <div
          className="my-4"
          style={{
            background: 'rgba(29,158,117,0.12)',
            border: '0.5px solid rgba(29,158,117,0.30)',
            borderRadius: 16,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <i
            className="ti ti-trophy"
            style={{
              fontSize: 28,
              color: '#FAC775',
              display: 'block',
              marginBottom: 8,
            }}
            aria-hidden="true"
          />
          <div className="text-lg font-bold text-white">
            {winnerArea.name} is the better pick
          </div>
          <p className="mt-1 text-[13px]" style={{ color: 'rgba(255,255,255,0.50)' }}>
            for {activeIntent} · scored {winnerScore}/100 vs {loserScore}/100
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 items-start gap-3">
          <CompareCard
            area={area1}
            intent={activeIntent}
            isWinner={winner === 'area1'}
          />
          <CompareCard
            area={area2}
            intent={activeIntent}
            isWinner={winner === 'area2'}
          />
        </div>

        <div className="glass mt-6 rounded-2xl p-4 text-center">
          <p className="mb-3 text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Share this comparison
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#25D366', border: 'none' }}
            >
              <i className="ti ti-brand-whatsapp" />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '0.5px solid rgba(255,255,255,0.15)',
              }}
            >
              <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`} />
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
