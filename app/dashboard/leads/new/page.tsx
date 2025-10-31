import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { LeadForm } from "@/components/lead-form"
import { Breadcrumbs } from "@/components/breadcrumbs"

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
    <div className="space-y-6 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Leads", href: "/dashboard/leads" },
            { label: "New Lead" },
          ]}
        />

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Create New Lead</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Add a new client company to the IPO readiness assessment pipeline
          </p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-8">
          <LeadForm />
        </div>
      </div>
    </div>
  )
}