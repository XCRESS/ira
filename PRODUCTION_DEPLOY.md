# Production Deployment Guide - irascore.com

## Pre-Deployment Checklist

### 1. Google OAuth Configuration

Update your Google Cloud Console OAuth app with production URLs:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add **Authorized JavaScript origins**:
   - `https://irascore.com`
   - `https://www.irascore.com`
4. Add **Authorized redirect URIs**:
   - `https://irascore.com/api/auth/callback/google`
   - `https://www.irascore.com/api/auth/callback/google`

### 2. Environment Variables

Set these environment variables in your production environment (Vercel, Netlify, etc.):

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="your-secure-32-char-secret"
BETTER_AUTH_URL="https://irascore.com"

# Google OAuth
GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."

# Client-side (must match BETTER_AUTH_URL)
NEXT_PUBLIC_BETTER_AUTH_URL="https://irascore.com"
```

**IMPORTANT**: `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` MUST match your production domain (no trailing slash).

### 3. Database Setup

Ensure your production database schema is up to date:

```bash
# Push schema to production database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 4. Domain Configuration

The app now supports:
- `https://irascore.com` (primary)
- `https://www.irascore.com` (alternative)
- `http://localhost:3000` (development)

All are whitelisted in `trustedOrigins` in [lib/auth.ts](lib/auth.ts:26-30).

## Deployment Steps

### Vercel (Recommended)

1. **Connect Repository**:
   ```bash
   vercel
   ```

2. **Set Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Use production values

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Other Platforms

For other platforms (Netlify, Railway, etc.):
- Set environment variables in platform dashboard
- Ensure build command: `npm run build`
- Ensure start command: `npm run start`
- Set Node.js version: `20.x` or higher

## Post-Deployment Verification

1. **Test OAuth Flow**:
   - Visit `https://irascore.com/login`
   - Click "Sign in with Google"
   - Verify redirect works
   - Check user is created in database

2. **Test Protected Routes**:
   - Visit `https://irascore.com/dashboard`
   - Should redirect to login if not authenticated
   - Should load dashboard if authenticated

3. **Check Session Persistence**:
   - Login
   - Refresh page
   - Should remain logged in

## Troubleshooting

### "Redirect URI mismatch" Error

**Fix**: Ensure Google OAuth redirect URI matches exactly:
- ✅ `https://irascore.com/api/auth/callback/google`
- ❌ `https://irascore.com/api/auth/callback/google/`

### CORS Errors

**Fix**: Verify `trustedOrigins` in [lib/auth.ts](lib/auth.ts:26-30) includes your domain.

### "Invalid session" or constant logouts

**Fix**: Ensure `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` match exactly (no http/https mismatch).

### Database Connection Errors

**Fix**:
1. Verify `DATABASE_URL` is correct
2. Ensure database allows connections from your hosting provider's IP range
3. For Neon, check project is active and not suspended

## Security Notes

- `BETTER_AUTH_SECRET` should be 32+ characters, cryptographically random
- Never commit `.env` files to version control
- Rotate secrets periodically
- Only whitelisted emails in [lib/auth.ts](lib/auth.ts:6-13) can access the platform

## Domain Changes

If you need to add more domains (e.g., `app.irascore.com`):

1. Update `trustedOrigins` in [lib/auth.ts](lib/auth.ts:26-30)
2. Add redirect URI to Google OAuth app
3. Update environment variables if needed
