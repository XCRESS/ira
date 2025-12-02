'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createOrganicSubmission } from '@/actions/organic-submission'

interface OrganicLeadFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function OrganicLeadForm({ onSuccess, onCancel }: OrganicLeadFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    const phone = formData.get('phone') as string
    const phoneValue = phone.trim() ? phone : undefined

    const result = await createOrganicSubmission({
      cin: formData.get('cin'),
      companyName: formData.get('companyName'),
      contactPerson: formData.get('contactPerson'),
      email: formData.get('email'),
      phone: phoneValue,
    })

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Failed to submit. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up relative">

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-1 rounded-full hover:bg-white/10 transition-colors"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="bg-brand-900 p-6 md:p-8 relative">
          <h2 className="text-2xl md:text-3xl font-serif text-white font-bold mb-2">
            Get Your Free Assessment
          </h2>
          <p className="text-brand-200 text-sm md:text-base pr-8">
            Share your details and our team will contact you within 2-3 business days.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">

          {/* CIN Field */}
          <div>
            <label htmlFor="cin" className="block text-sm font-medium text-gray-700 mb-2">
              CIN <span className="text-red-500">*</span>
            </label>
            <input
              id="cin"
              name="cin"
              type="text"
              placeholder="U12345MH2020PTC123456"
              required
              disabled={loading}
              className="w-full h-12 px-4 py-3 text-base rounded-lg border border-gray-300 bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Company Identification Number from Ministry of Corporate Affairs
            </p>
          </div>

          {/* Company Name Field */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="ABC Manufacturing Pvt Ltd"
              required
              disabled={loading}
              className="w-full h-12 px-4 py-3 text-base rounded-lg border border-gray-300 bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Contact Person Field */}
          <div>
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="contactPerson"
              name="contactPerson"
              type="text"
              placeholder="Rajesh Kumar"
              required
              disabled={loading}
              className="w-full h-12 px-4 py-3 text-base rounded-lg border border-gray-300 bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="rajesh@abcmfg.com"
              required
              disabled={loading}
              className="w-full h-12 px-4 py-3 text-base rounded-lg border border-gray-300 bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Phone Field (Optional) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91-9876543210"
              disabled={loading}
              className="w-full h-12 px-4 py-3 text-base rounded-lg border border-gray-300 bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: +91-XXXXXXXXXX
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-600 leading-relaxed">
              By submitting this form, you agree to our team contacting you regarding your IPO readiness assessment. We respect your privacy and will never share your information with third parties.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-12 px-4 py-3 text-base font-medium rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 px-4 py-3 text-base font-bold rounded-lg bg-gold-600 text-white hover:bg-gold-500 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>

        </form>
        </div>
      </div>
    </div>
  )
}
