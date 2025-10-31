import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getLead, getAssessors } from "@/actions/lead"
import { getStatusDisplay } from "@/lib/types"
import { AssignAssessorForm } from "@/components/assign-assessor-form"
import { Breadcrumbs } from "@/components/breadcrumbs"

type Props = {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage(props: Props) {
  const params = await props.params

  // 1. Verify authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  // 2. Fetch lead
  const leadResult = await getLead(params.id)

  if (!leadResult.success) {
    return (
      <div className="p-6">
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-danger">{leadResult.error}</p>
          <Link
            href="/dashboard/leads"
            className="mt-4 inline-block text-sm text-primary hover:text-primary/80"
          >
            ← Back to Leads
          </Link>
        </div>
      </div>
    )
  }

  const lead = leadResult.data
  const isReviewer = session.user.role === "REVIEWER"
  const status = getStatusDisplay(lead.status)

  // 3. Fetch assessors if reviewer
  let assessors: Array<{ id: string; name: string; email: string }> = []
  if (isReviewer) {
    const assessorsResult = await getAssessors()
    if (assessorsResult.success) {
      assessors = assessorsResult.data
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Breadcrumbs
        items={[
          { label: "Leads", href: "/dashboard/leads" },
          { label: lead.companyName },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{lead.companyName}</h1>
        <span
          className={`inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${status.color}`}
        >
          {status.label}
        </span>
      </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Company Information */}
            <div className="glass space-y-4 rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Company Information</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-foreground/70">CIN</p>
                  <p className="mt-1 font-mono text-sm">{lead.cin}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Contact Person</p>
                  <p className="mt-1 text-sm font-medium">{lead.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Email</p>
                  <p className="mt-1 text-sm">{lead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Phone</p>
                  <p className="mt-1 text-sm">{lead.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground/70">Registered Address</p>
                <p className="mt-1 text-sm">{lead.address}</p>
              </div>
            </div>

            {/* Assessment Status */}
            {lead.assessment && (
              <div className="glass space-y-4 rounded-2xl p-6">
                <h2 className="text-lg font-semibold">Assessment Status</h2>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-foreground/70">Status</p>
                    <p className="mt-1 text-sm font-medium">
                      {lead.assessment.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Score</p>
                    <p className="mt-1 text-sm font-medium">
                      {lead.assessment.percentage
                        ? `${lead.assessment.percentage.toFixed(1)}%`
                        : "Not scored"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Rating</p>
                    <p className="mt-1 text-sm font-medium">
                      {lead.assessment.rating
                        ? lead.assessment.rating.replace(/_/g, " ")
                        : "Not rated"}
                    </p>
                  </div>
                </div>

                {session.user.role === "ASSESSOR" &&
                  lead.assignedAssessor?.id === session.user.id && (
                    <Link
                      href={`/dashboard/assessment/${lead.assessment.id}`}
                      className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Open Assessment →
                    </Link>
                  )}
              </div>
            )}

            {/* Documents */}
            <div className="glass space-y-4 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Documents</h2>
                <span className="text-sm text-foreground/70">
                  {lead._count.documents} file{lead._count.documents !== 1 ? "s" : ""}
                </span>
              </div>

              {lead._count.documents === 0 ? (
                <p className="text-sm text-foreground/60">No documents uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-foreground/60">
                    Document management coming soon
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment */}
            <div className="glass space-y-4 rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Assignment</h2>

              {lead.assignedAssessor ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-foreground/70">Assigned To</p>
                    <p className="mt-1 font-medium">{lead.assignedAssessor.name}</p>
                    <p className="text-sm text-foreground/60">
                      {lead.assignedAssessor.email}
                    </p>
                  </div>

                  {isReviewer && (
                    <details className="pt-2">
                      <summary className="cursor-pointer text-sm text-primary hover:text-primary/80">
                        Change assessor
                      </summary>
                      <div className="mt-3">
                        <AssignAssessorForm
                          leadId={lead.id}
                          assessors={assessors}
                          currentAssessorId={lead.assignedAssessor.id}
                        />
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div>
                  {isReviewer ? (
                    <>
                      <p className="text-sm text-foreground/60">
                        No assessor assigned yet
                      </p>
                      <div className="mt-4">
                        <AssignAssessorForm
                          leadId={lead.id}
                          assessors={assessors}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-foreground/60">
                      Waiting for assignment
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Created By */}
            <div className="glass space-y-4 rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Created By</h2>
              <div>
                <p className="font-medium">{lead.createdBy.name}</p>
                <p className="text-sm text-foreground/60">{lead.createdBy.email}</p>
                <p className="mt-2 text-xs text-foreground/60">
                  {new Date(lead.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
