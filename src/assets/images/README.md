# Assets - Images

Esta carpeta contiene todas las imágenes utilizadas en la aplicación.

## Estructura de Carpetas

```
images/
├── examples/     # Imágenes de ejemplo para guiar al usuario
│   └── photo-example.jpg  # Ejemplo de foto ideal (primer plano rostro/hombros)
├── poses/        # Imágenes de las poses disponibles
│   ├── pose1.jpg # Pose de Estudio (frontal, manos en cadera)
│   ├── pose2.jpg # Pose Natural (3/4, natural y relajada)
│   └── pose3.jpg # Pose de Perfil (lateral completo)
└── README.md     # Este archivo
```

## Cómo Añadir Imágenes

### 1. Imagen de Ejemplo (AvatarCreationPage)

**Ubicación**: `src/assets/images/examples/photo-example.jpg`

**Descripción**: Imagen que muestra un ejemplo de foto ideal para subir (primer plano del rostro o cara y hombros)

**Recomendaciones**:
- Formato: JPG o PNG
- Tamaño: 400x600px aproximadamente
- Peso: Máximo 200KB
- Contenido: Ejemplo de primer plano de rostro o cara y hombros
- Fondo neutro
- Buena iluminación

**Uso en código**:
```typescript
import photoExample from '@assets/images/examples/photo-example.jpg';
```

---

### 2. Imágenes de Poses (TryOnPage)

**Ubicación**: `src/assets/images/poses/`

Cada pose debe tener su imagen correspondiente:

#### Pose 1: Estudio
- **Archivo**: `pose1.jpg`
- **Descripción**: Vista frontal completa, manos en cadera, pose elegante de estudio
- **Tamaño**: 300x400px

#### Pose 2: Natural
- **Archivo**: `pose2.jpg`
- **Descripción**: Vista 3/4 ligeramente girada, pose natural y relajada
- **Tamaño**: 300x400px

#### Pose 3: Perfil
- **Archivo**: `pose3.jpg`
- **Descripción**: Perfil lateral completo, pose elegante de perfil
- **Tamaño**: 300x400px

**Uso en código**:
```typescript
import pose1 from '@assets/images/poses/pose1.jpg';
import pose2 from '@assets/images/poses/pose2.jpg';
import pose3 from '@assets/images/poses/pose3.jpg';
```

---

## Proceso de Actualización

1. **Añadir las imágenes** a las carpetas correspondientes
2. **Importar en el componente** que las necesite
3. **Actualizar el código** para mostrar las imágenes

### Ejemplo para AvatarCreationPage:

```typescript
import photoExample from '@assets/images/examples/photo-example.jpg';

// En el JSX:
<img
  src={photoExample}
  alt="Ejemplo de foto ideal"
  className="w-full rounded-lg shadow-md"
/>
```

### Ejemplo para TryOnPage:

```typescript
import pose1Img from '@assets/images/poses/pose1.jpg';
import pose2Img from '@assets/images/poses/pose2.jpg';
import pose3Img from '@assets/images/poses/pose3.jpg';

const POSES = [
  {
    id: 'pose1',
    name: 'Pose de Estudio',
    prompt: 'Vista frontal completa, manos en cadera, pose elegante de estudio',
    image: pose1Img
  },
  // ...
];
```

---

## Optimización de Imágenes

Antes de subir las imágenes, optimízalas usando:

- **TinyPNG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/
- **ImageOptim** (Mac)

Esto reducirá el tamaño sin perder calidad.

---

## Notas Importantes

- ✅ **Sí usar**: JPG para fotos, PNG para gráficos con transparencia
- ❌ **No usar**: BMP, TIFF u otros formatos pesados
- 🎨 **Mantener consistencia**: Todas las poses deben tener el mismo estilo visual
- 📏 **Aspect ratio**: Mantener proporciones 3:4 (portrait) para las poses
