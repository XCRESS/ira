'use server'

import { verifyAuth, createAuditLog, handlePrismaError } from '@/lib/dal'
import { uploadToBlob, deleteFromBlob, uploadBase64ToBlob } from '@/lib/storage'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z, ZodError } from 'zod'
import type { ActionResponse } from '@/lib/types'
import type { Document, DocumentType } from '@prisma/client'
import { Errors, AppError, ErrorCode } from '@/lib/errors'
import { downloadProbe42Report } from '@/lib/probe42'

// ============================================
// Error Handler
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
      error: error.issues[0]?.message || 'Invalid input',
      code: ErrorCode.INVALID_INPUT,
    }
  }

  if (error instanceof Error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error.message,
      code: ErrorCode.UNKNOWN_ERROR,
    }
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
    code: ErrorCode.UNKNOWN_ERROR,
  }
}

// ============================================
// Validation Schemas
// ============================================

const UploadDocumentSchema = z.object({
  leadId: z.string().cuid(),
})

const DeleteDocumentSchema = z.object({
  documentId: z.string().cuid(),
})

// ============================================
// Actions
// ============================================

/**
 * Upload document to a lead
 */
export async function uploadDocument(
  input: unknown,
  file: File
): Promise<ActionResponse<Document>> {
  try {
    const session = await verifyAuth()
    const { leadId } = UploadDocumentSchema.parse(input)

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ]
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only PDF, JPG, JPEG, PNG allowed.',
        code: ErrorCode.INVALID_INPUT,
      }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File too large. Maximum size is 10MB.',
        code: ErrorCode.INVALID_INPUT,
      }
    }

    // Verify lead exists and user has access
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        leadId: true,
        assignedAssessorId: true,
      },
    })

    if (!lead) {
      throw Errors.leadNotFound()
    }

    // Access control: Assessors can only upload to assigned leads
    if (
      session.user.role === 'ASSESSOR' &&
      lead.assignedAssessorId !== session.user.id
    ) {
      throw Errors.unauthorized()
    }

    // Upload to Vercel Blob
    const uploaded = await uploadToBlob(file, leadId)

    // Determine file type from MIME type
    const fileType: DocumentType = file.type === 'application/pdf'
      ? 'PDF'
      : file.type === 'image/png'
        ? 'PNG'
        : file.type === 'image/jpg'
          ? 'JPG'
          : 'JPEG'

    // Save to database
    const document = await prisma.document.create({
      data: {
        leadId,
        fileName: file.name,
        fileUrl: uploaded.url,
        fileType,
        fileSize: uploaded.size,
        uploadedById: session.user.id,
      },
      include: {
        uploadedBy: {
          select: { name: true, email: true },
        },
      },
    })

    // Audit log
    await createAuditLog(session.user.id, 'DOCUMENT_UPLOADED', leadId, {
      documentId: document.id,
      fileName: file.name,
      fileSize: uploaded.size,
    })

    revalidatePath(`/dashboard/leads/${lead.leadId}`)

    return { success: true, data: document }
  } catch (error) {
    console.error('Upload error:', error)
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Get documents for a lead
 */
export async function getDocuments(
  leadId: string
): Promise<
  ActionResponse<
    Array<Document & { uploadedBy: { name: string; email: string } }>
  >
> {
  try {
    await verifyAuth()

    const documents = await prisma.document.findMany({
      where: { leadId },
      include: {
        uploadedBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    })

    return { success: true, data: documents }
  } catch (error) {
    console.error('Get documents error:', error)
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Delete document
 */
export async function deleteDocument(
  input: unknown
): Promise<ActionResponse<void>> {
  try {
    const session = await verifyAuth()
    const { documentId } = DeleteDocumentSchema.parse(input)

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { lead: true },
    })

    if (!document) {
      throw Errors.documentNotFound()
    }

    // Access control: Only uploader or reviewer can delete
    if (
      session.user.role !== 'REVIEWER' &&
      document.uploadedById !== session.user.id
    ) {
      throw Errors.unauthorized()
    }

    // Delete from Vercel Blob
    await deleteFromBlob(document.fileUrl)

    // Delete from database
    await prisma.document.delete({ where: { id: documentId } })

    // Audit log
    await createAuditLog(session.user.id, 'DOCUMENT_DELETED', document.leadId, {
      documentId,
      fileName: document.fileName,
    })

    revalidatePath(`/dashboard/leads/${document.lead.leadId}`)

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Delete error:', error)
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Download Probe42 report and save as document
 * This runs in background and should NOT block lead creation
 */
export async function downloadAndSaveProbe42Report(
  leadId: string,
  cin: string,
  userId: string
): Promise<ActionResponse<Document>> {
  try {
    // NOTE: We don't verify auth here because this is called from server-side
    // lead creation flow which already verified auth

    // 1. Fetch lead to get leadId (display ID)
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { leadId: true, companyName: true },
    })

    if (!lead) {
      throw Errors.leadNotFound(leadId)
    }

    // 2. Download PDF from Probe42 (returns base64)
    const base64Pdf = await downloadProbe42Report(cin)

    // 3. Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const fileName = `Probe42_Report_${cin}_${timestamp}.pdf`

    // 4. Upload to blob storage
    const { url, size } = await uploadBase64ToBlob(
      base64Pdf,
      fileName,
      lead.leadId
    )

    // 5. Create document record and update lead status
    const document = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          leadId,
          fileName,
          fileUrl: url,
          fileSize: size,
          fileType: 'PDF',
          uploadedById: userId,
        },
      })

      // Update lead to mark report as downloaded
      await tx.lead.update({
        where: { id: leadId },
        data: {
          probe42ReportDownloaded: true,
          probe42ReportDownloadedAt: new Date(),
          probe42ReportFailedAt: null, // Clear any previous failure
        },
      })

      return doc
    })

    // 6. Audit log
    await createAuditLog(userId, 'DOCUMENT_UPLOADED', leadId, {
      documentId: document.id,
      fileName,
      source: 'probe42_auto_download',
    })

    // Note: No revalidatePath here as this runs in background during page render
    // The document will be visible on next page load/navigation

    return { success: true, data: document }
  } catch (error) {
    // Log error but don't throw - this is a background operation
    console.error('[Probe42 PDF Download] Failed:', error)

    // Mark download as failed in database
    try {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          probe42ReportDownloaded: false,
          probe42ReportFailedAt: new Date(),
        },
      })
    } catch (updateError) {
      console.error('[Probe42 PDF Download] Failed to update lead status:', updateError)
    }

    return handleActionError(error)
  }
}