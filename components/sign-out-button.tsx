"use client"

import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function SignOutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignOut() {
    try {
      setIsLoading(true)
      await signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Failed to sign out:", error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? "Signing out..." : "Sign Out"}
    </button>
  )
}
