import Link from 'next/link'
import type { Area, Intent, SignalType } from '@/lib/types'
import ScoreCircle from '@/components/shared/ScoreCircle'
import CorridorBadge from '@/components/shared/CorridorBadge'
import { computeScore, getBrokerGap } from '@/lib/scoring'
import { getVerdict, SIGNAL_COLORS, FLOOD_SIGNAL } from '@/lib/constants'

interface CompareCardProps {
  area: Area
  intent: string
  isWinner: boolean
}

function scoreColor(score: number): string {
  if (score >= 80) return '#1D9E75'
  if (score >= 65) return '#639922'
  if (score >= 50) return '#BA7517'
  return '#E24B4A'
}

function toSignalType(value: string): SignalType {
  if (value === 'good') return 'good'
  if (value === 'danger') return 'danger'
  return 'warn'
}

function truncateText(text: string, max = 20): string {
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}

function SubScoreRow({ label, score }: { label: string; score: number }) {
  const color = scoreColor(score)
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {label}
        </span>
        <span className="text-sm font-semibold" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div
        className="mt-1 rounded"
        style={{ height: 3, background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="h-full rounded"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function SignalRow({
  name,
  type,
  value,
}: {
  name: string
  type: SignalType
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          style={{
            display: 'inline-block',
            width: 7,
            height: 7,
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: SIGNAL_COLORS[type].color,
          }}
        />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {name}
        </span>
      </div>
      <span
        className="max-w-[55%] truncate text-right text-xs capitalize"
        style={{ color: SIGNAL_COLORS[type].color }}
      >
        {value}
      </span>
    </div>
  )
}

export default function CompareCard({ area, intent, isWinner }: CompareCardProps) {
  const result = computeScore(area, intent as Intent)
  const gap = getBrokerGap(area)
  const verdict = getVerdict(result.overall)
  const brokerGapType: SignalType = gap > 20 ? 'danger' : gap > 10 ? 'warn' : 'good'
  const brokerValueColor = scoreColor(gap > 20 ? 40 : gap > 10 ? 55 : 75)

  const signals: { name: string; type: SignalType; value: string }[] = [
    {
      name: 'Flood',
      type: FLOOD_SIGNAL[area.flood_risk],
      value: area.flood_risk.replace('_', ' '),
    },
    {
      name: 'Metro',
      type: toSignalType(area.metro_type),
      value: truncateText(area.metro_proximity),
    },
    {
      name: 'IT',
      type: toSignalType(area.it_type),
      value: truncateText(area.it_proximity),
    },
    {
      name: 'Broker gap',
      type: brokerGapType,
      value: `${gap}% above registered`,
    },
  ]

  return (
    <div
      className="relative flex flex-col"
      style={{
        borderRadius: 20,
        padding: 16,
        background: isWinner ? 'rgba(29,158,117,0.10)' : 'rgba(255,255,255,0.06)',
        border: isWinner
          ? '1.5px solid rgba(29,158,117,0.40)'
          : '0.5px solid rgba(255,255,255,0.10)',
      }}
    >
      {isWinner && (
        <span
          className="absolute right-3 top-3 font-semibold text-white"
          style={{
            fontSize: 10,
            background: '#1D9E75',
            padding: '2px 8px',
            borderRadius: 999,
          }}
        >
          Better pick
        </span>
      )}

      <div>
        <h2 className="text-base font-bold text-white">{area.name}</h2>
        <div className="mt-1">
          <CorridorBadge corridor={area.corridor} />
        </div>
        <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
          {area.distance_from_city} km from city
        </p>
      </div>

      <div className="mt-3 flex flex-col items-center">
        <ScoreCircle size="lg" score={result.overall} />
        <span
          className="mt-1 text-xs"
          style={{ color: SIGNAL_COLORS[verdict.type].color }}
        >
          {verdict.label}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <SubScoreRow label="Price truth" score={result.price} />
        <SubScoreRow label="Risk score" score={result.risk} />
        <SubScoreRow label="Intent fit" score={result.lifestyle} />
      </div>

      <div
        className="mt-4 flex flex-col gap-2 border-t pt-3"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="mb-2 text-[10px] uppercase tracking-wide"
          style={{ color: 'rgba(255,255,255,0.30)' }}
        >
          Key signals
        </div>
        {signals.map((signal) => (
          <SignalRow
            key={signal.name}
            name={signal.name}
            type={signal.type}
            value={signal.value}
          />
        ))}
      </div>

      <div
        className="mt-3 border-t pt-3"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Registered avg
          </span>
          <span className="text-sm font-semibold text-white">
            ₹{area.reg_avg_psf.toLocaleString()}/sqft
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Broker asking
          </span>
          <span className="text-sm font-semibold" style={{ color: brokerValueColor }}>
            ₹{area.broker_ask_psf.toLocaleString()}/sqft
          </span>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href={`/report/${area.slug}?intent=${intent}`}
          className="block w-full rounded-xl py-2.5 text-center text-[13px] font-medium transition-opacity hover:opacity-90"
          style={
            isWinner
              ? { background: '#1D9E75', color: 'white' }
              : {
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.60)',
                }
          }
        >
          View full report →
        </Link>
      </div>
    </div>
  )
}
