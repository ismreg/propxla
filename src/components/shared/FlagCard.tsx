interface FlagCardProps {
  type: 'danger' | 'warn' | 'good'
  icon: string
  title: string
  body: string
}

const TYPES = {
  danger: { bg: '#FCEBEB', border: '#F7C1C1', title: '#791F1F', body: '#A32D2D' },
  warn:   { bg: '#FAEEDA', border: '#FAC775', title: '#633806', body: '#854F0B' },
  good:   { bg: '#EAF3DE', border: '#C0DD97', title: '#27500A', body: '#3B6D11' },
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
