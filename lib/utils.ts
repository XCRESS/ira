// IRA Platform - Utility Functions

/**
 * Format date consistently across the application
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A"

  const d = typeof date === "string" ? new Date(date) : date

  // Check if valid date
  if (isNaN(d.getTime())) return "Invalid date"

  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format date to short format (date only, no time)
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "N/A"

  const d = typeof date === "string" ? new Date(date) : date

  // Check if valid date
  if (isNaN(d.getTime())) return "Invalid date"

  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Format time only
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A"

  const d = typeof date === "string" ? new Date(date) : date

  // Check if valid date
  if (isNaN(d.getTime())) return "Invalid time"

  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A"

  const d = typeof date === "string" ? new Date(date) : date

  if (isNaN(d.getTime())) return "Invalid date"

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "Just now"
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`

  // Fallback to short date for older dates
  return formatDateShort(d)
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1
  const d2 = typeof date2 === "string" ? new Date(date2) : date2

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/**
 * Safely combine class names
 */
export function cn(...classes: (string | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}
