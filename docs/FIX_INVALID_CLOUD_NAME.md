# 🔧 FIX: Invalid cloud_name Error

## ❌ Error Actual

```
Invalid cloud_name glowhair
http_code: 401
```

## 🎯 Problema

**"glowhair" NO es tu Cloud Name real.**

En la imagen que compartiste, "glowhair" aparece como el **nombre del upload preset**, pero el **Cloud Name** es diferente.

---

## 📋 Solución: Obtener tu Cloud Name Real

### Paso 1: Ir al Dashboard de Cloudinary

1. Abre tu navegador
2. Ve a: **https://cloudinary.com/console**
3. Inicia sesión con tu cuenta

### Paso 2: Ubicar "Product Environment Credentials"

En el dashboard verás una sección que dice:

```
┌─────────────────────────────────────────┐
│  Product Environment Credentials         │
├─────────────────────────────────────────┤
│  Cloud name: [TU_CLOUD_NAME_AQUI]       │ ← ESTE ES EL QUE NECESITAS
│  API Key: 624668179513197                │
│  API Secret: Tu_eIn4fiwiHhW9c5pqgFrA0l2o │
└─────────────────────────────────────────┘
```

### Paso 3: Copiar el Cloud Name

El **Cloud Name** puede verse como:
- `dxyz123abc`
- `keila-glow-hair`
- `my-company-prod`
- O cualquier otro identificador único

**NO ES "glowhair"** (ese es el nombre que le pusiste al upload preset)

---

## 🔧 Actualizar .env.local

### Archivo: `.env.local`

```bash
# ANTES (INCORRECTO):
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=glowhair  ❌

# DESPUÉS (CORRECTO):
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name_real  ✅
```

### Ejemplo Real:

Si tu cloud name es `dxyz123abc`:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=624668179513197
CLOUDINARY_API_SECRET=Tu_eIn4fiwiHhW9c5pqgFrA0l2o
# El preset sí puede llamarse "glowhair" pero eso es diferente
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=glowhair  
```

---

## 📸 Dónde Encontrar Cada Valor

### En Cloudinary Dashboard:

```
┌────────────────────────────────────────────────────────┐
│                    CLOUDINARY CONSOLE                   │
├────────────────────────────────────────────────────────┤
│                                                          │
│  Product Environment Credentials                         │
│  ════════════════════════════════                        │
│                                                          │
│  Cloud name:  [dxyz123abc]  ← COPIA ESTO                │
│  API Key:     624668179513197                            │
│  API Secret:  ******************* [Show]                 │
│                                                          │
├────────────────────────────────────────────────────────┤
│                                                          │
│  Settings → Upload → Upload Presets                      │
│  ════════════════════════════════════                    │
│                                                          │
│  Name: glowhair  ← Esto es el PRESET (diferente)        │
│  Mode: Unsigned                                          │
│                                                          │
└────────────────────────────────────────────────────────┘
```

---

## ⚠️ Diferencias Importantes

| Concepto | Ejemplo | Uso |
|----------|---------|-----|
| **Cloud Name** | `dxyz123abc` | Identificador único de tu cuenta |
| **Upload Preset** | `glowhair` | Configuración de upload (puedes tener varios) |
| **API Key** | `624668179513197` | Llave pública |
| **API Secret** | `Tu_eIn4f...` | Llave privada (NUNCA en frontend) |

---

## 🔄 Pasos Completos

### 1. Obtener Cloud Name Real

```bash
# Ve a: https://cloudinary.com/console
# Busca: "Product Environment Credentials"
# Copia: El valor de "Cloud name"
```

### 2. Actualizar .env.local

```bash
# Edita: d:\Proyecto\glowhair\.env.local

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=TU_CLOUD_NAME_REAL_AQUI
CLOUDINARY_API_KEY=624668179513197
CLOUDINARY_API_SECRET=Tu_eIn4fiwiHhW9c5pqgFrA0l2o
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=glowhair
```

### 3. Reiniciar Servidor

```bash
# En la terminal (Ctrl+C para detener)
npm run dev
```

### 4. Probar de Nuevo

```
http://localhost:3000/admin/productos/nuevo
```

---

## 🧪 Verificación

### Después de actualizar, verifica en la terminal del servidor:

```bash
# Debería mostrar tu cloud name real
🔵 POST /api/upload - Inicio
📦 Archivo recibido:
  - Nombre: imagen.jpg
  - Tipo: image/jpeg
  - Tamaño: 2.45 MB
📤 Subiendo a Cloudinary...
✅ Imagen subida exitosamente:  ← SIN ERROR 401
  - URL: https://res.cloudinary.com/TU_CLOUD_NAME_REAL/...
```

---

## 🐛 Si Aún Falla

### Verifica que las variables estén cargadas:

Agrega esto temporalmente en `src/lib/cloudinary.ts`:

```typescript
console.log('🔍 Cloudinary Config:');
console.log('  Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log('  API Key:', process.env.CLOUDINARY_API_KEY);
console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ Falta');
```

**Deberías ver:**
```
🔍 Cloudinary Config:
  Cloud Name: dxyz123abc  ← TU CLOUD NAME REAL
  API Key: 624668179513197
  API Secret: ✅ Configurado
```

**Si ves:**
```
  Cloud Name: glowhair  ← ❌ INCORRECTO
```

Entonces necesitas:
1. Verificar que editaste `.env.local` correctamente
2. Reiniciar el servidor (Ctrl+C y `npm run dev`)
3. Limpiar cache si es necesario: `rm -rf .next`

---

## ✅ Checklist

- [ ] Fui a https://cloudinary.com/console
- [ ] Encontré "Product Environment Credentials"
- [ ] Copié el valor real de "Cloud name"
- [ ] Actualicé `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` en `.env.local`
- [ ] Guardé el archivo `.env.local`
- [ ] Reinicié el servidor (Ctrl+C, luego `npm run dev`)
- [ ] Probé subir una imagen en `/admin/productos/nuevo`
- [ ] ✅ Funcionó!

---

## 🎯 Ejemplo Completo

### Tu `.env.local` debería verse así:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vxcwezxgtmnpbicgphet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary - ⚠️ REEMPLAZA CON TUS VALORES REALES
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name_real  # ← NO "glowhair"
CLOUDINARY_API_KEY=624668179513197
CLOUDINARY_API_SECRET=Tu_eIn4fiwiHhW9c5pqgFrA0l2o
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=glowhair

# OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-xijhBRTzba7oQ7P...
```

---

## 📞 Notas Adicionales

### ¿Cómo Sé Cuál es mi Cloud Name?

1. **Opción 1:** Dashboard principal de Cloudinary (esquina superior izquierda)
2. **Opción 2:** En "Settings" → "Account" → "Cloud name"
3. **Opción 3:** En cualquier URL de imagen ya subida:
   ```
   https://res.cloudinary.com/[AQUI_ESTA]/image/upload/...
                              ↑
                         Tu cloud name
   ```

### ¿Por Qué es Importante?

Cloudinary usa el cloud name para:
- Identificar tu cuenta
- Generar URLs únicas para tus imágenes
- Validar la autenticación

Sin el cloud name correcto, **no puedes subir ni acceder a imágenes**.

---

🎯 **Una vez actualizado el cloud name correcto, todo debería funcionar perfectamente!**
