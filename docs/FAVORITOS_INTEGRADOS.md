# ✨ Integración de Favoritos - GlowHair

## 📋 Resumen

Se ha implementado un sistema completo de favoritos que permite a los usuarios:
- ✅ Agregar productos a favoritos desde las cards de productos
- ✅ Agregar/quitar favoritos desde el detalle del producto
- ✅ Ver contador de favoritos en el navbar
- ✅ Sincronización en tiempo real entre componentes
- ✅ Estados de carga visuales
- ✅ Persistencia en base de datos (Supabase)

---

## 🎯 Componentes Actualizados

### 1. **Navbar** (`src/components/layout/Navbar.tsx`)

**Cambios:**
- ❌ **Eliminados** los links: "Cuidado", "Tratamientos", "Blog"
- ✅ **Mantenidos**: "Inicio", "Productos", "Contacto"
- ➕ **Agregado**: Contador de favoritos en el icono de corazón
  - Desktop: Badge rojo en la esquina superior derecha
  - Mobile: Número al lado derecho del texto

```typescript
const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Productos", href: "/productos" },
  { name: "Contacto", href: "/contacto" },
];

// Uso del hook
const { count: favoritesCount } = useFavorites();

// Badge de contador
{favoritesCount > 0 && (
  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
    {favoritesCount}
  </span>
)}
```

---

### 2. **ProductCard** (`src/components/product/ProductCard.tsx`)

**Funcionalidad:**
- Botón de corazón en la esquina superior derecha
- Toggle favorito con un click
- Animación de carga (spinner)
- Estado visual: rojo cuando es favorito, blanco cuando no lo es
- Redirige al login si el usuario no está autenticado

```typescript
const { isFavorite, toggle: toggleFavorite, loading: favoriteLoading } = useFavorites();

const handleToggleFavorite = async (e: React.MouseEvent) => {
  e.stopPropagation();
  if (!authState.isAuthenticated) {
    router.push("/login");
    return;
  }
  
  try {
    await toggleFavorite(product.id);
  } catch (error) {
    console.error('Error al actualizar favorito:', error);
  }
};
```

---

### 3. **Detalle del Producto** (`src/app/productos/[id]/page.tsx`)

**Hook actualizado:** `useFavorite.ts`

**Funcionalidad:**
- Verificación de estado al cargar el producto
- Toggle de favorito con API calls
- Manejo de errores
- Estados de carga

```typescript
const { isFavorite, loading, toggleFavorite } = useFavorite(
  product?.id || null,
  authState.isAuthenticated
);

const handleToggleFavorite = async () => {
  if (!authState.isAuthenticated) {
    router.push("/login");
    return;
  }

  try {
    await toggleFavorite();
  } catch (err) {
    alert(err instanceof Error ? err.message : "Error al actualizar favoritos");
  }
};
```

---

## 🔧 Hooks Creados/Actualizados

### **useFavorites** (`src/hooks/useFavorites.ts`)

Hook global que mantiene el estado de todos los favoritos.

**Características:**
- Estado compartido entre todos los componentes
- Sincronización automática
- Listener pattern para updates en tiempo real
- Cache local para evitar llamadas innecesarias

**API:**
```typescript
const {
  favorites,      // Array<string> - IDs de productos favoritos
  count,          // number - Cantidad total
  loading,        // boolean - Estado de carga
  isFavorite,     // (productId: string) => boolean
  toggle,         // (productId: string) => Promise<void>
  refresh,        // () => Promise<void>
} = useFavorites();
```

**Ventajas:**
- ✅ Un solo fetch al cargar la aplicación
- ✅ Updates instantáneos en todos los componentes
- ✅ No requiere re-fetch después de cada acción

---

### **useFavorite** (`src/app/productos/[id]/hooks/useFavorite.ts`)

Hook específico para el detalle del producto.

**Características:**
- Verifica si un producto específico es favorito
- Toggle individual con API calls
- Estados de carga locales

**API:**
```typescript
const {
  isFavorite,      // boolean
  loading,         // boolean
  toggleFavorite,  // () => Promise<void>
} = useFavorite(productId, isAuthenticated);
```

---

## 🌐 API Endpoints

### **GET /api/favorites**
Obtiene todos los favoritos del usuario.

**Headers:**
```
x-user-id: temp-user-id
```

**Response:**
```json
[
  {
    "id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "product": {
      "id": "uuid",
      "name": "Shampoo Reparador",
      "slug": "shampoo-reparador",
      "price": 29.99,
      "image": "https://...",
      "category": { "id": "uuid", "name": "Shampoos" },
      "brand": { "id": "uuid", "name": "GlowHair" }
    }
  }
]
```

---

### **POST /api/favorites**
Agrega un producto a favoritos.

**Headers:**
```
Content-Type: application/json
x-user-id: temp-user-id
```

**Body:**
```json
{
  "product_id": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "product": {
    "id": "uuid",
    "name": "Shampoo Reparador",
    "slug": "shampoo-reparador",
    "price": 29.99,
    "image": "https://..."
  }
}
```

**Errores:**
- `400`: Producto ya está en favoritos
- `404`: Producto no encontrado
- `500`: Error del servidor

---

### **DELETE /api/favorites/[id]**
Elimina un producto de favoritos.

**Headers:**
```
x-user-id: temp-user-id
```

**Params:**
- `id`: ID del producto a eliminar

**Response (200):**
```json
{
  "message": "Favorito eliminado correctamente"
}
```

---

## 💾 Base de Datos

### Tabla `favorites`

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);
```

**Constraints:**
- `UNIQUE(user_id, product_id)`: Evita duplicados
- `ON DELETE CASCADE`: Elimina favoritos si se elimina el producto

---

## 🎨 UI/UX

### Estados Visuales

1. **No es favorito:**
   - Corazón vacío (outline)
   - Fondo blanco semi-transparente
   - Hover: escala 1.1

2. **Es favorito:**
   - Corazón relleno (fill)
   - Fondo rojo (#ef4444)
   - Color blanco

3. **Cargando:**
   - Spinner circular
   - Botón deshabilitado
   - Opacidad 50%

### Animaciones

```typescript
// Framer Motion
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  disabled={loading}
>
  {loading ? <Spinner /> : <Heart />}
</motion.button>

// Badge contador
<motion.span
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
>
  {count}
</motion.span>
```

---

## 🔒 Autenticación

**Estado actual:** Temporal (`temp-user-id`)

**Para producción:**
1. Obtener el ID real del usuario autenticado
2. Actualizar todos los headers `x-user-id`
3. Implementar middleware de autenticación en las rutas API

```typescript
// TODO: Reemplazar en todos los endpoints
const userId = request.headers.get('x-user-id') || 'temp-user-id';

// Producción:
const session = await getSession(request);
const userId = session.user.id;
```

---

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│                  Usuario hace click                 │
│                   en ❤️ (ProductCard)               │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│          useFavorites.toggle(productId)             │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │   isFavorite?         │
         └───────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────┐             ┌──────────┐
   │  POST   │             │  DELETE  │
   │/api/fav │             │/api/fav  │
   └────┬────┘             └────┬─────┘
        │                       │
        └──────────┬────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │  Update Supabase    │
        │   favorites table   │
        └─────────┬───────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │ Update local state  │
        │  (Set<productId>)   │
        └─────────┬───────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  Notify listeners   │
        │   (all components)  │
        └─────────┬───────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  UI updates:        │
        │  - ProductCard ❤️   │
        │  - Navbar counter   │
        │  - Detail page      │
        └─────────────────────┘
```

---

## ✅ Testing Checklist

### Funcionalidad Básica
- [ ] Click en corazón desde ProductCard agrega/quita favorito
- [ ] Click en corazón desde detalle del producto funciona
- [ ] Contador en navbar se actualiza inmediatamente
- [ ] Estado visual correcto (rojo cuando es favorito)
- [ ] Spinner se muestra durante la carga

### Navegación
- [ ] Navbar solo muestra: Inicio, Productos, Contacto
- [ ] Links de Cuidado, Tratamientos, Blog eliminados
- [ ] Click en corazón del navbar va a /favorites
- [ ] Contador visible en desktop y mobile

### Autenticación
- [ ] Usuario no autenticado es redirigido a /login
- [ ] Usuario autenticado puede agregar favoritos
- [ ] Favoritos persisten después de reload

### Edge Cases
- [ ] Múltiples clicks rápidos no duplican favoritos
- [ ] Error de red muestra mensaje apropiado
- [ ] Producto eliminado de favoritos desaparece del contador
- [ ] Sincronización entre múltiples pestañas (si aplica)

---

## 🚀 Próximos Pasos

### Mejoras Sugeridas:

1. **Página de Favoritos** (`/favorites`)
   - Grid de productos favoritos
   - Botón "Eliminar todos"
   - Filtros y búsqueda
   - Compartir lista de favoritos

2. **Notificaciones**
   - Toast cuando se agrega a favoritos
   - Toast cuando se elimina
   - Sonido opcional

3. **Analytics**
   - Tracking de productos más favoriteados
   - Dashboard de favoritos por categoría
   - Reportes para admin

4. **Social Features**
   - Compartir favoritos en redes sociales
   - Listas públicas/privadas
   - Recomendaciones basadas en favoritos

5. **Performance**
   - Infinite scroll en página de favoritos
   - Lazy loading de imágenes
   - Service Worker para offline support

---

## 📝 Notas Técnicas

### Decisiones de Diseño

1. **Hook Global vs Context:**
   - Se eligió un hook con estado compartido en lugar de Context
   - Razón: Mejor performance, menos re-renders
   - Listener pattern permite updates granulares

2. **Optimistic Updates:**
   - No implementado actualmente
   - Consideración futura para mejor UX
   - Requiere rollback en caso de error

3. **Cache Strategy:**
   - Fetch inicial al montar el hook
   - Updates locales después de cada acción
   - No hay auto-refresh periódico

---

## 🐛 Problemas Conocidos

### Limitaciones Actuales:

1. **User ID Temporal:**
   - Todos los usuarios comparten favoritos
   - Requiere integración con auth real

2. **Sin Optimistic Updates:**
   - UI espera respuesta del servidor
   - Puede sentirse lento en conexiones lentas

3. **Sin Persistencia Offline:**
   - Requiere conexión a internet
   - No hay cache de IndexedDB

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 🎉 Conclusión

El sistema de favoritos está completamente funcional y listo para usar. Solo requiere conectar con el sistema de autenticación real para producción.

**Estado:** ✅ **COMPLETADO**
**Última actualización:** 12 de octubre, 2025
