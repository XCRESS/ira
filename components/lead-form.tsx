"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createLead } from "@/actions/lead"
import type { CreateLeadInput } from "@/lib/types"

export function LeadForm() {
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
          className="glass w-full rounded-lg px-4 py-2.5 text-sm outline-none ring-1 ring-foreground/10 focus:ring-2 focus:ring-primary"
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
          className="glass w-full rounded-lg px-4 py-2.5 text-sm outline-none ring-1 ring-foreground/10 focus:ring-2 focus:ring-primary"
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
            className="glass w-full rounded-lg px-4 py-2.5 text-sm outline-none ring-1 ring-foreground/10 focus:ring-2 focus:ring-primary"
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
            className="glass w-full rounded-lg px-4 py-2.5 text-sm outline-none ring-1 ring-foreground/10 focus:ring-2 focus:ring-primary"
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
          className="glass w-full rounded-lg px-4 py-2.5 text-sm font-mono outline-none ring-1 ring-foreground/10 focus:ring-2 focus:ring-primary"
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
          className="glass w-full rounded-lg px-4 py-2.5 text-sm outline-none ring-1 ring-foreground/10 focus:ring-2 focus:ring-primary"
          placeholder="Full registered address of the company"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-lg bg-foreground/5 px-6 py-2.5 text-sm font-medium hover:bg-foreground/10 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Lead"}
        </button>
      </div>
    </form>
  )
}