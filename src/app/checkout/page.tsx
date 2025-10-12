"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  CreditCard, 
  Lock, 
  MapPin, 
  User, 
  Truck,
  Calendar,
  Check,
  DollarSign,
  Loader2,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { ordersAPI } from "@/lib/api";
import { useAuth } from "@/context/NewAuthContext";

interface FormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Shipping Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Payment Info
  paymentMethod: "card" | "mercadopago";
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  
  // Additional Options
  saveInfo: boolean;
  newsletter: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state, clearCart } = useCart();
  useAuth(); // Ensure user is authenticated
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "Montevideo",
    state: "",
    zipCode: "",
    country: "Uruguay",
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    saveInfo: false,
    newsletter: false
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  // Fetch cart totals
  const fetchTotals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calcular totales desde el contexto local en lugar de la API
      const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calcular impuestos (16%)
      const taxRate = 0.16;
      const tax = subtotal * taxRate;
      
      // Calcular envío (gratis si subtotal > $50)
      const freeShippingThreshold = 50;
      const shippingCost = 5.99;
      const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
      
      // Total
      const total = subtotal + tax + shipping;
      
      setTotals({
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar totales';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [state.items]);

  useEffect(() => {
    if (state.items.length > 0) {
      fetchTotals();
    } else {
      setLoading(false);
    }
  }, [state.items.length, fetchTotals]);

  const subtotal = totals.subtotal;
  const shipping = totals.shipping;
  const tax = totals.tax;
  const total = totals.total;

  const steps = [
    { id: 1, title: "Información Personal", icon: User },
    { id: 2, title: "Dirección de Envío", icon: MapPin },
    { id: 3, title: "Método de Pago", icon: CreditCard },
    { id: 4, title: "Confirmar Pedido", icon: Check }
  ];

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Partial<FormData> = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = "Nombre requerido";
      if (!formData.lastName.trim()) errors.lastName = "Apellido requerido";
      if (!formData.email.trim()) errors.email = "Email requerido";
      if (!formData.phone.trim()) errors.phone = "Teléfono requerido";
    }
    
    if (step === 2) {
      if (!formData.address.trim()) errors.address = "Dirección requerida";
      if (!formData.city.trim()) errors.city = "Ciudad requerida";
      if (!formData.state.trim()) errors.state = "Provincia requerida";
      if (!formData.zipCode.trim()) errors.zipCode = "Código postal requerido";
    }
    
    if (step === 3 && formData.paymentMethod === "card") {
      if (!formData.cardNumber.trim()) errors.cardNumber = "Número de tarjeta requerido";
      if (!formData.expiryDate.trim()) errors.expiryDate = "Fecha de vencimiento requerida";
      if (!formData.cvv.trim()) errors.cvv = "CVV requerido";
      if (!formData.cardName.trim()) errors.cardName = "Nombre en la tarjeta requerido";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePayment = async () => {
    if (!validateStep(3)) return;
    
    setIsProcessing(true);
    
    try {
      // Prepare order data
      const orderData = {
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        billing_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        payment_method: formData.paymentMethod === "card" ? "credit_card" : "mercadopago",
        notes: `Cliente: ${formData.firstName} ${formData.lastName} | Email: ${formData.email} | Tel: ${formData.phone}`
      };

      console.log('💳 Procesando pago...', {
        method: formData.paymentMethod,
        total: total
      });

      // Create order via API
      const order = await ordersAPI.create(orderData);
      setOrderId(order.id);
      
      if (formData.paymentMethod === "mercadopago") {
        // ============================================
        // MERCADO PAGO INTEGRATION
        // ============================================
        console.log('🟢 Procesando con Mercado Pago...');
        
        // TODO: Implementar integración real con Mercado Pago
        // 1. Crear preferencia de pago en el backend
        // 2. Obtener URL de checkout de Mercado Pago
        // 3. Redirigir al usuario
        
        // Por ahora, simulación:
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // En producción, esto sería:
        // const preference = await fetch('/api/mercadopago/create-preference', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     orderId: order.id,
        //     items: state.items.map(item => ({
        //       title: item.name,
        //       quantity: item.quantity,
        //       unit_price: item.price,
        //       currency_id: 'UYU' // Peso uruguayo
        //     })),
        //     payer: {
        //       name: formData.firstName,
        //       surname: formData.lastName,
        //       email: formData.email,
        //       phone: { number: formData.phone }
        //     },
        //     back_urls: {
        //       success: `${window.location.origin}/orders/${order.id}?status=success`,
        //       failure: `${window.location.origin}/checkout?status=failure`,
        //       pending: `${window.location.origin}/orders/${order.id}?status=pending`
        //     },
        //     auto_return: 'approved'
        //   })
        // });
        // const { init_point } = await preference.json();
        // window.location.href = init_point; // Redirigir a Mercado Pago
        
        console.log('✅ Pedido creado, redirigiendo a Mercado Pago...');
        alert('🟢 En producción, serías redirigido a Mercado Pago para completar el pago.\n\nPor ahora, simulamos el pago exitoso.');
        
      } else {
        // ============================================
        // CREDIT CARD PAYMENT (SIMULATION)
        // ============================================
        console.log('💳 Procesando pago con tarjeta...');
        
        // Validar datos de la tarjeta
        const cardNumber = formData.cardNumber.replace(/\s/g, '');
        if (cardNumber.length < 15) {
          throw new Error('Número de tarjeta inválido');
        }
        
        // Simular procesamiento de pago
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // TODO: En producción, integrar con procesador de pagos:
        // - Stripe
        // - dLocal (para Uruguay)
        // - Mercado Pago Card Token API
        
        // Ejemplo con Stripe:
        // const paymentIntent = await fetch('/api/stripe/create-payment', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     amount: Math.round(total * 100), // cents
        //     currency: 'uyu',
        //     orderId: order.id,
        //     paymentMethod: {
        //       card: {
        //         number: cardNumber,
        //         exp_month: formData.expiryDate.split('/')[0],
        //         exp_year: '20' + formData.expiryDate.split('/')[1],
        //         cvc: formData.cvv
        //       }
        //     }
        //   })
        // });
        
        console.log('✅ Pago con tarjeta procesado exitosamente');
      }
      
      // Show success
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Clear cart and redirect after success
      setTimeout(() => {
        clearCart();
        router.push(`/orders/${order.id}`);
      }, 3000);
      
    } catch (error) {
      setIsProcessing(false);
      console.error("❌ Error al procesar el pago:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al procesar el pago:\n${errorMessage}\n\nPor favor, verifica tus datos e intenta de nuevo.`);
    }
  };

  if (state.items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-8">
              Agrega algunos productos antes de proceder al checkout
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/productos')}
              className="bg-gradient-to-r from-glow-600 to-glow-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
            >
              Explorar Productos
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-glow-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Preparando checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar checkout</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={fetchTotals}
                className="bg-glow-600 text-white px-6 py-3 rounded-lg hover:bg-glow-700 transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={() => router.push('/carrito')}
                className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Volver al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md mx-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Pedido Confirmado!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu pedido por <span className="font-semibold">${total.toFixed(2)}</span> ha sido procesado exitosamente.
            </p>
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Número de pedido:</span> #{orderId}
                </p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                Recibirás un email de confirmación en breve con los detalles del envío.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Redirigiendo a inicio...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-glow-600 hover:text-glow-700 transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              <span>Volver al carrito</span>
            </button>

            <h1 className="text-3xl font-display font-bold text-gray-900">
              Finalizar Compra
            </h1>
            <p className="text-gray-600 mt-2">
              Complete los siguientes pasos para procesar su pedido
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Step Indicator */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ 
                            scale: currentStep >= step.id ? 1 : 0.8,
                            backgroundColor: currentStep >= step.id ? "#7c3aed" : "#e5e7eb"
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            currentStep >= step.id ? "bg-glow-600 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          <step.icon size={20} />
                        </motion.div>
                        {index < steps.length - 1 && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ 
                              width: "100%",
                              backgroundColor: currentStep > step.id ? "#7c3aed" : "#e5e7eb"
                            }}
                            className="h-0.5 mx-4 flex-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {steps[currentStep - 1].title}
                    </h2>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Step 1: Personal Information */}
                      {currentStep === 1 && (
                        <div className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre *
                              </label>
                              <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => updateFormData("firstName", e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 ${
                                  formErrors.firstName ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Ingresa tu nombre"
                              />
                              {formErrors.firstName && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Apellido *
                              </label>
                              <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => updateFormData("lastName", e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 ${
                                  formErrors.lastName ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Ingresa tu apellido"
                              />
                              {formErrors.lastName && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email *
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => updateFormData("email", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 ${
                                formErrors.email ? "border-red-500" : "border-gray-300"
                              }`}
                              placeholder="tu@email.com"
                            />
                            {formErrors.email && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Teléfono *
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => updateFormData("phone", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 ${
                                formErrors.phone ? "border-red-500" : "border-gray-300"
                              }`}
                              placeholder="+54 9 11 1234-5678"
                            />
                            {formErrors.phone && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                            )}
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="newsletter"
                              checked={formData.newsletter}
                              onChange={(e) => updateFormData("newsletter", e.target.checked)}
                              className="h-4 w-4 text-glow-600 focus:ring-glow-500 border-gray-300 rounded"
                            />
                            <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
                              Suscribirme al newsletter para recibir ofertas exclusivas
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Shipping Address */}
                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dirección *
                            </label>
                            <input
                              type="text"
                              value={formData.address}
                              onChange={(e) => updateFormData("address", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 ${
                                formErrors.address ? "border-red-500" : "border-gray-300"
                              }`}
                              placeholder="Calle y número"
                            />
                            {formErrors.address && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ciudad *
                              </label>
                              <input
                                type="text"
                                value={formData.city}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                placeholder="Montevideo"
                              />
                              {formErrors.city && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Barrio *
                              </label>
                              <select
                                value={formData.state}
                                onChange={(e) => updateFormData("state", e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 ${
                                  formErrors.state ? "border-red-500" : "border-gray-300"
                                }`}
                              >
                                <option value="">Selecciona barrio</option>
                                <option value="Aguada">Aguada</option>
                                <option value="Atahualpa">Atahualpa</option>
                                <option value="Barrio Sur">Barrio Sur</option>
                                <option value="Belvedere">Belvedere</option>
                                <option value="Brazo Oriental">Brazo Oriental</option>
                                <option value="Buceo">Buceo</option>
                                <option value="Carrasco">Carrasco</option>
                                <option value="Carrasco Norte">Carrasco Norte</option>
                                <option value="Centro">Centro</option>
                                <option value="Cerrito">Cerrito</option>
                                <option value="Cerro">Cerro</option>
                                <option value="Ciudad Vieja">Ciudad Vieja</option>
                                <option value="Colón">Colón</option>
                                <option value="Cordón">Cordón</option>
                                <option value="Flor de Maroñas">Flor de Maroñas</option>
                                <option value="Goes">Goes</option>
                                <option value="Ituzaingó">Ituzaingó</option>
                                <option value="Jacinto Vera">Jacinto Vera</option>
                                <option value="La Blanqueada">La Blanqueada</option>
                                <option value="La Comercial">La Comercial</option>
                                <option value="La Figurita">La Figurita</option>
                                <option value="La Teja">La Teja</option>
                                <option value="Larrañaga">Larrañaga</option>
                                <option value="Las Acacias">Las Acacias</option>
                                <option value="Las Canteras">Las Canteras</option>
                                <option value="Lezica">Lezica</option>
                                <option value="Malvín">Malvín</option>
                                <option value="Malvín Norte">Malvín Norte</option>
                                <option value="Manga">Manga</option>
                                <option value="Maroñas">Maroñas</option>
                                <option value="Mercado Modelo">Mercado Modelo</option>
                                <option value="Palermo">Palermo</option>
                                <option value="Parque Batlle">Parque Batlle</option>
                                <option value="Parque Rodó">Parque Rodó</option>
                                <option value="Paso de la Arena">Paso de la Arena</option>
                                <option value="Paso de las Duranas">Paso de las Duranas</option>
                                <option value="Peñarol">Peñarol</option>
                                <option value="Pocitos">Pocitos</option>
                                <option value="Pocitos Nuevo">Pocitos Nuevo</option>
                                <option value="Prado">Prado</option>
                                <option value="Punta Carretas">Punta Carretas</option>
                                <option value="Punta Gorda">Punta Gorda</option>
                                <option value="Reducto">Reducto</option>
                                <option value="Tres Cruces">Tres Cruces</option>
                                <option value="Unión">Unión</option>
                                <option value="Villa Dolores">Villa Dolores</option>
                                <option value="Villa Española">Villa Española</option>
                                <option value="Villa Muñoz">Villa Muñoz</option>
                              </select>
                              {formErrors.state && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Código Postal *
                              </label>
                              <input
                                type="text"
                                value={formData.zipCode}
                                onChange={(e) => updateFormData("zipCode", e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 ${
                                  formErrors.zipCode ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="1234"
                              />
                              {formErrors.zipCode && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                País
                              </label>
                              <select
                                value={formData.country}
                                onChange={(e) => updateFormData("country", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500"
                              >
                                <option value="Uruguay">Uruguay</option>
                                <option value="Argentina">Argentina</option>
                                <option value="Brasil">Brasil</option>
                                <option value="Paraguay">Paraguay</option>
                                <option value="Chile">Chile</option>
                              </select>
                            </div>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-blue-900">Información de Envío</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  Los envíos se realizan de lunes a viernes. Recibirás un código de seguimiento una vez despachado tu pedido.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Payment Method */}
                      {currentStep === 3 && (
                        <div className="space-y-6">
                          {/* Payment Method Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                              Método de Pago
                            </label>
                            <div className="grid md:grid-cols-2 gap-4">
                              <motion.label
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  formData.paymentMethod === "card"
                                    ? "border-glow-500 bg-glow-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="card"
                                  checked={formData.paymentMethod === "card"}
                                  onChange={(e) => updateFormData("paymentMethod", e.target.value as "card" | "mercadopago")}
                                  className="sr-only"
                                />
                                <CreditCard className="h-6 w-6 text-glow-600 mr-3" />
                                <div>
                                  <p className="font-medium text-gray-900">Tarjeta de Crédito</p>
                                  <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                                </div>
                                {formData.paymentMethod === "card" && (
                                  <Check className="absolute top-2 right-2 h-5 w-5 text-glow-600" />
                                )}
                              </motion.label>

                              <motion.label
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  formData.paymentMethod === "mercadopago"
                                    ? "border-glow-500 bg-glow-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="mercadopago"
                                  checked={formData.paymentMethod === "mercadopago"}
                                  onChange={(e) => updateFormData("paymentMethod", e.target.value as "card" | "mercadopago")}
                                  className="sr-only"
                                />
                                <DollarSign className="h-6 w-6 text-blue-600 mr-3" />
                                <div>
                                  <p className="font-medium text-gray-900">Mercado Pago</p>
                                  <p className="text-sm text-gray-600">Todas las formas de pago</p>
                                </div>
                                {formData.paymentMethod === "mercadopago" && (
                                  <Check className="absolute top-2 right-2 h-5 w-5 text-glow-600" />
                                )}
                              </motion.label>
                            </div>
                          </div>

                          {/* Card Details (only if card is selected) */}
                          {formData.paymentMethod === "card" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.3 }}
                              className="space-y-6"
                            >
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Número de Tarjeta *
                                </label>
                                <input
                                  type="text"
                                  value={formData.cardNumber}
                                  onChange={(e) => updateFormData("cardNumber", e.target.value)}
                                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 ${
                                    formErrors.cardNumber ? "border-red-500" : "border-gray-300"
                                  }`}
                                  placeholder="1234 5678 9012 3456"
                                  maxLength={19}
                                />
                                {formErrors.cardNumber && (
                                  <p className="text-red-500 text-sm mt-1">{formErrors.cardNumber}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Nombre en la Tarjeta *
                                </label>
                                <input
                                  type="text"
                                  value={formData.cardName}
                                  onChange={(e) => updateFormData("cardName", e.target.value)}
                                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 ${
                                    formErrors.cardName ? "border-red-500" : "border-gray-300"
                                  }`}
                                  placeholder="Nombre como aparece en la tarjeta"
                                />
                                {formErrors.cardName && (
                                  <p className="text-red-500 text-sm mt-1">{formErrors.cardName}</p>
                                )}
                              </div>

                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Vencimiento *
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.expiryDate}
                                    onChange={(e) => updateFormData("expiryDate", e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 ${
                                      formErrors.expiryDate ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="MM/AA"
                                    maxLength={5}
                                  />
                                  {formErrors.expiryDate && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.expiryDate}</p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CVV *
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.cvv}
                                    onChange={(e) => updateFormData("cvv", e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 ${
                                      formErrors.cvv ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="123"
                                    maxLength={4}
                                  />
                                  {formErrors.cvv && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.cvv}</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* MercadoPago Info */}
                          {formData.paymentMethod === "mercadopago" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.3 }}
                              className="bg-blue-50 p-4 rounded-lg"
                            >
                              <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-blue-900">Mercado Pago</h4>
                                  <p className="text-sm text-blue-700 mt-1">
                                    Serás redirigido a Mercado Pago para completar tu pago de forma segura. 
                                    Puedes pagar con tarjeta, transferencia bancaria, efectivo y más.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="saveInfo"
                              checked={formData.saveInfo}
                              onChange={(e) => updateFormData("saveInfo", e.target.checked)}
                              className="h-4 w-4 text-glow-600 focus:ring-glow-500 border-gray-300 rounded"
                            />
                            <label htmlFor="saveInfo" className="ml-2 text-sm text-gray-700">
                              Guardar información para futuras compras
                            </label>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Lock className="h-5 w-5" />
                              <span className="text-sm font-medium">
                                Tu información está protegida con encriptación SSL de 256 bits
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Order Confirmation */}
                      {currentStep === 4 && (
                        <div className="space-y-6">
                          {/* Order Summary */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Resumen del Pedido
                            </h3>
                            <div className="space-y-4">
                              {state.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                  <div className="w-20 h-20 bg-gradient-to-br from-glow-50 to-glow-100 rounded-lg flex items-center justify-center overflow-hidden relative flex-shrink-0">
                                    {item.image && typeof item.image === 'string' && item.image.trim() !== "" ? (
                                      <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-contain p-2"
                                        unoptimized
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                        <span className="text-gray-400 text-lg">📦</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                                    <p className="text-sm text-gray-600">{item.brand} • {item.size}</p>
                                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-glow-600">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Customer Info Summary */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Información Personal</h4>
                              <p className="text-sm text-gray-600">
                                {formData.firstName} {formData.lastName}<br />
                                {formData.email}<br />
                                {formData.phone}
                              </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Dirección de Envío</h4>
                              <p className="text-sm text-gray-600">
                                {formData.address}<br />
                                {formData.city}, {formData.state}<br />
                                {formData.zipCode}, {formData.country}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Método de Pago</h4>
                            <p className="text-sm text-gray-600">
                              {formData.paymentMethod === "card" 
                                ? `Tarjeta terminada en ${formData.cardNumber.slice(-4)}`
                                : "Mercado Pago"
                              }
                            </p>
                          </div>

                          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <div className="flex items-start gap-3">
                              <Calendar className="h-5 w-5 text-amber-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-amber-900">Tiempo de Entrega</h4>
                                <p className="text-sm text-amber-700 mt-1">
                                  Tu pedido llegará en 3-5 días hábiles a la dirección especificada.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                  {currentStep > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Anterior
                    </motion.button>
                  )}
                  
                  <div className="flex-1" />
                  
                  {currentStep < 4 ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={nextStep}
                      className="px-6 py-3 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg font-semibold hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
                    >
                      Continuar
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Lock size={20} />
                          Confirmar y Pagar
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tu Pedido
                </h3>

                <div className="space-y-3 mb-6">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-glow-50 to-glow-100 rounded-lg flex items-center justify-center overflow-hidden relative flex-shrink-0">
                        {item.image && typeof item.image === 'string' && item.image.trim() !== "" ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                            unoptimized
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity} • ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-glow-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600 font-semibold">Gratis</span>
                      ) : (
                        <span className="text-gray-900">${shipping.toFixed(2)}</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impuestos</span>
                    <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-glow-600">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Lock size={16} />
                    <span className="text-sm font-medium">
                      Pago 100% seguro
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Tu información está protegida
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}