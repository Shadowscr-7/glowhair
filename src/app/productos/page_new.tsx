"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import SearchBar from "@/components/product/SearchBar";
import FilterPanel from "@/components/product/FilterPanel";
import ProductGrid from "@/components/product/ProductGrid";
import { productsAPI, type Product, type ProductFilters } from "@/lib/api";

export default function ProductsPage() {
  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [limit] = useState(50);
  const [offset] = useState(0);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filters
      const filters: ProductFilters = {
        limit,
        offset,
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }

      if (selectedCategory !== "Todos") {
        filters.category = selectedCategory;
      }

      if (selectedBrand !== "Todas") {
        filters.brand = selectedBrand;
      }

      if (priceRange[0] > 0) {
        filters.min_price = priceRange[0];
      }

      if (priceRange[1] < 100) {
        filters.max_price = priceRange[1];
      }

      // Map sortBy to API format
      const sortMap: Record<string, ProductFilters['sort_by']> = {
        'featured': 'featured',
        'price-low': 'price_asc',
        'price-high': 'price_desc',
        'newest': 'created_desc',
        'name': 'name_asc',
      };
      filters.sort_by = sortMap[sortBy] || 'featured';

      // Fetch from API
      const response = await productsAPI.getAll(filters);
      setProducts(response.products);
      setTotal(response.total);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedBrand, priceRange, sortBy, limit, offset]);

  // Load products on mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header Section */}
      <section className="pt-20 pb-8 bg-gradient-to-r from-glow-600 to-glow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Nuestros Productos
            </h1>
            <p className="text-xl text-glow-100 max-w-3xl mx-auto">
              Descubre toda nuestra gama de productos para el cuidado capilar
            </p>
            {!loading && (
              <p className="text-sm text-glow-200 mt-2">
                {total} {total === 1 ? 'producto encontrado' : 'productos encontrados'}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onToggleFilters={() => setShowFilters(!showFilters)}
                resultsCount={products.length}
              />
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="featured">Destacados</option>
                  <option value="newest">Más nuevos</option>
                  <option value="price-low">Precio: menor a mayor</option>
                  <option value="price-high">Precio: mayor a menor</option>
                  <option value="name">Nombre A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Filter Panel - Mobile: Overlay, Desktop: Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <FilterPanel
              show={showFilters}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              selectedHairType="Todos"
              onHairTypeChange={() => {}}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              products={products}
            />
          </div>

          {/* Products Grid or Error/Loading States */}
          <div className="flex-1">
            {error ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8 text-center"
              >
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Error al cargar productos
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-6 py-3 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg font-medium hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
                >
                  Reintentar
                </button>
              </motion.div>
            ) : loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-glow-600 mx-auto mb-4" />
                  <p className="text-gray-600">Cargando productos...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8 text-center"
              >
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  No se encontraron productos
                </h2>
                <p className="text-gray-600 mb-6">
                  Intenta ajustar tus filtros de búsqueda
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("Todos");
                    setSelectedBrand("Todas");
                    setPriceRange([0, 100]);
                    setSortBy("featured");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg font-medium hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
                >
                  Limpiar Filtros
                </button>
              </motion.div>
            ) : (
              <ProductGrid products={products} isLoading={false} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
