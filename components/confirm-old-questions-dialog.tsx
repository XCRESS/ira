"use client"

type ConfirmOldQuestionsDialogProps = {
  onConfirm: () => void
  onCancel: () => void
  confirmText: string
  setConfirmText: (text: string) => void
  isPending: boolean
}

export function ConfirmOldQuestionsDialog({
  onConfirm,
  onCancel,
  confirmText,
  setConfirmText,
  isPending,
}: ConfirmOldQuestionsDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative glass-strong rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Using Outdated Questions</h3>
        <p className="text-sm text-foreground/70 mb-4">
          The question bank has been updated since this assessment was started.
          To submit with the current (old) question set, type{" "}
          <span className="font-mono font-semibold">USEOLDQUESTIONS</span> below:
        </p>

        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type USEOLDQUESTIONS"
          className="w-full h-12 px-4 text-base rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary bg-background mb-4"
          disabled={isPending}
        />

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
            disabled={isPending || confirmText !== "USEOLDQUESTIONS"}
            className="flex-1 rounded-lg bg-primary px-4 h-10 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Confirm & Submit"}
          </button>
        </div>
      </div>
    </div>
  )
}
