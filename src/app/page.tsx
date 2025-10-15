"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import ProductCard from "@/components/product/ProductCard";
import { ArrowRight, Sparkles, Award, Truck } from "lucide-react";
import fondowebImage from "@/assets/fondoweb.png";
import { Product } from "@/types/product";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Obtener productos destacados (featured) limitados a 6
        const response = await fetch('/api/products?limit=6&sortBy=featured');
        const data = await response.json();
        
        if (data.products) {
          setFeaturedProducts(data.products);
        }
      } catch (error) {
        console.error('Error al cargar productos destacados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-16 w-full overflow-hidden">
        {/* Background Image */}
        <div 
          className="w-full"
          style={{
            backgroundImage: `url(${fondowebImage.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            aspectRatio: '21/9', // Más panorámico para cubrir mejor el ancho
            minHeight: '600px'
          }}
        >
          {/* Background Gradient Overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
          
          {/* Content Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex justify-center mb-4 sm:mb-6"
                >
                  <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-glow-500" />
                </motion.div>
                
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold mb-4 sm:mb-6 drop-shadow-2xl">
                  <span className="bg-gradient-to-r from-glow-400 via-glow-300 to-glow-200 bg-clip-text text-transparent filter drop-shadow-lg">
                    GlowHair
                  </span>
                </h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-lg sm:text-xl md:text-2xl text-white font-medium mb-6 sm:mb-8 max-w-3xl mx-auto px-2 drop-shadow-lg"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
                >
                  Descubre la belleza natural de tu cabello con productos premium 
                  diseñados para nutrir, reparar y realzar tu melena.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
                >
                  <motion.a
                    href="/productos"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto bg-gradient-to-r from-glow-600 to-glow-500 text-white px-6 sm:px-8 py-4 rounded-full font-semibold text-base sm:text-lg flex items-center justify-center gap-2 hover:from-glow-700 hover:to-glow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Explorar Productos
                    <ArrowRight className="w-5 h-5" />
                  </motion.a>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto border-2 border-glow-500 text-glow-600 px-6 sm:px-8 py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-glow-50 transition-all duration-200"
                  >
                    Ver Ofertas
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-20 right-10 sm:right-20 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-glow-200 to-glow-300 rounded-full opacity-20 blur-xl"
        />
        
                <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute bottom-20 left-10 sm:left-20 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-glow-300 to-glow-400 rounded-full opacity-15 blur-xl"
        />
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
              ¿Por qué elegir <span className="text-glow-600">GlowHair</span>?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Compromiso con la calidad, ingredientes naturales y resultados visibles
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Calidad Premium",
                description: "Productos formulados con los mejores ingredientes naturales y tecnología avanzada."
              },
              {
                icon: <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Resultados Visibles",
                description: "Transformación real desde la primera aplicación, cabello más saludable y brillante."
              },
              {
                icon: <Truck className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Envío Gratis",
                description: "Entrega gratuita en compras superiores a $50. Rápido y seguro a todo el país."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-center mb-3 sm:mb-4 text-glow-500">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
              Productos <span className="text-glow-600">Destacados</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Descubre nuestra selección de productos más populares y efectivos
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
                >
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay productos destacados disponibles</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-12 px-4"
          >
            <motion.a
              href="/productos"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-gradient-to-r from-glow-600 to-glow-500 text-white px-6 sm:px-8 py-4 rounded-full font-semibold text-base sm:text-lg flex items-center justify-center gap-2 mx-auto hover:from-glow-700 hover:to-glow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Ver Todos los Productos
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-glow-600 to-glow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Mantente al día con GlowHair
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-glow-100 mb-6 sm:mb-8 px-2">
              Recibe consejos de cuidado capilar y ofertas exclusivas
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto px-4">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 sm:px-6 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-glow-600 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 text-sm sm:text-base"
              >
                Suscribirse
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-display font-bold mb-4">
                <span className="bg-gradient-to-r from-glow-400 to-glow-300 bg-clip-text text-transparent">
                  GlowHair
                </span>
              </h3>
              <p className="text-gray-400 mb-8">
                Transformando tu cabello, realzando tu belleza natural
              </p>
              <div className="flex justify-center space-x-8 text-sm text-gray-400">
                <a href="#" className="hover:text-glow-400 transition-colors duration-200">Términos</a>
                <a href="#" className="hover:text-glow-400 transition-colors duration-200">Privacidad</a>
                <a href="#" className="hover:text-glow-400 transition-colors duration-200">Contacto</a>
                <a href="#" className="hover:text-glow-400 transition-colors duration-200">FAQ</a>
              </div>
              <p className="text-gray-500 text-sm mt-8">
                © 2024 GlowHair. Todos los derechos reservados.
              </p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
