import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getLead } from "@/actions/lead"
import { getAssessmentForStepper } from "@/actions/assessment-stepper"
import { AssessmentStepper } from "@/components/assessment-stepper"
import Link from "next/link"
import { ChevronLeft, AlertCircle } from "lucide-react"

type Props = {
  params: Promise<{ id: string }>
}

export default async function AssessmentPage({ params }: Props) {
  const resolvedParams = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  // Fetch lead and assessment data
  const [leadResult, assessmentResult] = await Promise.all([
    getLead(resolvedParams.id),
    getAssessmentForStepper(resolvedParams.id),
  ])

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

  // Check if Probe42 data is fetched
  if (!assessment.lead.probe42Fetched) {
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
          <p className="text-sm text-foreground/70 mb-4">
            Please fetch company data from Probe42 before starting the assessment.
          </p>
          <Link
            href={`/dashboard/leads/${lead.leadId}/company-details`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 h-12 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
          >
            Go to Company Details
          </Link>
        </div>
      </div>
    )
  }

  // Check if already submitted
  if (assessment.status !== "DRAFT") {
    const statusMessages = {
      SUBMITTED: "Assessment is pending review",
      APPROVED: "Assessment has been approved",
      REJECTED: "Assessment was rejected",
    }

    const statusColors = {
      SUBMITTED: "bg-blue-500/10 text-blue-500",
      APPROVED: "bg-green-500/10 text-green-500",
      REJECTED: "bg-red-500/10 text-red-500",
    }

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
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${statusColors[assessment.status]}`}>
            {statusMessages[assessment.status]}
          </div>

          {assessment.totalScore !== null && (
            <div className="mt-6">
              <p className="text-sm text-foreground/70 mb-2">Assessment Score</p>
              <p className="text-3xl font-bold">
                {assessment.totalScore} / {assessment.maxScore}
              </p>
              <p className="text-sm text-foreground/70 mt-1">
                {assessment.percentage?.toFixed(1)}% - {assessment.rating?.replace(/_/g, " ")}
              </p>
            </div>
          )}
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

      {/* Assessment Stepper */}
      <AssessmentStepper
        assessment={assessment}
        leadId={lead.id}
      />
    </div>
  )
}
