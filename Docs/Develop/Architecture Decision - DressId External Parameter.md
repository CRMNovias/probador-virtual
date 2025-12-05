# Architecture Decision: DressId as External Parameter

**Project**: Probador Virtual de Vestidos de Novia - Atelier de Bodas
**Date**: 2025-10-22
**Status**: ✅ Approved
**Impact**: HIGH - Affects entire application flow

---

## Decision

The `dressId` (dress identifier) will **ALWAYS be provided as a URL parameter** from an external source (the store's catalog/website). The application will **NEVER have a dress selector interface**.

---

## Context

This React application is designed to be **embedded or invoked** from the Atelier de Bodas website. When a customer browses the dress catalog on the main website and selects a dress they want to try on, the website opens/embeds this virtual try-on application with the specific dress already selected.

---

## Rationale

### Why No Dress Selector?

1. **Single Purpose per Session**: Each app session is dedicated to trying on ONE specific dress
2. **Simplified UX**: Users don't need to search through dresses again (they already did that on the main site)
3. **Integration with Store Catalog**: The main website owns the dress browsing experience
4. **Reduced Frontend Complexity**: No need for dress catalog UI, search, filters, etc.
5. **Backend Simplification**: No need for dress catalog endpoints in Phase 1

### Why URL Parameter?

1. **Bookmarkable**: Users can bookmark a specific try-on session
2. **Shareable**: Easy to share a specific dress try-on link
3. **Deep Linking**: Direct navigation from external sources
4. **SEO Friendly**: Each dress try-on can be indexed separately

---

## Implementation

### URL Format

```
https://app.atelierdefolletos.com/try-on?dressId=ABC123
```

Or for authenticated users who already have an avatar:
```
https://app.atelierdefolletos.com/?dressId=ABC123
```

**Parameters:**
- `dressId` (required): Unique identifier of the dress from the backend catalog

### Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Main Website Catalog                                            │
│  (Browse dresses, view details)                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ User clicks "Probar Virtualmente"
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│  Virtual Try-On App                                              │
│  URL: /try-on?dressId=ABC123                                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
              ┌───────────────┐
              │ Auth Check    │
              └───────┬───────┘
                      │
          ┌───────────┴───────────┐
          │                       │
    Not Logged In          Logged In
          │                       │
          ↓                       ↓
    ┌──────────┐          ┌────────────┐
    │ Auth     │          │ Has Avatar?│
    │ (Phone/  │          └─────┬──────┘
    │  SMS)    │                │
    └────┬─────┘          ┌─────┴─────┐
         │                │           │
         ↓                NO         YES
    ┌──────────┐          │           │
    │ Avatar   │<─────────┘           │
    │ Creation │                      │
    └────┬─────┘                      │
         │                            │
         └────────────┬───────────────┘
                      │
                      ↓
              ┌──────────────┐
              │   Try-On     │
              │   Screen     │
              │              │
              │ - Avatar     │
              │ - Dress      │ ← Already knows dressId
              │ - Poses      │
              │ - Generate   │
              └──────────────┘
```

### State Management

The `dressId` must be:

1. **Extracted on App Mount**:
   ```typescript
   // In App.tsx or router
   const searchParams = new URLSearchParams(window.location.search);
   const dressId = searchParams.get('dressId');

   if (!dressId) {
     // Show error: "Invalid access. Please select a dress from the catalog."
   }
   ```

2. **Stored in AppContext**:
   ```typescript
   // src/context/AppContext.tsx
   interface AppContextState {
     dressId: string | null;
     setDressId: (id: string) => void;
   }
   ```

3. **Persisted During Navigation**:
   - Store in `sessionStorage` or `AppContext`
   - Maintain throughout auth flow
   - Available in TryOnPage

4. **Validated Against Backend**:
   - The backend will validate if the `dressId` exists
   - If invalid, backend returns 404 error
   - Frontend shows appropriate error message

### Router Changes

**Before (with dress selector):**
```typescript
// ❌ OLD - Would have required dress selection
/try-on → Select dress → Select pose → Generate
```

**After (with URL parameter):**
```typescript
// ✅ NEW - Dress already selected
/try-on?dressId=ABC123 → Select pose → Generate
```

### API Calls

When generating a try-on:
```typescript
// src/services/tryOnService.ts
export const generateTryOn = async (
  dressId: string, // From URL parameter
  prompt: string
): Promise<GenerateTryOnResponse> => {
  const response = await apiClient.post(
    envConfig.endpoints.tryOn.generate,
    { dressId, prompt }
  );
  return response as unknown as GenerateTryOnResponse;
};
```

---

## Component Structure

### Components That Need DressId

1. **App.tsx** or **Router** - Extract from URL
2. **AppContext** - Store and provide to children
3. **TryOnPage** - Use for generation
4. **Error Boundaries** - Handle missing/invalid dressId

### Components That DON'T Need DressId

1. **AuthPage** - Just auth, dressId waits in context
2. **AvatarCreationPage** - Just avatar creation
3. **GalleryPage** - Shows all historical try-ons
4. **AppointmentsPage** - Shows appointments

---

## Error Handling

### Missing DressId

```typescript
if (!dressId) {
  return (
    <ErrorScreen
      title="Acceso no válido"
      message="Por favor, selecciona un vestido desde el catálogo."
      actionText="Ir al Catálogo"
      onAction={() => window.location.href = 'https://atelierdefolletos.com/catalogo'}
    />
  );
}
```

### Invalid DressId

```typescript
// Backend returns 404
{
  "success": false,
  "error": {
    "code": "DRESS_NOT_FOUND",
    "message": "Vestido no encontrado"
  }
}

// Frontend shows:
"El vestido seleccionado no está disponible. Por favor, selecciona otro desde el catálogo."
```

---

## Testing Considerations

### Development URLs

```
http://localhost:5173/?dressId=test-dress-001
http://localhost:5173/try-on?dressId=test-dress-001
```

### Mock Data

Create a mock `dressId` for development:
```typescript
// src/config/appConfig.ts
export const appConfig = {
  // ...
  dev: {
    mockDressId: 'dev-dress-12345', // Fallback for development
  },
} as const;
```

---

## Phase Implementation

### Phase 1 (Current)
- ✅ Accept `dressId` via URL parameter
- ✅ Store in AppContext
- ✅ Pass to Try-On generation API
- ✅ No dress selector UI

### Phase 2 (Future)
- ✅ Still no dress selector
- ✅ Enhanced error handling for invalid dressId
- ✅ Analytics tracking per dressId
- ✅ Dress metadata display (optional - may come from backend)

---

## Impact on Existing Documents

### Updates Required

1. ✅ **Phase 1 Plan** - Remove dress selector from Task 4
2. ✅ **Backend API Spec Phase 1** - Dress catalog endpoints moved to Phase 2
3. ⬜ **UX Flows** - Update to reflect pre-selected dress
4. ⬜ **Type Definitions** - Add DressId to AppContext types

---

## Alternative Considered

### Alternative 1: Embed DressId in JWT Token
**Rejected**: Would require backend changes and couples dress selection to auth

### Alternative 2: POST Message from Parent Frame
**Rejected**: More complex, requires iframe setup, harder to test

### Alternative 3: LocalStorage from Parent Site
**Rejected**: Security concerns, cross-origin limitations

---

## Consequences

### Positive
✅ Simpler frontend architecture
✅ No dress catalog endpoints needed in Phase 1
✅ Clear separation of concerns (catalog vs try-on)
✅ Better performance (no need to load dress catalog)
✅ Easier testing (just pass query param)

### Negative
⚠️ User must return to main site to try different dress
⚠️ App cannot function standalone (needs external dress selection)
⚠️ Cannot validate dressId on frontend (backend-only validation)

### Neutral
ℹ️ Requires clear communication with store website team
ℹ️ May need backend endpoint to fetch single dress metadata (optional)

---

## References

- Phase 1 Development Plan
- Backend API Specification Phase 1
- React UX Flows Mockup
- CLAUDE.md (Project Instructions)

---

**Last Updated**: 2025-10-22
**Next Review**: After Phase 1 completion
