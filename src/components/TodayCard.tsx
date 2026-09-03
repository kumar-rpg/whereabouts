import Link from 'next/link'
import { ActivityBadge } from './ui/ActivityBadge'
import { formatDateRange, formatTime, getDayCount } from '@/lib/utils'
import type { Whereabout } from '@/lib/types'

export function TodayCard({ item }: { item: Whereabout }) {
  const staff = item.staff
  const initials = staff?.staff_name.split(' ').map(n => n[0]).join('').slice(0, 2) ?? '?'
  const dayCount = getDayCount(item.start_date, item.end_date)
  const isMultiDay = dayCount > 1

  return (
    <Link
      href={`/log/${item.id}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
          display: 'flex', flexDirection: 'column', gap: 12,
          transition: 'border-color 0.15s, box-shadow 0.15s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'var(--accent)'
          el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'var(--border)'
          el.style.boxShadow = 'none'
        }}
      >
        {/* Staff row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--accent-bg)', color: 'var(--accent-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-barlow, sans-serif)',
            fontSize: 14, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: 'var(--text-1)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {staff?.staff_name ?? item.staff_id}
            </div>
            <div style={{
              fontSize: 11.5, color: 'var(--text-3)',
              fontFamily: 'var(--font-jetbrains, monospace)',
            }}>
              {item.staff_id}{staff?.department ? ` · ${staff.department}` : ''}
            </div>
          </div>
        </div>

        {/* Activity badge */}
        <ActivityBadge type={item.activity_type} size="sm" />

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.35 }}>{item.location}</span>
        </div>

        {/* Date / time */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
            {formatDateRange(item.start_date, item.end_date)}
          </span>
          {isMultiDay ? (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
              background: 'var(--surface-alt)', color: 'var(--text-3)',
            }}>
              {dayCount}d
            </span>
          ) : !item.is_all_day && item.start_time ? (
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {formatTime(item.start_time)}{item.end_time ? ` – ${formatTime(item.end_time)}` : ''}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
