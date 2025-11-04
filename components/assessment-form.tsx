"use client"

import { useState, useEffect, useTransition } from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import type { Assessment } from "@prisma/client"
import {
  updateAllAssessmentAnswers,
  submitAssessment,
  restartAssessmentWithNewQuestions,
  checkQuestionVersion,
} from "@/actions/assessment"
import { AUTO_SAVE } from "@/lib/constants"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AssessmentQuestionSection } from "./assessment-question-section"
import { ConfirmOldQuestionsDialog } from "./confirm-old-questions-dialog"

type Question = {
  id: string
  text: string
  helpText: string | null
  order: number
}

type Answer = {
  score: -1 | 0 | 1 | 2
  remark?: string
  evidenceLink?: string
}

type Props = {
  assessment: Assessment
  companyQuestions: Question[]
  financialQuestions: Question[]
  sectorQuestions: Question[]
  leadId: string
}

type Section = "company" | "financial" | "sector"

export function AssessmentForm({
  assessment,
  companyQuestions,
  financialQuestions,
  sectorQuestions,
  leadId,
}: Props) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<Section>("company")
  const [isOutdated, setIsOutdated] = useState(false)
  const [isCheckingVersion, setIsCheckingVersion] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  // Company answers
  const [companyAnswers, setCompanyAnswers] = useState<Record<string, Answer>>(() => {
    const existing = assessment.companyAnswers as Record<string, Answer>
    const initial: Record<string, Answer> = {}
    companyQuestions.forEach((q) => {
      initial[q.id] = existing[q.id] || { score: 0, remark: "", evidenceLink: "" }
    })
    return initial
  })

  // Financial answers
  const [financialAnswers, setFinancialAnswers] = useState<Record<string, Answer>>(() => {
    const existing = assessment.financialAnswers as Record<string, Answer>
    const initial: Record<string, Answer> = {}
    financialQuestions.forEach((q) => {
      initial[q.id] = existing[q.id] || { score: 0, remark: "", evidenceLink: "" }
    })
    return initial
  })

  // Sector answers
  const [sectorAnswers, setSectorAnswers] = useState<Record<string, Answer>>(() => {
    const existing = assessment.sectorAnswers as Record<string, Answer>
    const initial: Record<string, Answer> = {}
    sectorQuestions.forEach((q) => {
      initial[q.id] = existing[q.id] || { score: 0, remark: "", evidenceLink: "" }
    })
    return initial
  })

  const [isPending, startTransition] = useTransition()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [dirtyFields, setDirtyFields] = useState<Set<'company' | 'financial' | 'sector'>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check question version on mount
  useEffect(() => {
    setIsCheckingVersion(true)
    checkQuestionVersion(assessment.questionSnapshotVersion).then((result) => {
      if (result.success && result.data.isOutdated) {
        setIsOutdated(true)
      }
      setIsCheckingVersion(false)
    }).catch(() => {
      setIsCheckingVersion(false)
    })
  }, [assessment.questionSnapshotVersion])

  // Track which sections have changed
  useEffect(() => {
    setDirtyFields(prev => new Set(prev).add('company'))
  }, [companyAnswers])

  useEffect(() => {
    setDirtyFields(prev => new Set(prev).add('financial'))
  }, [financialAnswers])

  useEffect(() => {
    setDirtyFields(prev => new Set(prev).add('sector'))
  }, [sectorAnswers])

  // Unified auto-save with retry logic (prevents race conditions)
  useEffect(() => {
    if (dirtyFields.size === 0) return

    let retryTimeout: NodeJS.Timeout | null = null

    const attemptSave = async (attempt = 0): Promise<void> => {
      // Build update payload with only dirty fields
      const updates: any = {}
      if (dirtyFields.has('company')) updates.companyAnswers = companyAnswers
      if (dirtyFields.has('financial')) updates.financialAnswers = financialAnswers
      if (dirtyFields.has('sector')) updates.sectorAnswers = sectorAnswers

      const result = await updateAllAssessmentAnswers(assessment.id, updates)

      if (result.success) {
        setLastSaved(new Date())
        setSaveError(null)
        setRetryCount(0)
        setDirtyFields(new Set()) // Clear dirty tracking
      } else if (attempt < AUTO_SAVE.MAX_RETRY_ATTEMPTS) {
        // Retry with exponential backoff
        const delay = Math.pow(2, attempt) * AUTO_SAVE.RETRY_BASE_DELAY_MS
        setSaveError(AUTO_SAVE.RETRY_MESSAGE)
        setRetryCount(attempt + 1)
        retryTimeout = setTimeout(() => attemptSave(attempt + 1), delay)
      } else {
        // Final failure
        setSaveError(AUTO_SAVE.FAILURE_MESSAGE)
        toast.error("Auto-save failed. Please try again.")
        setRetryCount(0)
      }
    }

    const debounceTimeout = setTimeout(() => {
      startTransition(() => attemptSave(0))
    }, AUTO_SAVE.ASSESSMENT_DEBOUNCE_MS)

    // Cleanup function
    return () => {
      clearTimeout(debounceTimeout)
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [dirtyFields, companyAnswers, financialAnswers, sectorAnswers, assessment.id])

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPending || saveError || dirtyFields.size > 0) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isPending, saveError, dirtyFields])

  const handleRestartWithNewQuestions = async () => {
    if (!confirm("Restart assessment with new questions? All current answers will be lost.")) {
      return
    }

    startTransition(async () => {
      const result = await restartAssessmentWithNewQuestions(assessment.id)
      if (result.success) {
        toast.success("Assessment restarted with new questions")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleSubmit = async () => {
    // Prevent double-submission
    if (isSubmitting) return

    // Check if all sections have at least one answer
    const hasCompanyAnswers = Object.keys(companyAnswers).length > 0
    const hasFinancialAnswers = Object.keys(financialAnswers).length > 0
    const hasSectorAnswers = Object.keys(sectorAnswers).length > 0

    if (!hasCompanyAnswers || !hasFinancialAnswers || !hasSectorAnswers) {
      toast.error("Please answer at least one question in each section")
      return
    }

    // If outdated, show confirmation dialog
    if (isOutdated) {
      setShowConfirmDialog(true)
      return
    }

    // Submit normally
    submitNow(false)
  }

  const submitNow = (confirmOldQuestions: boolean) => {
    if (isSubmitting) return // Prevent concurrent calls

    setIsSubmitting(true)
    startTransition(async () => {
      try {
        const result = await submitAssessment(assessment.id, confirmOldQuestions)
        if (result.success) {
          toast.success(`Assessment submitted! Score: ${result.data.percentage.toFixed(1)}%`)
          router.push(`/dashboard/leads/${leadId}`)
        } else {
          if (result.code === "QUESTIONS_OUTDATED") {
            setShowConfirmDialog(true)
          } else {
            toast.error(result.error)
          }
          setIsSubmitting(false)
        }
      } catch (error) {
        setIsSubmitting(false)
        toast.error("Failed to submit assessment")
      }
    })
  }

  const totalQuestions = companyQuestions.length + financialQuestions.length + sectorQuestions.length
  const answeredCount =
    Object.values(companyAnswers).filter((a) => a.score !== 0).length +
    Object.values(financialAnswers).filter((a) => a.score !== 0).length +
    Object.values(sectorAnswers).filter((a) => a.score !== 0).length

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        {/* Version Check Loading */}
        {isCheckingVersion && (
          <div className="glass rounded-xl p-4 md:p-6 border-2 border-foreground/10 animate-pulse">
            <div className="h-4 bg-foreground/10 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-foreground/10 rounded w-2/3"></div>
          </div>
        )}

        {/* Outdated Warning */}
        {!isCheckingVersion && isOutdated && (
          <div className="glass rounded-xl p-4 md:p-6 border-2 border-yellow-500/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Questions Updated</p>
                <p className="text-sm text-foreground/70 mt-1">
                  The question bank has been updated since this assessment was started.
                  You can continue with the current questions or restart with the new set.
                </p>
                <button
                  onClick={handleRestartWithNewQuestions}
                  disabled={isPending}
                  className="mt-3 rounded-lg bg-yellow-500 px-4 h-10 text-sm font-medium text-black hover:bg-yellow-500/90 active:scale-95 transition-transform disabled:opacity-50"
                >
                  Restart with New Questions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="glass rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-foreground/70">
              {answeredCount} / {totalQuestions}
            </span>
          </div>
          <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            {isPending && !saveError && (
              <span className="text-xs text-foreground/60 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-foreground/60 rounded-full animate-pulse" />
                Saving...
              </span>
            )}
            {saveError && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {saveError}
                {retryCount > 0 && ` (Attempt ${retryCount + 1}/3)`}
              </span>
            )}
            {!isPending && !saveError && lastSaved && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {!isPending && !saveError && !lastSaved && <span />}
          </div>
        </div>

        {/* Section Tabs (Mobile & Desktop) */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="grid grid-cols-3">
            <button
              onClick={() => setActiveSection("company")}
              className={`p-4 text-sm font-medium transition-colors ${
                activeSection === "company"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              <span className="hidden md:inline">Company</span>
              <span className="md:hidden">Co.</span>
              <span className="block text-xs mt-1">
                {Object.values(companyAnswers).filter((a) => a.score !== 0).length}/
                {companyQuestions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSection("financial")}
              className={`p-4 text-sm font-medium transition-colors border-x border-foreground/10 ${
                activeSection === "financial"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              <span className="hidden md:inline">Financial</span>
              <span className="md:hidden">Fin.</span>
              <span className="block text-xs mt-1">
                {Object.values(financialAnswers).filter((a) => a.score !== 0).length}/
                {financialQuestions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSection("sector")}
              className={`p-4 text-sm font-medium transition-colors ${
                activeSection === "sector"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              Sector
              <span className="block text-xs mt-1">
                {Object.values(sectorAnswers).filter((a) => a.score !== 0).length}/
                {sectorQuestions.length}
              </span>
            </button>
          </div>
        </div>

        {/* Questions for Active Section */}
        {activeSection === "company" && (
          <AssessmentQuestionSection
            questions={companyQuestions}
            answers={companyAnswers}
            setAnswers={setCompanyAnswers}
            isPending={isPending}
          />
        )}

        {activeSection === "financial" && (
          <AssessmentQuestionSection
            questions={financialQuestions}
            answers={financialAnswers}
            setAnswers={setFinancialAnswers}
            isPending={isPending}
          />
        )}

        {activeSection === "sector" && (
          <AssessmentQuestionSection
            questions={sectorQuestions}
            answers={sectorAnswers}
            setAnswers={setSectorAnswers}
            isPending={isPending}
          />
        )}

        {/* Submit Button (Fixed on Mobile above tab bar) */}
        <div className="fixed md:static bottom-16 md:bottom-0 left-0 right-0 z-50 p-4 md:p-0 glass-strong md:glass md:rounded-xl border-t md:border-none border-foreground/10">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isPending || answeredCount < totalQuestions}
            className="w-full rounded-lg bg-primary px-4 h-12 md:h-10 text-base md:text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </button>
          {answeredCount < totalQuestions && (
            <p className="mt-2 text-xs text-center text-foreground/60">
              Answer all questions to submit ({totalQuestions - answeredCount} remaining)
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmOldQuestionsDialog
          onConfirm={() => {
            if (confirmText === "USEOLDQUESTIONS") {
              submitNow(true)
              setShowConfirmDialog(false)
              setConfirmText("")
            } else {
              toast.error('Please type "USEOLDQUESTIONS" to confirm')
            }
          }}
          onCancel={() => {
            setShowConfirmDialog(false)
            setConfirmText("")
          }}
          confirmText={confirmText}
          setConfirmText={setConfirmText}
          isPending={isPending}
        />
      )}
    </>
  )
}
