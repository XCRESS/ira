"use client"

import { useState, useTransition } from "react"
import { X } from "lucide-react"
import { updateQuestion } from "@/actions/question"
import { toast } from "sonner"
import type { Question } from "@prisma/client"

type Props = {
  question: Question
  onClose: () => void
}

export function EditQuestionDialog({ question, onClose }: Props) {
  const [text, setText] = useState(question.text)
  const [helpText, setHelpText] = useState(question.helpText || "")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (text.trim().length < 10) {
      toast.error("Question text must be at least 10 characters")
      return
    }

    startTransition(async () => {
      const result = await updateQuestion(question.id, {
        text: text.trim(),
        helpText: helpText.trim() || null,
      })

      if (result.success) {
        toast.success("Question updated successfully")
        onClose()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      {/* Mobile: Bottom Sheet */}
      <div className="fixed inset-0 z-50 md:hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Sheet */}
        <div className="absolute inset-x-0 bottom-0 glass-strong rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
          {/* Handle */}
          <div className="w-12 h-1 bg-foreground/20 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold">Edit Question</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-foreground/10 active:bg-foreground/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="text" className="block text-sm font-medium mb-2">
                Question Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the question..."
                rows={4}
                className="w-full h-auto px-4 py-3 text-base rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary bg-background resize-none"
                required
                disabled={isPending}
              />
              <p className="mt-1 text-xs text-foreground/60">
                {text.length}/1000 characters (min 10)
              </p>
            </div>

            <div>
              <label htmlFor="helpText" className="block text-sm font-medium mb-2">
                Help Text (Optional)
              </label>
              <textarea
                id="helpText"
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                placeholder="Additional guidance for assessors..."
                rows={3}
                className="w-full h-auto px-4 py-3 text-base rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary bg-background resize-none"
                disabled={isPending}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 rounded-lg border border-foreground/10 px-4 h-12 text-base hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || text.trim().length < 10}
                className="flex-1 rounded-lg bg-primary px-4 h-12 text-base font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Desktop: Modal */}
      <div className="fixed inset-0 z-50 hidden md:flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative glass-strong rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Edit Question</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-foreground/10 active:bg-foreground/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="text-desktop" className="block text-sm font-medium mb-2">
                Question Text
              </label>
              <textarea
                id="text-desktop"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the question..."
                rows={4}
                className="w-full h-auto px-4 py-2 text-sm rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary bg-background resize-none"
                required
                disabled={isPending}
              />
              <p className="mt-1 text-xs text-foreground/60">
                {text.length}/1000 characters (min 10)
              </p>
            </div>

            <div>
              <label htmlFor="helpText-desktop" className="block text-sm font-medium mb-2">
                Help Text (Optional)
              </label>
              <textarea
                id="helpText-desktop"
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                placeholder="Additional guidance for assessors..."
                rows={3}
                className="w-full h-auto px-4 py-2 text-sm rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary bg-background resize-none"
                disabled={isPending}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg border border-foreground/10 px-4 h-10 text-sm hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || text.trim().length < 10}
                className="rounded-lg bg-primary px-4 h-10 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
