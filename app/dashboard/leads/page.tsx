import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getLeads } from "@/actions/lead"
import { getStatusDisplay } from "@/lib/types"
import { EmptyState } from "@/components/empty-state"
import { ClickableRow } from "@/components/clickable-row"
import { LeadCard } from "@/components/lead-card"
import { FileText, Plus } from "lucide-react"

export default async function LeadsPage() {
  // 1. Verify authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  // 2. Fetch leads
  const result = await getLeads()

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="glass rounded-2xl p-6 text-center text-danger">
          <p>Error: {result.error}</p>
        </div>
      </div>
    )
  }

  const leads = result.data
  const isReviewer = session.user.role === "REVIEWER"

  return (
    <div className="p-4 md:p-6">
      {/* Action Button */}
      {isReviewer && (
        <div className="flex justify-end mb-6">
          <Link
            href="/dashboard/leads/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-3 md:px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Lead</span>
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-6">
        <div className="glass space-y-1 rounded-xl p-4">
          <p className="text-sm text-foreground/70">Total Leads</p>
          <p className="text-2xl font-bold">{leads.length}</p>
        </div>
        <div className="glass space-y-1 rounded-xl p-4">
          <p className="text-sm text-foreground/70">New</p>
          <p className="text-2xl font-bold">
            {leads.filter((l) => l.status === "NEW").length}
          </p>
        </div>
        <div className="glass space-y-1 rounded-xl p-4">
          <p className="text-sm text-foreground/70">In Progress</p>
          <p className="text-2xl font-bold">
            {leads.filter((l) => l.status === "ASSIGNED" || l.status === "IN_REVIEW").length}
          </p>
        </div>
        <div className="glass space-y-1 rounded-xl p-4">
          <p className="text-sm text-foreground/70">Completed</p>
          <p className="text-2xl font-bold">
            {leads.filter((l) => l.status === "COMPLETED").length}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {leads.length === 0 && (
        <div className="glass rounded-2xl mt-6">
          <EmptyState
            icon={FileText}
            title="No leads yet"
            description={
              isReviewer
                ? "Create your first lead to start tracking client assessments"
                : "No leads have been assigned to you yet"
            }
            action={
              isReviewer
                ? {
                    label: "Create New Lead",
                    href: "/dashboard/leads/new",
                  }
                : undefined
            }
          />
        </div>
      )}

      {/* Mobile: Card List (< 768px) */}
      {leads.length > 0 && (
        <div className="md:hidden space-y-3 mt-6">
          {leads.map((lead) => {
            const status = getStatusDisplay(lead.status)
            return (
              <LeadCard
                key={lead.id}
                lead={lead}
                statusColor={status.color}
                statusLabel={status.label}
              />
            )
          })}
        </div>
      )}

      {/* Desktop: Table (≥ 768px) */}
      {leads.length > 0 && (
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
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-foreground/70">
                    Assessment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-foreground/70">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {leads.map((lead) => {
                  const status = getStatusDisplay(lead.status)
                  return (
                    <ClickableRow key={lead.id} href={`/dashboard/leads/${lead.leadId}`}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        {lead.leadId}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{lead.companyName}</p>
                          <p className="text-sm text-foreground/70">
                            {lead.contactPerson}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {lead.assignedAssessor ? (
                          <div>
                            <p className="font-medium">{lead.assignedAssessor.name}</p>
                            <p className="text-xs text-foreground/70">
                              {lead.assignedAssessor.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-foreground/50">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {lead.assessment ? (
                          <div>
                            <p className="font-medium">
                              {lead.assessment.percentage
                                ? `${lead.assessment.percentage.toFixed(1)}%`
                                : "In Progress"}
                            </p>
                            {lead.assessment.rating && (
                              <p className="text-xs text-foreground/70">
                                {lead.assessment.rating.replace(/_/g, " ")}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-foreground/50">Not started</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground/70">
                        {new Date(lead.createdAt).toLocaleDateString()}
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