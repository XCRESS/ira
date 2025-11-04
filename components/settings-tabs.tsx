"use client"

import { useState } from "react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { QuestionList } from "@/components/question-list"
import { User, Palette, Bell, Shield, FileQuestion } from "lucide-react"
import type { Question } from "@prisma/client"

type SettingsSection = "appearance" | "questions" | "general" | "notifications" | "security"

type GroupedQuestions = {
  eligibility: Question[]
  company: Question[]
  financial: Question[]
  sector: Question[]
}

type Props = {
  userRole: "ASSESSOR" | "REVIEWER"
  questions: GroupedQuestions | null
}

export function SettingsTabs({ userRole, questions }: Props) {
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
      id: "questions" as SettingsSection,
      name: "Questions",
      icon: FileQuestion,
      description: "Manage assessment questions",
      roles: ["REVIEWER"] as const,
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
        {/* Appearance Section */}
        {activeSection === "appearance" && (
          <div className="glass rounded-2xl p-6 md:p-8">
            <h2 className="mb-6 text-base md:text-lg font-semibold">Theme</h2>
            <ThemeSwitcher />
          </div>
        )}

        {/* Questions Section (Reviewer only) */}
        {activeSection === "questions" && userRole === "REVIEWER" && (
          <div className="space-y-4 md:space-y-6">
            <div className="glass rounded-2xl p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold mb-2">Question Bank</h2>
              <p className="text-sm text-foreground/70">
                Manage assessment questions for all leads. Changes only affect new assessments.
              </p>
            </div>

            {questions ? (
              <>
                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-foreground/60">Eligibility</p>
                    <p className="text-2xl font-bold mt-1">
                      {questions.eligibility.filter((q) => q.isActive).length}
                    </p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-foreground/60">Company</p>
                    <p className="text-2xl font-bold mt-1">
                      {questions.company.filter((q) => q.isActive).length}
                    </p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-foreground/60">Financial</p>
                    <p className="text-2xl font-bold mt-1">
                      {questions.financial.filter((q) => q.isActive).length}
                    </p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-foreground/60">Sector</p>
                    <p className="text-2xl font-bold mt-1">
                      {questions.sector.filter((q) => q.isActive).length}
                    </p>
                  </div>
                </div>

                {/* Question Lists */}
                <QuestionList
                  eligibility={questions.eligibility}
                  company={questions.company}
                  financial={questions.financial}
                  sector={questions.sector}
                />
              </>
            ) : (
              <div className="glass rounded-2xl p-6 text-center">
                <p className="text-sm text-foreground/70">Failed to load questions</p>
              </div>
            )}
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
