"use client"

import { useState } from "react"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { LogOut, User, ChevronDown } from "lucide-react"
import Image from "next/image"

type Props = {
  user: {
    name: string
    email: string
    image?: string | null
    role: "ASSESSOR" | "REVIEWER"
  }
}

export function UserDropdown({ user }: Props) {
  const router = useRouter()
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

  return (
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

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="glass-strong absolute right-0 z-50 mt-2 w-64 rounded-lg p-2">
            <div className="border-b border-foreground/10 px-3 py-2">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-foreground/70">{user.email}</p>
              <p className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {user.role}
              </p>
            </div>
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
  )
}
