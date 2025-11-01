'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, BarChart3, User } from 'lucide-react'

type Tab = {
  id: string
  label: string
  icon: typeof Home
  href: string
}

type Props = {
  role: 'ASSESSOR' | 'REVIEWER'
}

export function MobileTabBar({ role }: Props) {
  const pathname = usePathname()

  const assessorTabs: Tab[] = [
    { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
    { id: 'leads', label: 'My Leads', icon: FileText, href: '/dashboard/leads' },
    { id: 'activity', label: 'Activity', icon: BarChart3, href: '/dashboard/activity' },
    { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/settings' },
  ]

  const reviewerTabs: Tab[] = [
    { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
    { id: 'leads', label: 'Leads', icon: FileText, href: '/dashboard/leads' },
    { id: 'reviews', label: 'Reviews', icon: BarChart3, href: '/dashboard/reviews' },
    { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/settings' },
  ]

  const tabs = role === 'ASSESSOR' ? assessorTabs : reviewerTabs

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-foreground/10">
      <div className="grid grid-cols-4 h-16 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href)

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-foreground/60 active:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}