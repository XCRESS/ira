'use client'

import { useState } from 'react'
import { fetchProbe42Data } from '@/actions/lead'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

type Probe42DataCardProps = {
  lead: {
    id: string
    leadId: string
    cin: string
    probe42Fetched: boolean
    probe42FetchedAt: Date | null
    probe42LegalName: string | null
    probe42Status: string | null
    probe42Classification: string | null
    probe42PaidUpCapital: bigint | null
    probe42AuthCapital: bigint | null
    probe42Pan: string | null
    probe42Website: string | null
    probe42IncorpDate: Date | null
    probe42ComplianceStatus: string | null
    probe42DirectorCount: number | null
    probe42GstCount: number | null
    probe42Data: unknown
  }
}

export function Probe42DataCard({ lead }: Probe42DataCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleFetchData = async () => {
    setIsLoading(true)
    try {
      const result = await fetchProbe42Data(lead.id)
      if (result.success) {
        toast.success('Company data updated successfully')
        // Refresh the page to show new data
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to fetch company data')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: bigint | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount))
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // If no data fetched yet, show empty state
  if (!lead.probe42Fetched) {
    return (
      <div className="glass space-y-4 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Company Information</h2>
          <button
            onClick={handleFetchData}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 h-9 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Load Company Data'}
          </button>
        </div>
        <div className="text-center py-12 text-foreground/60">
          <p className="text-sm">Company data not available</p>
          <p className="text-xs mt-2">Click &quot;Load Company Data&quot; to fetch details from MCA database</p>
        </div>
      </div>
    )
  }

  // Show data in a clean, organized layout
  return (
    <div className="glass space-y-6 rounded-2xl p-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Company Information</h2>
          {lead.probe42FetchedAt && (
            <p className="text-xs text-foreground/50 mt-0.5">
              Updated {formatDate(lead.probe42FetchedAt)}
            </p>
          )}
        </div>
        <button
          onClick={handleFetchData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 h-9 text-sm font-medium hover:bg-muted active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh company data from MCA"
        >
          <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Company Details Grid */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground/80">Basic Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-foreground/70">Legal Name</p>
              <p className="mt-1 text-sm font-medium">{lead.probe42LegalName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Status</p>
              <p className="mt-1 text-sm font-medium">
                <span className={`inline-flex items-center gap-1.5 ${lead.probe42Status === 'Active' ? 'text-success' : 'text-danger'}`}>
                  <span className={`size-1.5 rounded-full ${lead.probe42Status === 'Active' ? 'bg-success' : 'bg-danger'}`}></span>
                  {lead.probe42Status || 'N/A'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">CIN</p>
              <p className="mt-1 text-sm font-mono">{lead.cin}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">PAN</p>
              <p className="mt-1 text-sm font-mono">{lead.probe42Pan || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Classification</p>
              <p className="mt-1 text-sm">{lead.probe42Classification || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Incorporation Date</p>
              <p className="mt-1 text-sm">{formatDate(lead.probe42IncorpDate)}</p>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold mb-3 text-foreground/80">Capital Structure</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-foreground/70">Paid Up Capital</p>
              <p className="mt-1 text-base font-semibold text-primary">{formatCurrency(lead.probe42PaidUpCapital)}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Authorized Capital</p>
              <p className="mt-1 text-base font-semibold text-primary">{formatCurrency(lead.probe42AuthCapital)}</p>
            </div>
          </div>
        </div>

        {/* Compliance & Governance */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold mb-3 text-foreground/80">Compliance & Governance</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-foreground/70">Compliance Status</p>
              <p className="mt-1 text-sm">
                <span className={`inline-flex items-center gap-1.5 ${lead.probe42ComplianceStatus?.includes('ACTIVE') ? 'text-success' : 'text-warning'}`}>
                  <span className={`size-1.5 rounded-full ${lead.probe42ComplianceStatus?.includes('ACTIVE') ? 'bg-success' : 'bg-warning'}`}></span>
                  {lead.probe42ComplianceStatus || 'N/A'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Active Directors</p>
              <p className="mt-1 text-2xl font-bold">{lead.probe42DirectorCount ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">GST Registrations</p>
              <p className="mt-1 text-2xl font-bold">{lead.probe42GstCount ?? 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Website */}
        {lead.probe42Website && (
          <div className="border-t border-border pt-6">
            <p className="text-sm text-foreground/70 mb-2">Website</p>
            <a
              href={lead.probe42Website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              {lead.probe42Website.replace(/^https?:\/\//, '')}
              <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
