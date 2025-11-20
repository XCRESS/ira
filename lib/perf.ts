/**
 * Performance monitoring utilities
 */

export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()

  return fn().then(
    (result) => {
      const duration = performance.now() - start
      if (duration > 100) {
        console.log(`🐢 SLOW: ${name} took ${duration.toFixed(2)}ms`)
      } else if (duration > 50) {
        console.log(`⚠️ ${name} took ${duration.toFixed(2)}ms`)
      }
      return result
    },
    (error) => {
      const duration = performance.now() - start
      console.error(`❌ ERROR in ${name} after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  )
}

export function measure<T>(name: string, fn: () => T): T {
  const start = performance.now()
  try {
    const result = fn()
    const duration = performance.now() - start
    if (duration > 50) {
      console.log(`⚠️ ${name} took ${duration.toFixed(2)}ms`)
    }
    return result
  } catch (error) {
    const duration = performance.now() - start
    console.error(`❌ ERROR in ${name} after ${duration.toFixed(2)}ms:`, error)
    throw error
  }
}

// Database query timing
export class QueryTimer {
  private queries: Array<{ name: string; duration: number }> = []

  async time<T>(name: string, query: Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await query
      const duration = performance.now() - start
      this.queries.push({ name, duration })

      if (duration > 100) {
        console.log(`🐢 SLOW QUERY: ${name} took ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      const duration = performance.now() - start
      console.error(`❌ QUERY ERROR: ${name} failed after ${duration.toFixed(2)}ms`)
      throw error
    }
  }

  summary() {
    const total = this.queries.reduce((sum, q) => sum + q.duration, 0)
    console.log(`📊 Total queries: ${this.queries.length}, Total time: ${total.toFixed(2)}ms`)

    // Show slowest queries
    const slow = this.queries
      .filter(q => q.duration > 50)
      .sort((a, b) => b.duration - a.duration)

    if (slow.length > 0) {
      console.log('🐢 Slowest queries:')
      slow.forEach(q => console.log(`  - ${q.name}: ${q.duration.toFixed(2)}ms`))
    }
  }
}
