"use client"

import { useState, useTransition } from "react"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import type { Assessment } from "@prisma/client"
import { approveAssessment, rejectAssessment } from "@/actions/assessment"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ReviewEligibilitySection } from "./review-eligibility-section"
import { ReviewAssessmentSection } from "./review-assessment-section"
import { ReviewApproveDialog } from "./review-approve-dialog"
import { ReviewRejectDialog } from "./review-reject-dialog"

type Question = {
  id: string
  text: string
  helpText: string | null
  order: number
}

type EligibilityAnswer = {
  checked: boolean
  remark?: string
}

type Answer = {
  score: -1 | 0 | 1 | 2
  remark?: string
  evidenceLink?: string
}

type ReviewHistoryEntry = {
  reviewedAt: string
  action: "APPROVED" | "REJECTED"
  comments: string
  reviewerId: string
  reviewerName: string
}

type Props = {
  assessment: Assessment & {
    assessor: { id: string; name: string; email: string }
  }
  eligibilityQuestions: Question[]
  companyQuestions: Question[]
  financialQuestions: Question[]
  sectorQuestions: Question[]
  leadId: string
}

type Section = "eligibility" | "company" | "financial" | "sector"

export function ReviewForm({
  assessment,
  eligibilityQuestions,
  companyQuestions,
  financialQuestions,
  sectorQuestions,
  leadId,
}: Props) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<Section>("eligibility")
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [comments, setComments] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [isPending, startTransition] = useTransition()

  const eligibilityAnswers = assessment.eligibilityAnswers as Record<string, EligibilityAnswer>
  const companyAnswers = assessment.companyAnswers as Record<string, Answer>
  const financialAnswers = assessment.financialAnswers as Record<string, Answer>
  const sectorAnswers = assessment.sectorAnswers as Record<string, Answer>
  const reviewHistory = (assessment.reviewHistory as ReviewHistoryEntry[]) || []

  const handleApprove = () => {
    if (assessment.usesOldQuestions && confirmText !== "USEOLDQUESTIONS") {
      toast.error('Please type "USEOLDQUESTIONS" to confirm approval')
      return
    }

    startTransition(async () => {
      const result = await approveAssessment(assessment.id, {
        comments,
        confirmOldQuestions: assessment.usesOldQuestions ? true : undefined,
      })

      if (result.success) {
        toast.success("Assessment approved")
        router.push(`/dashboard/leads/${leadId}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleReject = () => {
    if (comments.trim().length < 10) {
      toast.error("Please provide detailed feedback (min 10 characters)")
      return
    }

    startTransition(async () => {
      const result = await rejectAssessment(assessment.id, { comments })

      if (result.success) {
        toast.success("Assessment rejected and sent back to assessor")
        router.push(`/dashboard/leads/${leadId}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  const scoreColor = (score: number) => {
    if (score === -1) return "text-red-500"
    if (score === 0) return "text-foreground/60"
    if (score === 1) return "text-yellow-500"
    return "text-green-500"
  }

  const scoreLabel = (score: number) => {
    if (score === -1) return "No"
    if (score === 0) return "NA"
    if (score === 1) return "Maybe"
    return "Yes"
  }

  const ratingColor = (rating: string | null) => {
    if (rating === "IPO_READY") return "bg-green-500/10 text-green-500"
    if (rating === "NEEDS_IMPROVEMENT") return "bg-yellow-500/10 text-yellow-500"
    return "bg-red-500/10 text-red-500"
  }

  const ratingLabel = (rating: string | null) => {
    if (rating === "IPO_READY") return "IPO Ready"
    if (rating === "NEEDS_IMPROVEMENT") return "Needs Improvement"
    return "Not Ready"
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Old Questions Warning */}
      {assessment.usesOldQuestions && (
        <div className="glass rounded-xl p-4 md:p-6 border-2 border-yellow-500/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Using Outdated Questions</p>
              <p className="text-sm text-foreground/70 mt-1">
                This assessment was submitted using an older version of the question bank.
                You must type <span className="font-mono font-semibold">USEOLDQUESTIONS</span> to approve.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Score Summary */}
      <div className="glass rounded-xl p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold mb-4">Assessment Score</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-foreground/60 mb-1">Total Score</p>
            <p className="text-2xl font-bold">{assessment.totalScore}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-foreground/60 mb-1">Percentage</p>
            <p className="text-2xl font-bold">{assessment.percentage?.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-foreground/60 mb-1">Rating</p>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${ratingColor(assessment.rating)}`}>
              {ratingLabel(assessment.rating)}
            </div>
          </div>
        </div>
      </div>

      {/* Assessor Info */}
      <div className="glass rounded-xl p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold mb-3">Assessed By</h3>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {assessment.assessor.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">{assessment.assessor.name}</p>
            <p className="text-xs text-foreground/60">{assessment.assessor.email}</p>
          </div>
        </div>
        {assessment.submittedAt && (
          <p className="mt-3 text-xs text-foreground/60">
            Submitted: {new Date(assessment.submittedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Review History */}
      {reviewHistory.length > 0 && (
        <div className="glass rounded-xl p-4 md:p-6">
          <h3 className="text-sm md:text-base font-semibold mb-3">Review History</h3>
          <div className="space-y-3">
            {reviewHistory.map((entry, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-foreground/5">
                <div className="flex-shrink-0 mt-1">
                  {entry.action === "APPROVED" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${entry.action === "APPROVED" ? "text-green-500" : "text-red-500"}`}>
                      {entry.action}
                    </span>
                    <span className="text-xs text-foreground/60">•</span>
                    <span className="text-xs text-foreground/60">{entry.reviewerName}</span>
                  </div>
                  {entry.comments && (
                    <p className="text-xs text-foreground/70">{entry.comments}</p>
                  )}
                  <p className="text-xs text-foreground/60 mt-1">
                    {new Date(entry.reviewedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-4">
          <button
            onClick={() => setActiveSection("eligibility")}
            className={`p-3 text-xs md:text-sm font-medium transition-colors ${
              activeSection === "eligibility"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            Elig.
          </button>
          <button
            onClick={() => setActiveSection("company")}
            className={`p-3 text-xs md:text-sm font-medium transition-colors border-x border-foreground/10 ${
              activeSection === "company"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            <span className="hidden md:inline">Company</span>
            <span className="md:hidden">Co.</span>
          </button>
          <button
            onClick={() => setActiveSection("financial")}
            className={`p-3 text-xs md:text-sm font-medium transition-colors border-r border-foreground/10 ${
              activeSection === "financial"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            <span className="hidden md:inline">Financial</span>
            <span className="md:hidden">Fin.</span>
          </button>
          <button
            onClick={() => setActiveSection("sector")}
            className={`p-3 text-xs md:text-sm font-medium transition-colors ${
              activeSection === "sector"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            Sector
          </button>
        </div>
      </div>

      {/* Questions Display */}
      {activeSection === "eligibility" && (
        <ReviewEligibilitySection
          questions={eligibilityQuestions}
          answers={eligibilityAnswers}
        />
      )}

      {activeSection === "company" && (
        <ReviewAssessmentSection
          questions={companyQuestions}
          answers={companyAnswers}
          scoreColor={scoreColor}
          scoreLabel={scoreLabel}
        />
      )}

      {activeSection === "financial" && (
        <ReviewAssessmentSection
          questions={financialQuestions}
          answers={financialAnswers}
          scoreColor={scoreColor}
          scoreLabel={scoreLabel}
        />
      )}

      {activeSection === "sector" && (
        <ReviewAssessmentSection
          questions={sectorQuestions}
          answers={sectorAnswers}
          scoreColor={scoreColor}
          scoreLabel={scoreLabel}
        />
      )}

      {/* Action Buttons (Fixed on Mobile above tab bar) */}
      <div className="fixed md:static bottom-16 md:bottom-0 left-0 right-0 z-50 p-4 md:p-0 glass-strong md:glass md:rounded-xl border-t md:border-none border-foreground/10">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={isPending}
            className="rounded-lg border-2 border-red-500/30 bg-red-500/10 text-red-500 px-4 h-12 md:h-10 text-base md:text-sm font-medium hover:bg-red-500/20 active:scale-95 transition-transform disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => setShowApproveDialog(true)}
            disabled={isPending}
            className="rounded-lg bg-green-500 px-4 h-12 md:h-10 text-base md:text-sm font-medium text-white hover:bg-green-500/90 active:scale-95 transition-transform disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      </div>

      {/* Approve Dialog */}
      {showApproveDialog && (
        <ReviewApproveDialog
          onConfirm={handleApprove}
          onCancel={() => {
            setShowApproveDialog(false)
            setComments("")
            setConfirmText("")
          }}
          comments={comments}
          setComments={setComments}
          confirmText={confirmText}
          setConfirmText={setConfirmText}
          requireConfirmation={assessment.usesOldQuestions}
          isPending={isPending}
        />
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <ReviewRejectDialog
          onConfirm={handleReject}
          onCancel={() => {
            setShowRejectDialog(false)
            setComments("")
          }}
          comments={comments}
          setComments={setComments}
          isPending={isPending}
        />
      )}
    </div>
  )
}
