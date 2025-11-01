# IRA Platform - Context

**IPO Readiness Assessment Score Calculator**

Internal tool for 5 users to score client companies on 57 questions.

---

## What It Does

- 57 questions (Company: 30, Financial: 7, Sector: 20)
- Scoring: Yes=2, Maybe=1, No=-1, NA=0
- Rating: >65% IPO Ready, 45-65% Needs Improvement, <45% Not Ready
- Workflow: Create Lead → Assign Assessor → Score → Review → Report

---

## Tech Stack

```
Next.js 16 (Turbopack) + React 19 + TypeScript + Tailwind 4 (Oxide)
Better Auth (Google OAuth) + Prisma (PostgreSQL/Neon)
```

---

## UI Rules

**⚠️ READ [UI_RULES.md](./UI_RULES.md) BEFORE IMPLEMENTING ANY UI**

**Mobile-first PWA** (breakpoint: 768px):
- Mobile: Bottom nav (4 tabs), cards, sheets, p-4, 44px touch targets
- Desktop: Sidebar, tables, modals, p-6
- Spacing: 2/4/6/8/12 only
- Colors: Semantic only (`bg-primary`, NOT `bg-blue-500`)
- Glass: Never nest
- Typography: No h1 if breadcrumb exists

---

## Architecture

**DO**:
- ✅ Server Components by default
- ✅ Server Actions for mutations (no API routes)
- ✅ `'use client'` only when needed (forms, interactivity)
- ✅ TypeScript + Zod validation

**DON'T**:
- ❌ Global state libraries
- ❌ Experimental React features
- ❌ Nested `.glass` effects

---

## Database Schema

**Auth**: User (role: ASSESSOR | REVIEWER), Session, Account, Verification
**App**: Lead, Assessment, Question, Document, AuditLog

See [API_CONTRACTS.md](./API_CONTRACTS.md) for details.

---

## Backend Patterns

### Server Actions - Core Rules
- **DAL First**: Every action MUST call `verifyAuth()` or `verifyRole()` before ANY db query
- **Input Validation**: Zod schema parse at entry point, throw on validation errors
- **Error Types**: Use `Errors.*` helpers, not generic messages (`LEAD_NOT_FOUND`, `CONCURRENT_MODIFICATION`)
- **Transactions**: Multi-step mutations MUST use `prisma.$transaction()`
- **Revalidation**: ALWAYS `revalidatePath()` after mutations
- **Optimistic Locking**: Pass `expectedUpdatedAt` for update/assign operations, use `checkOptimisticLock()`

### Data Integrity
- **Atomic Sequences**: Use `getNextSequence()` from DAL, NOT count-based logic
- **Unique Constraints**: Rely on DB-level unique constraints (cin, email)
- **Cascading Deletes**: Explicit `onDelete: Cascade` in schema
- **isActive Check**: All user lookups verify `isActive: true`

### Error Handling Pattern
```typescript
try {
  const session = await verifyAuth()
  // ... business logic
  return { success: true, data }
} catch (error) {
  return handleActionError(handlePrismaError(error))
}
```

### Audit & Observability
- **Audit Trail**: Use `createAuditLog(userId, action, leadId, details)` for all mutations
- **Structured Details**: Log OLD and NEW values in audit details
- **Error Context**: AppError includes code + context for debugging

---

## Critical Patterns

### Better Auth - User Whitelist
```typescript
// lib/auth.ts - Use databaseHooks.user.create.before
export const auth = betterAuth({
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const allowedUser = ALLOWED_USERS.find((u) => u.email === user.email)
          if (!allowedUser) throw new Error("Access denied")
          return { data: { ...user, role: allowedUser.role } }
        }
      }
    }
  }
})
```

### Next.js 16 Proxy (NOT middleware)
```typescript
// proxy.ts - Fast cookie check, no DB query
export default async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token")?.value
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}
```

### Code Patterns
```tsx
// Server Component (default)
export default async function Page({ params }) {
  const data = await prisma.lead.findUnique({ where: { id: params.id } })
  return <View data={data} />
}

// Server Action
'use server'
async function createLead(formData: FormData) {
  await prisma.lead.create({ data: { /* ... */ } })
  revalidatePath('/dashboard/leads')
}

// Client Component (only when needed)
'use client'
export function Form() {
  const [state, setState] = useState()
  return <form>...</form>
}
```

---

## Commands

```bash
pnpm dev                    # Start dev server
npx prisma db push          # Update database schema
npx prisma generate         # Regenerate Prisma client
```

---

## Current Status

**✅ Complete**:
- Auth system (Google OAuth, role-based access, email whitelist)
- Dashboard layout (header, sidebar, breadcrumbs)
- Lead management (create, list, detail, assign)
- Theme system (9 glassmorphism themes)
- Design system documentation

**📋 Next**:
1. Assessment workflow (eligibility → main questions → scoring)
2. Document upload system
3. Probe42 API integration
4. Report generation

---

## Environment Variables

check .env file for them

---

## Documentation

- [UI_RULES.md](./UI_RULES.md) - UI patterns (READ FIRST)
- [API_CONTRACTS.md](./API_CONTRACTS.md) - Database schema

---