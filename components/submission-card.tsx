'use client'

import { useState } from 'react'
import { Building2, User, Mail, Phone, CheckCircle, X, Loader2 } from 'lucide-react'
import { convertSubmissionToLead, rejectSubmission } from '@/actions/organic-submission'
import { useRouter } from 'next/navigation'

interface SubmissionCardProps {
  submission: {
    id: string
    cin: string
    companyName: string
    contactPerson: string
    email: string
    phone: string | null
    submittedAt: Date
  }
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const [loading, setLoading] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const router = useRouter()

  async function handleConvert() {
    if (loading) return

    const confirmed = confirm(
      `Create lead for ${submission.companyName}?\n\nThis will create a new lead in the system with status "NEW".`
    )

    if (!confirmed) return

    setLoading(true)

    const result = await convertSubmissionToLead(submission.id)

    if (result.success) {
      alert(`Lead created successfully! Lead ID: ${result.data?.leadId}`)
      router.refresh()
    } else {
      alert(`Failed to create lead: ${result.error}`)
    }

    setLoading(false)
  }

  async function handleReject() {
    if (loading) return

    setLoading(true)

    const result = await rejectSubmission(submission.id, {
      reason: rejectReason.trim() || undefined
    })

    if (result.success) {
      router.refresh()
    } else {
      alert(`Failed to reject: ${result.error}`)
    }

    setLoading(false)
    setShowRejectDialog(false)
    setRejectReason('')
  }

  const timeAgo = getTimeAgo(submission.submittedAt)

  return (
    <>
      <div className="glass rounded-xl p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
              <h3 className="text-lg font-semibold truncate">{submission.companyName}</h3>
            </div>
            <p className="text-sm text-muted">CIN: {submission.cin}</p>
            <p className="text-xs text-muted mt-1">Submitted {timeAgo}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 py-4 border-t border-foreground/10">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-muted flex-shrink-0" />
            <span className="text-sm">{submission.contactPerson}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted flex-shrink-0" />
            <a
              href={`mailto:${submission.email}`}
              className="text-sm text-primary hover:underline truncate"
            >
              {submission.email}
            </a>
          </div>
          {submission.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted flex-shrink-0" />
              <a
                href={`tel:${submission.phone}`}
                className="text-sm text-primary hover:underline"
              >
                {submission.phone}
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleConvert}
            disabled={loading}
            className="flex-1 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Create Lead
              </>
            )}
          </button>
          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={loading}
            className="h-10 px-4 rounded-lg border border-foreground/10 hover:bg-foreground/5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Reject</span>
          </button>
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Reject Submission</h3>
              <p className="text-sm text-muted">
                Are you sure you want to reject the submission from <strong>{submission.companyName}</strong>?
              </p>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  id="reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Internal notes about why this was rejected..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowRejectDialog(false)
                    setRejectReason('')
                  }}
                  disabled={loading}
                  className="flex-1 h-10 px-4 rounded-lg border border-foreground/10 hover:bg-foreground/5 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 h-10 px-4 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

  return new Date(date).toLocaleDateString()
}
