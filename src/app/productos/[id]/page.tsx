"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Minus, 
  Plus, 
  ArrowLeft, 
  Truck, 
  Shield, 
  RotateCcw,
  Check
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShampooIcon, ConditionerIcon } from "@/components/ui/ProductIcons";

// Sample product data (in a real app, this would come from an API)
const getProductData = (id: string) => {
  const products = [
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
      detailedDescription: "Nuestro Shampoo Hidratante Premium combina ingredientes de vanguardia para proporcionar una limpieza profunda mientras nutre intensamente cada hebra. La keratina hidrolizada penetra en el córtex capilar para reparar daños, mientras que los aceites naturales crean una barrera protectora que mantiene la hidratación por más tiempo.",
      ingredients: ["Keratina", "Aceite de Argán", "Colágeno"],
      hairType: ["Graso", "Normal"],
      benefits: [
        "Limpieza profunda sin resecar",
        "Hidratación duradera hasta 72 horas", 
        "Fortalece la fibra capilar",
        "Aporta brillo natural",
        "Reduce la rotura hasta en 90%"
      ],
      howToUse: [
        "Aplicar sobre cabello húmedo",
        "Masajear suavemente el cuero cabelludo",
        "Dejar actuar 2-3 minutos",
        "Enjuagar abundantemente con agua tibia"
      ],
      size: "300ml",
      inStock: 15
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
      detailedDescription: "Acondicionador de fórmula profesional que penetra profundamente en las fibras capilares dañadas, restaurando la estructura natural del cabello. Los extractos botánicos proporcionan nutrientes esenciales mientras sellan las cutículas para un acabado suave y manejable.",
      ingredients: ["Biotina", "Extracto de Bambú", "Proteínas de Seda"],
      hairType: ["Dañado", "Rizado"],
      benefits: [
        "Reparación intensiva de daños",
        "Suavidad y manejabilidad",
        "Desenreda sin esfuerzo",
        "Protección contra futuros daños",
        "Cabello visiblemente más saludable"
      ],
      howToUse: [
        "Aplicar sobre cabello lavado y húmedo",
        "Distribuir de medios a puntas",
        "Dejar actuar 3-5 minutos",
        "Enjuagar completamente"
      ],
      size: "250ml",
      inStock: 23
    }
    // Add more products as needed
  ];
  
  return products.find(p => p.id === id);
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { state: authState, toggleFavorite, isFavorite } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);

  const product = getProductData(params.id as string);
  const isProductFavorite = product && authState.isAuthenticated && isFavorite(product.id);

  const handleToggleFavorite = () => {
    if (product && authState.isAuthenticated) {
      toggleFavorite(product.id);
    }
  };

  useEffect(() => {
    if (!product) {
      router.push('/productos');
    }
  }, [product, router]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h2>
          <button
            onClick={() => router.push('/productos')}
            className="bg-glow-600 text-white px-6 py-3 rounded-lg hover:bg-glow-700 transition-colors"
          >
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product.inStock)));
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    // Convert product to the format expected by cart
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      brand: product.brand,
      size: product.size,
      inStock: product.inStock
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add to cart with selected quantity
    addItem(cartProduct, quantity);
    
    setIsAddingToCart(false);
    setShowAddedToCart(true);
    
    // Open cart drawer to show the added item
    setTimeout(() => {
      openCart();
    }, 500);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowAddedToCart(false), 3000);
  };

  const tabs = [
    { id: "description", label: "Descripción" },
    { id: "ingredients", label: "Ingredientes" },
    { id: "howto", label: "Modo de Uso" },
    { id: "reviews", label: "Reseñas" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="pt-20 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-glow-600 hover:text-glow-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </motion.button>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-glow-50 to-glow-100 rounded-2xl flex items-center justify-center p-12">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-48 h-48"
                >
                  {product.image}
                </motion.div>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 bg-gradient-to-r from-glow-500 to-glow-400 text-white text-sm font-medium rounded-full"
                  >
                    Nuevo
                  </motion.span>
                )}
                {product.isOnSale && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full"
                  >
                    -{discountPercentage}% OFF
                  </motion.span>
                )}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                <p className="text-glow-600 font-medium text-sm uppercase tracking-wide">
                  {product.brand} • {product.category}
                </p>
                <h1 className="text-3xl font-display font-bold text-gray-900 mt-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  {product.description}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviewCount} reseñas)
                </span>
              </div>

              {/* Hair Type */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Ideal para:</p>
                <div className="flex flex-wrap gap-2">
                  {product.hairType.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-glow-100 text-glow-700 text-sm rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {product.size} • {product.inStock} en stock
                </p>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">Cantidad:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={16} />
                    </motion.button>
                    <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.inStock}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 bg-gradient-to-r from-glow-600 to-glow-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-glow-700 hover:to-glow-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAddingToCart ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Agregar al Carrito
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleFavorite}
                    className={`p-4 border rounded-xl transition-all duration-200 ${
                      isProductFavorite 
                        ? "border-red-500 bg-red-50 text-red-500" 
                        : "border-gray-300 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <Heart 
                      size={20} 
                      className={isProductFavorite ? "fill-current" : ""}
                    />
                  </motion.button>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="h-8 w-8 text-glow-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Envío Gratis</p>
                  <p className="text-xs text-gray-600">En compras +$50</p>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-glow-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Garantía</p>
                  <p className="text-xs text-gray-600">30 días</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="h-8 w-8 text-glow-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Devoluciones</p>
                  <p className="text-xs text-gray-600">Fáciles</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg mt-8 overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors relative ${
                    selectedTab === tab.id
                      ? "text-glow-600 bg-glow-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                  {selectedTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-glow-600"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {selectedTab === "description" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Descripción Detallada
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {product.detailedDescription}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Beneficios Principales:</h4>
                      <ul className="space-y-2">
                        {product.benefits.map((benefit, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedTab === "ingredients" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Ingredientes Activos
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {product.ingredients.map((ingredient, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-glow-50 p-4 rounded-lg"
                        >
                          <span className="font-medium text-glow-700">{ingredient}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTab === "howto" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Modo de Uso
                    </h3>
                    <ol className="space-y-4">
                      {product.howToUse.map((step, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4"
                        >
                          <span className="bg-glow-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 pt-1">{step}</span>
                        </motion.li>
                      ))}
                    </ol>
                  </div>
                )}

                {selectedTab === "reviews" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Reseñas de Clientes
                    </h3>
                    <p className="text-gray-600">
                      Las reseñas se cargarán próximamente...
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Added to Cart Notification */}
      <AnimatePresence>
        {showAddedToCart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50"
          >
            <Check className="h-5 w-5" />
            <span className="font-medium">¡Producto agregado al carrito!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}