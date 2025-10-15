"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Package,
  DollarSign,
  Star,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/NewAuthContext";
import AdminLayout from "@/components/admin/AdminLayout";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  category: string | { id: string; name: string };
  inStock?: boolean;
  in_stock?: boolean;
  rating: number;
  reviews?: number;
  review_count?: number;
  images?: string[];
}

const AdminProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { state: authState } = useAuth();
  const router = useRouter();

  // Helper function to get category name
  const getCategoryName = (category: string | { id: string; name: string }): string => {
    return typeof category === 'string' ? category : category.name;
  };

  // Helper function to check if product is in stock
  const isProductInStock = (product: Product): boolean => {
    return product.inStock ?? product.in_stock ?? true;
  };

  // Helper function to get original price
  const getOriginalPrice = (product: Product): number | undefined => {
    return product.originalPrice ?? product.original_price;
  };

  // Helper function to get review count
  const getReviewCount = (product: Product): number => {
    return product.reviews ?? product.review_count ?? 0;
  };

  // Check if user is admin
  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== "admin") {
      router.push("/");
    }
  }, [authState, router]);

  // Load products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        console.log('📦 Cargando productos desde API...');
        const response = await fetch('/api/products');
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Productos cargados:', data);
          // La API devuelve { products: [], total: number, ... }
          setProducts(data.products || []);
        } else {
          console.error('❌ Error al cargar productos:', response.status);
          setProducts([]);
        }
      } catch (error) {
        console.error('❌ Error cargando productos:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (authState.isAuthenticated && authState.user?.role === "admin") {
      fetchProducts();
    }
  }, [authState]);

  if (!authState.isAuthenticated || authState.user?.role !== "admin") {
    return null;
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryName = getCategoryName(product.category);
    const matchesCategory = selectedCategory === "Todos" || categoryName === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["Todos", ...Array.from(new Set(products.map(p => getCategoryName(p.category))))];

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      try {
        console.log('🗑️ Eliminando producto:', productToDelete);
        const response = await fetch(`/api/products/${productToDelete}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          console.log('✅ Producto eliminado');
          // Recargar productos
          setProducts(prev => prev.filter(p => p.id !== productToDelete));
        } else {
          console.error('❌ Error al eliminar producto:', response.status);
          alert('Error al eliminar el producto');
        }
      } catch (error) {
        console.error('❌ Error eliminando producto:', error);
        alert('Error al eliminar el producto');
      }
      
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const confirmDelete = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
            <p className="text-gray-600 mt-2">
              Gestiona el catálogo de productos de tu tienda
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/admin/productos/nuevo")}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-glow-600 to-glow-500 text-white px-6 py-3 rounded-lg hover:from-glow-700 hover:to-glow-600 transition-all duration-200 font-medium flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Agregar Producto</span>
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-glow-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Product Image */}
              <div className="relative h-64 bg-gradient-to-br from-glow-50 to-glow-100 flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <Package className="w-16 h-16 text-glow-400" />
                )}
                
                {/* Actions Dropdown */}
                <div className="absolute top-3 right-3">
                  <div className="relative group">
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => router.push(`/productos/${product.id}`)}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Eye size={16} className="mr-2" />
                        Ver Producto
                      </button>
                      <button
                        onClick={() => router.push(`/admin/productos/${product.id}/editar`)}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit size={16} className="mr-2" />
                        Editar
                      </button>
                      <button
                        onClick={() => confirmDelete(product.id)}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col space-y-2">
                  {isProductInStock(product) ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      En Stock
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Agotado
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-xs text-glow-600 bg-glow-50 px-2 py-1 rounded-full">
                    {getCategoryName(product.category)}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                {/* Price and Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {getOriginalPrice(product) && (
                      <span className="text-sm text-gray-500 line-through">
                        ${getOriginalPrice(product)!.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Star size={14} className="text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {product.rating} ({getReviewCount(product)})
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/admin/productos/${product.id}/editar`)}
                    className="flex-1 py-2 text-glow-600 border border-glow-300 rounded-lg font-medium hover:bg-glow-50 transition-all duration-200"
                  >
                    Editar
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/productos/${product.id}`)}
                    className="px-4 py-2 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
                  >
                    <Eye size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== "Todos" 
                ? "Intenta ajustar tus filtros de búsqueda"
                : "Comienza agregando tu primer producto"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/admin/productos/nuevo")}
              className="bg-gradient-to-r from-glow-600 to-glow-500 text-white px-6 py-3 rounded-lg hover:from-glow-700 hover:to-glow-600 transition-all duration-200 font-medium"
            >
              Agregar Primer Producto
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                ¿Eliminar producto?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Esta acción no se puede deshacer. El producto será eliminado permanentemente.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminProductsPage;