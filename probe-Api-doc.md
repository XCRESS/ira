# Probe42 API Documentation

Quick reference for integrating Probe42 API into the IRA Platform.

---

## Quick Start

```bash
# Authentication
--header 'x-api-key: YOUR_API_KEY'
--header 'x-api-version: 1.3'
--header 'Accept: application/json'

# Base URL
https://api.probe42.in
```

**Environment Variables:**
```bash
PROBE42_API_URL=https://api.probe42.in
PROBE42_API_KEY=your_api_key_here
```

---

## API Endpoints

### 1. Search Companies

```
GET /probe_pro/companies/search
```

**Parameters:**
- `filters`: `{"nameStartsWith":"Infosys"}` (min 3 chars)
- `limit`: 25 (max 100)

**Response:**
```json
{
  "data": {
    "entities": {
      "companies": [
        {
          "cin": "U73100KA2005PTC036337",
          "legal_name": "PROBE INFORMATION SERVICES PRIVATE LIMITED",
          "status": "ACTIVE"
        }
      ]
    },
    "total_count": 25,
    "has_more": false
  }
}
```

---

### 2. Company Base Details

```
GET /probe_pro/companies/{CIN_or_PAN}/base-details
```

**Use for:** Quick verification, director info, capital structure, compliance checks

**Response includes:**
- Basic info (name, CIN, status, incorporation date)
- Capital (authorized, paid-up, charges)
- Compliance (AGM date, filing status, e-filing status)
- Directors & KMP (with DIN status, appointments, cessations)
- Open charges (creditors, amounts)
- LEI (if applicable)
- Contact (email, registered address)

**Key fields:**
```json
{
  "data": {
    "company": {
      "cin": "U24230MH1985PLC036952",
      "legal_name": "MANEESH PHARMACEUTICALS LIMITED",
      "efiling_status": "Active",
      "incorporation_date": "1985-07-25",
      "paid_up_capital": 281251870,
      "authorized_capital": 300000000,
      "active_compliance": "ACTIVE compliant",
      "last_agm_date": "2023-07-11",
      "last_filing_date": "2023-03-31",
      "email": "cs@maneeshpharma.com",
      "registered_address": { /* ... */ }
    },
    "authorized_signatories": [
      {
        "din": "01404954",
        "name": "PRAVIN MOHANDAS HEGDE",
        "designation": "Director",
        "din_status": "Approved",
        "date_of_appointment": "2017-01-19",
        "date_of_cessation": null
      }
    ],
    "open_charges": [
      {
        "holder_name": "EXPORT IMPORT BANK OF INDIA",
        "amount": 180000000,
        "date": "2004-07-19"
      }
    ]
  }
}
```

**Director DIN Status values:**
- `"Approved"` - Active and valid
- `"Disqualified by RoC u/s 164(2)(a)"` - Disqualified
- `"Deactivated due to non-filing of DIR-3 KYC"` - KYC not filed

---

### 3. Comprehensive Details

```
GET /probe_pro/companies/{CIN}/comprehensive-details
```

**Use for:** IPO assessment, financial analysis, legal due diligence

**450+ data points including:**
- 7 years financial history (P&L, balance sheet, cash flow)
- Financial ratios and trends
- Complete legal proceedings
- Subsidiary/holding structure
- Detailed compliance history
- Defaulter status (SEBI, MCA, SFIO)
- Complete charge history
- Audit trail and changes

---

## Validation Formats

**CIN (21 chars):** `[L|U]XXXXX[State][Year][Type]XXXXXX`
- Example: `U24230MH1985PLC036952`
- Pattern: `/^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/`

**PAN (10 chars):** `[A-Z]{5}[0-9]{4}[A-Z]`
- Example: `AAAPH2938Q`
- Pattern: `/^[A-Z]{5}[0-9]{4}[A-Z]$/`

---

## Error Codes

| Code | Cause | Action |
|------|-------|--------|
| 400 | Invalid parameters | Validate input |
| 403 | Invalid API key | Check credentials |
| 404 | Company not found | Verify CIN/PAN |
| 422 | Validation error | Check format |
| 429 | Rate limit/No credits | Backoff + check credits |
| 500/502/504 | Server error | Retry with backoff |

---

## Integration Strategy

### Endpoint Selection

| Use Case | Endpoint | Why |
|----------|----------|-----|
| Company search | Search API | Find by name |
| Lead creation | **Base Details** | Fast, essential data only |
| Director KYC | **Base Details** | Has DIN status |
| Capital check | **Base Details** | Has structure |
| IPO scoring | Comprehensive | Need financials |
| Legal DD | Comprehensive | Need litigation |

**Cost Optimization:**
1. Search → select company
2. Base Details → create lead + initial checks
3. Comprehensive → only for IPO assessment

---

## TypeScript Implementation

### Service (`lib/probe42.ts`)

```typescript
import { Errors } from './errors'

const PROBE42_BASE_URL = process.env.PROBE42_API_URL!
const PROBE42_API_KEY = process.env.PROBE42_API_KEY!

export class Probe42Service {
  private async request(endpoint: string) {
    const res = await fetch(`${PROBE42_BASE_URL}${endpoint}`, {
      headers: {
        'x-api-key': PROBE42_API_KEY,
        'x-api-version': '1.3',
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      if (res.status === 403) throw Errors.probe42AuthFailed()
      if (res.status === 404) throw Errors.probe42CompanyNotFound()
      if (res.status === 429) throw Errors.probe42RateLimit()
      throw Errors.probe42ApiError(res.status)
    }

    return res.json()
  }

  // Search companies
  async search(filters: { nameStartsWith: string }, limit = 25) {
    const params = new URLSearchParams({
      filters: JSON.stringify(filters),
      limit: String(limit),
    })
    return this.request(`/probe_pro/companies/search?${params}`)
  }

  // Get base details (faster, cheaper)
  async getBaseDetails(identifier: string, type?: 'CIN' | 'PAN') {
    if (type === 'PAN' && !this.isValidPAN(identifier)) {
      throw Errors.invalidPanFormat()
    }
    if (type !== 'PAN' && !this.isValidCIN(identifier)) {
      throw Errors.invalidCinFormat()
    }

    const query = type === 'PAN' ? '?identifier_type=PAN' : ''
    return this.request(`/probe_pro/companies/${identifier}/base-details${query}`)
  }

  // Get comprehensive details (expensive)
  async getComprehensiveDetails(cin: string) {
    if (!this.isValidCIN(cin)) throw Errors.invalidCinFormat()
    return this.request(`/probe_pro/companies/${cin}/comprehensive-details`)
  }

  private isValidCIN(cin: string): boolean {
    return /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cin)
  }

  private isValidPAN(pan: string): boolean {
    return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)
  }
}

export const probe42 = new Probe42Service()
```

### Error Handlers (`lib/errors.ts`)

```typescript
export const Errors = {
  // ... existing errors

  probe42AuthFailed: () => new AppError(
    'PROBE42_AUTH_FAILED',
    'Probe42 API authentication failed',
    403
  ),

  probe42CompanyNotFound: () => new AppError(
    'PROBE42_COMPANY_NOT_FOUND',
    'Company not found in Probe42 database',
    404
  ),

  probe42RateLimit: () => new AppError(
    'PROBE42_RATE_LIMIT',
    'Probe42 API rate limit exceeded or credits exhausted',
    429
  ),

  probe42ApiError: (status: number) => new AppError(
    'PROBE42_API_ERROR',
    `Probe42 API error: ${status}`,
    status
  ),

  invalidCinFormat: () => new AppError(
    'INVALID_CIN_FORMAT',
    'Invalid CIN format (21 chars)',
    400
  ),

  invalidPanFormat: () => new AppError(
    'INVALID_PAN_FORMAT',
    'Invalid PAN format (10 chars)',
    400
  ),
}
```

### Server Action Example (`actions/lead.ts`)

```typescript
'use server'

import { verifyAuth } from '@/lib/dal'
import { probe42 } from '@/lib/probe42'
import { handleActionError, handlePrismaError } from '@/lib/errors'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

// Create lead with Probe42 data
export async function createLeadFromCIN(cin: string) {
  try {
    const session = await verifyAuth()

    // Fetch base details (faster, cheaper)
    const data = await probe42.getBaseDetails(cin)

    const lead = await prisma.lead.create({
      data: {
        cin: data.data.company.cin,
        companyName: data.data.company.legal_name,
        incorporationDate: new Date(data.data.company.incorporation_date),
        status: data.data.company.efiling_status,

        // Cache Probe42 data
        probe42Data: data.data,
        probe42UpdatedAt: new Date(),
        probe42Status: data.data.company.efiling_status,

        // Capital
        authorizedCapital: data.data.company.authorized_capital,
        paidUpCapital: data.data.company.paid_up_capital,

        // Compliance
        lastFilingDate: new Date(data.data.company.last_filing_date),

        // Auto-assign to creator
        assignedToId: session.user.id,
        createdById: session.user.id,
      },
    })

    // Audit log
    await createAuditLog(
      session.user.id,
      'CREATE_LEAD_FROM_PROBE42',
      lead.id,
      { cin, source: 'probe42_base_details' }
    )

    revalidatePath('/dashboard/leads')
    return { success: true, data: lead }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// Enrich with comprehensive data (for IPO assessment)
export async function enrichLeadForAssessment(leadId: string) {
  try {
    const session = await verifyAuth()

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead?.cin) throw Errors.leadNotFound()

    // Fetch comprehensive details
    const data = await probe42.getComprehensiveDetails(lead.cin)

    // Update with financial data
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        probe42ComprehensiveData: data.data,
        probe42ComprehensiveUpdatedAt: new Date(),
        // Extract financial metrics for scoring
        latestRevenue: data.data.financials?.latest?.revenue,
        latestProfit: data.data.financials?.latest?.profit,
        // ... more fields
      },
    })

    revalidatePath(`/dashboard/leads/${leadId}`)
    return { success: true }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}
```

---

## Database Schema Updates

```prisma
model Lead {
  // ... existing fields

  // Probe42 cached data
  probe42Data                   Json?      // Base details cache
  probe42UpdatedAt              DateTime?
  probe42ComprehensiveData      Json?      // Comprehensive cache
  probe42ComprehensiveUpdatedAt DateTime?
  probe42Status                 String?    // ACTIVE, etc.

  // Financial snapshot
  authorizedCapital  Decimal?
  paidUpCapital      Decimal?
  latestRevenue      Decimal?
  latestProfit       Decimal?

  // Compliance
  lastFilingDate DateTime?
  lastAGMDate    DateTime?
  isDefaulter    Boolean?

  // Directors
  directorCount Int?
}
```

---

## Best Practices

### ✅ DO

- **Cache responses** in database (refresh monthly)
- **Validate CIN/PAN** before API calls
- **Use Base Details** for lead creation (faster, cheaper)
- **Use Comprehensive** only for IPO assessment
- **Implement retry** with exponential backoff for 429
- **Log all calls** to AuditLog table
- **Monitor credits** and set alerts

### ❌ DON'T

- Make redundant calls for same CIN
- Ignore 429 rate limits
- Store API keys in code
- Skip validation
- Fetch comprehensive on every page load
- Use comprehensive when base details sufficient

---

## Rate Limiting & Retry

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000 // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error
      }
    }
  }
  throw new Error('Max retries exceeded')
}

// Usage
const data = await retryWithBackoff(() =>
  probe42.getBaseDetails(cin)
)
```

---

## Contact

- **Portal:** https://apiportal.probe42.in
- **Email:** apiteam@probe42.in
- **Phone:** 1800 12000 4242

---

## Integration Checklist

For IRA Platform:

- [ ] Add `PROBE42_API_URL` and `PROBE42_API_KEY` to `.env`
- [ ] Create `lib/probe42.ts` service
- [ ] Add error handlers to `lib/errors.ts`
- [ ] Update Lead schema with Probe42 fields (`prisma/schema.prisma`)
- [ ] Run `npx prisma db push`
- [ ] Implement `createLeadFromCIN` server action
- [ ] Add CIN search to lead creation form
- [ ] Implement caching (refresh every 30 days)
- [ ] Add audit logging for all Probe42 calls
- [ ] Set up retry logic with exponential backoff
- [ ] Monitor credit usage (add to dashboard)

---

## Summary

**3 Core Endpoints:**
1. **Search** - Find companies by name
2. **Base Details** - Quick info (directors, capital, compliance)
3. **Comprehensive** - Full data (financials, legal, 450+ fields)

**Strategy:** Search → Base Details (lead creation) → Comprehensive (IPO assessment only)