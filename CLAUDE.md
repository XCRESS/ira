# IRA Platform - Context

**IPO Readiness Assessment Score Calculator**

Internal tool for 5 users (Rashmi, Rahul, Jaydeep, Piyush, Veshant) to score client companies on 57 questions.

---

## What It Does

- 57 questions (Company: 30, Financial: 7, Sector: 20)
- Scoring: Yes=2, Maybe=1, No=-1, NA=0
- Rating: >65% IPO Ready, 45-65% Needs Improvement, <45% Not Ready
- Workflow: Create → Fetch Probe Data → Upload Docs → Score → Review → Report

---

## Tech Stack

```json
{
  "next": "16.0.0",              // Turbopack enabled
  "react": "19.2.0",
  "typescript": "^5",
  "tailwindcss": "^4",           // Oxide engine
  "next-themes": "^0.4.6"        // Theme management
}
```

**Installed**:
- `better-auth` - Authentication (Google OAuth)
- `@prisma/client` + `prisma` - Database ORM
- `zod` - Schema validation (already in Next.js)

**To Add Later**:
- `@vercel/postgres` - Postgres connection
- `react-hook-form` - Form management
- `@tremor/react` - Dashboard UI components

---

## Design System

**Glassmorphism** with 9 themes (OKLCH colors):
1. Light
2. Catppuccin Mocha (default)
3. Gruvbox Dark
4. Nord
5. Rosé Pine Moon
6. Tokyo Night Storm
7. Dracula
8. One Dark
9. Everforest Dark

**Classes**:
- `.glass` - Standard frosted glass
- `.glass-strong` - More opaque
- `.glass-subtle` - Very subtle

**Colors** (use in components):
- `bg-primary`, `text-primary-foreground`
- `bg-background`, `text-foreground`
- `bg-success`, `bg-warning`, `bg-danger`

---

## Database Schema (Prisma)

**Authentication (Better Auth tables)**:
- User - Auth user with role (ASSESSOR | REVIEWER)
- Session - Active sessions
- Account - OAuth accounts (Google)
- Verification - Email verification tokens

**Application tables** (from API_CONTRACTS.md):
- Lead - Client companies with status tracking
- Document - Uploaded files per lead
- Assessment - Eligibility + Main questions with scoring
- Question - Dynamic questionnaire (ELIGIBILITY | COMPANY | FINANCIAL | SECTOR)
- AuditLog - Activity tracking

See [API_CONTRACTS.md](./API_CONTRACTS.md) for complete entity definitions.

---

## Architecture Rules

**DO**:
- ✅ Server Components by default
- ✅ Server Actions for mutations
- ✅ `'use client'` only for interactivity
- ✅ Parallel fetching: `Promise.all()`
- ✅ TypeScript + Zod validation

**DON'T**:
- ❌ Experimental React features
- ❌ Global state libraries (use server state)
- ❌ API routes (use Server Actions)

---

## Design System

**⚠️ CRITICAL: Follow [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for ALL UI/UX decisions**

Key principles:
- **Spacing**: Use scale (2, 4, 6, 8, 12) - default to `space-y-6`
- **Card padding**: Use p-4 (compact), p-6 (standard), p-8 (forms)
- **Typography**: No page h1 when breadcrumb exists
- **Colors**: Use semantic (bg-primary, text-foreground/70) NOT raw colors
- **Glass effect**: 65% opacity, 20px blur - never nest glass
- **Consistency**: Check similar components before creating new patterns

Read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) before implementing ANY UI components.

---

## File Structure

```
app/
  globals.css          # All theme definitions
  layout.tsx           # ThemeProvider
  page.tsx             # Demo page
  (auth)/login/
  dashboard/
  assessment/[id]/
  settings/

components/
  ui/                  # shadcn/ui
  theme-switcher.tsx

lib/
  prisma.ts
  auth.ts              # Better Auth server config
  auth-client.ts       # Better Auth client hooks
  scoring.ts
  theme-provider.tsx

actions/
  assessment.ts

proxy.ts               # Route protection (Next.js 16)
```

---

## Key Code Patterns

### Server Component
```tsx
export default async function Page({ params }) {
  const data = await prisma.assessment.findUnique({ where: { id: params.id } });
  return <View data={data} />;
}
```

### Server Action
```tsx
'use server';
async function submitAssessment(formData: FormData) {
  await prisma.assessment.create({ data: { /* ... */ } });
  revalidatePath('/assessments');
}
```

### Client Component
```tsx
'use client';
export function Form() {
  const [answers, setAnswers] = useState({});
  return <form>...</form>;
}
```

### Theme Usage
```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
setTheme('catppuccin-mocha');
```

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="your-32-char-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Probe42 API
PROBE_API_KEY="..."
PROBE_API_URL="https://probe42.in/api"
```

---

## Commands

```bash
pnpm dev                    # Start dev
npx prisma generate         # Generate client
npx prisma db push          # Push schema
npx shadcn@latest add form  # Add components
```

---

## Current Status

**✅ Completed**:
- Next.js 16 + React 19 + Tailwind 4 setup
- 9 glassmorphism themes with theme switcher
- Better Auth v1.3.33 with Google OAuth **[COMPLETE]**
- Prisma 6.18.0 with PostgreSQL (Neon) **[COMPLETE]**
- Database schema with auth tables (User, Session, Account, Verification) **[COMPLETE]**
- Role-based access control (ASSESSOR | REVIEWER) **[COMPLETE]**
- Login page with Google OAuth **[COMPLETE]**
- Protected dashboard **[COMPLETE]**
- Middleware route protection **[COMPLETE]**
- Email whitelist (4 users) **[COMPLETE]**

**📋 Next Steps**:
1. Update allowed users in `lib/auth.ts` with real emails
2. Test authentication flow (`pnpm dev` → `http://localhost:3000/login`)
3. Build Lead management (create/list/assign)
4. Build Assessment workflow (eligibility → main questions)
5. Integrate Probe42 API
6. Build Document upload system
7. Build role-specific dashboards (Assessor vs Reviewer)
8. Build report generation

**📚 Documentation**:
- [SETUP.md](./SETUP.md) - Complete setup guide
- [AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md) - Auth implementation details
- [NEXT_STEPS.md](./NEXT_STEPS.md) - What to do next
- [PRISMA_ENV_FIX.md](./PRISMA_ENV_FIX.md) - Prisma .env loading fix
- [better-auth.md](./better-auth.md) - Comprehensive Better Auth docs
- [API_CONTRACTS.md](./API_CONTRACTS.md) - API contracts (updated with auth)

**⚠️ Important Notes**:
- Database: Neon PostgreSQL (already connected)
- Auth: Google OAuth only (no email/password)
- Allowed users: Whitelist enforced in `lib/auth.ts`

---

## Critical Implementation Details

### Better Auth User Validation (⚠️ IMPORTANT)

**Use `databaseHooks.user.create.before` for user whitelist validation:**

```typescript
// lib/auth.ts
export const auth = betterAuth({
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const allowedUser = ALLOWED_USERS.find((u) => u.email === user.email)
          if (!allowedUser) {
            throw new Error("Access denied")
          }
          return { data: { ...user, role: allowedUser.role } }
        }
      }
    }
  }
})
```

**Why NOT `hooks.after`:**
- `hooks.after` with `matcher`/`handler` is NOT the correct API
- `databaseHooks` runs BEFORE user creation (prevents invalid users in DB)
- No need to delete users after creation
- Cleaner error handling

### Next.js 16 Proxy (⚠️ IMPORTANT)

**Use `proxy.ts` with default export:**

```typescript
// proxy.ts (NOT middleware.ts)
export default async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token")?.value
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}
```

**Why cookie check instead of `auth.api.getSession()`:**
- Fast cookie check (no DB query on every request)
- Middleware renamed to `proxy` in Next.js 16
- Must use `export default async function proxy`

### Prisma Schema for Better Auth

**Account model must include:**
```prisma
model Account {
  accessTokenExpiresAt  DateTime?  // Required by Better Auth
  refreshTokenExpiresAt DateTime?  // Required by Better Auth
  scope                 String?    // Required by Better Auth
  // ... other fields
}
```

**After schema changes:**
```bash
npx prisma db push      # Update database
npx prisma generate     # Regenerate client
```

---

## Scoring Logic and Questions
Will be added later by finance team based on questionnaire. Questions will be dynamically managed via database.

---
