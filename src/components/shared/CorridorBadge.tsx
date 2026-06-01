interface CorridorBadgeProps {
  corridor: 'omr' | 'ecr'
}

const CORRIDORS = {
  omr: { bg: '#E6F1FB', text: '#185FA5', label: 'OMR corridor' },
  ecr: { bg: '#E1F5EE', text: '#0F6E56', label: 'ECR corridor' },
} as const

export default function CorridorBadge({ corridor }: CorridorBadgeProps) {
  const { bg, text, label } = CORRIDORS[corridor]

  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: bg,
        color: text,
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
