'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { db } from '@/lib/supabase'
import { ActivityBadge } from './ui/ActivityBadge'
import { StatusPill } from './ui/StatusPill'
import { computeStatus, formatDateRange, getDayCount, ACTIVITY_LABELS } from '@/lib/utils'
import { getSession } from '@/lib/auth'
import type { ActivityType, Whereabout } from '@/lib/types'

const ACTIVITY_TYPES: { value: ActivityType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'offsite_training', label: 'Offsite Training' },
  { value: 'certification', label: 'Certification' },
  { value: 'vendor_meeting', label: 'Vendor Meeting' },
  { value: 'customer_meeting', label: 'Customer Meeting' },
  { value: 'vendor_event', label: 'Vendor Event' },
]

async function fetchWhereabouts(): Promise<Whereabout[]> {
  const { data, error } = await db
    .from('whereabouts')
    .select('*, staff(*)')
    .order('start_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

interface WhereaboutsTableProps {
  staffId?: string
}

export function WhereaboutsTable({ staffId }: WhereaboutsTableProps) {
  const { data, isLoading, error } = useSWR('whereabouts-table', fetchWhereabouts)
  const [search, setSearch] = useState('')
  const [sessionStaffId, setSessionStaffId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(true)

  useEffect(() => {
    const s = getSession()
    if (s) {
      setIsAdmin(s.role === 'Admin')
      setSessionStaffId(s.staff_id)
    }
  }, [])
  const [typeFilter, setTypeFilter] = useState<ActivityType | ''>('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all')

  const effectiveStaffId = staffId ?? (!isAdmin && sessionStaffId ? sessionStaffId : undefined)

  const filtered = useMemo(() => {
    if (!data) return []
    return data
      .filter(w => !effectiveStaffId || w.staff_id === effectiveStaffId)
      .filter(w => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          w.staff_id.toLowerCase().includes(q) ||
          (w.staff?.staff_name ?? '').toLowerCase().includes(q) ||
          w.location.toLowerCase().includes(q)
        )
      })
      .filter(w => !typeFilter || w.activity_type === typeFilter)
      .filter(w => {
        if (statusFilter === 'all') return true
        return computeStatus(w.start_date, w.end_date) === statusFilter
      })
  }, [data, search, typeFilter, statusFilter, effectiveStaffId])

  if (isLoading) return (
    <div className="card">
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
        Loading activities…
      </div>
    </div>
  )

  if (error) return (
    <div className="card">
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--danger)', fontSize: 14 }}>
        Failed to load. Check your Supabase connection.
      </div>
    </div>
  )

  return (
    <div>
      {/* Filters */}
      {!effectiveStaffId && (
        <div className="filter-bar">
          <input
            className="input"
            placeholder="Search name, ID, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as ActivityType | '')}
          >
            {ACTIVITY_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            className="select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Out Now</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No activities found</div>
            <div className="empty-state-text">
              {search || typeFilter || statusFilter !== 'all'
                ? 'Try adjusting the filters.'
                : 'Log your first activity to get started.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {!effectiveStaffId && <th>Staff</th>}
                  <th>Activity</th>
                  <th>Location</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(w => {
                  const status = computeStatus(w.start_date, w.end_date)
                  const days = getDayCount(w.start_date, w.end_date)
                  return (
                    <tr key={w.id}>
                      {!effectiveStaffId && (
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-1)', fontSize: 14 }}>
                            {w.staff?.staff_name ?? w.staff_id}
                          </div>
                          <div style={{
                            fontSize: 11.5, color: 'var(--text-3)',
                            fontFamily: 'var(--font-jetbrains, monospace)',
                            fontVariantNumeric: 'tabular-nums',
                          }}>
                            {w.staff_id}
                          </div>
                        </td>
                      )}
                      <td><ActivityBadge type={w.activity_type} size="sm" /></td>
                      <td style={{ color: 'var(--text-1)', maxWidth: 180 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {w.location}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
                        {formatDateRange(w.start_date, w.end_date)}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                        {days === 1 ? (w.is_all_day ? 'All day' : '1 day') : `${days} days`}
                      </td>
                      <td><StatusPill status={status} /></td>
                      <td>
                        <Link
                          href={`/log/${w.id}`}
                          style={{
                            fontSize: 13, color: 'var(--accent-text)',
                            textDecoration: 'none', fontWeight: 500,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 10, textAlign: 'right' }}>
          {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
        </p>
      )}
    </div>
  )
}
