import type { Area, SignalType } from '@/lib/types'
import ScoreCircle from '@/components/shared/ScoreCircle'
import CorridorBadge from '@/components/shared/CorridorBadge'
import { getBrokerGap } from '@/lib/scoring'
import { getVerdict, SIGNAL_COLORS, FLOOD_SIGNAL } from '@/lib/constants'

interface AreaCardProps {
  area: Area
  rank: number
  onClick: (slug: string) => void
}

function toSignalType(value: string): SignalType {
  if (value === 'good') return 'good'
  if (value === 'danger') return 'danger'
  return 'warn'
}

function verdictBadgeDark(type: SignalType) {
  if (type === 'good') {
    return { bg: 'rgba(29,158,117,0.20)', color: '#5DCAA5' }
  }
  if (type === 'warn') {
    return { bg: 'rgba(186,117,23,0.15)', color: '#FAC775' }
  }
  return { bg: 'rgba(226,75,74,0.15)', color: '#F09595' }
}

export default function AreaCard({ area, rank, onClick }: AreaCardProps) {
  const gap = getBrokerGap(area)
  const verdict = getVerdict(area.overall_score)
  const verdictDark = verdictBadgeDark(verdict.type)

  const signals: { label: string; type: SignalType }[] = [
    { label: 'Flood', type: FLOOD_SIGNAL[area.flood_risk] },
    { label: 'Metro', type: toSignalType(area.metro_type) },
    { label: 'IT', type: toSignalType(area.it_type) },
    { label: 'Price', type: toSignalType(area.growth_type) },
  ]

  return (
    <div
      onClick={() => onClick(area.slug)}
      className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition-colors"
      style={{
        background: 'rgba(255,255,255,0.07)',
        border: '0.5px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
        e.currentTarget.style.borderColor = 'rgba(29,158,117,0.50)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
      }}
    >
      <div
        className="flex flex-shrink-0 items-center justify-center text-xs font-medium"
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: rank === 1 ? '#1D9E75' : 'rgba(255,255,255,0.10)',
          color: rank === 1 ? '#FFFFFF' : 'rgba(255,255,255,0.50)',
        }}
      >
        {rank}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-white">{area.name}</div>
        <div className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
          {area.corridor.toUpperCase()} · {area.distance_from_city} km · Broker premium: {gap}%
        </div>
        <div className="mt-1">
          <CorridorBadge corridor={area.corridor} />
        </div>
        <div className="mt-2 flex items-center gap-3">
          {signals.map((signal) => (
            <div key={signal.label} className="flex items-center gap-1">
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: SIGNAL_COLORS[signal.type].color,
                }}
              />
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {signal.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col items-center gap-1">
        <ScoreCircle size="sm" score={area.overall_score} />
        <span
          style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 999,
            backgroundColor: verdictDark.bg,
            color: verdictDark.color,
          }}
        >
          {verdict.label}
        </span>
      </div>
    </div>
  )
}
