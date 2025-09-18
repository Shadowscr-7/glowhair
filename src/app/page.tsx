"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import ProductCard from "@/components/product/ProductCard";
import { ShampooIcon, ConditionerIcon, MaskIcon, SerumIcon, OilIcon, SprayIcon } from "@/components/ui/ProductIcons";
import { ArrowRight, Sparkles, Award, Truck } from "lucide-react";

// Sample products data
const sampleProducts = [
  {
    id: "1",
    name: "Shampoo Hidratante Premium",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.8,
    reviewCount: 124,
    image: <ShampooIcon className="w-full h-full" />,
    category: "Limpieza",
    isNew: true,
    isOnSale: true,
    description: "Fórmula avanzada con keratina y aceites naturales para cabello sedoso y brillante."
  },
  {
    id: "2",
    name: "Acondicionador Reparador",
    price: 24.99,
    rating: 4.7,
    reviewCount: 89,
    image: <ConditionerIcon className="w-full h-full" />,
    category: "Tratamiento",
    description: "Repara y fortalece el cabello dañado con extractos botánicos."
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
    isOnSale: true,
    description: "Tratamiento profundo semanal para cabello extremadamente seco."
  },
  {
    id: "4",
    name: "Serum Anti-Frizz",
    price: 19.99,
    rating: 4.6,
    reviewCount: 78,
    image: <SerumIcon className="w-full h-full" />,
    category: "Estilizado",
    isNew: true,
    description: "Control total del frizz y protección térmica hasta 230°C."
  },
  {
    id: "5",
    name: "Aceite Capilar Nutritivo",
    price: 27.99,
    rating: 4.8,
    reviewCount: 102,
    image: <OilIcon className="w-full h-full" />,
    category: "Tratamiento",
    description: "Mezcla de aceites esenciales para nutrición y brillo natural."
  },
  {
    id: "6",
    name: "Spray Protector Térmico",
    price: 22.99,
    rating: 4.5,
    reviewCount: 67,
    image: <SprayIcon className="w-full h-full" />,
    category: "Protección",
    description: "Protección profesional contra el calor y rayos UV."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-16 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-glow-50 via-white to-glow-100" />
        
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
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-glow-200 to-glow-300 rounded-full opacity-20 blur-xl"
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
          className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-glow-300 to-glow-400 rounded-full opacity-15 blur-xl"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex justify-center mb-6"
            >
              <Sparkles className="w-16 h-16 text-glow-500" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              <span className="bg-gradient-to-r from-glow-600 via-glow-500 to-glow-400 bg-clip-text text-transparent">
                GlowHair
              </span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto"
            >
              Descubre la belleza natural de tu cabello con productos premium 
              diseñados para nutrir, reparar y realzar tu melena.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.a
                href="/productos"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-glow-600 to-glow-500 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 hover:from-glow-700 hover:to-glow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Explorar Productos
                <ArrowRight className="w-5 h-5" />
              </motion.a>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-glow-500 text-glow-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-glow-50 transition-all duration-200"
              >
                Ver Ofertas
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              ¿Por qué elegir <span className="text-glow-600">GlowHair</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compromiso con la calidad, ingredientes naturales y resultados visibles
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Award className="w-8 h-8" />,
                title: "Calidad Premium",
                description: "Productos formulados con los mejores ingredientes naturales y tecnología avanzada."
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Resultados Visibles",
                description: "Transformación real desde la primera aplicación, cabello más saludable y brillante."
              },
              {
                icon: <Truck className="w-8 h-8" />,
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
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-center mb-4 text-glow-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Productos <span className="text-glow-600">Destacados</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre nuestra selección de productos más populares y efectivos
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleProducts.map((product, index) => (
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

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-glow-600 to-glow-500 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 mx-auto hover:from-glow-700 hover:to-glow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Ver Todos los Productos
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-glow-600 to-glow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Mantente al día con GlowHair
            </h2>
            <p className="text-xl text-glow-100 mb-8">
              Recibe consejos de cuidado capilar y ofertas exclusivas
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-6 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-glow-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200"
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
