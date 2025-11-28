"use client"

import { useState, useTransition } from "react"
import {
  addAssessmentQuestion,
  updateAssessmentQuestion,
  deleteAssessmentQuestion,
  reorderAssessmentQuestions,
  type AssessmentQuestion,
  type QuestionSnapshot,
} from "@/actions/assessment-questions"
import type { Question } from "@prisma/client"
import {
  Plus, Edit2, Trash2, GripVertical, Check, X, FileText,
  ChevronDown, ChevronUp
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Props = {
  assessmentId: string
  leadId: string
  currentQuestions: QuestionSnapshot
  templateQuestions: {
    company: Question[]
    financial: Question[]
    sector: Question[]
    eligibility: Question[]
  }
}

type QuestionType = "COMPANY" | "FINANCIAL" | "SECTOR"

export function ManageAssessmentQuestions({
  assessmentId,
  leadId,
  currentQuestions: initial,
  templateQuestions,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [questions, setQuestions] = useState(initial)
  const [expandedSection, setExpandedSection] = useState<QuestionType | null>("COMPANY")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [editHelpText, setEditHelpText] = useState("")
  const [showAddForm, setShowAddForm] = useState<QuestionType | null>(null)
  const [showTemplates, setShowTemplates] = useState<QuestionType | null>(null)
  const [newQuestionText, setNewQuestionText] = useState("")
  const [newHelpText, setNewHelpText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const sections = [
    { type: "COMPANY" as const, label: "Company Questions", questions: questions.company },
    { type: "FINANCIAL" as const, label: "Financial Questions", questions: questions.financial },
    { type: "SECTOR" as const, label: "Sector Questions", questions: questions.sector },
  ]

  // Add new question
  const handleAdd = async (type: QuestionType) => {
    if (!newQuestionText.trim()) {
      setError("Question text is required")
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await addAssessmentQuestion({
        assessmentId,
        type,
        text: newQuestionText.trim(),
        helpText: newHelpText.trim() || undefined,
      })

      if (result.success && result.data) {
        const typeKey = type.toLowerCase() as keyof QuestionSnapshot
        setQuestions(prev => ({
          ...prev,
          [typeKey]: [...prev[typeKey], result.data!],
        }))
        setNewQuestionText("")
        setNewHelpText("")
        setShowAddForm(null)
        toast.success("Question added")
        router.refresh()
      }

      if (!result.success) {
        setError(result.error || "Failed to add question")
        toast.error(result.error || "Failed to add question")
      }
    })
  }

  // Add from template
  const handleAddTemplate = async (template: Question, type: QuestionType) => {
    setError(null)
    startTransition(async () => {
      const result = await addAssessmentQuestion({
        assessmentId,
        type,
        text: template.text,
        helpText: template.helpText || undefined,
      })

      if (result.success && result.data) {
        const typeKey = type.toLowerCase() as keyof QuestionSnapshot
        setQuestions(prev => ({
          ...prev,
          [typeKey]: [...prev[typeKey], result.data!],
        }))
        toast.success("Template question added")
        router.refresh()
      }

      if (!result.success) {
        setError(result.error || "Failed to add template question")
        toast.error(result.error || "Failed to add template question")
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
  const handleUpdate = async (questionId: string, type: QuestionType) => {
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
        const typeKey = type.toLowerCase() as keyof QuestionSnapshot
        setQuestions(prev => ({
          ...prev,
          [typeKey]: prev[typeKey].map((q) => (q.id === questionId ? result.data! : q)),
        }))
        setEditingId(null)
        toast.success("Question updated")
        router.refresh()
      }

      if (!result.success) {
        setError(result.error || "Failed to update question")
        toast.error(result.error || "Failed to update question")
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
  const handleDelete = async (questionId: string, type: QuestionType) => {
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
        const typeKey = type.toLowerCase() as keyof QuestionSnapshot
        setQuestions(prev => ({
          ...prev,
          [typeKey]: prev[typeKey].filter((q) => q.id !== questionId),
        }))
        toast.success("Question removed")
        router.refresh()
      }

      if (!result.success) {
        setError(result.error || "Failed to delete question")
        toast.error(result.error || "Failed to delete question")
      }
    })
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

  const handleDrop = async (e: React.DragEvent, dropIndex: number, type: QuestionType) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const typeKey = type.toLowerCase() as keyof QuestionSnapshot
    const sectionQuestions = questions[typeKey]

    // Reorder questions array
    const reordered = [...sectionQuestions]
    const [draggedItem] = reordered.splice(draggedIndex, 1)
    reordered.splice(dropIndex, 0, draggedItem)

    // Update local state immediately
    setQuestions(prev => ({
      ...prev,
      [typeKey]: reordered,
    }))
    setDraggedIndex(null)
    setDragOverIndex(null)

    // Save to database
    setError(null)
    startTransition(async () => {
      const result = await reorderAssessmentQuestions({
        assessmentId,
        type,
        questionIds: reordered.map(q => q.id),
      })

      if (result.success) {
        router.refresh()
      }

      if (!result.success) {
        // Revert on error
        setQuestions(questions)
        setError(result.error || "Failed to reorder questions")
        toast.error(result.error || "Failed to reorder questions")
      }
    })
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Check if template already added
  const isTemplateAdded = (templateId: string, type: QuestionType) => {
    const typeKey = type.toLowerCase() as keyof QuestionSnapshot
    return questions[typeKey].some((q) => q.sourceQuestionId === templateId)
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="glass rounded-xl p-4 bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Question Sections */}
      {sections.map((section) => {
        const isExpanded = expandedSection === section.type
        const sectionQuestions = section.questions

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
                    {sectionQuestions.length} question{sectionQuestions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </button>

              {isExpanded && (
                <button
                  onClick={() => setShowAddForm(showAddForm === section.type ? null : section.type)}
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 h-10 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <span className="hidden md:inline">Add Question</span>
                  <Plus className="h-5 w-5 md:hidden" />
                </button>
              )}
            </div>

            {/* Section Content */}
            {isExpanded && (
              <div className="border-t border-foreground/10 p-4 space-y-4">
                {/* Add Question Form */}
                {showAddForm === section.type && (
                  <div className="p-4 rounded-lg bg-background/50 border border-foreground/10 space-y-3">
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
                        onClick={() => handleAdd(section.type)}
                        disabled={isPending || !newQuestionText.trim()}
                        className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="h-4 w-4" />
                        Add Question
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(null)
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
                {sectionQuestions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-foreground/30 mb-2" />
                    <p className="text-sm text-foreground/70 mb-4">
                      No questions added yet. Add custom questions or use templates below.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sectionQuestions.map((question, index) => (
                      <div
                        key={question.id}
                        draggable={editingId !== question.id && !isPending}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index, section.type)}
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
                                onClick={() => handleUpdate(question.id, section.type)}
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
                                    onClick={() => handleDelete(question.id, section.type)}
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

                {/* Template Questions */}
                <div className="border-t border-foreground/10 pt-4">
                  <button
                    onClick={() => setShowTemplates(showTemplates === section.type ? null : section.type)}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <h4 className="text-sm font-semibold">
                      Template Questions ({templateQuestions[section.type.toLowerCase() as keyof typeof templateQuestions].length})
                    </h4>
                    <span className="text-sm text-foreground/70">
                      {showTemplates === section.type ? "Hide" : "Show"}
                    </span>
                  </button>

                  {showTemplates === section.type && (
                    <div className="space-y-2">
                      {templateQuestions[section.type.toLowerCase() as keyof typeof templateQuestions].length === 0 ? (
                        <p className="text-sm text-foreground/70 text-center py-4">
                          No template questions available
                        </p>
                      ) : (
                        templateQuestions[section.type.toLowerCase() as keyof typeof templateQuestions].map((template: Question, index: number) => {
                          const alreadyAdded = isTemplateAdded(template.id, section.type)
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
                                  onClick={() => handleAddTemplate(template, section.type)}
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
              </div>
            )}
          </div>
        )
      })}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => router.push(`/dashboard/leads/${leadId}/assessment`)}
          className="inline-flex items-center gap-2 px-6 h-12 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
        >
          Done - Back to Assessment
        </button>
        <p className="text-xs text-foreground/60">
          {questions.company.length + questions.financial.length + questions.sector.length} total questions configured
        </p>
      </div>
    </div>
  )
}
