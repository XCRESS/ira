export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { PerformanceObserver } = await import('perf_hooks')

    // Monitor slow operations
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          console.log(`⚠️ SLOW: ${entry.name} took ${entry.duration.toFixed(2)}ms`)
        }
      }
    })

    observer.observe({ entryTypes: ['measure'] })

    // Optional: Keep database warm (prevents cold starts)
    // Uncomment if users experience 3-5s delays on first load
    /*
    const prisma = (await import('@/lib/prisma')).default
    setInterval(async () => {
      try {
        await prisma.$queryRaw`SELECT 1`
        console.log('✅ DB keep-alive')
      } catch (err) {
        console.error('❌ Keep-alive failed:', err)
      }
    }, 4 * 60 * 1000) // Every 4 minutes
    */
  }
}

export async function onRequestError(
  err: Error,
  request: {
    path: string
    method: string
    headers: Record<string, string>
  }
) {
  console.error(`❌ Request error on ${request.path}:`, err)
}
