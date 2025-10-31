"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react"

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: ("ASSESSOR" | "REVIEWER")[]
  badge?: string | number
}

type Props = {
  userRole: "ASSESSOR" | "REVIEWER"
}

export function DashboardSidebar({ userRole }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Leads",
      href: "/dashboard/leads",
      icon: FileText,
    },
    {
      name: "Assessments",
      href: "/dashboard/assessments",
      icon: BarChart3,
      roles: ["ASSESSOR"],
    },
    {
      name: "Reviews",
      href: "/dashboard/reviews",
      icon: BarChart3,
      roles: ["REVIEWER"],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`glass relative flex h-screen flex-col border-r border-foreground/10 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-foreground/10 px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">IRA</span>
            </div>
            <span className="text-lg font-bold">IPO Ready</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">IRA</span>
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-foreground/5"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="mt-6 space-y-2 border-t border-foreground/10 pt-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Quick Actions
            </p>
            {userRole === "REVIEWER" && (
              <Link
                href="/dashboard/leads/new"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-foreground/5"
              >
                <Plus className="h-5 w-5 shrink-0" />
                <span>New Lead</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex h-12 items-center justify-center border-t border-foreground/10 hover:bg-foreground/5"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </button>
    </aside>
  )
}