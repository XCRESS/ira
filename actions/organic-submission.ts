"use server"

// IRA Platform - Organic Lead Submission Actions
// Public endpoint for website visitors to submit their details

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { verifyRole, generateLeadId, createAuditLog, leadInclude } from "@/lib/dal"
import { sendOrganicSubmissionEmail } from "@/lib/email"
import type { ActionResponse, LeadWithRelations } from "@/lib/types"

// ============================================
// VALIDATION SCHEMAS
// ============================================

const CreateSubmissionSchema = z.object({
  cin: z.string().regex(
    /^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
    "Invalid CIN format (e.g., U12345MH2020PTC123456)"
  ),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(200),
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+91-[0-9]{10}$/, "Phone must be in format: +91-XXXXXXXXXX").optional(),
})

const RejectSubmissionSchema = z.object({
  reason: z.string().max(500).optional(),
})

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

    // Check if CIN already submitted (and still pending)
    const existing = await prisma.organicSubmission.findUnique({
      where: { cin: data.cin }
    })

    if (existing && existing.status === "PENDING") {
      return {
        success: false,
        error: "This company has already been submitted and is pending review."
      }
    }

    if (existing && existing.status === "CONVERTED") {
      return {
        success: false,
        error: "This company is already in our system."
      }
    }

    // If previously rejected, allow resubmission (will overwrite)
    const submission = await prisma.organicSubmission.upsert({
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

    // Send email to all reviewers (fire-and-forget)
    const reviewers = await prisma.user.findMany({
      where: { role: "REVIEWER", isActive: true },
      select: { email: true, name: true }
    })

    Promise.all(
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
    ).catch(err => console.error("Failed to send reviewer emails:", err))

    // Revalidate submissions page
    revalidatePath("/dashboard/organic-submissions")

    return { success: true, data: { id: submission.id } }

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

    // Generate lead ID
    const leadId = await generateLeadId()

    // Transaction: Create lead + Mark submission as converted
    const lead = await prisma.$transaction(async (tx) => {
      // Create lead
      const newLead = await tx.lead.create({
        data: {
          leadId,
          cin: submission.cin,
          companyName: submission.companyName,
          contactPerson: submission.contactPerson,
          email: submission.email,
          phone: submission.phone || "+91-0000000000", // Placeholder if not provided
          address: "To be collected", // Placeholder
          status: "NEW",
          createdById: session.user.id,
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
    })

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

    revalidatePath("/dashboard/organic-submissions")

    return { success: true, data: undefined }

  } catch (error) {
    console.error("Reject submission error:", error)
    return { success: false, error: "Failed to reject submission" }
  }
}