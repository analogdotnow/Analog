# Debugging Auth-Based Cloudflare Workers 1101 Error

## Problem Description
The 1101 error is likely caused by authentication issues rather than timing issues. The auth flow can hang due to various problems in the authentication chain.

## Root Causes Identified

### 1. **Missing BETTER_AUTH_SECRET**
- The auth secret is required for session encryption/decryption
- If missing or invalid, auth operations can hang indefinitely
- Must be at least 32 characters long

### 2. **BETTER_AUTH_URL Configuration Issues**
- Circular redirects can cause infinite loops
- Wrong domain configuration can cause auth to hang
- Should point to your actual domain, not cause redirects

### 3. **Token Refresh Hanging**
- OAuth access tokens expire and need refresh
- Token refresh can hang if OAuth provider is slow/unresponsive
- Multiple token refreshes happening simultaneously

### 4. **Database Connection Issues**
- Auth system makes database calls for session validation
- Slow database connections can cause auth to hang
- Connection pool exhaustion

### 5. **Session Cookie Issues**
- Session cookies not properly set/accessible
- Cookie domain/path configuration problems
- Cookie encryption/decryption failures

## Solutions Implemented

### 1. **Required BETTER_AUTH_SECRET**
```typescript
// packages/env/src/server.ts
BETTER_AUTH_SECRET: z.string().min(32), // Now required
```

### 2. **Timeout Protection on Auth Operations**
```typescript
// apps/web/src/app/calendar/page.tsx
const session = await withTimeout(
  auth.api.getSession({ headers: await headers() }),
  10000 // 10 second timeout
);
```

### 3. **Graceful Error Handling**
```typescript
// packages/api/src/trpc.ts
try {
  const session = await Promise.race([...]);
} catch (error) {
  // Return context without session instead of hanging
  return { db, session: null, user: null, ...opts };
}
```

### 4. **Token Refresh Error Handling**
```typescript
// packages/api/src/utils/accounts.ts
try {
  const { accessToken } = await Promise.race([...]);
} catch (error) {
  // Use existing token instead of failing completely
  return { ...account, accessToken: account.accessToken };
}
```

## Debugging Steps

### 1. **Check Auth Debug Page**
Visit `/auth-debug` to see:
- Authentication session status
- Environment variables
- Database connectivity
- Request duration

### 2. **Monitor Cloudflare Workers Logs**
```bash
wrangler tail analog-calendar --format=pretty
```

Look for these patterns:
- `[calendar/page]` - Calendar page auth
- `[createTRPCContext]` - TRPC auth context
- `[getAccounts]` - Account token refresh
- `auth.api.getSession` - Session validation
- `auth.api.getAccessToken` - Token refresh

### 3. **Check Environment Variables**
Ensure these are set correctly:
```bash
BETTER_AUTH_SECRET=your-32-char-secret
BETTER_AUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 4. **Test Authentication Flow**
1. Sign out completely
2. Clear browser cookies
3. Sign in again
4. Check if the issue persists

## Common Auth Issues and Fixes

### 1. **Missing BETTER_AUTH_SECRET**
**Symptoms:** Auth operations hang, no error messages
**Fix:** Set a 32+ character secret in environment variables

### 2. **Invalid BETTER_AUTH_URL**
**Symptoms:** Circular redirects, auth hanging
**Fix:** Ensure URL points to your actual domain

### 3. **Expired OAuth Tokens**
**Symptoms:** Token refresh hanging, 401 errors
**Fix:** Re-authenticate with OAuth provider

### 4. **Database Connection Issues**
**Symptoms:** Auth operations timeout
**Fix:** Check database connectivity and connection pool

### 5. **Session Cookie Problems**
**Symptoms:** Session not persisting, constant redirects
**Fix:** Check cookie domain/path configuration

## Testing the Fix

### 1. **Deploy Changes**
```bash
npm run deploy
```

### 2. **Test Scenarios**
- Fresh sign-in after clearing cookies
- Access calendar page directly
- Test with multiple OAuth accounts
- Check auth debug page

### 3. **Monitor Performance**
- Check request durations in browser dev tools
- Monitor Cloudflare Workers logs
- Verify no 1101 errors occur

## Emergency Fixes

### 1. **Temporary Auth Bypass**
If auth is completely broken, you can temporarily bypass it:
```typescript
// In calendar page
return (
  <div className="flex h-[calc(100dvh-1rem)]">
    <CalendarView className="grow" />
  </div>
);
```

### 2. **Force Re-authentication**
Clear all auth data and force users to sign in again:
```typescript
// Clear session cookies
document.cookie = "auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
```

### 3. **Database Connection Check**
Test database connectivity directly:
```typescript
const { db } = await import("@repo/db");
const result = await db.select().from(db.query.user).limit(1);
```

## Prevention

### 1. **Environment Validation**
Add validation to ensure all required env vars are set:
```typescript
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is required");
}
```

### 2. **Health Checks**
Implement health checks for auth system:
```typescript
// /api/health/auth
export async function GET() {
  try {
    await auth.api.getSession({ headers: new Headers() });
    return Response.json({ status: "healthy" });
  } catch (error) {
    return Response.json({ status: "unhealthy", error: error.message });
  }
}
```

### 3. **Monitoring**
Set up alerts for auth failures and 1101 errors.

## Contact Information

For additional support:
- Check Better Auth documentation
- Review OAuth provider status
- Monitor database performance
- Check Cloudflare Workers status 