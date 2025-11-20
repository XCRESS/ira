"use client"

import { useReportWebVitals } from 'next/web-vitals'

export function PerformanceMonitor() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      })
    }

    // Send to your analytics
    if (typeof window !== 'undefined') {
      // You can send this to your backend
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          path: window.location.pathname,
          timestamp: Date.now(),
        }),
      }).catch(() => {
        // Silently fail - don't block user
      })
    }
  })

  return null
}
