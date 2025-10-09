# 📦 API de Productos - Documentación Completa

Esta API RESTful proporciona todos los endpoints necesarios para gestionar productos en GlowHair.

## 📋 Tabla de Contenidos

- [Endpoints de Productos](#endpoints-de-productos)
- [Endpoints de Categorías](#endpoints-de-categorías)
- [Endpoints de Marcas](#endpoints-de-marcas)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Códigos de Error](#códigos-de-error)

---

## 🛍️ Endpoints de Productos

### 1. **GET /api/products**
Obtener lista de productos con filtros y paginación.

**Query Parameters:**
```typescript
{
  category?: string;      // ID de categoría
  brand?: string;         // ID de marca
  search?: string;        // Búsqueda por nombre/descripción
  minPrice?: number;      // Precio mínimo
  maxPrice?: number;      // Precio máximo
  sortBy?: string;        // featured | price-low | price-high | rating | newest | name
  page?: number;          // Número de página (default: 1)
  limit?: number;         // Items por página (default: 12)
}
```

**Respuesta Exitosa (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Shampoo Hidratante",
      "slug": "shampoo-hidratante",
      "description": "Shampoo para cabello seco",
      "price": 29.99,
      "original_price": 39.99,
      "category": {
        "id": "uuid",
        "name": "Shampoos"
      },
      "brand": {
        "id": "uuid",
        "name": "GlowHair"
      },
      "stock": 50,
      "images": ["url1", "url2"],
      "rating": 4.5,
      "review_count": 120,
      "is_featured": true
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 12,
  "totalPages": 9
}
```

**Ejemplo de llamada:**
```typescript
// Obtener productos de categoría "shampoos", ordenados por precio bajo
const response = await fetch('/api/products?category=uuid&sortBy=price-low&page=1&limit=12');
const data = await response.json();
```

---

### 2. **GET /api/products/[id]**
Obtener un producto específico por ID.

**Parámetros de Ruta:**
- `id`: UUID del producto

**Respuesta Exitosa (200):**
```json
{
  "id": "uuid",
  "name": "Shampoo Hidratante",
  "slug": "shampoo-hidratante",
  "description": "Descripción completa del producto...",
  "price": 29.99,
  "original_price": 39.99,
  "category": { "id": "uuid", "name": "Shampoos" },
  "brand": { "id": "uuid", "name": "GlowHair" },
  "stock": 50,
  "sku": "PROD-12345",
  "images": ["url1", "url2", "url3"],
  "features": ["Hidratación profunda", "Sin sulfatos"],
  "benefits": ["Cabello más suave", "Brillo natural"],
  "ingredients": "Aqua, Glycerin, ...",
  "usage_instructions": "Aplicar sobre cabello mojado...",
  "hair_types": ["Seco", "Normal"],
  "size": "500ml",
  "rating": 4.5,
  "review_count": 120,
  "is_featured": true,
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

**Errores:**
- `404`: Producto no encontrado

---

### 3. **GET /api/products/slug/[slug]**
Obtener un producto por su slug (URL amigable).

**Parámetros de Ruta:**
- `slug`: Slug del producto (ej: "shampoo-hidratante")

**Respuesta:** Igual que GET /api/products/[id]

---

### 4. **GET /api/products/featured**
Obtener productos destacados.

**Query Parameters:**
```typescript
{
  limit?: number;  // Cantidad de productos (default: 6)
}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "uuid",
    "name": "Producto 1",
    ...
  },
  ...
]
```

---

### 5. **GET /api/products/search**
Buscar productos por nombre o descripción.

**Query Parameters:**
```typescript
{
  q: string;        // Término de búsqueda (mínimo 2 caracteres)
  limit?: number;   // Resultados máximos (default: 10)
}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "uuid",
    "name": "Shampoo Hidratante",
    ...
  },
  ...
]
```

**Errores:**
- `400`: Término de búsqueda muy corto (< 2 caracteres)

**Ejemplo:**
```typescript
const response = await fetch('/api/products/search?q=shampoo&limit=10');
```

---

### 6. **GET /api/products/[id]/related**
Obtener productos relacionados.

**Parámetros de Ruta:**
- `id`: UUID del producto

**Query Parameters:**
```typescript
{
  category?: string;  // ID de categoría para filtrar (opcional)
}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "uuid",
    "name": "Producto Relacionado 1",
    ...
  },
  ...
]
```

---

### 7. **POST /api/products** 🔒 Admin
Crear un nuevo producto.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Nuevo Shampoo",
  "slug": "nuevo-shampoo",           // Opcional (se genera automáticamente)
  "description": "Descripción...",
  "price": 29.99,
  "original_price": 39.99,           // Opcional
  "category_id": "uuid",
  "brand_id": "uuid",                // Opcional
  "stock": 100,
  "sku": "PROD-12345",               // Opcional (se genera automáticamente)
  "images": ["url1", "url2"],        // Opcional (default: [])
  "features": ["Feature 1"],         // Opcional (default: [])
  "benefits": ["Benefit 1"],         // Opcional (default: [])
  "ingredients": "Lista...",         // Opcional
  "usage_instructions": "Cómo...",   // Opcional
  "hair_types": ["Seco"],            // Opcional (default: [])
  "size": "500ml",                   // Opcional
  "rating": 0,                       // Opcional (default: 0)
  "review_count": 0,                 // Opcional (default: 0)
  "is_featured": false,              // Opcional (default: false)
  "is_active": true                  // Opcional (default: true)
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": "uuid-nuevo",
  "name": "Nuevo Shampoo",
  ...
}
```

**Errores:**
- `400`: Campos requeridos faltantes
- `403`: No autorizado (requiere admin)

---

### 8. **PUT /api/products/[id]** 🔒 Admin
Actualizar un producto existente.

**Parámetros de Ruta:**
- `id`: UUID del producto

**Body:** (Todos los campos son opcionales, solo envía los que quieres actualizar)
```json
{
  "name": "Nombre Actualizado",
  "price": 24.99,
  "stock": 150,
  "is_featured": true
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": "uuid",
  "name": "Nombre Actualizado",
  ...
}
```

**Errores:**
- `400`: Error en la actualización
- `403`: No autorizado
- `404`: Producto no encontrado

---

### 9. **DELETE /api/products/[id]** 🔒 Admin
Eliminar un producto (soft delete - marca como inactivo).

**Parámetros de Ruta:**
- `id`: UUID del producto

**Respuesta Exitosa (200):**
```json
{
  "message": "Producto eliminado correctamente"
}
```

**Errores:**
- `400`: Error al eliminar
- `403`: No autorizado
- `404`: Producto no encontrado

---

## 📁 Endpoints de Categorías

### 10. **GET /api/categories**
Obtener todas las categorías activas.

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "uuid",
    "name": "Shampoos",
    "slug": "shampoos",
    "description": "Descripción de la categoría",
    "icon": "icon-name",
    "display_order": 1,
    "is_active": true
  },
  ...
]
```

---

### 11. **GET /api/categories/[id]**
Obtener una categoría específica por ID.

**Respuesta Exitosa (200):**
```json
{
  "id": "uuid",
  "name": "Shampoos",
  "slug": "shampoos",
  "description": "Descripción...",
  "icon": "icon-name",
  "display_order": 1,
  "is_active": true
}
```

---

## 🏷️ Endpoints de Marcas

### 12. **GET /api/brands**
Obtener todas las marcas activas.

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "uuid",
    "name": "GlowHair",
    "slug": "glowhair",
    "description": "Descripción de la marca",
    "logo": "url-logo",
    "website": "https://glowhair.com",
    "is_active": true
  },
  ...
]
```

---

### 13. **GET /api/brands/[id]**
Obtener una marca específica por ID.

**Respuesta Exitosa (200):**
```json
{
  "id": "uuid",
  "name": "GlowHair",
  "slug": "glowhair",
  "description": "Descripción...",
  "logo": "url-logo",
  "website": "https://glowhair.com",
  "is_active": true
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Obtener productos de una categoría con paginación
```typescript
async function getShampoos(page = 1) {
  const response = await fetch(
    `/api/products?category=cat-shampoos-uuid&page=${page}&limit=12&sortBy=featured`
  );
  
  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }
  
  const data = await response.json();
  return data;
}
```

### Ejemplo 2: Buscar productos
```typescript
async function searchProducts(query: string) {
  const response = await fetch(
    `/api/products/search?q=${encodeURIComponent(query)}&limit=10`
  );
  
  const products = await response.json();
  return products;
}
```

### Ejemplo 3: Crear un nuevo producto (Admin)
```typescript
async function createProduct(productData: any) {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  const newProduct = await response.json();
  return newProduct;
}
```

### Ejemplo 4: Actualizar stock de un producto
```typescript
async function updateStock(productId: string, newStock: number) {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stock: newStock }),
  });
  
  if (!response.ok) {
    throw new Error('Error al actualizar stock');
  }
  
  const updated = await response.json();
  return updated;
}
```

### Ejemplo 5: Obtener productos con filtros múltiples
```typescript
async function getFilteredProducts() {
  const params = new URLSearchParams({
    category: 'cat-uuid',
    minPrice: '10',
    maxPrice: '50',
    search: 'hidratante',
    sortBy: 'price-low',
    page: '1',
    limit: '20'
  });
  
  const response = await fetch(`/api/products?${params}`);
  const data = await response.json();
  return data;
}
```

---

## ⚠️ Códigos de Error

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Parámetros inválidos o faltantes |
| 403 | Forbidden | No autorizado (requiere permisos admin) |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## 🔐 Autenticación (Futuro)

Actualmente, los endpoints de creación, actualización y eliminación no requieren autenticación (están comentados), pero deberías implementar:

1. **Middleware de autenticación** para verificar el token de usuario
2. **Verificación de rol admin** antes de permitir operaciones de escritura
3. **Rate limiting** para prevenir abuso

Ejemplo de implementación:

```typescript
// En cada ruta protegida
const userId = await getUserIdFromSession(request);
const isAdmin = await checkIfUserIsAdmin(userId);

if (!isAdmin) {
  return NextResponse.json(
    { error: 'No autorizado' },
    { status: 403 }
  );
}
```

---

## 📊 Base de Datos

Todas las APIs interactúan con las siguientes tablas en Supabase:

- `glowhair_products` - Productos
- `glowhair_categories` - Categorías
- `glowhair_brands` - Marcas

Ver `complete_database_setup.sql` para el esquema completo.

---

## 🚀 Testing

Puedes probar las APIs usando:

### Con cURL:
```bash
# GET productos
curl http://localhost:3000/api/products

# GET búsqueda
curl "http://localhost:3000/api/products/search?q=shampoo"

# POST crear producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","description":"Test","price":29.99,"category_id":"uuid","stock":50}'
```

### Con Postman o Thunder Client:
Importa esta colección (en formato JSON) para probar todos los endpoints.

---

## 📝 Notas Importantes

1. **Paginación**: Por defecto, GET /api/products devuelve 12 items por página
2. **Soft Delete**: DELETE no borra físicamente, solo marca `is_active = false`
3. **Slugs**: Se generan automáticamente si no se proporcionan
4. **Imágenes**: Se espera un array de URLs (deben subirse primero a Cloudinary)
5. **Filtros**: Todos los filtros son opcionales y se pueden combinar

---

## 🔄 Próximos Pasos

- [ ] Implementar autenticación en rutas protegidas
- [ ] Agregar rate limiting
- [ ] Implementar caché con Redis
- [ ] Agregar endpoints para reviews de productos
- [ ] Implementar webhooks para notificaciones de stock bajo
- [ ] Agregar analytics de productos más vistos

---

¿Necesitas ayuda con algún endpoint específico? Consulta los ejemplos o contacta al equipo de desarrollo.
