'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface LeadCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (email: string, companyName: string) => void
}

export default function LeadCaptureModal({ isOpen, onClose, onSubmit }: LeadCaptureModalProps) {
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await onSubmit(email, companyName)
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a3a52] to-[#2a4a62]">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Get Your Free IPO Readiness Score
          </h3>
          <p className="text-sm text-gray-600">
            We'll email your results + custom improvement plan. No spam, unsubscribe anytime.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company Pvt. Ltd."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Work Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ceo@yourcompany.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Trust Indicators */}
          <div className="flex items-start space-x-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <svg className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Your data is encrypted and will never be shared. GDPR compliant.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#1a3a52] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#152e42] transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Starting Assessment...</span>
              </span>
            ) : (
              'Start Free Assessment →'
            )}
          </button>

          {/* Secondary Action */}
          <button
            type="button"
            onClick={onClose}
            className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            I'll do this later
          </button>
        </form>
      </div>
    </div>
  )
}
