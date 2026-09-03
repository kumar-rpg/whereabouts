'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { db } from '@/lib/supabase'
import { TodayCard } from '@/components/TodayCard'
import { computeStatus, formatDateRange, todayISO } from '@/lib/utils'
import { ActivityBadge } from '@/components/ui/ActivityBadge'
import type { Whereabout } from '@/lib/types'
import { format, addDays, parseISO } from 'date-fns'

async function fetchDashboard(): Promise<Whereabout[]> {
  const { data, error } = await db
    .from('whereabouts')
    .select('*, staff(*)')
    .order('start_date', { ascending: true })
  if (error) throw error
  return data ?? []
}

export default function DashboardPage() {
  const { data, isLoading } = useSWR('dashboard', fetchDashboard, { refreshInterval: 60000 })
  const today = todayISO()
  const weekEnd = format(addDays(new Date(), 7), 'yyyy-MM-dd')

  const outToday = useMemo(
    () => (data ?? []).filter(w => computeStatus(w.start_date, w.end_date) === 'ongoing'),
    [data]
  )

  const upcoming = useMemo(
    () => (data ?? [])
      .filter(w => w.start_date > today && w.start_date <= weekEnd)
      .slice(0, 8),
    [data, today, weekEnd]
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {format(new Date(), 'EEEE, d MMMM')}
          </h1>
          <p className="page-subtitle">
            {isLoading ? 'Loading…' : `${outToday.length} ${outToday.length === 1 ? 'person' : 'people'} currently away`}
          </p>
        </div>
        <Link href="/log/new" className="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Log Activity
        </Link>
      </div>

      {/* Out Today */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{
          fontFamily: 'var(--font-barlow, sans-serif)',
          fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14,
        }}>
          Out Today
        </h2>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 160, borderRadius: 12,
                background: 'var(--surface)', border: '1px solid var(--border)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : outToday.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title">Everyone's in today</div>
              <div className="empty-state-text">No staff are currently logged as away.</div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}>
            {outToday.map(w => <TodayCard key={w.id} item={w} />)}
          </div>
        )}
      </section>

      {/* Upcoming this week */}
      <section>
        <h2 style={{
          fontFamily: 'var(--font-barlow, sans-serif)',
          fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14,
        }}>
          Upcoming · Next 7 Days
        </h2>

        {!isLoading && upcoming.length === 0 ? (
          <div className="card">
            <div className="empty-state" style={{ padding: '32px 24px' }}>
              <div className="empty-state-title">Nothing scheduled</div>
              <div className="empty-state-text">No activities in the next 7 days.</div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Activity</th>
                    <th>Location</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(w => (
                    <tr key={w.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/log/${w.id}`}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-1)' }}>
                          {w.staff?.staff_name ?? w.staff_id}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: 'var(--font-jetbrains, monospace)' }}>
                          {w.staff_id}
                        </div>
                      </td>
                      <td><ActivityBadge type={w.activity_type} size="sm" /></td>
                      <td style={{ color: 'var(--text-1)' }}>{w.location}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-2)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        {formatDateRange(w.start_date, w.end_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <Link href="/log" style={{ fontSize: 13, color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 500 }}>
              View all activities →
            </Link>
          </div>
        )}
      </section>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  )
}
