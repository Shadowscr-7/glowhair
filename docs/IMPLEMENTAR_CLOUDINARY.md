# 📸 Implementar Cloudinary para Imágenes de Productos

## ❌ Problema Actual

Las imágenes se guardan como **blob URLs** (`blob:http://localhost:3000/...`), que:
- Solo funcionan en la sesión actual del navegador
- Se eliminan al recargar la página
- **NO son URLs permanentes**
- No se pueden mostrar en producción

## ✅ Solución: Cloudinary

Cloudinary es un servicio gratuito (hasta 25GB) para alojar imágenes en la nube.

---

## 🚀 Pasos para Implementar

### 1. Crear Cuenta en Cloudinary

1. Ir a https://cloudinary.com/
2. Crear cuenta gratuita
3. Obtener credenciales del Dashboard:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Configurar Variables de Entorno

Agregar a `.env.local`:

```env
# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### 3. Instalar Dependencia

```bash
npm install cloudinary
```

### 4. Actualizar el Hook de Upload

**Archivo:** `src/hooks/useCloudinaryUpload.ts`

```typescript
import { useState } from 'react';

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<UploadResult | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);

      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'glowhair_products'); // Crear en Cloudinary

      // Upload a Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();

      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
      };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      setUploadError(error instanceof Error ? error.message : 'Error desconocido');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading, uploadError };
}
```

### 5. Configurar Upload Preset en Cloudinary

1. Ir a **Settings** → **Upload**
2. Scroll hasta **Upload presets**
3. Click en **Add upload preset**
4. Configurar:
   - **Preset name:** `glowhair_products`
   - **Signing Mode:** `Unsigned` (para upload desde frontend)
   - **Folder:** `glowhair/products`
   - **Transformations:** 
     - Width: 800px
     - Height: 800px
     - Crop: fill
     - Quality: auto
5. Guardar

### 6. Actualizar AIImageUpload Component

**Archivo:** `src/components/admin/AIImageUpload.tsx`

```typescript
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

// Dentro del componente
const { uploadImage, isUploading: isUploadingToCloud } = useCloudinaryUpload();

const processImage = useCallback(async (file: File) => {
  // ... validaciones existentes ...

  // 1. Crear preview local (para UI inmediata)
  const preview = URL.createObjectURL(file);
  const imageFile: ImageFile = {
    file,
    preview,
    id: `${Date.now()}-${file.name}`,
  };

  setSelectedImage(imageFile);
  onImageSelected(imageFile);

  // 2. Subir a Cloudinary
  const cloudinaryResult = await uploadImage(file);
  if (!cloudinaryResult) {
    alert('Error al subir la imagen. Intenta nuevamente.');
    return;
  }

  // 3. Actualizar con URL permanente
  const permanentImageFile = {
    ...imageFile,
    cloudinaryUrl: cloudinaryResult.url,
  };
  onImageSelected(permanentImageFile);

  // 4. Analizar con IA
  const productData = await analyzeProduct(file);
  if (productData) {
    onProductDataAnalyzed(productData);
  }
}, [/* deps */]);
```

### 7. Actualizar Formulario de Producto

**Archivo:** `src/app/admin/productos/nuevo/page.tsx`

```typescript
const handleImageSelected = (image: ImageFile) => {
  setProductImage(image);
};

// En handleSubmit
const productData = {
  // ... otros campos ...
  images: productImage?.cloudinaryUrl ? [productImage.cloudinaryUrl] : [],
  // ... resto ...
};
```

---

## 🎯 Resultado Final

✅ **Antes del submit:**
1. Usuario sube imagen
2. Se muestra preview inmediato (blob)
3. Se sube a Cloudinary en segundo plano
4. Se analiza con OpenAI
5. Se obtiene URL permanente

✅ **Al guardar producto:**
- Se guarda URL permanente de Cloudinary
- La imagen es accesible desde cualquier lugar
- Optimizada automáticamente
- CDN global (carga rápida)

---

## 🔄 Flujo Completo

```
Usuario selecciona imagen
    ↓
Preview local (blob) + Loading spinner
    ↓
Upload a Cloudinary (paralelo)
    ↓
Análisis con OpenAI
    ↓
URL permanente obtenida
    ↓
Usuario revisa y ajusta datos
    ↓
Submit con URL de Cloudinary
    ↓
Producto guardado con imagen permanente ✅
```

---

## 📊 Estado Actual

- ❌ Blob URLs temporales
- ❌ Imágenes no se ven después de recargar
- ❌ No funcionan en producción

## 🎯 Después de Implementar

- ✅ URLs permanentes de Cloudinary
- ✅ Imágenes optimizadas automáticamente
- ✅ CDN global (carga rápida)
- ✅ Funciona en producción
- ✅ Transformaciones on-the-fly
- ✅ Backup automático

---

## ⚡ Quick Start

```bash
# 1. Crear cuenta en Cloudinary
# 2. Copiar credenciales al .env.local
# 3. Instalar dependencia
npm install cloudinary

# 4. Crear upload preset "glowhair_products" en Cloudinary
# 5. Implementar los cambios en los archivos mencionados
# 6. Reiniciar servidor
npm run dev
```

---

## 🔗 Referencias

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Next.js + Cloudinary](https://cloudinary.com/documentation/next_integration)
- [Upload Presets](https://cloudinary.com/documentation/upload_presets)
