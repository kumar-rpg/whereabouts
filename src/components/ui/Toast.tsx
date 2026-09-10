'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  visible: boolean
  onDismiss: () => void
}

export function Toast({ message, type = 'success', visible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [visible, onDismiss])

  if (!visible) return null

  const bg = type === 'success' ? 'var(--accent)' : 'var(--danger)'

  return (
    <>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          background: bg,
          color: '#fff',
          padding: '10px 20px',
          borderRadius: 99,
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          whiteSpace: 'nowrap',
          animation: 'toast-in 0.2s ease',
        }}
      >
        {type === 'success' ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        )}
        {message}
      </div>
    </>
  )
}
