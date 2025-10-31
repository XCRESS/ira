"use client"

import { useState } from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { User, Palette, Bell, Shield } from "lucide-react"

type SettingsSection = "general" | "appearance" | "notifications" | "security"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance")

  const sections = [
    {
      id: "general" as SettingsSection,
      name: "General",
      icon: User,
      description: "Manage your account settings",
    },
    {
      id: "appearance" as SettingsSection,
      name: "Appearance",
      icon: Palette,
      description: "Customize theme and display",
    },
    {
      id: "notifications" as SettingsSection,
      name: "Notifications",
      icon: Bell,
      description: "Configure notification preferences",
    },
    {
      id: "security" as SettingsSection,
      name: "Security",
      icon: Shield,
      description: "Security and privacy settings",
    },
  ]

  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Settings" }]} />

      {/* Settings Layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar Navigation */}
        <nav className="glass space-y-1 rounded-2xl p-3">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-foreground/5"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-medium">{section.name}</span>
              </button>
            )
          })}
        </nav>

        {/* Content Area */}
        <div>
          {/* General Section */}
          {activeSection === "general" && (
            <div className="glass rounded-2xl p-8">
              <h2 className="mb-6 text-lg font-semibold">General</h2>

              <div className="space-y-4">
                <div className="rounded-lg border border-foreground/10 bg-foreground/2 p-6 text-center">
                  <p className="text-sm text-foreground/60">
                    Account settings coming soon
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <div className="glass rounded-2xl p-8">
              <h2 className="mb-6 text-lg font-semibold">Theme</h2>
              <ThemeSwitcher />
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="glass rounded-2xl p-8">
              <h2 className="mb-6 text-lg font-semibold">Notifications</h2>

              <div className="space-y-4">
                <div className="rounded-lg border border-foreground/10 bg-foreground/2 p-6 text-center">
                  <p className="text-sm text-foreground/60">
                    Notification settings coming soon
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="glass rounded-2xl p-8">
              <h2 className="mb-6 text-lg font-semibold">Security & Privacy</h2>

              <div className="space-y-4">
                <div className="rounded-lg border border-foreground/10 bg-foreground/2 p-6 text-center">
                  <p className="text-sm text-foreground/60">
                    Security settings coming soon
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}