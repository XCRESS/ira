# Troubleshooting Guide - IRA Platform

This guide documents common issues and their solutions discovered during the IRA Platform development.

---

## Critical Fixes Applied (2025-10-28)

### 1. Better Auth Hook API Error

**Error**: `TypeError: hook.handler is not a function`

**Root Cause**: Used incorrect hooks API (`hooks.after` with `matcher`/`handler`)

**Solution**: Use `databaseHooks.user.create.before` instead

```typescript
// ❌ WRONG - This API doesn't exist in Better Auth v1.3.33
hooks: {
  after: [{
    matcher: (context) => context.path === "/sign-up/social",
    handler: async (ctx) => { /* ... */ }
  }]
}

// ✅ CORRECT - Use databaseHooks
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
```

**Files Fixed**: [lib/auth.ts](./lib/auth.ts:55-84)

---

### 2. Next.js 16 Proxy Convention

**Error**: `The Proxy file "/proxy" must export a function named proxy`

**Root Cause**: Next.js 16 renamed `middleware.ts` to `proxy.ts` and requires default export

**Solution**:

```typescript
// ❌ WRONG (middleware.ts with named export)
export async function middleware(request: NextRequest) {
  // ...
}

// ✅ CORRECT (proxy.ts with default export)
export default async function proxy(request: NextRequest) {
  // ...
}
```

**Files Fixed**: [proxy.ts](./proxy.ts:3) (renamed from middleware.ts)

---

### 3. Prisma Schema - Missing Better Auth Fields

**Error**: `Unknown argument 'accessTokenExpiresAt'` and `Unknown argument 'token'`

**Root Cause**: Prisma schema missing required fields for Better Auth

**Solution**: Updated Account and Session models

```prisma
model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique  // ✅ ADDED - Required by Better Auth
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?   @db.Text
  refreshToken          String?   @db.Text
  idToken               String?   @db.Text
  accessTokenExpiresAt  DateTime?  // ✅ ADDED - Required by Better Auth
  refreshTokenExpiresAt DateTime?  // ✅ ADDED - Required by Better Auth
  scope                 String?    // ✅ ADDED - Required by Better Auth
  expiresAt             DateTime?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}
```

**Files Fixed**: [prisma/schema.prisma](./prisma/schema.prisma)

**Commands Run**:
```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

---

## Common Authentication Issues

### Google OAuth Access Denied

**Symptoms**:
- User email is whitelisted in `ALLOWED_USERS`
- Still gets "Access denied" error

**Diagnostic Steps**:

1. **Verify email exact match**:
   ```typescript
   // Check lib/auth.ts
   const ALLOWED_USERS = [
     { email: "user@cosmosfin.com", role: "ASSESSOR" },
     // Email must match EXACTLY (case-sensitive)
   ]
   ```

2. **Check database**:
   ```bash
   npx prisma studio
   # Look at User table - is the user there with wrong role?
   # If yes, delete and retry
   ```

3. **Restart server after whitelist changes**:
   ```bash
   # Stop server (Ctrl+C)
   pnpm dev
   ```

---

### Session Not Persisting

**Symptoms**:
- User logs in successfully
- Immediately redirected back to login
- Cookie not being set

**Solutions**:

1. **Check proxy.ts allows /api/auth routes**:
   ```typescript
   const publicRoutes = ["/", "/login", "/api/auth"]
   const isPublicRoute = publicRoutes.some((route) =>
     pathname === route || pathname.startsWith("/api/auth")  // Important!
   )
   ```

2. **Verify BETTER_AUTH_URL matches**:
   ```bash
   # In .env
   BETTER_AUTH_URL="http://localhost:3000"  # No trailing slash!
   ```

3. **Clear browser cookies**:
   - DevTools → Application → Cookies → Delete all for localhost

---

## Database Issues

### Prisma Client Out of Sync

**Error**: `Unknown argument` or field not found errors

**Solution**:

```bash
# Stop dev server first (Ctrl+C)
npx prisma db push
npx prisma generate
pnpm dev
```

**Why this happens**:
- Schema updated but client not regenerated
- Better Auth expects specific field names
- Database schema doesn't match Prisma schema

---

### Connection Timeout

**Error**: `Can't reach database server`

**Solutions**:

1. **Check DATABASE_URL format**:
   ```bash
   # Use connection pooler
   DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech:5432/db"
   ```

2. **Test connection**:
   ```bash
   npx prisma db push
   ```

3. **Check Neon dashboard**:
   - Database not paused
   - Connection pooler enabled

---

## Development Server Issues

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

### EPERM During Prisma Generate

**Error**: `EPERM: operation not permitted`

**Cause**: Dev server is using Prisma client

**Solution**:

```bash
# Stop dev server (Ctrl+C)
npx prisma generate
pnpm dev
```

**Note**: `npx prisma db push` works while server is running

---

## Quick Diagnostic Checklist

When authentication isn't working:

```bash
# 1. Check environment variables
cat .env

# Required:
# DATABASE_URL="postgresql://..."
# BETTER_AUTH_SECRET="32+ chars"
# BETTER_AUTH_URL="http://localhost:3000"
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."

# 2. Verify Prisma schema is correct
cat prisma/schema.prisma
# Session model must have: token String @unique
# Account model must have: accessTokenExpiresAt, refreshTokenExpiresAt, scope

# 3. Regenerate Prisma client
npx prisma generate

# 4. Check auth configuration
cat lib/auth.ts
# Must use databaseHooks.user.create.before
# NOT hooks.after with matcher/handler

# 5. Verify proxy.ts
cat proxy.ts
# Must be: export default async function proxy
# Must allow: /api/auth routes

# 6. Restart server
pnpm dev
```

---

## Prevention Checklist

### Before Modifying Auth:
- [ ] Use `databaseHooks.user.create.before` for validation
- [ ] Never use `hooks.after` with matcher/handler
- [ ] Test with whitelisted email first

### Before Changing Prisma Schema:
- [ ] Stop dev server
- [ ] Run `npx prisma db push`
- [ ] Run `npx prisma generate`
- [ ] Restart server
- [ ] Test authentication flow

### Before Deploying:
- [ ] All whitelisted emails verified
- [ ] Google OAuth redirect URIs correct
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Full auth flow tested

---

## Reference Documentation

- [AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md) - Complete auth setup
- [CLAUDE.md](./CLAUDE.md) - Project context and critical patterns
- [SETUP.md](./SETUP.md) - Initial setup guide
- [Better Auth Docs](https://better-auth.com/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)

---

## Version Information

- **Better Auth**: v1.3.33
- **Next.js**: 16.0.0
- **Prisma**: 6.18.0
- **PostgreSQL**: Neon (connection pooler)

---

**Last Updated**: 2025-10-28
**Maintained By**: IRA Platform Team