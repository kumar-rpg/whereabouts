'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { db } from '@/lib/supabase'
import { ActivityBadge } from '@/components/ui/ActivityBadge'
import { StatusPill } from '@/components/ui/StatusPill'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ActivityForm } from '@/components/ActivityForm'
import { computeStatus, formatDateRange, formatTime, getDayCount } from '@/lib/utils'
import type { Whereabout } from '@/lib/types'

async function fetchActivity(id: string): Promise<Whereabout | null> {
  const { data } = await db
    .from('whereabouts')
    .select('*, staff(*)')
    .eq('id', id)
    .single()
  return data
}

export default function ActivityDetailPage({ params }: PageProps<'/log/[id]'>) {
  const { id } = use(params)
  const router = useRouter()
  const { data, isLoading, error } = useSWR(`activity-${id}`, () => fetchActivity(id))
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await db.from('whereabouts').delete().eq('id', id)
    router.push('/log')
    router.refresh()
  }

  if (isLoading) return (
    <div className="page-container">
      <div style={{ height: 300, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }} />
    </div>
  )

  if (error || !data) return (
    <div className="page-container">
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Activity not found</div>
        <Link href="/log" className="btn btn-outline" style={{ marginTop: 8 }}>← Back to Log</Link>
      </div>
    </div>
  )

  const status = computeStatus(data.start_date, data.end_date)
  const days = getDayCount(data.start_date, data.end_date)
  const staff = data.staff

  return (
    <div className="page-container">
      {/* Back */}
      <Link
        href="/log"
        style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 20 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Activity Log
      </Link>

      {editing ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <h1 className="page-title">Edit Activity</h1>
            <button onClick={() => setEditing(false)} className="btn btn-ghost" style={{ fontSize: 13 }}>Cancel</button>
          </div>
          <ActivityForm initial={data} />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="page-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <ActivityBadge type={data.activity_type} />
                <StatusPill status={status} />
              </div>
              <h1 className="page-title">{data.location}</h1>
              {data.description && (
                <p className="page-subtitle" style={{ marginTop: 6 }}>{data.description}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setEditing(true)} className="btn btn-outline">Edit</button>
              <button onClick={() => setConfirming(true)} className="btn btn-danger">Delete</button>
            </div>
          </div>

          {/* Detail card */}
          <div className="card" style={{ padding: 0 }}>
            {/* Staff section */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--accent-bg)', color: 'var(--accent-text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-barlow, sans-serif)',
                fontSize: 17, fontWeight: 700, flexShrink: 0,
              }}>
                {staff?.staff_name.split(' ').map(n => n[0]).join('').slice(0, 2) ?? '?'}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>
                  {staff?.staff_name ?? data.staff_id}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-jetbrains, monospace)' }}>
                  {data.staff_id}{staff?.department ? ` · ${staff.department}` : ''}
                </div>
              </div>
              <Link
                href={`/staff/${data.staff_id}`}
                style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 500 }}
              >
                View profile →
              </Link>
            </div>

            {/* Details grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 0,
            }}>
              <Detail label="Date(s)" value={formatDateRange(data.start_date, data.end_date)} />
              <Detail label="Duration" value={days === 1 ? (data.is_all_day ? 'All day' : '1 day') : `${days} days`} />
              {!data.is_all_day && data.start_time && (
                <Detail
                  label="Time"
                  value={`${formatTime(data.start_time)}${data.end_time ? ` – ${formatTime(data.end_time)}` : ''}`}
                />
              )}
              <Detail label="Location" value={data.location} />
              {data.logged_by && <Detail label="Logged by" value={data.logged_by} mono />}
              <Detail label="Recorded" value={new Date(data.created_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })} />
            </div>

            {data.notes && (
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>Notes</div>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{data.notes}</p>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirming}
        title="Delete this activity?"
        message={`This will permanently remove ${staff?.staff_name ?? data.staff_id}'s activity at ${data.location}. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
        loading={deleting}
      />
    </div>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{
        fontSize: 14, color: 'var(--text-1)',
        fontFamily: mono ? 'var(--font-jetbrains, monospace)' : undefined,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
    </div>
  )
}
