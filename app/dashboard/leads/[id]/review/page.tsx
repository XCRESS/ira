import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getLead } from "@/actions/lead"
import { getAssessment } from "@/actions/assessment"
import { ReviewForm } from "@/components/review-form"
import Link from "next/link"
import { ChevronLeft, AlertCircle } from "lucide-react"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: Props) {
  const resolvedParams = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  // Only reviewers can access this page
  if (session.user.role !== "REVIEWER") {
    redirect("/dashboard")
  }

  // Fetch lead
  const leadResult = await getLead(resolvedParams.id)
  if (!leadResult.success || !leadResult.data) {
    return (
      <div className="p-4 md:p-6">
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-sm text-foreground/70">Lead not found</p>
        </div>
      </div>
    )
  }

  const lead = leadResult.data

  // Fetch assessment
  const assessmentResult = await getAssessment(lead.id)
  if (!assessmentResult.success || !assessmentResult.data) {
    return (
      <div className="p-4 md:p-6">
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-sm text-foreground/70">No assessment found for this lead</p>
        </div>
      </div>
    )
  }

  const assessment = assessmentResult.data

  // Check if assessment is submitted
  if (assessment.status !== "SUBMITTED") {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <Link
          href={`/dashboard/leads/${lead.leadId}`}
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Lead
        </Link>

        <div className="glass rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-foreground/30 mb-4" />
          <p className="text-sm text-foreground/70 mb-2">
            Assessment is {assessment.status.toLowerCase()}
          </p>
          <p className="text-xs text-foreground/60">
            {assessment.status === "DRAFT" && "Waiting for assessor to submit"}
            {assessment.status === "APPROVED" && "Assessment has been approved"}
            {assessment.status === "REJECTED" && "Assessment was rejected"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/leads/${lead.leadId}`}
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Lead
        </Link>

        <div className="glass rounded-xl p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold">{lead.companyName}</h2>
          <p className="text-sm text-foreground/70 mt-1">{lead.leadId}</p>
        </div>
      </div>

      {/* Review Form - now uses new preset questionnaire system */}
      <ReviewForm
        assessment={assessment}
        leadId={lead.leadId}
      />
    </div>
  )
}
