'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Lead = {
  id: string
  leadId: string
  companyName: string
  contactPerson: string
  status: string
  assignedAssessor?: {
    name: string
  } | null
  assessment?: {
    percentage: number | null
  } | null
  createdAt: Date
}

type Props = {
  lead: Lead
  statusColor: string
  statusLabel: string
}

export function LeadCard({ lead, statusColor, statusLabel }: Props) {
  return (
    <Link
      href={`/dashboard/leads/${lead.id}`}
      className="block glass rounded-xl p-4 active:bg-foreground/5 transition-colors"
    >
      {/* Header: Company + Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{lead.companyName}</h3>
          <p className="text-xs text-foreground/60 truncate">{lead.leadId}</p>
        </div>
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-foreground/50 mb-1">Contact</p>
          <p className="font-medium truncate">{lead.contactPerson}</p>
        </div>
        <div>
          <p className="text-foreground/50 mb-1">Assigned</p>
          <p className="font-medium truncate">
            {lead.assignedAssessor?.name || 'Unassigned'}
          </p>
        </div>
        <div>
          <p className="text-foreground/50 mb-1">Score</p>
          <p className="font-medium">
            {lead.assessment?.percentage
              ? `${lead.assessment.percentage.toFixed(0)}%`
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-foreground/50 mb-1">Created</p>
          <p className="font-medium">
            {new Date(lead.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Chevron indicator */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <ChevronRight className="h-5 w-5 text-foreground/20" />
      </div>
    </Link>
  )
}