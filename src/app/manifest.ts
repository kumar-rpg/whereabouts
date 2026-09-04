import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Staff Whereabouts',
    short_name: 'Whereabouts',
    description: 'Track where your team is — vendor visits, training, customer meetings, and events.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#080F18',
    theme_color: '#0B9868',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
