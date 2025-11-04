"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { assignAssessor } from "@/actions/lead"

type Assessor = {
  id: string
  name: string
  email: string
}

type Props = {
  leadId: string
  assessors: Assessor[]
  currentAssessorId?: string
  leadUpdatedAt: Date
}

export function AssignAssessorForm({ leadId, assessors, currentAssessorId, leadUpdatedAt }: Props) {
  const router = useRouter()
  const [selectedAssessorId, setSelectedAssessorId] = useState(currentAssessorId || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedAssessorId) return

    setIsSubmitting(true)
    setError(null)

    const result = await assignAssessor(leadId, { assessorId: selectedAssessorId }, leadUpdatedAt.toISOString())

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="assessor" className="block text-sm font-medium">
          Select Assessor
        </label>
        <select
          id="assessor"
          value={selectedAssessorId}
          onChange={(e) => setSelectedAssessorId(e.target.value)}
          required
          className="glass w-full rounded-md px-4 py-3 text-base outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary md:py-2.5 md:text-sm"
        >
          <option value="">-- Select an assessor --</option>
          {assessors.map((assessor) => (
            <option key={assessor.id} value={assessor.id}>
              {assessor.name} ({assessor.email})
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !selectedAssessorId}
        className="h-12 w-full rounded-md bg-primary px-4 text-base font-medium text-primary-foreground transition-all duration-75 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 md:h-10 md:text-sm"
      >
        {isSubmitting
          ? "Assigning..."
          : currentAssessorId
            ? "Change Assessor"
            : "Assign Assessor"}
      </button>
    </form>
  )
}
