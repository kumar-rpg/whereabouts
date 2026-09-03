'use client'

import { SideNav } from './SideNav'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <SideNav />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          paddingBottom: 64, // room for bottom nav on mobile
        }}
        className="md:pb-0 md:ml-60"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
