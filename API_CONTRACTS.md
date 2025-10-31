# IRA Platform - API Contracts

**Server Actions for IPO Readiness Assessment Tool**

---

## Core Entities

### Lead
```typescript
type Lead = {
  id: string;
  leadId: string;              // Display ID (LD-2024-001)
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  cin: string;                 // Company Identification Number
  address: string;

  status: 'NEW' | 'ASSIGNED' | 'IN_REVIEW' | 'PAYMENT_PENDING' | 'COMPLETED';

  assignedAssessor: string | null;  // User ID
  assessmentId: string | null;

  createdBy: string;           // User ID (Reviewer)
  createdAt: Date;
  updatedAt: Date;
}
```

### Document
```typescript
type Document = {
  id: string;
  leadId: string;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'jpg' | 'jpeg' | 'png';
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
}
```

### Assessment
```typescript
type Assessment = {
  id: string;
  leadId: string;
  assessorId: string;

  // Step 1: Eligibility Questions (all must pass)
  eligibilityAnswers: Record<string, {
    checked: boolean;           // Must be true for all
    remark: string | null;
  }>;
  isEligible: boolean | null;   // Computed: all checked = true
  eligibilityCompletedAt: Date | null;

  // Step 2: Main Questions (only if eligible)
  companyAnswers: Record<string, AnswerValue>;    // 30 Qs
  financialAnswers: Record<string, AnswerValue>;  // 7 Qs
  sectorAnswers: Record<string, AnswerValue>;     // 20 Qs

  // Probe42 data (optional)
  probe42Data: {
    fetched: boolean;
    fetchedAt: Date | null;
    data: any | null;           // Financial info from Probe42
  };

  // Calculated
  totalScore: number | null;
  percentage: number | null;
  rating: 'IPO_READY' | 'NEEDS_IMPROVEMENT' | 'NOT_READY' | null;

  // Workflow
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedAt: Date | null;
  reviewedAt: Date | null;
  reviewerComments: string | null;

  createdAt: Date;
  updatedAt: Date;
}

type AnswerValue = {
  score: -1 | 0 | 1 | 2;        // No=-1, NA=0, Maybe=1, Yes=2
  remark: string | null;
  evidenceLink: string | null;
}
```

### Question
```typescript
type Question = {
  id: string;
  type: 'ELIGIBILITY' | 'COMPANY' | 'FINANCIAL' | 'SECTOR';
  text: string;
  order: number;
  helpText: string | null;
  isActive: boolean;            // Can be disabled by reviewer
  createdAt: Date;
  updatedAt: Date;
}

// Example counts:
// - ELIGIBILITY: ~5-10 questions (all must be checked)
// - COMPANY: 30 questions
// - FINANCIAL: 7 questions
// - SECTOR: 20 questions
```

### User
```typescript
type User = {
  id: string;
  name: string;
  email: string;
  role: 'REVIEWER' | 'ASSESSOR';
  isActive: boolean;
}

// Seeded:
// Piyush Kumar (REVIEWER)
// Rashmi (ASSESSOR)
// Rahul (ASSESSOR)
// Jaydeep (ASSESSOR)
```

---

## 1. Authentication

**Implementation**: Better Auth v1.3.33 with Google OAuth only

### Auth Configuration

```typescript
// lib/auth.ts - Server-side auth instance
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "ASSESSOR", input: false }
    }
  }
})

// Allowed users (whitelist)
const ALLOWED_USERS = [
  { email: "rashmi@company.com", role: "REVIEWER" },
  { email: "rahul@company.com", role: "ASSESSOR" },
  { email: "jaydeep@company.com", role: "ASSESSOR" },
  { email: "piyush@company.com", role: "REVIEWER" },
]
```

### Client-side Auth

```typescript
// lib/auth-client.ts
"use client"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000"
})

export const { signIn, signOut, useSession } = authClient

// Usage in components
await signIn.social({ provider: "google", callbackURL: "/dashboard" })
await signOut()
const { data: session } = useSession()
```

### Server Components

```typescript
// Get session in Server Components
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const session = await auth.api.getSession({ headers: await headers() })
if (!session) redirect("/login")

// Access user data
session.user.name  // string
session.user.email // string
session.user.role  // "ASSESSOR" | "REVIEWER"
session.user.image // string | null
```

### Server Actions

```typescript
'use server'

async function someAction() {
  // CRITICAL: Always verify auth first (Data Access Layer pattern)
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    throw new Error("Unauthorized")
  }

  // Check role
  if (session.user.role !== "REVIEWER") {
    throw new Error("Forbidden")
  }

  // Proceed with action
}
```

### Authentication Flow

1. User visits `/login`
2. Clicks "Sign in with Google"
3. Redirected to Google OAuth consent
4. Google redirects back to `/api/auth/callback/google`
5. Better Auth creates/updates user, checks whitelist
6. If email not in `ALLOWED_USERS` → Account deleted, error shown
7. If allowed → Role assigned, session created
8. User redirected to `/dashboard`

### Middleware Protection

```typescript
// middleware.ts
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}
```

### Security Notes

- ✅ Google OAuth only (no password management)
- ✅ Email whitelist enforced in hooks
- ✅ Role auto-assigned on first login
- ✅ Middleware + Data Access Layer pattern
- ✅ Session stored in database
- ✅ 7-day session expiration
- ⚠️ **Always check auth in Server Actions** (defense in depth)

---

## 2. Leads

### `actions/lead.ts` ✅ IMPLEMENTED

**Status**: Fully implemented with Next.js 15+ Server Actions

**Implementation Notes**:
- All actions use `"use server"` directive
- Data Access Layer pattern: `verifyAuth()` called first in all actions
- Input validation with Zod schemas
- Automatic audit logging for all mutations
- `revalidatePath()` for cache invalidation
- Proper TypeScript types with `ActionResponse<T>` generic

```typescript
'use server';

// Create lead (REVIEWER only) ✅
async function createLead(data: {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  cin: string;
  address: string;
}): Promise<{ success: boolean; data?: Lead; error?: string }>
// ✅ Implemented: Creates lead with auto-generated leadId (LD-2024-001)
// ✅ Checks CIN uniqueness
// ✅ Creates audit log entry
// ✅ Revalidates /dashboard/leads

// Get all leads (sorted by status for reviewer) ✅
async function getLeads(filters?: {
  assignedTo?: string;          // For assessor view
  status?: Lead['status'];
}): Promise<{ success: boolean; data?: Lead[]; error?: string }>
// ✅ Implemented: Default sort: NEW > IN_REVIEW > PAYMENT_PENDING > ASSIGNED > COMPLETED
// ✅ Auto-filters for assessors (only their assigned leads)
// ✅ Includes related data (assignedAssessor, createdBy, assessment, document count)

// Get single lead with full details ✅
async function getLead(leadId: string): Promise<{
  success: boolean;
  data?: Lead;
  error?: string;
}>
// ✅ Implemented: Returns lead with all relations
// ✅ Access control: Assessors can only view their assigned leads

// Update lead info ✅
async function updateLead(leadId: string, data: {
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<{ success: boolean; data?: Lead; error?: string }>
// ✅ Implemented: Zod validation, audit log, revalidation

// Assign assessor (REVIEWER only) ✅
async function assignAssessor(leadId: string, input: { assessorId: string }): Promise<{
  success: boolean;
  data?: Lead;
  error?: string;
}>
// ✅ Implemented: Creates Assessment with empty answers, status = DRAFT
// ✅ Updates lead status to ASSIGNED
// ✅ Uses transaction to ensure atomicity
// ✅ Validates assessor role

// Update status (REVIEWER only) ✅
async function updateLeadStatus(leadId: string, input: { status: LeadStatus }): Promise<{
  success: boolean;
  data?: void;
  error?: string;
}>
// ✅ Implemented: Updates status with audit log

// Get assessors (for dropdown) ✅
async function getAssessors(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string; email: string }>;
  error?: string;
}>
// ✅ Implemented: Returns all users with role=ASSESSOR

// ⏳ TODO: Send payment link (REVIEWER only)
async function sendPaymentLink(leadId: string): Promise<{
  success: boolean;
  paymentUrl?: string;
  error?: string;
}>
// Sets status = PAYMENT_PENDING, generates payment link
```

### Pages Implemented ✅

**`/dashboard/leads`** - Lead listing
- ✅ Server Component with parallel data fetching
- ✅ Stats cards (Total, New, In Progress, Completed)
- ✅ Sortable table with status badges
- ✅ Role-based views (Reviewer sees all, Assessor sees assigned)
- ✅ Links to create new lead (Reviewer only)

**`/dashboard/leads/new`** - Create new lead
- ✅ Server Component with role check (Reviewer only)
- ✅ Client Component form with validation
- ✅ Real-time error handling
- ✅ CIN format validation (21 chars)
- ✅ Phone format validation (+91-XXXXXXXXXX)
- ✅ Redirects to lead detail on success

**`/dashboard/leads/[id]`** - Lead detail
- ✅ Server Component with full lead data
- ✅ Company information display
- ✅ Assessment status (if exists)
- ✅ Document count (upload UI coming next)
- ✅ Assign/change assessor form (Reviewer only)
- ✅ Client Component for assessor selection
- ✅ Access control (Assessors only see assigned leads)

---

## 3. Documents

### `actions/document.ts`

```typescript
'use server';

// Upload document
async function uploadDocument(data: {
  leadId: string;
  file: File;
}): Promise<{ success: boolean; document?: Document; error?: string }>
// Validates: pdf, jpg, jpeg, png only

// Get documents for lead
async function getDocuments(leadId: string): Promise<Document[]>

// Delete document
async function deleteDocument(documentId: string): Promise<{
  success: boolean;
  error?: string;
}>
```

---

## 4. Assessment - Eligibility

### `actions/eligibility.ts`

```typescript
'use server';

// Get eligibility questions
async function getEligibilityQuestions(): Promise<Question[]>

// Get eligibility answers for assessment
async function getEligibilityAnswers(assessmentId: string): Promise<
  Record<string, { checked: boolean; remark: string | null }>
>

// Update eligibility answers (ASSESSOR only)
async function updateEligibilityAnswers(assessmentId: string, answers: Record<string, {
  checked: boolean;
  remark?: string;
}>): Promise<{ success: boolean; error?: string }>

// Check eligibility (auto-computed)
async function checkEligibility(assessmentId: string): Promise<{
  isEligible: boolean;
  message: string;
}>
// Returns: { isEligible: true } if ALL questions checked = true
//          { isEligible: false, message: "Questions Q1, Q3 not met" }

// Complete eligibility check (ASSESSOR)
async function completeEligibility(assessmentId: string): Promise<{
  success: boolean;
  isEligible: boolean;
  error?: string;
}>
// If not eligible → lead.status = COMPLETED, assessment closed
// If eligible → unlocks main questions
```

---

## 5. Assessment - Main Questions

### `actions/assessment.ts`

```typescript
'use server';

// Get assessment
async function getAssessment(leadId: string): Promise<Assessment | null>

// Fetch Probe42 data (ASSESSOR/REVIEWER)
async function fetchProbe42Data(assessmentId: string, cin: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}>
// Calls Probe42 API, stores in assessment.probe42Data

// Update company section (ASSESSOR)
async function updateCompanyAnswers(assessmentId: string, answers: Record<string, {
  score: -1 | 0 | 1 | 2;
  remark?: string;
  evidenceLink?: string;
}>): Promise<{ success: boolean; error?: string }>
// Can only update if eligibility passed

// Update financial section (ASSESSOR)
async function updateFinancialAnswers(assessmentId: string, answers: Record<string, {
  score: -1 | 0 | 1 | 2;
  remark?: string;
  evidenceLink?: string;
}>): Promise<{ success: boolean; error?: string }>

// Update sector section (ASSESSOR)
async function updateSectorAnswers(assessmentId: string, answers: Record<string, {
  score: -1 | 0 | 1 | 2;
  remark?: string;
  evidenceLink?: string;
}>): Promise<{ success: boolean; error?: string }>

// Submit assessment (ASSESSOR)
async function submitAssessment(assessmentId: string): Promise<{
  success: boolean;
  result?: {
    totalScore: number;
    percentage: number;
    rating: 'IPO_READY' | 'NEEDS_IMPROVEMENT' | 'NOT_READY';
  };
  error?: string;
}>
// Auto-calculates score, status = SUBMITTED, lead.status = IN_REVIEW

// Approve (REVIEWER only)
async function approveAssessment(assessmentId: string, comments?: string): Promise<{
  success: boolean;
  error?: string;
}>
// status = APPROVED, lead.status = PAYMENT_PENDING

// Reject (REVIEWER only)
async function rejectAssessment(assessmentId: string, comments: string): Promise<{
  success: boolean;
  error?: string;
}>
// status = REJECTED, lead.status = ASSIGNED (back to assessor)
```

---

## 6. Questions Management

### `actions/question.ts`

```typescript
'use server';

// Get all questions (grouped)
async function getQuestions(includeInactive?: boolean): Promise<{
  eligibility: Question[];
  company: Question[];
  financial: Question[];
  sector: Question[];
}>

// Add question (REVIEWER only)
async function addQuestion(data: {
  type: 'ELIGIBILITY' | 'COMPANY' | 'FINANCIAL' | 'SECTOR';
  text: string;
  helpText?: string;
  order?: number;
}): Promise<{ success: boolean; question?: Question; error?: string }>

// Update question (REVIEWER only)
async function updateQuestion(questionId: string, data: {
  text?: string;
  helpText?: string;
  order?: number;
  isActive?: boolean;
}): Promise<{ success: boolean; error?: string }>

// Delete question (REVIEWER only)
async function deleteQuestion(questionId: string): Promise<{
  success: boolean;
  error?: string;
}>
// Soft delete: sets isActive = false

// Reorder questions (REVIEWER only)
async function reorderQuestions(questionIds: string[]): Promise<{
  success: boolean;
  error?: string;
}>
// Updates order field based on array position
```

---

## 7. Dashboard

### `actions/dashboard.ts`

```typescript
'use server';

// Reviewer dashboard
async function getReviewerDashboard(): Promise<{
  stats: {
    totalLeads: number;
    newLeads: number;
    assigned: number;
    inReview: number;
    paymentPending: number;
    completed: number;
  };
  leads: Lead[];  // Sorted by status
  recentActivity: Activity[];
}>

// Assessor dashboard
async function getAssessorDashboard(assessorId: string): Promise<{
  stats: {
    assigned: number;
    pendingEligibility: number;
    inProgress: number;
    submitted: number;
  };
  leads: Lead[];  // Only assigned to this assessor
}>

type Activity = {
  id: string;
  type: 'LEAD_CREATED' | 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  leadId: string;
  companyName: string;
  user: string;
  timestamp: Date;
}
```

---

## 8. Probe42 Integration

### `lib/probe42.ts` (internal helper)

```typescript
'use server';

// Fetch company financial data from Probe42
async function getCompanyFinancials(cin: string): Promise<{
  success: boolean;
  data?: {
    companyInfo: {
      name: string;
      cin: string;
      registrationDate: string;
      status: string;
    };
    financials: {
      year: string;
      revenue: number;
      profit: number;
      assets: number;
      liabilities: number;
    }[];
    directors: {
      name: string;
      din: string;
      designation: string;
    }[];
    compliance: {
      gstStatus: string;
      taxFilingStatus: string;
    };
  };
  error?: string;
}>

// API endpoint: https://api.probe42.in/v1/companies/{cin}
// Requires API key in headers
```

---

## User Flows

### REVIEWER Flow

```typescript
// 1. Login
await login('piyush@company.com', 'pass');

// 2. Dashboard
const { leads, stats } = await getReviewerDashboard();
// Shows all leads sorted by status

// 3. Add lead
const { lead } = await createLead({
  companyName: "TechCorp Pvt Ltd",
  contactPerson: "Amit",
  phone: "+91-9876543210",
  email: "amit@techcorp.com",
  cin: "U12345MH2020PTC123456",
  address: "Mumbai"
});
// status = NEW

// 4. View lead
const leadData = await getLead(lead.id);

// 5. Assign assessor
await assignAssessor(lead.id, rashmiId);
// status = ASSIGNED, assessment created

// 6. View assessment (when submitted)
const assessment = await getAssessment(lead.id);

// 7. Approve/Reject
await approveAssessment(assessment.id, "Good work");
// status = PAYMENT_PENDING

// 8. Send payment link
await sendPaymentLink(lead.id);

// 9. Mark complete
await updateLeadStatus(lead.id, 'COMPLETED');

// 10. Manage questions
const questions = await getQuestions();
await addQuestion({
  type: 'ELIGIBILITY',
  text: "Company incorporated for at least 3 years?",
  helpText: "Check incorporation date"
});
await updateQuestion(questionId, { text: "Updated text" });
```

### ASSESSOR Flow

```typescript
// 1. Login
await login('rashmi@company.com', 'pass');

// 2. Dashboard
const { leads } = await getAssessorDashboard(rashmiId);
// Shows only assigned leads

// 3. View lead
const { lead, documents, assessment } = await getLead(leadId);

// 4. Upload docs
await uploadDocument({ leadId, file: pdfFile });

// 5. Fetch Probe42 data
await fetchProbe42Data(assessment.id, lead.cin);
// Gets financial data automatically

// 6. Step 1: Eligibility check
const eligibilityQs = await getEligibilityQuestions();
// e.g., 5 questions: incorporated 3+ years, no pending litigation, etc.

await updateEligibilityAnswers(assessment.id, {
  "EQ1": { checked: true, remark: "Incorporated 2020" },
  "EQ2": { checked: true, remark: "No litigation" },
  "EQ3": { checked: false, remark: "Missing compliance cert" },
  "EQ4": { checked: true },
  "EQ5": { checked: true },
});

const { isEligible } = await completeEligibility(assessment.id);
if (!isEligible) {
  // Lead closed, status = COMPLETED
  return;
}

// 7. Step 2: Main questions (if eligible)
const questions = await getQuestions();

// Company section
await updateCompanyAnswers(assessment.id, {
  "C1": { score: 2, remark: "Strong board", evidenceLink: "doc-url" },
  "C2": { score: 1 },
  // ... 28 more
});

// Financial section (use Probe42 data)
await updateFinancialAnswers(assessment.id, {
  "F1": { score: 2, remark: "Profitable last 3 years" },
  // ... 6 more
});

// Sector section
await updateSectorAnswers(assessment.id, {
  "S1": { score: 2 },
  // ... 19 more
});

// 8. Submit
const { result } = await submitAssessment(assessment.id);
// { totalScore: 95, percentage: 83.3%, rating: 'IPO_READY' }
// Lead status = IN_REVIEW

// 9. If rejected
// Edit answers and resubmit
```

---

## Scoring Logic

```typescript
function calculateScore(assessment: Assessment): {
  totalScore: number;
  percentage: number;
  rating: 'IPO_READY' | 'NEEDS_IMPROVEMENT' | 'NOT_READY';
} {
  const allAnswers = [
    ...Object.values(assessment.companyAnswers),
    ...Object.values(assessment.financialAnswers),
    ...Object.values(assessment.sectorAnswers),
  ];

  const totalScore = allAnswers.reduce((sum, ans) => sum + ans.score, 0);
  const maxPossibleScore = allAnswers.length * 2;  // All Yes = 2
  const percentage = (totalScore / maxPossibleScore) * 100;

  let rating: typeof assessment.rating;
  if (percentage > 65) rating = 'IPO_READY';
  else if (percentage >= 45) rating = 'NEEDS_IMPROVEMENT';
  else rating = 'NOT_READY';

  return { totalScore, percentage, rating };
}
```

---

## Eligibility Logic

```typescript
function checkEligibility(answers: Record<string, { checked: boolean }>): {
  isEligible: boolean;
  failedQuestions: string[];
} {
  const failedQuestions = Object.entries(answers)
    .filter(([_, ans]) => !ans.checked)
    .map(([qId]) => qId);

  return {
    isEligible: failedQuestions.length === 0,
    failedQuestions,
  };
}
```

---

## Authorization

| Action | REVIEWER | ASSESSOR |
|--------|----------|----------|
| Create lead | ✅ | ❌ |
| Edit lead info | ✅ | ✅ (assigned) |
| Assign assessor | ✅ | ❌ |
| Upload docs | ✅ | ✅ (assigned) |
| Fetch Probe42 | ✅ | ✅ (assigned) |
| Eligibility check | ❌ | ✅ (assigned) |
| Fill questions | ❌ | ✅ (assigned) |
| Submit assessment | ❌ | ✅ (assigned) |
| Approve/Reject | ✅ | ❌ |
| Manage questions | ✅ | ❌ |
| Send payment link | ✅ | ❌ |
| View all leads | ✅ | ❌ |
| View assigned | ❌ | ✅ |

---

## Status Flow

```
Lead Status:
NEW → ASSIGNED → IN_REVIEW → PAYMENT_PENDING → COMPLETED
        ↓                ↑
        └─ (rejected) ──┘

Special case (not eligible):
NEW → ASSIGNED → COMPLETED

Assessment Status:
DRAFT → SUBMITTED → APPROVED
           ↓
        REJECTED → (back to DRAFT for editing)
```

---

## Validation

```typescript
// Lead
const CreateLeadSchema = z.object({
  companyName: z.string().min(2).max(200),
  contactPerson: z.string().min(2).max(100),
  phone: z.string().regex(/^\+91-[0-9]{10}$/),
  email: z.string().email(),
  cin: z.string().regex(/^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/),
  address: z.string().min(10).max(500),
});

// Eligibility answer
const EligibilityAnswerSchema = z.object({
  checked: z.boolean(),
  remark: z.string().max(500).optional(),
});

// Assessment answer
const AssessmentAnswerSchema = z.object({
  score: z.number().int().min(-1).max(2),
  remark: z.string().max(1000).optional(),
  evidenceLink: z.string().url().optional(),
});

// Question
const QuestionSchema = z.object({
  type: z.enum(['ELIGIBILITY', 'COMPANY', 'FINANCIAL', 'SECTOR']),
  text: z.string().min(10).max(500),
  helpText: z.string().max(1000).optional(),
  order: z.number().int().positive().optional(),
});
```

---

## Notes

1. **Eligibility is mandatory** - All questions must be checked true to proceed
2. **Probe42 integration** - External API (https://probe42.in) for financial data
3. **Question management** - Reviewer can add/edit/disable questions
4. **Two-step assessment** - Eligibility → Main questions (if eligible)
5. **Auto-calculation** - Score computed on submit
6. **Simple payment flow** - Generate link, manually mark as paid
7. **Document storage** - Vercel Blob for pdf/jpg/jpeg/png
8. **4 users total** - 1 reviewer (Piyush), 3 assessors (Rashmi, Rahul, Jaydeep)
9. **No real-time sync needed** - Simple CRUD operations
10. **Status-based dashboard** - Sorted by workflow priority
