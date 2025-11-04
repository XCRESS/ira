import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { SettingsTabs } from "@/components/settings-tabs"
import { getQuestions } from "@/actions/question"

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  // Fetch questions if reviewer
  let questions = null
  if (session.user.role === "REVIEWER") {
    const result = await getQuestions(true)
    if (result.success) {
      questions = result.data
    }
  }

  return (
    <div className="p-4 md:p-6">
      <SettingsTabs
        userRole={session.user.role as "ASSESSOR" | "REVIEWER"}
        questions={questions}
      />
    </div>
  )
}