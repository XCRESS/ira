import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IRA - IPO Readiness Assessment',
    short_name: 'IRA',
    description: 'Internal tool for calculating IPO readiness scores',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0f0f0f',
    theme_color: '#265eb5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
  }
}