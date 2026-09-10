'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { db } from '@/lib/supabase'
import { getSession, setSession } from '@/lib/auth'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (getSession()) {
      router.replace(redirectTo)
    } else {
      setTimeout(() => refs.current[0]?.focus(), 100)
    }
  }, [router])

  const verify = useCallback(async (pin: string) => {
    setChecking(true)
    setError('')

    const { data } = await db
      .from('staff')
      .select('staff_id, staff_name, access_id')
      .eq('access_id', pin)
      .eq('is_active', true)
      .maybeSingle()

    if (data) {
      setSession({ staff_id: data.staff_id, staff_name: data.staff_name, access_id: data.access_id })
      router.replace(redirectTo)
    } else {
      setError('Incorrect PIN. Please try again.')
      setDigits(['', '', '', '', '', ''])
      setChecking(false)
      setTimeout(() => refs.current[0]?.focus(), 50)
    }
  }, [router])

  function handleChange(i: number, value: string) {
    if (checking) return
    const d = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    setError('')
    if (d && i < 5) refs.current[i + 1]?.focus()
    if (next.every(v => v)) verify(next.join(''))
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits]
      next[i - 1] = ''
      setDigits(next)
      refs.current[i - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setDigits(text.split(''))
      refs.current[5]?.focus()
      verify(text)
    }
  }

  const filled = digits.filter(d => d !== '').length

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 24,
    }}>
      {/* Brand mark */}
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 32px rgba(11,152,104,0.3)',
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-barlow, sans-serif)',
          fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em',
          color: 'var(--text-1)', margin: '0 0 6px',
        }}>
          Staff Whereabouts
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0 }}>
          Enter your 6-digit access PIN
        </p>
      </div>

      {/* PIN boxes */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el }}
            type="password"
            inputMode="numeric"
            maxLength={2}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            disabled={checking}
            autoComplete="off"
            style={{
              width: 48, height: 58,
              textAlign: 'center',
              fontSize: 24, fontWeight: 700,
              fontFamily: 'var(--font-jetbrains, monospace)',
              color: 'var(--text-1)',
              background: 'var(--surface)',
              border: `2px solid ${d ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 14,
              outline: 'none',
              transition: 'border-color 0.15s, transform 0.1s',
              caretColor: 'transparent',
              opacity: checking ? 0.6 : 1,
            }}
          />
        ))}
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: i < filled ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.15s',
          }} />
        ))}
      </div>

      {/* Status */}
      {checking && (
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>Verifying…</p>
      )}
      {error && !checking && (
        <div style={{
          padding: '11px 18px', borderRadius: 10,
          background: 'var(--danger-bg)',
          color: 'var(--danger)',
          fontSize: 13, fontWeight: 500,
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <style>{`
        input[type="password"]:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px rgba(11,152,104,0.15);
        }
      `}</style>
    </div>
  )
}
