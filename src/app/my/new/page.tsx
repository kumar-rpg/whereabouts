'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, type AuthSession } from '@/lib/auth'
import { ActivityForm } from '@/components/ActivityForm'

export default function MyNewActivityPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    const s = getSession()
    if (!s) { router.replace('/login'); return }
    setSession(s)
  }, [router])

  if (!session) return null

  return (
    <div className="page-container">
      <Link
        href="/my"
        style={{
          fontSize: 13, color: 'var(--text-3)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 20,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        My Activities
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'var(--font-barlow, sans-serif)',
          fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: 0,
        }}>
          Log Activity
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>
          {session.staff_name} · {session.staff_id}
        </p>
      </div>

      <ActivityForm preselectedStaffId={session.staff_id} />
    </div>
  )
}
