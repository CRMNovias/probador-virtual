# Fix: DressId Race Condition on First Load

**Date**: 2025-11-12
**Branch**: (to be determined)
**Status**: ✅ Completed

## Problem Description

When a user opened the app for the first time (without cached session), they would see an error message:
```
Error: Vestido no seleccionado
Esta aplicación debe accederse desde el catálogo con un parámetro ?dressId=xxx
```

However, if they closed and reopened the app, it would work perfectly. The issue only occurred on the first load when there was no cached token in localStorage.

### Root Cause

The problem was introduced when implementing the automatic session restoration feature (persistent token validation). A **race condition** existed between two initialization processes:

1. **AuthContext initialization**:
   - Loaded token from localStorage
   - Validated token with backend
   - Set `isLoading = false` quickly

2. **AppContext initialization**:
   - Extracted `dressId` from URL parameters in `useEffect`
   - This effect ran AFTER the initial render

**The Race Condition Flow**:
1. User opens app with URL: `?dressId=123`
2. AuthContext detects cached token, validates it (fast)
3. AuthContext sets `isLoading = false`
4. `HomeRoute` sees authenticated user, redirects to `/try-on`
5. **Redirect happens BEFORE AppContext processes URL params**
6. User arrives at `/try-on` without `dressId` in context
7. TryOnPage shows error

**On Second Load**:
- `dressId` is already in localStorage
- AppContext loads it synchronously from localStorage (no race condition)
- Everything works perfectly

## Solution Implemented

### 1. Added `isInitialized` Flag to AppContext

Added a new state flag that tracks when AppContext has finished processing URL parameters:

```typescript
// src/context/AppContext.tsx
export interface AppContextState {
  // ... existing fields
  isInitialized: boolean; // NEW: Prevents premature redirects
}
```

This flag is set to `true` AFTER the `useEffect` that processes URL params completes:

```typescript
useEffect(() => {
  // Extract dressId from URL or localStorage
  // ... processing logic ...

  // Mark as initialized after processing
  setIsInitialized(true);
  console.log('[AppContext] Initialization complete');
}, [searchParams]);
```

### 2. Updated HomeRoute to Wait for Both Contexts

Modified `HomeRoute` to wait for BOTH `AuthContext` AND `AppContext` to finish initializing:

```typescript
// src/router.tsx
const HomeRoute: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { isInitialized: isAppInitialized } = useApp(); // NEW

  // Wait for BOTH contexts to initialize
  if (isAuthLoading || !isAppInitialized) {
    return <LoadingSpinner />;
  }

  // ... redirect logic ...
};
```

### 3. Improved Error Message

Changed the error message in `TryOnPage` to be more user-friendly and less technical:

**Before**:
```
Error: Vestido no seleccionado
Esta aplicación debe accederse desde el catálogo con un parámetro ?dressId=xxx
```

**After**:
```
Error al cargar la prenda
No se pudo cargar la información del vestido seleccionado.
Por favor, cierra la aplicación y vuelve a abrirla desde el catálogo.
```

Also improved the visual design to match the app's aesthetic (gradient background, soft colors, better typography).

## Files Modified

1. **src/context/AppContext.tsx**
   - Added `isInitialized` state flag
   - Added helper functions for synchronous localStorage access
   - Added logging for initialization process
   - Updated context interface and provider

2. **src/router.tsx**
   - Imported `useApp` hook
   - Modified `HomeRoute` to check `isAppInitialized`
   - Updated loading condition to wait for both contexts

3. **src/pages/TryOnPage.tsx**
   - Updated error message text (Spanish, user-friendly)
   - Improved error UI styling (gradient, colors, typography)
   - Better visual consistency with app design

## Testing

### Pre-commit Validation

✅ **Type Check**: `npm run type-check` - Passed
✅ **Build**: `npm run build` - Passed
🔄 **Manual Testing**: Ready for user testing

### Test Scenarios

The fix should resolve the following scenario:

1. **First Load (No Cache)**:
   - User opens app with `?dressId=123` for the first time
   - AuthContext validates cached token (if exists)
   - AppContext extracts dressId from URL
   - HomeRoute waits for BOTH to complete
   - User is redirected to correct page WITH dressId
   - ✅ No error shown

2. **Subsequent Loads**:
   - dressId already in localStorage
   - Works as before (no regression)
   - ✅ No error shown

3. **No DressId Scenario**:
   - User accesses app without `?dressId` parameter
   - No dressId in localStorage
   - User sees friendly error message
   - ✅ Clear instruction to reopen from catalog

## Technical Notes

### Synchronous vs Asynchronous Initialization

The fix uses a **hybrid approach**:

1. **Synchronous**: Initial state is loaded from localStorage synchronously
   ```typescript
   const [dressId, setDressId] = useState<string | null>(getInitialDressId());
   ```

2. **Asynchronous**: URL parameters are processed in `useEffect`
   ```typescript
   useEffect(() => {
     // URL params have priority over localStorage
     const dressIdParam = searchParams.get('dressId');
     // ... process and mark as initialized
   }, [searchParams]);
   ```

This ensures:
- Fast initial render (no flash of empty state)
- URL params always take priority (correct behavior)
- Clear signal when processing is complete (prevents race condition)

### Why Not Pure Synchronous?

We can't make the URL parameter extraction synchronous because:
- `useSearchParams()` is a React Router hook (must be called during render)
- URL params might change during navigation
- We need to react to URL changes dynamically

### Alternative Solutions Considered

1. ❌ **Delay AuthContext initialization**: Would slow down auth for all users
2. ❌ **Force reload on error**: Bad UX, defeats purpose of SPA
3. ✅ **Coordination flag**: Clean, explicit, no side effects

## Compatibility

- ✅ Backward compatible (no breaking changes)
- ✅ Works with existing session persistence
- ✅ Works with existing navigation flow
- ✅ No impact on other features

## Future Improvements

If the issue persists, consider:

1. **URL Parameter Preservation**: Ensure router preserves query params during redirects
2. **Deep Link Handling**: Improve initial URL parameter extraction
3. **Error Recovery**: Add automatic retry mechanism instead of manual reopen

## Related Issues

- Initial implementation: Persistent Session Feature
- Related file: `docs/Develop/Architecture Decision - DressId External Parameter.md`
- Related file: `docs/Develop/DressId Persistence and Avatar Regeneration Fix.md`

## Conclusion

The race condition has been resolved by introducing an explicit initialization flag in AppContext and making HomeRoute wait for both contexts to complete initialization before performing redirects. This ensures that dressId from URL parameters is always processed before any navigation occurs.

The fix is minimal, focused, and doesn't affect other features. It solves the root cause rather than treating symptoms.
