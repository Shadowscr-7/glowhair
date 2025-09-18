"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import SearchBar from "@/components/product/SearchBar";
import FilterPanel from "@/components/product/FilterPanel";
import ProductGrid from "@/components/product/ProductGrid";
import { ShampooIcon, ConditionerIcon, MaskIcon, SerumIcon, OilIcon, SprayIcon } from "@/components/ui/ProductIcons";

// Extended product catalog
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [selectedHairType, setSelectedHairType] = useState("Todos");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.ingredients.some(ingredient => 
                             ingredient.toLowerCase().includes(searchTerm.toLowerCase())
                           );
      
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesBrand = selectedBrand === "Todas" || product.brand === selectedBrand;
      const matchesHairType = selectedHairType === "Todos" || 
                             product.hairType.includes(selectedHairType);
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesBrand && matchesHairType && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        return filtered.sort((a, b) => a.price - b.price);
      case "price-high":
        return filtered.sort((a, b) => b.price - a.price);
      case "rating":
        return filtered.sort((a, b) => b.rating - a.rating);
      case "newest":
        return filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case "name":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return filtered;
    }
  }, [searchTerm, selectedCategory, selectedBrand, selectedHairType, priceRange, sortBy]);

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
            <ProductGrid 
              products={filteredProducts}
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}