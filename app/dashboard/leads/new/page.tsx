import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { LeadCreationFlow } from "@/components/lead-creation-flow"

export default async function NewLeadPage() {
  // 1. Verify authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  // 2. Check if user is a reviewer
  if (session.user.role !== "REVIEWER") {
    redirect("/dashboard/leads")
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-2xl">
        {/* Lead Creation Flow - No h1 since breadcrumb exists */}
        <LeadCreationFlow />
      </div>
    </div>
  )
}