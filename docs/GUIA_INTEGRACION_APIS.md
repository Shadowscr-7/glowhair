# 🎯 GUÍA DE INTEGRACIÓN DE APIS - GlowHair

Esta guía te ayudará a integrar paso a paso todas las APIs creadas con las pantallas existentes.

## 📋 Tabla de Contenidos
1. [Productos](#1-productos)
2. [Detalle de Producto](#2-detalle-de-producto)
3. [Carrito](#3-carrito)
4. [Checkout y Órdenes](#4-checkout-y-órdenes)
5. [Favoritos](#5-favoritos)
6. [Reviews](#6-reviews)
7. [Admin - Clientes](#7-admin---clientes)
8. [Admin - Productos](#8-admin---productos)
9. [Admin - Órdenes](#9-admin---órdenes)

---

## 1. Productos

**Archivo:** `src/app/productos/page.tsx`

**Cambios necesarios:**

1. **Agregar interface Product:**
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  image?: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  category?: { id: string; name: string; };
  brand?: { id: string; name: string; };
}
```

2. **Reemplazar el array estático con fetch:**
```typescript
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchProducts();
}, [searchTerm, selectedCategory, selectedBrand, priceRange, sortBy]);

const fetchProducts = async () => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (selectedCategory !== "Todos") params.append('category', selectedCategory);
  if (selectedBrand !== "Todas") params.append('brand', selectedBrand);
  params.append('min_price', priceRange[0].toString());
  params.append('max_price', priceRange[1].toString());
  
  const sortMap = {
    'price-low': 'price_asc',
    'price-high': 'price_desc',
    'newest': 'created_desc'
  };
  params.append('sort_by', sortMap[sortBy] || 'featured');
  
  const response = await fetch(`/api/products?${params}`);
  const data = await response.json();
  setProducts(data.products);
  setLoading(false);
};
```

3. **Pasar loading al ProductGrid:**
```tsx
<ProductGrid products={products} isLoading={loading} />
```

---

## 2. Detalle de Producto

**Archivo:** `src/app/productos/[id]/page.tsx`

**Cambios necesarios:**

1. **Fetch producto por ID:**
```typescript
const [product, setProduct] = useState<Product | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchProduct();
}, [params.id]);

const fetchProduct = async () => {
  const response = await fetch(`/api/products/${params.id}`);
  const data = await response.json();
  setProduct(data);
  setLoading(false);
};
```

2. **Integrar Reviews:**
```typescript
const [reviews, setReviews] = useState([]);
const [reviewStats, setReviewStats] = useState(null);

const fetchReviews = async () => {
  const response = await fetch(`/api/reviews/product/${params.id}`);
  const data = await response.json();
  setReviews(data.reviews);
  setReviewStats(data.statistics);
};
```

3. **Agregar funcionalidad de favoritos:**
```typescript
const [isFavorite, setIsFavorite] = useState(false);

const checkFavorite = async () => {
  const response = await fetch(`/api/favorites/${product.id}`, {
    headers: { 'x-user-id': userId }
  });
  const data = await response.json();
  setIsFavorite(data.isFavorite);
};

const toggleFavorite = async () => {
  if (isFavorite) {
    await fetch(`/api/favorites/${product.id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': userId }
    });
  } else {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ product_id: product.id })
    });
  }
  setIsFavorite(!isFavorite);
};
```

---

## 3. Carrito

**Archivo:** `src/app/carrito/page.tsx`

**Cambios necesarios:**

1. **Fetch cart from API:**
```typescript
const [cartItems, setCartItems] = useState([]);
const [totals, setTotals] = useState(null);

useEffect(() => {
  fetchCart();
  fetchTotals();
}, []);

const fetchCart = async () => {
  const response = await fetch('/api/cart', {
    headers: { 'x-user-id': userId }
  });
  const data = await response.json();
  setCartItems(data);
};

const fetchTotals = async () => {
  const response = await fetch('/api/cart/total', {
    headers: { 'x-user-id': userId }
  });
  const data = await response.json();
  setTotals(data);
};
```

2. **Actualizar cantidad:**
```typescript
const updateQuantity = async (itemId: string, quantity: number) => {
  await fetch(`/api/cart/${itemId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-id': userId 
    },
    body: JSON.stringify({ quantity })
  });
  fetchCart();
  fetchTotals();
};
```

3. **Eliminar item:**
```typescript
const removeItem = async (itemId: string) => {
  await fetch(`/api/cart/${itemId}`, {
    method: 'DELETE',
    headers: { 'x-user-id': userId }
  });
  fetchCart();
  fetchTotals();
};
```

---

## 4. Checkout y Órdenes

**Archivo:** `src/app/checkout/page.tsx` (crear si no existe)

**Funcionalidad principal:**

```typescript
const [shippingAddress, setShippingAddress] = useState('');
const [paymentMethod, setPaymentMethod] = useState('credit_card');

const handleCreateOrder = async () => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId
    },
    body: JSON.stringify({
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      notes: ''
    })
  });
  
  if (response.ok) {
    const order = await response.json();
    router.push(`/orders/${order.id}`);
  }
};
```

**Historial de Órdenes:** `src/app/orders/page.tsx` (crear)

```typescript
const [orders, setOrders] = useState([]);

useEffect(() => {
  fetchOrders();
}, []);

const fetchOrders = async () => {
  const response = await fetch('/api/orders', {
    headers: { 'x-user-id': userId }
  });
  const data = await response.json();
  setOrders(data.orders);
};
```

---

## 5. Favoritos

**Archivo:** `src/app/favorites/page.tsx`

**Integración completa:**

```typescript
const [favorites, setFavorites] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchFavorites();
}, []);

const fetchFavorites = async () => {
  const response = await fetch('/api/favorites', {
    headers: { 'x-user-id': userId }
  });
  const data = await response.json();
  setFavorites(data);
  setLoading(false);
};

const removeFromFavorites = async (productId: string) => {
  await fetch(`/api/favorites/${productId}`, {
    method: 'DELETE',
    headers: { 'x-user-id': userId }
  });
  fetchFavorites();
};
```

**UI:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {favorites.map((fav) => (
    <ProductCard 
      key={fav.id} 
      product={fav.product}
      onRemoveFavorite={() => removeFromFavorites(fav.product.id)}
    />
  ))}
</div>
```

---

## 6. Reviews

**Componente ReviewForm:** `src/components/reviews/ReviewForm.tsx` (crear)

```typescript
const [rating, setRating] = useState(5);
const [title, setTitle] = useState('');
const [comment, setComment] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId
    },
    body: JSON.stringify({
      product_id: productId,
      rating,
      title,
      comment
    })
  });
  
  if (response.ok) {
    alert('¡Reseña publicada!');
    onSuccess();
  }
};
```

**Componente ReviewsList:** `src/components/reviews/ReviewsList.tsx` (crear)

```typescript
const [reviews, setReviews] = useState([]);
const [stats, setStats] = useState(null);

useEffect(() => {
  fetchReviews();
}, [productId]);

const fetchReviews = async () => {
  const response = await fetch(`/api/reviews/product/${productId}`);
  const data = await response.json();
  setReviews(data.reviews);
  setStats(data.statistics);
};
```

---

## 7. Admin - Clientes

**Archivo:** `src/app/admin/clientes/page.tsx`

**Integración:**

```typescript
const [users, setUsers] = useState([]);

useEffect(() => {
  fetchUsers();
}, []);

const fetchUsers = async () => {
  // Usar API de usuarios (crear si no existe)
  const response = await fetch('/api/users', {
    headers: { 'x-is-admin': 'true' }
  });
  const data = await response.json();
  setUsers(data);
};
```

---

## 8. Admin - Productos

**Archivo:** `src/app/admin/productos/page.tsx`

**Integración:**

```typescript
const [products, setProducts] = useState([]);

const fetchProducts = async () => {
  const response = await fetch('/api/products?limit=100');
  const data = await response.json();
  setProducts(data.products);
};

const deleteProduct = async (id: string) => {
  await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: { 'x-is-admin': 'true' }
  });
  fetchProducts();
};
```

**Crear/Editar Producto:**
```typescript
const handleSave = async () => {
  const method = productId ? 'PUT' : 'POST';
  const url = productId ? `/api/products/${productId}` : '/api/products';
  
  await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-is-admin': 'true'
    },
    body: JSON.stringify(productData)
  });
  
  router.push('/admin/productos');
};
```

---

## 9. Admin - Órdenes

**Archivo:** `src/app/admin/pedidos/page.tsx`

**Integración:**

```typescript
const [orders, setOrders] = useState([]);
const [stats, setStats] = useState(null);

useEffect(() => {
  fetchOrders();
  fetchStats();
}, []);

const fetchOrders = async () => {
  const response = await fetch('/api/orders', {
    headers: { 'x-is-admin': 'true' }
  });
  const data = await response.json();
  setOrders(data.orders);
};

const fetchStats = async () => {
  const response = await fetch('/api/orders/stats', {
    headers: { 'x-is-admin': 'true' }
  });
  const data = await response.json();
  setStats(data);
};

const updateOrderStatus = async (orderId: string, status: string) => {
  await fetch(`/api/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-is-admin': 'true'
    },
    body: JSON.stringify({ status })
  });
  fetchOrders();
};
```

---

## 🔧 Herramientas Helper

**Crear:** `src/lib/api.ts`

```typescript
export const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const userId = localStorage.getItem('user_id') || 'temp-user-id';
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    ...(isAdmin && { 'x-is-admin': 'true' }),
    ...options?.headers
  };
  
  const response = await fetch(endpoint, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }
  
  return response.json();
};

// Usage:
// const products = await fetchAPI('/api/products?limit=10');
// const order = await fetchAPI('/api/orders', { method: 'POST', body: JSON.stringify(data) });
```

---

## 📱 Context Updates

**Actualizar CartContext:** `src/context/CartContext.tsx`

```typescript
// Reemplazar métodos locales con llamadas a API
const addToCart = async (productId: string, quantity: number) => {
  const response = await fetchAPI('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity })
  });
  
  // Actualizar estado local
  dispatch({ type: 'ADD_ITEM', payload: response });
};
```

---

## ✅ Checklist de Integración

### Pantallas Principales:
- [ ] `src/app/productos/page.tsx` - Lista de productos con API
- [ ] `src/app/productos/[id]/page.tsx` - Detalle con reviews y favoritos
- [ ] `src/app/carrito/page.tsx` - Carrito con API
- [ ] `src/app/checkout/page.tsx` - Crear orden
- [ ] `src/app/favorites/page.tsx` - Lista de favoritos
- [ ] `src/app/orders/page.tsx` - Historial de órdenes
- [ ] `src/app/orders/[id]/page.tsx` - Detalle de orden

### Admin:
- [ ] `src/app/admin/productos/page.tsx` - CRUD productos
- [ ] `src/app/admin/pedidos/page.tsx` - Gestión de órdenes
- [ ] `src/app/admin/clientes/page.tsx` - Lista de clientes
- [ ] `src/app/admin/productos-vendidos/page.tsx` - Reportes

### Components:
- [ ] `src/components/reviews/ReviewForm.tsx` - Crear review
- [ ] `src/components/reviews/ReviewsList.tsx` - Listar reviews
- [ ] `src/components/product/ProductCard.tsx` - Agregar botón favorito
- [ ] `src/components/cart/CartButton.tsx` - Contador desde API

### Utils:
- [ ] `src/lib/api.ts` - Helper para fetch
- [ ] Update CartContext para usar APIs
- [ ] Update AuthContext si es necesario

---

## 🚀 Orden de Implementación Recomendado

1. **Primero:** Crear `src/lib/api.ts` helper
2. **Segundo:** Actualizar `src/app/productos/page.tsx`
3. **Tercero:** Actualizar `src/app/productos/[id]/page.tsx`
4. **Cuarto:** Actualizar `src/app/carrito/page.tsx`
5. **Quinto:** Crear `src/app/checkout/page.tsx`
6. **Sexto:** Crear páginas de órdenes
7. **Séptimo:** Actualizar páginas de admin
8. **Octavo:** Agregar componentes de reviews
9. **Noveno:** Integrar favoritos
10. **Décimo:** Testing completo

---

**Creado:** 9 de Octubre, 2025  
**Versión:** 1.0.0  
**APIs Disponibles:** 37 endpoints
