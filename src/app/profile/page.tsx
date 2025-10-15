'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/NewAuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  Heart,
  ShoppingBag,
  Star,
  Award,
  Package
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, state } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  // Estadísticas del usuario (mock - reemplazar con datos reales)
  const [stats] = useState({
    orders: 12,
    favorites: 8,
    reviews: 5,
    points: 450
  });

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push('/login');
      return;
    }

    if (user) {
      const extendedUser = user as unknown as Record<string, string | undefined>;
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.full_name || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: extendedUser.phone || '',
        address: extendedUser.address || '',
        city: extendedUser.city || '',
        country: extendedUser.country || 'España',
        avatar_url: user.avatar_url || '',
        created_at: extendedUser.created_at || new Date().toISOString()
      };
      setProfile(userProfile);
      setEditedProfile(userProfile);
    }
  }, [user, state, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile || {});
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userId = user?.id || '00000000-0000-0000-0000-000000000001';
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(editedProfile)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
      } else {
        console.error('Error al guardar perfil');
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  if (state.isLoading || !profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white pt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-glow-500"></div>
        </div>
      </>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
        
          {/* Header con foto de perfil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100"
          >
            {/* Banner superior */}
            <div className="h-32 bg-gradient-to-r from-glow-400 via-purple-400 to-pink-400 relative">
              <div className="absolute inset-0 bg-white/10"></div>
            </div>

            {/* Contenido del perfil */}
            <div className="relative px-8 pb-8">
              {/* Avatar */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-glow-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                    {profile.avatar_url ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt={profile.full_name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{profile.first_name[0]}{profile.last_name[0]}</span>
                    )}
                  </div>
                
                  {isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute bottom-0 right-0 p-2 bg-glow-500 text-white rounded-full shadow-lg hover:bg-glow-600 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                {/* Botón de editar */}
                <div className="mt-4 md:mt-0">
                  {!isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-glow-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Edit2 className="w-5 h-5" />
                      Editar Perfil
                    </motion.button>
                  ) : (
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                        Cancelar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        <Save className="w-5 h-5" />
                        {isSaving ? 'Guardando...' : 'Guardar'}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>

              {/* Información principal */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-glow-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {profile.full_name}
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Miembro desde {memberSince}
                </p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-br from-glow-50 to-glow-100 rounded-xl text-center border border-glow-200"
                >
                  <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-glow-600" />
                  <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
                  <p className="text-sm text-gray-600">Pedidos</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl text-center border border-pink-200"
                >
                  <Heart className="w-6 h-6 mx-auto mb-2 text-pink-600" />
                  <p className="text-2xl font-bold text-gray-900">{stats.favorites}</p>
                  <p className="text-sm text-gray-600">Favoritos</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-center border border-purple-200"
                >
                  <Star className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-gray-900">{stats.reviews}</p>
                  <p className="text-sm text-gray-600">Reseñas</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl text-center border border-amber-200"
                >
                  <Award className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                  <p className="text-2xl font-bold text-gray-900">{stats.points}</p>
                  <p className="text-sm text-gray-600">Puntos</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Información detallada */}
          <div className="grid md:grid-cols-2 gap-8">
          
            {/* Información personal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-glow-500" />
                Información Personal
              </h2>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={isEditing ? editedProfile.first_name : profile.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-glow-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                      placeholder="Nombre"
                    />
                    <input
                      type="text"
                      value={isEditing ? editedProfile.last_name : profile.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-glow-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                      placeholder="Apellido"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El email no se puede cambiar
                  </p>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? editedProfile.phone : profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-glow-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>
            </motion.div>

            {/* Dirección */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-glow-500" />
                Dirección
              </h2>

              <div className="space-y-4">
                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calle y número
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editedProfile.address : profile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-glow-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                    placeholder="Calle Principal 123"
                  />
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editedProfile.city : profile.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-glow-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                    placeholder="Madrid"
                  />
                </div>

                {/* País */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editedProfile.country : profile.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-glow-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                    placeholder="España"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Accesos rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Accesos Rápidos</h2>
          
            <div className="grid md:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/orders')}
                className="p-6 bg-gradient-to-br from-glow-50 to-glow-100 rounded-xl text-left hover:shadow-lg transition-all group border border-glow-200"
              >
                <Package className="w-8 h-8 text-glow-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 mb-1">Mis Pedidos</h3>
                <p className="text-sm text-gray-600">Ver historial de compras</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/favorites')}
                className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl text-left hover:shadow-lg transition-all group border border-pink-200"
              >
                <Heart className="w-8 h-8 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 mb-1">Favoritos</h3>
                <p className="text-sm text-gray-600">Productos guardados</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/settings')}
                className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-left hover:shadow-lg transition-all group border border-purple-200"
              >
                <User className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 mb-1">Configuración</h3>
                <p className="text-sm text-gray-600">Ajustes de cuenta</p>
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}
