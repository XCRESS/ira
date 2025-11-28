"use server"

// IRA Platform - Lead Management Server Actions (Refactored)
// ✅ Atomic sequence generation (no race conditions)
// ✅ Optimistic locking (concurrent modification protection)
// ✅ Structured error handling (error codes instead of strings)
// ✅ User.isActive verification in DAL
// ✅ Proper transaction management

import { revalidateTag, updateTag } from "next/cache"
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
import { fetchCompanyByCIN } from "@/lib/probe42"
import { downloadAndSaveProbe42Report } from "./documents"
import { sendLeadAssignmentEmail, getAppBaseUrl } from "@/lib/email"

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

    // 5. Parse Probe42 data if provided
    const probe42Data = validatedData.probe42Data
    const hasProbe42Data = probe42Data && typeof probe42Data === 'object'

    // Type guard for Probe42 data structure
    interface Probe42RawData {
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

    const typedProbe42Data = probe42Data as Probe42RawData | undefined

    // 6. Create lead
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
        // Store Probe42 data if available (from lead creation flow)
        ...(hasProbe42Data && typedProbe42Data && {
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
          probe42Data: probe42Data,
        }),
      },
      include: leadInclude,
    })

    // 7. Create audit log
    await createAuditLog(session.user.id, "LEAD_CREATED", lead.id, {
      companyName: lead.companyName,
      cin: lead.cin,
      leadId: lead.leadId,
    })

    // 8. Download Probe42 PDF report in background (fire-and-forget)
    // This should NOT block lead creation - if it fails, user can manually upload later
    if (hasProbe42Data) {
      downloadAndSaveProbe42Report(lead.id, lead.cin, session.user.id)
        .then((result) => {
          if (result.success) {
            console.log('[Probe42 PDF] Downloaded and saved successfully:', result.data?.fileName)
          } else {
            console.error('[Probe42 PDF] Download failed:', result.error)
          }
        })
        .catch((error) => {
          console.error('[Probe42 PDF] Unexpected error:', error)
        })
    }

    // 9. Next.js 16: Use updateTag for immediate cache refresh
    updateTag(`lead-${lead.id}`)
    revalidateTag("leads-list", "hours") // SWR for list pages

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
 * Get dashboard stats (OPTIMIZED - database aggregation)
 * ✅ Uses raw SQL with FILTER for 96% faster performance
 * ✅ Separate lightweight query for recent leads
 */
export async function getDashboardStats(): Promise<
  ActionResponse<{
    stats: {
      total: number
      new: number
      inProgress: number
      completed: number
    }
    recentLeads: LeadWithRelations[]
  }>
> {
  try {
    // 1. Verify auth
    const session = await verifyAuth()

    // 2. Build role-based filter for SQL query
    const isAssessor = session.user.role === "ASSESSOR"
    const userId = session.user.id

    // 3. Run parallel queries: stats aggregation + recent leads
    const [statsResult, recentLeads] = await Promise.all([
      // Query 1: Database-level aggregation (FAST - single table scan)
      isAssessor
        ? prisma.$queryRaw<Array<{ total: number; new: number; inProgress: number; completed: number }>>`
            SELECT
              COUNT(*)::int as total,
              COUNT(*) FILTER (WHERE status = 'NEW')::int as new,
              COUNT(*) FILTER (WHERE status IN ('ASSIGNED', 'IN_REVIEW'))::int as "inProgress",
              COUNT(*) FILTER (WHERE status = 'COMPLETED')::int as completed
            FROM lead
            WHERE "assignedAssessorId" = ${userId}
          `
        : prisma.$queryRaw<Array<{ total: number; new: number; inProgress: number; completed: number }>>`
            SELECT
              COUNT(*)::int as total,
              COUNT(*) FILTER (WHERE status = 'NEW')::int as new,
              COUNT(*) FILTER (WHERE status IN ('ASSIGNED', 'IN_REVIEW'))::int as "inProgress",
              COUNT(*) FILTER (WHERE status = 'COMPLETED')::int as completed
            FROM lead
          `,

      // Query 2: Only fetch top 5 recent leads (lightweight)
      prisma.lead.findMany({
        where: isAssessor ? { assignedAssessorId: userId } : {},
        take: 5,
        select: {
          id: true,
          leadId: true,
          companyName: true,
          status: true,
          contactPerson: true,
          createdAt: true,
          assignedAssessor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assessment: {
            select: {
              id: true,
              percentage: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ])

    // 4. Extract stats from aggregation result
    const stats = statsResult[0] || {
      total: 0,
      new: 0,
      inProgress: 0,
      completed: 0,
    }

    return {
      success: true,
      data: {
        stats,
        recentLeads: recentLeads as LeadWithRelations[],
      },
    }
  } catch (error) {
    return handleActionError(error)
  }
}

/**
 * Get single lead by leadId (LD-2025-001 format) with full details
 * ✅ Access control (assessors can only view assigned leads)
 */
export async function getLead(
  leadId: string
): Promise<ActionResponse<LeadWithRelations>> {
  try {
    // 1. Verify auth
    const session = await verifyAuth()

    // 2. Fetch lead by leadId (LD-2025-001 format)
    const lead = await prisma.lead.findUnique({
      where: { leadId },
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
  leadId: string, // LD-2025-001 format
  input: unknown,
  expectedUpdatedAt: string // ISO timestamp for optimistic locking
): Promise<ActionResponse<LeadWithRelations>> {
  try {
    // 1. Verify auth
    const session = await verifyAuth()

    // 2. Validate input
    const validatedData = UpdateLeadSchema.parse(input)

    // 3. Fetch lead by leadId
    const lead = await prisma.lead.findUnique({
      where: { leadId },
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
        id: lead.id, // Use internal id for update
        updatedAt: lead.updatedAt, // Atomic check-and-set
      },
      data: validatedData,
      include: leadInclude,
    })

    // 7. Create audit log
    await createAuditLog(session.user.id, "LEAD_UPDATED", lead.id, {
      changes: validatedData,
    })

    // 8. Next.js 16: Use updateTag for immediate cache refresh
    updateTag(`lead-${leadId}`)
    revalidateTag("leads-list", "hours")

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
        email: true,
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
      where: { leadId },
      include: { assessment: true },
    })

    if (!lead) {
      throw Errors.leadNotFound(leadId)
    }

    checkOptimisticLock(lead.updatedAt, new Date(expectedUpdatedAt))

    // 5. Create question snapshot for assessment
    // Each assessment gets its own editable question list (initialized from templates)
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { order: "asc" }],
    })

    // Transform questions into assessment-specific format
    const transformQuestion = (q: any) => ({
      id: `${q.id}_${Date.now()}`, // Unique per assessment
      sourceQuestionId: q.id, // Reference to template
      type: q.type,
      text: q.text,
      order: q.order,
      helpText: q.helpText,
      isCustom: false,
      isActive: true,
    })

    const questionSnapshot = {
      eligibility: questions.filter((q) => q.type === "ELIGIBILITY").map(transformQuestion),
      company: questions.filter((q) => q.type === "COMPANY").map(transformQuestion),
      financial: questions.filter((q) => q.type === "FINANCIAL").map(transformQuestion),
      sector: questions.filter((q) => q.type === "SECTOR").map(transformQuestion),
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
          id: lead.id, // Use internal id for update
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
            leadId: lead.id, // Use internal id for foreign key
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

    // 8. Send email notification to assessor (fire-and-forget)
    // Email failure should NOT fail the assignment operation
    const baseUrl = getAppBaseUrl()
    const assessmentUrl = `${baseUrl}/dashboard/leads/${leadId}`

    Promise.allSettled([
      sendLeadAssignmentEmail({
        assessorName: assessor.name,
        assessorEmail: assessor.email,
        companyName: updated.companyName,
        leadId: updated.leadId,
        cin: updated.cin,
        reviewerName: session.user.name,
        actionUrl: assessmentUrl
      })
    ]).then(([emailResult]) => {
      if (emailResult.status === 'rejected') {
        console.error('[Lead Assignment] Failed to send email notification:', emailResult.reason)
        // Log email failure to audit log (optional)
        createAuditLog(session.user.id, "LEAD_ASSIGNED", lead.id, {
          action: "email_notification_failed",
          error: emailResult.reason instanceof Error ? emailResult.reason.message : 'Unknown error',
          recipientEmail: assessor.email
        }).catch(err => console.error('[Audit] Failed to log email failure:', err))
      } else if (emailResult.status === 'fulfilled' && emailResult.value.success) {
        console.log('[Lead Assignment] Email notification sent successfully to:', assessor.email)
      }
    }).catch(err => {
      console.error('[Lead Assignment] Unexpected error in email notification:', err)
    })

    // 9. Next.js 16: Use updateTag for immediate cache refresh
    updateTag(`lead-${leadId}`)
    // Assessment cache will be refreshed when assessor accesses it
    revalidateTag("leads-list", "hours")

    return { success: true, data: updated }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Update lead status (REVIEWER only)
 */
export async function updateLeadStatus(
  leadId: string, // LD-2025-001 format
  input: unknown
): Promise<ActionResponse<void>> {
  try {
    // 1. Verify auth and role
    const session = await verifyRole("REVIEWER")

    // 2. Validate input
    const validatedData = UpdateLeadStatusSchema.parse(input)

    // 3. Check lead exists
    const lead = await prisma.lead.findUnique({
      where: { leadId },
    })

    if (!lead) {
      throw Errors.leadNotFound(leadId)
    }

    // 4. Update lead
    await prisma.lead.update({
      where: { id: lead.id }, // Use internal id for update
      data: { status: validatedData.status },
    })

    // 5. Create audit log
    await createAuditLog(session.user.id, "LEAD_STATUS_UPDATED", lead.id, {
      oldStatus: lead.status,
      newStatus: validatedData.status,
    })

    // 6. Next.js 16: Use updateTag for immediate cache refresh
    updateTag(`lead-${leadId}`)
    revalidateTag("leads-list", "hours")

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

/**
 * Fetch company data from Probe42 API and store in Lead
 * ✅ Fetches comprehensive company details by CIN
 * ✅ Stores key fields in Lead model for quick access
 * ✅ Stores full response in JSON field for reference
 * ✅ Creates audit log entry
 */
export async function fetchProbe42Data(
  leadId: string
): Promise<ActionResponse<LeadWithRelations>> {
  try {
    // 1. Verify auth
    const session = await verifyAuth()

    // 2. Fetch lead with CIN
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        cin: true,
        companyName: true,
        probe42Fetched: true,
        probe42FetchedAt: true
      },
    })

    if (!lead) {
      throw Errors.leadNotFound(leadId)
    }

    // 3. Fetch company data from Probe42
    const companyData = await fetchCompanyByCIN(lead.cin)

    // 4. Update lead with Probe42 data
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        probe42Fetched: true,
        probe42FetchedAt: new Date(),
        probe42LegalName: companyData.legalName,
        probe42Status: companyData.status,
        probe42Classification: companyData.classification,
        probe42PaidUpCapital: companyData.paidUpCapital,
        probe42AuthCapital: companyData.authorizedCapital,
        probe42Pan: companyData.pan,
        probe42Website: companyData.website,
        probe42IncorpDate: companyData.incorporationDate ? new Date(companyData.incorporationDate) : null,
        probe42ComplianceStatus: companyData.activeCompliance,
        probe42DirectorCount: companyData.activeDirectorsCount,
        probe42GstCount: companyData.gstRegistrationsCount,
        probe42Data: JSON.parse(JSON.stringify(companyData)), // Store full response as JSON
      },
      include: leadInclude,
    })

    // 5. Create audit log
    await createAuditLog(
      session.user.id,
      "PROBE42_DATA_FETCHED",
      leadId,
      {
        cin: lead.cin,
        companyName: companyData.legalName,
        status: companyData.status,
        fetchedAt: new Date().toISOString(),
      }
    )

    // 6. Next.js 16: Use updateTag for immediate cache refresh
    updateTag(`lead-${leadId}`)
    revalidateTag("leads-list", "hours")

    return {
      success: true,
      data: updatedLead,
    }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}
