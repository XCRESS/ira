"use server"

// IRA Platform - Lead Management Server Actions
// Following Next.js 15+ Server Actions pattern

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  AssignAssessorSchema,
  UpdateLeadStatusSchema,
  generateLeadId,
  sortLeadsByStatusPriority,
  type ActionResponse,
  type LeadWithRelations,
} from "@/lib/types"

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verify authentication and return session
 * Used in all actions for Data Access Layer pattern
 */
async function verifyAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error("Unauthorized - Please sign in")
  }

  return session
}

/**
 * Create an audit log entry
 */
async function createAuditLog(
  userId: string,
  action: string,
  leadId?: string,
  details?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      leadId,
      details: details ? JSON.parse(JSON.stringify(details)) : {},
    },
  })
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Create a new lead (REVIEWER only)
 */
export async function createLead(
  input: unknown
): Promise<ActionResponse<LeadWithRelations>> {
  try {
    // 1. Verify auth
    const session = await verifyAuth()

    // 2. Check role
    if (session.user.role !== "REVIEWER") {
      return { success: false, error: "Only reviewers can create leads" }
    }

    // 3. Validate input
    const validatedData = CreateLeadSchema.parse(input)

    // 4. Check if CIN already exists
    const existing = await prisma.lead.findUnique({
      where: { cin: validatedData.cin },
    })

    if (existing) {
      return { success: false, error: "A lead with this CIN already exists" }
    }

    // 5. Generate lead ID
    const leadCount = await prisma.lead.count()
    const leadId = generateLeadId(leadCount)

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
      },
      include: {
        assignedAssessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assessment: {
          select: {
            id: true,
            status: true,
            percentage: true,
            rating: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    })

    // 7. Create audit log
    await createAuditLog(session.user.id, "LEAD_CREATED", lead.id, {
      companyName: lead.companyName,
      cin: lead.cin,
    })

    // 8. Revalidate paths
    revalidatePath("/dashboard/leads")

    return { success: true, data: lead }
  } catch (error) {
    console.error("Create lead error:", error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to create lead" }
  }
}

/**
 * Get all leads with optional filters
 */
export async function getLeads(filters?: {
  assignedTo?: string
  status?: string
}): Promise<ActionResponse<LeadWithRelations[]>> {
  try {
    // 1. Verify auth
    const session = await verifyAuth()

    // 2. Build where clause
    interface WhereClause {
      assignedAssessorId?: string
      status?: string
    }

    const where: WhereClause = {}

    // If assessor, only show assigned leads
    if (session.user.role === "ASSESSOR") {
      where.assignedAssessorId = session.user.id
    }

    // Apply filters
    if (filters?.assignedTo) {
      where.assignedAssessorId = filters.assignedTo
    }
    if (filters?.status) {
      where.status = filters.status
    }

    // 3. Fetch leads
    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedAssessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assessment: {
          select: {
            id: true,
            status: true,
            percentage: true,
            rating: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // 4. Sort by priority for reviewers
    const sortedLeads =
      session.user.role === "REVIEWER" ? sortLeadsByStatusPriority(leads) : leads

    return { success: true, data: sortedLeads }
  } catch (error) {
    console.error("Get leads error:", error)
    return { success: false, error: "Failed to fetch leads" }
  }
}

/**
 * Get single lead by ID with full details
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
      include: {
        assignedAssessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assessment: {
          select: {
            id: true,
            status: true,
            percentage: true,
            rating: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    })

    if (!lead) {
      return { success: false, error: "Lead not found" }
    }

    // 3. Check access (assessors can only view their assigned leads)
    if (session.user.role === "ASSESSOR") {
      if (lead.assignedAssessor?.id !== session.user.id) {
        return { success: false, error: "Access denied" }
      }
    }

    return { success: true, data: lead }
  } catch (error) {
    console.error("Get lead error:", error)
    return { success: false, error: "Failed to fetch lead" }
  }
}

/**
 * Update lead information
 */
export async function updateLead(
  leadId: string,
  input: unknown
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
      return { success: false, error: "Lead not found" }
    }

    // 4. Check access
    if (session.user.role === "ASSESSOR") {
      if (lead.assignedAssessorId !== session.user.id) {
        return { success: false, error: "Access denied" }
      }
    }

    // 5. Update lead
    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: validatedData,
      include: {
        assignedAssessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assessment: {
          select: {
            id: true,
            status: true,
            percentage: true,
            rating: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    })

    // 6. Create audit log
    await createAuditLog(session.user.id, "LEAD_UPDATED", lead.id, validatedData)

    // 7. Revalidate paths
    revalidatePath("/dashboard/leads")
    revalidatePath(`/dashboard/leads/${leadId}`)

    return { success: true, data: updated }
  } catch (error) {
    console.error("Update lead error:", error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to update lead" }
  }
}

/**
 * Assign assessor to lead (REVIEWER only)
 * Creates an empty Assessment record with status DRAFT
 */
export async function assignAssessor(
  leadId: string,
  input: unknown
): Promise<ActionResponse<LeadWithRelations>> {
  try {
    // 1. Verify auth
    const session = await verifyAuth()

    // 2. Check role
    if (session.user.role !== "REVIEWER") {
      return { success: false, error: "Only reviewers can assign assessors" }
    }

    // 3. Validate input
    const validatedData = AssignAssessorSchema.parse(input)

    // 4. Check if assessor exists and has correct role
    const assessor = await prisma.user.findUnique({
      where: { id: validatedData.assessorId },
    })

    if (!assessor) {
      return { success: false, error: "Assessor not found" }
    }

    if (assessor.role !== "ASSESSOR") {
      return { success: false, error: "Selected user is not an assessor" }
    }

    // 5. Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { assessment: true },
    })

    if (!lead) {
      return { success: false, error: "Lead not found" }
    }

    // 6. Update lead and create/update assessment
    const updated = await prisma.$transaction(async (tx) => {
      // Update lead status and assignment
      const updatedLead = await tx.lead.update({
        where: { id: leadId },
        data: {
          assignedAssessorId: validatedData.assessorId,
          status: "ASSIGNED",
        },
        include: {
          assignedAssessor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assessment: {
            select: {
              id: true,
              status: true,
              percentage: true,
              rating: true,
            },
          },
          _count: {
            select: {
              documents: true,
            },
          },
        },
      })

      // Create assessment if it doesn't exist
      if (!lead.assessment) {
        await tx.assessment.create({
          data: {
            leadId,
            assessorId: validatedData.assessorId,
            status: "DRAFT",
          },
        })
      } else {
        // Update existing assessment's assessor
        await tx.assessment.update({
          where: { id: lead.assessment.id },
          data: { assessorId: validatedData.assessorId },
        })
      }

      return updatedLead
    })

    // 7. Create audit log
    await createAuditLog(session.user.id, "LEAD_ASSIGNED", lead.id, {
      assessorId: validatedData.assessorId,
      assessorName: assessor.name,
    })

    // 8. Revalidate paths
    revalidatePath("/dashboard/leads")
    revalidatePath(`/dashboard/leads/${leadId}`)

    return { success: true, data: updated }
  } catch (error) {
    console.error("Assign assessor error:", error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to assign assessor" }
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
    // 1. Verify auth
    const session = await verifyAuth()

    // 2. Check role
    if (session.user.role !== "REVIEWER") {
      return { success: false, error: "Only reviewers can update lead status" }
    }

    // 3. Validate input
    const validatedData = UpdateLeadStatusSchema.parse(input)

    // 4. Update lead
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: validatedData.status },
    })

    // 5. Create audit log
    await createAuditLog(session.user.id, "LEAD_STATUS_UPDATED", leadId, {
      newStatus: validatedData.status,
    })

    // 6. Revalidate paths
    revalidatePath("/dashboard/leads")
    revalidatePath(`/dashboard/leads/${leadId}`)

    return { success: true, data: undefined }
  } catch (error) {
    console.error("Update lead status error:", error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to update lead status" }
  }
}

/**
 * Get all assessors (for assignment dropdown)
 */
export async function getAssessors(): Promise<
  ActionResponse<Array<{ id: string; name: string; email: string }>>
> {
  try {
    // 1. Verify auth
    await verifyAuth()

    // 2. Fetch assessors
    const assessors = await prisma.user.findMany({
      where: { role: "ASSESSOR" },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    })

    return { success: true, data: assessors }
  } catch (error) {
    console.error("Get assessors error:", error)
    return { success: false, error: "Failed to fetch assessors" }
  }
}