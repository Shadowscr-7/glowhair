# ⭐ API de Reviews - Documentación Completa

Esta documentación cubre todas las APIs REST para el manejo de reseñas y calificaciones en GlowHair.

## 📋 Tabla de Contenidos
- [Endpoints Disponibles](#endpoints-disponibles)
- [Sistema de Calificación](#sistema-de-calificación)
- [Modelos de Datos](#modelos-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Códigos de Error](#códigos-de-error)

---

## 🔗 Endpoints Disponibles

### 1. Listar Reseñas
**GET** `/api/reviews`

Obtiene todas las reseñas con filtros opcionales.

**Headers:**
```
x-user-id: string (requerido temporalmente)
```

**Query Parameters:**
- `product_id` (string, opcional) - Filtrar por producto
- `user_id` (string, opcional) - Filtrar por usuario
- `limit` (number, opcional) - Número de resultados (default: 50)
- `offset` (number, opcional) - Offset para paginación (default: 0)

**Ejemplo:**
```
GET /api/reviews?product_id=prod-456&limit=10
```

**Respuesta Exitosa (200):**
```json
{
  "reviews": [
    {
      "id": "review-123",
      "user_id": "user-456",
      "product_id": "prod-789",
      "rating": 5,
      "title": "¡Excelente producto!",
      "comment": "El mejor shampoo que he probado, mi cabello quedó súper suave",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "user": {
        "id": "user-456",
        "full_name": "Ana García",
        "email": "ana@example.com"
      },
      "product": {
        "id": "prod-789",
        "name": "Shampoo Hidratante",
        "slug": "shampoo-hidratante",
        "image": "https://example.com/image.jpg"
      }
    }
  ],
  "total": 45,
  "limit": 10,
  "offset": 0
}
```

**Errores:**
- `500` - Error del servidor

---

### 2. Crear Reseña
**POST** `/api/reviews`

Crea una nueva reseña para un producto.

**Headers:**
```
x-user-id: string (requerido temporalmente)
Content-Type: application/json
```

**Body:**
```json
{
  "product_id": "prod-456",
  "rating": 5,
  "title": "¡Excelente producto!",
  "comment": "El mejor shampoo que he probado. Mi cabello quedó súper suave y brillante después de usarlo."
}
```

**Campos del Body:**
- `product_id` (string, requerido) - ID del producto a reseñar
- `rating` (number, requerido) - Calificación de 1 a 5 estrellas
- `title` (string, opcional) - Título de la reseña
- `comment` (string, requerido) - Comentario (mínimo 10 caracteres)

**Respuesta Exitosa (201):**
```json
{
  "id": "review-123",
  "user_id": "user-456",
  "product_id": "prod-789",
  "rating": 5,
  "title": "¡Excelente producto!",
  "comment": "El mejor shampoo que he probado...",
  "created_at": "2024-01-15T10:30:00Z",
  "user": {
    "id": "user-456",
    "full_name": "Ana García",
    "email": "ana@example.com"
  },
  "product": {
    "id": "prod-789",
    "name": "Shampoo Hidratante",
    "slug": "shampoo-hidratante"
  }
}
```

**Errores:**
- `400` - product_id es requerido
- `400` - rating debe ser un número entre 1 y 5
- `400` - comment debe tener al menos 10 caracteres
- `400` - Ya has creado una reseña para este producto
- `404` - Producto no encontrado
- `500` - Error del servidor

---

### 3. Obtener Reseña por ID
**GET** `/api/reviews/[id]`

Obtiene los detalles de una reseña específica.

**Parámetros de URL:**
- `id` - ID de la reseña

**Respuesta Exitosa (200):**
```json
{
  "id": "review-123",
  "user_id": "user-456",
  "product_id": "prod-789",
  "rating": 5,
  "title": "¡Excelente producto!",
  "comment": "El mejor shampoo que he probado...",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "user": {
    "id": "user-456",
    "full_name": "Ana García",
    "email": "ana@example.com"
  },
  "product": {
    "id": "prod-789",
    "name": "Shampoo Hidratante",
    "slug": "shampoo-hidratante",
    "image": "https://example.com/image.jpg"
  }
}
```

**Errores:**
- `404` - Reseña no encontrada
- `500` - Error del servidor

---

### 4. Actualizar Reseña
**PUT** `/api/reviews/[id]`

Actualiza una reseña existente (solo el autor puede editar).

**Parámetros de URL:**
- `id` - ID de la reseña

**Headers:**
```
x-user-id: string (requerido temporalmente)
Content-Type: application/json
```

**Body (todos los campos opcionales):**
```json
{
  "rating": 4,
  "title": "Muy buen producto",
  "comment": "Después de usarlo más veces, sigo pensando que es muy bueno pero no perfecto."
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": "review-123",
  "rating": 4,
  "title": "Muy buen producto",
  "comment": "Después de usarlo más veces...",
  "updated_at": "2024-01-20T15:45:00Z",
  ...
}
```

**Errores:**
- `400` - No hay campos para actualizar
- `400` - rating debe ser un número entre 1 y 5
- `400` - comment debe tener al menos 10 caracteres
- `403` - No autorizado para editar esta reseña
- `404` - Reseña no encontrada
- `500` - Error del servidor

---

### 5. Eliminar Reseña
**DELETE** `/api/reviews/[id]`

Elimina una reseña (solo el autor o admin).

**Parámetros de URL:**
- `id` - ID de la reseña

**Headers:**
```
x-user-id: string (requerido temporalmente)
x-is-admin: boolean (opcional)
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Reseña eliminada correctamente"
}
```

**Errores:**
- `403` - No autorizado para eliminar esta reseña
- `404` - Reseña no encontrada
- `500` - Error del servidor

---

### 6. Reseñas de un Producto (con Estadísticas)
**GET** `/api/reviews/product/[productId]`

Obtiene todas las reseñas de un producto con estadísticas agregadas.

**Parámetros de URL:**
- `productId` - ID del producto

**Query Parameters:**
- `limit` (number, opcional) - Número de reseñas (default: 20)
- `offset` (number, opcional) - Offset para paginación (default: 0)

**Respuesta Exitosa (200):**
```json
{
  "reviews": [
    {
      "id": "review-123",
      "user_id": "user-456",
      "rating": 5,
      "title": "¡Excelente!",
      "comment": "Muy buen producto...",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "user": {
        "id": "user-456",
        "full_name": "Ana García"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0
  },
  "statistics": {
    "totalReviews": 45,
    "averageRating": 4.56,
    "ratingDistribution": {
      "5": 25,
      "4": 12,
      "3": 5,
      "2": 2,
      "1": 1
    }
  }
}
```

**Errores:**
- `500` - Error del servidor

---

### 7. Reseñas de un Usuario
**GET** `/api/reviews/user/[userId]`

Obtiene todas las reseñas creadas por un usuario.

**Parámetros de URL:**
- `userId` - ID del usuario

**Headers:**
```
x-user-id: string (requerido temporalmente)
x-is-admin: boolean (opcional)
```

**Query Parameters:**
- `limit` (number, opcional) - Número de reseñas (default: 20)
- `offset` (number, opcional) - Offset para paginación (default: 0)

**Respuesta Exitosa (200):**
```json
{
  "reviews": [
    {
      "id": "review-123",
      "product_id": "prod-789",
      "rating": 5,
      "title": "¡Excelente!",
      "comment": "Muy buen producto...",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "product": {
        "id": "prod-789",
        "name": "Shampoo Hidratante",
        "slug": "shampoo-hidratante",
        "image": "https://example.com/image.jpg"
      }
    }
  ],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

**Errores:**
- `403` - No autorizado para ver reseñas de este usuario
- `500` - Error del servidor

---

## ⭐ Sistema de Calificación

| Estrellas | Descripción | Emoji |
|-----------|-------------|-------|
| 5 | Excelente | ⭐⭐⭐⭐⭐ |
| 4 | Muy bueno | ⭐⭐⭐⭐ |
| 3 | Bueno | ⭐⭐⭐ |
| 2 | Regular | ⭐⭐ |
| 1 | Malo | ⭐ |

**Reglas:**
- Un usuario solo puede crear **una reseña por producto**
- Solo el **autor** puede editar su reseña
- Solo el **autor o admin** pueden eliminar una reseña
- El comentario debe tener **mínimo 10 caracteres**
- La calificación debe ser **entre 1 y 5**

---

## 📦 Modelos de Datos

### Review
```typescript
{
  id: string;
  user_id: string;
  product_id: string;
  rating: number; // 1-5
  title: string | null;
  comment: string;
  created_at: string;
  updated_at: string;
}
```

### ReviewWithRelations
```typescript
{
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  comment: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    image?: string;
  };
}
```

### ReviewStatistics
```typescript
{
  totalReviews: number;
  averageRating: number; // decimal, e.g., 4.56
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear Reseña
```javascript
const createReview = async (productId, rating, title, comment) => {
  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-123'
      },
      body: JSON.stringify({
        product_id: productId,
        rating,
        title,
        comment
      })
    });

    const review = await response.json();

    if (response.ok) {
      console.log('Reseña creada:', review);
      alert('¡Gracias por tu reseña!');
      // Actualizar lista de reseñas
      loadProductReviews(productId);
    } else {
      alert(review.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 2: Obtener Reseñas de un Producto con Estadísticas
```javascript
const loadProductReviews = async (productId) => {
  try {
    const response = await fetch(
      `/api/reviews/product/${productId}?limit=10&offset=0`
    );
    const data = await response.json();

    if (response.ok) {
      console.log('Total de reseñas:', data.statistics.totalReviews);
      console.log('Promedio:', data.statistics.averageRating);
      console.log('5 estrellas:', data.statistics.ratingDistribution[5]);
      
      // Renderizar reseñas
      renderReviews(data.reviews);
      renderRatingStats(data.statistics);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 3: Editar Reseña
```javascript
const updateReview = async (reviewId, updates) => {
  try {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-123'
      },
      body: JSON.stringify(updates)
    });

    const review = await response.json();

    if (response.ok) {
      console.log('Reseña actualizada:', review);
      alert('Reseña actualizada correctamente');
    } else {
      alert(review.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 4: Componente React de Reseñas
```typescript
import { useState, useEffect } from 'react';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  created_at: string;
  user: {
    full_name: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

const ProductReviews = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/product/${productId}`);
      const data = await response.json();
      
      setReviews(data.reviews);
      setStats(data.statistics);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <div>Cargando reseñas...</div>;

  return (
    <div className="reviews-section">
      {/* Estadísticas */}
      {stats && (
        <div className="review-stats">
          <h3>Calificaciones</h3>
          <div className="average-rating">
            <span className="rating-number">{stats.averageRating}</span>
            <span className="stars">{renderStars(Math.round(stats.averageRating))}</span>
            <span className="total">({stats.totalReviews} reseñas)</span>
          </div>
          
          {/* Distribución */}
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar">
                <span>{rating} ⭐</span>
                <div className="bar">
                  <div 
                    className="fill" 
                    style={{ 
                      width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%` 
                    }}
                  />
                </div>
                <span>{stats.ratingDistribution[rating]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="reviews-list">
        <h3>Reseñas de Clientes</h3>
        {reviews.length === 0 ? (
          <p>No hay reseñas aún. ¡Sé el primero en opinar!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span className="user-name">{review.user.full_name}</span>
                <span className="stars">{renderStars(review.rating)}</span>
              </div>
              {review.title && <h4>{review.title}</h4>}
              <p className="comment">{review.comment}</p>
              <span className="date">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

### Ejemplo 5: Formulario de Reseña
```typescript
import { useState } from 'react';

const ReviewForm = ({ productId, onSuccess }: { 
  productId: string; 
  onSuccess: () => void;
}) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (comment.length < 10) {
      alert('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-123'
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          title,
          comment
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('¡Reseña publicada!');
        onSuccess();
        // Limpiar formulario
        setTitle('');
        setComment('');
        setRating(5);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al publicar reseña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Escribe una Reseña</h3>
      
      {/* Rating */}
      <div className="form-group">
        <label>Calificación</label>
        <div className="star-selector">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={star <= rating ? 'active' : ''}
            >
              {star <= rating ? '⭐' : '☆'}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="form-group">
        <label>Título (opcional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resumen de tu experiencia"
          maxLength={100}
        />
      </div>

      {/* Comment */}
      <div className="form-group">
        <label>Comentario *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos tu experiencia con este producto (mínimo 10 caracteres)"
          minLength={10}
          maxLength={500}
          rows={4}
          required
        />
        <span className="char-count">{comment.length}/500</span>
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Publicando...' : 'Publicar Reseña'}
      </button>
    </form>
  );
};
```

---

## ⚠️ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Reseña creada exitosamente |
| 400 | Solicitud inválida (validación fallida) |
| 403 | No autorizado (no es el autor o admin) |
| 404 | Reseña o producto no encontrado |
| 500 | Error interno del servidor |

---

## 🚀 Testing con cURL

```bash
# 1. Listar todas las reseñas
curl http://localhost:3000/api/reviews

# 2. Crear reseña
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "product_id": "prod-456",
    "rating": 5,
    "title": "¡Excelente!",
    "comment": "El mejor shampoo que he probado en mi vida"
  }'

# 3. Ver reseñas de un producto
curl http://localhost:3000/api/reviews/product/prod-456

# 4. Ver reseña específica
curl http://localhost:3000/api/reviews/review-123

# 5. Actualizar reseña
curl -X PUT http://localhost:3000/api/reviews/review-123 \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{"rating": 4, "comment": "Muy bueno pero no perfecto"}'

# 6. Eliminar reseña
curl -X DELETE http://localhost:3000/api/reviews/review-123 \
  -H "x-user-id: user-123"

# 7. Ver mis reseñas
curl http://localhost:3000/api/reviews/user/user-123 \
  -H "x-user-id: user-123"

# 8. Filtrar reseñas por producto
curl "http://localhost:3000/api/reviews?product_id=prod-456&limit=5"
```

---

## 🔧 Próximos Pasos

- [ ] Implementar sistema de votos útiles/no útiles
- [ ] Agregar respuestas del vendedor a reseñas
- [ ] Implementar verificación de compra confirmada
- [ ] Agregar moderación de contenido
- [ ] Implementar reportes de reseñas inapropiadas
- [ ] Agregar fotos a las reseñas
- [ ] Implementar filtros avanzados (por rating, fecha, etc.)
- [ ] Sistema de recompensas por reseñas

---

**Documentación creada el:** 9 de Octubre, 2025  
**Última actualización:** 9 de Octubre, 2025  
**Versión:** 1.0.0
