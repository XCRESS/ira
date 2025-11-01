# Backend Refactoring - Complete Summary

## What Was Fixed

### P0 - Critical Issues (FIXED ✅)

#### 1. **Race Condition in Lead ID Generation**
**Problem**: Using `count()` then generating ID caused race conditions:
```typescript
// ❌ OLD - Two simultaneous requests = same ID!
const leadCount = await prisma.lead.count()
const leadId = generateLeadId(leadCount)
```

**Solution**: Atomic database-level counter
```typescript
// ✅ NEW - Thread-safe atomic increment
const leadId = await generateLeadId() // Uses Counter table with atomic upsert
```

**Files**:
- Added `Counter` model to [schema.prisma](prisma/schema.prisma:260-266)
- Created `getNextSequence()` in [lib/dal.ts](lib/dal.ts:90-104)
- Updated `createLead()` in [actions/lead.ts](actions/lead.ts:93)

---

#### 2. **No Optimistic Locking**
**Problem**: Concurrent modifications could overwrite each other silently

**Solution**: Added version checking with `updatedAt` timestamps
```typescript
// Client must pass last known updatedAt
updateLead(leadId, data, expectedUpdatedAt: string)

// Server checks before update
checkOptimisticLock(lead.updatedAt, new Date(expectedUpdatedAt))

// Atomic update with version check
prisma.lead.update({
  where: { id, updatedAt: lead.updatedAt },
  data
})
```

**Files**:
- Created `checkOptimisticLock()` in [lib/dal.ts](lib/dal.ts:144-152)
- Updated `updateLead()` and `assignAssessor()` in [actions/lead.ts](actions/lead.ts:219-273,281-371)

---

#### 3. **Generic Error Messages**
**Problem**: Lost error context, hard to debug
```typescript
// ❌ OLD
return { success: false, error: "Failed to create lead" }
```

**Solution**: Structured error codes with context
```typescript
// ✅ NEW
throw Errors.duplicateCIN(cin)
// Returns: { success: false, error: "...", code: "DUPLICATE_CIN", context: { cin } }
```

**Files**:
- Created comprehensive error system in [lib/errors.ts](lib/errors.ts)
- Updated `ActionResponse` type in [lib/types.ts](lib/types.ts:51-53)
- Implemented `handleActionError()` wrapper in [actions/lead.ts](actions/lead.ts:37-61)

---

#### 4. **Missing User.isActive Check**
**Problem**: Deactivated users could still perform actions

**Solution**: Added `isActive` field + verification in DAL
```typescript
// ✅ Every auth check now verifies isActive
export async function verifyAuth(): Promise<VerifiedSession> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw Errors.unauthorized()

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || !user.isActive) throw Errors.userInactive()

  return { user, session }
}
```

**Files**:
- Added `isActive Boolean @default(true)` to [schema.prisma](prisma/schema.prisma:33)
- Implemented check in [lib/dal.ts](lib/dal.ts:35-65)
- Updated `getAssessors()` to filter by `isActive: true` in [actions/lead.ts](actions/lead.ts:430-433)

---

## New Files Created

### 1. [lib/errors.ts](lib/errors.ts)
Structured error handling system:
- `ErrorCode` enum with all error types
- `AppError` class with code, message, statusCode, context
- `Errors` factory with typed error creators
- `getErrorMessage()` for user-friendly display

### 2. [lib/dal.ts](lib/dal.ts)
Data Access Layer with:
- `verifyAuth()` - Auth + isActive check
- `verifyRole()` - Role-based auth
- `getNextSequence()` - Atomic counter
- `generateLeadId()` - Thread-safe ID generation
- `createAuditLog()` - Typed audit logging
- `checkOptimisticLock()` - Concurrency control
- `handlePrismaError()` - Prisma error translation
- `leadInclude` - Consistent query includes

---

## Modified Files

### 1. [prisma/schema.prisma](prisma/schema.prisma)
- Added `isActive Boolean @default(true)` to User model (line 33)
- Added `Counter` model for atomic sequences (lines 260-266)

### 2. [lib/types.ts](lib/types.ts)
- Updated `ActionResponse` to include `code` and `context` (line 53)
- Imported `ErrorCode` type (line 4)

### 3. [actions/lead.ts](actions/lead.ts)
**Complete refactor** with:
- Atomic lead ID generation (no race conditions)
- Optimistic locking on `updateLead` and `assignAssessor`
- Structured error handling with error codes
- User.isActive verification via DAL
- Proper Prisma error handling
- Better audit logging with old/new values

**Breaking Changes**:
- `updateLead(leadId, input, expectedUpdatedAt)` - Added `expectedUpdatedAt` parameter
- `assignAssessor(leadId, input, expectedUpdatedAt)` - Added `expectedUpdatedAt` parameter

### 4. [CLAUDE.md](CLAUDE.md)
Added **Backend Patterns** section (lines 65-96):
- Server Actions core rules
- Data integrity patterns
- Error handling pattern
- Audit & observability guidelines

---

## Database Migration Required

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Push schema changes to database
npx prisma db push

# 3. (Optional) Initialize counter for existing leads
# If you have existing leads, run this to avoid ID conflicts:
```

```sql
-- Count existing leads per year
INSERT INTO "counter" (id, value)
SELECT
  'lead-' || EXTRACT(YEAR FROM "createdAt") as id,
  COUNT(*) as value
FROM "lead"
GROUP BY EXTRACT(YEAR FROM "createdAt")
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;
```

---

## Frontend Changes Needed

### Update Lead Edit/Assign Components

**Before**:
```typescript
const result = await updateLead(leadId, formData)
const result = await assignAssessor(leadId, { assessorId })
```

**After**:
```typescript
// Pass current updatedAt timestamp for optimistic locking
const result = await updateLead(leadId, formData, lead.updatedAt.toISOString())
const result = await assignAssessor(leadId, { assessorId }, lead.updatedAt.toISOString())

// Handle concurrent modification error
if (!result.success && result.code === "CONCURRENT_MODIFICATION") {
  alert("This record was modified by another user. Please refresh and try again.")
  // Refresh the page or refetch data
}
```

### Error Display Enhancement

```typescript
if (!result.success) {
  // Use error code for better UX
  switch (result.code) {
    case "DUPLICATE_CIN":
      toast.error("A company with this CIN already exists")
      break
    case "CONCURRENT_MODIFICATION":
      toast.error("Record was modified by another user. Refreshing...")
      router.refresh()
      break
    case "INSUFFICIENT_PERMISSIONS":
      toast.error("You don't have permission for this action")
      break
    default:
      toast.error(result.error) // Generic fallback
  }
}
```

---

## Testing Checklist

### Race Condition Test
1. Open two browser tabs as REVIEWER
2. Click "Create Lead" in both tabs simultaneously
3. Submit form at exact same time
4. ✅ Both should get unique lead IDs (no duplicates)

### Optimistic Locking Test
1. Open lead detail in two tabs
2. Edit different fields in each tab
3. Save tab 1 (should succeed)
4. Save tab 2 (should fail with CONCURRENT_MODIFICATION error)

### User Deactivation Test
1. As admin, set user `isActive = false` in database
2. Try to perform any action as that user
3. ✅ Should get "USER_INACTIVE" error

### Error Code Test
1. Try to create lead with duplicate CIN
2. ✅ Check response has `code: "DUPLICATE_CIN"`
3. Try to assign invalid assessor
4. ✅ Check response has proper error code

---

## Performance Impact

### Positive
- **Atomic counters**: Single database operation instead of count + create
- **Optimistic locking**: Prevents wasted work from concurrent modifications
- **DAL caching**: User lookup happens once per request

### Neutral
- **Error handling**: Negligible overhead from structured errors
- **Audit logging**: Async, doesn't block main operation

---

## What's NOT Fixed Yet (P1/P2)

### P1 - Fix This Sprint
- **JSON Assessment Answers**: Still using JSON fields (schema.prisma:172-180)
  - Should be separate `Answer` table for queryability
  - Breaking change, requires data migration
  - Do this BEFORE implementing assessment workflow

### P2 - Tech Debt
- **State Machine Validation**: No validation of status transitions
  - Should prevent invalid transitions (e.g., NEW → COMPLETED)
  - Add `validateStatusTransition()` helper
- **Proper Logging**: Still using console.error
  - Should use structured logging (Pino/Winston)
- **Integration Tests**: No automated tests for critical flows
- **Rate Limiting**: Should add for production deployment

---

## Quick Reference

### Error Codes Available
```typescript
UNAUTHORIZED, INSUFFICIENT_PERMISSIONS, SESSION_EXPIRED, USER_INACTIVE
LEAD_NOT_FOUND, ASSESSMENT_NOT_FOUND, USER_NOT_FOUND
INVALID_INPUT, DUPLICATE_CIN, DUPLICATE_RESOURCE
CONCURRENT_MODIFICATION, STALE_DATA
INVALID_STATUS_TRANSITION, ASSESSOR_NOT_ASSIGNED, ASSESSMENT_ALREADY_SUBMITTED
DATABASE_ERROR, UNKNOWN_ERROR
```

### DAL Functions
```typescript
verifyAuth() → VerifiedSession
verifyRole(role) → VerifiedSession
getNextSequence(counterId) → number
generateLeadId() → string
createAuditLog(userId, action, leadId?, details?) → void
checkOptimisticLock(current, expected) → void | throws
handlePrismaError(error) → never
```

### Audit Actions
```typescript
LEAD_CREATED, LEAD_UPDATED, LEAD_ASSIGNED, LEAD_STATUS_UPDATED
ASSESSMENT_CREATED, ASSESSMENT_UPDATED, ASSESSMENT_SUBMITTED
ASSESSMENT_APPROVED, ASSESSMENT_REJECTED
DOCUMENT_UPLOADED, DOCUMENT_DELETED
```

---

## Migration Script

Run after pushing schema changes:

```typescript
// scripts/init-counters.ts
import prisma from "@/lib/prisma"

async function initializeCounters() {
  // Get all leads grouped by year
  const leads = await prisma.lead.findMany({
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  const yearCounts = new Map<number, number>()

  for (const lead of leads) {
    const year = lead.createdAt.getFullYear()
    yearCounts.set(year, (yearCounts.get(year) || 0) + 1)
  }

  // Create counters
  for (const [year, count] of yearCounts.entries()) {
    await prisma.counter.upsert({
      where: { id: `lead-${year}` },
      create: { id: `lead-${year}`, value: count },
      update: { value: count },
    })
  }

  console.log("Initialized counters:", Object.fromEntries(yearCounts))
}

initializeCounters().catch(console.error)
```

---

## Summary

✅ **Fixed 4 critical P0 issues**:
1. Race condition in lead ID generation (atomic counters)
2. No concurrency control (optimistic locking)
3. Generic error messages (structured error codes)
4. Missing user.isActive checks (DAL verification)

✅ **Created 3 new core modules**:
- lib/errors.ts (error handling)
- lib/dal.ts (data access layer)
- BACKEND_REFACTOR_SUMMARY.md (this document)

✅ **Updated 4 existing files**:
- prisma/schema.prisma (isActive, Counter model)
- lib/types.ts (ActionResponse with error codes)
- actions/lead.ts (complete refactor)
- CLAUDE.md (backend patterns documentation)

⚠️ **Breaking changes require frontend updates**:
- Add `expectedUpdatedAt` parameter to update/assign calls
- Handle CONCURRENT_MODIFICATION errors
- Display error codes for better UX

🚀 **Ready for assessment workflow implementation**
- All P0 backend issues fixed
- Solid foundation for concurrent operations
- Proper error handling and audit trail
- No more race conditions or lost updates
