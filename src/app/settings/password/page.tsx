'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/NewAuthContext';
import { useRouter } from 'next/navigation';
import { 
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Shield
} from 'lucide-react';

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Muy débil',
    color: 'red',
    requirements: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false
    }
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Calcular fuerza de contraseña
  useEffect(() => {
    const requirements = {
      minLength: newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasLowerCase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    };

    const score = Object.values(requirements).filter(Boolean).length;

    let label = 'Muy débil';
    let color = 'red';

    if (score === 0) {
      label = 'Muy débil';
      color = 'red';
    } else if (score === 1 || score === 2) {
      label = 'Débil';
      color = 'orange';
    } else if (score === 3) {
      label = 'Aceptable';
      color = 'yellow';
    } else if (score === 4) {
      label = 'Buena';
      color = 'blue';
    } else if (score === 5) {
      label = 'Excelente';
      color = 'green';
    }

    setPasswordStrength({ score, label, color, requirements });
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!currentPassword) {
      setError('Ingresa tu contraseña actual');
      return;
    }

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('La contraseña es demasiado débil. Por favor elige una más segura.');
      return;
    }

    setIsChanging(true);

    try {
      // TODO: Implementar cambio de contraseña con Supabase
      // const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        router.push('/settings');
      }, 2000);
    } catch (err) {
      setError('Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.');
    } finally {
      setIsChanging(false);
    }
  };

  const getProgressColor = () => {
    const colors = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500'
    };
    return colors[passwordStrength.color as keyof typeof colors] || 'bg-gray-300';
  };

  const getProgressWidth = () => {
    return `${(passwordStrength.score / 5) * 100}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-glow-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </motion.button>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-glow-100 to-purple-100 rounded-xl">
              <Lock className="w-8 h-8 text-glow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cambiar Contraseña</h1>
              <p className="text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5" />
              ¡Contraseña cambiada correctamente! Redirigiendo...
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Contraseña Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-glow-500 focus:border-transparent transition-all"
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-glow-500 focus:border-transparent transition-all"
                  placeholder="Ingresa tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-3"
                >
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Seguridad de la contraseña</span>
                      <span className={`text-sm font-medium ${
                        passwordStrength.color === 'green' ? 'text-green-600' :
                        passwordStrength.color === 'blue' ? 'text-blue-600' :
                        passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                        passwordStrength.color === 'orange' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: getProgressWidth() }}
                        transition={{ duration: 0.3 }}
                        className={`h-full ${getProgressColor()} transition-colors`}
                      />
                    </div>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-1 gap-2 p-4 bg-gray-50 rounded-xl">
                    <RequirementItem
                      met={passwordStrength.requirements.minLength}
                      text="Al menos 8 caracteres"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.hasUpperCase}
                      text="Una letra mayúscula"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.hasLowerCase}
                      text="Una letra minúscula"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.hasNumber}
                      text="Un número"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.hasSpecialChar}
                      text="Un carácter especial (!@#$%...)"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-glow-500 focus:border-transparent transition-all"
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center gap-2"
                >
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600">Las contraseñas no coinciden</span>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* Security Tips */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Consejos de seguridad:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>No uses información personal obvia</li>
                    <li>No reutilices contraseñas de otras cuentas</li>
                    <li>Considera usar un gestor de contraseñas</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isChanging || passwordStrength.score < 3}
              className="w-full px-6 py-4 bg-gradient-to-r from-glow-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {isChanging ? 'Cambiando Contraseña...' : 'Cambiar Contraseña'}
            </motion.button>

          </form>
        </motion.div>
      </div>
    </div>
  );
}

// Componente para cada requisito de contraseña
interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2"
    >
      {met ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      )}
      <span className={`text-sm ${met ? 'text-green-700' : 'text-gray-600'}`}>
        {text}
      </span>
    </motion.div>
  );
}
