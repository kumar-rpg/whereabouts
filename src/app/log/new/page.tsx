import type { Metadata } from 'next'
import Link from 'next/link'
import { ActivityForm } from '@/components/ActivityForm'

export const metadata: Metadata = { title: 'Log Activity' }

export default function NewActivityPage() {
  return (
    <div className="page-container">
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/log"
          style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 16 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Activity Log
        </Link>
        <h1 className="page-title">Log Activity</h1>
        <p className="page-subtitle">Record a staff member's whereabouts</p>
      </div>
      <ActivityForm />
    </div>
  )
}
