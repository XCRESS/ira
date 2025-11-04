"use client"

type ReviewRejectDialogProps = {
  onConfirm: () => void
  onCancel: () => void
  comments: string
  setComments: (text: string) => void
  isPending: boolean
}

export function ReviewRejectDialog({
  onConfirm,
  onCancel,
  comments,
  setComments,
  isPending,
}: ReviewRejectDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative glass-strong rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Reject Assessment</h3>
        <p className="text-sm text-foreground/70 mb-4">
          This will send the assessment back to the assessor for revision.
          Please provide detailed feedback.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-2">Feedback (Required)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Explain what needs to be revised..."
              rows={4}
              className="w-full px-4 py-3 md:py-2 text-base md:text-sm rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary bg-background resize-none"
              disabled={isPending}
            />
            <p className="mt-1 text-xs text-foreground/60">
              {comments.length}/2000 characters (min 10)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 rounded-lg border border-foreground/10 px-4 h-10 text-sm hover:bg-foreground/5"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending || comments.trim().length < 10}
              className="flex-1 rounded-lg bg-red-500 px-4 h-10 text-sm font-medium text-white hover:bg-red-500/90 disabled:opacity-50"
            >
              {isPending ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
