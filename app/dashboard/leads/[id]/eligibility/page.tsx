import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getLead } from "@/actions/lead"
import { getAssessment } from "@/actions/assessment"
import { EligibilityForm } from "@/components/eligibility-form"
import Link from "next/link"
import { ChevronLeft, AlertCircle } from "lucide-react"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EligibilityPage({ params }: Props) {
  const resolvedParams = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
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

  // Check if already eligible or ineligible
  if (assessment.isEligible !== null) {
    const message = assessment.isEligible
      ? "Eligibility check passed. Proceed to main assessment."
      : "Company is not eligible for IPO assessment."

    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Back Button */}
        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Lead
        </Link>

        {/* Status */}
        <div className="glass rounded-xl p-6 text-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              assessment.isEligible
                ? "bg-green-500/10 text-green-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {assessment.isEligible ? "✓" : "✗"} {message}
          </div>
          {assessment.isEligible && (
            <div className="mt-6">
              <Link
                href={`/dashboard/leads/${lead.id}/assessment`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 h-12 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
              >
                Continue to Main Assessment
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Get question snapshot from assessment
  const snapshot = assessment.questionSnapshot as any
  const eligibilityQuestions = snapshot?.eligibility || []

  if (eligibilityQuestions.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Lead
        </Link>

        <div className="glass rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-foreground/30 mb-4" />
          <p className="text-sm text-foreground/70">
            No eligibility questions found. Please contact the reviewer to add questions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/leads/${lead.id}`}
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

      {/* Instructions */}
      <div className="glass rounded-xl p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold mb-2">Eligibility Check</h3>
        <p className="text-sm text-foreground/70">
          All criteria must be met for the company to be eligible for IPO readiness assessment.
          Check each criterion and provide remarks if needed.
        </p>
      </div>

      {/* Eligibility Form */}
      <EligibilityForm
        assessment={assessment}
        questions={eligibilityQuestions}
        leadId={lead.id}
      />
    </div>
  )
}
