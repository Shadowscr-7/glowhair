"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Sparkles, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
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

interface ProductData {
  name: string;
  description: string;
  category: string;
  benefits: string[];
  usage: string;
  ingredients: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  initialData?: Partial<ProductFormData>;
  initialImage?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  mode, 
  productId,
  initialData,
  initialImage 
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || 0,
    category: initialData?.category || "",
    categoryId: initialData?.categoryId || "",
    benefits: initialData?.benefits || [""],
    usage: initialData?.usage || "",
    ingredients: initialData?.ingredients || "",
    inStock: initialData?.inStock ?? true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingByName, setIsAnalyzingByName] = useState(false);
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const { toast, showSuccess, showError, hideToast } = useToast();
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

    if (!formData.categoryId) {
      newErrors.category = "La categoría es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Por favor corrige los errores en el formulario");
      return;
    }

    setIsLoading(true);

    try {
      // Convertir ingredients de string a array (separado por comas)
      const ingredientsArray = formData.ingredients
        ? formData.ingredients.split(',').map(i => i.trim()).filter(i => i)
        : [];

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        original_price: formData.originalPrice > 0 ? formData.originalPrice : null,
        category_id: formData.categoryId,
        stock: formData.inStock ? 100 : 0,
        images: productImage?.cloudinaryUrl ? [productImage.cloudinaryUrl] : [],
        benefits: formData.benefits.filter(b => b.trim()),
        usage_instructions: formData.usage,
        ingredients: ingredientsArray,
        is_active: true,
      };

      console.log('📤 Enviando datos:', productData);

      const url = mode === 'edit' ? `/api/products/${productId}` : '/api/products';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Producto guardado:', result);
        showSuccess(mode === 'edit' ? '¡Producto actualizado exitosamente!' : '¡Producto creado exitosamente!');
        
        setTimeout(() => {
          router.push('/admin/productos');
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('❌ Error al guardar:', errorData);
        showError(errorData.error || 'Error al guardar el producto');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      showError('Error al guardar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener el ID de categoría por nombre
  const getCategoryIdByName = (categoryName: string): string => {
    if (!categoryName) return "";
    
    const categoryLower = categoryName.toLowerCase().trim();
    
    // Búsqueda exacta
    const exactMatch = categories.find(cat => 
      cat.name.toLowerCase() === categoryLower
    );
    if (exactMatch) return exactMatch.id;
    
    // Búsqueda parcial
    const partialMatch = categories.find(cat => 
      cat.name.toLowerCase().includes(categoryLower) ||
      categoryLower.includes(cat.name.toLowerCase())
    );
    if (partialMatch) return partialMatch.id;
    
    // Búsqueda por palabras clave
    const keywords: Record<string, string[]> = {
      'champú': ['champu', 'shampoo', 'champus'],
      'acondicionador': ['acondicionadores', 'conditioner'],
      'mascarilla': ['mascarillas', 'mask'],
      'serum': ['serums', 'suero'],
      'aceite': ['aceites', 'oil'],
    };
    
    for (const cat of categories) {
      const catNameLower = cat.name.toLowerCase();
      for (const [key, values] of Object.entries(keywords)) {
        if (catNameLower.includes(key) && values.some(v => categoryLower.includes(v))) {
          return cat.id;
        }
      }
    }
    
    // Si no se encuentra, retornar la primera categoría disponible
    return categories[0]?.id || "";
  };

  // Manejar imagen seleccionada
  const handleImageSelected = (image: ImageFile) => {
    console.log('🖼️ Imagen seleccionada:', image);
    setProductImage(image);
  };

  // Manejar datos analizados por IA desde la imagen
  const handleProductDataAnalyzed = (data: ProductData) => {
    console.log('🤖 Datos de IA recibidos:', data);
    
    const categoryId = getCategoryIdByName(data.category);
    
    setFormData(prev => ({
      ...prev,
      name: data.name || prev.name,
      description: data.description || prev.description,
      category: data.category || prev.category,
      categoryId: categoryId || prev.categoryId,
      benefits: data.benefits && data.benefits.length > 0 ? data.benefits : prev.benefits,
      usage: data.usage || prev.usage,
      ingredients: data.ingredients || prev.ingredients,
    }));
    
    showSuccess("¡Datos del producto analizados con IA!");
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
      
      const categoryId = getCategoryIdByName(data.category);
      console.log('🎯 Category ID:', categoryId);
      
      setFormData(prev => ({
        ...prev,
        description: data.description,
        category: data.category,
        categoryId: categoryId,
        benefits: data.benefits.length > 0 ? data.benefits : [""],
        usage: data.usage,
        ingredients: data.ingredients,
      }));
      
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

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, ""]
    }));
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((b, i) => i === index ? value : b)
    }));
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'edit' ? 'Editar Producto' : 'Agregar Producto'}
            </h1>
            <p className="text-gray-600 mt-2">
              {mode === 'edit' 
                ? 'Actualiza la información del producto en tu catálogo'
                : 'Crea un nuevo producto para tu catálogo'
              }
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* AI Image Upload */}
            <AIImageUpload 
              onImageSelected={handleImageSelected}
              onProductDataAnalyzed={handleProductDataAnalyzed}
              initialImage={initialImage}
            />

            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Básica</h2>
              
              {/* Product Name with AI Button */}
              <div className="mb-6">
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
                    disabled={isAnalyzingByName || !formData.name.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzingByName ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={20} />
                      </motion.div>
                    ) : (
                      <Sparkles size={20} />
                    )}
                    IA
                  </motion.button>
                </div>
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  💡 Escribe o edita el nombre y presiona el botón IA para obtener automáticamente la información del producto
                </p>
              </div>

              {/* Category and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                        categoryId: e.target.value,
                        category: selectedCategory?.name || ""
                      }));
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar categoría</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de Stock
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={formData.inStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="w-5 h-5 text-glow-600 border-gray-300 rounded focus:ring-glow-500"
                    />
                    <label htmlFor="inStock" className="ml-3 text-sm text-gray-700">
                      Producto en stock
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Descripción detallada del producto..."
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Prices */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Precios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Actual ($) *
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
                  Precio Original ($)
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
                  className="flex items-center gap-2 px-4 py-2 bg-glow-100 text-glow-700 rounded-lg hover:bg-glow-200 transition-colors"
                >
                  <Plus size={16} />
                  Agregar Beneficio
                </motion.button>
              </div>

              <div className="space-y-3">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
                      placeholder={`Beneficio ${index + 1}`}
                    />
                    {formData.benefits.length > 1 && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeBenefit(index)}
                        className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <X size={20} />
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Instrucciones de Uso</h2>
              <textarea
                value={formData.usage}
                onChange={(e) => setFormData(prev => ({ ...prev, usage: e.target.value }))}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
                placeholder="Cómo aplicar y usar el producto paso a paso..."
              />
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ingredientes</h2>
              <textarea
                value={formData.ingredients}
                onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
                placeholder="Lista de ingredientes separados por comas..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.back()}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg hover:from-glow-700 hover:to-glow-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Save size={20} />
                    </motion.div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {mode === 'edit' ? 'Actualizar Producto' : 'Guardar Producto'}
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
};

export default ProductForm;
