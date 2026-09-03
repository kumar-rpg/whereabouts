'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '@/lib/supabase'
import type { Staff } from '@/lib/types'

interface StaffSearchProps {
  value: Staff | null
  onChange: (staff: Staff | null) => void
  placeholder?: string
  error?: string
}

export function StaffSearch({ value, onChange, placeholder = 'Search by name or Staff ID…', error }: StaffSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Staff[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) setQuery(`${value.staff_id} — ${value.staff_name}`)
  }, [value])

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  useEffect(() => {
    if (!query || value) return
    const t = setTimeout(async () => {
      setLoading(true)
      const { data } = await db
        .from('staff')
        .select('*')
        .eq('is_active', true)
        .or(`staff_name.ilike.%${query}%,staff_id.ilike.%${query}%`)
        .limit(8)
      setResults(data ?? [])
      setOpen(true)
      setLoading(false)
    }, 200)
    return () => clearTimeout(t)
  }, [query, value])

  function select(staff: Staff) {
    onChange(staff)
    setQuery(`${staff.staff_id} — ${staff.staff_name}`)
    setOpen(false)
  }

  function clear() {
    onChange(null)
    setQuery('')
    setResults([])
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          value={query}
          onChange={e => { setQuery(e.target.value); if (value) onChange(null) }}
          onFocus={() => { if (results.length) setOpen(true) }}
          placeholder={placeholder}
          autoComplete="off"
          style={{ paddingRight: value ? 36 : 12 }}
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', display: 'flex', padding: 2,
            }}
            aria-label="Clear"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{error}</p>}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}>
          {loading && (
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-3)' }}>Searching…</div>
          )}
          {!loading && results.length === 0 && (
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-3)' }}>No staff found</div>
          )}
          {!loading && results.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => select(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '11px 14px', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'var(--accent-bg)', color: 'var(--accent-text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-barlow, sans-serif)',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {s.staff_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{s.staff_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-jetbrains, monospace)' }}>
                  {s.staff_id}{s.department ? ` · ${s.department}` : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
