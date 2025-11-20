import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { measureAsync } from "@/lib/perf"
import { EmptyState } from "@/components/empty-state"
import { ClickableRow } from "@/components/clickable-row"
import { FileCheck } from "lucide-react"

export default async function ReviewsPage() {
  const pageStart = performance.now()

  // 1. Verify authentication - Reviewers only
  const headersList = await headers()
  const session = await measureAsync("auth.getSession", async () =>
    auth.api.getSession({ headers: headersList })
  )

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "REVIEWER") {
    redirect("/dashboard")
  }

  // 2. Fetch all assessments relevant to reviewers
  const assessments = await measureAsync("reviews.findMany", () =>
    prisma.assessment.findMany({
      where: {
        status: {
          in: ["SUBMITTED", "APPROVED", "REJECTED"],
        },
      },
      include: {
        lead: {
          include: {
            assignedAssessor: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { submittedAt: "desc" },
        { updatedAt: "desc" },
      ],
    })
  )

  // 3. Calculate stats
  const pendingReviews = assessments.filter((a) => a.status === "SUBMITTED").length
  const approvedCount = assessments.filter((a) => a.status === "APPROVED").length
  const rejectedCount = assessments.filter((a) => a.status === "REJECTED").length

  const avgScore = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + (a.percentage || 0), 0) / assessments.length
    : 0

  // Log page performance
  const pageDuration = performance.now() - pageStart
  if (pageDuration > 100) {
    console.log(`🐢 Reviews page total: ${pageDuration.toFixed(2)}ms`)
  }

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Assessment Reviews</h1>
        <p className="text-sm text-foreground/70 mt-1">
          Review submitted assessments and approve or request changes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="glass space-y-1 rounded-xl p-4">
          <p className="text-sm text-foreground/70">Pending Reviews</p>
          <p className="text-2xl font-bold">{pendingReviews}</p>
        </div>
        <div className="glass space-y-1 rounded-xl p-4">
          <p className="text-sm text-foreground/70">Approved</p>
          <p className="text-2xl font-bold text-success">{approvedCount}</p>
        </div>
        <div className="glass space-y-1 rounded-xl p-4">
          <p className="text-sm text-foreground/70">Rejected</p>
          <p className="text-2xl font-bold text-danger">{rejectedCount}</p>
        </div>
        <div className="glass space-y-1 rounded-xl p-4">
          <p className="text-sm text-foreground/70">Avg Score</p>
          <p className="text-2xl font-bold">{avgScore.toFixed(1)}%</p>
        </div>
      </div>

      {/* Empty State */}
      {assessments.length === 0 && (
        <div className="glass rounded-2xl mt-6">
          <EmptyState
            icon={FileCheck}
            title="No assessments to review"
            description="Assessments will appear here once assessors submit them for review"
          />
        </div>
      )}

      {/* Mobile: Card List (< 768px) */}
      {assessments.length > 0 && (
        <div className="md:hidden space-y-3 mt-6">
          {assessments.map((assessment) => {
            const ratingColor =
              assessment.rating === "IPO_READY"
                ? "bg-success/10 text-success border-success/20"
                : assessment.rating === "NEEDS_IMPROVEMENT"
                ? "bg-warning/10 text-warning border-warning/20"
                : "bg-danger/10 text-danger border-danger/20"

            const statusColor =
              assessment.status === "SUBMITTED"
                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                : assessment.status === "APPROVED"
                ? "bg-success/10 text-success border-success/20"
                : "bg-danger/10 text-danger border-danger/20"

            return (
              <Link
                key={assessment.id}
                href={`/dashboard/leads/${assessment.lead.leadId}/review`}
                className="glass block rounded-xl p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{assessment.lead.companyName}</p>
                    <p className="text-xs text-foreground/70">{assessment.lead.leadId}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {assessment.percentage?.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium border ${statusColor}`}>
                    {assessment.status}
                  </span>
                  {assessment.rating && (
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium border ${ratingColor}`}>
                      {assessment.rating.replace(/_/g, " ")}
                    </span>
                  )}
                </div>

                <div className="text-xs text-foreground/70 space-y-1">
                  <p>Assessor: {assessment.lead.assignedAssessor?.name}</p>
                  <p>Submitted: {assessment.submittedAt ? new Date(assessment.submittedAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Desktop: Table (≥ 768px) */}
      {assessments.length > 0 && (
        <div className="hidden md:block glass overflow-hidden rounded-2xl mt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-foreground/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-foreground/70">
                    Lead ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-foreground/70">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-foreground/70">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-foreground/70">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-foreground/70">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-foreground/70">
                    Assessor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-foreground/70">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {assessments.map((assessment) => {
                  const ratingColor =
                    assessment.rating === "IPO_READY"
                      ? "bg-success/10 text-success border-success/20"
                      : assessment.rating === "NEEDS_IMPROVEMENT"
                      ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-danger/10 text-danger border-danger/20"

                  const statusColor =
                    assessment.status === "SUBMITTED"
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      : assessment.status === "APPROVED"
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-danger/10 text-danger border-danger/20"

                  return (
                    <ClickableRow
                      key={assessment.id}
                      href={`/dashboard/leads/${assessment.lead.leadId}/review`}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        {assessment.lead.leadId}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{assessment.lead.companyName}</p>
                          <p className="text-sm text-foreground/70">
                            {assessment.lead.contactPerson}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium border ${statusColor}`}>
                          {assessment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-bold text-primary">
                          {assessment.percentage?.toFixed(1)}%
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {assessment.rating ? (
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium border ${ratingColor}`}>
                            {assessment.rating.replace(/_/g, " ")}
                          </span>
                        ) : (
                          <span className="text-foreground/50">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {assessment.lead.assignedAssessor ? (
                          <div>
                            <p className="font-medium">{assessment.lead.assignedAssessor.name}</p>
                            <p className="text-xs text-foreground/70">
                              {assessment.lead.assignedAssessor.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-foreground/50">Unassigned</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground/70">
                        {assessment.submittedAt
                          ? new Date(assessment.submittedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </ClickableRow>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
