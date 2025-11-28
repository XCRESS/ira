"use client"

import { useState, useEffect, useTransition, useCallback, useMemo, useRef } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { Assessment } from "@prisma/client"
import { updateEligibilityAnswers, completeEligibility } from "@/actions/assessment"
import { AUTO_SAVE } from "@/lib/constants"
import { formatTime } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Question = {
  id: string
  text: string
  helpText: string | null
  order: number
}

type Answer = {
  checked: boolean
  remark?: string
}

type Props = {
  assessment: Assessment
  questions: Question[]
  leadId: string
}

export function EligibilityForm({ assessment, questions, leadId }: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, Answer>>(() => {
    const existing = assessment.eligibilityAnswers as Record<string, Answer>
    const initial: Record<string, Answer> = {}
    questions.forEach((q) => {
      initial[q.id] = existing[q.id] || { checked: false, remark: "" }
    })
    return initial
  })
  const [isPending, startTransition] = useTransition()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // ✅ PERFORMANCE: Use ref to track retry timeout, preventing re-render cascade
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const attemptSaveRef = useRef<((attempt: number) => Promise<void>) | null>(null)

  // ✅ PERFORMANCE: Memoize save function to prevent recreation on every render
  const attemptSave = useCallback(async (attempt = 0): Promise<void> => {
    const result = await updateEligibilityAnswers(assessment.id, answers)

    if (result.success) {
      setLastSaved(new Date())
      setSaveError(null)
      setRetryCount(0)
      setHasUnsavedChanges(false)
    } else if (attempt < AUTO_SAVE.MAX_RETRY_ATTEMPTS) {
      const delay = Math.pow(2, attempt) * AUTO_SAVE.RETRY_BASE_DELAY_MS
      setSaveError(AUTO_SAVE.RETRY_MESSAGE)
      setRetryCount(attempt + 1)
      retryTimeoutRef.current = setTimeout(() => {
        if (attemptSaveRef.current) {
          attemptSaveRef.current(attempt + 1)
        }
      }, delay)
    } else {
      setSaveError(AUTO_SAVE.FAILURE_MESSAGE)
      setRetryCount(0)
      toast.error("Auto-save failed. Please try again.")
    }
  }, [assessment.id, answers])

  // Store the latest attemptSave in ref
  useEffect(() => {
    attemptSaveRef.current = attemptSave
  }, [attemptSave])

  // Auto-save with retry logic and proper cleanup
  useEffect(() => {
    setHasUnsavedChanges(true)

    const debounceTimeout = setTimeout(() => {
      startTransition(() => attemptSave(0))
    }, AUTO_SAVE.ELIGIBILITY_DEBOUNCE_MS)

    return () => {
      clearTimeout(debounceTimeout)
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [attemptSave])

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || isPending || saveError) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, isPending, saveError])

  // ✅ PERFORMANCE: Memoize handlers to prevent unnecessary re-renders
  const handleCheckChange = useCallback((questionId: string, checked: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], checked },
    }))
  }, [])

  const handleRemarkChange = useCallback((questionId: string, remark: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], remark },
    }))
  }, [])

  const handleComplete = async () => {
    const allChecked = questions.every((q) => answers[q.id]?.checked)

    if (!allChecked) {
      toast.error("All criteria must be checked to proceed")
      return
    }

    if (!confirm("Submit eligibility check? This action cannot be undone.")) {
      return
    }

    startTransition(async () => {
      const result = await completeEligibility(assessment.id)
      if (result.success) {
        if (result.data.isEligible) {
          toast.success("Eligibility check passed!")
          router.push(`/dashboard/leads/${leadId}/assessment`)
        } else {
          toast.error("Company is not eligible for IPO assessment")
          router.push(`/dashboard/leads/${leadId}`)
        }
      } else {
        toast.error(result.error)
      }
    })
  }

  // ✅ PERFORMANCE: Memoize expensive computations
  const allChecked = useMemo(
    () => questions.every((q) => answers[q.id]?.checked),
    [questions, answers]
  )
  const checkedCount = useMemo(
    () => questions.filter((q) => answers[q.id]?.checked).length,
    [questions, answers]
  )

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Progress */}
      <div className="glass rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-foreground/70">
            {checkedCount} / {questions.length}
          </span>
        </div>
        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(checkedCount / questions.length) * 100}%` }}
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
              <AlertCircle className="h-3 w-3" />
              {saveError}
              {retryCount > 0 && ` (Attempt ${retryCount + 1}/3)`}
            </span>
          )}
          {!isPending && !saveError && lastSaved && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Saved {formatTime(lastSaved)}
            </span>
          )}
          {!isPending && !saveError && !lastSaved && <span />}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div key={question.id} className="glass rounded-xl p-4 md:p-6">
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleCheckChange(question.id, !answers[question.id]?.checked)
                  }
                  disabled={isPending}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    answers[question.id]?.checked
                      ? "bg-primary border-primary"
                      : "border-foreground/30 hover:border-primary"
                  }`}
                  aria-label={`Check question ${index + 1}`}
                >
                  {answers[question.id]?.checked && (
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  )}
                </button>
              </div>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs font-medium text-foreground/60">
                    {index + 1}.
                  </span>
                  <p className="text-sm flex-1">{question.text}</p>
                </div>

                {question.helpText && (
                  <div className="flex items-start gap-2 mb-3 p-3 rounded-lg bg-foreground/5">
                    <AlertCircle className="h-4 w-4 text-foreground/60 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground/70">{question.helpText}</p>
                  </div>
                )}

                {/* Remark */}
                <div>
                  <label
                    htmlFor={`remark-${question.id}`}
                    className="block text-xs font-medium text-foreground/70 mb-2"
                  >
                    Remark (Optional)
                  </label>
                  <textarea
                    id={`remark-${question.id}`}
                    value={answers[question.id]?.remark || ""}
                    onChange={(e) => handleRemarkChange(question.id, e.target.value)}
                    placeholder="Add any relevant notes..."
                    rows={2}
                    className="w-full px-4 py-3 md:py-2 text-base md:text-sm rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary bg-background resize-none"
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="glass rounded-xl p-4 md:p-6">
        <button
          onClick={handleComplete}
          disabled={!allChecked || isPending}
          className="w-full rounded-lg bg-primary px-4 h-12 md:h-10 text-base md:text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? "Submitting..." : "Complete Eligibility Check"}
        </button>
        {!allChecked && (
          <p className="mt-3 text-xs text-center text-foreground/60">
            All criteria must be checked to proceed
          </p>
        )}
      </div>
    </div>
  )
}
