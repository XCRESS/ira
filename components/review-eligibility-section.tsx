"use client"

import { CheckCircle2 } from "lucide-react"

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

type ReviewEligibilitySectionProps = {
  questions: Question[]
  answers: Record<string, EligibilityAnswer>
}

export function ReviewEligibilitySection({
  questions,
  answers,
}: ReviewEligibilitySectionProps) {
  return (
    <div className="space-y-3">
      {questions.map((question, index) => {
        const answer = answers[question.id]
        return (
          <div key={question.id} className="glass rounded-xl p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className={`h-6 w-6 rounded border-2 flex items-center justify-center ${answer?.checked ? "bg-green-500 border-green-500" : "border-foreground/30"}`}>
                {answer?.checked && <CheckCircle2 className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs font-medium text-foreground/60">{index + 1}.</span>
                  <p className="text-sm flex-1">{question.text}</p>
                </div>
                {answer?.remark && (
                  <div className="p-3 rounded-lg bg-foreground/5">
                    <p className="text-xs text-foreground/70">{answer.remark}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
