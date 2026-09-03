'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { db } from '@/lib/supabase'
import type { Staff } from '@/lib/types'

async function fetchStaff(): Promise<Staff[]> {
  const { data, error } = await db
    .from('staff')
    .select('*')
    .order('staff_id', { ascending: true })
  if (error) throw error
  return data ?? []
}

const staffSchema = z.object({
  staff_id: z.string().min(1, 'Staff ID is required'),
  staff_name: z.string().min(2, 'Name is required'),
  department: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
})

type StaffFormValues = z.infer<typeof staffSchema>

export default function StaffPage() {
  const { data, isLoading, mutate } = useSWR('staff-list', fetchStaff)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
  })

  const filtered = useMemo(() => {
    if (!data) return []
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter(s =>
      s.staff_name.toLowerCase().includes(q) ||
      s.staff_id.toLowerCase().includes(q) ||
      (s.department ?? '').toLowerCase().includes(q)
    )
  }, [data, search])

  async function onSubmit(values: StaffFormValues) {
    setSubmitting(true)
    setSubmitError('')
    const { error } = await db.from('staff').insert({
      staff_id: values.staff_id,
      staff_name: values.staff_name,
      department: values.department || null,
      email: values.email || null,
    })
    if (error) {
      setSubmitError(error.message)
      setSubmitting(false)
      return
    }
    await mutate()
    reset()
    setShowAdd(false)
    setSubmitting(false)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Directory</h1>
          <p className="page-subtitle">
            {isLoading ? 'Loading…' : `${data?.length ?? 0} ${(data?.length ?? 0) === 1 ? 'member' : 'members'}`}
          </p>
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Staff
        </button>
      </div>

      {/* Add staff form */}
      {showAdd && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{
            fontFamily: 'var(--font-barlow, sans-serif)',
            fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18,
          }}>New Staff Member</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid-2">
              <div>
                <label className="label" htmlFor="staff_id">Staff ID *</label>
                <input id="staff_id" className="input" placeholder="e.g. EMP-0008" {...register('staff_id')} />
                {errors.staff_id && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.staff_id.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="staff_name">Full Name *</label>
                <input id="staff_name" className="input" placeholder="e.g. Mei Lin Wong" {...register('staff_name')} />
                {errors.staff_name && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.staff_name.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="department">Department</label>
                <input id="department" className="input" placeholder="e.g. Engineering" {...register('department')} />
              </div>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" type="email" className="input" placeholder="e.g. mei@company.com" {...register('email')} />
                {errors.email && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.email.message}</p>}
              </div>
            </div>
            {submitError && (
              <p style={{ fontSize: 13, color: 'var(--danger)', marginTop: 12 }}>{submitError}</p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Adding…' : 'Add Staff Member'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowAdd(false); reset() }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="filter-bar">
        <input
          className="input"
          placeholder="Search staff…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">{search ? 'No matches' : 'No staff yet'}</div>
            <div className="empty-state-text">{search ? 'Try a different search.' : 'Add your first staff member above.'}</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-jetbrains, monospace)',
                        fontSize: 12.5, color: 'var(--accent-text)',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {s.staff_id}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-1)' }}>{s.staff_name}</td>
                    <td>{s.department ?? <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                    <td style={{ fontSize: 13 }}>{s.email ?? <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                    <td>
                      <Link
                        href={`/staff/${s.staff_id}`}
                        style={{ fontSize: 13, color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 500 }}
                      >
                        Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
