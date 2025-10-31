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

  const breadcrumbContent = (
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
    </nav>
  )

  // Render into header portal if available, otherwise render inline
  if (mounted && typeof window !== "undefined") {
    const portalElement = document.getElementById("breadcrumbs-portal")
    if (portalElement) {
      return createPortal(breadcrumbContent, portalElement)
    }
  }

  return breadcrumbContent
}