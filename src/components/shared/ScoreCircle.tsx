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
  if (score >= 80) {
    return {
      border: '#1D9E75',
      bg: 'rgba(29,158,117,0.15)',
      text: '#5DCAA5',
    }
  }
  if (score >= 65) {
    return {
      border: '#639922',
      bg: 'rgba(99,153,34,0.15)',
      text: '#9FE1CB',
    }
  }
  if (score >= 50) {
    return {
      border: '#BA7517',
      bg: 'rgba(186,117,23,0.15)',
      text: '#FAC775',
    }
  }
  return {
    border: '#E24B4A',
    bg: 'rgba(226,75,74,0.15)',
    text: '#F09595',
  }
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
      <span
        style={{
          fontSize: labelFont,
          lineHeight: 1,
          color: 'rgba(255,255,255,0.40)',
        }}
      >
        /100
      </span>
    </div>
  )
}
