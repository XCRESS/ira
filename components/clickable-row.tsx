'use client'

import { useRouter } from 'next/navigation'

interface ClickableRowProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function ClickableRow({ href, children, className = '' }: ClickableRowProps) {
  const router = useRouter()

  return (
    <tr
      className={`cursor-pointer hover:bg-foreground/5 transition-colors ${className}`}
      onClick={() => router.push(href)}
    >
      {children}
    </tr>
  )
}