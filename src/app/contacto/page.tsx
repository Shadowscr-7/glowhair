"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock, 
  Instagram,
  Facebook,
  Twitter,
  MessageSquare,
  CheckCircle,
  Loader2
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "El asunto es requerido";
    }

    if (!formData.message.trim()) {
      newErrors.message = "El mensaje es requerido";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "El mensaje debe tener al menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // TODO: Implementar envío real a API o servicio de email
      // Por ahora, simulamos el envío
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("📧 Formulario enviado:", formData);

      // Mostrar éxito
      setShowSuccess(true);
      
      // Limpiar formulario
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });

      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

    } catch (error) {
      console.error("Error al enviar formulario:", error);
      alert("Hubo un error al enviar el mensaje. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Dirección",
      content: "Av. 18 de Julio 1234, Montevideo",
      subContent: "Uruguay",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Phone,
      title: "Teléfono",
      content: "+598 99 123 456",
      subContent: "Lun - Vie: 9:00 - 18:00",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Mail,
      title: "Email",
      content: "hola@glowhair.com",
      subContent: "Respondemos en 24hs",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Clock,
      title: "Horarios",
      content: "Lunes a Viernes",
      subContent: "9:00 AM - 6:00 PM",
      color: "from-orange-500 to-red-500"
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-600" },
    { icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-sky-500" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section with Gradient Background */}
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-glow-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-glow-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-glow-600 via-purple-600 to-glow-600 bg-clip-text text-transparent mb-4">
              Contáctanos
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ti.
              <br />
              Completa el formulario y te responderemos lo antes posible.
            </p>
          </motion.div>

          {/* Success Message */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto mb-8"
            >
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-1">
                    ¡Mensaje enviado con éxito!
                  </h3>
                  <p className="text-green-700">
                    Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos dentro de las próximas 24 horas.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 border-2 border-purple-100 hover:border-purple-300"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-gray-700 font-medium">{info.content}</p>
                  <p className="text-sm text-gray-500 mt-1">{info.subContent}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-purple-100"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-glow-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Envíanos un mensaje
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 transition-all ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Juan Pérez"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email and Phone */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 transition-all ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="juan@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 transition-all ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="+598 99 123 456"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 transition-all ${
                      errors.subject ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="¿En qué podemos ayudarte?"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 transition-all resize-none ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Cuéntanos más sobre tu consulta..."
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-glow-600 to-glow-500 text-white py-4 rounded-lg font-semibold hover:from-glow-700 hover:to-glow-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Mensaje
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* FAQ Card */}
              <div className="bg-gradient-to-br from-purple-600 via-glow-600 to-purple-700 rounded-2xl shadow-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">¿Necesitas ayuda rápida?</h3>
                <p className="mb-6 text-purple-50 leading-relaxed">
                  Antes de enviarnos un mensaje, revisa nuestras preguntas frecuentes. 
                  Podrías encontrar la respuesta que buscas de inmediato.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  Ver FAQ
                </motion.button>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Síguenos en redes sociales</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Mantente al día con nuestras últimas novedades, consejos y promociones exclusivas.
                </p>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-12 h-12 bg-gradient-to-br from-purple-50 to-glow-50 hover:from-purple-100 hover:to-glow-100 rounded-xl flex items-center justify-center text-gray-700 ${social.color} transition-all duration-200 shadow-md hover:shadow-lg`}
                        aria-label={social.label}
                      >
                        <Icon size={24} />
                      </motion.a>
                    );
                  })}
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Visítanos</h3>
                <div className="aspect-video bg-gradient-to-br from-purple-50 via-glow-50 to-purple-100 rounded-xl flex items-center justify-center shadow-inner">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    <p className="text-purple-700 font-medium">Mapa de ubicación</p>
                    <p className="text-sm text-purple-500">Montevideo, Uruguay</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-glow-600 via-purple-600 to-glow-600 py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Prefieres hablar directamente?
            </h2>
            <p className="text-purple-50 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
              Llámanos o visita nuestra tienda. ¡Estaremos encantados de atenderte!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="tel:+59899123456"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-glow-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-colors inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Phone size={20} />
                Llamar Ahora
              </motion.a>
              <motion.a
                href="mailto:hola@glowhair.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-800 transition-colors inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Mail size={20} />
                Enviar Email
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
