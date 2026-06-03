interface CorridorBadgeProps {
  corridor: 'omr' | 'ecr'
}

const CORRIDORS = {
  omr: {
    bg: 'rgba(24,95,165,0.20)',
    text: '#85B7EB',
    border: 'rgba(24,95,165,0.35)',
    label: 'OMR corridor',
  },
  ecr: {
    bg: 'rgba(29,158,117,0.20)',
    text: '#5DCAA5',
    border: 'rgba(29,158,117,0.35)',
    label: 'ECR corridor',
  },
} as const

export default function CorridorBadge({ corridor }: CorridorBadgeProps) {
  const { bg, text, border, label } = CORRIDORS[corridor]

  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: bg,
        color: text,
        border: `0.5px solid ${border}`,
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 999,
      }}
    >
      {label}
    </span>
  )
}
