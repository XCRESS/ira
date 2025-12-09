// IRA Platform - Email Verification Page
// Public page for verifying submission emails

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { verifyEmail } from '@/actions/email-verification'
import { CheckCircle2, XCircle, Mail, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function VerifyEmailContent({ token }: { token: string }) {
  // Verify the email using the token
  const result = await verifyEmail({ token })

  if (result.success && result.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gold-50 font-sans">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-serif font-bold text-brand-900">
                IRA<span className="text-gold-500">Score</span>
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-4 shadow-lg">
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Email Verified Successfully!
              </h1>
              <p className="text-green-50 text-lg">
                Welcome to IRA Platform
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              <div className="text-center mb-8">
                <p className="text-gray-700 text-lg mb-6">
                  Thank you for verifying your email address. Your submission for <strong className="text-brand-900">{result.data.companyName}</strong> is now confirmed.
                </p>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-br from-brand-50 to-gold-50 rounded-xl p-6 mb-8 border border-brand-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-900 mb-2">What Happens Next?</h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-brand-600 text-white rounded-full text-xs flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">1</span>
                        <span>Our expert team will review your submission within 2-3 business days</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-brand-600 text-white rounded-full text-xs flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">2</span>
                        <span>You'll receive email updates at each milestone of the assessment process</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-brand-600 text-white rounded-full text-xs flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">3</span>
                        <span>Once approved, we'll begin your comprehensive IPO readiness assessment</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg font-semibold hover:from-brand-700 hover:to-brand-800 transition-all shadow-md hover:shadow-lg"
                >
                  Back to Home
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/methodology"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-brand-600 border-2 border-brand-600 rounded-lg font-semibold hover:bg-brand-50 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-sm text-gray-500 mt-8">
            You can safely close this page or explore more about our services.
          </p>
        </main>
      </div>
    )
  }

  // Error state
  const errorMessage = !result.success ? result.error : 'Unable to verify your email address.'

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-serif font-bold text-brand-900">
              IRA<span className="text-gold-500">Score</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Error Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-600 px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Verification Failed
            </h1>
            <p className="text-red-50 text-lg">
              We couldn't verify your email
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <p className="text-gray-700 text-lg mb-6">
                {errorMessage}
              </p>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 mb-8 border border-orange-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    If this verification link has expired or you're experiencing issues, here's what you can do:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <span>Try submitting your information again from our homepage</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <span>Contact our support team for assistance</span>
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-orange-100">
                    <p className="text-sm font-medium text-gray-900">Support Email:</p>
                    <a
                      href="mailto:support@ira-platform.com"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      support@ira-platform.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg font-semibold hover:from-brand-700 hover:to-brand-800 transition-all shadow-md hover:shadow-lg"
              >
                Back to Home
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="mailto:support@ira-platform.com"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-orange-600 border-2 border-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-all"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          You can safely close this page.
        </p>
      </main>
    </div>
  )
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams
  const token = typeof params.token === 'string' ? params.token : null

  // If no token provided, redirect to home
  if (!token) {
    redirect('/')
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gold-50 font-sans">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-serif font-bold text-brand-900">
                  IRA<span className="text-gold-500">Score</span>
                </span>
              </Link>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12">
              <div className="flex flex-col items-center gap-6">
                <Loader2 className="w-16 h-16 text-brand-600 animate-spin" />
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
                  <p className="text-gray-600">Please wait while we verify your email address...</p>
                </div>
              </div>
            </div>
          </main>
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
