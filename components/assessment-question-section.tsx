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

type QuestionSectionProps = {
  questions: Question[]
  answers: Record<string, Answer>
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, Answer>>>
  isPending: boolean
}

export function AssessmentQuestionSection({
  questions,
  answers,
  setAnswers,
  isPending,
}: QuestionSectionProps) {
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

  const handleScoreChange = (questionId: string, score: -1 | 0 | 1 | 2) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], score },
    }))
  }

  const handleRemarkChange = (questionId: string, remark: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], remark },
    }))
  }

  const handleEvidenceChange = (questionId: string, evidenceLink: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], evidenceLink },
    }))
  }

  return (
    <div className="space-y-3">
      {questions.map((question, index) => {
        const answer = answers[question.id]
        const isExpanded = expandedQuestions.has(question.id)

        return (
          <div key={question.id} className="glass rounded-xl overflow-hidden">
            {/* Question Header */}
            <div className="p-4 md:p-6">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-xs font-medium text-foreground/60 mt-1">
                  {index + 1}.
                </span>
                <p className="text-sm flex-1">{question.text}</p>
              </div>

              {/* Score Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: -1, label: "No", color: "bg-red-500/10 text-red-500 border-red-500/30" },
                  { value: 0, label: "NA", color: "bg-foreground/10 text-foreground/60 border-foreground/20" },
                  { value: 1, label: "Maybe", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
                  { value: 2, label: "Yes", color: "bg-green-500/10 text-green-500 border-green-500/30" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleScoreChange(question.id, option.value as -1 | 0 | 1 | 2)}
                    disabled={isPending}
                    className={`h-12 rounded-lg text-sm font-medium border-2 transition-all ${
                      answer?.score === option.value
                        ? option.color + " border-opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100"
                    } active:scale-95`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Expand/Collapse for Remark & Evidence */}
              {answer?.score !== 0 && (
                <button
                  onClick={() => toggleExpanded(question.id)}
                  className="mt-3 text-xs text-foreground/70 hover:text-foreground flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Add remark & evidence
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Expanded Details */}
            {isExpanded && answer?.score !== 0 && (
              <div className="border-t border-foreground/10 p-4 md:p-6 space-y-4">
                {question.helpText && (
                  <div className="p-3 rounded-lg bg-foreground/5">
                    <p className="text-xs text-foreground/70">{question.helpText}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium mb-2">
                    Remark (Optional)
                  </label>
                  <textarea
                    value={answer.remark || ""}
                    onChange={(e) => handleRemarkChange(question.id, e.target.value)}
                    placeholder="Add supporting notes..."
                    rows={3}
                    className="w-full px-4 py-3 md:py-2 text-base md:text-sm rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary bg-background resize-none"
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2">
                    Evidence Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={answer.evidenceLink || ""}
                    onChange={(e) => handleEvidenceChange(question.id, e.target.value)}
                    placeholder="https://..."
                    className="w-full h-12 md:h-10 px-4 text-base md:text-sm rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary bg-background"
                    disabled={isPending}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
