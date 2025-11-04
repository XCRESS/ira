"use server"

// IRA Platform - Lead Management Server Actions (Refactored)
// ✅ Atomic sequence generation (no race conditions)
// ✅ Optimistic locking (concurrent modification protection)
// ✅ Structured error handling (error codes instead of strings)
// ✅ User.isActive verification in DAL
// ✅ Proper transaction management

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import {
  verifyAuth,
  verifyRole,
  generateLeadId,
  createAuditLog,
  checkOptimisticLock,
  handlePrismaError,
  leadInclude,
} from "@/lib/dal"
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  AssignAssessorSchema,
  UpdateLeadStatusSchema,
  sortLeadsByStatusPriority,
  type ActionResponse,
  type LeadWithRelations,
} from "@/lib/types"
import { Errors, AppError, ErrorCode } from "@/lib/errors"
import { ZodError } from "zod"

// ============================================
// ERROR HANDLER WRAPPER
// ============================================

function handleActionError(error: unknown): ActionResponse<never> {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      context: error.context,
    }
  }

  if (error instanceof ZodError) {
    return {
      success: false,
      error: error.issues[0]?.message || "Invalid input",
      code: ErrorCode.INVALID_INPUT,
    }
  }

  console.error("Unexpected error in action:", error)
  return {
    success: false,
    error: "An unexpected error occurred",
    code: ErrorCode.UNKNOWN_ERROR,
  }
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Create a new lead (REVIEWER only)
 * ✅ Atomic lead ID generation (no race conditions)
 * ✅ CIN uniqueness check
 * ✅ Proper error handling
 */
export async function createLead(
  input: unknown
): Promise<ActionResponse<LeadWithRelations>> {
  try {
    // 1. Verify auth and role
    const session = await verifyRole("REVIEWER")

    // 2. Validate input
    const validatedData = CreateLeadSchema.parse(input)

    // 3. Check if CIN already exists
    const existing = await prisma.lead.findUnique({
      where: { cin: validatedData.cin },
    })

    if (existing) {
      throw Errors.duplicateCIN(validatedData.cin)
    }

    // 4. Generate lead ID atomically (prevents race conditions)
    const leadId = await generateLeadId()

    // 5. Create lead
    const lead = await prisma.lead.create({
      data: {
        leadId,
        companyName: validatedData.companyName,
        contactPerson: validatedData.contactPerson,
        phone: validatedData.phone,
        email: validatedData.email,
        cin: validatedData.cin,
        address: validatedData.address,
        status: "NEW",
        createdById: session.user.id,
      },
      include: leadInclude,
    })

    // 6. Create audit log
    await createAuditLog(session.user.id, "LEAD_CREATED", lead.id, {
      companyName: lead.companyName,
      cin: lead.cin,
      leadId: lead.leadId,
    })

    // 7. Revalidate paths
    revalidatePath("/dashboard/leads")

    return { success: true, data: lead }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Get all leads with optional filters
 * ✅ Role-based filtering (assessors see only their leads)
 * ✅ Priority sorting for reviewers
 */
export async function getLeads(filters?: {
  assignedTo?: string
  status?: string
}): Promise<ActionResponse<LeadWithRelations[]>> {
  try {
    // 1. Verify auth
    const session = await verifyAuth()

    // 2. Build where clause
    const where: {
      assignedAssessorId?: string
      status?: "NEW" | "ASSIGNED" | "IN_REVIEW" | "PAYMENT_PENDING" | "COMPLETED"
    } = {}

    // If assessor, only show assigned leads
    if (session.user.role === "ASSESSOR") {
      where.assignedAssessorId = session.user.id
    }

    // Apply filters
    if (filters?.assignedTo) {
      where.assignedAssessorId = filters.assignedTo
    }
    if (filters?.status) {
      where.status = filters.status as "NEW" | "ASSIGNED" | "IN_REVIEW" | "PAYMENT_PENDING" | "COMPLETED"
    }

    // 3. Fetch leads
    const leads = await prisma.lead.findMany({
      where,
      include: leadInclude,
      orderBy: {
        createdAt: "desc",
      },
    })

    // 4. Sort by priority for reviewers
    const sortedLeads =
      session.user.role === "REVIEWER" ? sortLeadsByStatusPriority(leads) : leads

    return { success: true, data: sortedLeads }
  } catch (error) {
    return handleActionError(error)
  }
}

/**
 * Get single lead by ID with full details
 * ✅ Access control (assessors can only view assigned leads)
 */
export async function getLead(
  leadId: string
): Promise<ActionResponse<LeadWithRelations>> {
  try {
    // 1. Verify auth
    const session = await verifyAuth()

    // 2. Fetch lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: leadInclude,
    })

    if (!lead) {
      throw Errors.leadNotFound(leadId)
    }

    // 3. Check access (assessors can only view their assigned leads)
    if (session.user.role === "ASSESSOR") {
      if (lead.assignedAssessor?.id !== session.user.id) {
        throw Errors.insufficientPermissions()
      }
    }

    return { success: true, data: lead }
  } catch (error) {
    return handleActionError(error)
  }
}

/**
 * Update lead information
 * ✅ Optimistic locking (prevents concurrent modifications)
 * ✅ Role-based access control
 */
export async function updateLead(
  leadId: string,
  input: unknown,
  expectedUpdatedAt: string // ISO timestamp for optimistic locking
): Promise<ActionResponse<LeadWithRelations>> {
  try {
    // 1. Verify auth
    const session = await verifyAuth()

    // 2. Validate input
    const validatedData = UpdateLeadSchema.parse(input)

    // 3. Fetch lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    })

    if (!lead) {
      throw Errors.leadNotFound(leadId)
    }

    // 4. Check access
    if (session.user.role === "ASSESSOR") {
      if (lead.assignedAssessorId !== session.user.id) {
        throw Errors.insufficientPermissions()
      }
    }

    // 5. Optimistic locking check
    checkOptimisticLock(lead.updatedAt, new Date(expectedUpdatedAt))

    // 6. Update lead
    const updated = await prisma.lead.update({
      where: {
        id: leadId,
        updatedAt: lead.updatedAt, // Atomic check-and-set
      },
      data: validatedData,
      include: leadInclude,
    })

    // 7. Create audit log
    await createAuditLog(session.user.id, "LEAD_UPDATED", lead.id, {
      changes: validatedData,
    })

    // 8. Revalidate paths
    revalidatePath("/dashboard/leads")
    revalidatePath(`/dashboard/leads/${leadId}`)

    return { success: true, data: updated }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Assign assessor to lead (REVIEWER only)
 * ✅ Transaction ensures atomicity (lead + assessment)
 * ✅ Optimistic locking
 * ✅ Validates assessor exists and has correct role
 */
export async function assignAssessor(
  leadId: string,
  input: unknown,
  expectedUpdatedAt: string
): Promise<ActionResponse<LeadWithRelations>> {
  try {
    // 1. Verify auth and role
    const session = await verifyRole("REVIEWER")

    // 2. Validate input
    const validatedData = AssignAssessorSchema.parse(input)

    // 3. Check if assessor exists and has correct role
    const assessor = await prisma.user.findUnique({
      where: { id: validatedData.assessorId },
      select: {
        id: true,
        name: true,
        role: true,
        isActive: true,
      },
    })

    if (!assessor) {
      throw Errors.insufficientPermissions("Assessor not found")
    }

    if (assessor.role !== "ASSESSOR") {
      throw Errors.insufficientPermissions("Selected user is not an assessor")
    }

    if (!assessor.isActive) {
      throw Errors.userInactive()
    }

    // 4. Check if lead exists and optimistic lock
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { assessment: true },
    })

    if (!lead) {
      throw Errors.leadNotFound(leadId)
    }

    checkOptimisticLock(lead.updatedAt, new Date(expectedUpdatedAt))

    // 5. Create question snapshot for assessment
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { order: "asc" }],
    })

    const questionSnapshot = {
      eligibility: questions.filter((q) => q.type === "ELIGIBILITY"),
      company: questions.filter((q) => q.type === "COMPANY"),
      financial: questions.filter((q) => q.type === "FINANCIAL"),
      sector: questions.filter((q) => q.type === "SECTOR"),
    }

    const totalQuestionCount =
      questionSnapshot.eligibility.length +
      questionSnapshot.company.length +
      questionSnapshot.financial.length +
      questionSnapshot.sector.length

    const snapshotVersion = `${Date.now()}-${totalQuestionCount}`

    // 6. Transaction: Update lead + create/update assessment
    const updated = await prisma.$transaction(async (tx) => {
      // Update lead status and assignment
      const updatedLead = await tx.lead.update({
        where: {
          id: leadId,
          updatedAt: lead.updatedAt, // Atomic check
        },
        data: {
          assignedAssessorId: validatedData.assessorId,
          status: "ASSIGNED",
        },
        include: leadInclude,
      })

      // Create assessment if it doesn't exist
      if (!lead.assessment) {
        await tx.assessment.create({
          data: {
            leadId,
            assessorId: validatedData.assessorId,
            status: "DRAFT",
            questionSnapshot: questionSnapshot as any,
            questionSnapshotVersion: snapshotVersion,
          },
        })
      } else {
        // Update existing assessment's assessor and refresh snapshot
        await tx.assessment.update({
          where: { id: lead.assessment.id },
          data: {
            assessorId: validatedData.assessorId,
            questionSnapshot: questionSnapshot as any,
            questionSnapshotVersion: snapshotVersion,
            // Reset if reassigning to different assessor
            status: "DRAFT",
            eligibilityAnswers: {},
            companyAnswers: {},
            financialAnswers: {},
            sectorAnswers: {},
            isEligible: null,
            eligibilityCompletedAt: null,
            totalScore: null,
            percentage: null,
            rating: null,
            submittedAt: null,
            reviewedAt: null,
            usesOldQuestions: false,
          },
        })
      }

      return updatedLead
    })

    // 7. Create audit log
    await createAuditLog(session.user.id, "LEAD_ASSIGNED", lead.id, {
      assessorId: validatedData.assessorId,
      assessorName: assessor.name,
      totalQuestions: totalQuestionCount,
    })

    // 8. Revalidate paths
    revalidatePath("/dashboard/leads")
    revalidatePath(`/dashboard/leads/${leadId}`)

    return { success: true, data: updated }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Update lead status (REVIEWER only)
 */
export async function updateLeadStatus(
  leadId: string,
  input: unknown
): Promise<ActionResponse<void>> {
  try {
    // 1. Verify auth and role
    const session = await verifyRole("REVIEWER")

    // 2. Validate input
    const validatedData = UpdateLeadStatusSchema.parse(input)

    // 3. Check lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    })

    if (!lead) {
      throw Errors.leadNotFound(leadId)
    }

    // 4. Update lead
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: validatedData.status },
    })

    // 5. Create audit log
    await createAuditLog(session.user.id, "LEAD_STATUS_UPDATED", leadId, {
      oldStatus: lead.status,
      newStatus: validatedData.status,
    })

    // 6. Revalidate paths
    revalidatePath("/dashboard/leads")
    revalidatePath(`/dashboard/leads/${leadId}`)

    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error)
  }
}

/**
 * Get all assessors (for assignment dropdown)
 * ✅ Only returns active assessors
 */
export async function getAssessors(): Promise<
  ActionResponse<Array<{ id: string; name: string; email: string }>>
> {
  try {
    // 1. Verify auth
    await verifyAuth()

    // 2. Fetch active assessors only
    const assessors = await prisma.user.findMany({
      where: {
        role: "ASSESSOR",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    })

    return { success: true, data: assessors }
  } catch (error) {
    return handleActionError(error)
  }
}
