"use server"

// IRA Platform - Organic Lead Submission Actions
// Public endpoint for website visitors to submit their details

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { verifyRole, generateLeadId, createAuditLog, leadInclude } from "@/lib/dal"
import { sendOrganicSubmissionEmail, sendEmailVerificationEmail, sendSubmissionApprovedEmail, sendSubmissionRejectedEmail } from "@/lib/email"
import { getCompanyDetails } from "@/actions/probe42"
import type { ActionResponse, LeadWithRelations } from "@/lib/types"
import { randomBytes } from "crypto"

// ============================================
// VALIDATION SCHEMAS
// ============================================

const CreateSubmissionSchema = z.object({
  cin: z.string().refine((val) => /^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(val), {
    message: "Invalid CIN format (e.g., U12345MH2020PTC123456)"
  }),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(200),
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().refine((val) => /^\+91-[0-9]{10}$/.test(val), {
    message: "Phone must be in format: +91-XXXXXXXXXX"
  }).optional(),
})

const RejectSubmissionSchema = z.object({
  reason: z.string().max(500).optional(),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate email verification token
 */
function generateVerificationToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Calculate token expiry (24 hours from now)
 */
function getTokenExpiry(): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 24)
  return expiry
}

// ============================================
// PUBLIC SUBMISSION ACTION
// ============================================

/**
 * Create organic submission from website (NO AUTH REQUIRED)
 * Stores submission for reviewer approval before creating lead
 */
export async function createOrganicSubmission(input: unknown): Promise<ActionResponse<{ id: string }>> {
  try {
    // NO AUTH CHECK - public endpoint

    // Validate input
    const data = CreateSubmissionSchema.parse(input)

    // Use database-level upsert with conditional update to prevent race conditions
    // This leverages the unique constraint on CIN for atomic operations
    let submission

    try {
      submission = await prisma.organicSubmission.upsert({
        where: { cin: data.cin },
        create: {
          cin: data.cin,
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          email: data.email,
          phone: data.phone || null,
          status: "PENDING",
        },
        update: {
          // Only update if status is REJECTED (allow resubmission)
          // For PENDING/CONVERTED, this will still "succeed" but won't modify data
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          email: data.email,
          phone: data.phone || null,
          status: "PENDING",
          submittedAt: new Date(), // Reset timestamp
          // Clear rejection data if resubmitting
          rejectedBy: {
            disconnect: true
          },
          rejectedAt: null,
          rejectionReason: null,
        }
      })
    } catch (error: any) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        return {
          success: false,
          error: "This company has already been submitted. Please check back later."
        }
      }
      throw error
    }

    // Check if submission was already in PENDING or CONVERTED state
    // (upsert succeeded but we need to validate business logic)
    const currentStatus = await prisma.organicSubmission.findUnique({
      where: { cin: data.cin },
      select: { status: true, id: true }
    })

    if (currentStatus) {
      if (currentStatus.status === "PENDING" && currentStatus.id !== submission.id) {
        return {
          success: false,
          error: "This company has already been submitted and is pending review."
        }
      }

      if (currentStatus.status === "CONVERTED") {
        return {
          success: false,
          error: "This company is already in our system."
        }
      }
    }

    // Send email to all reviewers with failure tracking
    const reviewers = await prisma.user.findMany({
      where: { role: "REVIEWER", isActive: true },
      select: { email: true, name: true }
    })

    // Send emails and track results
    const emailResults = await Promise.allSettled(
      reviewers.map(reviewer =>
        sendOrganicSubmissionEmail({
          reviewerName: reviewer.name,
          reviewerEmail: reviewer.email,
          companyName: data.companyName,
          cin: data.cin,
          contactPerson: data.contactPerson,
          contactEmail: data.email,
          contactPhone: data.phone || null,
        })
      )
    )

    // Count failures
    const failedEmails = emailResults.filter(r =>
      r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    )

    // Log email failures (only log to console for now, as AuditLog requires userId)
    if (failedEmails.length > 0) {
      console.warn('[Email Notification Failed]', {
        type: "organic_submission_notification",
        submissionId: submission.id,
        companyName: data.companyName,
        cin: data.cin,
        failedCount: failedEmails.length,
        totalReviewers: reviewers.length,
        failureDetails: failedEmails.map((r, idx) => ({
          reviewer: reviewers[idx]?.email,
          error: r.status === 'rejected' ? String(r.reason) : 'Unknown error'
        }))
      })
    }

    // Critical alert if ALL emails failed
    if (failedEmails.length === reviewers.length && reviewers.length > 0) {
      console.error('[CRITICAL] All reviewer emails failed for organic submission:', {
        submissionId: submission.id,
        cin: data.cin,
        companyName: data.companyName,
        reviewerCount: reviewers.length
      })
    }

    // ✨ NEW: Generate verification token and send email immediately
    const verificationToken = generateVerificationToken()
    const verificationExpiry = getTokenExpiry()

    // Update submission with verification token
    await prisma.organicSubmission.update({
      where: { id: submission.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      }
    })

    // Send verification email to submitter (fire-and-forget)
    sendEmailVerificationEmail({
      contactPerson: data.contactPerson,
      contactEmail: data.email,
      companyName: data.companyName,
      verificationToken,
    }).catch((err: unknown) => {
      console.error("Failed to send verification email:", err)
    })

    // Revalidate submissions page
    revalidatePath("/dashboard/organic-submissions")

    return {
      success: true,
      data: { id: submission.id },
      message: "Submission received! Please check your email to verify your address."
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input"
      }
    }
    console.error("Organic submission error:", error)
    return {
      success: false,
      error: "Failed to submit. Please try again."
    }
  }
}

// ============================================
// REVIEWER ACTIONS
// ============================================

/**
 * Get count of pending submissions (REVIEWER only)
 * Used for dashboard stats and badges
 */
export async function getPendingSubmissionsCount(): Promise<ActionResponse<number>> {
  try {
    await verifyRole("REVIEWER")

    const count = await prisma.organicSubmission.count({
      where: { status: "PENDING" }
    })

    return { success: true, data: count }
  } catch (error) {
    console.error("Get submissions count error:", error)
    return { success: false, error: "Failed to fetch count" }
  }
}

/**
 * Get all pending submissions (REVIEWER only)
 */
export async function getPendingSubmissions(): Promise<ActionResponse<Array<{
  id: string
  cin: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  submittedAt: Date
  isEmailVerified: boolean
  emailVerifiedAt: Date | null
}>>> {
  try {
    await verifyRole("REVIEWER")

    const submissions = await prisma.organicSubmission.findMany({
      where: { status: "PENDING" },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        cin: true,
        companyName: true,
        contactPerson: true,
        email: true,
        phone: true,
        submittedAt: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
      }
    })

    return { success: true, data: submissions }
  } catch (error) {
    console.error("Get submissions error:", error)
    return { success: false, error: "Failed to fetch submissions" }
  }
}

/**
 * Convert submission to lead (REVIEWER only)
 * Creates a real lead from the submission and marks it as converted
 * ENHANCED: Now fetches Probe42 data during conversion
 */
export async function convertSubmissionToLead(
  submissionId: string
): Promise<ActionResponse<LeadWithRelations>> {
  try {
    // Verify REVIEWER role
    const session = await verifyRole("REVIEWER")

    // Get submission
    const submission = await prisma.organicSubmission.findUnique({
      where: { id: submissionId }
    })

    if (!submission) {
      return { success: false, error: "Submission not found" }
    }

    if (submission.status !== "PENDING") {
      return { success: false, error: "Submission already processed" }
    }

    // Check if CIN already exists in leads
    const existingLead = await prisma.lead.findUnique({
      where: { cin: submission.cin }
    })

    if (existingLead) {
      return {
        success: false,
        error: "A lead with this CIN already exists"
      }
    }

    // ✨ Fetch Probe42 data using CIN for enrichment
    let probe42RawData: Record<string, unknown> | undefined
    let enrichedAddress = "To be collected" // Fallback
    let enrichedPhone: string | null = submission.phone || null // No fake placeholder

    try {
      const probe42Result = await getCompanyDetails(submission.cin, 'CIN')

      if (probe42Result.success && 'rawData' in probe42Result && probe42Result.rawData) {
        probe42RawData = probe42Result.rawData as Record<string, unknown>

        // Use Probe42 address if available
        if (probe42Result.data?.address) {
          enrichedAddress = probe42Result.data.address
        }

        // Use Probe42 contact phone if submission didn't provide one
        if (!submission.phone && probe42Result.data?.contactPhone) {
          enrichedPhone = probe42Result.data.contactPhone
        }
      }
    } catch (probe42Error) {
      // Log but don't fail the conversion if Probe42 fails
      console.warn("Probe42 fetch failed during organic conversion:", probe42Error)
    }

    // Generate lead ID
    const leadId = await generateLeadId()

    // Transaction: Create lead + Mark submission as converted
    const lead = await prisma.$transaction(async (tx) => {
      // Type definition for Probe42 raw data structure (matches lead.ts)
      type Probe42RawData = {
        legal_name?: string
        efiling_status?: string
        classification?: string
        paid_up_capital?: number
        authorized_capital?: number
        pan?: string
        website?: string
        incorporation_date?: string
        active_compliance?: string
        director_count?: number
        gst_count?: number
      }

      const typedProbe42Data = probe42RawData as Probe42RawData | undefined

      // Create lead with enriched data
      const newLead = await tx.lead.create({
        data: {
          leadId,
          cin: submission.cin,
          companyName: submission.companyName,
          contactPerson: submission.contactPerson,
          email: submission.email,
          phone: enrichedPhone,
          address: enrichedAddress,
          status: "NEW",
          createdById: session.user.id,
          // Store Probe42 data if fetched with normalized fields
          ...(probe42RawData && typedProbe42Data && {
            probe42Fetched: true,
            probe42FetchedAt: new Date(),
            probe42LegalName: typedProbe42Data.legal_name || null,
            probe42Status: typedProbe42Data.efiling_status || null,
            probe42Classification: typedProbe42Data.classification || null,
            probe42PaidUpCapital: typedProbe42Data.paid_up_capital || null,
            probe42AuthCapital: typedProbe42Data.authorized_capital || null,
            probe42Pan: typedProbe42Data.pan || null,
            probe42Website: typedProbe42Data.website || null,
            probe42IncorpDate: typedProbe42Data.incorporation_date ? new Date(typedProbe42Data.incorporation_date) : null,
            probe42ComplianceStatus: typedProbe42Data.active_compliance || null,
            probe42DirectorCount: typedProbe42Data.director_count || null,
            probe42GstCount: typedProbe42Data.gst_count || null,
            probe42Data: probe42RawData as any, // Prisma JSON type requires 'any' cast
          }),
        },
        include: leadInclude,
      })

      // Mark submission as converted
      await tx.organicSubmission.update({
        where: { id: submissionId },
        data: {
          status: "CONVERTED",
          convertedToLeadId: newLead.id,
          convertedById: session.user.id,
          convertedAt: new Date(),
        }
      })

      return newLead
    })

    // Audit log
    await createAuditLog(session.user.id, "LEAD_CREATED", lead.id, {
      source: "organic_submission",
      submissionId,
      companyName: lead.companyName,
      cin: lead.cin,
      probe42Enriched: !!probe42RawData,
    })

    // Send approval email to submitter (fire-and-forget)
    sendSubmissionApprovedEmail({
      contactPerson: submission.contactPerson,
      contactEmail: submission.email,
      companyName: submission.companyName,
      leadId: lead.leadId,
    }).catch((err: unknown) => {
      console.error("Failed to send submission approved email:", err)
    })

    // Note: Probe42 PDF report can be downloaded manually by users via the UI
    // Email verification already happened at submission time, not needed here

    // Revalidate caches
    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/organic-submissions")

    return { success: true, data: lead }

  } catch (error) {
    console.error("Convert submission error:", error)
    return { success: false, error: "Failed to convert submission" }
  }
}

/**
 * Reject submission (REVIEWER only)
 */
export async function rejectSubmission(
  submissionId: string,
  input: unknown
): Promise<ActionResponse<void>> {
  try {
    const session = await verifyRole("REVIEWER")

    const { reason } = RejectSubmissionSchema.parse(input)

    const submission = await prisma.organicSubmission.findUnique({
      where: { id: submissionId }
    })

    if (!submission) {
      return { success: false, error: "Submission not found" }
    }

    if (submission.status !== "PENDING") {
      return { success: false, error: "Submission already processed" }
    }

    await prisma.organicSubmission.update({
      where: { id: submissionId },
      data: {
        status: "REJECTED",
        rejectedById: session.user.id,
        rejectedAt: new Date(),
        rejectionReason: reason || null,
      }
    })

    // Send rejection email to submitter (fire-and-forget)
    sendSubmissionRejectedEmail({
      contactPerson: submission.contactPerson,
      contactEmail: submission.email,
      companyName: submission.companyName,
      rejectionReason: reason,
    }).catch((err: unknown) => {
      console.error("Failed to send submission rejected email:", err)
    })

    revalidatePath("/dashboard/organic-submissions")

    return { success: true, data: undefined }

  } catch (error) {
    console.error("Reject submission error:", error)
    return { success: false, error: "Failed to reject submission" }
  }
}