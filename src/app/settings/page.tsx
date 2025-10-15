'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/NewAuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { 
  Settings as SettingsIcon,
  Bell,
  Lock,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  ChevronRight,
  Loader2,
  Mail,
  Smartphone,
  CheckCircle
} from 'lucide-react';

type Tab = 'general' | 'notifications';

interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  email_notifications: boolean;
  push_notifications: boolean;
  order_updates: boolean;
  promotions: boolean;
  newsletter: boolean;
  sound_enabled: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    currency: 'UYU',
    email_notifications: true,
    push_notifications: true,
    order_updates: true,
    promotions: false,
    newsletter: true,
    sound_enabled: true
  });

  // Cargar configuración desde el API
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadSettings = async () => {
      try {
        const userId = user.id || '00000000-0000-0000-0000-000000000001';
        const response = await fetch('/api/user/settings', {
          headers: { 'x-user-id': userId }
        });

        if (response.ok) {
          const data = await response.json();
          setSettings({
            theme: data.theme || 'light',
            currency: data.currency || 'UYU',
            email_notifications: data.email_notifications ?? true,
            push_notifications: data.push_notifications ?? true,
            order_updates: data.order_updates ?? true,
            promotions: data.promotions ?? false,
            newsletter: data.newsletter ?? true,
            sound_enabled: data.sound_enabled ?? true
          });
        }
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user, router]);

  const handleToggle = (key: keyof UserSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key]
    }));
  };

  const handleSelectChange = (key: keyof UserSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userId = user?.id || '00000000-0000-0000-0000-000000000001';
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.error('Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white pt-16">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-glow-500 mx-auto mb-4" />
            <p className="text-gray-600">Cargando configuración...</p>
          </div>
        </div>
      </>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notificaciones', icon: <Bell className="w-5 h-5" /> }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
        
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-glow-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Configuración
            </h1>
            <p className="text-gray-600">Personaliza tu experiencia en GlowHair</p>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 shadow-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">¡Configuración guardada correctamente!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid md:grid-cols-[280px_1fr] gap-6">
          
            {/* Tabs Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 h-fit"
            >
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all font-medium ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-glow-500 to-purple-600 text-white shadow-lg shadow-glow-500/30'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-glow-50 hover:to-purple-50'
                    }`}
                  >
                    <div className={activeTab === tab.id ? 'text-white' : 'text-glow-500'}>
                      {tab.icon}
                    </div>
                    <span>{tab.label}</span>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                      activeTab === tab.id ? 'rotate-90' : ''
                    }`} />
                  </motion.button>
                ))}
              
                {/* Botón Cambiar Contraseña (separado) */}
                <div className="pt-4 mt-4 border-t border-glow-200/40">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/settings/password')}
                    className="w-full flex items-center gap-3 px-5 py-4 rounded-xl text-red-600 hover:bg-red-50/80 transition-all font-medium"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Cambiar Contraseña</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </motion.button>
                </div>
              </nav>
            </motion.div>

            {/* Content Area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
            >
              <AnimatePresence mode="wait">
              
                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-glow-600 to-purple-600 bg-clip-text text-transparent mb-6">
                        Configuración General
                      </h2>

                      {/* Tema */}
                      <div className="mb-8">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
                          {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                          Tema de Color
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['light', 'dark', 'auto'] as const).map((theme) => (
                            <button
                              key={theme}
                              onClick={() => handleSelectChange('theme', theme)}
                              className={`px-4 py-3 border-2 rounded-xl font-medium transition-all ${
                                settings.theme === theme
                                  ? 'border-glow-500 bg-gradient-to-br from-glow-50 to-purple-50 text-glow-700 shadow-md'
                                  : 'border-gray-300 text-gray-700 hover:border-glow-300 hover:bg-gray-50'
                              }`}
                            >
                              {theme === 'light' && '☀️ Claro'}
                              {theme === 'dark' && '🌙 Oscuro'}
                              {theme === 'auto' && '🔄 Auto'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Moneda */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-4 block">💰 Moneda</label>
                        <select
                          value={settings.currency}
                          onChange={(e) => handleSelectChange('currency', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-glow-500 focus:border-glow-500 transition-all bg-white text-gray-700 font-medium"
                        >
                          <option value="UYU">UYU ($)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-glow-600 to-purple-600 bg-clip-text text-transparent mb-6">
                      Notificaciones
                    </h2>

                    <ToggleOption
                      icon={<Mail className="w-5 h-5" />}
                      label="Notificaciones por Email"
                      description="Recibe actualizaciones en tu correo"
                      checked={settings.email_notifications}
                      onChange={() => handleToggle('email_notifications')}
                    />

                    <ToggleOption
                      icon={<Smartphone className="w-5 h-5" />}
                      label="Notificaciones Push"
                      description="Alertas en tu dispositivo"
                      checked={settings.push_notifications}
                      onChange={() => handleToggle('push_notifications')}
                    />

                    <ToggleOption
                      icon={<Bell className="w-5 h-5" />}
                      label="Actualizaciones de Pedidos"
                      description="Estado de tus compras"
                      checked={settings.order_updates}
                      onChange={() => handleToggle('order_updates')}
                    />

                    <ToggleOption
                      icon={<Mail className="w-5 h-5" />}
                      label="Promociones y Ofertas"
                      description="Descuentos y novedades"
                      checked={settings.promotions}
                      onChange={() => handleToggle('promotions')}
                    />

                    <ToggleOption
                      icon={<Mail className="w-5 h-5" />}
                      label="Newsletter"
                      description="Noticias del mundo del cabello"
                      checked={settings.newsletter}
                      onChange={() => handleToggle('newsletter')}
                    />

                    <ToggleOption
                      icon={settings.sound_enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      label="Sonidos de Notificación"
                      description="Reproducir sonido en notificaciones"
                      checked={settings.sound_enabled}
                      onChange={() => handleToggle('sound_enabled')}
                    />
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 pt-6 border-t border-gray-200"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full px-6 py-4 bg-gradient-to-r from-glow-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 font-medium text-lg flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    '💾 Guardar Cambios'
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </>
  );
}

// Componente reutilizable para opciones toggle
interface ToggleOptionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleOption({ icon, label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <div className="flex items-center justify-between p-5 bg-white rounded-xl hover:bg-gradient-to-r hover:from-glow-50/50 hover:to-purple-50/30 transition-all border border-gray-200 shadow-sm">
      <div className="flex items-start gap-4 flex-1">
        <div className="text-glow-500 mt-1">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-7 rounded-full transition-all ${
          checked ? 'bg-gradient-to-r from-glow-500 to-purple-600 shadow-md shadow-glow-500/20' : 'bg-gray-300'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 28 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
        />
      </button>
    </div>
  );
}
