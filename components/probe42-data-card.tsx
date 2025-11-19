'use client'

import { useState } from 'react'
import { fetchProbe42Data } from '@/actions/lead'
import { toast } from 'sonner'

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
        toast.success('Company data fetched successfully')
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

  return (
    <div className="glass space-y-4 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Probe42 Company Data</h2>
        {!lead.probe42Fetched && (
          <button
            onClick={handleFetchData}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 h-9 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Fetching...' : 'Fetch Data'}
          </button>
        )}
      </div>

      {!lead.probe42Fetched ? (
        <div className="text-center py-8 text-foreground/70">
          <p className="text-sm">No company data fetched yet</p>
          <p className="text-xs mt-1">Click the button above to fetch data from Probe42 API</p>
        </div>
      ) : (
        <>
          {/* Last Updated */}
          {lead.probe42FetchedAt && (
            <div className="text-xs text-foreground/50">
              Last updated: {formatDate(lead.probe42FetchedAt)}
            </div>
          )}

          {/* Key Information */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-foreground/70">Legal Name</p>
              <p className="mt-1 text-sm font-medium">{lead.probe42LegalName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Status</p>
              <p className="mt-1 text-sm font-medium">
                <span className={lead.probe42Status === 'Active' ? 'text-success' : 'text-danger'}>
                  {lead.probe42Status || 'N/A'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Classification</p>
              <p className="mt-1 text-sm">{lead.probe42Classification || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">PAN</p>
              <p className="mt-1 text-sm font-mono">{lead.probe42Pan || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Incorporation Date</p>
              <p className="mt-1 text-sm">{formatDate(lead.probe42IncorpDate)}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/70">Compliance Status</p>
              <p className="mt-1 text-sm">
                <span className={lead.probe42ComplianceStatus?.includes('ACTIVE') ? 'text-success' : 'text-warning'}>
                  {lead.probe42ComplianceStatus || 'N/A'}
                </span>
              </p>
            </div>
          </div>

          {/* Financial Information */}
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-sm font-semibold mb-3">Financial Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-foreground/70">Paid Up Capital</p>
                <p className="mt-1 text-sm font-medium">{formatCurrency(lead.probe42PaidUpCapital)}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Authorized Capital</p>
                <p className="mt-1 text-sm font-medium">{formatCurrency(lead.probe42AuthCapital)}</p>
              </div>
            </div>
          </div>

          {/* Governance & Compliance */}
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-sm font-semibold mb-3">Governance & Compliance</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-foreground/70">Active Directors</p>
                <p className="mt-1 text-lg font-semibold">{lead.probe42DirectorCount ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">GST Registrations</p>
                <p className="mt-1 text-lg font-semibold">{lead.probe42GstCount ?? 'N/A'}</p>
              </div>
              {lead.probe42Website && (
                <div>
                  <p className="text-sm text-foreground/70">Website</p>
                  <a
                    href={lead.probe42Website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-primary hover:underline block truncate"
                  >
                    {lead.probe42Website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="border-t border-border pt-4 mt-4">
            <button
              onClick={handleFetchData}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center rounded-lg border border-border px-4 h-9 text-sm font-medium hover:bg-muted active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}