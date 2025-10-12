"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import SearchBar from "@/components/product/SearchBar";
import FilterPanel from "@/components/product/FilterPanel";
import ProductGrid from "@/components/product/ProductGrid";
import { ShampooIcon, ConditionerIcon, MaskIcon, SerumIcon, OilIcon, SprayIcon } from "@/components/ui/ProductIcons";
import { productsAPI, type Product as APIProduct, type ProductFilters } from "@/lib/api";

// Helper function to adapt API products to UI format
function adaptProductForUI(apiProduct: APIProduct) {
  // Map category name or use default
  const categoryName = typeof apiProduct.category === 'object' 
    ? apiProduct.category?.name || 'Sin categoría'
    : apiProduct.category || 'Sin categoría';
  
  // Map brand name or use default
  const brandName = typeof apiProduct.brand === 'object'
    ? apiProduct.brand?.name || 'GlowHair'
    : apiProduct.brand || 'GlowHair';

  // Select icon based on category (fallback if no image)
  let icon = <ShampooIcon className="w-full h-full" />;
  const lowerCategory = categoryName.toLowerCase();
  if (lowerCategory.includes('acondicionador') || lowerCategory.includes('tratamiento')) {
    icon = <ConditionerIcon className="w-full h-full" />;
  } else if (lowerCategory.includes('mascarilla') || lowerCategory.includes('mask')) {
    icon = <MaskIcon className="w-full h-full" />;
  } else if (lowerCategory.includes('serum') || lowerCategory.includes('sérum')) {
    icon = <SerumIcon className="w-full h-full" />;
  } else if (lowerCategory.includes('aceite') || lowerCategory.includes('oil')) {
    icon = <OilIcon className="w-full h-full" />;
  } else if (lowerCategory.includes('spray') || lowerCategory.includes('protector')) {
    icon = <SprayIcon className="w-full h-full" />;
  }

  // Get image URL from images array (skip blob URLs)
  let imageUrl: string | undefined;
  if (apiProduct.images && Array.isArray(apiProduct.images) && apiProduct.images.length > 0) {
    // Filter out blob URLs and get the first valid image
    const validImages = apiProduct.images.filter((img: string) => 
      img && typeof img === 'string' && !img.startsWith('blob:')
    );
    imageUrl = validImages[0];
  }

  // Truncate description to 150 characters
  let truncatedDescription = apiProduct.description;
  if (truncatedDescription && truncatedDescription.length > 150) {
    truncatedDescription = truncatedDescription.substring(0, 150) + '...';
  }

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    originalPrice: apiProduct.original_price,
    rating: 4.5, // Default rating - can be loaded separately with reviewsAPI
    reviewCount: 0, // Default - can be loaded separately
    image: icon,
    image_url: imageUrl, // Add image URL for ProductCard
    category: categoryName,
    brand: brandName,
    isNew: false, // Could calculate from created_at if needed
    isOnSale: !!apiProduct.original_price && apiProduct.original_price > apiProduct.price,
    description: truncatedDescription,
    ingredients: [] as string[], // Not available in current API schema
    hairType: [] as string[] // Not available in current API schema
  };
}

// Extended product catalog (fallback for development)
const allProducts = [
  {
    id: "1",
    name: "Shampoo Hidratante Premium",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.8,
    reviewCount: 124,
    image: <ShampooIcon className="w-full h-full" />,
    category: "Limpieza",
    brand: "GlowHair Pro",
    isNew: true,
    isOnSale: true,
    description: "Fórmula avanzada con keratina y aceites naturales para cabello sedoso y brillante.",
    ingredients: ["Keratina", "Aceite de Argán", "Colágeno"],
    hairType: ["Graso", "Normal"]
  },
  {
    id: "2",
    name: "Acondicionador Reparador",
    price: 24.99,
    rating: 4.7,
    reviewCount: 89,
    image: <ConditionerIcon className="w-full h-full" />,
    category: "Tratamiento",
    brand: "GlowHair Essential",
    description: "Repara y fortalece el cabello dañado con extractos botánicos.",
    ingredients: ["Biotina", "Extracto de Bambú", "Proteínas de Seda"],
    hairType: ["Dañado", "Rizado"]
  },
  {
    id: "3",
    name: "Mascarilla Nutritiva Intensiva",
    price: 34.99,
    originalPrice: 44.99,
    rating: 4.9,
    reviewCount: 156,
    image: <MaskIcon className="w-full h-full" />,
    category: "Tratamiento",
    brand: "GlowHair Luxury",
    isOnSale: true,
    description: "Tratamiento profundo semanal para cabello extremadamente seco.",
    ingredients: ["Manteca de Karité", "Aceite de Coco", "Vitamina E"],
    hairType: ["Seco", "Dañado"]
  },
  {
    id: "4",
    name: "Serum Anti-Frizz",
    price: 19.99,
    rating: 4.6,
    reviewCount: 78,
    image: <SerumIcon className="w-full h-full" />,
    category: "Estilizado",
    brand: "GlowHair Style",
    isNew: true,
    description: "Control total del frizz y protección térmica hasta 230°C.",
    ingredients: ["Silicona Natural", "Aceite de Jojoba", "Extracto de Aloe"],
    hairType: ["Rizado", "Encrespado"]
  },
  {
    id: "5",
    name: "Aceite Capilar Nutritivo",
    price: 27.99,
    rating: 4.8,
    reviewCount: 102,
    image: <OilIcon className="w-full h-full" />,
    category: "Tratamiento",
    brand: "GlowHair Natural",
    description: "Mezcla de aceites esenciales para nutrición y brillo natural.",
    ingredients: ["Aceite de Argán", "Aceite de Jojoba", "Aceite de Rosa Mosqueta"],
    hairType: ["Seco", "Normal"]
  },
  {
    id: "6",
    name: "Spray Protector Térmico",
    price: 22.99,
    rating: 4.5,
    reviewCount: 67,
    image: <SprayIcon className="w-full h-full" />,
    category: "Protección",
    brand: "GlowHair Shield",
    description: "Protección profesional contra el calor y rayos UV.",
    ingredients: ["Filtros UV", "Proteínas de Trigo", "Pantenol"],
    hairType: ["Todos los tipos"]
  },
  {
    id: "7",
    name: "Shampoo Seco Voluminizador",
    price: 18.99,
    rating: 4.4,
    reviewCount: 93,
    image: <SprayIcon className="w-full h-full" />,
    category: "Limpieza",
    brand: "GlowHair Fresh",
    isNew: true,
    description: "Limpieza instantánea sin agua, aporta volumen y textura.",
    ingredients: ["Almidón de Arroz", "Extracto de Menta", "Arcilla Blanca"],
    hairType: ["Graso", "Fino"]
  },
  {
    id: "8",
    name: "Crema Rizos Definidos",
    price: 26.99,
    rating: 4.7,
    reviewCount: 134,
    image: <ConditionerIcon className="w-full h-full" />,
    category: "Estilizado",
    brand: "GlowHair Curl",
    description: "Define y controla los rizos sin apelmazar.",
    ingredients: ["Manteca de Cacao", "Glicerina", "Extracto de Lino"],
    hairType: ["Rizado", "Ondulado"]
  },
  {
    id: "9",
    name: "Tónico Capilar Anticaída",
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.6,
    reviewCount: 88,
    image: <SerumIcon className="w-full h-full" />,
    category: "Tratamiento",
    brand: "GlowHair Science",
    isOnSale: true,
    description: "Fortalece el cuero cabelludo y reduce la caída.",
    ingredients: ["Minoxidil", "Cafeína", "Extracto de Ginseng"],
    hairType: ["Débil", "Con caída"]
  },
  {
    id: "10",
    name: "Mascarilla Color Protect",
    price: 31.99,
    rating: 4.5,
    reviewCount: 76,
    image: <MaskIcon className="w-full h-full" />,
    category: "Tratamiento",
    brand: "GlowHair Color",
    description: "Protege y revive el color del cabello teñido.",
    ingredients: ["Filtros UV", "Antioxidantes", "Proteínas de Quinoa"],
    hairType: ["Teñido", "Con mechas"]
  },
  {
    id: "11",
    name: "Champú Clarificante",
    price: 23.99,
    rating: 4.3,
    reviewCount: 65,
    image: <ShampooIcon className="w-full h-full" />,
    category: "Limpieza",
    brand: "GlowHair Pure",
    description: "Elimina residuos y acumulación de productos.",
    ingredients: ["Ácido Salicílico", "Extracto de Limón", "Carbón Activado"],
    hairType: ["Con residuos", "Graso"]
  },
  {
    id: "12",
    name: "Aceite Brillo Instantáneo",
    price: 21.99,
    rating: 4.7,
    reviewCount: 112,
    image: <OilIcon className="w-full h-full" />,
    category: "Estilizado",
    brand: "GlowHair Shine",
    isNew: true,
    description: "Brillo espectacular sin residuos grasos.",
    ingredients: ["Aceite de Camellia", "Extracto de Perla", "Vitamina C"],
    hairType: ["Opaco", "Normal"]
  }
];

export default function ProductsPage() {
  // State for API products
  const [products, setProducts] = useState<ReturnType<typeof adaptProductForUI>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [selectedHairType, setSelectedHairType] = useState("Todos");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build API filters
      const filters: ProductFilters = {
        limit: 50,
        offset: 0,
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
        'rating': 'featured' // Fallback to featured since we don't have rating sort yet
      };
      filters.sort_by = sortMap[sortBy] || 'featured';

      // Fetch from API
      const response = await productsAPI.getAll(filters);
      
      // Adapt products to UI format
      const adaptedProducts = response.products.map(adaptProductForUI);
      
      setProducts(adaptedProducts);
      setTotal(response.total);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      // Keep products empty on error to show error state
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedBrand, priceRange, sortBy]);

  // Load products on mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products by hairType (client-side since API doesn't support it yet)
  const filteredProducts = products.filter(product => {
    if (selectedHairType === "Todos") return true;
    return product.hairType.includes(selectedHairType);
  });

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
                resultsCount={filteredProducts.length}
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
                  <option value="rating">Mejor calificados</option>
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
              selectedHairType={selectedHairType}
              onHairTypeChange={setSelectedHairType}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              products={allProducts}
            />
          </div>

          {/* Products Grid */}
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
            ) : filteredProducts.length === 0 ? (
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
              <ProductGrid 
                products={filteredProducts}
                isLoading={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}