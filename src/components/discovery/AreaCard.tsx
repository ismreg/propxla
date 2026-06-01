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

export default function AreaCard({ area, rank, onClick }: AreaCardProps) {
  const gap = getBrokerGap(area)
  const verdict = getVerdict(area.overall_score)
  const verdictColors = SIGNAL_COLORS[verdict.type]

  const signals: { label: string; type: SignalType }[] = [
    { label: 'Flood', type: FLOOD_SIGNAL[area.flood_risk] },
    { label: 'Metro', type: toSignalType(area.metro_type) },
    { label: 'IT', type: toSignalType(area.it_type) },
    { label: 'Price', type: toSignalType(area.growth_type) },
  ]

  return (
    <div
      onClick={() => onClick(area.slug)}
      className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 cursor-pointer hover:border-gray-300 transition-colors"
    >
      <div
        className="flex items-center justify-center flex-shrink-0 bg-gray-100 text-xs font-medium"
        style={{ width: 22, height: 22, borderRadius: '50%' }}
      >
        {rank}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">{area.name}</div>
        <div className="text-xs text-gray-400 mt-0.5">
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
                  backgroundColor: SIGNAL_COLORS[signal.type].bg,
                }}
              />
              <span className="text-[10px] text-gray-400">{signal.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <ScoreCircle size="sm" score={area.overall_score} />
        <span
          style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 999,
            backgroundColor: verdictColors.bg,
            color: verdictColors.color,
          }}
        >
          {verdict.label}
        </span>
      </div>
    </div>
  )
}
