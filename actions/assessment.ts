"use server"

// IRA Platform - Assessment Server Actions
// ✅ Eligibility check workflow
// ✅ Main assessment (company/financial/sector)
// ✅ Auto-save support
// ✅ Question version tracking
// ✅ Scoring calculation
// ✅ Submit/review workflow

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import {
  verifyAuth,
  verifyRole,
  createAuditLog,
  handlePrismaError,
} from "@/lib/dal"
import {
  UpdateEligibilityAnswersSchema,
  UpdateAllAssessmentAnswersSchema,
  ApproveAssessmentSchema,
  RejectAssessmentSchema,
  type ActionResponse,
  type UpdateEligibilityAnswersInput,
  type UpdateAllAssessmentAnswersInput,
  type ApproveAssessmentInput,
  type RejectAssessmentInput,
  type EligibilityAnswer,
  type AssessmentAnswer,
} from "@/lib/types"
import { Errors, AppError, ErrorCode } from "@/lib/errors"
import { ZodError } from "zod"
import type { Assessment } from "@prisma/client"

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

  console.error("Unexpected error in assessment action:", error)
  return {
    success: false,
    error: "An unexpected error occurred",
    code: ErrorCode.UNKNOWN_ERROR,
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export type AssessmentWithRelations = Assessment & {
  lead: {
    id: string
    leadId: string
    companyName: string
    cin: string
    status: string
  }
  assessor: {
    id: string
    name: string
    email: string
  }
}

type ReviewHistoryEntry = {
  reviewedAt: string
  action: "APPROVED" | "REJECTED"
  comments: string
  reviewerId: string
  reviewerName: string
}

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get assessment by lead ID
 */
export async function getAssessment(
  leadId: string
): Promise<ActionResponse<AssessmentWithRelations | null>> {
  try {
    const session = await verifyAuth()

    const assessment = await prisma.assessment.findUnique({
      where: { leadId },
      include: {
        lead: {
          select: {
            id: true,
            leadId: true,
            companyName: true,
            cin: true,
            status: true,
            assignedAssessorId: true,
          },
        },
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!assessment) {
      return { success: true, data: null }
    }

    // Access control: Assessors can only view their own assessments
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions()
    }

    return { success: true, data: assessment as AssessmentWithRelations }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Get assessment by ID
 */
export async function getAssessmentById(
  assessmentId: string
): Promise<ActionResponse<AssessmentWithRelations>> {
  try {
    const session = await verifyAuth()

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        lead: {
          select: {
            id: true,
            leadId: true,
            companyName: true,
            cin: true,
            status: true,
            assignedAssessorId: true,
          },
        },
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    // Access control
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions()
    }

    return { success: true, data: assessment as AssessmentWithRelations }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// ELIGIBILITY OPERATIONS
// ============================================

/**
 * Update eligibility answers (ASSESSOR only, auto-save)
 * Can only update if assessment is in DRAFT status
 */
export async function updateEligibilityAnswers(
  assessmentId: string,
  input: unknown
): Promise<ActionResponse<Assessment>> {
  try {
    const session = await verifyAuth()

    // Validate input
    const validatedData = UpdateEligibilityAnswersSchema.parse(
      input
    ) as UpdateEligibilityAnswersInput

    // Get assessment
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { lead: true },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    // Access control: Only assigned assessor can update
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions()
    }

    // Check if assessor is still active
    if (session.user.role === "ASSESSOR") {
      const assessor = await prisma.user.findUnique({
        where: { id: assessment.assessorId },
        select: { isActive: true }
      })

      if (!assessor?.isActive) {
        throw Errors.userInactive()
      }
    }

    // Can only update if DRAFT
    if (assessment.status !== "DRAFT") {
      throw Errors.invalidStatusTransition(assessment.status, "DRAFT")
    }

    // Update answers
    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        eligibilityAnswers: validatedData as any,
        updatedAt: new Date(),
      },
    })

    // ✅ PERFORMANCE: Do NOT revalidate on auto-save
    // Only revalidate when completing eligibility (see completeEligibility)
    // This prevents full page rerender on every checkbox click

    return { success: true, data: updated }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Complete eligibility check (ASSESSOR only)
 * Validates all questions are checked = true
 * If eligible: allows proceeding to main assessment
 * If not eligible: closes assessment and marks lead as COMPLETED
 */
export async function completeEligibility(
  assessmentId: string
): Promise<
  ActionResponse<{
    isEligible: boolean
    failedQuestions: string[]
  }>
> {
  try {
    const session = await verifyAuth()

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { lead: true },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    // Access control
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions()
    }

    // Can only complete if DRAFT
    if (assessment.status !== "DRAFT") {
      throw Errors.invalidStatusTransition(assessment.status, "DRAFT")
    }

    // Check all eligibility answers
    const answers = assessment.eligibilityAnswers as Record<
      string,
      EligibilityAnswer
    >
    const failedQuestions = Object.entries(answers)
      .filter(([_, ans]) => !ans.checked)
      .map(([qId]) => qId)

    const isEligible = failedQuestions.length === 0

    // Update assessment
    if (isEligible) {
      // Eligible: Allow proceeding to main assessment
      await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          isEligible: true,
          eligibilityCompletedAt: new Date(),
        },
      })

      await createAuditLog(
        session.user.id,
        "ASSESSMENT_UPDATED",
        assessment.leadId,
        {
          assessmentId,
          action: "eligibility_passed",
        }
      )
    } else {
      // Not eligible: Close assessment
      await prisma.$transaction([
        prisma.assessment.update({
          where: { id: assessmentId },
          data: {
            isEligible: false,
            eligibilityCompletedAt: new Date(),
            status: "DRAFT", // Keep as draft but mark ineligible
          },
        }),
        prisma.lead.update({
          where: { id: assessment.leadId },
          data: {
            status: "COMPLETED", // Mark lead as completed (ineligible)
          },
        }),
      ])

      await createAuditLog(
        session.user.id,
        "ASSESSMENT_UPDATED",
        assessment.leadId,
        {
          assessmentId,
          action: "eligibility_failed",
          failedQuestions,
        }
      )
    }

    revalidatePath(`/dashboard/leads/${assessment.leadId}`)
    revalidatePath("/dashboard/leads")

    return {
      success: true,
      data: { isEligible, failedQuestions },
    }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// MAIN ASSESSMENT OPERATIONS
// ============================================

/**
 * Update all assessment answers in one transaction (ASSESSOR only, auto-save)
 * This prevents race conditions when multiple sections are being edited
 * Only updates sections that are provided
 */
export async function updateAllAssessmentAnswers(
  assessmentId: string,
  input: unknown
): Promise<ActionResponse<Assessment>> {
  try {
    const session = await verifyAuth()

    const validatedData = UpdateAllAssessmentAnswersSchema.parse(
      input
    ) as UpdateAllAssessmentAnswersInput

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { lead: true },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    // Access control
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions()
    }

    // Check if assessor is still active
    if (session.user.role === "ASSESSOR") {
      const assessor = await prisma.user.findUnique({
        where: { id: assessment.assessorId },
        select: { isActive: true }
      })

      if (!assessor?.isActive) {
        throw Errors.userInactive()
      }
    }

    // Can only update if DRAFT
    if (assessment.status !== "DRAFT") {
      throw Errors.invalidStatusTransition(assessment.status, "DRAFT")
    }

    // Must complete eligibility first
    if (!assessment.isEligible) {
      throw Errors.eligibilityNotCompleted()
    }

    // Build update data - only include fields that were provided
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (validatedData.companyAnswers !== undefined) {
      updateData.companyAnswers = validatedData.companyAnswers
    }
    if (validatedData.financialAnswers !== undefined) {
      updateData.financialAnswers = validatedData.financialAnswers
    }
    if (validatedData.sectorAnswers !== undefined) {
      updateData.sectorAnswers = validatedData.sectorAnswers
    }

    // Single atomic update
    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: updateData,
    })

    // ✅ PERFORMANCE: Do NOT revalidate on auto-save
    // Only revalidate when submitting assessment (see submitAssessment)
    // This prevents full page rerender on every answer change

    return { success: true, data: updated }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}


// ============================================
// SCORING & SUBMISSION
// ============================================

/**
 * Calculate assessment score
 */
function calculateScore(
  companyAnswers: Record<string, AssessmentAnswer>,
  financialAnswers: Record<string, AssessmentAnswer>,
  sectorAnswers: Record<string, AssessmentAnswer>
): {
  totalScore: number
  maxPossibleScore: number
  percentage: number
  rating: "IPO_READY" | "NEEDS_IMPROVEMENT" | "NOT_READY"
} {
  const allAnswers = [
    ...Object.values(companyAnswers),
    ...Object.values(financialAnswers),
    ...Object.values(sectorAnswers),
  ]

  const totalScore = allAnswers.reduce((sum, ans) => sum + ans.score, 0)
  const maxPossibleScore = allAnswers.length * 2 // All Yes = 2 each

  const percentage = (totalScore / maxPossibleScore) * 100

  let rating: "IPO_READY" | "NEEDS_IMPROVEMENT" | "NOT_READY"
  if (percentage > 65) rating = "IPO_READY"
  else if (percentage >= 45) rating = "NEEDS_IMPROVEMENT"
  else rating = "NOT_READY"

  return { totalScore, maxPossibleScore, percentage, rating }
}

/**
 * Submit assessment for review (ASSESSOR only)
 * Validates all sections are complete
 * Calculates score automatically
 * Updates lead status to IN_REVIEW
 */
export async function submitAssessment(
  assessmentId: string,
  confirmOldQuestions = false
): Promise<
  ActionResponse<{
    totalScore: number
    percentage: number
    rating: string
  }>
> {
  try {
    const session = await verifyAuth()

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { lead: true },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    // Access control
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions()
    }

    // Can only submit if DRAFT
    if (assessment.status !== "DRAFT") {
      throw Errors.invalidStatusTransition(assessment.status, "DRAFT")
    }

    // Must be eligible
    if (!assessment.isEligible) {
      throw Errors.eligibilityNotCompleted()
    }

    // Validate all sections have answers
    const companyAnswers = assessment.companyAnswers as Record<
      string,
      AssessmentAnswer
    >
    const financialAnswers = assessment.financialAnswers as Record<
      string,
      AssessmentAnswer
    >
    const sectorAnswers = assessment.sectorAnswers as Record<
      string,
      AssessmentAnswer
    >

    // Get snapshot to validate against
    const snapshot = assessment.questionSnapshot as any
    if (!snapshot) {
      throw Errors.databaseError("Assessment snapshot not found")
    }

    const snapshotCompanyCount = snapshot.company?.length || 0
    const snapshotFinancialCount = snapshot.financial?.length || 0
    const snapshotSectorCount = snapshot.sector?.length || 0

    // Validate ALL questions are answered (not just "at least one")
    const companyAnsweredCount = Object.keys(companyAnswers).length
    const financialAnsweredCount = Object.keys(financialAnswers).length
    const sectorAnsweredCount = Object.keys(sectorAnswers).length

    const missingDetails: string[] = []
    if (companyAnsweredCount < snapshotCompanyCount) {
      missingDetails.push(`Company: ${companyAnsweredCount}/${snapshotCompanyCount} answered`)
    }
    if (financialAnsweredCount < snapshotFinancialCount) {
      missingDetails.push(`Financial: ${financialAnsweredCount}/${snapshotFinancialCount} answered`)
    }
    if (sectorAnsweredCount < snapshotSectorCount) {
      missingDetails.push(`Sector: ${sectorAnsweredCount}/${snapshotSectorCount} answered`)
    }

    if (missingDetails.length > 0) {
      throw Errors.incompleteAssessment(missingDetails)
    }

    // Check if using outdated questions (if snapshot exists)
    if (snapshot) {
      // ✅ PERFORMANCE: Use count() instead of groupBy (100-200ms faster)
      // Count current active questions per type
      const [currentCompanyCount, currentFinancialCount, currentSectorCount] =
        await Promise.all([
          prisma.question.count({ where: { type: "COMPANY", isActive: true } }),
          prisma.question.count({ where: { type: "FINANCIAL", isActive: true } }),
          prisma.question.count({ where: { type: "SECTOR", isActive: true } }),
        ])

      const snapshotCompanyCount = snapshot.company?.length || 0
      const snapshotFinancialCount = snapshot.financial?.length || 0
      const snapshotSectorCount = snapshot.sector?.length || 0

      const isOutdated =
        currentCompanyCount !== snapshotCompanyCount ||
        currentFinancialCount !== snapshotFinancialCount ||
        currentSectorCount !== snapshotSectorCount

      // If outdated and not confirmed, require confirmation
      if (isOutdated && !confirmOldQuestions) {
        throw Errors.questionsOutdated()
      }
    }

    // Calculate score
    const { totalScore, percentage, rating } = calculateScore(
      companyAnswers,
      financialAnswers,
      sectorAnswers
    )

    // Update assessment, lead, and create audit log in transaction
    await prisma.$transaction([
      prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          totalScore,
          percentage,
          rating,
          status: "SUBMITTED",
          submittedAt: new Date(),
          usesOldQuestions: assessment.questionSnapshot ? confirmOldQuestions : false,
        },
      }),
      prisma.lead.update({
        where: { id: assessment.leadId },
        data: { status: "IN_REVIEW" },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "ASSESSMENT_SUBMITTED",
          leadId: assessment.leadId,
          details: {
            assessmentId,
            totalScore,
            percentage,
            rating,
          },
        },
      }),
    ])

    revalidatePath(`/dashboard/leads/${assessment.leadId}`)
    revalidatePath("/dashboard/leads")

    return {
      success: true,
      data: { totalScore, percentage, rating },
    }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// REVIEW OPERATIONS (REVIEWER only)
// ============================================

/**
 * Approve assessment (REVIEWER only)
 * Updates lead status to PAYMENT_PENDING
 */
export async function approveAssessment(
  assessmentId: string,
  input: unknown
): Promise<ActionResponse<void>> {
  try {
    const session = await verifyRole("REVIEWER")

    const validatedData = ApproveAssessmentSchema.parse(
      input
    ) as ApproveAssessmentInput

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { lead: true },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    // Can only approve if SUBMITTED
    if (assessment.status !== "SUBMITTED") {
      throw Errors.assessmentNotSubmitted()
    }

    // If using old questions, require confirmation
    if (assessment.usesOldQuestions && !validatedData.confirmOldQuestions) {
      throw Errors.questionsOutdated()
    }

    // Get existing review history (limit to last 49 to keep total at 50 max)
    const reviewHistory = (assessment.reviewHistory as ReviewHistoryEntry[]) || []
    const limitedHistory = reviewHistory.slice(-49)

    // Add new review entry
    const newEntry: ReviewHistoryEntry = {
      reviewedAt: new Date().toISOString(),
      action: "APPROVED",
      comments: validatedData.comments || "",
      reviewerId: session.user.id,
      reviewerName: session.user.name,
    }

    // Update assessment, lead, and create audit log in transaction
    await prisma.$transaction([
      prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewHistory: [...limitedHistory, newEntry] as any,
        },
      }),
      prisma.lead.update({
        where: { id: assessment.leadId },
        data: { status: "PAYMENT_PENDING" },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "ASSESSMENT_APPROVED",
          leadId: assessment.leadId,
          details: {
            assessmentId,
            comments: validatedData.comments,
          },
        },
      }),
    ])

    revalidatePath(`/dashboard/leads/${assessment.leadId}`)
    revalidatePath("/dashboard/leads")

    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Reject assessment (REVIEWER only)
 * Sends back to assessor for revision
 * Updates assessment status to DRAFT and lead status to ASSIGNED
 */
export async function rejectAssessment(
  assessmentId: string,
  input: unknown
): Promise<ActionResponse<void>> {
  try {
    const session = await verifyRole("REVIEWER")

    const validatedData = RejectAssessmentSchema.parse(
      input
    ) as RejectAssessmentInput

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { lead: true },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    if (assessment.status !== "SUBMITTED") {
      throw Errors.assessmentNotSubmitted()
    }

    // Get existing review history (limit to last 49 to keep total at 50 max)
    const reviewHistory = (assessment.reviewHistory as ReviewHistoryEntry[]) || []
    const limitedHistory = reviewHistory.slice(-49)

    // Add rejection entry
    const newEntry: ReviewHistoryEntry = {
      reviewedAt: new Date().toISOString(),
      action: "REJECTED",
      comments: validatedData.comments,
      reviewerId: session.user.id,
      reviewerName: session.user.name,
    }

    // Update assessment, lead, and create audit log in transaction
    await prisma.$transaction([
      prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: "DRAFT", // Back to draft for editing
          reviewedAt: new Date(),
          reviewHistory: [...limitedHistory, newEntry] as any,
          // Clear submission data
          totalScore: null,
          percentage: null,
          rating: null,
          submittedAt: null,
        },
      }),
      prisma.lead.update({
        where: { id: assessment.leadId },
        data: { status: "ASSIGNED" }, // Back to assigned
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "ASSESSMENT_REJECTED",
          leadId: assessment.leadId,
          details: {
            assessmentId,
            comments: validatedData.comments,
          },
        },
      }),
    ])

    revalidatePath(`/dashboard/leads/${assessment.leadId}`)
    revalidatePath("/dashboard/leads")

    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// RESTART ASSESSMENT (when questions updated)
// ============================================

/**
 * Restart assessment with new question set
 * Clears all answers and creates new snapshot
 * Only available for DRAFT assessments
 */
export async function restartAssessmentWithNewQuestions(
  assessmentId: string
): Promise<ActionResponse<Assessment>> {
  try {
    const session = await verifyAuth()

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    // Access control
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions()
    }

    // Can only restart if DRAFT
    if (assessment.status !== "DRAFT") {
      throw Errors.invalidStatusTransition(assessment.status, "DRAFT")
    }

    // Get new question snapshot
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { order: "asc" }],
    })

    const snapshot = {
      eligibility: questions.filter((q) => q.type === "ELIGIBILITY"),
      company: questions.filter((q) => q.type === "COMPANY"),
      financial: questions.filter((q) => q.type === "FINANCIAL"),
      sector: questions.filter((q) => q.type === "SECTOR"),
    }

    const totalCount =
      snapshot.eligibility.length +
      snapshot.company.length +
      snapshot.financial.length +
      snapshot.sector.length

    const version = `${Date.now()}-${totalCount}`

    // Clear all answers and update snapshot
    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        questionSnapshot: snapshot as any,
        questionSnapshotVersion: version,
        eligibilityAnswers: {},
        companyAnswers: {},
        financialAnswers: {},
        sectorAnswers: {},
        isEligible: null,
        eligibilityCompletedAt: null,
        usesOldQuestions: false,
      },
    })

    await createAuditLog(session.user.id, "ASSESSMENT_UPDATED", assessment.leadId, {
      assessmentId,
      action: "restarted_with_new_questions",
    })

    revalidatePath(`/dashboard/leads/${assessment.leadId}`)

    return { success: true, data: updated }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Check if questions have been updated since the given version
 */
export async function checkQuestionVersion(snapshotVersion: string | null) {
  try {
    await verifyAuth()

    if (!snapshotVersion) {
      return { success: true, data: { isOutdated: false } }
    }

    // Parse timestamp from version string (format: "timestamp-count")
    const versionTimestamp = parseInt(snapshotVersion.split("-")[0] || "0", 10)

    // Get current active questions version
    const currentVersion = await prisma.question.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    })

    const currentTimestamp = currentVersion?.updatedAt.getTime() || 0
    const isOutdated = currentTimestamp > versionTimestamp

    return { success: true, data: { isOutdated } }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}
