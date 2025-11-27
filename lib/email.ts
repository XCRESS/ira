// IRA Platform - Email Service
// Centralized email sending with Resend API
// ✅ Fire-and-forget pattern (doesn't block core operations)
// ✅ Structured error logging
// ✅ Rate limit handling (2 emails/second)
// ✅ Plain text fallback support

import { Resend } from 'resend'
import {
  getLeadAssignmentEmailHTML,
  getLeadAssignmentEmailText,
  getAssessmentSubmittedEmailHTML,
  getAssessmentSubmittedEmailText,
  getAssessmentRejectedEmailHTML,
  getAssessmentRejectedEmailText,
  type LeadAssignmentEmailData,
  type AssessmentSubmittedEmailData,
  type AssessmentRejectedEmailData
} from './email-templates'

// ============================================
// CONFIGURATION
// ============================================

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'IRA Platform <noreply@irascore.com>'

if (!RESEND_API_KEY) {
  console.warn('[Email] RESEND_API_KEY not configured. Email notifications will be disabled.')
}

// Initialize Resend client (only if API key is configured)
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

// ============================================
// TYPE DEFINITIONS
// ============================================

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Throttle email sending to respect Resend's 2 emails/second limit
 * @param emails Array of email send promises
 * @param batchSize Number of emails per batch (default: 2)
 * @param delayMs Delay between batches in ms (default: 1000)
 */
export async function sendEmailsBatched<T>(
  emails: (() => Promise<T>)[],
  batchSize = 2,
  delayMs = 1000
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = []

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(
      batch.map(fn => fn())
    )
    results.push(...batchResults)

    // Delay before next batch (skip on last batch)
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * Send a single email using Resend API
 * Internal helper function
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<EmailResult> {
  // If Resend is not configured, log warning and return early
  if (!resend) {
    console.warn('[Email] Skipping email send - Resend not configured', { to, subject })
    return {
      success: false,
      error: 'Resend API key not configured'
    }
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text
    })

    if (result.error) {
      console.error('[Email] Failed to send email:', {
        to,
        subject,
        error: result.error
      })
      return {
        success: false,
        error: result.error.message
      }
    }

    console.log('[Email] Sent successfully:', {
      to,
      subject,
      messageId: result.data?.id
    })

    return {
      success: true,
      messageId: result.data?.id
    }
  } catch (error) {
    console.error('[Email] Unexpected error sending email:', {
      to,
      subject,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================
// PUBLIC EMAIL FUNCTIONS
// ============================================

/**
 * Send lead assignment notification to assessor
 * Called when a reviewer assigns a lead to an assessor
 */
export async function sendLeadAssignmentEmail(
  data: LeadAssignmentEmailData
): Promise<EmailResult> {
  const subject = `New Lead Assigned: ${data.companyName} (${data.leadId})`
  const html = getLeadAssignmentEmailHTML(data)
  const text = getLeadAssignmentEmailText(data)

  // Extract email from assessor data (could be user object or email string)
  const assessorEmail = typeof data === 'object' && 'assessorEmail' in data
    ? (data as any).assessorEmail
    : data.assessorName.includes('@')
      ? data.assessorName
      : null

  if (!assessorEmail) {
    console.error('[Email] No assessor email provided', { data })
    return {
      success: false,
      error: 'Assessor email not provided'
    }
  }

  return sendEmail(assessorEmail, subject, html, text)
}

/**
 * Send assessment submission notification to reviewer(s)
 * Called when an assessor submits an assessment for review
 */
export async function sendAssessmentSubmittedEmail(
  data: AssessmentSubmittedEmailData
): Promise<EmailResult> {
  const subject = `Assessment Ready for Review: ${data.companyName} (${data.leadId})`
  const html = getAssessmentSubmittedEmailHTML(data)
  const text = getAssessmentSubmittedEmailText(data)

  // Extract email from reviewer data
  const reviewerEmail = typeof data === 'object' && 'reviewerEmail' in data
    ? (data as any).reviewerEmail
    : data.reviewerName.includes('@')
      ? data.reviewerName
      : null

  if (!reviewerEmail) {
    console.error('[Email] No reviewer email provided', { data })
    return {
      success: false,
      error: 'Reviewer email not provided'
    }
  }

  return sendEmail(reviewerEmail, subject, html, text)
}

/**
 * Send assessment rejection notification to assessor
 * Called when a reviewer rejects an assessment and requests revisions
 */
export async function sendAssessmentRejectedEmail(
  data: AssessmentRejectedEmailData
): Promise<EmailResult> {
  const subject = `Assessment Revision Required: ${data.companyName} (${data.leadId})`
  const html = getAssessmentRejectedEmailHTML(data)
  const text = getAssessmentRejectedEmailText(data)

  // Extract email from assessor data
  const assessorEmail = typeof data === 'object' && 'assessorEmail' in data
    ? (data as any).assessorEmail
    : data.assessorName.includes('@')
      ? data.assessorName
      : null

  if (!assessorEmail) {
    console.error('[Email] No assessor email provided', { data })
    return {
      success: false,
      error: 'Assessor email not provided'
    }
  }

  return sendEmail(assessorEmail, subject, html, text)
}

/**
 * Send emails to multiple recipients with rate limiting
 * Useful for sending to all reviewers
 */
export async function sendBulkEmails(
  emails: Array<{
    to: string
    subject: string
    html: string
    text: string
  }>
): Promise<EmailResult[]> {
  const emailFunctions = emails.map(({ to, subject, html, text }) =>
    () => sendEmail(to, subject, html, text)
  )

  const results = await sendEmailsBatched(emailFunctions)

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        success: false,
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
      }
    }
  })
}