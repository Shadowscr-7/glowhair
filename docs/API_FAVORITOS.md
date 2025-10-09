# ❤️ API de Favoritos - Documentación Completa

Esta documentación cubre todas las APIs REST para el manejo de favoritos en GlowHair.

## 📋 Tabla de Contenidos
- [Endpoints Disponibles](#endpoints-disponibles)
- [Modelos de Datos](#modelos-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Códigos de Error](#códigos-de-error)

---

## 🔗 Endpoints Disponibles

### 1. Listar Favoritos
**GET** `/api/favorites`

Obtiene todos los productos favoritos del usuario con información completa.

**Headers:**
```
x-user-id: string (requerido temporalmente)
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "fav-123",
    "created_at": "2024-01-15T10:30:00Z",
    "product": {
      "id": "prod-456",
      "name": "Shampoo Hidratante",
      "slug": "shampoo-hidratante",
      "description": "Shampoo para cabello seco",
      "price": 25.99,
      "original_price": 29.99,
      "image": "https://example.com/image.jpg",
      "stock": 50,
      "is_active": true,
      "category": {
        "id": "cat-1",
        "name": "Shampoos"
      },
      "brand": {
        "id": "brand-1",
        "name": "Kerastase"
      }
    }
  }
]
```

**Errores:**
- `500` - Error del servidor

---

### 2. Agregar a Favoritos
**POST** `/api/favorites`

Agrega un producto a la lista de favoritos del usuario.

**Headers:**
```
x-user-id: string (requerido temporalmente)
Content-Type: application/json
```

**Body:**
```json
{
  "product_id": "prod-456"
}
```

**Campos del Body:**
- `product_id` (string, requerido) - ID del producto a agregar

**Respuesta Exitosa (201):**
```json
{
  "id": "fav-123",
  "created_at": "2024-01-15T10:30:00Z",
  "product": {
    "id": "prod-456",
    "name": "Shampoo Hidratante",
    "slug": "shampoo-hidratante",
    "price": 25.99,
    "image": "https://example.com/image.jpg"
  }
}
```

**Errores:**
- `400` - product_id es requerido
- `400` - El producto ya está en favoritos
- `404` - Producto no encontrado
- `500` - Error del servidor

---

### 3. Eliminar de Favoritos
**DELETE** `/api/favorites/[productId]`

Elimina un producto específico de los favoritos.

**Parámetros de URL:**
- `productId` - ID del producto a eliminar

**Headers:**
```
x-user-id: string (requerido temporalmente)
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Producto eliminado de favoritos correctamente"
}
```

**Errores:**
- `500` - Error del servidor

---

### 4. Verificar si es Favorito
**GET** `/api/favorites/[productId]`

Verifica si un producto está en la lista de favoritos del usuario.

**Parámetros de URL:**
- `productId` - ID del producto a verificar

**Headers:**
```
x-user-id: string (requerido temporalmente)
```

**Respuesta Exitosa (200):**
```json
{
  "isFavorite": true
}
```

**Errores:**
- `500` - Error del servidor

---

### 5. Contador de Favoritos
**GET** `/api/favorites/count`

Obtiene el número total de favoritos del usuario.

**Headers:**
```
x-user-id: string (requerido temporalmente)
```

**Respuesta Exitosa (200):**
```json
{
  "count": 12
}
```

**Errores:**
- `500` - Error del servidor

---

### 6. Eliminar Todos los Favoritos
**DELETE** `/api/favorites`

Elimina todos los favoritos del usuario.

**Headers:**
```
x-user-id: string (requerido temporalmente)
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Todos los favoritos eliminados correctamente"
}
```

**Errores:**
- `500` - Error del servidor

---

## 📦 Modelos de Datos

### Favorite
```typescript
{
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}
```

### FavoriteWithProduct
```typescript
{
  id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    original_price?: number;
    image?: string;
    stock: number;
    is_active: boolean;
    category?: { id: string; name: string };
    brand?: { id: string; name: string };
  };
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Agregar a Favoritos
```javascript
const addToFavorites = async (productId) => {
  try {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-123'
      },
      body: JSON.stringify({
        product_id: productId
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Agregado a favoritos:', data);
      updateFavoriteIcon(productId, true);
      updateFavoritesCount();
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 2: Eliminar de Favoritos
```javascript
const removeFromFavorites = async (productId) => {
  try {
    const response = await fetch(`/api/favorites/${productId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': 'user-123'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data.message);
      updateFavoriteIcon(productId, false);
      updateFavoritesCount();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 3: Toggle Favorito
```javascript
const toggleFavorite = async (productId) => {
  try {
    // Verificar si ya es favorito
    const checkResponse = await fetch(`/api/favorites/${productId}`, {
      headers: { 'x-user-id': 'user-123' }
    });
    const { isFavorite } = await checkResponse.json();

    if (isFavorite) {
      // Eliminar
      await removeFromFavorites(productId);
    } else {
      // Agregar
      await addToFavorites(productId);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 4: Componente React de Lista de Favoritos
```typescript
import { useState, useEffect } from 'react';

interface Favorite {
  id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image?: string;
  };
}

const FavoritesList = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/favorites', {
        headers: { 'x-user-id': 'user-123' }
      });
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await fetch(`/api/favorites/${productId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': 'user-123' }
      });
      
      // Actualizar lista local
      setFavorites(prev => prev.filter(f => f.product.id !== productId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div>Cargando favoritos...</div>;

  return (
    <div className="favorites-grid">
      <h2>Mis Favoritos ({favorites.length})</h2>
      {favorites.length === 0 ? (
        <p>No tienes favoritos aún</p>
      ) : (
        favorites.map(fav => (
          <div key={fav.id} className="favorite-card">
            <img src={fav.product.image} alt={fav.product.name} />
            <h3>{fav.product.name}</h3>
            <p>${fav.product.price}</p>
            <button onClick={() => handleRemove(fav.product.id)}>
              ❤️ Eliminar
            </button>
          </div>
        ))
      )}
    </div>
  );
};
```

---

## 🚀 Testing con cURL

```bash
# 1. Ver favoritos
curl http://localhost:3000/api/favorites \
  -H "x-user-id: user-123"

# 2. Agregar a favoritos
curl -X POST http://localhost:3000/api/favorites \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{"product_id":"prod-456"}'

# 3. Verificar si es favorito
curl http://localhost:3000/api/favorites/prod-456 \
  -H "x-user-id: user-123"

# 4. Contador de favoritos
curl http://localhost:3000/api/favorites/count \
  -H "x-user-id: user-123"

# 5. Eliminar de favoritos
curl -X DELETE http://localhost:3000/api/favorites/prod-456 \
  -H "x-user-id: user-123"

# 6. Eliminar todos
curl -X DELETE http://localhost:3000/api/favorites \
  -H "x-user-id: user-123"
```

---

**Documentación creada el:** 9 de Octubre, 2025  
**Versión:** 1.0.0
