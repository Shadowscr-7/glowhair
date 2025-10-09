"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types";

interface User {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: "customer" | "admin" | "super_admin";
  is_admin: boolean;
  admin_permissions?: Record<string, boolean>;
  profile?: Profile;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData?: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  // Funciones de compatibilidad con el contexto anterior
  register: (email: string, password: string, userData?: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  state: AuthState;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
  });

  // Estado para favoritos (temporal - debería estar en base de datos)
  const [favorites, setFavorites] = useState<string[]>([]);

  // Función para obtener el perfil del usuario
  const getUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  };

  // Función para crear el objeto User a partir de SupabaseUser y Profile
  const createUserObject = useCallback(async (supabaseUser: SupabaseUser, profile?: Profile): Promise<User> => {
    const userProfile = profile || await getUserProfile(supabaseUser.id);
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      full_name: userProfile?.first_name && userProfile?.last_name 
        ? `${userProfile.first_name} ${userProfile.last_name}` 
        : supabaseUser.user_metadata?.full_name,
      first_name: userProfile?.first_name || supabaseUser.user_metadata?.first_name,
      last_name: userProfile?.last_name || supabaseUser.user_metadata?.last_name,
      avatar_url: userProfile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
      role: userProfile?.role || "customer",
      is_admin: userProfile?.role === "admin" || userProfile?.role === "super_admin",
      admin_permissions: userProfile?.admin_permissions,
      profile: userProfile,
    };
  }, []);

  // Registrar nuevo usuario
  const signUp = async (email: string, password: string, userData?: Partial<Profile>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData?.first_name,
            last_name: userData?.last_name,
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Crear perfil en la base de datos
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            email,
            first_name: userData?.first_name,
            last_name: userData?.last_name,
            role: "customer",
            ...userData
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
      setFavorites([]);
    } catch (error) {
      console.error("Error in signOut:", error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Actualizar perfil
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!state.user) {
        return { success: false, error: "No user logged in" };
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", state.user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Actualizar el estado local
      await refreshUser();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Refrescar datos del usuario
  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userObject = await createUserObject(user);
        setState(prev => ({
          ...prev,
          user: userObject,
          isAuthenticated: true,
          isAdmin: userObject.is_admin,
        }));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  // Funciones de compatibilidad
  const register = signUp;
  const logout = signOut;

  // Funciones de favoritos
  const toggleFavorite = async (productId: string) => {
    if (!state.user) return;
    
    setFavorites(prev => {
      const isFav = prev.includes(productId);
      if (isFav) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  // Inicializar y escuchar cambios de autenticación
  useEffect(() => {
    // Función para inicializar el estado de autenticación
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        if (session?.user) {
          const userObject = await createUserObject(session.user);
          setState({
            user: userObject,
            session,
            isAuthenticated: true,
            isLoading: false,
            isAdmin: userObject.is_admin,
          });
        } else {
          setState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            isAdmin: false,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    // Inicializar el estado
    initializeAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const userObject = await createUserObject(session.user);
          setState({
            user: userObject,
            session,
            isAuthenticated: true,
            isLoading: false,
            isAdmin: userObject.is_admin,
          });
        } else if (event === "SIGNED_OUT") {
          setState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            isAdmin: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [createUserObject]);

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
    register,
    logout,
    toggleFavorite,
    isFavorite,
    state,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}