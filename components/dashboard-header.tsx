'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ChevronRight } from "lucide-react"
import { UserDropdown } from "./user-dropdown"

type Props = {
  user: {
    name: string
    email: string
    image?: string | null
    role: "ASSESSOR" | "REVIEWER"
  }
}

export function DashboardHeader({ user }: Props) {
  const pathname = usePathname()

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean)
  const showBreadcrumbs = segments.length > 1

  const breadcrumbs: Array<{ label: string; href?: string }> = []

  if (showBreadcrumbs) {
    segments.forEach((segment, index) => {
      if (segment === "dashboard") return

      const href = "/" + segments.slice(0, index + 1).join("/")
      const isLast = index === segments.length - 1

      let label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      if (segment === "new") label = "New Lead"

      breadcrumbs.push({
        label,
        href: isLast ? undefined : href,
      })
    })
  }

  return (
    <header className="glass sticky top-0 z-40 flex h-16 items-center justify-between border-b border-foreground/10 px-4 md:px-6">
      {/* Breadcrumbs */}
      <nav className="flex flex-1 items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className={`flex items-center gap-1 ${
            showBreadcrumbs
              ? "text-foreground/70 hover:text-foreground"
              : "text-foreground"
          }`}
        >
          <Home className="h-4 w-4" />
          {!showBreadcrumbs && <span className="font-medium">Dashboard</span>}
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

      {/* User Dropdown - Only client component */}
      <UserDropdown user={user} />
    </header>
  )
}
