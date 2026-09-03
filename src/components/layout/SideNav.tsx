'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '../ui/ThemeToggle'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/log', label: 'Activity Log', icon: ListIcon },
  { href: '/log/new', label: 'Log Activity', icon: PlusIcon },
  { href: '/staff', label: 'Staff', icon: UsersIcon },
]

export function SideNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="hidden md:flex"
      style={{
        width: 240, flexShrink: 0,
        position: 'fixed', left: 0, top: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        zIndex: 40,
      }}
    >
      {/* Brand */}
      <div style={{
        padding: '20px 20px 0',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 18,
        marginBottom: 8,
      }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <PinIcon />
        </span>
        <div>
          <div style={{
            fontFamily: 'var(--font-barlow, sans-serif)',
            fontSize: 15, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.2,
          }}>Whereabouts</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Staff Tracker</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                fontSize: 14, fontWeight: active ? 500 : 400,
                color: active ? 'var(--accent-text)' : 'var(--text-2)',
                background: active ? 'var(--accent-bg)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.12s, color 0.12s',
              }}
            >
              <Icon active={active} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  )
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function ListIcon({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
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

function PlusIcon({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  )
}

function UsersIcon({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
