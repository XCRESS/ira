"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Only render on client after mount
  if (!mounted || typeof window === "undefined") return null

  const portalElement = document.getElementById("breadcrumbs-portal")
  if (!portalElement) return null

  // Only render if we're in the visible layout (desktop or mobile)
  // Check if parent is visible by checking display style
  const isVisible = () => {
    let element = portalElement.parentElement
    while (element) {
      const style = window.getComputedStyle(element)
      if (style.display === "none") return false
      element = element.parentElement
    }
    return true
  }

  if (!isVisible()) return null

  return createPortal(
    <nav className="flex items-center gap-2 text-sm">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-foreground/70 hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => (
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
    </nav>,
    portalElement
  )
}