"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";

interface Product {
  category: string | { id: string; name: string };
  brand?: string | { id: string; name: string };
  hair_type?: string[];
  price: number;
}

interface FilterPanelProps {
  show: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  selectedHairType: string;
  onHairTypeChange: (hairType: string) => void;
  priceRange: number[];
  onPriceRangeChange: (range: number[]) => void;
  products: Product[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  show,
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  selectedHairType,
  onHairTypeChange,
  priceRange,
  onPriceRangeChange,
  products
}) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    hairType: true,
    price: true
  });

  // Extract unique values from products
  const categories = ["Todos", ...Array.from(new Set(products.map(p => 
    typeof p.category === 'string' ? p.category : p.category?.name || 'Sin categoría'
  )))];
  const brands = ["Todas", ...Array.from(new Set(products.map(p => 
    typeof p.brand === 'string' ? p.brand : p.brand?.name || 'Sin marca'
  )))];
  const hairTypes = ["Todos", ...Array.from(new Set(products.flatMap(p => p.hair_type || [])))];

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearAllFilters = () => {
    onCategoryChange("Todos");
    onBrandChange("Todas");
    onHairTypeChange("Todos");
    onPriceRangeChange([0, 100]);
  };

  const hasActiveFilters = selectedCategory !== "Todos" || 
                          selectedBrand !== "Todas" || 
                          selectedHairType !== "Todos" || 
                          priceRange[0] !== 0 || 
                          priceRange[1] !== 100;

  const FilterSection = ({ 
    title, 
    isOpen, 
    onToggle, 
    children 
  }: { 
    title: string; 
    isOpen: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
  }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-gray-200 pb-4 mb-4 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-glow-600 transition-colors"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const RadioOption = ({ 
    value, 
    currentValue, 
    onChange, 
    label, 
    count 
  }: { 
    value: string; 
    currentValue: string; 
    onChange: (value: string) => void; 
    label: string; 
    count?: number;
  }) => (
    <motion.label
      whileHover={{ x: 2 }}
      className="flex items-center justify-between cursor-pointer group"
    >
      <div className="flex items-center">
        <input
          type="radio"
          checked={currentValue === value}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
          currentValue === value 
            ? 'border-glow-500 bg-glow-500' 
            : 'border-gray-300 group-hover:border-glow-300'
        }`}>
          {currentValue === value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 rounded-full bg-white"
            />
          )}
        </div>
        <span className={`text-sm ${
          currentValue === value ? 'text-glow-600 font-medium' : 'text-gray-700'
        }`}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </motion.label>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={() => {}} // Close on overlay click if needed
          />
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ 
          x: show ? 0 : -300, 
          opacity: show ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`
          fixed lg:relative lg:translate-x-0 lg:opacity-100
          top-0 left-0 h-full lg:h-auto w-80 lg:w-full
          bg-white lg:bg-transparent z-50 lg:z-auto
          border-r lg:border-r-0 border-gray-200
          overflow-y-auto lg:overflow-visible
          ${show ? 'block' : 'hidden lg:block'}
        `}
      >
        <div className="p-6 lg:p-0">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAllFilters}
                className="text-sm text-glow-600 hover:text-glow-700 font-medium"
              >
                Limpiar todo
              </motion.button>
            )}
          </div>

          {/* Category Filter */}
          <FilterSection 
            title="Categoría" 
            isOpen={openSections.category}
            onToggle={() => toggleSection('category')}
          >
            <div className="space-y-3">
              {categories.map(category => {
                const count = category === "Todos" 
                  ? products.length 
                  : products.filter(p => 
                      (typeof p.category === 'string' ? p.category : p.category?.name) === category
                    ).length;
                return (
                  <RadioOption
                    key={category}
                    value={category}
                    currentValue={selectedCategory}
                    onChange={onCategoryChange}
                    label={category}
                    count={count}
                  />
                );
              })}
            </div>
          </FilterSection>

          {/* Brand Filter */}
          <FilterSection 
            title="Marca" 
            isOpen={openSections.brand}
            onToggle={() => toggleSection('brand')}
          >
            <div className="space-y-3">
              {brands.map(brand => {
                const count = brand === "Todas" 
                  ? products.length 
                  : products.filter(p => 
                      (typeof p.brand === 'string' ? p.brand : p.brand?.name) === brand
                    ).length;
                return (
                  <RadioOption
                    key={brand}
                    value={brand}
                    currentValue={selectedBrand}
                    onChange={onBrandChange}
                    label={brand}
                    count={count}
                  />
                );
              })}
            </div>
          </FilterSection>

          {/* Hair Type Filter */}
          <FilterSection 
            title="Tipo de Cabello" 
            isOpen={openSections.hairType}
            onToggle={() => toggleSection('hairType')}
          >
            <div className="space-y-3">
              {hairTypes.map(hairType => {
                const count = hairType === "Todos" 
                  ? products.length 
                  : products.filter(p => p.hair_type?.includes(hairType)).length;
                return (
                  <RadioOption
                    key={hairType}
                    value={hairType}
                    currentValue={selectedHairType}
                    onChange={onHairTypeChange}
                    label={hairType}
                    count={count}
                  />
                );
              })}
            </div>
          </FilterSection>

          {/* Price Range Filter */}
          <FilterSection 
            title="Rango de Precio" 
            isOpen={openSections.price}
            onToggle={() => toggleSection('price')}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={priceRange[1]}
                  onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <style jsx>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #7c3aed;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
                  }
                  .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #7c3aed;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
                  }
                `}</style>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={priceRange[0]}
                    onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glow-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glow-500"
                  />
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Mobile Apply Button */}
          <div className="lg:hidden mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-glow-600 text-white py-3 rounded-lg font-medium hover:bg-glow-700 transition-colors"
            >
              Aplicar Filtros
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default FilterPanel;