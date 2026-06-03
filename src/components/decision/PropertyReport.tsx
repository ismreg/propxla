import type { Area, Flag, FlagType, Intent } from '@/lib/types'
import ScoreCircle from '@/components/shared/ScoreCircle'
import ShareButtons from '@/components/shared/ShareButtons'
import CorridorBadge from '@/components/shared/CorridorBadge'
import { computeScore, getBrokerGap } from '@/lib/scoring'
import { getVerdict, SIGNAL_COLORS, INTENTS } from '@/lib/constants'

interface PropertyReportProps {
  area: Area
  intent: string
  address: string
}

const FLAG_STYLES = {
  danger: { bg: '#FCEBEB', border: '#F7C1C1', title: '#791F1F', iconBg: '#FCEBEB', pill: '#791F1F', pillBg: '#FCEBEB', pillLabel: 'High risk' },
  warn: { bg: '#FAEEDA', border: '#FAC775', title: '#633806', iconBg: '#FAEEDA', pill: '#633806', pillBg: '#FAEEDA', pillLabel: 'Check this' },
  good: { bg: '#EAF3DE', border: '#C0DD97', title: '#27500A', iconBg: '#EAF3DE', pill: '#3B6D11', pillBg: '#EAF3DE', pillLabel: 'Positive' },
} as const

function scoreColor(score: number): string {
  if (score >= 80) return '#085041'
  if (score >= 65) return '#3B6D11'
  if (score >= 50) return '#633806'
  return '#791F1F'
}

function progressBarColor(score: number): string {
  if (score >= 80) return '#1D9E75'
  if (score >= 65) return '#639922'
  if (score >= 50) return '#BA7517'
  return '#E24B4A'
}

export default function PropertyReport({ area, intent, address }: PropertyReportProps) {
  const result = computeScore(area, intent as Intent)
  const gap = getBrokerGap(area)
  const verdict = getVerdict(result.overall)
  const verdictColors = SIGNAL_COLORS[verdict.type]

  const flags: Flag[] = [
    {
      type: (area.flood_risk === 'low'
          ? 'good'
          : area.flood_risk === 'moderate'
          ? 'warn'
          : 'danger') as FlagType,
      icon: 'ti-droplet',
      title: `Flood risk: ${area.flood_risk.replace('_', ' ')}`,
      body:
        area.flood_risk === 'low'
          ? 'Low flood risk. No major inundation history for this area.'
          : area.flood_risk === 'moderate'
          ? 'Moderate flood risk. Verify plot elevation and drainage before buying.'
          : 'High flood risk. Confirm plot elevation above 4m MSL before any payment.',
    },
    {
      type: 'danger' as FlagType,
      icon: 'ti-ripple',
      title: 'CRZ boundary — verify urgently',
      body:
        'Plot may be within 500m of shoreline. CZMA regulations may prohibit permanent construction. Check with TNCZMA before payment.',
    },
    {
      type: (gap <= 15 ? 'good' : gap <= 30 ? 'warn' : 'danger') as FlagType,
      icon: 'ti-currency-rupee',
      title: `Broker quoting ${gap}% above registered prices`,
      body: `Registered avg ₹${area.reg_avg_psf.toLocaleString()}/sqft · Broker asking ₹${area.broker_ask_psf.toLocaleString()}/sqft · Verify on Zapkey`,
    },
    {
      type: (area.growth_type === 'good' ? 'good' : 'warn') as FlagType,
      icon: 'ti-trending-up',
      title: 'Price growth signal',
      body: area.growth_label,
    },
  ].filter((flag) => flag.title !== 'CRZ boundary — verify urgently' || area.czr_risk)

  const shareMessage = `Checked ${area.name} on PropXLA — scored ${result.overall}/100 for ${intent}. Broker is ${gap}% above registered prices.`
  const shareUrl = `https://propxla.com/report/${area.slug}`

  const metrics = [
    { label: 'Price truth', value: result.price, sub: 'vs area avg' },
    { label: 'Risk score', value: result.risk, sub: 'flood + CRZ' },
    { label: 'Intent fit', value: result.lifestyle, sub: `for ${intent}` },
  ]

  const trendPoints = area.price_trend
  const chartWidth = 280
  const chartHeight = 60
  const minPsf = Math.min(...trendPoints.map((p) => p.psf))
  const maxPsf = Math.max(...trendPoints.map((p) => p.psf))
  const xStep = chartWidth / Math.max(trendPoints.length - 1, 1)
  const yScale = (psf: number) => {
    if (maxPsf === minPsf) return chartHeight / 2
    return chartHeight - ((psf - minPsf) / (maxPsf - minPsf)) * (chartHeight - 10) - 5
  }
  const polylinePoints = trendPoints
    .map((p, i) => `${i * xStep},${yScale(p.psf)}`)
    .join(' ')
  const firstTrend = trendPoints[0]
  const lastTrend = trendPoints[trendPoints.length - 1]
  const growthPct = Math.round(
    ((lastTrend.psf - firstTrend.psf) / firstTrend.psf) * 100
  )
  const yearSpan = trendPoints.length - 1

  const verdictSummary = () => {
    if (result.overall >= 80) {
      return `Strong ${intent} signal — this corridor suits your goal well`
    }
    if (result.overall >= 65) {
      return `Solid pick for ${intent} — key risks flagged below`
    }
    if (result.overall >= 50) {
      return `Moderate fit for ${intent} — verify all risks before paying`
    }
    return `High risk for ${intent} — review every flag before deciding`
  }

  return (
    <div className="flex flex-col">
      {/* Section 1 — Hero */}
      <div className="mb-3 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">{address}</div>
            <div className="mt-0.5 text-xs text-gray-400">
              {area.name} · {INTENTS[intent as Intent]?.label ?? intent}
            </div>
            <div className="mt-2">
              <CorridorBadge corridor={area.corridor} />
            </div>
          </div>
          <div className="flex flex-shrink-0 flex-col items-center gap-1">
            <ScoreCircle size="lg" score={result.overall} />
            <span
              className="text-center"
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
        <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
          {verdictSummary()}
        </p>
      </div>

      {/* Section 2 — Metrics */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl bg-gray-50 p-3">
            <div className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">
              {metric.label}
            </div>
            <div className="text-xl font-bold" style={{ color: scoreColor(metric.value) }}>
              {metric.value}
              <span className="text-xs font-normal text-gray-400">/100</span>
            </div>
            <div className="mt-2 h-[3px] w-full rounded-full bg-gray-200">
              <div
                className="h-[3px] rounded-full transition-all duration-500"
                style={{
                  width: `${metric.value}%`,
                  backgroundColor: progressBarColor(metric.value),
                }}
              />
            </div>
            <div className="mt-1 text-[10px] text-gray-400">{metric.sub}</div>
          </div>
        ))}
      </div>

      {/* Section 3 — Insight pills */}
      <div className="mb-3 flex flex-col gap-2">
        <div
          className="flex items-start gap-2 rounded-xl p-2.5"
          style={{ backgroundColor: '#E1F5EE' }}
        >
          <div
            className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
            style={{ color: '#0F6E56' }}
          >
            <i className="ti ti-sparkles" style={{ fontSize: 12 }} />
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#085041' }}>
            {result.boost}
          </p>
        </div>
        <div
          className="flex items-start gap-2 rounded-xl p-2.5"
          style={{ backgroundColor: '#FFF8E7' }}
        >
          <div
            className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center"
            style={{ color: '#854F0B' }}
          >
            <i className="ti ti-alert-triangle" style={{ fontSize: 12 }} />
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#633806' }}>
            {result.warning}
          </p>
        </div>
      </div>

      {/* Section 4 — Flags */}
      <div className="mb-4 flex flex-col gap-2">
        {flags.map((flag, index) => {
          const style = FLAG_STYLES[flag.type]
          return (
            <div
              key={index}
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: style.border }}
            >
              <div className="flex items-center gap-3 p-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: style.iconBg }}
                >
                  <i
                    className={`ti ${flag.icon}`}
                    style={{ fontSize: 18, color: style.title }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-semibold"
                    style={{ color: style.title }}
                  >
                    {flag.title}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {flag.body}
                  </p>
                </div>
                <span
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    color: style.pill,
                    backgroundColor: style.pillBg,
                  }}
                >
                  {style.pillLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Section 5 — Price trend */}
      <div className="mb-3 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Price trend</span>
          <span className="text-xs text-gray-400">
            {firstTrend.year} → {lastTrend.year}
          </span>
        </div>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: 60 }}
        >
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#1D9E75"
            strokeWidth={2}
          />
          {trendPoints.map((p, i) => (
            <circle
              key={p.year}
              cx={i * xStep}
              cy={yScale(p.psf)}
              r={3}
              fill="#1D9E75"
            />
          ))}
        </svg>
        <div className="mt-1 flex justify-between px-0">
          {trendPoints.map((p, i) => (
            <span
              key={p.year}
              className="text-[9px] text-gray-400"
              style={{ flex: 1, textAlign: i === 0 ? 'left' : i === trendPoints.length - 1 ? 'right' : 'center' }}
            >
              {p.year}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            ₹{firstTrend.psf.toLocaleString()}/sqft
          </span>
          <span className="text-sm font-semibold text-[#1D9E75]">
            ₹{lastTrend.psf.toLocaleString()}/sqft
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium text-[#0F6E56]"
            style={{ backgroundColor: '#E1F5EE' }}
          >
            {growthPct >= 0 ? '+' : ''}
            {growthPct}% in {yearSpan} years
          </span>
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Recent registered sales
          </div>
          {area.transactions.slice(0, 3).map((transaction) => (
            <div
              key={`${transaction.unit}-${transaction.date}`}
              className="flex items-center justify-between border-b border-gray-50 py-1.5 last:border-0"
            >
              <div>
                <div className="text-xs text-gray-600">{transaction.unit}</div>
                <div className="mt-0.5 text-[10px] text-gray-400">{transaction.date}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">{transaction.total}</div>
                <div className="mt-0.5 text-[10px] text-gray-400">
                  ₹{transaction.psf}/sqft
                </div>
              </div>
            </div>
          ))}
          <p className="mt-2 text-right text-[10px] text-gray-300">
            Source: Registered sale data · TNREGINET
          </p>
        </div>
      </div>

      {/* Section 6 — Share */}
      <ShareButtons url={shareUrl} message={shareMessage} />
    </div>
  )
}
