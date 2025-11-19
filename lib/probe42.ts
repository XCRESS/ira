/**
 * Probe42 API Client
 *
 * Handles communication with Probe42 Company Data API
 * Documentation: https://api.probe42.in/probe_pro_sandbox/
 */

import { AppError, ErrorCode } from "./errors"

const PROBE42_API_BASE = process.env.PROBE42_BASE_URL || 'https://api.probe42.in/probe_pro_sandbox'
const PROBE42_API_KEY = process.env.PROBE42_API_KEY
const PROBE42_API_VERSION = '1.3'

// ============================================================================
// Types - Based on actual API response
// ============================================================================

export interface Probe42CompanyData {
  metadata: {
    api_version: string
    last_updated: string
    identifier_changed: boolean
  }
  data: {
    company: {
      cin: string
      legal_name: string
      efiling_status: string
      incorporation_date: string
      paid_up_capital: number
      authorized_capital: number
      active_compliance: string
      pan: string
      email: string | null
      website: string | null
      classification: string
      status: string
      last_agm_date: string | null
      last_filing_date: string | null
      registered_address: {
        full_address: string
        city: string
        state: string
        pincode: string
      }
    }
    description: {
      desc_thousand_char: string
    }
    authorized_signatories: Array<{
      name: string
      pan: string | null
      din: string | null
      designation: string
      date_of_appointment: string | null
      date_of_cessation: string | null
      nationality: string | null
    }>
    financials: Array<{
      year_ending: string
      total_revenue: number
      net_profit: number
      total_assets: number
      total_liabilities: number
    }>
    key_indicators: Record<string, unknown>
    gst_details: Array<{
      gstin: string
      state: string
      status: string
    }>
  }
}

// ============================================================================
// API Client
// ============================================================================

class Probe42Client {
  private apiKey: string
  private baseUrl: string
  private apiVersion: string

  constructor(apiKey?: string) {
    if (!apiKey && !PROBE42_API_KEY) {
      throw new AppError(
        ErrorCode.CONFIGURATION_ERROR,
        'Probe42 API key not configured',
        500,
        { service: 'probe42' }
      )
    }

    this.apiKey = apiKey || PROBE42_API_KEY!
    this.baseUrl = PROBE42_API_BASE
    this.apiVersion = PROBE42_API_VERSION
  }

  /**
   * Fetch comprehensive company details by CIN
   */
  async getCompanyDetails(cin: string): Promise<Probe42CompanyData> {
    if (!cin || cin.trim().length === 0) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        'CIN is required',
        400,
        { field: 'cin' }
      )
    }

    const url = `${this.baseUrl}/companies/${cin}/comprehensive-details`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          'Accept': 'application/json',
          'x-api-version': this.apiVersion,
        },
        cache: 'no-store', // Don't cache company data
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new AppError(
            ErrorCode.UNAUTHORIZED,
            'Invalid Probe42 API key',
            401,
            { status: response.status }
          )
        }

        if (response.status === 404) {
          throw new AppError(
            ErrorCode.NOT_FOUND,
            `Company with CIN ${cin} not found in Probe42`,
            404,
            { cin, status: response.status }
          )
        }

        if (response.status === 429) {
          throw new AppError(
            ErrorCode.RATE_LIMIT_EXCEEDED,
            'Probe42 API rate limit exceeded',
            429,
            { status: response.status }
          )
        }

        throw new AppError(
          ErrorCode.EXTERNAL_API_ERROR,
          `Probe42 API error: ${response.statusText}`,
          502,
          { status: response.status, cin }
        )
      }

      const data = await response.json()
      return data as Probe42CompanyData

    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      // Network or parsing errors
      throw new AppError(
        ErrorCode.EXTERNAL_API_ERROR,
        'Failed to fetch company data from Probe42',
        502,
        {
          originalError: error instanceof Error ? error.message : String(error),
          cin
        }
      )
    }
  }

  /**
   * Extract key company information for IRA platform
   */
  extractKeyInfo(data: Probe42CompanyData) {
    const { company, description, authorized_signatories, financials, gst_details } = data.data

    // Get active directors
    const activeDirectors = authorized_signatories
      ?.filter(s => !s.date_of_cessation && s.designation?.toLowerCase().includes('director'))
      .map(s => ({
        name: s.name,
        designation: s.designation,
        din: s.din,
        dateOfAppointment: s.date_of_appointment,
      })) || []

    // Get latest financials
    const latestFinancials = financials && financials.length > 0
      ? {
          yearEnding: financials[0].year_ending,
          totalRevenue: financials[0].total_revenue,
          netProfit: financials[0].net_profit,
          totalAssets: financials[0].total_assets,
          totalLiabilities: financials[0].total_liabilities,
        }
      : null

    return {
      // Basic Info
      cin: company.cin,
      legalName: company.legal_name,
      status: company.efiling_status,
      incorporationDate: company.incorporation_date,
      classification: company.classification,

      // Financial Info
      paidUpCapital: company.paid_up_capital,
      authorizedCapital: company.authorized_capital,

      // Compliance
      activeCompliance: company.active_compliance,
      lastAgmDate: company.last_agm_date,
      lastFilingDate: company.last_filing_date,

      // Contact Info
      pan: company.pan,
      email: company.email,
      website: company.website,

      // Address
      registeredAddress: company.registered_address.full_address,
      city: company.registered_address.city,
      state: company.registered_address.state,
      pincode: company.registered_address.pincode,

      // Description
      businessDescription: description?.desc_thousand_char,

      // Directors
      activeDirectorsCount: activeDirectors.length,
      activeDirectors: activeDirectors.slice(0, 5), // Top 5 directors

      // Financials
      latestFinancials,

      // GST
      gstRegistrationsCount: gst_details?.length || 0,

      // Metadata
      lastUpdated: data.metadata.last_updated,
      apiVersion: data.metadata.api_version,
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let probe42Client: Probe42Client | null = null

export function getProbe42Client(apiKey?: string): Probe42Client {
  if (!probe42Client) {
    probe42Client = new Probe42Client(apiKey)
  }
  return probe42Client
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Fetch and extract key company information by CIN
 */
export async function fetchCompanyByCIN(cin: string) {
  const client = getProbe42Client()
  const data = await client.getCompanyDetails(cin)
  return client.extractKeyInfo(data)
}