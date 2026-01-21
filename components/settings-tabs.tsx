"use client"

import { useState } from "react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { User, Palette, Bell, Shield } from "lucide-react"

type SettingsSection = "appearance" | "general" | "notifications" | "security"

type Props = {
  userRole: "ASSESSOR" | "REVIEWER"
}

export function SettingsTabs({ userRole }: Props) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance")

  const sections = [
    {
      id: "appearance" as SettingsSection,
      name: "Appearance",
      icon: Palette,
      description: "Customize theme and display",
      roles: ["ASSESSOR", "REVIEWER"] as const,
    },
    {
      id: "general" as SettingsSection,
      name: "General",
      icon: User,
      description: "Manage your account settings",
      roles: ["ASSESSOR", "REVIEWER"] as const,
    },
    {
      id: "notifications" as SettingsSection,
      name: "Notifications",
      icon: Bell,
      description: "Configure notification preferences",
      roles: ["ASSESSOR", "REVIEWER"] as const,
    },
    {
      id: "security" as SettingsSection,
      name: "Security",
      icon: Shield,
      description: "Security and privacy settings",
      roles: ["ASSESSOR", "REVIEWER"] as const,
    },
  ]

  const filteredSections = sections.filter((section) =>
    (section.roles as readonly string[]).includes(userRole)
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Sidebar Navigation */}
      <nav className="glass space-y-1 rounded-2xl p-3">
        {filteredSections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${isActive
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
        {/* Appearance Section */}
        {activeSection === "appearance" && (
          <div className="glass rounded-2xl p-6 md:p-8">
            <h2 className="mb-6 text-base md:text-lg font-semibold">Theme</h2>
            <ThemeSwitcher />
          </div>
        )}

        {/* General Section */}
        {activeSection === "general" && (
          <div className="glass rounded-2xl p-6 md:p-8">
            <h2 className="mb-6 text-base md:text-lg font-semibold">General</h2>

            <div className="space-y-4">
              <div className="rounded-lg border border-foreground/10 bg-foreground/2 p-6 text-center">
                <p className="text-sm text-foreground/60">
                  Account settings coming soon
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === "notifications" && (
          <div className="glass rounded-2xl p-6 md:p-8">
            <h2 className="mb-6 text-base md:text-lg font-semibold">Notifications</h2>

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
          <div className="glass rounded-2xl p-6 md:p-8">
            <h2 className="mb-6 text-base md:text-lg font-semibold">Security & Privacy</h2>

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
  )
}
