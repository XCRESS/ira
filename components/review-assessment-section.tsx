"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

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

type ReviewAssessmentSectionProps = {
  questions: Question[]
  answers: Record<string, Answer>
  scoreColor: (score: number) => string
  scoreLabel: (score: number) => string
}

export function ReviewAssessmentSection({
  questions,
  answers,
  scoreColor,
  scoreLabel,
}: ReviewAssessmentSectionProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleExpanded = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  return (
    <div className="space-y-3">
      {questions.map((question, index) => {
        const answer = answers[question.id]
        const isExpanded = expandedQuestions.has(question.id)
        const hasDetails = answer?.remark || answer?.evidenceLink

        return (
          <div key={question.id} className="glass rounded-xl overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-xs font-medium text-foreground/60 mt-1">{index + 1}.</span>
                <p className="text-sm flex-1">{question.text}</p>
                <span className={`text-sm font-semibold ${scoreColor(answer?.score || 0)}`}>
                  {scoreLabel(answer?.score || 0)}
                </span>
              </div>

              {hasDetails && (
                <button
                  onClick={() => toggleExpanded(question.id)}
                  className="text-xs text-foreground/70 hover:text-foreground flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      View details
                    </>
                  )}
                </button>
              )}
            </div>

            {isExpanded && hasDetails && (
              <div className="border-t border-foreground/10 p-4 md:p-6 space-y-3">
                {answer.remark && (
                  <div>
                    <p className="text-xs font-medium text-foreground/60 mb-2">Remark</p>
                    <div className="p-3 rounded-lg bg-foreground/5">
                      <p className="text-xs text-foreground/70">{answer.remark}</p>
                    </div>
                  </div>
                )}
                {answer.evidenceLink && (
                  <div>
                    <p className="text-xs font-medium text-foreground/60 mb-2">Evidence Link</p>
                    <a
                      href={answer.evidenceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline break-all"
                    >
                      {answer.evidenceLink}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
