"use server"

// IRA Platform - Per-Assessment Question Management
// ✅ Allows assessors to customize questions for each company
// ✅ Questions are editable during DRAFT status
// ✅ Immutable after submission (audit trail)

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { verifyAuth, createAuditLog, handlePrismaError } from "@/lib/dal"
import { Errors, AppError, ErrorCode } from "@/lib/errors"
import { ZodError, z } from "zod"
import type { ActionResponse } from "@/lib/types"
import type { QuestionType } from "@prisma/client"

// ============================================
// TYPE DEFINITIONS
// ============================================

export type AssessmentQuestion = {
  id: string // Unique ID for this assessment's question
  sourceQuestionId: string | null // ID from global question bank (null if custom)
  type: QuestionType
  text: string
  order: number
  helpText: string | null
  isCustom: boolean // true if assessor added it
  isActive: boolean // false if soft-deleted
}

export type QuestionSnapshot = {
  eligibility: AssessmentQuestion[]
  company: AssessmentQuestion[]
  financial: AssessmentQuestion[]
  sector: AssessmentQuestion[]
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const AddAssessmentQuestionSchema = z.object({
  assessmentId: z.string().min(1),
  type: z.enum(["ELIGIBILITY", "COMPANY", "FINANCIAL", "SECTOR"]),
  text: z.string().min(1).max(1000),
  helpText: z.string().max(1000).optional(),
  order: z.number().int().positive().optional(),
})

const UpdateAssessmentQuestionSchema = z.object({
  assessmentId: z.string().min(1),
  questionId: z.string().min(1),
  text: z.string().min(1).max(1000).optional(),
  helpText: z.string().max(1000).nullable().optional(),
  order: z.number().int().positive().optional(),
})

const DeleteAssessmentQuestionSchema = z.object({
  assessmentId: z.string().min(1),
  questionId: z.string().min(1),
})

const ReorderAssessmentQuestionsSchema = z.object({
  assessmentId: z.string().min(1),
  type: z.enum(["ELIGIBILITY", "COMPANY", "FINANCIAL", "SECTOR"]),
  questionIds: z.array(z.string()),
})

// ============================================
// ERROR HANDLER
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

  console.error("Unexpected error in assessment-questions action:", error)
  return {
    success: false,
    error: "An unexpected error occurred",
    code: ErrorCode.UNKNOWN_ERROR,
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verify assessment is editable (DRAFT status only)
 */
async function verifyEditableAssessment(assessmentId: string, userId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { lead: true },
  })

  if (!assessment) {
    throw Errors.assessmentNotFound(assessmentId)
  }

  // Only the assigned assessor can edit
  if (assessment.assessorId !== userId) {
    throw new AppError(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You are not authorized to edit this assessment",
      403,
      { assessmentId, userId }
    )
  }

  // Only DRAFT assessments can be edited
  if (assessment.status !== "DRAFT") {
    throw new AppError(
      ErrorCode.ASSESSMENT_ALREADY_SUBMITTED,
      "Cannot edit questions after assessment is submitted",
      400,
      { assessmentId, status: assessment.status }
    )
  }

  return assessment
}

/**
 * Get questions from snapshot
 * Handles both old format (without isCustom/isActive) and new format
 */
function getSnapshotQuestions(
  assessment: any
): QuestionSnapshot {
  const snapshot = assessment.questionSnapshot as any

  // Handle null or undefined snapshot (new assessment with no questions)
  if (!snapshot) {
    return {
      eligibility: [],
      company: [],
      financial: [],
      sector: [],
    }
  }

  // Helper to normalize old format questions to new format
  const normalizeQuestion = (q: any): AssessmentQuestion => {
    // If already in new format, return as-is
    if ('isCustom' in q && 'isActive' in q && 'sourceQuestionId' in q) {
      return q as AssessmentQuestion
    }

    // Convert old format to new format
    return {
      id: q.id || `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceQuestionId: q.id || null, // Old format used template ID directly
      type: q.type,
      text: q.text,
      order: q.order || 0,
      helpText: q.helpText || null,
      isCustom: false, // Old questions came from templates
      isActive: true,  // Old questions are active by default
    }
  }

  return {
    eligibility: (snapshot?.eligibility || []).map(normalizeQuestion),
    company: (snapshot?.company || []).map(normalizeQuestion),
    financial: (snapshot?.financial || []).map(normalizeQuestion),
    sector: (snapshot?.sector || []).map(normalizeQuestion),
  }
}

/**
 * Update snapshot in database
 */
async function updateSnapshot(
  assessmentId: string,
  snapshot: QuestionSnapshot
) {
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      questionSnapshot: snapshot as any,
      updatedAt: new Date(),
    },
  })
}

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get questions for a specific assessment
 */
export async function getAssessmentQuestions(
  assessmentId: string,
  type?: QuestionType
): Promise<ActionResponse<QuestionSnapshot | AssessmentQuestion[]>> {
  try {
    await verifyAuth()

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    const snapshot = getSnapshotQuestions(assessment)

    // Return specific type if requested
    if (type) {
      const questions = snapshot[type.toLowerCase() as keyof QuestionSnapshot]
      return { success: true, data: questions.filter(q => q.isActive) }
    }

    // Return all questions (filter out inactive)
    const filtered: QuestionSnapshot = {
      eligibility: snapshot.eligibility.filter(q => q.isActive),
      company: snapshot.company.filter(q => q.isActive),
      financial: snapshot.financial.filter(q => q.isActive),
      sector: snapshot.sector.filter(q => q.isActive),
    }

    return { success: true, data: filtered }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// CREATE OPERATION
// ============================================

/**
 * Add a custom question to an assessment
 * Only works on DRAFT assessments
 */
export async function addAssessmentQuestion(
  input: unknown
): Promise<ActionResponse<AssessmentQuestion>> {
  try {
    const session = await verifyAuth()

    // Validate input
    const data = AddAssessmentQuestionSchema.parse(input)

    // Verify assessment is editable
    const assessment = await verifyEditableAssessment(data.assessmentId, session.user.id)

    // Get current snapshot
    const snapshot = getSnapshotQuestions(assessment)
    const typeKey = data.type.toLowerCase() as keyof QuestionSnapshot
    const questions = snapshot[typeKey]

    // Determine order
    const order = data.order || questions.length + 1

    // Create new question
    const newQuestion: AssessmentQuestion = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceQuestionId: null,
      type: data.type,
      text: data.text,
      order,
      helpText: data.helpText || null,
      isCustom: true,
      isActive: true,
    }

    // Add to snapshot
    snapshot[typeKey] = [...questions, newQuestion].sort((a, b) => a.order - b.order)

    // Update database
    await updateSnapshot(data.assessmentId, snapshot)

    // Audit log
    await createAuditLog(session.user.id, "ASSESSMENT_UPDATED", assessment.leadId, {
      action: "question_added",
      assessmentId: data.assessmentId,
      questionId: newQuestion.id,
      type: data.type,
      text: data.text.substring(0, 100),
      isCustom: true,
    })

    revalidatePath(`/dashboard/leads/${assessment.leadId}/eligibility`)
    revalidatePath(`/dashboard/leads/${assessment.leadId}/assessment`)
    revalidatePath(`/dashboard/leads/${assessment.leadId}`)

    return { success: true, data: newQuestion }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// UPDATE OPERATION
// ============================================

/**
 * Update a question in an assessment
 * Only works on DRAFT assessments
 */
export async function updateAssessmentQuestion(
  input: unknown
): Promise<ActionResponse<AssessmentQuestion>> {
  try {
    const session = await verifyAuth()

    // Validate input
    const data = UpdateAssessmentQuestionSchema.parse(input)

    // Verify assessment is editable
    const assessment = await verifyEditableAssessment(data.assessmentId, session.user.id)

    // Get current snapshot
    const snapshot = getSnapshotQuestions(assessment)

    // Find the question across all types
    let found = false
    let updatedQuestion: AssessmentQuestion | null = null

    for (const typeKey of ["eligibility", "company", "financial", "sector"] as const) {
      const questions = snapshot[typeKey]
      const index = questions.findIndex(q => q.id === data.questionId)

      if (index !== -1) {
        found = true
        const oldQuestion = questions[index]

        // Update question
        updatedQuestion = {
          ...oldQuestion,
          text: data.text !== undefined ? data.text : oldQuestion.text,
          helpText: data.helpText !== undefined ? data.helpText : oldQuestion.helpText,
          order: data.order !== undefined ? data.order : oldQuestion.order,
        }

        questions[index] = updatedQuestion

        // Re-sort if order changed
        if (data.order !== undefined) {
          snapshot[typeKey] = questions.sort((a, b) => a.order - b.order)
        }

        break
      }
    }

    if (!found || !updatedQuestion) {
      throw new AppError(
        ErrorCode.QUESTION_NOT_FOUND,
        "Question not found in assessment",
        404,
        { assessmentId: data.assessmentId, questionId: data.questionId }
      )
    }

    // Update database
    await updateSnapshot(data.assessmentId, snapshot)

    // Audit log
    await createAuditLog(session.user.id, "ASSESSMENT_UPDATED", assessment.leadId, {
      action: "question_updated",
      assessmentId: data.assessmentId,
      questionId: data.questionId,
      changes: data,
    })

    revalidatePath(`/dashboard/leads/${assessment.leadId}/eligibility`)
    revalidatePath(`/dashboard/leads/${assessment.leadId}/assessment`)
    revalidatePath(`/dashboard/leads/${assessment.leadId}`)

    return { success: true, data: updatedQuestion }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// DELETE OPERATION
// ============================================

/**
 * Soft delete a question from an assessment
 * Only works on DRAFT assessments
 */
export async function deleteAssessmentQuestion(
  input: unknown
): Promise<ActionResponse<void>> {
  try {
    const session = await verifyAuth()

    // Validate input
    const data = DeleteAssessmentQuestionSchema.parse(input)

    // Verify assessment is editable
    const assessment = await verifyEditableAssessment(data.assessmentId, session.user.id)

    // Get current snapshot
    const snapshot = getSnapshotQuestions(assessment)

    // Find and soft-delete the question
    let found = false

    for (const typeKey of ["eligibility", "company", "financial", "sector"] as const) {
      const questions = snapshot[typeKey]
      const index = questions.findIndex(q => q.id === data.questionId)

      if (index !== -1) {
        found = true
        questions[index].isActive = false
        break
      }
    }

    if (!found) {
      throw new AppError(
        ErrorCode.QUESTION_NOT_FOUND,
        "Question not found in assessment",
        404,
        { assessmentId: data.assessmentId, questionId: data.questionId }
      )
    }

    // Update database
    await updateSnapshot(data.assessmentId, snapshot)

    // Audit log
    await createAuditLog(session.user.id, "ASSESSMENT_UPDATED", assessment.leadId, {
      action: "question_deleted",
      assessmentId: data.assessmentId,
      questionId: data.questionId,
    })

    revalidatePath(`/dashboard/leads/${assessment.leadId}/eligibility`)
    revalidatePath(`/dashboard/leads/${assessment.leadId}/assessment`)
    revalidatePath(`/dashboard/leads/${assessment.leadId}`)

    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================
// REORDER OPERATION
// ============================================

/**
 * Reorder questions within a type
 * Only works on DRAFT assessments
 */
export async function reorderAssessmentQuestions(
  input: unknown
): Promise<ActionResponse<void>> {
  try {
    const session = await verifyAuth()

    // Validate input
    const data = ReorderAssessmentQuestionsSchema.parse(input)

    // Verify assessment is editable
    const assessment = await verifyEditableAssessment(data.assessmentId, session.user.id)

    // Get current snapshot
    const snapshot = getSnapshotQuestions(assessment)
    const typeKey = data.type.toLowerCase() as keyof QuestionSnapshot
    const questions = snapshot[typeKey]

    // Create a map for quick lookup
    const questionMap = new Map(questions.map(q => [q.id, q]))

    // Reorder based on input array
    const reordered: AssessmentQuestion[] = []
    data.questionIds.forEach((id, index) => {
      const question = questionMap.get(id)
      if (question) {
        reordered.push({ ...question, order: index + 1 })
        questionMap.delete(id)
      }
    })

    // Add any remaining questions (not in reorder list)
    questionMap.forEach(question => {
      reordered.push({ ...question, order: reordered.length + 1 })
    })

    snapshot[typeKey] = reordered

    // Update database
    await updateSnapshot(data.assessmentId, snapshot)

    // Audit log
    await createAuditLog(session.user.id, "ASSESSMENT_UPDATED", assessment.leadId, {
      action: "questions_reordered",
      assessmentId: data.assessmentId,
      type: data.type,
      count: data.questionIds.length,
    })

    revalidatePath(`/dashboard/leads/${assessment.leadId}/eligibility`)
    revalidatePath(`/dashboard/leads/${assessment.leadId}/assessment`)
    revalidatePath(`/dashboard/leads/${assessment.leadId}`)

    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}
