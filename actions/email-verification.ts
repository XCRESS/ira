"use server"

// IRA Platform - Email Verification Actions
// Handles organic submission email verification (happens BEFORE lead creation)

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { verifyRole } from "@/lib/dal"
import { sendEmailVerificationEmail } from "@/lib/email"
import type { ActionResponse } from "@/lib/types"
import { randomBytes } from "crypto"

// ============================================
// VALIDATION SCHEMAS
// ============================================

const SendVerificationSchema = z.object({
  submissionId: z.string().cuid(),
})

const VerifyEmailSchema = z.object({
  token: z.string().min(32),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a secure random token for email verification
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
// PUBLIC VERIFICATION ACTION
// ============================================

/**
 * Verify email using token (NO AUTH REQUIRED - public endpoint)
 * Called when user clicks verification link in email
 * NOTE: Now verifies OrganicSubmission, not Lead
 */
export async function verifyEmail(input: unknown): Promise<ActionResponse<{
  companyName: string
  contactPerson: string
}>> {
  try {
    // NO AUTH CHECK - public endpoint

    // Validate input
    const { token } = VerifyEmailSchema.parse(input)

    console.log('[Email Verification] Attempting to verify token:', token.substring(0, 10) + '...')

    // Find submission with this token
    const submission = await prisma.organicSubmission.findFirst({
      where: {
        emailVerificationToken: token,
        isEmailVerified: false, // Only verify if not already verified
      },
      select: {
        id: true,
        companyName: true,
        contactPerson: true,
        email: true,
        emailVerificationExpiry: true,
        isEmailVerified: true,
      }
    })

    console.log('[Email Verification] Submission found:', !!submission)

    if (!submission) {
      // Try to find any submission with this token (for debugging)
      const anySubmission = await prisma.organicSubmission.findFirst({
        where: { emailVerificationToken: token },
        select: { id: true, isEmailVerified: true }
      })

      console.log('[Email Verification] Any submission with token:', !!anySubmission, anySubmission)

      return {
        success: false,
        error: "Invalid or expired verification link. Please request a new verification email."
      }
    }

    // Check if token is expired
    if (submission.emailVerificationExpiry && submission.emailVerificationExpiry < new Date()) {
      return {
        success: false,
        error: "This verification link has expired. Please submit your information again."
      }
    }

    // Check if already verified (edge case: multiple clicks on same link)
    if (submission.isEmailVerified) {
      return {
        success: true,
        data: {
          companyName: submission.companyName,
          contactPerson: submission.contactPerson,
        },
        message: "Email already verified."
      }
    }

    // Update submission to mark email as verified
    await prisma.organicSubmission.update({
      where: { id: submission.id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null, // Clear token after use
        emailVerificationExpiry: null,
      }
    })

    // Note: Cannot use revalidatePath here because this is called during server component render
    // The dashboard will refresh naturally when reviewers reload the page

    return {
      success: true,
      data: {
        companyName: submission.companyName,
        contactPerson: submission.contactPerson,
      },
      message: "Email verified successfully! Our team will review your submission soon."
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid verification token"
      }
    }
    console.error("Email verification error:", error)
    return {
      success: false,
      error: "Failed to verify email. Please try again."
    }
  }
}

// ============================================
// REVIEWER ACTIONS
// ============================================

/**
 * Send verification email to submission contact (REVIEWER only)
 * Can be used to resend verification for unverified submissions
 */
export async function sendVerificationEmail(input: unknown): Promise<ActionResponse<void>> {
  try {
    // Verify REVIEWER role
    await verifyRole("REVIEWER")

    // Validate input
    const { submissionId } = SendVerificationSchema.parse(input)

    // Get submission details
    const submission = await prisma.organicSubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        companyName: true,
        contactPerson: true,
        email: true,
        isEmailVerified: true,
      }
    })

    if (!submission) {
      return {
        success: false,
        error: "Submission not found"
      }
    }

    // Check if already verified
    if (submission.isEmailVerified) {
      return {
        success: false,
        error: "Email is already verified"
      }
    }

    // Generate new token and expiry
    const token = generateVerificationToken()
    const expiry = getTokenExpiry()

    // Update submission with new token
    await prisma.organicSubmission.update({
      where: { id: submissionId },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiry: expiry,
      }
    })

    // Send verification email
    const emailResult = await sendEmailVerificationEmail({
      contactPerson: submission.contactPerson,
      contactEmail: submission.email,
      companyName: submission.companyName,
      verificationToken: token,
    })

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error)
      return {
        success: false,
        error: "Failed to send verification email. Please try again."
      }
    }

    // Revalidate submissions page
    revalidatePath("/dashboard/organic-submissions")

    return {
      success: true,
      data: undefined,
      message: `Verification email sent to ${submission.email}`
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input"
      }
    }
    console.error("Send verification email error:", error)
    return {
      success: false,
      error: "Failed to send verification email"
    }
  }
}

/**
 * Check if submission email is verified (used by UI to show status)
 * PUBLIC - can be called without auth
 */
export async function checkEmailVerified(submissionId: string): Promise<ActionResponse<{
  isVerified: boolean
  verifiedAt: Date | null
}>> {
  try {
    const submission = await prisma.organicSubmission.findUnique({
      where: { id: submissionId },
      select: {
        isEmailVerified: true,
        emailVerifiedAt: true,
      }
    })

    if (!submission) {
      return {
        success: false,
        error: "Submission not found"
      }
    }

    return {
      success: true,
      data: {
        isVerified: submission.isEmailVerified,
        verifiedAt: submission.emailVerifiedAt,
      }
    }

  } catch (error) {
    console.error("Check email verified error:", error)
    return {
      success: false,
      error: "Failed to check verification status"
    }
  }
}
