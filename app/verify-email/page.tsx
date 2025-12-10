// IRA Platform - Email Verification Page
// Public page for verifying submission emails

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { verifyEmail } from '@/actions/email-verification'
import { CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function VerifyEmailContent({ token }: { token: string }) {
  const result = await verifyEmail({ token })

  if (result.success && result.data) {
    // Success State - Minimal & Elegant
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Success Header */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif text-white font-bold">
                Email Verified
              </h1>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="text-center">
                <p className="text-base text-gray-700">
                  Thank you for verifying your email for{' '}
                  <span className="font-semibold text-gray-900">{result.data.companyName}</span>.
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
                    <p className="text-sm text-gray-700">
                      Our team reviews your submission
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold mt-0.5">
                      2
                    </div>
                    <p className="text-sm text-gray-700">
                      You'll receive email updates at key milestones
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold mt-0.5">
                      3
                    </div>
                    <p className="text-sm text-gray-700">
                      Expect to hear from us within 2-3 business days
                    </p>
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

              {/* Back Button */}
              <Link
                href="/"
                className="w-full h-12 px-4 py-3 text-base font-bold rounded-lg bg-gold-600 text-white hover:bg-gold-500 shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Back to Home
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error State - Minimal & Elegant
  const errorMessage = !result.success ? result.error : 'Unable to verify your email address.'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Error Header */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-white font-bold">
              Verification Failed
            </h1>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <p className="text-base text-gray-700">
                {errorMessage}
              </p>
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Need Help?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5">
                    •
                  </div>
                  <p className="text-sm text-gray-700">
                    Try submitting your information again from our homepage
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5">
                    •
                  </div>
                  <p className="text-sm text-gray-700">
                    Contact our support team for assistance
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 text-center">
                Contact us at{' '}
                <a href="mailto:support@irascore.com" className="text-brand-600 hover:text-brand-700 font-medium">
                  support@irascore.com
                </a>
              </p>
            </div>

            {/* Back Button */}
            <Link
              href="/"
              className="w-full h-12 px-4 py-3 text-base font-bold rounded-lg bg-gold-600 text-white hover:bg-gold-500 shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Back to Home
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams
  const token = typeof params.token === 'string' ? params.token : null

  if (!token) {
    redirect('/')
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-12">
              <div className="flex flex-col items-center gap-6">
                <Loader2 className="w-16 h-16 text-brand-600 animate-spin" />
                <div className="text-center">
                  <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">
                    Verifying Your Email
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Please wait...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent token={token} />
    </Suspense>
  )
}

export const metadata = {
  title: 'Verify Email - IRA Platform',
  description: 'Verify your email address for IPO readiness assessment',
}
