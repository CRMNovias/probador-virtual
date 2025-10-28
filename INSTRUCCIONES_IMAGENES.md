# Instrucciones para Agregar Imágenes

## 📁 Estructura de Carpetas Creada

```
src/assets/images/
├── examples/          ← Imágenes de ejemplo para la pantalla de carga
│   ├── photo-example.jpg
│   └── model-example.jpg
└── poses/            ← Imágenes de poses para el probador
    ├── pose1.jpg
    ├── pose2.jpg
    └── pose3.jpg
```

## 🖼️ Imágenes Necesarias

### 1. **Imágenes de Ejemplo** (`src/assets/images/examples/`)

#### `photo-example.jpg`
- **Descripción**: Foto de primer plano del rostro (estilo pasaporte)
- **Especificaciones**:
  - Tamaño recomendado: 600x800px (3:4 ratio)
  - Formato: JPG o PNG
  - Peso máximo: 500KB
  - Buena iluminación frontal
  - Fondo neutro
  - Rostro centrado mirando al frente

#### `model-example.jpg`
- **Descripción**: Avatar/modelo generado de cuerpo completo
- **Especificaciones**:
  - Tamaño recomendado: 600x800px (3:4 ratio)
  - Formato: JPG o PNG
  - Peso máximo: 500KB
  - Vista completa del cuerpo
  - Pose elegante

### 2. **Imágenes de Poses** (`src/assets/images/poses/`)

#### `pose1.jpg` - Pose de Estudio
- Vista frontal completa
- Manos en cadera
- Pose elegante de estudio
- Tamaño: 240x336px (20:28 ratio)
- Formato: JPG o PNG

#### `pose2.jpg` - Pose Natural
- Vista 3/4 ligeramente girada
- Pose natural y relajada
- Tamaño: 240x336px (20:28 ratio)
- Formato: JPG o PNG

#### `pose3.jpg` - Pose de Perfil
- Perfil lateral completo
- Pose elegante de perfil
- Tamaño: 240x336px (20:28 ratio)
- Formato: JPG o PNG

## 🔧 Cómo Activar las Imágenes

Una vez que hayas colocado las imágenes en las carpetas correctas:

### Para activar imágenes de ejemplo en ExampleComparison:
Abre el archivo `src/components/avatar/ExampleComparison.tsx` y busca las líneas que dicen:
```typescript
// TODO: Uncomment when images are available
// import photoExample from '../../assets/images/examples/photo-example.jpg';
// import modelExample from '../../assets/images/examples/model-example.jpg';
```

### Para activar imágenes de poses:
Abre el archivo `src/pages/TryOnPage.tsx` y busca las líneas que dicen:
```typescript
// import pose1Img from '../assets/images/poses/pose1.jpg';
// import pose2Img from '../assets/images/poses/pose2.jpg';
// import pose3Img from '../assets/images/poses/pose3.jpg';
```

## 📝 Notas Importantes

1. **Nombres de archivos**: Los nombres deben coincidir exactamente con los especificados arriba
2. **Formatos aceptados**: JPG, PNG, WEBP
3. **Optimización**: Comprime las imágenes antes de subirlas para mejor rendimiento
4. **Copyright**: Asegúrate de tener derechos sobre las imágenes que uses
5. **Privacy**: No uses fotos reales de clientes sin su consentimiento explícito

## 🎨 Recomendaciones de Estilo

Para mantener la estética elegante de la aplicación:
- Usa fondos neutros (beige, blanco, gris claro)
- Buena iluminación natural
- Colores que combinen con la paleta: #8C6F5A, #6B5647, #F5F3EF
- Estilo profesional y elegante (estilo editorial de revista de bodas)

## 🚀 Después de Agregar las Imágenes

1. Coloca las imágenes en las carpetas correspondientes
2. Descomenta las líneas de import en los archivos mencionados
3. Reinicia el servidor de desarrollo (`npm run dev`)
4. Verifica que las imágenes se muestren correctamente

Si tienes problemas con las imágenes, verifica:
- ✅ Los nombres de archivo coinciden exactamente
- ✅ Las extensiones son correctas (.jpg, no .jpeg)
- ✅ Las rutas de import son correctas
- ✅ El servidor de desarrollo fue reiniciado
