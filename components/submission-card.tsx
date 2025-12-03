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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  async function handleConvert() {
    if (loading) return
    setLoading(true)

    const result = await convertSubmissionToLead(submission.id)

    if (result.success) {
      setMessage({ type: 'success', text: `Lead created successfully! Lead ID: ${result.data?.leadId}` })
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } else {
      setMessage({ type: 'error', text: `Failed to create lead: ${result.error}` })
      setLoading(false)
    }

    setShowConfirmDialog(false)
  }

  async function handleReject() {
    if (loading) return
    setLoading(true)

    const result = await rejectSubmission(submission.id, {
      reason: rejectReason.trim() || undefined
    })

    if (result.success) {
      setMessage({ type: 'success', text: 'Submission rejected' })
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } else {
      setMessage({ type: 'error', text: `Failed to reject: ${result.error}` })
      setLoading(false)
    }

    setShowRejectDialog(false)
    setRejectReason('')
  }

  const timeAgo = getTimeAgo(submission.submittedAt)

  return (
    <>
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 glass-strong rounded-lg p-4 shadow-lg max-w-sm ${
          message.type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
        }`}>
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="glass rounded-xl p-4 md:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-5 w-5 text-primary shrink-0" />
                <h3 className="text-base md:text-lg font-semibold truncate">{submission.companyName}</h3>
              </div>
              <p className="text-sm text-foreground/70">CIN: {submission.cin}</p>
              <p className="text-xs text-foreground/60 mt-1">Submitted {timeAgo}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 pt-4 border-t border-foreground/10">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-foreground/60 shrink-0" />
              <span className="text-sm">{submission.contactPerson}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-foreground/60 shrink-0" />
              <a
                href={`mailto:${submission.email}`}
                className="text-sm text-primary hover:text-primary/80 truncate"
              >
                {submission.email}
              </a>
            </div>
            {submission.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-foreground/60 shrink-0" />
                <a
                  href={`tel:${submission.phone}`}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  {submission.phone}
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-foreground/10">
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={loading}
              className="flex-1 h-12 md:h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Create Lead
                </>
              )}
            </button>
            <button
              onClick={() => setShowRejectDialog(true)}
              disabled={loading}
              className="h-12 md:h-10 px-4 rounded-lg border border-foreground/10 hover:bg-foreground/5 active:bg-foreground/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Reject</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Dialog - Desktop: Modal, Mobile: Bottom Sheet */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center">
          <div className="glass-strong rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] md:max-h-auto">
            {/* Mobile drag handle */}
            <div className="flex md:hidden h-1 w-12 bg-foreground/20 rounded-full mx-auto mt-4 mb-2" />

            <div className="p-6 space-y-4">
              <h3 className="text-base md:text-lg font-semibold">Create Lead</h3>
              <p className="text-sm text-foreground/70">
                Create a new lead for <strong>{submission.companyName}</strong>? This will create a lead with status "NEW" in the system.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={loading}
                  className="flex-1 h-12 md:h-10 px-4 rounded-lg border border-foreground/10 hover:bg-foreground/5 active:bg-foreground/5 transition-all disabled:opacity-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className="flex-1 h-12 md:h-10 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog - Desktop: Modal, Mobile: Bottom Sheet */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center">
          <div className="glass-strong rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto">
            {/* Mobile drag handle */}
            <div className="flex md:hidden h-1 w-12 bg-foreground/20 rounded-full mx-auto mt-4 mb-2" />

            <div className="p-6 space-y-4">
              <h3 className="text-base md:text-lg font-semibold">Reject Submission</h3>
              <p className="text-sm text-foreground/70">
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
                  className="w-full h-12 md:h-10 px-4 py-3 md:py-2 text-base md:text-sm rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary resize-none bg-background"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowRejectDialog(false)
                    setRejectReason('')
                  }}
                  disabled={loading}
                  className="flex-1 h-12 md:h-10 px-4 rounded-lg border border-foreground/10 hover:bg-foreground/5 active:bg-foreground/5 transition-all disabled:opacity-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 h-12 md:h-10 px-4 rounded-lg bg-red-500 text-white hover:bg-red-500/90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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
