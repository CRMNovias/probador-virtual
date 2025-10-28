# 📸 Instrucciones para Subir Imágenes

## Resumen de Cambios Realizados

✅ **Diseño actualizado** - La página de avatar ahora tiene el estilo del prototipo con gradientes y mejor layout
✅ **Texto corregido** - Instrucciones actualizadas según tus especificaciones
✅ **Estructura de carpetas creada** - Listo para recibir las imágenes
✅ **Código preparado** - Solo necesitas subir las imágenes y descomentar unas líneas
✅ **Efecto de partículas añadido** - Animación sutil en el placeholder del avatar

---

## 📁 Dónde Subir las Imágenes

### 1. Imagen de Ejemplo (AvatarCreationPage)

**Ubicación exacta:**
```
D:\ClaudeCode\Probador_Virtual\src\assets\images\examples\photo-example.jpg
```

**Especificaciones:**
- Tipo de foto: Primer plano del rostro o cara y hombros
- Formato: JPG o PNG
- Tamaño recomendado: 400x600px (3:4 ratio)
- Peso máximo: 200KB
- Características:
  - Buena iluminación
  - Fondo neutro
  - Rostro centrado
  - Si es posible, hombros descubiertos (para demostrar el caso de uso)

---

### 2. Imágenes de las 3 Poses (TryOnPage)

**Ubicación exacta:**
```
D:\ClaudeCode\Probador_Virtual\src\assets\images\poses\
├── pose1.jpg  (Pose de Estudio)
├── pose2.jpg  (Pose Natural)
└── pose3.jpg  (Pose de Perfil)
```

**Especificaciones para cada pose:**

#### Pose 1: Pose de Estudio
- **Archivo:** `pose1.jpg`
- **Descripción:** Vista frontal completa, manos en cadera, pose elegante de estudio
- **Tamaño:** 300x400px (3:4 ratio)
- **Ejemplo visual:** Modelo de frente, manos en cadera, postura elegante

#### Pose 2: Pose Natural
- **Archivo:** `pose2.jpg`
- **Descripción:** Vista 3/4 ligeramente girada, pose natural y relajada
- **Tamaño:** 300x400px (3:4 ratio)
- **Ejemplo visual:** Modelo girada 45°, postura relajada

#### Pose 3: Pose de Perfil
- **Archivo:** `pose3.jpg`
- **Descripción:** Perfil lateral completo, pose elegante de perfil
- **Tamaño:** 300x400px (3:4 ratio)
- **Ejemplo visual:** Modelo de lado completo, postura elegante

---

## 🚀 Cómo Activar las Imágenes

Una vez subidas las imágenes, sigue estos pasos:

### Paso 1: Activar Imagen de Ejemplo (AvatarCreationPage)

**Archivo:** `src/pages/AvatarCreationPage.tsx`

**Línea 21:** Descomenta el import
```typescript
// ANTES:
// import photoExample from '../assets/images/examples/photo-example.jpg';

// DESPUÉS:
import photoExample from '../assets/images/examples/photo-example.jpg';
```

**Líneas 243-252:** Descomenta el bloque de imagen y comenta el placeholder
```typescript
// DESPUÉS (descomenta esto):
<img
  src={photoExample}
  alt="Ejemplo de foto ideal"
  className="w-full h-full object-cover"
/>
<div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-6">
  <p className="text-white text-sm text-center font-medium">
    ✓ Ejemplo de foto ideal: Primer plano del rostro
  </p>
</div>

// ANTES (comenta esto):
/* <div className="absolute inset-0 flex items-center justify-center">
  ... placeholder ...
</div> */
```

---

### Paso 2: Activar Imágenes de Poses (TryOnPage)

**Archivo:** `src/pages/TryOnPage.tsx`

**Líneas 20-22:** Descomenta los imports
```typescript
// ANTES:
// import pose1Img from '../assets/images/poses/pose1.jpg';
// import pose2Img from '../assets/images/poses/pose2.jpg';
// import pose3Img from '../assets/images/poses/pose3.jpg';

// DESPUÉS:
import pose1Img from '../assets/images/poses/pose1.jpg';
import pose2Img from '../assets/images/poses/pose2.jpg';
import pose3Img from '../assets/images/poses/pose3.jpg';
```

**Líneas 72, 78, 84:** Descomenta las propiedades `image`
```typescript
// DESPUÉS:
const POSES = [
  {
    id: 'pose1',
    name: 'Pose de Estudio',
    prompt: 'Vista frontal completa, manos en cadera, pose elegante de estudio',
    image: pose1Img, // DESCOMENTA ESTA LÍNEA
  },
  {
    id: 'pose2',
    name: 'Pose Natural',
    prompt: 'Vista 3/4 ligeramente girada, pose natural y relajada',
    image: pose2Img, // DESCOMENTA ESTA LÍNEA
  },
  {
    id: 'pose3',
    name: 'Pose de Perfil',
    prompt: 'Perfil lateral completo, pose elegante de perfil',
    image: pose3Img, // DESCOMENTA ESTA LÍNEA
  },
];
```

**Líneas 293-303:** Descomenta el bloque de imagen y comenta el placeholder
```typescript
// DESPUÉS (descomenta esto):
{pose.image ? (
  <img
    src={pose.image}
    alt={pose.name}
    className="w-full h-full object-cover"
  />
) : (
  <div className="flex items-center justify-center h-full text-xs text-gray-500 p-2 text-center">
    {pose.name}
  </div>
)}

// ANTES (comenta esto):
/* <div className="flex items-center justify-center h-full text-xs text-gray-500 p-2 text-center">
  {pose.name}
</div> */
```

---

## ✨ Resultado Final

Después de seguir estos pasos:

1. **AvatarCreationPage** mostrará una imagen de ejemplo en el lado derecho demostrando el tipo de foto ideal
2. **TryOnPage** mostrará las 3 poses con sus imágenes correspondientes para que el usuario pueda elegir visualmente

---

## 🔧 Verificación

Para verificar que todo funciona:

1. Sube las 4 imágenes (1 ejemplo + 3 poses)
2. Descomenta las líneas indicadas arriba
3. Ejecuta: `npm run dev`
4. Navega a:
   - `http://localhost:5173/avatar-creation` (para ver la imagen de ejemplo)
   - `http://localhost:5173/try-on?dressId=1` (para ver las poses con imágenes)

---

## 📝 Notas Adicionales

- **Optimización**: Antes de subir, optimiza las imágenes con TinyPNG o Squoosh
- **Formato**: Preferiblemente JPG para fotos (mejor compresión)
- **Consistencia**: Todas las poses deben tener el mismo estilo visual y fondo
- **Peso**: Mantén cada imagen bajo 200KB para tiempos de carga rápidos
- **Aspect Ratio**: Todas las imágenes deben mantener proporción 3:4 (portrait)

---

## 🆘 Solución de Problemas

### Error: "Cannot find module"
- Verifica que las imágenes estén en la ruta exacta especificada
- Los nombres de archivo deben ser exactamente: `photo-example.jpg`, `pose1.jpg`, `pose2.jpg`, `pose3.jpg`

### La imagen no se ve
- Verifica la extensión (`.jpg` no `.jpeg`)
- Revisa que hayas guardado el archivo después de descomentar
- Reinicia el servidor de desarrollo (`npm run dev`)

### La imagen se ve distorsionada
- Verifica que el aspect ratio sea 3:4 (ej: 300x400, 600x800, etc.)
- Ajusta el tamaño antes de subir

---

## 📚 Referencias

Para más detalles técnicos, consulta:
- `src/assets/images/README.md` - Documentación detallada de las imágenes
- `src/pages/AvatarCreationPage.tsx` - Código de la página de avatar
- `src/pages/TryOnPage.tsx` - Código de la página de try-on
