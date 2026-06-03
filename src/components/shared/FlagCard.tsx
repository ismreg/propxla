interface FlagCardProps {
  type: 'danger' | 'warn' | 'good'
  icon: string
  title: string
  body: string
}

const TYPES = {
  danger: {
    bg: 'rgba(226,75,74,0.10)',
    border: 'rgba(226,75,74,0.25)',
    title: '#F09595',
    body: 'rgba(240,149,149,0.70)',
    iconBg: 'rgba(226,75,74,0.15)',
  },
  warn: {
    bg: 'rgba(186,117,23,0.10)',
    border: 'rgba(186,117,23,0.25)',
    title: '#FAC775',
    body: 'rgba(250,199,117,0.70)',
    iconBg: 'rgba(186,117,23,0.15)',
  },
  good: {
    bg: 'rgba(29,158,117,0.10)',
    border: 'rgba(29,158,117,0.25)',
    title: '#5DCAA5',
    body: 'rgba(93,202,165,0.70)',
    iconBg: 'rgba(29,158,117,0.15)',
  },
} as const

export default function FlagCard({ type, icon, title, body }: FlagCardProps) {
  const colors = TYPES[type]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        border: `0.5px solid ${colors.border}`,
        backgroundColor: colors.bg,
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 15, color: colors.title }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: colors.title }}>
          {title}
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.5, color: colors.body }}>
          {body}
        </div>
      </div>
    </div>
  )
}
