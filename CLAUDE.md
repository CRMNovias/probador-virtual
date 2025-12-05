# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Probador Virtual de Vestidos de Novia - Atelier de Bodas**

A **FRONTEND-ONLY** virtual try-on application for wedding dresses. This React application consumes REST APIs (developed separately by another team) to provide an interactive experience where customers can:
- Upload passport-style photos
- Generate AI-powered full-body avatars
- Virtually try on wedding dresses in different poses
- Browse their try-on gallery
- Manage appointments

**IMPORTANT**: This project contains ONLY the frontend React application. Backend APIs are developed and maintained separately.

## Git Workflow

**CRITICAL**: This project uses Git and follows GitFlow methodology strictly.

- **Repository**: Private (game-lovers/fit-checker.git)
- **Version Control**: Git (always work with branches)
- **Branch Strategy**: GitFlow
  - `main`: Production code only - **NEVER commit or merge directly to main**
  - `develop`: Main integration branch - all features merge here first
  - `feature/*`: Feature development branches (e.g., `feature/phase1-foundation`)
  - `fix/*`: Bug fix branches (e.g., `fix/auth-validation`)
  - `hotfix/*`: Emergency production fixes (branch from `main`)

### Branching Rules
- **ALWAYS create a new branch** for each phase, feature, or fix
- Branch naming convention:
  - `feature/phase-X-description` for phase implementations
  - `feature/component-name` for individual features
  - `fix/issue-description` for bug fixes
  - `hotfix/critical-issue` for production emergencies
- **One branch per conversation/session**: Create a dedicated branch at the start of each work session
- **Never merge directly to main**: All changes go through `develop` first
- **Merge flow**: `feature/*` → `develop` → `main` (via pull request)

### Git Commands Pattern
```bash
# Start new feature/phase
git checkout develop
git pull origin develop
git checkout -b feature/phase-1-foundation

# Commit work
git add .
git commit -m "Implement folder structure and configuration"

# Push to remote
git push -u origin feature/phase-1-foundation

# When complete, merge to develop via PR
```

## Development Methodology

### Code Standards
- **Language**: All code must be in English (variables, methods, comments, etc.)
- **Naming Conventions**:
  - Classes/Components: `PascalCase`
  - Everything else: `camelCase`
  - Avoid `kebab-case` in JS/TS files
- **Typing**: Everything must be typed (variables, parameters, etc.) - that's why we're using TypeScript
- **Method Size**: Never exceed 25 lines per method. Decompose into smaller methods if needed.
- **File Size**: No script should exceed 200 lines. Subdivide responsibilities.
- **Code Style**: Self-explanatory code following SOLID principles. No hardcoded variables - create configuration files for all values.
- **Principles**: Apply YAGNI, Clean Code, and KISS

### Pre-Development Checklist

Before each development task, verify:
1. **Architecture**: Does it follow best practices for React component structure?
2. **SOLID**: Is it extensible and maintainable?
3. **Scalability**: Does it support growth?
4. **Elegance**: Is the solution clean and simple?

### Pre-Commit Testing Requirements

**CRITICAL**: Before committing any code changes, ALWAYS test the implementation using Chrome DevTools if possible:

1. **Build & Type Check** (REQUIRED):
   ```bash
   npm run type-check  # Must pass before commit
   npm run build       # Must build successfully
   ```

2. **Manual Testing with DevTools** (REQUIRED when applicable):
   - Start dev server: `npm run dev`
   - Open Chrome DevTools (or use MCP Chrome DevTools if available)
   - Test ALL new/modified functionality:
     - Click all new buttons
     - Fill all new forms
     - Navigate all new routes
     - Verify state changes in React DevTools
     - Check console for errors
     - Verify network requests in Network tab
     - Test responsive design in Device Mode

3. **Component-Specific Testing**:
   - **New Components**: Render in browser, test all props/states
   - **Modified Components**: Verify no regression, test edge cases
   - **New Pages**: Navigate to page, test all interactions
   - **API Integrations**: Mock API responses, test error handling
   - **State Management**: Verify state updates in Redux/Context DevTools

4. **Documentation of Testing**:
   - Document testing results in commit message or separate doc
   - Include screenshots if visual changes
   - List all test cases executed
   - Note any issues found and fixed

**Example Testing Checklist**:
- [ ] Type check passed
- [ ] Build successful
- [ ] Visual rendering correct
- [ ] Click handlers work
- [ ] Form validation works
- [ ] Error states display
- [ ] Loading states display
- [ ] Navigation works
- [ ] No console errors
- [ ] Network requests succeed
- [ ] State updates correctly
- [ ] Responsive design works

**Note**: Some features may require backend implementation and can only be partially tested. In these cases, document what was tested and what requires backend.

### File Organization
- Separate all structures, enums, and interfaces into their own files
- Separate all data structures and identified objects
- Generate folders and restructure/move files when necessary

### Documentation
Create or modify `.txt` documents in `Docs/Develop/` or subdirectories whenever a feature is completed or updated.

## TypeScript Configuration

### Required tsconfig.json Settings
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",
    "target": "ES2020",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "jsx": "react-jsx"
  }
}
```

### Package.json Settings
```json
{
  "type": "module",
  "engines": {
    "node": ">=16.0.0"
  }
}
```

## Import/Export Patterns

### CRITICAL: ES Module Import Rules
- Always use `.js` extension for relative imports (even in TypeScript files)
- Package imports don't need extensions
- Use `import type` for type-only imports

```typescript
// ✅ Correct
import { apiClient } from '../services/apiClient.js';
import { formatDate } from '../../utils/formatters.js';
import type { User, ApiResponse } from '../types/index.js';
import axios from 'axios';

// ❌ Wrong
import { UserService } from './UserService';  // Missing .js
const fs = require('fs');  // CommonJS in ES module
```

## Type Safety

Always use explicit type casting for external data:

```typescript
// ✅ Safe
const response = await apiClient.get('/user') as ApiResponse<User>;
const data = JSON.parse(jsonString) as UserProfile;

// ❌ Dangerous
const response = await apiClient.get('/user');
const data = JSON.parse(jsonString);
```

## UX Flow (React Implementation)

The application follows this user journey:

1. **Authentication**: Phone number → SMS verification code
2. **Avatar Creation**: Upload passport-style photo → AI generates full-body avatar
3. **Try-On Screen**:
   - View avatar/generated try-on
   - Select dress
   - Choose pose
   - Generate virtual try-on
   - Actions: Share, delete, enlarge, regenerate avatar
4. **Gallery**: View all generated try-ons organized by dress
5. **Appointments**: View upcoming and past appointments

### Key UI Components
- Bottom navigation: Probador (Try-On) | Galería (Gallery) | Citas (Appointments)
- Floating action button: "Reservar Cita" (Book Appointment)
- Modals: Image viewer, share options, delete confirmation

## API Integration

This frontend consumes REST APIs. All API calls should:
- Go through the service layer (`src/services/`)
- Include proper error handling
- Show loading states
- Handle authentication (JWT tokens)
- Use TypeScript interfaces for request/response

Example:
```typescript
// src/services/authService.ts
import { apiClient } from './apiClient.js';
import type { SendCodeResponse, VerifyCodeResponse } from '../types/api.js';

export const sendCode = async (phone: string): Promise<SendCodeResponse> => {
  const response = await apiClient.post('/auth/send-code', { phone });
  return response as SendCodeResponse;
};
```

## Environment Variables

All configuration values must come from environment variables:

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
VITE_MAX_UPLOAD_SIZE_MB=10
VITE_ENABLE_LOGS=true
```

Access them via:
```typescript
// src/config/envConfig.ts
export const envConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT, 10),
  // ...
} as const;
```

## Common Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Validation (type-check + lint)
npm run validate
```

## Error Prevention Checklist

- [ ] Type Casting - Explicit `as Type` for external data
- [ ] ES Modules - All relative imports end with `.js`
- [ ] Strict Mode - Enable all TypeScript strict checks
- [ ] No Circular Dependencies - Use dependency injection
- [ ] Type-only Imports - Use `import type` when possible
- [ ] Environment Variables - No hardcoded values
- [ ] Error Handling - All API calls wrapped in try/catch
- [ ] Loading States - Show feedback during async operations

## Project Structure

```
Probador_Virtual/
├── src/                         # Frontend source code (to be created)
│   ├── config/                  # Configuration files
│   ├── services/                # API service layer
│   ├── types/                   # TypeScript type definitions
│   ├── hooks/                   # Custom React hooks
│   ├── context/                 # React Context providers
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   ├── utils/                   # Utility functions
│   ├── constants/               # Constants and enums
│   └── assets/                  # Images, icons, etc.
├── Docs/
│   ├── Design Documentation/    # Design specs and mockups
│   ├── Develop/                 # Development guidelines
│   │   ├── Project instructions Guide.txt
│   │   ├── TypeScript Development Guide - Best Practices.txt
│   │   ├── Frontend Technical Design.md
│   │   └── Phase 1 - Foundation Development Plan.txt
│   └── UX/                      # UX flows and mockups
│       └── React UX flows mockup.txt
├── .gitignore
├── README.md
└── CLAUDE.md
```

**Current Status**: Documentation-only phase. Frontend implementation starting with Phase 1.

## Quick Fixes for Common Issues

1. **Type Error: parameters** → Add explicit type casting
2. **Import Error** → Add `.js` extension to relative imports
3. **API Error** → Check error handling in service layer
4. **Circular Dependencies** → Restructure with dependency injection
5. **Build Failures** → Enable strict TypeScript checks
6. **Environment Variables Not Found** → Check `.env` file and restart dev server
7. **CORS Issues** → Contact backend team (not our responsibility)

## Technology Stack

- **React** 19.x - UI library
- **TypeScript** ~5.8.x - Type safety
- **Vite** 6.x - Build tool & dev server
- **React Router** 6.x - Client-side routing
- **Tailwind CSS** 3.x - Styling framework
- **Axios** - HTTP client for API calls
- **Framer Motion** - Animations
- **React Hook Form** - Form validation
- **date-fns** - Date formatting

## Key Naming Conventions

Use consistent naming for all entities:

```typescript
// File naming
Button.tsx          // Components
useAuth.ts          // Hooks
authService.ts      // Services
api.ts              // Types
formatters.ts       // Utils
routes.ts           // Constants

// Code naming
class UserProfile { }              // PascalCase for classes
const apiClient = axios.create()   // camelCase for variables
function formatPhone() { }         // camelCase for functions
interface User { }                 // PascalCase for interfaces
type Status = 'active' | 'idle'    // PascalCase for types
```
