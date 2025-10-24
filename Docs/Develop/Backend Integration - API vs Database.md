# Backend Integration - API vs Database Credentials

**Date**: 2025-10-24
**Topic**: Understanding the difference between database credentials and API URLs

---

## ⚠️ Important Security Concept

**Frontend applications NEVER connect directly to databases.**

### Why?

1. **Security Risk**: Database credentials in frontend code are visible to anyone
2. **Browser Limitation**: Browsers cannot connect to databases directly
3. **Best Practice**: Frontend → REST API → Database

---

## 🔄 Correct Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   FRONTEND   │ ──────> │  BACKEND API │ ──────> │   DATABASE   │
│  (React)     │  HTTP   │  (Node.js)   │  Direct │  (MongoDB)   │
└──────────────┘         └──────────────┘         └──────────────┘

     Uses:                    Uses:                   Uses:
  - API URLs              - API Keys              - DB Credentials
  - HTTP/HTTPS            - JWT Tokens            - Connection String
  - Public URLs           - Private Keys          - Private Access
```

---

## ❌ What Backend Sent (WRONG for Frontend)

```
URL: https://bd.cloud.crmnovias.com/
User: crmnovias_soloLectura
Password: DCFqFBywGOmse50d1H3B
```

**This is**:
- ❌ Database credentials
- ❌ Should NEVER be in frontend code
- ❌ Used by backend server only
- ⚠️ Major security vulnerability if exposed

---

## ✅ What Frontend Actually Needs

### 1. REST API Base URL

**Example**:
```
https://api.crmnovias.com/api
```

**NOT**:
- ❌ Database URL
- ❌ Database credentials
- ❌ Direct DB connection string

### 2. Endpoint Paths

Current endpoints (Phase 1):
```
POST /auth/send-code
POST /auth/verify-code
GET  /user/profile
POST /user/create
POST /user/upload
GET  /avatar
POST /avatar/generate
POST /tryons/generate
GET  /tryons/user
DELETE /tryons/:id
GET  /appointments/user
```

### 3. Optional: API Keys or Headers

Some backends require special headers:
```javascript
headers: {
  'X-API-Key': 'your-api-key-here',
  'Content-Type': 'application/json'
}
```

---

## 📝 Questions to Ask Backend Team

### Essential Questions:

1. **What is the REST API base URL for production?**
   - Example: `https://api-prod.crmnovias.com/api`

2. **What is the REST API base URL for staging/testing?**
   - Example: `https://api-staging.crmnovias.com/api`

3. **Are there any API keys or special headers required?**
   - Example: `X-API-Key: abc123`

4. **Do the endpoint paths match the specification?**
   - Confirm: `/auth/send-code`, `/auth/verify-code`, etc.

5. **What is the CORS configuration?**
   - Ensure frontend domain is allowed

6. **Is HTTPS enabled on the API?**
   - Required for production

---

## 🔧 Current Frontend Configuration

### Development (.env.development)
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

### Production (.env.production)
```bash
VITE_API_BASE_URL=https://api.atelierdebodas.com/api  # ← Needs verification
```

### Staging (.env.staging) - NEW
```bash
VITE_API_BASE_URL=https://REPLACE_WITH_BACKEND_URL/api  # ← Waiting for URL
```

---

## 🛠️ How to Update Configuration

### Step 1: Get API URL from Backend
Ask: "What is the REST API base URL?"

### Step 2: Update .env File
```bash
# .env.production or .env.staging
VITE_API_BASE_URL=https://actual-backend-url.com/api
```

### Step 3: Rebuild Frontend
```bash
npm run build
```

### Step 4: Test API Connection
```bash
# Open browser console and check network requests
# Should see requests to: https://actual-backend-url.com/api/auth/send-code
```

---

## 🔐 Security Checklist

### ✅ Safe for Frontend:
- [x] API base URL (e.g., `https://api.example.com`)
- [x] Endpoint paths (e.g., `/auth/verify-code`)
- [x] Public API keys (if designed for frontend use)

### ❌ NEVER in Frontend:
- [ ] Database credentials
- [ ] Database connection strings
- [ ] Private API keys
- [ ] Server-side secrets
- [ ] JWT secret keys (only JWT tokens are OK)

---

## 📊 Example API Request Flow

### What Frontend Does:
```javascript
// Frontend code (src/services/authService.ts)
const response = await apiClient.post('/auth/verify-code', {
  phone: '+34648687456',
  code: '123456'
});
// Request goes to: https://api.crmnovias.com/api/auth/verify-code
```

### What Backend Does:
```javascript
// Backend code (NOT frontend responsibility)
app.post('/auth/verify-code', async (req, res) => {
  // Backend connects to database using credentials
  const db = await MongoClient.connect('mongodb://bd.cloud.crmnovias.com', {
    user: 'crmnovias_soloLectura',
    password: 'DCFqFBywGOmse50d1H3B'
  });
  // Process request...
});
```

**Frontend NEVER sees database credentials!**

---

## 🚀 Next Steps

1. **Contact Backend Team**:
   - Request REST API URL (not database credentials)
   - Confirm endpoint paths
   - Ask about API keys or special headers

2. **Update .env.staging**:
   - Replace `VITE_API_BASE_URL` with actual URL

3. **Test Integration**:
   - Send test requests from frontend
   - Verify CORS is configured
   - Check response format matches TypeScript types

4. **Deploy**:
   - Build frontend with production/staging env
   - Deploy to hosting (Vercel, Netlify, etc.)

---

## 📞 Suggested Message to Backend

```
Hola,

Gracias por las credenciales, pero el frontend no se conecta
directamente a la base de datos por seguridad.

¿Me puedes proporcionar la siguiente información para integrar
el frontend con la API REST del backend?

1. URL base de la API para producción/staging
   Ejemplo: https://api.crmnovias.com/api

2. ¿Hay algún API key o header especial requerido?

3. ¿Los endpoints siguen la misma estructura?
   - POST /auth/send-code
   - POST /auth/verify-code
   - GET /user/profile
   - POST /user/create
   - etc.

4. ¿Está configurado CORS para permitir peticiones desde el frontend?

Gracias!
```

---

## 📚 Additional Resources

- [REST API Best Practices](https://restfulapi.net/)
- [CORS Configuration Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Frontend Security Best Practices](https://owasp.org/www-project-web-security-testing-guide/)

---

**Remember**: Frontend = API Consumer, Backend = Database Manager

Never mix these responsibilities for security and architectural reasons.
