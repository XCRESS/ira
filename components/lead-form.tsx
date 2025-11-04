"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createLead } from "@/actions/lead"
import type { CreateLeadInput } from "@/lib/types"
import type { LeadFormData } from "@/actions/probe42"

interface LeadFormProps {
  initialData?: Partial<LeadFormData>
  onCancel?: () => void
}

export function LeadForm({ initialData, onCancel }: LeadFormProps = {}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data: CreateLeadInput = {
      companyName: formData.get("companyName") as string,
      contactPerson: formData.get("contactPerson") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      cin: formData.get("cin") as string,
      address: formData.get("address") as string,
    }

    const result = await createLead(data)

    if (result.success) {
      router.push(`/dashboard/leads/${result.data.id}`)
      router.refresh()
    } else {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-danger/10 p-4 text-danger">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

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
          defaultValue={initialData?.companyName || ''}
          className="glass w-full rounded-md px-4 py-3 text-base outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary md:py-2.5 md:text-sm"
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
          defaultValue={initialData?.contactPerson || ''}
          className="glass w-full rounded-md px-4 py-3 text-base outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary md:py-2.5 md:text-sm"
          placeholder="Amit Kumar"
        />
      </div>

      {/* Phone and Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone Number <span className="text-danger">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            pattern="\+91-[0-9]{10}"
            defaultValue={initialData?.contactPhone || ''}
            className="glass w-full rounded-md px-4 py-3 text-base font-mono outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary md:py-2.5 md:text-sm"
            placeholder="+91-9876543210"
          />
          <p className="text-xs text-foreground/60">Format: +91-XXXXXXXXXX</p>
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
            defaultValue={initialData?.contactEmail || ''}
            className="glass w-full rounded-md px-4 py-3 text-base outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary md:py-2.5 md:text-sm"
            placeholder="contact@techcorp.com"
          />
        </div>
      </div>

      {/* CIN */}
      <div className="space-y-2">
        <label htmlFor="cin" className="block text-sm font-medium">
          Company Identification Number (CIN) <span className="text-danger">*</span>
        </label>
        <input
          id="cin"
          name="cin"
          type="text"
          required
          pattern="[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}"
          defaultValue={initialData?.cin || ''}
          className="glass w-full rounded-md px-4 py-3 text-base font-mono uppercase tracking-wider outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary md:py-2.5 md:text-sm"
          placeholder="U12345MH2020PTC123456"
        />
        <p className="text-xs text-foreground/60">
          Format: U12345MH2020PTC123456 (21 characters)
        </p>
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
          defaultValue={initialData?.address || ''}
          className="glass w-full rounded-md px-4 py-3 text-base outline-none ring-1 ring-foreground/10 transition-all duration-75 focus:ring-2 focus:ring-primary md:py-2.5 md:text-sm"
          placeholder="Full registered address of the company"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel || (() => router.back())}
          disabled={isSubmitting}
          className="h-12 rounded-md bg-foreground/5 px-6 text-base font-medium transition-all duration-75 hover:bg-foreground/10 active:scale-[0.98] disabled:opacity-50 md:h-10 md:text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-all duration-75 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 md:h-10 md:text-sm"
        >
          {isSubmitting ? "Creating..." : "Create Lead"}
        </button>
      </div>
    </form>
  )
}