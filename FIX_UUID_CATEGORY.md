# 🔧 FIX: Error UUID en category_id

## ❌ Problema Resuelto

**Error anterior:**
```
invalid input syntax for type uuid: "1"
```

## 🎯 Causa

El formulario estaba enviando `category_id: 1` (número entero) pero Supabase espera un UUID como:
```
category_id: "550e8400-e29b-41d4-a916-446655440000"
```

## ✅ Solución Implementada

### 1. Cargar Categorías Dinámicamente desde la API

**Antes (hardcoded):**
```typescript
const categories = ["Champús", "Acondicionadores", "Mascarillas", ...]
```

**Ahora (desde API):**
```typescript
const [categories, setCategories] = useState<Category[]>([]);

useEffect(() => {
  const fetchCategories = async () => {
    const response = await fetch('/api/categories');
    const data = await response.json();
    setCategories(data);
  };
  fetchCategories();
}, []);
```

### 2. Guardar Tanto el Nombre como el ID

**FormData actualizado:**
```typescript
interface ProductFormData {
  category: string;      // Nombre (ej: "Champús")
  categoryId: string;    // UUID (ej: "550e8...")
  // ... otros campos
}
```

### 3. Mapear Nombre → UUID

**Nueva función:**
```typescript
const getCategoryIdByName = (categoryName: string): string => {
  const category = categories.find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category?.id || categories[0]?.id || '';
};
```

### 4. Actualizar Select de Categorías

**Antes:**
```tsx
<select value={formData.category}>
  {categories.map(cat => (
    <option value={cat}>{cat}</option>  // String simple
  ))}
</select>
```

**Ahora:**
```tsx
<select value={formData.categoryId}
  onChange={(e) => {
    const selected = categories.find(c => c.id === e.target.value);
    setFormData({
      category: selected?.name || '',
      categoryId: e.target.value
    });
  }}>
  {categories.map(cat => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>
```

### 5. IA Auto-completado

Cuando la IA analiza la imagen y sugiere una categoría:
```typescript
const handleProductDataAnalyzed = (data) => {
  const categoryId = getCategoryIdByName(data.category);
  
  setFormData({
    category: data.category,      // "Champús" (para mostrar)
    categoryId: categoryId,        // UUID (para enviar a BD)
    // ... otros campos
  });
};
```

## 📊 Flujo Completo

```
1. Usuario sube imagen
   ↓
2. IA analiza → retorna "Champús"
   ↓
3. getCategoryIdByName("Champús") → busca en array cargado
   ↓
4. Encuentra: { id: "550e8...", name: "Champús" }
   ↓
5. Guarda ambos valores en formData
   ↓
6. Al enviar formulario: usa categoryId (UUID)
   ↓
7. ✅ Supabase recibe UUID válido
```

## 🧪 Verificar en Supabase

Para confirmar que tus categorías usan UUIDs:

```sql
SELECT id, name FROM glowhair_categories;
```

Deberías ver algo como:
```
id                                   | name
------------------------------------ | ---------------
550e8400-e29b-41d4-a916-446655440000 | Champús
6ba7b810-9dad-11d1-80b4-00c04fd430c8 | Acondicionadores
...
```

## ✅ Archivos Modificados

- ✅ `src/app/admin/productos/nuevo/page.tsx`
  - Agregado estado `categories: Category[]`
  - Agregado `categoryId` al FormData
  - useEffect para cargar categorías desde `/api/categories`
  - Función `getCategoryIdByName()` para mapear
  - Select actualizado para usar objetos completos
  - Handler de IA actualizado para buscar UUID

## 🚀 Resultado Esperado

Ahora cuando crees un producto:
```json
{
  "category_id": "550e8400-e29b-41d4-a916-446655440000",  // ✅ UUID válido
  "name": "Mi Producto",
  ...
}
```

En lugar de:
```json
{
  "category_id": 1,  // ❌ Número inválido
  ...
}
```

## 🎯 Siguiente Paso

**PRUEBA NUEVAMENTE:**
1. Ve a `/admin/productos/nuevo`
2. Sube una imagen
3. Llena los datos
4. Guarda el producto
5. Debería funcionar sin error de UUID ✅

---

**Fecha:** 2025-10-11  
**Estado:** ✅ Corregido
