import type { Area, Flag, FlagType, Intent } from '@/lib/types'
import ScoreCircle from '@/components/shared/ScoreCircle'
import FlagCard from '@/components/shared/FlagCard'
import ShareButtons from '@/components/shared/ShareButtons'
import CorridorBadge from '@/components/shared/CorridorBadge'
import { computeScore, getBrokerGap } from '@/lib/scoring'
import { getVerdict, SIGNAL_COLORS, INTENTS } from '@/lib/constants'

interface PropertyReportProps {
  area: Area
  intent: string
  address: string
}

function scoreColor(score: number): string {
  if (score >= 80) return '#085041'
  if (score >= 65) return '#3B6D11'
  if (score >= 50) return '#633806'
  return '#791F1F'
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
      body: `Area average: ₹${area.reg_avg_psf.toLocaleString()}/sqft registered. Broker asking ₹${area.broker_ask_psf.toLocaleString()}/sqft. Cross-check on Zapkey before negotiating.`,
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

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-base font-medium">{address}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {area.name} · {INTENTS[intent as Intent]?.label ?? intent}
            </div>
            <div className="mt-1">
              <CorridorBadge corridor={area.corridor} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <ScoreCircle size="lg" score={result.overall} />
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
      </div>

      <div className="grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-400">{metric.label}</div>
            <div
              className="text-lg font-semibold"
              style={{ color: scoreColor(metric.value) }}
            >
              {metric.value}
              <span className="text-xs font-normal text-gray-400">/100</span>
            </div>
            <div className="text-xs text-gray-400">{metric.sub}</div>
          </div>
        ))}
      </div>

      <div
        className="text-xs p-2 rounded-lg flex items-center gap-2"
        style={{ backgroundColor: '#E1F5EE', color: '#085041' }}
      >
        <i className="ti ti-sparkles" />
        <span>{result.boost}</span>
      </div>
      <div
        className="text-xs p-2 rounded-lg flex items-center gap-2"
        style={{ backgroundColor: '#FAEEDA', color: '#854F0B' }}
      >
        <i className="ti ti-alert-triangle" />
        <span>{result.warning}</span>
      </div>

      <div className="flex flex-col gap-2">
        {flags.map((flag, index) => (
          <FlagCard
            key={index}
            type={flag.type}
            icon={flag.icon}
            title={flag.title}
            body={flag.body}
          />
        ))}
      </div>

      <ShareButtons url={shareUrl} message={shareMessage} />
    </div>
  )
}
