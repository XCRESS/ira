import { verifyRole } from "@/lib/dal"
import { getPendingSubmissions } from "@/actions/organic-submission"
import { SubmissionCard } from "@/components/submission-card"
import { redirect } from "next/navigation"

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
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Organic Lead Submissions</h1>
            <p className="text-sm text-muted">Website submissions pending review</p>
          </div>
        </div>

        <div className="glass rounded-xl p-6 text-center">
          <p className="text-muted">Failed to load submissions. Please try again.</p>
        </div>
      </div>
    )
  }

  const submissions = result.data || []

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organic Lead Submissions</h1>
          <p className="text-sm text-muted">
            {submissions.length === 0
              ? "No pending submissions"
              : `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} pending review`}
          </p>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">No Pending Submissions</h3>
              <p className="text-sm text-muted">
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
  )
}
