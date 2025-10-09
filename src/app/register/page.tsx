"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowLeft,
  Check 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/NewAuthContext";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  hairType: string[];
  newsletter: boolean;
  terms: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, state } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    hairType: [],
    newsletter: false,
    terms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const hairTypes = [
    "Graso",
    "Seco", 
    "Normal",
    "Mixto",
    "Rizado",
    "Liso",
    "Ondulado",
    "Dañado",
    "Teñido",
    "Fino",
    "Grueso"
  ];

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleHairTypeToggle = (hairType: string) => {
    setFormData(prev => ({
      ...prev,
      hairType: prev.hairType.includes(hairType)
        ? prev.hairType.filter(type => type !== hairType)
        : [...prev.hairType, hairType]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (formData.hairType.length === 0) {
      newErrors.hairType = "Selecciona al menos un tipo de cabello";
    }

    if (!formData.terms) {
      newErrors.terms = "Debes aceptar los términos y condiciones";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      hair_type: formData.hairType.join(", "),
    };

    const result = await register(formData.email, formData.password, userData);
    
    if (result.success) {
      router.push("/");
    } else {
      setErrors({ general: result.error || "Error al crear la cuenta. Inténtalo de nuevo." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-glow-600 hover:text-glow-700 transition-colors mb-6 mx-auto"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>

            <div className="w-16 h-16 bg-gradient-to-r from-glow-600 to-glow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Crear Cuenta
            </h1>
            <p className="text-gray-600">
              Únete a GlowHair y descubre productos perfectos para tu cabello
            </p>
          </motion.div>

          {/* Register Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              >
                {errors.general}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 transition-colors ${
                        errors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Tu nombre"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 transition-colors ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Tu apellido"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 transition-colors ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 transition-colors ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 transition-colors ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Hair Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Cabello * <span className="text-gray-500">(puedes seleccionar varios)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {hairTypes.map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleHairTypeToggle(type)}
                      className={`relative p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                        formData.hairType.includes(type)
                          ? "border-glow-500 bg-glow-50 text-glow-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {type}
                      {formData.hairType.includes(type) && (
                        <Check className="absolute top-1 right-1 h-4 w-4 text-glow-600" />
                      )}
                    </motion.button>
                  ))}
                </div>
                {errors.hairType && (
                  <p className="text-red-500 text-sm mt-1">{errors.hairType}</p>
                )}
              </div>

              {/* Newsletter Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={formData.newsletter}
                  onChange={(e) => handleInputChange("newsletter", e.target.checked)}
                  className="h-4 w-4 text-glow-600 focus:ring-glow-500 border-gray-300 rounded"
                />
                <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
                  Quiero recibir ofertas exclusivas y novedades por email
                </label>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.terms}
                  onChange={(e) => handleInputChange("terms", e.target.checked)}
                  className={`h-4 w-4 text-glow-600 focus:ring-glow-500 border-gray-300 rounded mt-0.5 ${
                    errors.terms ? "border-red-500" : ""
                  }`}
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  Acepto los{" "}
                  <Link href="/terms" className="text-glow-600 hover:text-glow-700 font-medium">
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link href="/privacy" className="text-glow-600 hover:text-glow-700 font-medium">
                    política de privacidad
                  </Link>
                  *
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm">{errors.terms}</p>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={state.isLoading}
                className="w-full bg-gradient-to-r from-glow-600 to-glow-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-glow-700 hover:to-glow-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {state.isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link 
                  href="/login"
                  className="font-medium text-glow-600 hover:text-glow-700"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}