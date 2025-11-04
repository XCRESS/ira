"use client"

import { Toaster as SonnerToaster } from "sonner"
import { useTheme } from "next-themes"

export function Toaster() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      position="top-center"
      richColors
      theme={theme as "light" | "dark"}
      toastOptions={{
        style: {
          background: "var(--glass)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        },
        className: "glass-strong",
      }}
    />
  )
}
