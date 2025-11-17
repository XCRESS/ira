import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getLead } from "@/actions/lead"
import { getAssessment } from "@/actions/assessment"
import { getAssessmentQuestions } from "@/actions/assessment-questions"
import { getQuestions } from "@/actions/question"
import { ManageAssessmentQuestions } from "@/components/manage-assessment-questions"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ManageAssessmentQuestionsPage({ params }: Props) {
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

  // Only allow editing in DRAFT status
  if (assessment.status !== "DRAFT") {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <Link
          href={`/dashboard/leads/${lead.leadId}/assessment`}
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Assessment
        </Link>

        <div className="glass rounded-xl p-6 text-center">
          <p className="text-sm text-foreground/70">
            Questions cannot be modified after assessment is submitted
          </p>
        </div>
      </div>
    )
  }

  // Get current assessment questions
  const currentQuestionsResult = await getAssessmentQuestions(assessment.id)
  const currentQuestions = currentQuestionsResult.success && !Array.isArray(currentQuestionsResult.data)
    ? currentQuestionsResult.data
    : { company: [], financial: [], sector: [], eligibility: [] }

  // Get template questions from global bank (for reference/quick add)
  const templateQuestionsResult = await getQuestions(false)
  const templateQuestions = templateQuestionsResult.success
    ? templateQuestionsResult.data
    : { company: [], financial: [], sector: [], eligibility: [] }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/leads/${lead.leadId}/assessment`}
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Assessment
        </Link>

        <div className="glass rounded-xl p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold">{lead.companyName}</h2>
          <p className="text-sm text-foreground/70 mt-1">{lead.leadId}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="glass rounded-xl p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold mb-2">Manage Assessment Questions</h3>
        <p className="text-sm text-foreground/70 mb-2">
          Customize questions for this specific company. You can:
        </p>
        <ul className="text-sm text-foreground/70 space-y-1 ml-4">
          <li>• Add custom questions unique to this company</li>
          <li>• Edit question text to match company context</li>
          <li>• Remove irrelevant questions</li>
          <li>• Reorder questions by drag-and-drop</li>
          <li>• Use template questions as a starting point</li>
        </ul>
        <p className="text-sm text-foreground/60 mt-4 italic">
          Note: Questions can only be edited while the assessment is in DRAFT status. Once submitted, they become locked for audit purposes.
        </p>
      </div>

      {/* Question Management Component */}
      <ManageAssessmentQuestions
        assessmentId={assessment.id}
        leadId={lead.leadId}
        currentQuestions={currentQuestions}
        templateQuestions={templateQuestions}
      />
    </div>
  )
}
