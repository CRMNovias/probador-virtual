# Frontend Technical Design
## Probador Virtual de Vestidos de Novia - Atelier de Bodas

**Version:** 1.0
**Last Updated:** 2025-10-16
**Status:** Draft

---

## 1. Vision and Scope

### 1.1 Overview
This document defines the technical architecture for the **frontend application only**. The backend API is being developed independently by another team member. This frontend is a Single Page Application (SPA) that consumes RESTful API endpoints and provides an interactive virtual try-on experience for wedding dress customers.

### 1.2 Scope
**In Scope:**
- React frontend application
- UI/UX implementation
- API consumption and integration
- Client-side state management
- Image display and manipulation
- User authentication flow (JWT-based)
- Responsive design (mobile-first)

**Out of Scope:**
- Backend API development
- Database design
- AI/ML model training
- Image generation logic
- SMS sending
- Server-side rendering

### 1.3 Key Requirements
- All code must be in English (variables, methods, comments)
- Strict TypeScript typing (no `any`, all parameters typed)
- SOLID principles and self-explanatory code
- No hardcoded values - all configuration via environment variables
- Component max 200 lines, methods max 25 lines
- Responsive design: mobile, tablet, desktop
- Elegant error handling and loading states

---

## 2. Technology Stack

### 2.1 Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI library |
| **TypeScript** | ~5.8.x | Type safety |
| **Vite** | 6.x | Build tool & dev server |
| **React Router** | 6.x | Client-side routing |
| **Tailwind CSS** | 3.x | Styling framework |

### 2.2 Additional Libraries
| Library | Purpose |
|---------|---------|
| **Framer Motion** | Animations and transitions |
| **Axios** | HTTP client for API calls |
| **React Hook Form** | Form validation |
| **Zustand** or **Context API** | Global state management |
| **date-fns** | Date formatting |

### 2.3 Development Tools
- ESLint - Code linting
- Prettier - Code formatting
- TypeScript ESLint - TS-specific rules

### 2.4 Why This Stack?
- **Vite:** Fast development with HMR, modern ES modules support
- **Tailwind CSS:** Rapid UI development, design consistency
- **TypeScript:** Enforces type safety, catches errors at compile time
- **React 19:** Latest features, improved performance
- No Next.js: SSR not needed (authenticated app, no SEO requirements)

---

## 3. Architecture

### 3.1 Folder Structure (MCP Pattern)
```
src/
├── config/
│   ├── apiConfig.ts          # API base URLs, timeouts
│   ├── appConfig.ts           # App-wide configuration
│   └── envConfig.ts           # Environment variables wrapper
├── services/
│   ├── apiClient.ts           # Axios instance, interceptors
│   ├── authService.ts         # Auth API calls
│   ├── userService.ts         # User profile API calls
│   ├── avatarService.ts       # Avatar upload/management
│   ├── dressService.ts        # Dress catalog
│   ├── tryOnService.ts        # Try-on generation
│   └── appointmentService.ts  # Appointments
├── types/
│   ├── api.ts                 # API request/response types
│   ├── user.ts                # User-related types
│   ├── dress.ts               # Dress types
│   ├── avatar.ts              # Avatar types
│   ├── tryOn.ts               # Try-on types
│   └── index.ts               # Barrel export
├── hooks/
│   ├── useAuth.ts             # Authentication hook
│   ├── useApi.ts              # Generic API call hook
│   ├── useImageUpload.ts      # Image upload logic
│   └── useDebounce.ts         # Utility hook
├── context/
│   ├── AuthContext.tsx        # Auth state provider
│   └── AppContext.tsx         # Global app state
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── shared/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Loader.tsx
│   │   └── ImageUploader.tsx
│   ├── auth/
│   │   ├── PhoneInput.tsx
│   │   └── CodeVerification.tsx
│   ├── avatar/
│   │   ├── AvatarUpload.tsx
│   │   └── AvatarPreview.tsx
│   ├── tryon/
│   │   ├── Canvas.tsx
│   │   ├── PoseSelector.tsx
│   │   └── DressSelector.tsx
│   ├── gallery/
│   │   ├── GalleryGrid.tsx
│   │   └── ImageCard.tsx
│   └── appointments/
│       └── AppointmentList.tsx
├── pages/
│   ├── AuthPage.tsx
│   ├── AvatarCreationPage.tsx
│   ├── TryOnPage.tsx
│   ├── GalleryPage.tsx
│   ├── AppointmentsPage.tsx
│   └── SharePage.tsx
├── utils/
│   ├── validators.ts          # Input validation
│   ├── formatters.ts          # Date, phone formatters
│   ├── errorHandlers.ts       # Error message mapping
│   └── imageUtils.ts          # Image processing utilities
├── constants/
│   ├── routes.ts              # Route paths
│   ├── apiEndpoints.ts        # API endpoint paths
│   └── errorMessages.ts       # User-facing errors
├── assets/
│   ├── icons/
│   └── images/
├── styles/
│   └── globals.css            # Tailwind imports
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
└── router.tsx                 # Route configuration
```

### 3.2 Design Patterns
- **Service Layer Pattern:** All API calls isolated in service files
- **Custom Hooks:** Reusable logic extraction
- **Compound Components:** Complex UI composition
- **Provider Pattern:** Context-based state management
- **Separation of Concerns:** UI logic separated from business logic

---

## 4. API Contract Specification

### 4.1 Base Configuration
```typescript
// src/config/apiConfig.ts
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const apiConfig: ApiConfig = {
  baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: parseInt(process.env.VITE_API_TIMEOUT || '30000', 10),
  retryAttempts: 3,
};
```

### 4.2 Authentication Flow
```typescript
// JWT stored in: localStorage (access token) + httpOnly cookie (refresh token)
// All authenticated requests: Authorization: Bearer <token>
```

### 4.3 Endpoints

#### 4.3.1 Authentication
**POST /auth/send-code**
```typescript
// Request
interface SendCodeRequest {
  whatsappPhone: string; // Format: +34600000000
}

// Response
interface SendCodeResponse {
  success: boolean;
  message: string;
  expiresIn: number; // seconds
}
```

**POST /auth/verify-code**
```typescript
// Request
interface VerifyCodeRequest {
  whatsappPhone: string;
  code: string; // 6-digit code
}

// Response
interface VerifyCodeResponse {
  success: boolean;
  token: string; // JWT
  refreshToken: string;
  user: UserProfile;
}
```

#### 4.3.2 User Profile
**GET /user/profile**
```typescript
// Headers: Authorization: Bearer <token>

// Response
interface UserProfile {
  id: string;
  name: string | null;
  whatsappPhone: string;
  createdAt: string; // ISO 8601
  hasAvatar: boolean;
}
```

**POST /user/profile**
```typescript
// Request
interface CreateProfileRequest {
  name: string;
}

// Response
interface CreateProfileResponse {
  success: boolean;
  user: UserProfile;
}
```

**POST /user/upload**
```typescript
// Request: multipart/form-data
// Field: photo (File)

// Response
interface UploadPhotoResponse {
  success: boolean;
  photoUrl: string;
  message: string;
}
```

#### 4.3.3 Dresses
**GET /dress/:id**
```typescript
// Response
interface Dress {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  category: string;
  available: boolean;
}
```

#### 4.3.4 Avatar
**POST /avatar/upload**
```typescript
// Request: multipart/form-data
// Field: avatarImage (File - AI-generated model image)

// Response
interface UploadAvatarResponse {
  success: boolean;
  avatarId: string;
  avatarUrl: string;
}
```

#### 4.3.5 Try-Ons
**POST /tryons/upload**
```typescript
// Request: multipart/form-data
// Fields:
//   - tryOnImage (File)
//   - dressId (string)
//   - poseId (string)

// Response
interface UploadTryOnResponse {
  success: boolean;
  tryOnId: string;
  imageUrl: string;
  createdAt: string;
}
```

**GET /tryons/user**
```typescript
// Response
interface UserTryOnsResponse {
  tryOns: TryOnCategory[];
}

interface TryOnCategory {
  dressId: string;
  dressName: string;
  dressImageUrl: string;
  images: TryOnImage[];
}

interface TryOnImage {
  id: string;
  imageUrl: string;
  poseId: string;
  poseName: string;
  createdAt: string;
}
```

**DELETE /tryons/:id**
```typescript
// Response
interface DeleteTryOnResponse {
  success: boolean;
  message: string;
}
```

#### 4.3.6 Appointments
**GET /appointments/user**
```typescript
// Response
interface AppointmentsResponse {
  upcoming: Appointment[];
  past: Appointment[];
}

interface Appointment {
  id: string;
  date: string; // ISO 8601
  time: string; // HH:MM
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes: string | null;
}
```

#### 4.3.7 Sharing
**GET /share/:id**
```typescript
// Response: HTML page (not JSON)
// Public endpoint (no auth required)
// Returns embeddable HTML with image preview
```

### 4.4 Error Response Format
```typescript
interface ApiError {
  success: false;
  error: {
    code: string; // e.g., "AUTH_INVALID_CODE"
    message: string; // User-friendly message
    details?: any;
  };
}

// Common error codes:
// - AUTH_INVALID_CODE
// - AUTH_EXPIRED_CODE
// - AUTH_INVALID_TOKEN
// - USER_NOT_FOUND
// - UPLOAD_FAILED
// - INVALID_FILE_TYPE
// - FILE_TOO_LARGE
// - RESOURCE_NOT_FOUND
```

---

## 5. Navigation Flow

### 5.1 Routes
```typescript
export const routes = {
  AUTH: '/',
  AVATAR_CREATION: '/avatar/create',
  TRY_ON: '/try-on',
  GALLERY: '/gallery',
  APPOINTMENTS: '/appointments',
  SHARE: '/share/:id',
} as const;
```

### 5.2 User Journey
```
1. Landing → Auth (Phone Input)
   ↓
2. Code Verification
   ↓
3. Avatar Creation (Photo Upload)
   ↓
4. Avatar Processing (AI generation - loading state)
   ↓
5. Try-On Screen (Main App)
   ├── Select Dress
   ├── Choose Pose
   ├── Generate Try-On
   └── View Result
   ↓
6. Navigation Bar:
   ├── Try-On (Camera icon)
   ├── Gallery (Image icon)
   └── Appointments (Calendar icon)
```

### 5.3 Screen States

#### Auth Screen
- Initial: Phone input
- Loading: Sending code
- Code sent: Verification input
- Verifying: Loading spinner
- Success: Navigate to avatar creation

#### Avatar Creation
- Upload form
- Preview uploaded photo
- Generate button
- Loading: AI processing (modal overlay)
- Success: Navigate to try-on

#### Try-On Screen
- Main canvas: Display avatar/result
- Dress selector panel
- Pose selector
- Generate button
- Loading state: Processing animation
- Actions: Share, Delete, Regenerate avatar

#### Gallery Screen
- Grid of try-ons grouped by dress
- Expand/collapse categories
- Image actions: View full, Share, Delete
- Empty state if no try-ons

#### Appointments Screen
- Upcoming appointments list
- Past appointments list
- Book appointment CTA button

---

## 6. Components and Responsibilities

### 6.1 Component Hierarchy
```
App
├── Router
│   ├── AuthPage
│   │   ├── PhoneInput
│   │   └── CodeVerification
│   ├── AvatarCreationPage
│   │   ├── AvatarUpload
│   │   └── Loader (overlay)
│   ├── TryOnPage
│   │   ├── Header
│   │   ├── Canvas
│   │   ├── DressSelector
│   │   ├── PoseSelector
│   │   └── Navigation
│   ├── GalleryPage
│   │   ├── Header
│   │   ├── GalleryGrid
│   │   │   └── ImageCard (multiple)
│   │   └── Navigation
│   └── AppointmentsPage
│       ├── Header
│       ├── AppointmentList
│       └── Navigation
└── Modals (Portal)
    ├── ImageViewerModal
    ├── ShareModal
    └── DeleteConfirmationModal
```

### 6.2 Key Component Interfaces

```typescript
// components/shared/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

// components/shared/ImageUploader.tsx
interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: boolean;
}

// components/tryon/Canvas.tsx
interface CanvasProps {
  imageUrl: string | null;
  isLoading: boolean;
  loadingMessage?: string;
  onActionClick: (action: 'share' | 'delete' | 'fullscreen') => void;
}

// components/tryon/DressSelector.tsx
interface DressSelectorProps {
  dresses: Dress[];
  selectedDressId: string | null;
  onSelect: (dressId: string) => void;
}
```

### 6.3 Custom Hooks

```typescript
// hooks/useAuth.ts
interface UseAuthReturn {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendCode: (phone: string) => Promise<void>;
  verifyCode: (phone: string, code: string) => Promise<void>;
  logout: () => void;
}

// hooks/useApi.ts
interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  execute: (...args: any[]) => Promise<T>;
}

// hooks/useImageUpload.ts
interface UseImageUploadReturn {
  upload: (file: File, endpoint: string) => Promise<string>;
  progress: number;
  isUploading: boolean;
  error: string | null;
}
```

---

## 7. State Management

### 7.1 Global State (Context API)

```typescript
// context/AuthContext.tsx
interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

// context/AppContext.tsx
interface AppContextValue {
  avatarUrl: string | null;
  setAvatarUrl: (url: string) => void;
  currentView: 'try-on' | 'gallery' | 'appointments';
  setCurrentView: (view: string) => void;
}
```

### 7.2 Local State
- Component-specific UI state (modals, forms)
- Temporary data (form inputs, selections)
- Loading/error states per component

### 7.3 Persistence
```typescript
// localStorage keys (constants/storageKeys.ts)
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PROFILE: 'user_profile',
  AVATAR_URL: 'avatar_url',
} as const;
```

### 7.4 Cache Strategy
- API responses: No caching (always fresh data)
- Images: Browser cache via proper HTTP headers
- User profile: Cache in localStorage, validate on app load

---

## 8. Configuration and Environment Variables

### 8.1 Environment Files
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_API_KEY=your_gemini_api_key_here
VITE_API_TIMEOUT=30000
VITE_MAX_UPLOAD_SIZE_MB=10
VITE_ENABLE_LOGS=true

# .env.production
VITE_API_BASE_URL=https://api.atelierdebodas.com/api
VITE_GOOGLE_API_KEY=production_key
VITE_API_TIMEOUT=60000
VITE_MAX_UPLOAD_SIZE_MB=5
VITE_ENABLE_LOGS=false
```

### 8.2 Config Wrapper
```typescript
// src/config/envConfig.ts
export const envConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT, 10),
  maxUploadSizeMB: parseInt(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB, 10),
  enableLogs: import.meta.env.VITE_ENABLE_LOGS === 'true',
} as const;

// Validation at startup
if (!envConfig.apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required');
}
```

---

## 9. UX/UI Guidelines

### 9.1 Design System

#### Colors (Tailwind palette)
```typescript
// Branding colors
export const colors = {
  primary: '#8C6F5A',      // Brown - buttons, accents
  primaryHover: '#7a5f4d',
  secondary: '#D4C8BE',    // Light beige - highlights
  background: '#F8F7F5',   // Off-white
  textPrimary: '#4a3f35',  // Dark brown
  textSecondary: '#6e5f53',
  neutral: '#EAE0D5',
  white: '#FFFFFF',
  error: '#EF4444',
  success: '#10B981',
};

// Tailwind classes mapping:
bg-[#8C6F5A] → Primary background
text-[#4a3f35] → Primary text
bg-[#F8F7F5] → Page background
```

#### Typography
```css
/* Font families */
font-sans: system font stack
font-serif: Georgia, serif (headings)

/* Sizes */
text-xs: 12px
text-sm: 14px
text-base: 16px
text-lg: 18px
text-xl: 20px
text-2xl: 24px
text-3xl: 30px
text-4xl: 36px
```

#### Spacing
```
p-2: 8px
p-4: 16px
p-6: 24px
p-8: 32px

gap-2, gap-4, gap-6, gap-8 (same scale)
```

### 9.2 Loading States

```typescript
// Generic loading component
<Loader text="Procesando..." />

// Specific messages by context:
- "Enviando código..." (Sending SMS)
- "Verificando..." (Code verification)
- "Generando tu avatar..." (AI model creation)
- "Generando prueba virtual..." (Try-on generation)
- "Cambiando pose..." (Pose variation)
```

### 9.3 Error Handling

```typescript
// User-friendly error messages
const errorMessages = {
  AUTH_INVALID_CODE: 'Código incorrecto. Inténtalo de nuevo.',
  AUTH_EXPIRED_CODE: 'El código ha expirado. Solicita uno nuevo.',
  UPLOAD_FAILED: 'Error al subir la imagen. Verifica tu conexión.',
  INVALID_FILE_TYPE: 'Formato de archivo no válido. Usa JPG o PNG.',
  FILE_TOO_LARGE: 'La imagen es demasiado grande. Máximo 5MB.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  UNKNOWN_ERROR: 'Algo salió mal. Inténtalo más tarde.',
};

// Display in toast/banner:
<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
  <p className="font-bold">Error</p>
  <p>{errorMessage}</p>
</div>
```

### 9.4 Responsive Breakpoints

```typescript
// Tailwind breakpoints
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Small laptops
xl: 1280px  // Desktops

// Mobile-first approach
<div className="w-full md:w-1/2 lg:w-1/3">
  // Full width on mobile
  // Half width on tablet
  // Third width on desktop
</div>
```

### 9.5 Animations

```typescript
// Framer Motion variants
const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
  transition: { duration: 0.5, ease: 'easeInOut' }
};

// Page transitions
<AnimatePresence mode="wait">
  <motion.div variants={fadeIn} initial="initial" animate="animate" exit="exit">
    {/* Page content */}
  </motion.div>
</AnimatePresence>

// Loading spinner
<SparklesIcon className="w-12 h-12 animate-pulse" />
```

---

## 10. Implementation Priorities

### Phase 1: Foundation (MVP)
1. ✅ Project setup (Vite + React + TypeScript + Tailwind)
2. ✅ Folder structure and config
3. ✅ API client with interceptors
4. ✅ Auth flow (phone + code verification)
5. ✅ Basic routing
6. ✅ Layout components (Header, Navigation)

### Phase 2: Core Features
7. Avatar creation flow
8. Try-on screen (canvas + dress selector)
9. Image generation integration
10. Gallery view
11. Error handling and loading states

### Phase 3: Polish
12. Appointments screen
13. Share functionality
14. Animations and transitions
15. Mobile responsiveness
16. Performance optimization

---

## 11. Quality Checklist

### Code Quality
- [ ] All variables, methods, comments in English
- [ ] Strict TypeScript (no `any`, all types explicit)
- [ ] No hardcoded values (all via config)
- [ ] Components < 200 lines
- [ ] Methods < 25 lines
- [ ] Self-explanatory code (SOLID principles)

### Functionality
- [ ] All API endpoints integrated
- [ ] Error handling for all API calls
- [ ] Loading states for async operations
- [ ] Input validation (client-side)
- [ ] Image upload with size/type validation
- [ ] JWT token refresh logic

### UX/UI
- [ ] Responsive on mobile, tablet, desktop
- [ ] Smooth animations and transitions
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] User-friendly error messages (Spanish)
- [ ] Consistent design system

### Performance
- [ ] Image optimization (lazy loading)
- [ ] Code splitting (dynamic imports)
- [ ] Bundle size < 500KB (gzipped)
- [ ] First Contentful Paint < 2s

---

## 12. Open Questions / Decisions Needed

1. **State Management:** Context API sufficient or need Zustand/Redux?
2. **Form Library:** React Hook Form vs. manual validation?
3. **Image Optimization:** Client-side compression before upload?
4. **Offline Support:** Service workers for PWA?
5. **Analytics:** Integration with Google Analytics or similar?
6. **Internationalization:** Spanish-only or prepare for i18n?
7. **Booking Flow:** External calendar link or embedded widget?

---

## Appendix A: File Naming Conventions

```
Components:  PascalCase.tsx   (Button.tsx, ImageUploader.tsx)
Hooks:       camelCase.ts     (useAuth.ts, useApi.ts)
Services:    camelCase.ts     (authService.ts, apiClient.ts)
Types:       camelCase.ts     (user.ts, api.ts)
Utils:       camelCase.ts     (validators.ts, formatters.ts)
Constants:   camelCase.ts     (routes.ts, apiEndpoints.ts)
```

---

## Appendix B: Import/Export Standards

```typescript
// Named exports (preferred)
export const authService = { ... };
export interface User { ... }

// Imports with .js extension (required for ES modules)
import { authService } from '../services/authService.js';
import type { User } from '../types/user.js';

// Type-only imports
import type { ApiResponse } from './api.js';
```

---

**Document Ownership:** Frontend Team
**Review Cycle:** Weekly during Phase 1, Bi-weekly thereafter
**Last Reviewed By:** Claude Code
