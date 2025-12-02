'use client'

import { CheckCircle, ArrowRight } from 'lucide-react'

interface SuccessViewProps {
  onClose: () => void
}

export function SuccessView({ onClose }: SuccessViewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up relative">

        {/* Success Icon */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-white font-bold">
            Submission Received
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center">
            <p className="text-base text-gray-700 mb-4">
              Thank you for submitting your company details. We have received your information and our team will review it shortly.
            </p>
          </div>

          {/* What Happens Next */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              What Happens Next
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    Our expert team will review your company details
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    We will prepare a detailed readiness report
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    You will receive the report via email within 2-3 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 text-center">
              Questions? Contact us at{' '}
              <a href="mailto:support@irascore.com" className="text-brand-600 hover:text-brand-700 font-medium">
                support@irascore.com
              </a>
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full h-12 px-4 py-3 text-base font-bold rounded-lg bg-gold-600 text-white hover:bg-gold-500 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Close
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
