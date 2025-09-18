"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "customer" | "admin";
  avatar?: string;
  createdAt: string;
  preferences: {
    newsletter: boolean;
    promotions: boolean;
    hairType: string[];
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  favorites: string[]; // Array of product IDs
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; user: User }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "REGISTER_START" }
  | { type: "REGISTER_SUCCESS"; user: User }
  | { type: "REGISTER_FAILURE" }
  | { type: "UPDATE_USER"; user: User }
  | { type: "ADD_FAVORITE"; productId: string }
  | { type: "REMOVE_FAVORITE"; productId: string }
  | { type: "SET_FAVORITES"; favorites: string[] };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return {
        ...state,
        isLoading: true
      };

    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        user: action.user,
        isAuthenticated: true,
        isLoading: false
      };

    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        favorites: []
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: action.user
      };

    case "ADD_FAVORITE":
      if (state.favorites.includes(action.productId)) return state;
      return {
        ...state,
        favorites: [...state.favorites, action.productId]
      };

    case "REMOVE_FAVORITE":
      return {
        ...state,
        favorites: state.favorites.filter(id => id !== action.productId)
      };

    case "SET_FAVORITES":
      return {
        ...state,
        favorites: action.favorites
      };

    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  favorites: []
};

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  hairType: string[];
  newsletter: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user and favorites from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("glowhair-user");
    const savedFavorites = localStorage.getItem("glowhair-favorites");
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: "LOGIN_SUCCESS", user });
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        localStorage.removeItem("glowhair-user");
      }
    }

    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        dispatch({ type: "SET_FAVORITES", favorites });
      } catch (error) {
        console.error("Error loading favorites from localStorage:", error);
        localStorage.removeItem("glowhair-favorites");
      }
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("glowhair-user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("glowhair-user");
    }
  }, [state.user]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (state.favorites.length > 0) {
      localStorage.setItem("glowhair-favorites", JSON.stringify(state.favorites));
    } else {
      localStorage.removeItem("glowhair-favorites");
    }
  }, [state.favorites]);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, create a mock user based on email
      let role: "customer" | "admin" = "customer";
      let firstName = "Juan";
      let lastName = "Pérez";
      
      // Check if it's admin user
      if (email === "admin@glowhair.com") {
        role = "admin";
        firstName = "Admin";
        lastName = "GlowHair";
      }
      
      const mockUser: User = {
        id: "user_" + Date.now(),
        firstName,
        lastName,
        email: email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + " " + lastName)}&background=7c3aed&color=fff`,
        createdAt: new Date().toISOString(),
        preferences: {
          newsletter: true,
          promotions: false,
          hairType: ["Normal"]
        }
      };

      dispatch({ type: "LOGIN_SUCCESS", user: mockUser });
      return true;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    dispatch({ type: "REGISTER_START" });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newUser: User = {
        id: "user_" + Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: "customer", // Los usuarios registrados son clientes por defecto
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.firstName + " " + userData.lastName)}&background=7c3aed&color=fff`,
        createdAt: new Date().toISOString(),
        preferences: {
          newsletter: userData.newsletter,
          promotions: false,
          hairType: userData.hairType
        }
      };

      dispatch({ type: "REGISTER_SUCCESS", user: newUser });
      return true;
    } catch (error) {
      dispatch({ type: "REGISTER_FAILURE" });
      return false;
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!state.user) return false;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser: User = {
        ...state.user,
        ...userData
      };

      dispatch({ type: "UPDATE_USER", user: updatedUser });
      return true;
    } catch (error) {
      return false;
    }
  };

  const addFavorite = (productId: string) => {
    dispatch({ type: "ADD_FAVORITE", productId });
  };

  const removeFavorite = (productId: string) => {
    dispatch({ type: "REMOVE_FAVORITE", productId });
  };

  const toggleFavorite = (productId: string) => {
    if (isFavorite(productId)) {
      removeFavorite(productId);
    } else {
      addFavorite(productId);
    }
  };

  const isFavorite = (productId: string): boolean => {
    return state.favorites.includes(productId);
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateUser,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;