"use server"

// IRA Platform - Question Management Server Actions
// ✅ REVIEWER-only CRUD operations for question bank
// ✅ Question versioning support for assessments
// ✅ Proper validation and error handling

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import {
  verifyRole,
  createAuditLog,
  handlePrismaError,
} from "@/lib/dal"
import {
  CreateQuestionSchema,
  UpdateQuestionSchema,
  ReorderQuestionsSchema,
  type ActionResponse,
  type CreateQuestionInput,
  type UpdateQuestionInput,
  type ReorderQuestionsInput,
} from "@/lib/types"
import { Errors, AppError, ErrorCode } from "@/lib/errors"
import { ZodError } from "zod"
import type { Question, QuestionType } from "@prisma/client"

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

  console.error("Unexpected error in question action:", error)
  return {
    success: false,
    error: "An unexpected error occurred",
    code: ErrorCode.UNKNOWN_ERROR,
  }
}

// ============================================
// QUESTION TYPE DEFINITIONS
// ============================================

export type QuestionWithMetadata = Question & {
  _count?: {
    assessments: number
  }
}

export type GroupedQuestions = {
  eligibility: Question[]
  company: Question[]
  financial: Question[]
  sector: Question[]
}

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all questions grouped by type
 * Optionally include inactive questions (for admin)
 */
export async function getQuestions(
  includeInactive = false
): Promise<ActionResponse<GroupedQuestions>> {
  try {
    await verifyRole("REVIEWER")

    const questions = await prisma.question.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ type: "asc" }, { order: "asc" }],
    })

    const grouped: GroupedQuestions = {
      eligibility: questions.filter((q) => q.type === "ELIGIBILITY"),
      company: questions.filter((q) => q.type === "COMPANY"),
      financial: questions.filter((q) => q.type === "FINANCIAL"),
      sector: questions.filter((q) => q.type === "SECTOR"),
    }

    return { success: true, data: grouped }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Get questions by type (for assessors)
 * Only returns active questions
 */
export async function getQuestionsByType(
  type: QuestionType
): Promise<ActionResponse<Question[]>> {
  try {
    // Any authenticated user can read questions
    const questions = await prisma.question.findMany({
      where: {
        type,
        isActive: true,
      },
      orderBy: { order: "asc" },
    })

    return { success: true, data: questions }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Get active question count by type
 * Used to check if questions exist before creating assessments
 */
export async function getActiveQuestionCounts(): Promise<
  ActionResponse<Record<QuestionType, number>>
> {
  try {
    const counts = await prisma.question.groupBy({
      by: ["type"],
      where: { isActive: true },
      _count: true,
    })

    const result: Record<QuestionType, number> = {
      ELIGIBILITY: 0,
      COMPANY: 0,
      FINANCIAL: 0,
      SECTOR: 0,
    }

    counts.forEach((c) => {
      result[c.type] = c._count
    })

    return { success: true, data: result }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Get single question by ID
 */
export async function getQuestion(
  questionId: string
): Promise<ActionResponse<Question>> {
  try {
    await verifyRole("REVIEWER")

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      throw Errors.questionNotFound(questionId)
    }

    return { success: true, data: question }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// CREATE OPERATION
// ============================================

/**
 * Add a new question (REVIEWER only)
 * Auto-assigns order if not provided
 */
export async function addQuestion(
  input: unknown
): Promise<ActionResponse<Question>> {
  try {
    const session = await verifyRole("REVIEWER")

    // Validate input
    const validatedData = CreateQuestionSchema.parse(input) as CreateQuestionInput

    // Get next order number if not provided
    let order = validatedData.order
    if (!order) {
      const lastQuestion = await prisma.question.findFirst({
        where: { type: validatedData.type },
        orderBy: { order: "desc" },
      })
      order = (lastQuestion?.order || 0) + 1
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        type: validatedData.type,
        text: validatedData.text,
        helpText: validatedData.helpText || null,
        order,
        isActive: true,
      },
    })

    // Audit log
    await createAuditLog(session.user.id, "ASSESSMENT_CREATED", undefined, {
      questionId: question.id,
      type: question.type,
      text: question.text.substring(0, 100),
    })

    // Revalidate pages that use questions
    revalidatePath("/dashboard/questions")
    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/settings")
    // Revalidate assessment pages (dynamic routes - use layout revalidation)
    revalidatePath("/dashboard/leads/[id]/eligibility", "page")
    revalidatePath("/dashboard/leads/[id]/assessment", "page")

    return { success: true, data: question }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// UPDATE OPERATION
// ============================================

/**
 * Update question (REVIEWER only)
 * Does NOT affect existing assessments (they use snapshots)
 */
export async function updateQuestion(
  questionId: string,
  input: unknown
): Promise<ActionResponse<Question>> {
  try {
    const session = await verifyRole("REVIEWER")

    // Validate input
    const validatedData = UpdateQuestionSchema.parse(input) as UpdateQuestionInput

    // Check question exists
    const existing = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!existing) {
      throw Errors.questionNotFound(questionId)
    }

    // Update question
    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        text: validatedData.text,
        helpText: validatedData.helpText,
        order: validatedData.order,
        isActive: validatedData.isActive,
      },
    })

    // Audit log
    await createAuditLog(session.user.id, "ASSESSMENT_UPDATED", undefined, {
      questionId: question.id,
      changes: validatedData,
      oldText: existing.text.substring(0, 100),
      newText: question.text.substring(0, 100),
    })

    // Revalidate pages that use questions
    revalidatePath("/dashboard/questions")
    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/settings")
    // Revalidate assessment pages (dynamic routes)
    revalidatePath("/dashboard/leads/[id]/eligibility", "page")
    revalidatePath("/dashboard/leads/[id]/assessment", "page")

    return { success: true, data: question }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// DELETE OPERATION
// ============================================

/**
 * Soft delete question (REVIEWER only)
 * Sets isActive = false instead of hard delete
 * Existing assessments retain snapshots
 */
export async function deleteQuestion(
  questionId: string
): Promise<ActionResponse<void>> {
  try {
    const session = await verifyRole("REVIEWER")

    // Check question exists
    const existing = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!existing) {
      throw Errors.questionNotFound(questionId)
    }

    // Soft delete
    await prisma.question.update({
      where: { id: questionId },
      data: { isActive: false },
    })

    // Audit log
    await createAuditLog(session.user.id, "ASSESSMENT_UPDATED", undefined, {
      questionId,
      action: "deleted",
      text: existing.text.substring(0, 100),
    })

    // Revalidate pages that use questions
    revalidatePath("/dashboard/questions")
    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/settings")
    // Revalidate assessment pages (dynamic routes)
    revalidatePath("/dashboard/leads/[id]/eligibility", "page")
    revalidatePath("/dashboard/leads/[id]/assessment", "page")

    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Restore a soft-deleted question (REVIEWER only)
 */
export async function restoreQuestion(
  questionId: string
): Promise<ActionResponse<Question>> {
  try {
    const session = await verifyRole("REVIEWER")

    const question = await prisma.question.update({
      where: { id: questionId },
      data: { isActive: true },
    })

    await createAuditLog(session.user.id, "ASSESSMENT_UPDATED", undefined, {
      questionId,
      action: "restored",
    })

    // Revalidate pages that use questions
    revalidatePath("/dashboard/questions")
    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/settings")
    // Revalidate assessment pages (dynamic routes)
    revalidatePath("/dashboard/leads/[id]/eligibility", "page")
    revalidatePath("/dashboard/leads/[id]/assessment", "page")

    return { success: true, data: question }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// REORDER OPERATION
// ============================================

/**
 * Reorder questions within a type (REVIEWER only)
 * Updates order field based on array position
 */
export async function reorderQuestions(
  input: unknown
): Promise<ActionResponse<void>> {
  try {
    const session = await verifyRole("REVIEWER")

    // Validate input
    const validatedData = ReorderQuestionsSchema.parse(input) as ReorderQuestionsInput

    // Update orders in transaction
    await prisma.$transaction(
      validatedData.questionIds.map((id, index) =>
        prisma.question.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    )

    // Audit log
    await createAuditLog(session.user.id, "ASSESSMENT_UPDATED", undefined, {
      action: "reordered",
      questionCount: validatedData.questionIds.length,
    })

    revalidatePath("/dashboard/questions")

    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// SNAPSHOT OPERATIONS (for assessments)
// ============================================

/**
 * Create question snapshot for assessment
 * Called when assessment is created/assigned
 */
export async function createQuestionSnapshot(): Promise<
  ActionResponse<{
    snapshot: GroupedQuestions
    version: string
  }>
> {
  try {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { order: "asc" }],
    })

    const snapshot: GroupedQuestions = {
      eligibility: questions.filter((q) => q.type === "ELIGIBILITY"),
      company: questions.filter((q) => q.type === "COMPANY"),
      financial: questions.filter((q) => q.type === "FINANCIAL"),
      sector: questions.filter((q) => q.type === "SECTOR"),
    }

    // Check if we have any questions
    const totalCount =
      snapshot.eligibility.length +
      snapshot.company.length +
      snapshot.financial.length +
      snapshot.sector.length

    if (totalCount === 0) {
      throw Errors.noActiveQuestions()
    }

    // Generate version hash (timestamp + count)
    const version = `${Date.now()}-${totalCount}`

    return { success: true, data: { snapshot, version } }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Check if assessment's question snapshot is outdated
 */
export async function checkQuestionVersion(
  snapshotVersion: string | null
): Promise<
  ActionResponse<{
    isOutdated: boolean
    currentVersion: string
  }>
> {
  try {
    if (!snapshotVersion) {
      return {
        success: true,
        data: { isOutdated: true, currentVersion: `${Date.now()}` },
      }
    }

    // Get current active question count
    const currentCount = await prisma.question.count({
      where: { isActive: true },
    })

    const currentVersion = `${Date.now()}-${currentCount}`

    // Extract count from snapshot version
    const snapshotCount = parseInt(snapshotVersion.split("-")[1] || "0")
    const isOutdated = snapshotCount !== currentCount

    return {
      success: true,
      data: { isOutdated, currentVersion },
    }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}
