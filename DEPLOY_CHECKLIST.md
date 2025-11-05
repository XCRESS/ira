# Production Deployment Checklist

## ✅ Quick Setup for irascore.com

### 1️⃣ Google Cloud Console
- [ ] Add `https://irascore.com` to Authorized JavaScript origins
- [ ] Add `https://www.irascore.com` to Authorized JavaScript origins
- [ ] Add `https://irascore.com/api/auth/callback/google` to Authorized redirect URIs
- [ ] Add `https://www.irascore.com/api/auth/callback/google` to Authorized redirect URIs

### 2️⃣ Environment Variables (Set in hosting platform)
```bash
DATABASE_URL="postgresql://..."              # Neon PostgreSQL URL
BETTER_AUTH_SECRET="32-char-random-string"  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="https://irascore.com"      # ⚠️ NO trailing slash!
GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."
NEXT_PUBLIC_BETTER_AUTH_URL="https://irascore.com"  # ⚠️ Must match BETTER_AUTH_URL
```

### 3️⃣ Database Migration
```bash
npx prisma db push      # Push schema to production DB
npx prisma generate     # Generate Prisma Client
```

### 4️⃣ Deploy
**Vercel**:
```bash
vercel --prod
```

**Other platforms**: Push to connected git branch or use platform CLI

### 5️⃣ Verify
- [ ] Visit `https://irascore.com/login`
- [ ] Test Google OAuth login
- [ ] Check dashboard loads: `https://irascore.com/dashboard`
- [ ] Verify session persists after refresh

---

## 🔧 What Changed for Production

1. **[lib/auth.ts](lib/auth.ts)**:
   - Added `trustedOrigins` for CORS support
   - Supports `irascore.com`, `www.irascore.com`, and `localhost:3000`

2. **[next.config.ts](next.config.ts)**:
   - Added security headers
   - Package import optimizations

3. **New Files**:
   - `.env.example` - Environment variable template
   - `PRODUCTION_DEPLOY.md` - Full deployment guide
   - This checklist

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Redirect URI mismatch" | Verify Google OAuth redirect URIs match exactly (no trailing slash) |
| CORS errors | Check `trustedOrigins` in [lib/auth.ts](lib/auth.ts:26-30) |
| Constant logouts | Ensure `BETTER_AUTH_URL` === `NEXT_PUBLIC_BETTER_AUTH_URL` |
| Database errors | Verify `DATABASE_URL` and IP whitelist on Neon |

---

## 📝 Notes

- Only emails in [lib/auth.ts](lib/auth.ts:6-13) can access the platform
- Session expires after 7 days of inactivity
- Production URLs are hardcoded in `trustedOrigins` (edit [lib/auth.ts](lib/auth.ts:26-30) to add more domains)
