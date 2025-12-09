// IRA Platform - Email Verification Page
// Public page for verifying lead contact emails

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { verifyEmail } from '@/actions/email-verification'
import { CheckCircle2, XCircle, Mail } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function VerifyEmailContent({ token }: { token: string }) {
  // Verify the email using the token
  const result = await verifyEmail({ token })

  if (result.success && result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="glass rounded-xl shadow-lg p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-success/10 rounded-full p-4">
                <CheckCircle2 className="w-16 h-16 text-success" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-4">
              Email Verified Successfully!
            </h1>

            {/* Message */}
            <p className="text-muted text-center mb-6">
              Your email has been verified. You will now receive important updates about your IPO readiness assessment.
            </p>

            {/* Info Card */}
            <div className="bg-muted/10 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted">
                <strong className="text-foreground">Company:</strong> {result.data.companyName}
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <h3 className="font-semibold text-sm mb-2">What's Next?</h3>
              <ul className="text-sm text-muted space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Our team will review your submission</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>You'll receive email updates at key milestones</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Expect to hear from us within 2-3 business days</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted mt-6">
            You can safely close this page.
          </p>
        </div>
      </div>
    )
  }

  // Error state
  const errorMessage = !result.success ? result.error : 'Unable to verify your email address.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 to-destructive/10 p-4">
      <div className="w-full max-w-md">
        {/* Error Card */}
        <div className="glass rounded-xl shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-destructive/10 rounded-full p-4">
              <XCircle className="w-16 h-16 text-destructive" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-4">
            Verification Failed
          </h1>

          {/* Error Message */}
          <p className="text-muted text-center mb-6">
            {errorMessage}
          </p>

          {/* Help Card */}
          <div className="bg-muted/10 rounded-lg p-4 border border-muted/20">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Need Help?
            </h3>
            <p className="text-sm text-muted mb-3">
              If this verification link has expired or you're experiencing issues, please contact our support team:
            </p>
            <a
              href="mailto:support@ira-platform.com"
              className="text-sm text-primary hover:underline"
            >
              support@ira-platform.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted mt-6">
          You can safely close this page.
        </p>
      </div>
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="glass rounded-xl shadow-lg p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted">Verifying your email...</p>
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