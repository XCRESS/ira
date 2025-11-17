import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getLead } from "@/actions/lead"
import { getAssessment } from "@/actions/assessment"
import { getAssessmentQuestions } from "@/actions/assessment-questions"
import { AssessmentForm } from "@/components/assessment-form"
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

  // ✅ PERFORMANCE: Parallelize data fetching
  const [leadResult, assessmentResult] = await Promise.all([
    getLead(resolvedParams.id),
    getAssessment(resolvedParams.id),
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

  // Check if eligibility completed
  if (assessment.isEligible === null) {
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
            Please complete the eligibility check first.
          </p>
          <Link
            href={`/dashboard/leads/${lead.leadId}/eligibility`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 h-12 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
          >
            Go to Eligibility Check
          </Link>
        </div>
      </div>
    )
  }

  // Check if ineligible
  if (!assessment.isEligible) {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500">
            ✗ Company is not eligible for IPO assessment
          </div>
        </div>
      </div>
    )
  }

  // Check if already submitted
  if (assessment.status !== "DRAFT") {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500">
            Assessment {assessment.status.toLowerCase()}
          </div>
          <p className="mt-4 text-sm text-foreground/70">
            {assessment.status === "SUBMITTED" && "Waiting for reviewer approval"}
            {assessment.status === "APPROVED" && "Assessment has been approved"}
            {assessment.status === "REJECTED" && "Assessment was rejected. You can edit and resubmit."}
          </p>
        </div>
      </div>
    )
  }

  // Get questions from assessment snapshot (per-assessment questions)
  const questionsResult = await getAssessmentQuestions(assessment.id)
  const allQuestions = questionsResult.success && !Array.isArray(questionsResult.data)
    ? questionsResult.data
    : { company: [], financial: [], sector: [], eligibility: [] }

  const companyQuestions = allQuestions.company || []
  const financialQuestions = allQuestions.financial || []
  const sectorQuestions = allQuestions.sector || []

  const totalQuestions = companyQuestions.length + financialQuestions.length + sectorQuestions.length

  if (totalQuestions === 0) {
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
            No assessment questions found. You can add questions specific to this company.
          </p>
          {assessment.status === "DRAFT" && (
            <Link
              href={`/dashboard/leads/${lead.leadId}/assessment/manage`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 h-12 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
            >
              Add Assessment Questions
            </Link>
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

      {/* Manage Questions Link */}
      {assessment.status === "DRAFT" && (
        <div className="glass rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold mb-1">Assessment Questions</h3>
              <p className="text-xs text-foreground/60">
                Company: {companyQuestions.length} • Financial: {financialQuestions.length} • Sector: {sectorQuestions.length}
              </p>
            </div>
            <Link
              href={`/dashboard/leads/${lead.leadId}/assessment/manage`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 px-4 h-10 rounded-lg bg-background/50 hover:bg-background/70"
            >
              Manage Questions
            </Link>
          </div>
        </div>
      )}

      {/* Assessment Form */}
      <AssessmentForm
        assessment={assessment}
        companyQuestions={companyQuestions}
        financialQuestions={financialQuestions}
        sectorQuestions={sectorQuestions}
        leadId={lead.id}
      />
    </div>
  )
}
