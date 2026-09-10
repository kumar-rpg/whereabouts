'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, type AuthSession } from '@/lib/auth'
import { WhereaboutsTable } from '@/components/WhereaboutsTable'

export default function MyActivitiesPage() {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-barlow, sans-serif)',
            fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: 0,
          }}>
            My Activities
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>
            {session.staff_name} · {session.staff_id}
          </p>
        </div>
        <Link href="/my/new" className="btn btn-primary" style={{ flexShrink: 0 }}>
          + New Entry
        </Link>
      </div>

      <WhereaboutsTable staffId={session.staff_id} />
    </div>
  )
}
