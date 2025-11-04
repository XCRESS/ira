"use client"

import { useState, useTransition } from "react"
import { Plus, ChevronDown, ChevronUp, GripVertical, Pencil, Trash2, RotateCcw } from "lucide-react"
import type { Question } from "@prisma/client"
import { AddQuestionDialog } from "./add-question-dialog"
import { EditQuestionDialog } from "./edit-question-dialog"
import { deleteQuestion, restoreQuestion } from "@/actions/question"
import { toast } from "sonner"

type Props = {
  eligibility: Question[]
  company: Question[]
  financial: Question[]
  sector: Question[]
}

type QuestionSection = "ELIGIBILITY" | "COMPANY" | "FINANCIAL" | "SECTOR"

export function QuestionList({ eligibility, company, financial, sector }: Props) {
  const [expandedSection, setExpandedSection] = useState<QuestionSection | null>("ELIGIBILITY")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<QuestionSection>("ELIGIBILITY")
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isPending, startTransition] = useTransition()

  const sections = [
    { type: "ELIGIBILITY" as const, label: "Eligibility", questions: eligibility },
    { type: "COMPANY" as const, label: "Company", questions: company },
    { type: "FINANCIAL" as const, label: "Financial", questions: financial },
    { type: "SECTOR" as const, label: "Sector", questions: sector },
  ]

  const handleAddClick = (type: QuestionSection) => {
    setSelectedType(type)
    setShowAddDialog(true)
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question? It will be marked as inactive.")) {
      return
    }

    startTransition(async () => {
      const result = await deleteQuestion(questionId)
      if (result.success) {
        toast.success("Question deleted")
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleRestore = async (questionId: string) => {
    startTransition(async () => {
      const result = await restoreQuestion(questionId)
      if (result.success) {
        toast.success("Question restored")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isExpanded = expandedSection === section.type
        const activeQuestions = section.questions.filter((q) => q.isActive)
        const inactiveQuestions = section.questions.filter((q) => !q.isActive)

        return (
          <div key={section.type} className="glass rounded-xl overflow-hidden">
            {/* Section Header */}
            <div className="w-full flex items-center justify-between p-4">
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.type)}
                className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-foreground/60" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-foreground/60" />
                )}
                <div>
                  <h3 className="text-sm md:text-base font-semibold">{section.label}</h3>
                  <p className="text-xs text-foreground/60">
                    {activeQuestions.length} active
                    {inactiveQuestions.length > 0 && ` • ${inactiveQuestions.length} inactive`}
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleAddClick(section.type)}
                className="rounded-lg bg-primary px-4 h-10 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
              >
                <span className="hidden md:inline">Add Question</span>
                <Plus className="h-5 w-5 md:hidden" />
              </button>
            </div>

            {/* Question List */}
            {isExpanded && (
              <div className="border-t border-foreground/10">
                {activeQuestions.length === 0 && inactiveQuestions.length === 0 ? (
                  <div className="p-6 text-center text-sm text-foreground/60">
                    No questions yet. Click "Add Question" to get started.
                  </div>
                ) : (
                  <div className="divide-y divide-foreground/10">
                    {/* Active Questions */}
                    {activeQuestions.map((question, index) => (
                      <QuestionItem
                        key={question.id}
                        question={question}
                        index={index}
                        onEdit={() => setEditingQuestion(question)}
                        onDelete={() => handleDelete(question.id)}
                        isPending={isPending}
                      />
                    ))}

                    {/* Inactive Questions */}
                    {inactiveQuestions.length > 0 && (
                      <>
                        <div className="p-3 bg-foreground/5">
                          <p className="text-xs font-medium text-foreground/60">Inactive Questions</p>
                        </div>
                        {inactiveQuestions.map((question, index) => (
                          <QuestionItem
                            key={question.id}
                            question={question}
                            index={index}
                            onEdit={() => setEditingQuestion(question)}
                            onRestore={() => handleRestore(question.id)}
                            isPending={isPending}
                            isInactive
                          />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Add Dialog */}
      {showAddDialog && (
        <AddQuestionDialog
          type={selectedType}
          onClose={() => setShowAddDialog(false)}
        />
      )}

      {/* Edit Dialog */}
      {editingQuestion && (
        <EditQuestionDialog
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
        />
      )}
    </div>
  )
}

type QuestionItemProps = {
  question: Question
  index: number
  onEdit: () => void
  onDelete?: () => void
  onRestore?: () => void
  isPending: boolean
  isInactive?: boolean
}

function QuestionItem({
  question,
  index,
  onEdit,
  onDelete,
  onRestore,
  isPending,
  isInactive,
}: QuestionItemProps) {
  return (
    <div
      className={`p-4 hover:bg-foreground/5 transition-colors ${
        isInactive ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle (Desktop only, future feature) */}
        <div className="hidden md:block pt-1">
          <GripVertical className="h-5 w-5 text-foreground/30" />
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-xs font-medium text-foreground/60 mt-1">
              Q{index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{question.text}</p>
              {question.helpText && (
                <p className="mt-1 text-xs text-foreground/60 line-clamp-2">
                  {question.helpText}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isInactive ? (
            <button
              onClick={onRestore}
              disabled={isPending}
              className="rounded-lg p-2 hover:bg-foreground/10 active:bg-foreground/20 transition-colors"
              aria-label="Restore question"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                onClick={onEdit}
                disabled={isPending}
                className="rounded-lg p-2 hover:bg-foreground/10 active:bg-foreground/20 transition-colors"
                aria-label="Edit question"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                disabled={isPending}
                className="rounded-lg p-2 hover:bg-foreground/10 active:bg-foreground/20 transition-colors text-red-500"
                aria-label="Delete question"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
