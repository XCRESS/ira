'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, MoreVertical } from 'lucide-react'
import { useState } from 'react'

type Props = {
  title: string
  showBack?: boolean
  onMenuClick?: () => void
}

export function MobileHeader({ title, showBack = false, onMenuClick }: Props) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 md:hidden glass border-b border-foreground/10 pt-safe">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back button or empty */}
        <div className="w-10">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 -ml-2 rounded-lg active:bg-foreground/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Center: Title */}
        <h1 className="text-base font-semibold truncate flex-1 text-center px-2">
          {title}
        </h1>

        {/* Right: Menu button */}
        <div className="w-10">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="flex items-center justify-center w-10 h-10 -mr-2 rounded-lg active:bg-foreground/5"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}