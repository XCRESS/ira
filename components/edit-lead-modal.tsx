"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { updateLead } from "@/actions/lead"
import type { LeadWithRelations } from "@/lib/types"

interface EditLeadModalProps {
  lead: LeadWithRelations
  onClose: () => void
  onSuccess: () => void
}

export function EditLeadModal({ lead, onClose, onSuccess }: EditLeadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      companyName: formData.get("companyName") as string,
      contactPerson: formData.get("contactPerson") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
    }

    const result = await updateLead(
      lead.leadId,
      data,
      lead.updatedAt.toISOString() // Optimistic locking
    )

    if (result.success) {
      onSuccess()
      onClose()
    } else {
      setError(result.error || "Failed to update lead")
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal (Desktop) / Sheet (Mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-50 glass-strong rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto md:inset-0 md:m-auto md:max-w-2xl md:max-h-[85vh] md:top-1/2 md:-translate-y-1/2 md:rounded-2xl md:bottom-auto">

        {/* Mobile Sheet Handle */}
        <div className="w-12 h-1 bg-foreground/20 rounded-full mx-auto mb-4 md:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">Edit Lead</h2>
            <p className="text-sm text-foreground/60 mt-1">
              Update company and contact information
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 hover:bg-foreground/5 active:bg-foreground/10 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {error && (
            <div className="rounded-lg bg-danger/10 p-4 text-danger">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* CIN (Read-only) */}
          <div className="space-y-2">
            <label htmlFor="cin-readonly" className="block text-sm font-medium">
              Company Identification Number (CIN)
            </label>
            <input
              id="cin-readonly"
              type="text"
              value={lead.cin}
              disabled
              className="glass w-full rounded-lg px-4 py-3 text-base font-mono uppercase tracking-wider outline-none ring-1 ring-foreground/10 opacity-60 cursor-not-allowed md:py-2.5 md:text-sm"
            />
            <p className="text-xs text-foreground/60">
              CIN cannot be changed
            </p>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <label htmlFor="companyName" className="block text-sm font-medium">
              Company Name <span className="text-danger">*</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              defaultValue={lead.companyName}
              disabled={isSubmitting}
              className="glass w-full rounded-lg px-4 py-3 text-base outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary disabled:opacity-50 md:py-2.5 md:text-sm"
              placeholder="TechCorp Pvt Ltd"
            />
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <label htmlFor="contactPerson" className="block text-sm font-medium">
              Contact Person <span className="text-danger">*</span>
            </label>
            <input
              id="contactPerson"
              name="contactPerson"
              type="text"
              required
              defaultValue={lead.contactPerson}
              disabled={isSubmitting}
              className="glass w-full rounded-lg px-4 py-3 text-base outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary disabled:opacity-50 md:py-2.5 md:text-sm"
              placeholder="Amit Kumar"
            />
          </div>

          {/* Phone and Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                pattern="\+91-[0-9]{10}"
                defaultValue={lead.phone || ''}
                disabled={isSubmitting}
                className="glass w-full rounded-lg px-4 py-3 text-base font-mono outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary disabled:opacity-50 md:py-2.5 md:text-sm"
                placeholder="+91-9876543210"
              />
              <p className="text-xs text-foreground/60">Format: +91-XXXXXXXXXX (Optional)</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email <span className="text-danger">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={lead.email}
                disabled={isSubmitting}
                className="glass w-full rounded-lg px-4 py-3 text-base outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary disabled:opacity-50 md:py-2.5 md:text-sm"
                placeholder="contact@techcorp.com"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium">
              Registered Address <span className="text-danger">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              required
              rows={3}
              defaultValue={lead.address}
              disabled={isSubmitting}
              className="glass w-full rounded-lg px-4 py-3 text-base outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary disabled:opacity-50 md:py-2.5 md:text-sm"
              placeholder="Full registered address of the company"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-foreground/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-12 rounded-lg bg-foreground/5 px-6 text-base font-medium transition-all duration-75 hover:bg-foreground/10 active:scale-[0.98] disabled:opacity-50 md:h-10 md:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition-all duration-75 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 md:h-10 md:text-sm"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
