"use client"

type ReviewApproveDialogProps = {
  onConfirm: () => void
  onCancel: () => void
  comments: string
  setComments: (text: string) => void
  confirmText: string
  setConfirmText: (text: string) => void
  requireConfirmation: boolean
  isPending: boolean
}

export function ReviewApproveDialog({
  onConfirm,
  onCancel,
  comments,
  setComments,
  confirmText,
  setConfirmText,
  requireConfirmation,
  isPending,
}: ReviewApproveDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative glass-strong rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Approve Assessment</h3>
        <p className="text-sm text-foreground/70 mb-4">
          This will approve the assessment and move the lead to payment pending status.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-2">Comments (Optional)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any feedback..."
              rows={3}
              className="w-full px-4 py-3 md:py-2 text-base md:text-sm rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary bg-background resize-none"
              disabled={isPending}
            />
          </div>

          {requireConfirmation && (
            <div>
              <label className="block text-xs font-medium mb-2">
                Type <span className="font-mono font-semibold">USEOLDQUESTIONS</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="USEOLDQUESTIONS"
                className="w-full h-12 px-4 text-base rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary bg-background"
                disabled={isPending}
              />
            </div>
          )}

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
              disabled={isPending || (requireConfirmation && confirmText !== "USEOLDQUESTIONS")}
              className="flex-1 rounded-lg bg-green-500 px-4 h-10 text-sm font-medium text-white hover:bg-green-500/90 disabled:opacity-50"
            >
              {isPending ? "Approving..." : "Approve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
