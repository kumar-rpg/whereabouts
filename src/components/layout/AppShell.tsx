'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BottomNav } from './BottomNav'
import { StaffBottomNav } from './StaffBottomNav'
import { getSession, clearSession, type AuthSession } from '@/lib/auth'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [ready, setReady] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)
  const isLogin = pathname === '/login'
  const isMyPortal = pathname.startsWith('/my')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const resolved = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(resolved)
    document.documentElement.setAttribute('data-theme', resolved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  useEffect(() => {
    if (isLogin) {
      setReady(true)
      return
    }
    const s = getSession()
    if (!s) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    } else if (s.role !== 'Admin' && !pathname.startsWith('/my')) {
      router.replace('/my')
    } else {
      setSession(s)
      setReady(true)
    }
  }, [isLogin, pathname, router])

  function logout() {
    clearSession()
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
  }

  // Login page — no chrome
  if (isLogin) return <>{children}</>

  // Auth check in progress — blank screen to prevent flash
  if (!ready) return <div style={{ minHeight: '100dvh', background: 'var(--bg)' }} />

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Session bar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 44,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px',
        gap: 10,
      }}>
        <span style={{
          fontFamily: 'var(--font-barlow, sans-serif)',
          fontSize: 15, fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '0.01em',
          flex: 1,
        }}>
          Whereabouts
        </span>
        {session && (
          <span style={{ fontSize: 13, color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
            {session.staff_name}
          </span>
        )}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px', borderRadius: 8,
            color: 'var(--text-3)',
            display: 'flex', alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {theme === 'dark' ? (
            /* Sun */
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            /* Moon */
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        <button
          onClick={logout}
          title="Sign out"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px', borderRadius: 8,
            color: 'var(--text-3)',
            display: 'flex', alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </header>

      <main style={{ paddingTop: 44, paddingBottom: 64 }}>
        {children}
      </main>

      {isMyPortal ? <StaffBottomNav /> : <BottomNav />}
    </div>
  )
}
