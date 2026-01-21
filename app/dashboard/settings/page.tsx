import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { measureAsync } from "@/lib/perf"
import { SettingsTabs } from "@/components/settings-tabs"

export default async function SettingsPage() {
  const headersList = await headers()
  const session = await measureAsync("auth.getSession", async () =>
    auth.api.getSession({ headers: headersList })
  )

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="p-4 md:p-6">
      <SettingsTabs
        userRole={session.user.role as "ASSESSOR" | "REVIEWER"}
      />
    </div>
  )
}
