"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function AutoBreadcrumbs() {
  const pathname = usePathname()

  // Parse pathname to generate breadcrumbs
  const segments = pathname.split("/").filter(Boolean)

  // Skip if we're on dashboard home
  if (segments.length <= 1) {
    return (
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-foreground"
        >
          <Home className="h-4 w-4" />
          <span className="font-medium">Dashboard</span>
        </Link>
      </nav>
    )
  }

  const breadcrumbs: Array<{ label: string; href?: string }> = []

  // Build breadcrumb items from path
  segments.forEach((segment, index) => {
    if (segment === "dashboard") return // Skip dashboard segment

    const href = "/" + segments.slice(0, index + 1).join("/")
    const isLast = index === segments.length - 1

    // Format label
    let label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    // Handle special cases
    if (segment === "new") label = "New Lead"

    breadcrumbs.push({
      label,
      href: isLast ? undefined : href,
    })
  })

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-foreground/70 hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-foreground/30" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-foreground/70 hover:text-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}