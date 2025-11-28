import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getDashboardStats } from "@/actions/lead"
import { measureAsync } from "@/lib/perf"
import {
  FileText,
  BarChart3,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

export default async function DashboardPage() {
  // Verify authentication
  const headersList = await headers()
  const session = await measureAsync("auth.getSession", async () =>
    auth.api.getSession({ headers: headersList })
  )

  if (!session) {
    redirect("/login")
  }

  const { user } = session

  // Fetch dashboard stats (OPTIMIZED - uses COUNT queries)
  const dashboardResult = await measureAsync("getDashboardStats", () => getDashboardStats())
  const { stats, recentLeads } = dashboardResult.success
    ? dashboardResult.data
    : { stats: { total: 0, new: 0, inProgress: 0, completed: 0 }, recentLeads: [] }

  return (
    <div className="p-4 md:p-6">
      {/* Welcome Section */}
      <div className="glass rounded-2xl p-6 mt-6">
        <p className="text-lg font-semibold">Welcome back, {user.name}!</p>
        <p className="mt-1 text-sm text-foreground/70">
          {user.role === "REVIEWER"
            ? "Monitor all assessments and manage your team"
            : "View and complete your assigned assessments"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-6">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground/70">Total</p>
            <FileText className="h-5 w-5 text-foreground/50" />
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-foreground/60 mt-1">All leads</p>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground/70">New</p>
            <AlertCircle className="h-5 w-5 text-foreground/50" />
          </div>
          <p className="text-2xl font-bold">{stats.new}</p>
          <p className="text-xs text-foreground/60 mt-1">Unassigned</p>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground/70">Active</p>
            <Clock className="h-5 w-5 text-foreground/50" />
          </div>
          <p className="text-2xl font-bold">{stats.inProgress}</p>
          <p className="text-xs text-foreground/60 mt-1">In progress</p>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground/70">Done</p>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <p className="text-2xl font-bold">{stats.completed}</p>
          <p className="text-xs text-foreground/60 mt-1">Completed</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        {/* Quick Actions */}
        <div className="glass space-y-4 rounded-2xl p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold">Quick Actions</h2>

          <div className="space-y-2">
            <Link
              href="/dashboard/leads"
              className="flex items-center gap-3 rounded-lg border border-foreground/10 p-4 transition-colors hover:bg-foreground/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">View All Leads</p>
                <p className="text-xs text-foreground/60">{stats.total} total</p>
              </div>
            </Link>

            {user.role === "REVIEWER" && (
              <Link
                href="/dashboard/leads/new"
                className="flex items-center gap-3 rounded-lg border border-foreground/10 p-4 transition-colors hover:bg-foreground/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Create New Lead</p>
                  <p className="text-xs text-foreground/60">Add client company</p>
                </div>
              </Link>
            )}

            {user.role === "ASSESSOR" && (
              <Link
                href="/dashboard/assessments"
                className="flex items-center gap-3 rounded-lg border border-foreground/10 p-4 transition-colors hover:bg-foreground/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">My Assessments</p>
                  <p className="text-xs text-foreground/60">
                    {stats.inProgress} pending
                  </p>
                </div>
              </Link>
            )}

            {user.role === "REVIEWER" && (
              <Link
                href="/dashboard/reviews"
                className="flex items-center gap-3 rounded-lg border border-foreground/10 p-4 transition-colors hover:bg-foreground/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Pending Reviews</p>
                  <p className="text-xs text-foreground/60">
                    {stats.inProgress} to review
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass space-y-4 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Leads</h2>
            <Link
              href="/dashboard/leads"
              className="text-sm text-primary hover:text-primary/80"
            >
              View all →
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-foreground/20" />
              <p className="mt-2 text-sm text-foreground/60">No leads yet</p>
              {user.role === "REVIEWER" && (
                <Link
                  href="/dashboard/leads/new"
                  className="mt-4 inline-block text-sm text-primary hover:text-primary/80"
                >
                  Create your first lead →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {recentLeads.map((lead) => {
                const statusColors: Record<string, string> = {
                  NEW: "bg-blue-500/10 text-blue-500",
                  ASSIGNED: "bg-purple-500/10 text-purple-500",
                  IN_REVIEW: "bg-yellow-500/10 text-yellow-500",
                  PAYMENT_PENDING: "bg-orange-500/10 text-orange-500",
                  COMPLETED: "bg-green-500/10 text-green-500",
                }

                return (
                  <Link
                    key={lead.id}
                    href={`/dashboard/leads/${lead.leadId}`}
                    className="flex items-center justify-between rounded-lg border border-foreground/10 p-4 transition-colors hover:bg-foreground/5"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{lead.companyName}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusColors[lead.status]
                          }`}
                        >
                          {lead.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-foreground/60">
                        {lead.leadId} • {lead.contactPerson}
                        {lead.assignedAssessor &&
                          ` • Assigned to ${lead.assignedAssessor.name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground/60">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                      {lead.assessment?.percentage && (
                        <p className="mt-1 text-sm font-medium text-primary">
                          {lead.assessment.percentage.toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
