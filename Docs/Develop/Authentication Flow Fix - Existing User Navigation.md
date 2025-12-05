# Authentication Flow Fix - Existing User Navigation

**Date**: 2025-11-03
**Issue**: Authentication flow incorrectly redirecting users with existing profiles to avatar creation
**Status**: ✅ Fixed

## Problem Description

When a user with an existing profile logged in, they were always being redirected to the avatar creation page (`/avatar-creation`), even if they already had an avatar. This caused poor UX as returning users should go directly to the try-on page.

### Root Causes

1. **Type Mismatch**: The `AuthUser` interface didn't include `name` and `email` fields, even though the backend returns them when `hasProfile: true`
2. **Missing Avatar Check**: The authentication flow wasn't checking if the user had an avatar before setting navigation
3. **Hardcoded `hasAvatar`**: The `useAuthFlow` hook was hardcoding `hasAvatar: false` for all users
4. **Incorrect Routing Logic**: `AuthPage` was always navigating to `/avatar-creation` for existing users

### Backend Response Example

When a user with an existing profile verifies their code:

```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLC...",
    "expiresIn": 3600,
    "hasProfile": true,
    "user": {
      "id": "309460",
      "phone": "+34648880714",
      "name": "Santiago ",
      "email": "",
      "createdAt": "2025-06-25T15:59:00.000000Z"
    }
  },
  "message": "Autenticación exitosa"
}
```

**Key observations**:
- When `hasProfile: true`, the `user` object includes `name` and `email`
- The response doesn't include avatar information directly

## Solution Implemented

### 1. Updated Type Definitions

**File**: `src/types/user.ts:23-29`

```typescript
/**
 * Basic user info from auth response (Phase 1 - Backend API Spec)
 * When hasProfile is true, name and email will be populated
 */
export interface AuthUser {
  id: string;
  phone: string;
  name?: string;      // NEW: Optional, populated when hasProfile is true
  email?: string;     // NEW: Optional, populated when hasProfile is true
  createdAt: string;
}
```

### 2. Enhanced Authentication Flow

**File**: `src/hooks/useAuthFlow.ts:156-207`

Added avatar check after successful code verification:

```typescript
// Map AuthUser data - when hasProfile is true, name and email are included
const userName = response.data.user.name || null;
const userEmail = response.data.user.email || null;

// Check if user has avatar by calling getAvatar endpoint
let hasAvatar = false;
try {
  const avatar = await getAvatar();
  hasAvatar = !!avatar.imageUrl;
  console.log('[useAuthFlow] Avatar check:', { hasAvatar, avatarUrl: avatar.imageUrl });
} catch (err) {
  // If avatar endpoint returns 404, user doesn't have avatar yet
  console.log('[useAuthFlow] No avatar found for user');
  hasAvatar = false;
}

// Convert AuthUser to UserProfile with correct data
const userProfile = {
  id: response.data.user.id,
  phone: response.data.user.phone,
  createdAt: response.data.user.createdAt,
  name: userName,
  email: userEmail,
  hasAvatar,  // Now correctly reflects actual avatar status
};
```

### 3. Improved Navigation Logic

**File**: `src/pages/AuthPage.tsx:43-57`

Updated `useEffect` to handle navigation for both new and returning users:

```typescript
useEffect(() => {
  if (!isLoading && isAuthenticated && user) {
    // If user has avatar, go to try-on page
    // Otherwise, go to avatar creation
    if (user.hasAvatar) {
      console.log('[AuthPage] Redirecting to try-on (user has avatar)');
      navigate('/try-on', { replace: true });
    } else if (currentStep !== 'registration') {
      // Only auto-redirect to avatar creation if not in registration step
      console.log('[AuthPage] Redirecting to avatar creation (user has no avatar)');
      navigate('/avatar-creation', { replace: true });
    }
  }
}, [isAuthenticated, isLoading, user, navigate, currentStep]);
```

## User Flow After Fix

### Scenario 1: New User (No Profile)
1. Enter phone → Verify code
2. `hasProfile: false` → Show registration form
3. Complete registration → Navigate to `/avatar-creation`
4. Create avatar → Navigate to `/try-on`

### Scenario 2: Existing User Without Avatar
1. Enter phone → Verify code
2. `hasProfile: true`, `hasAvatar: false`
3. ✅ Navigate directly to `/avatar-creation`

### Scenario 3: Existing User With Avatar
1. Enter phone → Verify code
2. `hasProfile: true`, `hasAvatar: true`
3. ✅ Navigate directly to `/try-on` (FIXED!)

## API Calls During Authentication

```
POST /auth/send-code
  → Send SMS verification code

POST /auth/verify-code
  → Returns: token, hasProfile, user (with name/email if hasProfile=true)

GET /avatar
  → Returns: avatar data if exists, or 404 if not found
  → Used to determine hasAvatar flag
```

## Additional Fix: Endpoint Typo

**File**: `.env.development:22`

Fixed typo in try-on generation endpoint:
- **Before**: `VITE_ENDPOINT_TRYON_GENERATE=/tryons/generat` ❌
- **After**: `VITE_ENDPOINT_TRYON_GENERATE=/tryons/generate` ✅

Also fixed in documentation file:
- `docs/Develop/Share Functionality Implementation.md:245`

## Testing Checklist

- [x] Type check passed: ✅ `npm run type-check`
- [x] Build successful: ✅ `npm run build`
- [ ] Manual testing required:
  - [ ] New user flow (no profile)
  - [ ] Existing user without avatar
  - [ ] Existing user with avatar (should go directly to /try-on)
  - [ ] Avatar endpoint returns 404 for new users
  - [ ] Avatar endpoint returns data for users with avatars
  - [ ] Console logs show correct navigation decisions

## Files Modified

1. `src/types/user.ts` - Added `name` and `email` to `AuthUser`
2. `src/hooks/useAuthFlow.ts` - Added avatar check and proper data mapping
3. `src/pages/AuthPage.tsx` - Improved navigation logic
4. `.env.development` - Fixed endpoint typo
5. `docs/Develop/Share Functionality Implementation.md` - Fixed endpoint typo

## Console Logging

The following logs help debug the flow:

```
[useAuthFlow] Avatar check: { hasAvatar: true, avatarUrl: '...' }
[useAuthFlow] Authentication successful: { hasProfile: true, needsRegistration: false, hasAvatar: true, ... }
[AuthPage] Redirecting to try-on (user has avatar)
```

Or for users without avatars:

```
[useAuthFlow] No avatar found for user (expected for new users)
[useAuthFlow] Authentication successful: { hasProfile: true, needsRegistration: false, hasAvatar: false, ... }
[AuthPage] Redirecting to avatar creation (user has no avatar)
```

## Notes

- The avatar check is done with a try/catch because the endpoint returns 404 for users without avatars
- Navigation is deferred to the `useEffect` in `AuthPage` to ensure proper React lifecycle
- The `currentStep !== 'registration'` check prevents auto-navigation during the registration flow
- All changes maintain backward compatibility with the existing API contract
