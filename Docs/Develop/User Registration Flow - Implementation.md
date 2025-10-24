# User Registration Flow - Implementation

**Date**: 2025-10-24
**Status**: ✅ Implemented and Fixed
**Phase**: Phase 1 Enhancement

---

## Overview

Implemented a **user registration step** that appears AFTER phone verification for **new users only**. This ensures that all users complete their profile (name + email) before accessing the application.

## User Flow

### New User Journey
1. Enter phone number
2. Verify SMS code
3. **Complete registration form** (name + email) ← NEW STEP
4. Create avatar
5. Access Try-On screen

### Returning User Journey
1. Enter phone number
2. Verify SMS code
3. Navigate directly to Avatar Creation (if no avatar) or Try-On (if avatar exists)

---

## Implementation Details

### 1. UserRegistration Component
**File**: `src/components/auth/UserRegistration.tsx`

- **Purpose**: Capture user's full name and email after phone verification
- **Validation**:
  - Name: Required, min 3 chars, max 100 chars, letters/spaces/hyphens only
  - Email: Required, valid email format
- **API Call**: `createProfile({ phone, name, email })`
- **Updates**: AuthContext with complete user profile
- **Navigation**: Calls `onCompleted()` callback to proceed to avatar creation

```typescript
interface UserRegistrationProps {
  phone: string;              // Pre-filled from verification
  onCompleted: () => void;   // Callback when registration completes
}
```

### 2. Enhanced useAuthFlow Hook
**File**: `src/hooks/useAuthFlow.ts`

**Changed Return Type**:
```typescript
export interface VerifyCodeResult {
  success: boolean;
  needsRegistration: boolean;  // NEW: indicates if user needs to register
}
```

**Detection Logic** (FINAL - BACKEND-DRIVEN):
- Backend now includes `hasProfile: boolean` in verify code response
- `hasProfile: true` = user has completed name/email registration
- `hasProfile: false` = user needs to complete registration
- Simple, reliable, and eliminates extra API calls

**Evolution of Approaches**:

```typescript
// ❌ Approach 1: Timestamp-based (FAILED)
const createdAt = new Date(response.data.user.createdAt);
const ageInSeconds = (now.getTime() - createdAt.getTime()) / 1000;
const isNewUser = ageInSeconds < 5;  // Unreliable timing

// ⚠️ Approach 2: Profile fetch (WORKED but inefficient)
try {
  const fullProfile = await getProfile();
  needsRegistration = !fullProfile.name || !fullProfile.email;
} catch (profileError) {
  needsRegistration = true;  // Profile doesn't exist
}

// ✅ Approach 3: Backend flag (OPTIMAL - CURRENT)
const needsRegistration = !response.data.hasProfile;
```

**Current Implementation**:
```typescript
// Login with token and user data
login(response.data.token, userProfile);

// Check if user needs registration using backend's hasProfile flag
const needsRegistration = !response.data.hasProfile;

console.log('[useAuthFlow] Registration check:', {
  hasProfile: response.data.hasProfile,
  needsRegistration,
  userId: response.data.user.id
});

return { success: true, needsRegistration };
```

### 3. Updated AuthPage
**File**: `src/pages/AuthPage.tsx`

**Added Registration Step**:
```typescript
type AuthStep = 'phone' | 'code' | 'registration';  // Added 'registration'
```

**Updated handleCodeVerified**:
```typescript
const handleCodeVerified = (needsRegistration: boolean): void => {
  if (needsRegistration) {
    setCurrentStep('registration');  // Show registration form
  } else {
    navigate('/avatar-creation', { replace: true });  // Skip to avatar
  }
};
```

**Added Registration Render**:
```typescript
{currentStep === 'registration' && (
  <div className="animate-fadeIn">
    <UserRegistration
      phone={phoneNumber}
      onCompleted={handleRegistrationCompleted}
    />
  </div>
)}
```

### 4. Updated CodeVerification Component
**File**: `src/components/auth/CodeVerification.tsx`

**Changed Callback Signature**:
```typescript
// Before
onVerified: () => void;

// After
onVerified: (needsRegistration: boolean) => void;
```

**Updated submitCode**:
```typescript
const submitCode = async (fullCode: string): Promise<void> => {
  const result = await verifyCodeHandler(cleanedPhone, fullCode);
  if (result.success) {
    onVerified(result.needsRegistration);  // Pass registration flag
  }
};
```

---

## Type Safety

All components are fully typed with TypeScript:

```typescript
// UserRegistration Props
interface UserRegistrationProps {
  phone: string;
  onCompleted: () => void;
}

// Verify Code Result
export interface VerifyCodeResult {
  success: boolean;
  needsRegistration: boolean;
}

// Verify Code Response (Updated with hasProfile)
export interface VerifyCodeResponse {
  success: boolean;
  data: {
    token: string;
    expiresIn: number;
    hasProfile: boolean;  // ← NEW: Backend indicates if user has completed profile
    user: AuthUser;
  };
  message: string;
}

// Validation Errors
interface ValidationErrors {
  name?: string;
  email?: string;
}
```

---

## Validation Rules

### Name Validation
- **Required**: Cannot be empty
- **Min Length**: 3 characters
- **Max Length**: 100 characters
- **Pattern**: Letters, spaces, hyphens only (`/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/`)
- **Error Messages** (Spanish):
  - Empty: "El nombre es obligatorio"
  - Too short: "El nombre debe tener al menos 3 caracteres"
  - Invalid chars: "El nombre solo puede contener letras, espacios y guiones"

### Email Validation
- **Required**: Cannot be empty
- **Format**: Valid email using `isValidEmail()` from validators
- **Max Length**: 100 characters
- **Error Messages** (Spanish):
  - Empty: "El email es obligatorio"
  - Invalid: "Por favor, introduce un email válido"

---

## UI/UX Features

### Loading States
- Submit button shows spinner during API call
- All inputs disabled during submission
- Prevents double submission

### Error Handling
- Field-level validation on form submit
- API error display in error banner
- Clear error on field change

### Accessibility
- Auto-focus on name input
- Proper label associations
- ARIA attributes for errors
- Keyboard navigation support

### Responsive Design
- Mobile-first approach
- Full-width inputs on mobile
- Proper spacing and padding
- Brand colors (#8C6F5A)

---

## API Integration

### Verify Code Endpoint (Updated)
**POST** `/auth/verify-code`

**Request**:
```json
{
  "phone": "+34612345678",
  "code": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "hasProfile": false,  // ← KEY FIELD: false = needs registration
    "user": {
      "id": "user_1234567890",
      "phone": "+34612345678",
      "createdAt": "2025-10-24T10:30:00.000Z"
    }
  },
  "message": "Autenticación exitosa"
}
```

### Create Profile Endpoint
**POST** `/user/create`

**Request**:
```json
{
  "phone": "+34612345678",
  "name": "María García",
  "email": "maria@email.com"
}
```

**Response**:
```json
{
  "id": "user-123",
  "phone": "+34612345678",
  "name": "María García",
  "email": "maria@email.com",
  "createdAt": "2025-10-24T10:30:00Z",
  "hasAvatar": false
}
```

---

## Testing Scenarios

### Test Case 1: New User Registration
1. Enter new phone number
2. Verify SMS code
3. ✅ Registration form should appear
4. Fill name and email
5. Submit
6. ✅ Should navigate to avatar creation

### Test Case 2: Returning User
1. Enter existing phone number (with complete profile)
2. Verify SMS code
3. ✅ Should skip registration and navigate directly

### Test Case 3: Validation Errors
1. Submit empty form
2. ✅ Should show validation errors
3. Fill with invalid data (e.g., "ab" for name)
4. ✅ Should show specific error messages

### Test Case 4: API Errors
1. Fill valid data
2. Simulate API error (e.g., network failure)
3. ✅ Should show error message
4. User can retry

---

## Build Status

**TypeScript Compilation**: ✅ PASS (0 errors)
**Vite Build**: ✅ SUCCESS (273.51 kB, 7.87s)
**Bundle Size**: 86.12 kB gzipped

---

## Problem Resolution

### Initial Issue
User reported: *"Lo he probado, el usuario no existía y aun así no ha saltado la pantalla de registro"* (Registration screen not appearing for new users)

### Root Cause Analysis

**Attempt 1 - Timestamp Detection (FAILED)**:
- Used `createdAt < 5 seconds` to detect new users
- Unreliable due to: backend timing, clock sync issues, race conditions

**Attempt 2 - Profile Fetch (WORKED but inefficient)**:
- Called `getProfile()` after verification to check if `name === null`
- More reliable but required extra API call
- Added latency to auth flow

### Final Solution (OPTIMAL)
Backend team added `hasProfile` field to verify code response:
- `hasProfile: false` = user needs to complete registration
- `hasProfile: true` = user already registered
- **Benefits**:
  - ✅ No extra API calls
  - ✅ 100% reliable (backend source of truth)
  - ✅ Faster auth flow
  - ✅ Simpler frontend logic

---

## Future Enhancements

### Phase 2 Potential Features
- [ ] Profile editing (update name/email)
- [ ] Profile photo upload separate from avatar
- [ ] Phone number change with re-verification
- [ ] Email verification step
- [ ] Password/PIN setup (if needed)

---

## Files Modified

1. ✅ `src/components/auth/UserRegistration.tsx` (NEW - registration form)
2. ✅ `src/hooks/useAuthFlow.ts` (uses hasProfile from backend response)
3. ✅ `src/pages/AuthPage.tsx` (added registration step)
4. ✅ `src/components/auth/CodeVerification.tsx` (callback signature)
5. ✅ `src/types/user.ts` (added hasProfile to VerifyCodeResponse)

---

## Commit Message

```
Implement user registration flow with backend hasProfile flag

Implemented user registration step that appears after phone verification
for new users only. Backend provides hasProfile flag in verify response
to indicate if user needs to complete registration.

NEW:
- UserRegistration component for capturing name + email
- Registration step in AuthPage flow (phone → code → registration → avatar)
- needsRegistration detection using backend's hasProfile field

CHANGED:
- useAuthFlow: Use response.data.hasProfile instead of profile fetch
- VerifyCodeResponse: Added hasProfile boolean field
- CodeVerification: Pass needsRegistration to parent callback
- Input handlers: Fixed onChange to use value string instead of event

FIXED:
- Registration screen now correctly appears for new users (hasProfile: false)
- No extra API calls needed for detection
- Simpler, more reliable logic

Build: ✅ TypeScript 0 errors, Vite 273.36 kB (86.07 kB gzipped), 2.75s

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Developer Notes

### Important Considerations

1. **Backend Contract**: Frontend relies on `hasProfile` field in verify code response
2. **Single Source of Truth**: Backend determines registration status, not frontend
3. **Logging**: Console logs added for debugging registration detection
4. **Type Safety**: All changes maintain strict TypeScript compliance
5. **No Extra API Calls**: Detection happens in single verify code call

### Debug Logs
```typescript
console.log('[useAuthFlow] Registration check:', {
  hasProfile: response.data.hasProfile,
  needsRegistration,
  userId: response.data.user.id
});
```

Use browser console to verify detection logic during testing.

### Backend Requirements

The backend MUST return `hasProfile` in the verify code response:
- Set `hasProfile: false` when user exists but hasn't completed profile (name/email null)
- Set `hasProfile: true` when user has completed profile registration
- This eliminates frontend guesswork and extra API calls

---

**Implementation Complete** ✅
Ready for backend integration testing.
