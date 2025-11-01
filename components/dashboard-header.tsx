"use client"

import { useState } from "react"
import { signOut } from "@/lib/auth-client"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, User, ChevronDown, Home, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Props = {
  user: {
    name: string
    email: string
    image?: string | null
    role: "ASSESSOR" | "REVIEWER"
  }
}

export function DashboardHeader({ user }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleSignOut() {
    try {
      setIsLoggingOut(true)
      await signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Failed to sign out:", error)
      setIsLoggingOut(false)
    }
  }

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)

    // Skip if we're on dashboard home
    if (segments.length <= 1) {
      return (
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="flex items-center gap-1 text-foreground">
            <Home className="h-4 w-4" />
            <span className="font-medium">Dashboard</span>
          </Link>
        </nav>
      )
    }

    const breadcrumbs: Array<{ label: string; href?: string }> = []

    segments.forEach((segment, index) => {
      if (segment === "dashboard") return

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

  return (
    <header className="glass sticky top-0 z-40 flex h-16 items-center justify-between border-b border-foreground/10 px-4 md:px-6">
      {/* Auto-generated Breadcrumbs */}
      <div className="flex-1">
        {generateBreadcrumbs()}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-foreground/5"
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                <User className="h-4 w-4" />
              </div>
            )}
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-foreground/60">{user.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-foreground/50" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="glass-strong absolute right-0 z-50 mt-2 w-64 rounded-lg p-2">
                {/* User Info */}
                <div className="border-b border-foreground/10 px-3 py-2">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-foreground/70">{user.email}</p>
                  <p className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {user.role}
                  </p>
                </div>

                {/* Actions */}
                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-foreground/5 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}