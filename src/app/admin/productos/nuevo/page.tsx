"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/NewAuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import AIImageUpload, { ImageFile } from "@/components/admin/AIImageUpload";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import type { Category } from "@/types";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  categoryId: string;
  benefits: string[];
  usage: string;
  ingredients: string;
  inStock: boolean;
}

const NewProductPage = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    categoryId: "",
    benefits: [""],
    usage: "",
    ingredients: "",
    inStock: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingByName, setIsAnalyzingByName] = useState(false);
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [isAIDataLoaded, setIsAIDataLoaded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { state: authState } = useAuth();
  const router = useRouter();

  // Cargar categorías desde la API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('📂 Cargando categorías desde API...');
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Categorías cargadas:', data);
          setCategories(data);
        } else {
          console.error('❌ Error al cargar categorías:', response.status);
        }
      } catch (error) {
        console.error('❌ Error cargando categorías:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== "admin") {
      router.push("/");
    }
  }, [authState, router]);

  if (!authState.isAuthenticated || authState.user?.role !== "admin") {
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del producto es requerido";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0";
    }

    if (formData.originalPrice < 0) {
      newErrors.originalPrice = "El precio original no puede ser negativo";
    }

    if (formData.originalPrice > 0 && formData.originalPrice <= formData.price) {
      newErrors.originalPrice = "El precio original debe ser mayor al precio actual";
    }

    if (!formData.category) {
      newErrors.category = "La categoría es requerida";
    }

    if (formData.benefits.filter(benefit => benefit.trim()).length === 0) {
      newErrors.benefits = "Debe agregar al menos un beneficio";
    }

    if (!formData.usage.trim()) {
      newErrors.usage = "Las instrucciones de uso son requeridas";
    }

    if (!formData.ingredients.trim()) {
      newErrors.ingredients = "Los ingredientes son requeridos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Guardando producto...');
      
      // Incluir la imagen de Cloudinary si existe
      const cloudinaryImageUrl = productImage?.cloudinaryUrl;
      console.log('🖼️ Imagen de Cloudinary incluida:', cloudinaryImageUrl);

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        original_price: formData.originalPrice > 0 ? formData.originalPrice : undefined,
        category_id: formData.categoryId,
        stock: formData.inStock ? 100 : 0,
        benefits: formData.benefits.filter(b => b.trim()),
        usage_instructions: formData.usage,
        ingredients: formData.ingredients,
        images: cloudinaryImageUrl ? [cloudinaryImageUrl] : [],
        is_active: true,
        rating: 0,
        review_count: 0
      };

      console.log('📦 Datos a enviar:', productData);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      console.log('📡 Status de respuesta:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el producto');
      }

      const responseData = await response.json();
      console.log('📥 Respuesta de la API:', responseData);

      showSuccess("Producto creado exitosamente");
      
      // Redirigir después de un momento
      setTimeout(() => {
        router.push("/admin/productos");
      }, 1500);
    } catch (error) {
      console.error("❌ Error completo al agregar producto:", error);
      showError(
        error instanceof Error 
          ? error.message 
          : "Error al crear el producto. Por favor intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, ""]
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }));
  };

  const removeBenefit = (index: number) => {
    if (formData.benefits.length > 1) {
      setFormData(prev => ({
        ...prev,
        benefits: prev.benefits.filter((_, i) => i !== index)
      }));
    }
  };

  // Analizar producto por nombre usando IA
  const handleAnalyzeByName = async () => {
    if (!formData.name.trim()) {
      showError("Por favor ingresa el nombre del producto primero");
      return;
    }

    setIsAnalyzingByName(true);
    try {
      console.log('🤖 Analizando producto por nombre:', formData.name);
      
      const response = await fetch('/api/ai/analyze-product-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: formData.name }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || `Error al analizar el producto (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      
      // Buscar el ID de la categoría
      const categoryId = getCategoryIdByName(data.category);
      console.log('🎯 Category ID:', categoryId);
      
      // Actualizar formulario con los datos de IA
      setFormData(prev => ({
        ...prev,
        description: data.description,
        category: data.category,
        categoryId: categoryId,
        benefits: data.benefits.length > 0 ? data.benefits : [""],
        usage: data.usage,
        ingredients: data.ingredients,
      }));
      
      setIsAIDataLoaded(true);
      showSuccess("¡Información del producto cargada exitosamente!");
    } catch (error) {
      console.error('❌ Error completo:', error);
      showError(
        error instanceof Error 
          ? error.message 
          : "Error al analizar el producto con IA"
      );
    } finally {
      setIsAnalyzingByName(false);
    }
  };

  // Helper para mapear categoría a ID
  const getCategoryIdByName = (categoryName: string): string => {
    console.log('🔍 Buscando categoría:', categoryName);
    
    if (categories.length === 0) {
      console.warn('⚠️ No hay categorías cargadas aún');
      return '';
    }
    
    const searchTerm = categoryName.toLowerCase().trim();
    
    // 1. Match exacto
    let category = categories.find(cat => 
      cat.name.toLowerCase() === searchTerm
    );
    
    if (category) {
      console.log('✅ Match exacto encontrado:', category);
      return category.id;
    }
    
    // 2. Match parcial
    category = categories.find(cat => 
      cat.name.toLowerCase().includes(searchTerm) ||
      searchTerm.includes(cat.name.toLowerCase())
    );
    
    if (category) {
      console.log('✅ Match parcial encontrado:', category);
      return category.id;
    }
    
    // 3. Fallback: primera categoría
    console.warn('⚠️ No se encontró match, usando primera categoría');
    return categories[0]?.id || '';
  };

  // Handler cuando se selecciona/sube una imagen
  const handleImageSelected = (image: ImageFile) => {
    setProductImage(image);
  };

  // Handler cuando la IA analiza el producto desde la imagen
  const handleProductDataAnalyzed = (data: {
    name: string;
    description: string;
    category: string;
    benefits: string[];
    usage: string;
    ingredients: string;
  }) => {
    console.log('🤖 IA completó análisis:', data);
    
    // Buscar el ID de la categoría por nombre
    const categoryId = getCategoryIdByName(data.category);
    
    console.log('🎯 Category ID seleccionado:', categoryId);
    
    setFormData(prev => ({
      ...prev,
      name: data.name,
      description: data.description,
      category: data.category,
      categoryId: categoryId,
      benefits: data.benefits.length > 0 ? data.benefits : [""],
      usage: data.usage,
      ingredients: data.ingredients,
    }));
    setIsAIDataLoaded(true);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/admin/productos")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </motion.button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agregar Producto</h1>
            <p className="text-gray-600">Crea un nuevo producto para tu catálogo</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* AI Image Upload - Primero */}
          <AIImageUpload 
            onImageSelected={handleImageSelected}
            onProductDataAnalyzed={handleProductDataAnalyzed}
          />

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Básica</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Champú Hidratante Premium"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAnalyzeByName}
                    disabled={!formData.name.trim() || isAnalyzingByName}
                    className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg transition-all"
                    title="Analizar producto con IA basándose en el nombre"
                  >
                    {isAnalyzingByName ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span className="hidden sm:inline">Analizando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="hidden sm:inline">IA</span>
                      </>
                    )}
                  </motion.button>
                </div>
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  💡 Escribe o edita el nombre y presiona el botón IA para obtener automáticamente la información del producto
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => {
                    const selectedCategory = categories.find(cat => cat.id === e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      category: selectedCategory?.name || '',
                      categoryId: e.target.value
                    }));
                  }}
                  disabled={categories.length === 0}
                  className={`w-full px-4 py-3 border rounded-lg text-purple-600 focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  } ${categories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">{categories.length === 0 ? 'Cargando categorías...' : 'Seleccionar categoría'}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              {/* Stock Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de Stock
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="w-4 h-4 text-glow-600 bg-gray-100 border-gray-300 rounded focus:ring-glow-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-700">Producto en stock</span>
                </label>
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe las características principales del producto..."
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Precios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Actual (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Original (€)
                  <span className="text-sm text-gray-500 ml-1">(opcional, para mostrar descuento)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                    errors.originalPrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.originalPrice && (
                  <p className="text-red-600 text-sm mt-1">{errors.originalPrice}</p>
                )}
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Beneficios</h2>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addBenefit}
                className="text-glow-600 hover:text-glow-700 font-medium"
              >
                + Agregar Beneficio
              </motion.button>
            </div>
            
            <div className="space-y-3">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
                    placeholder="Ej: Hidrata profundamente el cabello"
                  />
                  {formData.benefits.length > 1 && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeBenefit(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
            {errors.benefits && (
              <p className="text-red-600 text-sm mt-2">{errors.benefits}</p>
            )}
          </div>

          {/* Usage Instructions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Instrucciones de Uso</h2>
            
            <textarea
              value={formData.usage}
              onChange={(e) => setFormData(prev => ({ ...prev, usage: e.target.value }))}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                errors.usage ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Explica cómo usar el producto paso a paso..."
            />
            {errors.usage && (
              <p className="text-red-600 text-sm mt-1">{errors.usage}</p>
            )}
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Ingredientes</h2>
            
            <textarea
              value={formData.ingredients}
              onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                errors.ingredients ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Lista los ingredientes separados por comas (ej: Aceite de Argán, Keratina, Vitamina E)"
            />
            {errors.ingredients && (
              <p className="text-red-600 text-sm mt-1">{errors.ingredients}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/admin/productos")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </motion.button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="bg-gradient-to-r from-glow-600 to-glow-500 text-white px-8 py-3 rounded-lg hover:from-glow-700 hover:to-glow-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  <span>Guardar Producto</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={hideToast}
        />
      )}
    </AdminLayout>
  );
};

export default NewProductPage;