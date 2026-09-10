'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/my', label: 'Log', icon: ListIcon },
  { href: '/my/new', label: 'Add', icon: PlusCircleIcon, primary: true },
]

export function StaffBottomNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/my') return pathname === '/my'
    return pathname.startsWith(href)
  }

  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon, primary }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '10px 4px',
              color: active ? 'var(--accent)' : 'var(--text-3)',
              textDecoration: 'none',
              fontSize: 10, fontWeight: 500,
              letterSpacing: '0.03em',
              minHeight: 56,
            }}
          >
            <Icon active={active} primary={primary} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

function ListIcon({ active }: { active?: boolean; primary?: boolean }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

function PlusCircleIcon({ active }: { active?: boolean; primary?: boolean }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  )
}
