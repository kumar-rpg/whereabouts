'use client'

import { use } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { db } from '@/lib/supabase'
import { WhereaboutsTable } from '@/components/WhereaboutsTable'
import { StatusPill } from '@/components/ui/StatusPill'
import { computeStatus, todayISO } from '@/lib/utils'
import type { Staff, Whereabout } from '@/lib/types'

async function fetchStaffProfile(staffId: string): Promise<{ staff: Staff | null; activeEntry: Whereabout | null }> {
  const [staffRes, activeRes] = await Promise.all([
    db.from('staff').select('*').eq('staff_id', staffId).single(),
    db.from('whereabouts')
      .select('*')
      .eq('staff_id', staffId)
      .lte('start_date', todayISO())
      .gte('end_date', todayISO())
      .limit(1)
      .maybeSingle(),
  ])
  return { staff: staffRes.data, activeEntry: activeRes.data }
}

export default function StaffProfilePage({ params }: PageProps<'/staff/[id]'>) {
  const { id } = use(params)
  const { data, isLoading } = useSWR(`staff-profile-${id}`, () => fetchStaffProfile(id))

  if (isLoading) return (
    <div className="page-container">
      <div style={{ height: 160, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }} />
    </div>
  )

  const staff = data?.staff
  const active = data?.activeEntry

  if (!staff) return (
    <div className="page-container">
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Staff not found</div>
        <Link href="/staff" className="btn btn-outline" style={{ marginTop: 8 }}>← Staff Directory</Link>
      </div>
    </div>
  )

  const initials = staff.staff_name.split(' ').map(n => n[0]).join('').slice(0, 2)

  return (
    <div className="page-container">
      {/* Back */}
      <Link
        href="/staff"
        style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 20 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Staff Directory
      </Link>

      {/* Profile card */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--accent-bg)', color: 'var(--accent-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-barlow, sans-serif)',
            fontSize: 20, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{
                fontFamily: 'var(--font-barlow, sans-serif)',
                fontSize: 22, fontWeight: 700, color: 'var(--text-1)',
                margin: 0,
              }}>
                {staff.staff_name}
              </h1>
              {active ? (
                <StatusPill status="ongoing" />
              ) : (
                <span style={{
                  fontSize: 12, padding: '3px 9px', borderRadius: 99,
                  background: 'var(--surface-alt)', color: 'var(--text-3)',
                }}>In Office</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 13, color: 'var(--accent-text)' }}>
                {staff.staff_id}
              </span>
              {staff.department && (
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{staff.department}</span>
              )}
              {staff.email && (
                <a href={`mailto:${staff.email}`} style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>
                  {staff.email}
                </a>
              )}
            </div>
          </div>
          <Link href={`/log/new`} className="btn btn-outline" style={{ flexShrink: 0 }}>
            Log Activity
          </Link>
        </div>

        {/* Currently out banner */}
        {active && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px', borderRadius: 10,
            background: 'var(--s-ongoing-bg)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--s-ongoing)', flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, color: 'var(--s-ongoing)', fontWeight: 500 }}>
              Currently away at <strong>{active.location}</strong>
            </span>
            <Link
              href={`/log/${active.id}`}
              style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--s-ongoing)', textDecoration: 'none', fontWeight: 500 }}
            >
              Details →
            </Link>
          </div>
        )}
      </div>

      {/* Activity history */}
      <h2 style={{
        fontFamily: 'var(--font-barlow, sans-serif)',
        fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14,
      }}>
        Activity History
      </h2>
      <WhereaboutsTable staffId={staff.staff_id} />
    </div>
  )
}
