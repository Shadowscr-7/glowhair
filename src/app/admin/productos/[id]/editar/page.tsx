"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, X } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/NewAuthContext";
import { Product } from "@/data/products";
import AdminLayout from "@/components/admin/AdminLayout";
import ImageUpload from '@/components/admin/ImageUpload';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  benefits: string[];
  usage: string;
  ingredients: string;
  inStock: boolean;
}

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

const EditProductPage = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    benefits: [""],
    usage: "",
    ingredients: "",
    inStock: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [images, setImages] = useState<ImageFile[]>([]);
  
  const { state, updateProduct } = useAdmin();
  const { state: authState } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = parseInt(params.id as string);

  // Check if user is admin
  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [authState, router]);

  // Load product data
  useEffect(() => {
    if (!productId || isNaN(productId)) {
      router.push("/admin/productos");
      return;
    }

    const product = state.products.find(p => p.id === productId);
    
    if (!product) {
      router.push("/admin/productos");
      return;
    }

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      benefits: product.benefits || [""],
      usage: product.howToUse || "",
      ingredients: product.ingredients?.join(", ") || "",
      inStock: product.inStock
    });
    
    setIsLoadingProduct(false);
  }, [productId, state.products, router]);

  if (!authState.isAuthenticated || authState.user?.role !== "admin") {
    return null;
  }

  if (isLoadingProduct) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-glow-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
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
      const currentProduct = state.products.find(p => p.id === productId);
      if (!currentProduct) {
        throw new Error("Product not found");
      }

      const updatedProduct: Product = {
        ...currentProduct,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        originalPrice: formData.originalPrice > 0 ? formData.originalPrice : undefined,
        category: formData.category,
        benefits: formData.benefits.filter(benefit => benefit.trim()),
        howToUse: formData.usage.trim(),
        ingredients: formData.ingredients.trim().split(',').map(ing => ing.trim()).filter(ing => ing),
        inStock: formData.inStock
      };

      await updateProduct(updatedProduct);
      router.push("/admin/productos");
    } catch (error) {
      console.error("Error updating product:", error);
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

  const categories = [
    "Champús",
    "Acondicionadores",
    "Mascarillas",
    "Aceites",
    "Serums",
    "Herramientas",
    "Kits"
  ];

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
            <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
            <p className="text-gray-600">Modifica la información del producto</p>
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
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Básica</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Champú Hidratante Premium"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
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
                  Precio Actual ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
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
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent ${
                      errors.originalPrice ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
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

          {/* Product Images */}
          <ImageUpload 
            images={images}
            onImagesChange={setImages}
          />

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
                  <span>Actualizar Producto</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </AdminLayout>
  );
};

export default EditProductPage;