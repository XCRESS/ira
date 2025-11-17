"use client"

import { useState, useTransition } from "react"
import {
  addAssessmentQuestion,
  updateAssessmentQuestion,
  deleteAssessmentQuestion,
  reorderAssessmentQuestions,
  type AssessmentQuestion,
} from "@/actions/assessment-questions"
import type { Question } from "@prisma/client"
import { Plus, Edit2, Trash2, GripVertical, Check, X, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

type Props = {
  assessmentId: string
  leadId: string
  currentQuestions: AssessmentQuestion[]
  templateQuestions: Question[]
}

export function ManageEligibilityQuestions({
  assessmentId,
  leadId,
  currentQuestions: initialQuestions,
  templateQuestions,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [questions, setQuestions] = useState(initialQuestions)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [editHelpText, setEditHelpText] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState("")
  const [newHelpText, setNewHelpText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Add new question
  const handleAdd = async () => {
    if (!newQuestionText.trim()) {
      setError("Question text is required")
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await addAssessmentQuestion({
        assessmentId,
        type: "ELIGIBILITY",
        text: newQuestionText.trim(),
        helpText: newHelpText.trim() || undefined,
      })

      if (result.success && result.data) {
        setQuestions([...questions, result.data])
        setNewQuestionText("")
        setNewHelpText("")
        setShowAddForm(false)
        router.refresh()
      }

      if (!result.success) {
        setError(result.error || "Failed to add question")
      }
    })
  }

  // Add from template
  const handleAddTemplate = async (template: Question) => {
    setError(null)
    startTransition(async () => {
      const result = await addAssessmentQuestion({
        assessmentId,
        type: "ELIGIBILITY",
        text: template.text,
        helpText: template.helpText || undefined,
      })

      if (result.success && result.data) {
        setQuestions([...questions, result.data])
        router.refresh()
      }

      if (!result.success) {
        setError(result.error || "Failed to add template question")
      }
    })
  }

  // Start editing
  const startEdit = (question: AssessmentQuestion) => {
    setEditingId(question.id)
    setEditText(question.text)
    setEditHelpText(question.helpText || "")
    setError(null)
  }

  // Save edit
  const handleUpdate = async (questionId: string) => {
    if (!editText.trim()) {
      setError("Question text is required")
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await updateAssessmentQuestion({
        assessmentId,
        questionId,
        text: editText.trim(),
        helpText: editHelpText.trim() || null,
      })

      if (result.success && result.data) {
        setQuestions(
          questions.map((q) => (q.id === questionId ? result.data! : q))
        )
        setEditingId(null)
        router.refresh()
      }

      if (!result.success) {
        setError(result.error || "Failed to update question")
      }
    })
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
    setEditHelpText("")
    setError(null)
  }

  // Delete question
  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to remove this question?")) {
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await deleteAssessmentQuestion({
        assessmentId,
        questionId,
      })

      if (result.success) {
        setQuestions(questions.filter((q) => q.id !== questionId))
        router.refresh()
      }

      if (!result.success) {
        setError(result.error || "Failed to delete question")
      }
    })
  }

  // Check if template already added
  const isTemplateAdded = (templateId: string) => {
    return questions.some((q) => q.sourceQuestionId === templateId)
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Reorder questions array
    const reordered = [...questions]
    const [draggedItem] = reordered.splice(draggedIndex, 1)
    reordered.splice(dropIndex, 0, draggedItem)

    // Update local state immediately for smooth UX
    setQuestions(reordered)
    setDraggedIndex(null)
    setDragOverIndex(null)

    // Save to database
    setError(null)
    startTransition(async () => {
      const result = await reorderAssessmentQuestions({
        assessmentId,
        type: "ELIGIBILITY",
        questionIds: reordered.map(q => q.id),
      })

      if (result.success) {
        router.refresh()
      }

      if (!result.success) {
        // Revert on error
        setQuestions(questions)
        setError(result.error || "Failed to reorder questions")
      }
    })
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Error Display */}
      {error && (
        <div className="glass rounded-xl p-4 bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Current Questions */}
      <div className="glass rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm md:text-base font-semibold">
              Current Questions ({questions.length})
            </h3>
            {questions.length > 0 && (
              <p className="text-xs text-foreground/60 mt-1">
                Drag <GripVertical className="inline h-3 w-3" /> to reorder
              </p>
            )}
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isPending}
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Custom Question
          </button>
        </div>

        {/* Add Question Form */}
        {showAddForm && (
          <div className="mb-4 p-4 rounded-lg bg-background/50 border border-foreground/10 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Question Text *</label>
              <textarea
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Enter question text..."
                className="w-full px-3 py-2 rounded-lg bg-background border border-foreground/20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Help Text (Optional)</label>
              <textarea
                value={newHelpText}
                onChange={(e) => setNewHelpText(e.target.value)}
                placeholder="Additional guidance or context..."
                className="w-full px-3 py-2 rounded-lg bg-background border border-foreground/20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                disabled={isPending}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                disabled={isPending || !newQuestionText.trim()}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4" />
                Add Question
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewQuestionText("")
                  setNewHelpText("")
                  setError(null)
                }}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-background/50 text-sm font-medium hover:bg-background/70 active:scale-95 transition-transform disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Question List */}
        {questions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-foreground/30 mb-2" />
            <p className="text-sm text-foreground/70">
              No questions added yet. Add custom questions or use templates below.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div
                key={question.id}
                draggable={editingId !== question.id && !isPending}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-4 rounded-lg bg-background/50 border transition-colors ${
                  draggedIndex === index
                    ? "opacity-50 border-primary/50"
                    : dragOverIndex === index
                    ? "border-primary/50 bg-primary/5"
                    : "border-foreground/10 hover:border-foreground/20"
                } ${editingId !== question.id && !isPending ? "cursor-move" : ""}`}
              >
                {editingId === question.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Question Text *</label>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-foreground/20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Help Text (Optional)</label>
                      <textarea
                        value={editHelpText}
                        onChange={(e) => setEditHelpText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-foreground/20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={2}
                        disabled={isPending}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdate(question.id)}
                        disabled={isPending || !editText.trim()}
                        className="inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-background/50 text-sm font-medium hover:bg-background/70 active:scale-95 transition-transform disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 mt-1 ${
                        isPending ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"
                      }`}
                      title="Drag to reorder"
                    >
                      <GripVertical className={`h-5 w-5 ${
                        draggedIndex === index ? "text-primary" : "text-foreground/30"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground/50">
                              Q{index + 1}
                            </span>
                            {question.isCustom && (
                              <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground">{question.text}</p>
                          {question.helpText && (
                            <p className="text-xs text-foreground/60 mt-1">{question.helpText}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(question)}
                            disabled={isPending}
                            className="p-2 rounded-lg hover:bg-background/50 active:scale-95 transition-transform disabled:opacity-50"
                            title="Edit question"
                          >
                            <Edit2 className="h-4 w-4 text-foreground/50" />
                          </button>
                          <button
                            onClick={() => handleDelete(question.id)}
                            disabled={isPending}
                            className="p-2 rounded-lg hover:bg-red-500/10 active:scale-95 transition-transform disabled:opacity-50"
                            title="Remove question"
                          >
                            <Trash2 className="h-4 w-4 text-red-500/70" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Template Questions */}
      <div className="glass rounded-xl p-4 md:p-6">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-sm md:text-base font-semibold">
            Template Questions ({templateQuestions.length})
          </h3>
          <span className="text-sm text-foreground/70">
            {showTemplates ? "Hide" : "Show"}
          </span>
        </button>

        {showTemplates && (
          <div className="space-y-2">
            {templateQuestions.length === 0 ? (
              <p className="text-sm text-foreground/70 text-center py-4">
                No template questions available
              </p>
            ) : (
              templateQuestions.map((template, index) => {
                const alreadyAdded = isTemplateAdded(template.id)
                return (
                  <div
                    key={template.id}
                    className="p-4 rounded-lg bg-background/30 border border-foreground/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground/50">
                            T{index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{template.text}</p>
                        {template.helpText && (
                          <p className="text-xs text-foreground/60 mt-1">{template.helpText}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddTemplate(template)}
                        disabled={isPending || alreadyAdded}
                        className="px-3 h-9 rounded-lg bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {alreadyAdded ? "Added" : "Use This"}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/dashboard/leads/${leadId}/eligibility`)}
          className="inline-flex items-center gap-2 px-6 h-12 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
        >
          Done - Back to Assessment
        </button>
        <p className="text-xs text-foreground/60">
          {questions.length} question{questions.length !== 1 ? "s" : ""} configured
        </p>
      </div>
    </div>
  )
}
