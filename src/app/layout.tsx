import type { Metadata } from 'next'
import { Barlow_Semi_Condensed, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

const barlow = Barlow_Semi_Condensed({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Staff Whereabouts', template: '%s · Staff Whereabouts' },
  description: 'Track where your team is — vendor visits, training, customer meetings, and events.',
  themeColor: '#0B9868',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Whereabouts',
  },
  formatDetection: { telephone: false },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${barlow.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
