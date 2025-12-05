# Backend API Specification - Phase 2

**Proyecto**: Atelier de Bodas - Probador Virtual de Vestidos de Novia
**Frontend Repository**: game-lovers/fit-checker.git
**Fecha**: 2025-10-22
**Versión**: 1.0 (Phase 2 - Pendiente de Definición)
**Estado**: DRAFT - Requiere definición detallada

## Información General

Este documento contiene las funcionalidades y endpoints que se implementarán en la **segunda fase** del proyecto. Todos los puntos listados aquí están **pendientes de definición completa** y requieren coordinación entre los equipos frontend y backend antes de su implementación.

---

## 1. Gestión de Vestidos (Catálogo)

**Estado**: Pendiente de definición

### Endpoints Propuestos

#### 1.1 Obtener Imagen de Vestido
```
GET /dress/:id
```

**Descripción**: Devuelve información e imagen de un vestido específico.

**Pendiente de definir**:
- ¿Qué información adicional debe incluirse del vestido? (nombre, descripción, categoría, diseñador, temporada, precio)
- ¿El catálogo de vestidos es estático o dinámico?
- ¿Se requiere endpoint para listar todos los vestidos disponibles?
- ¿Los vestidos tienen categorías/filtros? (estilo, temporada, rango de precio)
- ¿Hay sistema de favoritos o "me gusta" para vestidos?
- ¿Información de disponibilidad física en tienda?

#### 1.2 Listar Vestidos (Catálogo Completo)
```
GET /dresses
GET /dresses?category={category}&page={page}&limit={limit}
```

**Pendiente de definir**:
- Estructura de paginación
- Filtros disponibles (categoría, estilo, precio, diseñador)
- Ordenamiento (más recientes, populares, alfabético)
- Incluir información de "trending" o "recomendados"

#### 1.3 Listar Categorías de Vestidos
```
GET /dresses/categories
```

**Pendiente de definir**:
- ¿Qué categorías existen? (Princesa, Sirena, A-line, Bohemio, etc.)
- ¿Las categorías son jerárquicas?
- ¿Incluir contador de vestidos por categoría?

#### 1.4 Listar Poses Disponibles
```
GET /poses
GET /poses?dressId={id}
```

**Pendiente de definir**:
- ¿Cuántas poses hay? (frontal, lateral, 3/4, espalda, etc.)
- ¿Las poses son globales o específicas por vestido?
- ¿Incluir imagen de referencia de cada pose?
- ¿Hay metadatos de las poses? (nombre, descripción, icono)

---

## 2. Compartir Pruebas Virtuales

**Estado**: Pendiente de definición

### Endpoints Propuestos

#### 2.1 Obtener HTML de Imagen Compartida
```
GET /share/:id
```

**Descripción**: Genera una página HTML pública para compartir una prueba virtual en redes sociales.

**Pendiente de definir**:
- ¿El link de compartir debe ser permanente o temporal?
- ¿Tiempo de expiración del link de compartir? (7 días, 30 días, permanente)
- ¿Requiere Open Graph tags para redes sociales?
- ¿Incluir botones de compartir en redes sociales?
- ¿Sistema de analytics para rastrear visualizaciones?
- ¿Opción de compartir privado (con contraseña)?
- ¿Watermark o branding en imágenes compartidas?
- ¿Call-to-action en la página de compartir? (link a la app, reservar cita)

#### 2.2 Generar Link de Compartir
```
POST /tryons/:id/share
```

**Pendiente de definir**:
- ¿Se genera automáticamente al crear el try-on o bajo demanda?
- ¿Opciones de privacidad? (público, privado, solo con link)
- ¿Posibilidad de agregar mensaje personalizado?

#### 2.3 Estadísticas de Compartir
```
GET /tryons/:id/share/stats
```

**Pendiente de definir**:
- ¿Qué métricas rastrear? (vistas, clicks, conversiones)
- ¿Rastrear red social de origen?

---

## 3. Endpoints Complementarios

**Estado**: Pendiente de definición

### 3.1 Gestión de Citas (CRUD Completo)

#### Crear Cita
```
POST /appointments
```

**Pendiente de definir**:
- ¿El usuario puede crear citas directamente o requiere aprobación?
- ¿Integración con calendario/sistema de reservas existente?
- ¿Validación de disponibilidad en tiempo real?
- ¿Confirmación por SMS/email?
- ¿Sistema de recordatorios automáticos?

#### Modificar Cita
```
PUT /appointments/:id
```

**Pendiente de definir**:
- ¿Restricciones de tiempo para modificar? (ej: no modificar con menos de 24h)
- ¿Notificación al atelier cuando se modifica?
- ¿Límite de modificaciones por cita?

#### Cancelar Cita
```
DELETE /appointments/:id
```

**Pendiente de definir**:
- ¿Políticas de cancelación? (plazo mínimo, penalizaciones)
- ¿Razones de cancelación requeridas?
- ¿Notificación al atelier?

#### Listar Horarios Disponibles
```
GET /appointments/availability?date={date}&location={location}
```

**Pendiente de definir**:
- ¿Sistema de disponibilidad en tiempo real?
- ¿Diferentes duraciones de cita según tipo?
- ¿Múltiples locaciones?

---

### 3.2 Refresh Token

```
POST /auth/refresh
```

**Pendiente de definir**:
- ¿Tiempo de expiración del JWT? (1 hora, 24 horas)
- ¿Tiempo de expiración del refresh token? (7 días, 30 días)
- ¿Rotación de refresh tokens?
- ¿Límite de dispositivos simultáneos?

---

### 3.3 Estadísticas de Usuario

```
GET /user/stats
```

**Pendiente de definir**:
- ¿Qué estadísticas mostrar?
  - Total de pruebas virtuales generadas
  - Vestidos probados
  - Vestidos favoritos
  - Tiempo total en la app
  - Pruebas compartidas
  - Citas completadas
- ¿Dashboard de actividad?
- ¿Comparación con otros usuarios? (gamificación)

---

### 3.4 Favoritos/Wishlist

```
POST /user/favorites/:dressId
DELETE /user/favorites/:dressId
GET /user/favorites
```

**Pendiente de definir**:
- ¿Sistema de favoritos para vestidos?
- ¿Sistema de favoritos para try-ons?
- ¿Compartir lista de favoritos?
- ¿Notificaciones cuando vestido favorito está disponible?

---

### 3.5 Búsqueda Avanzada

```
GET /search?q={query}&type={dresses|tryons|appointments}
```

**Pendiente de definir**:
- ¿Búsqueda por texto?
- ¿Búsqueda por imagen? (similar a este vestido)
- ¿Filtros avanzados combinados?
- ¿Sugerencias de búsqueda?

---

## 4. Funcionalidades Avanzadas Pendientes

### 4.1 Notificaciones Push

**Pendiente de definir**:
- ¿Sistema de notificaciones push?
- ¿Tipos de notificaciones? (recordatorio cita, nueva colección, try-on listo)
- ¿Preferencias de notificación configurables?
- Endpoints propuestos:
  ```
  POST /user/notifications/register
  PUT /user/notifications/preferences
  GET /user/notifications
  ```

### 4.2 Sistema de Comentarios/Feedback

**Pendiente de definir**:
- ¿Los usuarios pueden dejar comentarios en sus try-ons?
- ¿Compartir con amigas para recibir opiniones?
- ¿Sistema de votación/encuestas?
- Endpoints propuestos:
  ```
  POST /tryons/:id/comments
  GET /tryons/:id/comments
  ```

### 4.3 Comparación de Vestidos

**Pendiente de definir**:
- ¿Funcionalidad de comparar 2+ vestidos lado a lado?
- ¿Guardar comparaciones?
- Endpoints propuestos:
  ```
  POST /compare
  GET /compare/:id
  ```

### 4.4 Historial y Actividad

**Pendiente de definir**:
- ¿Registro completo de actividad del usuario?
- ¿Timeline de pruebas virtuales?
- Endpoints propuestos:
  ```
  GET /user/activity
  GET /user/history
  ```

### 4.5 Recomendaciones Personalizadas

**Pendiente de definir**:
- ¿Sistema de recomendaciones basado en preferencias?
- ¿ML para sugerir vestidos similares?
- Endpoints propuestos:
  ```
  GET /recommendations
  GET /dresses/:id/similar
  ```

---

## 5. Consideraciones Técnicas Pendientes

### 5.1 WebSockets / Real-time

**Pendiente de definir**:
- ¿Notificaciones en tiempo real cuando avatar/try-on están listos?
- ¿Actualización en tiempo real de disponibilidad de citas?
- ¿Chat en vivo con atelier?

### 5.2 Procesamiento Asíncrono

**Pendiente de definir**:
- ¿Sistema de jobs/queues para generación de avatares y try-ons?
- ¿Endpoints de polling vs webhooks?
- ¿Estado de procesamiento detallado? (0-100%, tiempo estimado)

### 5.3 Versionado de API

**Pendiente de definir**:
- ¿Estrategia de versionado? (path /v1/, header, subdomain)
- ¿Deprecation policy?
- ¿Changelog de API?

---

## 6. Tareas Pendientes Antes de Phase 2

### Tareas de Coordinación

- [ ] **Reunión de alineación**: Revisar todos los puntos pendientes de definición
- [ ] **Priorización**: Decidir qué funcionalidades son críticas para Phase 2
- [ ] **Diseño de UX**: Definir flujos de usuario para nuevas funcionalidades
- [ ] **Arquitectura**: Decidir procesamiento síncrono vs asíncrono
- [ ] **Políticas de negocio**: Definir reglas de cancelación, privacidad, compartir, etc.

### Tareas de Definición

#### Catálogo de Vestidos
- [ ] Definir estructura de datos de vestidos
- [ ] Decidir sistema de categorización
- [ ] Definir sistema de poses (globales vs por vestido)
- [ ] Especificar filtros y ordenamiento

#### Sistema de Compartir
- [ ] Definir políticas de privacidad de links compartidos
- [ ] Decidir tiempo de expiración
- [ ] Especificar meta tags para redes sociales
- [ ] Decidir sistema de analytics/tracking

#### Gestión de Citas
- [ ] Integración con sistema de reservas existente
- [ ] Definir flujo de confirmación
- [ ] Políticas de cancelación y modificación
- [ ] Sistema de notificaciones/recordatorios

#### Funcionalidades Avanzadas
- [ ] Decidir cuáles implementar en Phase 2
- [ ] Priorizar por valor vs esfuerzo
- [ ] Validar con usuarios/stakeholders

### Tareas Técnicas

- [ ] Decidir estrategia de versionado de API
- [ ] Definir sistema de procesamiento asíncrono
- [ ] Evaluar necesidad de WebSockets
- [ ] Definir estrategia de caché avanzada
- [ ] Especificar sistema de logging y monitoreo
- [ ] Documentar con Swagger/OpenAPI

---

## 7. Roadmap Sugerido

### Phase 2A (Prioridad Alta)
- Catálogo de vestidos completo con filtros
- Sistema de compartir básico
- CRUD completo de citas
- Refresh token

### Phase 2B (Prioridad Media)
- Sistema de favoritos
- Estadísticas de usuario
- Búsqueda avanzada
- Notificaciones push

### Phase 2C (Prioridad Baja / Futuro)
- Sistema de comentarios
- Comparación de vestidos
- Recomendaciones personalizadas
- Chat en vivo

---

## Notas Finales

Este documento debe ser revisado y completado antes de iniciar la implementación de Phase 2. Cada sección marcada como "Pendiente de definir" requiere una decisión concreta del equipo de producto, UX y desarrollo.

**Próximos pasos**:
1. Agendar reunión de planning Phase 2
2. Priorizar funcionalidades
3. Completar definiciones pendientes
4. Generar especificación técnica detallada
5. Estimar esfuerzo de desarrollo

---

**Documento generado**: 2025-10-22
**Última actualización**: 2025-10-22
**Versión**: 1.0 - Phase 2 Draft
**Estado**: PENDIENTE DE REVISIÓN Y APROBACIÓN
