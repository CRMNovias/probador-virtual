# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Probador Virtual de Vestidos de Novia - Atelier de Bodas**

A virtual try-on application for wedding dresses that uses AI to generate full-body avatar models from passport-style photos and allow customers to virtually try on dresses in different poses.

## Git Workflow

- **Repository**: Private (game-lovers/fit-checker.git)
- **Branch Strategy**: GitFlow
  - `main`: Production code only - DO NOT touch directly
  - `develop`: Main integration branch
  - `feature/*`: All development work happens here, branching from `develop`
- **Working Method**: Create one branch per conversation/session. Never merge directly to main.

## Development Methodology

### Code Standards
- **Language**: All code must be in English (variables, methods, comments, etc.)
- **Naming Conventions**:
  - Classes: `PascalCase`
  - Everything else: `camelCase`
  - Avoid `kebab-case` in JS/TS files
- **Typing**: Everything must be typed (variables, parameters, etc.) - that's why we're using TypeScript
- **Method Size**: Never exceed 25 lines per method. Decompose into smaller methods if needed.
- **File Size**: No script should exceed 200 lines. Subdivide responsibilities.
- **Code Style**: Self-explanatory code following SOLID principles. No hardcoded variables - create configuration files for all values.
- **Principles**: Apply YAGNI, Clean Code, and KISS

### Pre-Development Checklist

Before each development task, verify:
1. **Architecture**: Does it respect the MCP structure?
2. **SOLID**: Is it extensible and maintainable?
3. **Scalability**: Does it support growth?
4. **Elegance**: Is the solution clean and simple?

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
    "noUnusedParameters": true
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
import { DatabaseManager } from '../config/DatabaseManager.js';
import { logger } from '../../utils/logger.js';
import type { User, Config } from '../types/index.js';
import express from 'express';

// ❌ Wrong
import { UserService } from './UserService';  // Missing .js
const fs = require('fs');  // CommonJS in ES module
```

## Database Configuration (MySQL2)

### Valid Pool Options
```typescript
{
  host: 'localhost',
  port: 3306,
  user: 'username',
  password: 'password',
  database: 'database_name',
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectionLimit: 10,
  queueLimit: 0,
  idleTimeout: 60000,
  acquireTimeout: 60000
}
```

### Invalid Options (Remove These)
Do NOT use these options - they don't exist in mysql2:
- `reconnect`
- `maxReconnects`
- `reconnectDelay`
- `timeout`
- `connectTimeout`
- `keepAliveInitialDelay`
- `enableKeepAlive`

### Connection Pool Management
Implement singleton pattern with graceful shutdown:

```typescript
export class DatabasePoolManager {
  private static instances: Map<string, mysql.Pool> = new Map()

  static getPool(dbName: string): mysql.Pool {
    if (!this.instances.has(dbName)) {
      const pool = mysql.createPool(config)
      this.instances.set(dbName, pool)
    }
    return this.instances.get(dbName)!
  }

  static async closeAllPools(): Promise<void> {
    for (const pool of this.instances.values()) {
      await pool.end()
    }
    this.instances.clear()
  }
}

process.on('SIGTERM', async () => {
  await DatabasePoolManager.closeAllPools()
  process.exit(0)
})
```

## Type Safety

Always use explicit type casting for external data:

```typescript
// ✅ Safe
parameters: mcpTool.inputSchema as JSONSchema7
const result = await query(sql, params) as RowDataPacket[]

// ❌ Dangerous
parameters: mcpTool.inputSchema
const result = await query(sql, params)
```

## Tool Schemas (OpenAI Function Calling)

Use flat structure only - no nested properties:

```typescript
// ✅ Correct
inputSchema: {
  type: 'object',
  properties: {
    whatsapp_phone: {
      type: 'string',
      description: 'WhatsApp phone number'
    },
    name: {
      type: 'string',
      description: 'Customer name'
    }
  },
  required: ['whatsapp_phone']
}

// ❌ Wrong - double nesting causes 400 errors
inputSchema: {
  type: 'object',
  properties: {
    type: 'object',
    properties: { ... }
  }
}
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

## Common Development Commands

**Note**: No build scripts are currently configured. When implementing:

```bash
# Type checking
npm run type-check

# Build
npm run build

# Start application
npm start

# Linting
npm run lint

# Validation (type-check + lint)
npm run validate
```

## Error Prevention Checklist

- [ ] MySQL2 Config - Only use valid pool options
- [ ] Type Casting - Explicit `as Type` for external data
- [ ] ES Modules - All relative imports end with `.js`
- [ ] Tool Schemas - Flat structure, no nested properties
- [ ] Pool Management - Singleton pattern with graceful shutdown
- [ ] Strict Mode - Enable all TypeScript strict checks
- [ ] No Circular Dependencies - Use dependency injection
- [ ] Type-only Imports - Use `import type` when possible

## Project Structure

```
Probador_Virtual/
├── Docs/
│   ├── Design Documentation/    # Design specs and mockups (PDF)
│   ├── Develop/                 # Development guidelines
│   │   ├── Project instructions Guide.txt
│   │   └── TypeScript Development Guide - Best Practices.txt
│   └── UX/                      # UX flows and mockups
│       └── React UX flows mockup.txt
├── .gitignore
├── README.md
└── CLAUDE.md
```

**Current Status**: Documentation-only phase. No source code implemented yet.

## Quick Fixes for Common Issues

1. **Warning: Invalid MySQL Config** → Remove unsupported options
2. **Type Error: parameters** → Add explicit type casting
3. **Import Error** → Add `.js` extension to relative imports
4. **400 Error from AI** → Fix tool schema structure
5. **Connection Issues** → Implement proper connection pooling
6. **Circular Dependencies** → Restructure with dependency injection
7. **Build Failures** → Enable strict TypeScript checks
