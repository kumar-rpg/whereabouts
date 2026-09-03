'use client'

import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <main
        style={{
          flex: 1,
          minWidth: 0,
          paddingBottom: 64,
        }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
