# Backend API Specification - Phase 1

**Proyecto**: Atelier de Bodas - Probador Virtual de Vestidos de Novia
**Frontend Repository**: game-lovers/fit-checker.git
**Fecha**: 2025-10-22
**Versión**: 1.0 (Phase 1)

## Información General

Este documento especifica los endpoints REST requeridos por el frontend de la aplicación Probador Virtual para la **primera iteración de desarrollo**. Todos los endpoints deben seguir las mejores prácticas de REST APIs y devolver respuestas en formato JSON.

### Autenticación
- La mayoría de los endpoints requieren autenticación mediante **JWT Bearer Token**
- El token se envía en el header: `Authorization: Bearer {token}`
- Los únicos endpoints públicos son `/auth/send-code`, `/auth/verify-code` y 'POST /user/profile' 

### Formato de Respuestas

#### Respuesta Exitosa
```typescript
{
  "success": true,
  "data": { /* datos específicos del endpoint */ },
  "message": "Mensaje opcional de éxito"
}
```

#### Respuesta de Error
```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje descriptivo del error",
    "details": { /* información adicional opcional */ }
  }
}
```

---

## 1. Autenticación

### 1.1 Enviar Código de Verificación

**Endpoint**: `POST /auth/send-code`
**Autenticación**: No requiere
**Descripción**: Genera y envía un código de verificación SMS al número de teléfono proporcionado.

#### Request Body
```typescript
{
  "phone": string  // Formato: +34XXXXXXXXX (E.164)
}
```

#### Response (200 OK)
```typescript
{
  "success": true,
  "data": {
    "phoneNumber": string,
    "expiresIn": number,  // Segundos hasta que expire el código (ej: 300 = 5 minutos)
    "cooldownSeconds": number  // Segundos antes de poder solicitar otro código
  },
  "message": "Código de verificación enviado correctamente"
}
```

#### Errores Posibles
- **400 Bad Request**: Número de teléfono inválido
- **429 Too Many Requests**: Demasiados intentos (cooldown activo)(opcional, pero recomendable)
- **500 Internal Server Error**: Error al enviar el Whatsaap

#### Notas y recomendaciones
- Implementar rate limiting: máximo 3 intentos por número en 15 minutos
- El código debe tener 6 dígitos
- El código debe expirar en 5 minutos

---

### 1.2 Verificar Código y Obtener Token

**Endpoint**: `POST /auth/verify-code`
**Autenticación**: No requiere
**Descripción**: Verifica el código SMS y devuelve un JWT si es válido. Si es la primera vez que el usuario accede, crea su perfil básico.

#### Request Body
```typescript
{
  "phone": string,     // Formato: +34XXXXXXXXX
  "code": string       // 6 dígitos
}
```

#### Response (200 OK)
```typescript
{
  "success": true,
  "data": {
    "token": string,           // JWT token
    "expiresIn": number,       // Segundos hasta expiración (ej: 86400 = 24h)
    "user": {
      "id": string,
      "phone": string,
      "createdAt": string      // ISO 8601 date
    }
  },
  "message": "Autenticación exitosa"
}
```

#### Errores Posibles
- **400 Bad Request**: Código o teléfono inválido
- **401 Unauthorized**: Código incorrecto o expirado
- **429 Too Many Requests**: Demasiados intentos fallidos
- **500 Internal Server Error**: Error interno

#### Notas y recomendaciones
- Bloquear temporalmente después de 5 intentos fallidos
- El JWT debe incluir: `userId`, `phone`, `iat`, `exp`
- Si es un usuario nuevo, crear su perfil automáticamente

---

## 2. Usuario

### 2.1 Obtener Perfil de Usuario

**Endpoint**: `GET /user/profile`
**Autenticación**: Requerida (JWT)
**Descripción**: Obtiene el perfil completo del usuario autenticado.

#### Request Headers
```
Authorization: Bearer {token}
```

#### Response (200 OK)
```typescript
{
  "success": true,
  "data": {
    "id": string,
    "phone": string,
    "avatarUrl": string | null,     // URL del avatar generado (null si no tiene)
    "photoUrl": string | null,      // URL de la foto de carnet original
    "createdAt": string,            // ISO 8601
    "updatedAt": string,            // ISO 8601
    "stats": {
      "totalTryOns": number,        // Total de pruebas virtuales generadas
      "totalAppointments": number   // Total de citas (pasadas + futuras)
    }
  }
}
```

#### Errores Posibles
- **401 Unauthorized**: Token inválido o expirado
- **404 Not Found**: Usuario no encontrado
- **500 Internal Server Error**: Error interno

---

### 2.2 Crear Perfil de Usuario

**Endpoint**: `POST /user/profile`
**Autenticación**: No requiere
**Descripción**: Creamos el  perfil del usuario si no existía

#### Request Body
```typescript
{
    "phone": string:
  "name": string,           
  "email": string
}
```

#### Response (200 OK)
```typescript
{
    "success": true,
        "data": {
        "token": string,           // JWT token
            "expiresIn": number       // Segundos hasta expiración (ej: 86400 = 24h)
            
    },
    "message": "Autenticación exitosa"
}
```

#### Errores Posibles
- **400 Bad Request**: Datos inválidos
- **500 Internal Server Error**: Error interno

---

### 2.3 Subir Foto de Carnet

**Endpoint**: `POST /user/upload`
**Autenticación**: Requerida (JWT)
**Descripción**: Recibe la foto tipo carnet del usuario. Esta foto se usará para generar el avatar de cuerpo completo (proceso que puede ser asíncrono).

#### Request
**Content-Type**: `multipart/form-data`

```typescript
{
  "photo": File  // Imagen en formato JPG, PNG o WEBP
}
```

#### Response (200 OK - Procesamiento Síncrono)
```typescript
{
  "success": true,
  "data": {
    "photoUrl": string        // URL de la foto original almacenada
  },
  "message": "Avatar generado correctamente"
}
```


#### Errores Posibles
- **400 Bad Request**: Archivo inválido (formato, tamaño, calidad)
- **401 Unauthorized**: Token inválido
- **413 Payload Too Large**: Archivo demasiado grande (límite: 10MB)
- **500 Internal Server Error**: Error en procesamiento de imagen

#### Notas
- Validar formato de imagen (JPG, PNG, WEBP)
- Tamaño máximo: 10MB

---

## 3. Avatar

### 3.1 Obtener Avatar del Usuario

**Endpoint**: `GET /avatar`
**Autenticación**: Requerida (JWT)
**Descripción**: Obtiene el avatar de cuerpo completo del usuario autenticado.

#### Request Headers
```
Authorization: Bearer {token}
```

#### Response (200 OK)
```typescript
{
  "success": true,
  "data": {
    "avatarUrl": string,       // URL del avatar de cuerpo completo
    "userId": string,
    "createdAt": string,       // ISO 8601
    "updatedAt": string        // ISO 8601
  }
}
```

#### Errores Posibles
- **401 Unauthorized**: Token inválido
- **404 Not Found**: Usuario no tiene avatar generado
- **500 Internal Server Error**: Error interno

---

### 3.2 Generar Avatar con IA

**Endpoint**: `POST /avatar/generate`
**Autenticación**: Requerida (JWT)
**Descripción**: Genera un avatar de cuerpo completo usando el modelo de IA (Gemini Nano Banana). Utiliza la foto de perfil del usuario (`photoUrl`) y el prompt enviado desde el frontend para generar el avatar completo.

#### Request Body
```typescript
{
  "prompt": string             // Prompt específico para generar avatar de cuerpo completo
}
```

#### Response (200 OK - Procesamiento Síncrono)
```typescript
{
  "success": true,
  "data": {
    "avatarUrl": string,       // URL del avatar generado y guardado
    "userId": string,
    "generatedAt": string      // ISO 8601
  },
  "message": "Avatar generado correctamente"
}
```

#### Errores Posibles
- **400 Bad Request**: Prompt inválido o vacío
- **401 Unauthorized**: Token inválido
- **404 Not Found**: Usuario no tiene foto de perfil (`photoUrl`)
- **500 Internal Server Error**: Error en procesamiento IA

#### Notas Técnicas
- El backend debe usar la `photoUrl` del usuario almacenada en su perfil
- El modelo de IA usado es el mismo del prototipo (Gemini Nano Banana)
- El avatar generado se guarda automáticamente y actualiza el `avatarUrl` del usuario
- Si el usuario ya tiene un avatar, este endpoint lo regenera/reemplaza

---

## 4. Pruebas Virtuales (Try-Ons)

### 4.1 Obtener Todas las Pruebas Virtuales del Usuario

**Endpoint**: `GET /tryons/user`
**Autenticación**: Requerida (JWT)
**Descripción**: Devuelve todas las pruebas virtuales del usuario organizadas por vestido (categorías).


#### Response (200 OK)
```typescript
{
  "success": true,
  "data": {
    "total": number,           // Total de pruebas virtuales
    "tryOnsByDress": [         // Agrupadas por vestido
      {
        "dressId": string,
        "dressName": string,
        "dressImageUrl": string,
        "tryOns": [
          {
            "id": string,
            "imageUrl": string,
            "thumbnailUrl": string,
            "createdAt": string
          }
        ]
      }
    ]
  }
}
```

#### Errores Posibles
- **401 Unauthorized**: Token inválido
- **500 Internal Server Error**: Error interno

---

### 4.2 Generar Prueba Virtual con IA

**Endpoint**: `POST /tryons/generate`
**Autenticación**: Requerida (JWT)
**Descripción**: Genera una prueba virtual usando el modelo de IA (Gemini Nano Banana). Utiliza el avatar del usuario (`avatarUrl`) almacenado en su perfil, la imagen del vestido y el prompt enviado desde el frontend. El prompt incluye toda la información necesaria, incluyendo la pose deseada.

#### Request Body
```typescript
{
  "dressId": string,           // ID del vestido a probar
  "prompt": string             // Prompt completo para generar la prueba virtual (incluye pose, estilo, etc.)
}
```

#### Response (200 OK - Procesamiento Síncrono)
```typescript
{
  "success": true,
  "data": {
    "id": string,              // ID único de la prueba virtual
    "userId": string,
    "dressId": string,
    "imageUrl": string,        // URL de la imagen generada y guardada
    "thumbnailUrl": string,    // Miniatura optimizada
    "createdAt": string        // ISO 8601
  },
  "message": "Prueba virtual generada correctamente"
}
```


#### Errores Posibles
- **400 Bad Request**: dressId o prompt inválidos
- **401 Unauthorized**: Token inválido
- **404 Not Found**: Usuario no tiene avatar generado (`avatarUrl`) o vestido no encontrado
- **500 Internal Server Error**: Error en procesamiento IA

#### Notas Técnicas
- El backend debe usar el `avatarUrl` del usuario almacenado en su perfil
- El backend debe obtener la imagen del vestido usando el `dressId`
- El modelo de IA usado es Gemini Nano Banana
- El prompt viene completamente formado desde el frontend (incluye pose, instrucciones, estilo)
- La imagen generada se guarda automáticamente en el sistema
- Se genera thumbnail automáticamente para optimizar carga


---

### 4.3 Eliminar Prueba Virtual

**Endpoint**: `DELETE /tryons/:id`
**Autenticación**: Requerida (JWT)
**Descripción**: Elimina una prueba virtual específica del usuario.

#### Request Parameters
```
:id - string (ID de la prueba virtual)
```

#### Response (200 OK)
```typescript
{
  "success": true,
  "data": {
    "id": string,
    "deleted": true
  },
  "message": "Prueba virtual eliminada correctamente"
}
```

#### Errores Posibles
- **401 Unauthorized**: Token inválido
- **403 Forbidden**: La prueba virtual no pertenece al usuario
- **404 Not Found**: Prueba virtual no encontrada
- **500 Internal Server Error**: Error interno

#### Notas
- Debe verificar que la prueba virtual pertenece al usuario autenticado
- Debe eliminar tanto la imagen como el registro en base de datos

---

## 5. Citas (Appointments)

### 5.1 Obtener Historial de Citas

**Endpoint**: `GET /appointments/user`
**Autenticación**: Requerida (JWT)
**Descripción**: Devuelve todas las citas del usuario (pasadas y futuras).

#### Query Parameters (opcionales)
```
?status={upcoming|past|all}  - Filtrar por estado (default: all)
?limit={number}              - Limitar resultados (default: 50)
?offset={number}             - Paginación (default: 0)
```

#### Response (200 OK)
```typescript
{
  "success": true,
  "data": {
    "total": number,
    "upcoming": Appointment[],  // Citas futuras ordenadas por fecha
    "past": Appointment[]       // Citas pasadas ordenadas por fecha DESC
  }
}

// Tipo Appointment
interface Appointment {
  "id": string,
  "userId": string,
  "date": string,              // ISO 8601 fecha y hora
  "status": "scheduled" | "completed" | "cancelled",
  "location": {
    "name": string,            // Nombre de la tienda/atelier
    "address": string,
    "city": string,
    "phone": string
  },
  "createdAt": string,
  "updatedAt": string
}
```

#### Errores Posibles
- **401 Unauthorized**: Token inválido
- **500 Internal Server Error**: Error interno

#### Notas
- Las citas futuras deben ordenarse por fecha ascendente (la más próxima primero)
- Las citas pasadas deben ordenarse por fecha descendente (la más reciente primero)

---

## 6. Códigos de Estado HTTP

### Éxito
- **200 OK**: Solicitud procesada correctamente
- **201 Created**: Recurso creado exitosamente
- **202 Accepted**: Solicitud aceptada, procesamiento asíncrono
- **204 No Content**: Operación exitosa sin contenido de respuesta

### Errores del Cliente
- **400 Bad Request**: Datos de entrada inválidos
- **401 Unauthorized**: No autenticado o token inválido
- **403 Forbidden**: Autenticado pero sin permisos
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto con el estado actual (ej: duplicado)
- **413 Payload Too Large**: Archivo demasiado grande
- **429 Too Many Requests**: Rate limit excedido

### Errores del Servidor
- **500 Internal Server Error**: Error interno del servidor
- **503 Service Unavailable**: Servicio temporalmente no disponible

---

## 7. Consideraciones de Seguridad

### Rate Limiting
Implementar límites para prevenir abuso:
- `/auth/send-code`: 3 intentos por teléfono cada 15 minutos
- `/auth/verify-code`: 5 intentos por teléfono cada 15 minutos
- `/tryons/upload`: 10 generaciones por usuario por hora
- Otros endpoints: 100 requests por minuto por usuario

### Validaciones
- Validar formato de teléfono (E.164)
- Validar tamaño y formato de archivos subidos
- Sanitizar todas las entradas del usuario
- Validar ownership: usuario solo puede acceder a sus recursos

### CORS
Configurar CORS apropiadamente:
```javascript
{
  origin: ['https://atelierdefolletos.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

---

## 8. Consideraciones de Performance

### Optimización de Imágenes
- Generar múltiples tamaños (thumbnail, medium, full)
- Usar formatos modernos (WebP) con fallback a JPG
- Implementar CDN para servir imágenes estáticas

### Caché
- Vestidos: cache de 1 hora (raramente cambian)
- Perfil de usuario: cache de 5 minutos
- Pruebas virtuales: cache de 30 minutos

### Paginación
Implementar paginación en todos los endpoints que devuelvan listas:
```typescript
{
  "data": [...],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

---

## Próximos Pasos

Ver documento "Backend API Specification - Phase 2.md" para funcionalidades pendientes de definición que se implementarán en la siguiente fase.

---

**Documento generado**: 2025-10-22
**Última actualización**: 2025-10-22
**Versión**: 1.0 - Phase 1
