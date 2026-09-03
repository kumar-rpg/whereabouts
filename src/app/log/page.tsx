import type { Metadata } from 'next'
import Link from 'next/link'
import { WhereaboutsTable } from '@/components/WhereaboutsTable'

export const metadata: Metadata = { title: 'Activity Log' }

export default function LogPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">All staff whereabouts — search, filter, and review</p>
        </div>
        <Link href="/log/new" className="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Entry
        </Link>
      </div>
      <WhereaboutsTable />
    </div>
  )
}
