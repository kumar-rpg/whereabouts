'use client'

import { useState, useMemo, useEffect } from 'react'
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
  access_id: z.string().regex(/^\d{6}$/, 'Must be exactly 6 digits').optional().or(z.literal('')),
  role: z.enum(['Admin', 'User']),
})

type StaffFormValues = z.infer<typeof staffSchema>

// ── Edit Modal ────────────────────────────────────────────────────
function EditModal({ staff, onClose, onSaved }: {
  staff: Staff
  onClose: () => void
  onSaved: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      staff_id: staff.staff_id,
      staff_name: staff.staff_name,
      department: staff.department ?? '',
      email: staff.email ?? '',
      access_id: staff.access_id ?? '',
      role: staff.role,
    },
  })

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function onSubmit(values: StaffFormValues) {
    setSubmitting(true)
    setSubmitError('')
    const { error } = await db.from('staff').update({
      staff_name: values.staff_name,
      department: values.department || null,
      email: values.email || null,
      access_id: values.access_id || null,
      role: values.role,
    }).eq('id', staff.id)

    if (error) {
      setSubmitError(error.message)
      setSubmitting(false)
      return
    }
    onSaved()
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'flex-end',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 36px',
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--border)', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{
            fontFamily: 'var(--font-barlow, sans-serif)',
            fontSize: 18, fontWeight: 700, color: 'var(--text-1)', margin: 0,
          }}>
            Edit Staff Member
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Staff ID — read-only */}
        <div style={{ marginBottom: 16 }}>
          <label className="label">Staff ID</label>
          <div style={{
            padding: '9px 12px', borderRadius: 8,
            background: 'var(--surface-alt)', border: '1px solid var(--border)',
            fontFamily: 'var(--font-jetbrains, monospace)',
            fontSize: 13, color: 'var(--text-3)',
          }}>
            {staff.staff_id}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-2">
            <div>
              <label className="label" htmlFor="e_staff_name">Full Name *</label>
              <input id="e_staff_name" className="input" {...register('staff_name')} />
              {errors.staff_name && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.staff_name.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="e_role">Role *</label>
              <select id="e_role" className="select" {...register('role')}>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="e_department">Department</label>
              <input id="e_department" className="input" placeholder="e.g. Engineering" {...register('department')} />
            </div>
            <div>
              <label className="label" htmlFor="e_email">Email</label>
              <input id="e_email" type="email" className="input" {...register('email')} />
              {errors.email && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.email.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="e_access_id">Access ID</label>
              <input
                id="e_access_id" className="input"
                placeholder="6-digit PIN" maxLength={6}
                {...register('access_id')}
                style={{ fontFamily: 'var(--font-jetbrains, monospace)', letterSpacing: '0.15em' }}
              />
              {errors.access_id && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.access_id.message}</p>}
            </div>
          </div>

          {submitError && (
            <p style={{ fontSize: 13, color: 'var(--danger)', marginTop: 12 }}>{submitError}</p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function StaffPage() {
  const { data, isLoading, mutate } = useSWR('staff-list', fetchStaff)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [editing, setEditing] = useState<Staff | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { role: 'User' },
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
      access_id: values.access_id || null,
      role: values.role,
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
              <div>
                <label className="label" htmlFor="access_id">Access ID</label>
                <input id="access_id" className="input" placeholder="6-digit PIN e.g. 012345" maxLength={6} {...register('access_id')} style={{ fontFamily: 'var(--font-jetbrains, monospace)', letterSpacing: '0.15em' }} />
                {errors.access_id && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.access_id.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="role">Role *</label>
                <select id="role" className="select" {...register('role')}>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
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
                  <th>Role</th>
                  <th>Access ID</th>
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
                    <td>
                      <span style={{
                        fontSize: 11.5, fontWeight: 600, padding: '3px 9px',
                        borderRadius: 99,
                        background: s.role === 'Admin' ? 'var(--accent-bg)' : 'var(--surface-alt)',
                        color: s.role === 'Admin' ? 'var(--accent-text)' : 'var(--text-2)',
                      }}>
                        {s.role}
                      </span>
                    </td>
                    <td>
                      {s.access_id
                        ? <span style={{ fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 13, letterSpacing: '0.12em', color: 'var(--text-2)' }}>{s.access_id}</span>
                        : <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td>{s.department ?? <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                    <td style={{ fontSize: 13 }}>{s.email ?? <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                          onClick={() => setEditing(s)}
                          title="Edit"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-3)', padding: 4, borderRadius: 6,
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <Link
                          href={`/staff/${s.staff_id}`}
                          style={{ fontSize: 13, color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}
                        >
                          Profile →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <EditModal
          staff={editing}
          onClose={() => setEditing(null)}
          onSaved={() => mutate()}
        />
      )}
    </div>
  )
}
