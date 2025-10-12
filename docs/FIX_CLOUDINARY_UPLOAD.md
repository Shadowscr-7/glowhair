# 🔧 FIX: Cloudinary Upload con API Backend

## ❌ Problema Anterior

El upload directo a Cloudinary fallaba con error:
```
❌ Error de Cloudinary: {}
```

**Causa:** Upload preset unsigned no configurado en Cloudinary Dashboard.

---

## ✅ Solución Implementada

Cambio de **upload directo** (requiere preset) a **upload vía API backend** (con firma).

### Ventajas:
- ✅ No requiere configurar upload preset
- ✅ Más seguro (API keys en servidor)
- ✅ Mejor control de transformaciones
- ✅ Logging detallado

---

## 🔄 Cambios Realizados

### 1. `src/hooks/useCloudinaryUpload.ts`

**Antes:** Upload directo a Cloudinary
```typescript
const response = await fetch(
  `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
  { body: formData }
);
```

**Ahora:** Upload vía API backend
```typescript
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```

### 2. `src/app/api/upload/route.ts`

✅ **Mejorado con:**
- Logging detallado en cada paso
- Transformaciones automáticas:
  - Max size: 1000x1000px
  - Quality: auto
  - Format: auto (WebP si es soportado)
- Folder correcto: `glowhair/products`
- Better error handling

### 3. `src/lib/cloudinary.ts`

✅ **Ya configurado correctamente:**
```typescript
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

---

## 🎯 Flujo Actual (Corregido)

```
Usuario selecciona imagen
    ↓
Frontend: AIImageUpload.tsx
    ↓
Hook: useCloudinaryUpload.uploadImage()
    ↓
API: POST /api/upload
    ↓
Backend: Convierte File → Base64
    ↓
Cloudinary SDK: upload con firma
    ↓
Cloudinary: Procesa y almacena
    ↓
Backend: Retorna URL permanente
    ↓
Frontend: Guarda cloudinaryUrl
    ↓
OpenAI: Analiza imagen
    ↓
DB: Guarda producto con URL
```

---

## 📊 Logs Esperados

### Console del Cliente:
```
📤 Subiendo imagen a Cloudinary vía API...
  - File: gel-cacao.jpg (2.45 MB)
✅ Imagen subida exitosamente:
  - URL: https://res.cloudinary.com/glowhair/image/upload/v.../producto.jpg
  - Public ID: glowhair/products/gel-cacao
  - Dimensiones: 800x600
```

### Console del Servidor:
```
🔵 POST /api/upload - Inicio
📦 Archivo recibido:
  - Nombre: gel-cacao.jpg
  - Tipo: image/jpeg
  - Tamaño: 2.45 MB
📤 Subiendo a Cloudinary...
✅ Imagen subida exitosamente:
  - URL: https://res.cloudinary.com/glowhair/...
  - Public ID: glowhair/products/gel-cacao
  - Dimensiones: 800x600
```

---

## 🧪 Cómo Probar

### 1. Reiniciar el servidor
```bash
# Ctrl+C para detener
npm run dev
```

### 2. Ir a Nuevo Producto
```
http://localhost:3000/admin/productos/nuevo
```

### 3. Subir imagen
- Arrastra o selecciona una imagen
- Abre la consola del navegador (F12)
- Observa los logs

**Deberías ver:**
```
📤 Subiendo imagen a Cloudinary vía API...
✅ Imagen subida exitosamente:
  - URL: https://res.cloudinary.com/glowhair/...
```

### 4. Verificar en Cloudinary
1. Login: https://cloudinary.com/console
2. Media Library
3. Folder: `glowhair/products`
4. Deberías ver la imagen subida

---

## 🔍 Troubleshooting

### Error: "No file provided"
```typescript
// Verificar que el archivo llega al backend
console.log('File:', file);
console.log('File size:', file.size);
```

### Error: "Failed to upload image"
```bash
# Verificar variables de entorno
echo $NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET

# Reiniciar servidor
npm run dev
```

### Error: "Invalid signature"
```typescript
// Verificar configuración en cloudinary.ts
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // ✅
  api_key: process.env.CLOUDINARY_API_KEY, // ✅
  api_secret: process.env.CLOUDINARY_API_SECRET, // ✅
});
```

### La imagen no aparece en /productos
1. Verificar que `cloudinaryUrl` está en el objeto `productImage`
2. Abrir DevTools → Network → Verificar respuesta de /api/upload
3. Verificar que la URL retornada es accesible (abrirla en nueva pestaña)

---

## 📦 Comparación: Antes vs Ahora

| Aspecto | Antes (Upload Directo) | Ahora (Vía API) |
|---------|------------------------|-----------------|
| **Setup** | Requiere upload preset | No requiere preset |
| **Seguridad** | API key en cliente | API keys en servidor ✅ |
| **Control** | Limitado | Total control ✅ |
| **Transformaciones** | Via preset | Programáticas ✅ |
| **Logging** | Limitado | Detallado ✅ |
| **Error handling** | Básico | Robusto ✅ |

---

## ✅ Checklist de Verificación

- [x] Hook actualizado para usar `/api/upload`
- [x] API route con logging detallado
- [x] Transformaciones configuradas
- [x] Folder correcto: `glowhair/products`
- [x] Error handling mejorado
- [x] Variables de entorno verificadas
- [x] Package `cloudinary` instalado

---

## 🎉 Resultado Final

### Ya no necesitas:
- ❌ Configurar upload preset en Cloudinary Dashboard
- ❌ Hacer upload preset público (unsigned)
- ❌ Exponer configuración en el cliente

### Ahora tienes:
- ✅ Upload seguro con firma desde servidor
- ✅ Control total de transformaciones
- ✅ Logging detallado para debugging
- ✅ URLs permanentes funcionando

---

## 🚀 Siguiente Paso

**Prueba ahora mismo:**
1. Reinicia el servidor: `npm run dev`
2. Ve a `/admin/productos/nuevo`
3. Sube una imagen
4. ✅ Debería funcionar!

Si aún hay errores, revisa los logs del servidor (terminal donde corre `npm run dev`).
