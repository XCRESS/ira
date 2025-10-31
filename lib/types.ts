// IRA Platform - Shared TypeScript Types

import { z } from "zod"

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const CreateLeadSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(200),
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters").max(100),
  phone: z.string().regex(/^\+91-[0-9]{10}$/, "Phone must be in format: +91-XXXXXXXXXX"),
  email: z.string().email("Invalid email address"),
  cin: z.string().regex(
    /^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
    "Invalid CIN format (e.g., U12345MH2020PTC123456)"
  ),
  address: z.string().min(10, "Address must be at least 10 characters").max(500),
})

export const UpdateLeadSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  contactPerson: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+91-[0-9]{10}$/).optional(),
  email: z.string().email().optional(),
  address: z.string().min(10).max(500).optional(),
})

export const AssignAssessorSchema = z.object({
  assessorId: z.string().min(1, "Assessor ID is required"),
})

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(["NEW", "ASSIGNED", "IN_REVIEW", "PAYMENT_PENDING", "COMPLETED"]),
})

// ============================================
// TYPE EXPORTS (from Zod schemas)
// ============================================

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>
export type AssignAssessorInput = z.infer<typeof AssignAssessorSchema>
export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>

// ============================================
// SERVER ACTION RETURN TYPES
// ============================================

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// Lead with relations
export type LeadWithRelations = {
  id: string
  leadId: string
  companyName: string
  contactPerson: string
  phone: string
  email: string
  cin: string
  address: string
  status: "NEW" | "ASSIGNED" | "IN_REVIEW" | "PAYMENT_PENDING" | "COMPLETED"
  assignedAssessor: {
    id: string
    name: string
    email: string
  } | null
  createdBy: {
    id: string
    name: string
    email: string
  }
  assessment: {
    id: string
    status: string
    percentage: number | null
    rating: string | null
  } | null
  _count: {
    documents: number
  }
  createdAt: Date
  updatedAt: Date
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a display Lead ID in format: LD-YYYY-XXX
 * @param count - The current count of leads (used to generate sequential ID)
 * @returns A unique lead ID string
 */
export function generateLeadId(count: number): string {
  const year = new Date().getFullYear()
  const sequence = String(count + 1).padStart(3, "0")
  return `LD-${year}-${sequence}`
}

/**
 * Get display status with color
 */
export function getStatusDisplay(status: string): { label: string; color: string } {
  const statusMap: Record<string, { label: string; color: string }> = {
    NEW: { label: "New", color: "bg-blue-500/10 text-blue-500" },
    ASSIGNED: { label: "Assigned", color: "bg-purple-500/10 text-purple-500" },
    IN_REVIEW: { label: "In Review", color: "bg-yellow-500/10 text-yellow-500" },
    PAYMENT_PENDING: { label: "Payment Pending", color: "bg-orange-500/10 text-orange-500" },
    COMPLETED: { label: "Completed", color: "bg-green-500/10 text-green-500" },
  }
  return statusMap[status] || { label: status, color: "bg-gray-500/10 text-gray-500" }
}

/**
 * Sort leads by status priority (for reviewer dashboard)
 * Priority: NEW > IN_REVIEW > PAYMENT_PENDING > ASSIGNED > COMPLETED
 */
export function sortLeadsByStatusPriority(leads: LeadWithRelations[]): LeadWithRelations[] {
  const priorityMap: Record<string, number> = {
    NEW: 1,
    IN_REVIEW: 2,
    PAYMENT_PENDING: 3,
    ASSIGNED: 4,
    COMPLETED: 5,
  }

  return [...leads].sort((a, b) => {
    const priorityA = priorityMap[a.status] || 999
    const priorityB = priorityMap[b.status] || 999
    if (priorityA !== priorityB) return priorityA - priorityB
    // If same priority, sort by most recent first
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}