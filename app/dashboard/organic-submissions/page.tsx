import { verifyRole } from "@/lib/dal"
import { getPendingSubmissions } from "@/actions/organic-submission"
import { SubmissionCard } from "@/components/submission-card"
import { redirect } from "next/navigation"
import { Inbox } from "lucide-react"

export default async function OrganicSubmissionsPage() {
  // Verify user is a reviewer
  try {
    await verifyRole("REVIEWER")
  } catch {
    redirect("/dashboard")
  }

  // Fetch pending submissions
  const result = await getPendingSubmissions()

  if (!result.success) {
    return (
      <div className="p-4 md:p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Organic Lead Submissions</h1>
            <p className="mt-1 text-sm text-foreground/70">Website submissions pending review</p>
          </div>

          <div className="glass rounded-xl p-6 text-center">
            <p className="text-foreground/60">Failed to load submissions. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  const submissions = result.data || []

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Organic Lead Submissions</h1>
          <p className="mt-1 text-sm text-foreground/70">
            {submissions.length === 0
              ? "No pending submissions"
              : `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} pending review`}
          </p>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5">
                <Inbox className="h-8 w-8 text-foreground/30" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">No Pending Submissions</h3>
                <p className="text-sm text-foreground/60">
                  Website submissions will appear here when visitors complete the eligibility checker and submit their details.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
