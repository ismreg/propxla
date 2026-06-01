interface ScoreCircleProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { circle: 48, score: 18, label: 10 },
  md: { circle: 64, score: 22, label: 11 },
  lg: { circle: 80, score: 28, label: 13 },
} as const

function getColors(score: number) {
  if (score >= 80) return { border: '#1D9E75', bg: '#E1F5EE', text: '#085041' }
  if (score >= 65) return { border: '#639922', bg: '#EAF3DE', text: '#3B6D11' }
  if (score >= 50) return { border: '#BA7517', bg: '#FAEEDA', text: '#633806' }
  return { border: '#E24B4A', bg: '#FCEBEB', text: '#791F1F' }
}

export default function ScoreCircle({ score, size = 'md' }: ScoreCircleProps) {
  const { circle, score: scoreFont, label: labelFont } = SIZES[size]
  const colors = getColors(score)

  return (
    <div
      style={{
        width: circle,
        height: circle,
        borderRadius: '50%',
        border: `2px solid ${colors.border}`,
        backgroundColor: colors.bg,
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: scoreFont, fontWeight: 700, lineHeight: 1 }}>
        {score}
      </span>
      <span style={{ fontSize: labelFont, opacity: 0.7, lineHeight: 1 }}>
        /100
      </span>
    </div>
  )
}
