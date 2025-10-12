# 🔧 FIX: Error de Array Malformado en Ingredients

## ❌ Error

```
malformed array literal: "Agua (hidrata), Propilenglicol..."
Array value must start with "{" or dimension information.
```

## 🔍 Causa

**Mismatch de tipos de datos:**

- **Supabase espera:** `ingredients TEXT[]` (array de strings)
- **Código enviaba:** `ingredients: "string largo..."` (string simple)

PostgreSQL no puede insertar un string en una columna de tipo array directamente.

## ✅ Solución Implementada

### 1. Convertir String → Array en el Backend

**Archivo:** `src/app/api/products/route.ts`

```typescript
// ANTES ❌
ingredients: body.ingredients || null,  // String

// AHORA ✅
ingredients: body.ingredients 
  ? (typeof body.ingredients === 'string' 
      ? body.ingredients.split(',').map(ing => ing.trim())
      : body.ingredients)
  : [],
```

**Cómo funciona:**
```javascript
// Si la IA envía un string:
"Agua (hidrata), Glicerina (suaviza), Extracto de Cacao (brillo)"

// Se convierte en:
[
  "Agua (hidrata)",
  "Glicerina (suaviza)",
  "Extracto de Cacao (brillo)"
]

// Si ya viene como array, lo deja como está
["Ingrediente 1", "Ingrediente 2"]  → sin cambios
```

### 2. SQL para Corregir Tipo de Columna (si es necesario)

**Archivo:** `fix_ingredients_column.sql`

Si en Supabase `ingredients` aún está como `TEXT` y no como `TEXT[]`:

```sql
-- Opción 1: Eliminar y recrear (si no hay datos importantes)
ALTER TABLE glowhair_products DROP COLUMN IF EXISTS ingredients;
ALTER TABLE glowhair_products ADD COLUMN ingredients TEXT[] DEFAULT '{}';

-- Opción 2: Convertir manteniendo datos
ALTER TABLE glowhair_products 
ALTER COLUMN ingredients TYPE TEXT[] USING ARRAY[ingredients];
```

## 📊 Flujo Completo

```
[IA analiza imagen]
       ↓
💬 OpenAI responde:
   "ingredients": "Agua (hidrata), Glicerina (suaviza), ..."
       ↓
📥 API recibe string
       ↓
🔄 Backend convierte:
   string.split(',').map(trim)
       ↓
📦 Resultado:
   ["Agua (hidrata)", "Glicerina (suaviza)", ...]
       ↓
💾 Supabase guarda array correctamente ✅
```

## 🎯 Ventajas del Enfoque

### ✅ Flexible
```typescript
// Acepta ambos formatos:
ingredients: "ing1, ing2, ing3"  → convierte a array
ingredients: ["ing1", "ing2"]    → usa directamente
```

### ✅ Tolerante a errores
```typescript
ingredients: null        → []  (array vacío)
ingredients: undefined   → []  (array vacío)
ingredients: ""          → []  (array vacío)
```

### ✅ Mejor para la BD
- Arrays permiten búsquedas eficientes
- Fácil de consultar ingredientes específicos
- Mejor para filtros y agregaciones

### ✅ Mejor para el Frontend
```typescript
// Fácil de mapear en UI:
{product.ingredients.map(ing => (
  <li key={ing}>{ing}</li>
))}
```

## 🧪 PRUEBA AHORA

### 1. Reinicia el servidor (opcional)
```bash
npm run dev
```

### 2. Ve a crear producto
```
http://localhost:3000/admin/productos/nuevo
```

### 3. Sube una imagen

La IA generará algo como:
```json
{
  "ingredients": "Agua (hidrata), Glicerina (suaviza), ..."
}
```

### 4. El backend convertirá automáticamente a:
```json
{
  "ingredients": [
    "Agua (hidrata)",
    "Glicerina (suaviza)",
    ...
  ]
}
```

### 5. Verifica en logs:
```
✅ Datos preparados para el servicio:
{
  ...
  "ingredients": ["Agua (hidrata)", "Glicerina (suaviza)", ...]
}
```

### 6. Guarda el producto

Deberías ver:
```
✅ Producto creado correctamente
```

## 🔍 SI AÚN FALLA

### Verificar tipo de columna en Supabase

```sql
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'glowhair_products' AND column_name = 'ingredients';
```

**Resultado esperado:**
```
column_name  | data_type | udt_name
-------------|-----------|----------
ingredients  | ARRAY     | _text
```

### Si muestra `TEXT` en lugar de `ARRAY`:

Ejecuta `fix_ingredients_column.sql` en Supabase SQL Editor:
```sql
ALTER TABLE glowhair_products DROP COLUMN IF EXISTS ingredients;
ALTER TABLE glowhair_products ADD COLUMN ingredients TEXT[] DEFAULT '{}';
```

## 📝 NOTAS IMPORTANTES

### Formato de Ingredientes de la IA

La IA genera ingredientes como:
```
"Ingrediente 1 (beneficio), Ingrediente 2 (beneficio), ..."
```

Separados por comas. El código hace `.split(',')` para convertir en array.

### Si quieres cambiar el separador:

Actualiza el prompt de OpenAI para usar otro separador (ej: `|` o `;`):
```typescript
// En openai.ts, cambiar:
.split(',')  →  .split('|')  o  .split(';')
```

### Alternativa: IA devuelve array directamente

Puedes actualizar el prompt de OpenAI para que devuelva un array desde el inicio:
```typescript
"ingredientes": ["Agua (hidrata)", "Glicerina (suaviza)", ...]
```

Pero el formato actual (string) es más legible para la IA y funciona bien con la conversión automática.

## 📁 Archivos Modificados

- ✅ `src/app/api/products/route.ts` - Conversión automática string → array
- ✅ `fix_ingredients_column.sql` - SQL para corregir tipo si es necesario

---

**Estado:** ✅ Implementado  
**Próximo paso:** Probar creación de producto  
**Última actualización:** 2025-10-11
