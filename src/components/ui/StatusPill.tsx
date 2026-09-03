import type { WhereaboutStatus } from '@/lib/types'

const STATUS_CONFIG: Record<WhereaboutStatus, { label: string; bg: string; text: string }> = {
  upcoming:  { label: 'Upcoming',  bg: 'var(--s-upcoming-bg)',  text: 'var(--s-upcoming)' },
  ongoing:   { label: 'Out Now',   bg: 'var(--s-ongoing-bg)',   text: 'var(--s-ongoing)' },
  completed: { label: 'Completed', bg: 'var(--s-completed-bg)', text: 'var(--s-completed)' },
}

export function StatusPill({ status }: { status: WhereaboutStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: cfg.bg,
        color: cfg.text,
        padding: '3px 9px',
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {status === 'ongoing' && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--s-ongoing)', flexShrink: 0,
        }} />
      )}
      {cfg.label}
    </span>
  )
}
