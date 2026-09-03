import { ACTIVITY_LABELS, ACTIVITY_COLORS } from '@/lib/utils'
import type { ActivityType } from '@/lib/types'

interface ActivityBadgeProps {
  type: ActivityType
  size?: 'sm' | 'md'
}

export function ActivityBadge({ type, size = 'md' }: ActivityBadgeProps) {
  const colors = ACTIVITY_COLORS[type]
  const label = ACTIVITY_LABELS[type]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? 5 : 6,
        background: colors.bg,
        color: colors.text,
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: 6,
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: size === 'sm' ? 6 : 7,
          height: size === 'sm' ? 6 : 7,
          borderRadius: '50%',
          background: colors.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  )
}
