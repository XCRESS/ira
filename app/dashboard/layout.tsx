import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MobileTabBar } from "@/components/mobile-tab-bar"
import { getPendingSubmissionsCount } from "@/actions/organic-submission"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const { user } = session
  const userRole = user.role as "ASSESSOR" | "REVIEWER"

  // Fetch pending submissions count for reviewers
  let pendingSubmissionsCount = 0
  if (userRole === "REVIEWER") {
    const result = await getPendingSubmissionsCount()
    pendingSubmissionsCount = result.success ? result.data : 0
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Desktop: Sidebar + Header */}
      <div className="hidden md:flex h-full">
        <DashboardSidebar userRole={userRole} pendingSubmissionsCount={pendingSubmissionsCount} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader user={{ ...user, role: userRole }} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile: Tab Bar at bottom */}
      <div className="flex md:hidden flex-col h-full">
        <DashboardHeader user={{ ...user, role: userRole }} />
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>
        <MobileTabBar role={userRole} />
      </div>
    </div>
  )
}