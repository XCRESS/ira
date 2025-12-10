'use client'

import { Building2, ChevronDown, ChevronUp, RefreshCw, Calendar, DollarSign, Shield, Globe, FileText, Download, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { fetchProbe42Data } from '@/actions/lead'
import { retryProbe42ReportDownload } from '@/actions/documents'
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
    probe42ReportDownloaded: boolean
    probe42ReportDownloadedAt: Date | null
    probe42ReportFailedAt: Date | null
  }
}

export function Probe42DataCard({ lead }: Probe42DataCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFetchData = async () => {
    setIsLoading(true)
    try {
      const result = await fetchProbe42Data(lead.id)
      if (result.success) {
        toast.success('Company data updated successfully')
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

  const handleDownloadReport = async () => {
    setIsDownloading(true)
    try {
      const result = await retryProbe42ReportDownload({ leadId: lead.id })
      if (result.success) {
        toast.success('Report downloaded successfully!')
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to download report')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsDownloading(false)
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
    return null
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header - Always Visible */}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-lg font-semibold mb-1">Company Details</h2>
              {lead.probe42FetchedAt && (
                <p className="text-xs text-foreground/60">
                  Updated: {formatDate(lead.probe42FetchedAt)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFetchData}
              disabled={isLoading}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="size-5 text-foreground/60" />
              ) : (
                <ChevronDown className="size-5 text-foreground/60" />
              )}
            </button>
          </div>
        </div>

        {/* PDF Report Status */}
        {lead.probe42Fetched && (
          <div className="mt-4 p-3 rounded-lg bg-foreground/5">
            <div className="flex items-center gap-2">
              {lead.probe42ReportDownloaded ? (
                <>
                  <FileText className="size-4 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-500">Report Available</p>
                    {lead.probe42ReportDownloadedAt && (
                      <p className="text-xs text-foreground/60">
                        Downloaded {formatDate(lead.probe42ReportDownloadedAt)}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Download className="size-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Probe42 Report</p>
                    <p className="text-xs text-foreground/60">
                      Click to download the detailed PDF report
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadReport}
                    disabled={isDownloading}
                    className="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                    title="Download Report"
                  >
                    {isDownloading ? (
                      <>
                        <RotateCw className="size-4 animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="size-4" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Summary View - Key Metrics (Always Visible) */}
        <div className="grid gap-3 text-sm mt-4">
          {/* Legal Name */}
          <div className="flex items-center justify-between py-2 border-t border-foreground/10">
            <span className="text-foreground/60">Legal Name</span>
            <span className="font-medium text-right">{lead.probe42LegalName || 'N/A'}</span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-2 border-t border-foreground/10">
            <span className="text-foreground/60">Company Status</span>
            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
              {lead.probe42Status || 'N/A'}
            </span>
          </div>

          {/* PAN */}
          {lead.probe42Pan && (
            <div className="flex items-center justify-between py-2 border-t border-foreground/10">
              <span className="text-foreground/60">PAN</span>
              <span className="font-medium font-mono text-xs">{lead.probe42Pan}</span>
            </div>
          )}

          {/* Website */}
          {lead.probe42Website && (
            <div className="flex items-center justify-between py-2 border-t border-foreground/10">
              <span className="text-foreground/60 flex items-center gap-2">
                <Globe className="size-4" />
                Website
              </span>
              <a
                href={lead.probe42Website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Visit
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-foreground/10 p-4 md:p-6 space-y-6">
          {/* Classification & Incorporation */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Building2 className="size-4" />
              Company Information
            </h3>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Classification</span>
                <span className="font-medium text-right">{lead.probe42Classification || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60 flex items-center gap-2">
                  <Calendar className="size-4" />
                  Incorporation Date
                </span>
                <span className="font-medium">{formatDate(lead.probe42IncorpDate)}</span>
              </div>
            </div>
          </div>

          {/* Capital Structure */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="size-4" />
              Capital Structure
            </h3>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Authorized Capital</span>
                <span className="font-medium">{formatCurrency(lead.probe42AuthCapital)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Paid-up Capital</span>
                <span className="font-medium">{formatCurrency(lead.probe42PaidUpCapital)}</span>
              </div>
            </div>
          </div>

          {/* Compliance */}
          {lead.probe42ComplianceStatus && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Shield className="size-4" />
                Compliance
              </h3>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                  <span className="text-foreground/60">Compliance Status</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs ${lead.probe42ComplianceStatus?.includes('ACTIVE') ? 'text-green-500' : 'text-yellow-500'}`}>
                    <span className={`size-1.5 rounded-full ${lead.probe42ComplianceStatus?.includes('ACTIVE') ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    {lead.probe42ComplianceStatus}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expand Hint */}
      {!isExpanded && (
        <div className="px-4 md:px-6 pb-4">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-xs text-foreground/60 hover:text-foreground flex items-center justify-center gap-1 py-2"
          >
            <ChevronDown className="size-4" />
            View detailed company information
          </button>
        </div>
      )}
    </div>
  )
}
