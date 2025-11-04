'use client'

import { Building2, Calendar, DollarSign, FileText, MapPin, Mail, User } from 'lucide-react'
import type { LeadFormData } from '@/actions/probe42'

interface RawCompanyData {
  efiling_status?: string | null
  active_compliance?: string | null
  cirp_status?: string | null
  last_agm_date?: string | null
  last_filing_date?: string | null
  sum_of_charges?: number | null
  lei?: {
    number?: string | null
    status?: string | null
  }
  last_annual_returns_filed_date?: string | null
  last_financial_reporting_date?: string | null
  [key: string]: unknown
}

interface Signatory {
  name: string
  designation: string
  din?: string | null
  pan?: string | null
  date_of_appointment?: string | null
  date_of_cessation?: string | null
  nationality?: string | null
  [key: string]: unknown
}

interface CompanyDetailsPreviewProps {
  data: LeadFormData
  rawData?: RawCompanyData
  signatories?: Signatory[]
}

export function CompanyDetailsPreview({ data, rawData, signatories }: CompanyDetailsPreviewProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-4">
      {/* Company Info Card */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 line-clamp-2">{data.companyName}</h3>
            <p className="text-xs text-foreground/60 font-mono">{data.cin}</p>
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          {/* Classification & Status */}
          <div className="flex items-center justify-between py-2 border-t border-foreground/10">
            <span className="text-foreground/60">Classification</span>
            <span className="font-medium text-right">{data.classification || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-foreground/10">
            <span className="text-foreground/60">Status</span>
            <span className="font-medium">
              {data.status && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                  {data.status}
                </span>
              )}
            </span>
          </div>

          {/* Incorporation Date */}
          {data.incorporationDate && (
            <div className="flex items-center justify-between py-2 border-t border-foreground/10">
              <span className="text-foreground/60 flex items-center gap-2">
                <Calendar className="size-4" />
                Incorporation Date
              </span>
              <span className="font-medium">{formatDate(data.incorporationDate)}</span>
            </div>
          )}

          {/* Capital */}
          {data.authorizedCapital && (
            <div className="flex items-center justify-between py-2 border-t border-foreground/10">
              <span className="text-foreground/60 flex items-center gap-2">
                <DollarSign className="size-4" />
                {data.classification === 'Limited Liability Partnership'
                  ? 'Total Obligation'
                  : 'Authorized Capital'}
              </span>
              <span className="font-medium">{formatCurrency(data.authorizedCapital)}</span>
            </div>
          )}

          {data.paidUpCapital && (
            <div className="flex items-center justify-between py-2 border-t border-foreground/10">
              <span className="text-foreground/60 flex items-center gap-2">
                <DollarSign className="size-4" />
                Paid-up Capital
              </span>
              <span className="font-medium">{formatCurrency(data.paidUpCapital)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Additional Details from Raw Data */}
      {rawData && (
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <FileText className="size-4" />
            Additional Details
          </h4>

          <div className="grid gap-3 text-sm">
            {rawData.efiling_status && (
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">E-filing Status</span>
                <span className="font-medium">{rawData.efiling_status}</span>
              </div>
            )}

            {rawData.active_compliance && (
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Active Compliance</span>
                <span className="font-medium">{rawData.active_compliance}</span>
              </div>
            )}

            {rawData.cirp_status && (
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">CIRP Status</span>
                <span className="font-medium">{rawData.cirp_status}</span>
              </div>
            )}

            {rawData.last_agm_date && (
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Last AGM Date</span>
                <span className="font-medium">{formatDate(rawData.last_agm_date)}</span>
              </div>
            )}

            {rawData.last_filing_date && (
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Last Filing Date</span>
                <span className="font-medium">{formatDate(rawData.last_filing_date)}</span>
              </div>
            )}

            {rawData.sum_of_charges !== null && rawData.sum_of_charges !== undefined && (
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Sum of Charges</span>
                <span className="font-medium">{formatCurrency(rawData.sum_of_charges)}</span>
              </div>
            )}

            {rawData.lei?.number && (
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">LEI Number</span>
                <span className="font-medium font-mono text-xs">{rawData.lei.number}</span>
              </div>
            )}

            {rawData.lei?.status && (
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">LEI Status</span>
                <span className="font-medium">{rawData.lei.status}</span>
              </div>
            )}

            {/* LLP-specific fields */}
            {rawData.last_annual_returns_filed_date && (
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Last Annual Returns</span>
                <span className="font-medium">{formatDate(rawData.last_annual_returns_filed_date)}</span>
              </div>
            )}

            {rawData.last_financial_reporting_date && (
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Last Financial Report</span>
                <span className="font-medium">{formatDate(rawData.last_financial_reporting_date)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="glass rounded-xl p-4">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Mail className="size-4" />
          Contact Information
        </h4>

        <div className="grid gap-3 text-sm">
          {data.contactPerson && (
            <div className="flex items-center justify-between py-2 border-t border-foreground/10">
              <span className="text-foreground/60 flex items-center gap-2">
                <User className="size-4" />
                Contact Person
              </span>
              <span className="font-medium">{data.contactPerson}</span>
            </div>
          )}

          {data.contactEmail && (
            <div className="flex items-center justify-between py-2 border-t border-foreground/10">
              <span className="text-foreground/60 flex items-center gap-2">
                <Mail className="size-4" />
                Email
              </span>
              <span className="font-medium text-xs">{data.contactEmail}</span>
            </div>
          )}

          {data.contactPhone && (
            <div className="flex items-center justify-between py-2 border-t border-foreground/10">
              <span className="text-foreground/60">Phone</span>
              <span className="font-medium font-mono">{data.contactPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      {data.address && (
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <MapPin className="size-4" />
            Registered Address
          </h4>
          <p className="text-sm text-foreground/70 leading-relaxed">{data.address}</p>
        </div>
      )}

      {/* Authorized Signatories / Directors */}
      {signatories && signatories.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <User className="size-4" />
            {data.classification === 'Limited Liability Partnership'
              ? `Directors (${signatories.length})`
              : `Authorized Signatories (${signatories.length})`}
          </h4>

          <div className="space-y-3">
            {signatories.map((signatory, index) => (
              <div key={index} className="py-3 border-t border-foreground/10 first:border-t-0 first:pt-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{signatory.name}</p>
                    <p className="text-xs text-foreground/60">{signatory.designation}</p>
                  </div>
                  {signatory.date_of_cessation && (
                    <span className="px-2 py-1 rounded-md bg-foreground/10 text-xs">
                      Ceased
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  {signatory.din && (
                    <div>
                      <span className="text-foreground/60">DIN: </span>
                      <span className="font-mono">{signatory.din}</span>
                    </div>
                  )}
                  {signatory.pan && (
                    <div>
                      <span className="text-foreground/60">PAN: </span>
                      <span className="font-mono">{signatory.pan}</span>
                    </div>
                  )}
                  {signatory.date_of_appointment && (
                    <div>
                      <span className="text-foreground/60">Appointed: </span>
                      <span>{formatDate(signatory.date_of_appointment)}</span>
                    </div>
                  )}
                  {signatory.nationality && (
                    <div>
                      <span className="text-foreground/60">Nationality: </span>
                      <span>{signatory.nationality}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
