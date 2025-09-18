"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";

// Order interfaces
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

// Analytics interfaces
interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Order[];
}

interface AdminState {
  products: Product[];
  orders: Order[];
  analytics: SalesAnalytics;
  isLoading: boolean;
}

type AdminAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_PRODUCTS"; products: Product[] }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; product: Product }
  | { type: "DELETE_PRODUCT"; productId: number }
  | { type: "SET_ORDERS"; orders: Order[] }
  | { type: "UPDATE_ORDER_STATUS"; orderId: string; status: Order["status"] }
  | { type: "SET_ANALYTICS"; analytics: SalesAnalytics };

const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };

    case "SET_PRODUCTS":
      return { ...state, products: action.products };

    case "ADD_PRODUCT":
      return {
        ...state,
        products: [...state.products, action.product]
      };

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.product.id ? action.product : p
        )
      };

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.productId)
      };

    case "SET_ORDERS":
      return { ...state, orders: action.orders };

    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.orderId
            ? { ...order, status: action.status }
            : order
        )
      };

    case "SET_ANALYTICS":
      return { ...state, analytics: action.analytics };

    default:
      return state;
  }
};

// Mock data
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerId: "customer_1",
    customerName: "María García",
    customerEmail: "maria@email.com",
    items: [
      {
        id: "1",
        name: "Shampoo Hidratante Premium",
        price: 29.99,
        quantity: 2,
        image: "shampoo"
      }
    ],
    total: 59.98,
    status: "delivered",
    createdAt: "2024-12-15T10:30:00Z",
    shippingAddress: {
      street: "Av. Principal 123",
      city: "Madrid",
      state: "Madrid",
      zipCode: "28001",
      country: "España"
    },
    paymentMethod: "Tarjeta de Crédito"
  },
  {
    id: "ORD-002",
    customerId: "customer_2",
    customerName: "Ana López",
    customerEmail: "ana@email.com",
    items: [
      {
        id: "2",
        name: "Acondicionador Reparador",
        price: 24.99,
        quantity: 1,
        image: "conditioner"
      },
      {
        id: "3",
        name: "Mascarilla Nutritiva",
        price: 34.99,
        quantity: 1,
        image: "mask"
      }
    ],
    total: 59.98,
    status: "processing",
    createdAt: "2024-12-16T14:15:00Z",
    shippingAddress: {
      street: "Calle Secundaria 456",
      city: "Barcelona",
      state: "Cataluña",
      zipCode: "08001",
      country: "España"
    },
    paymentMethod: "PayPal"
  },
  {
    id: "ORD-003",
    customerId: "customer_3",
    customerName: "Carmen Ruiz",
    customerEmail: "carmen@email.com",
    items: [
      {
        id: "4",
        name: "Serum Anti-Frizz",
        price: 19.99,
        quantity: 3,
        image: "serum"
      }
    ],
    total: 59.97,
    status: "shipped",
    createdAt: "2024-12-17T09:45:00Z",
    shippingAddress: {
      street: "Plaza Mayor 789",
      city: "Valencia",
      state: "Valencia",
      zipCode: "46001",
      country: "España"
    },
    paymentMethod: "Transferencia"
  }
];

const initialAnalytics: SalesAnalytics = {
  totalRevenue: 2450.75,
  totalOrders: 48,
  totalProducts: 12,
  totalCustomers: 156,
  revenueGrowth: 15.5,
  ordersGrowth: 8.2,
  topProducts: [
    { id: "1", name: "Shampoo Hidratante Premium", sales: 24, revenue: 719.76 },
    { id: "3", name: "Mascarilla Nutritiva", sales: 18, revenue: 629.82 },
    { id: "2", name: "Acondicionador Reparador", sales: 15, revenue: 374.85 },
    { id: "4", name: "Serum Anti-Frizz", sales: 12, revenue: 239.88 }
  ],
  recentOrders: mockOrders.slice(0, 5)
};

interface AdminContextType {
  state: AdminState;
  // Product management
  addProduct: (product: Omit<Product, "id">) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (productId: number) => Promise<boolean>;
  // Order management
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<boolean>;
  // Analytics
  refreshAnalytics: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const [state, dispatch] = useReducer(adminReducer, {
    products: [],
    orders: [],
    analytics: initialAnalytics,
    isLoading: false
  });

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      dispatch({ type: "SET_LOADING", loading: true });
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load mock data
      const { mockProducts } = await import("@/data/products");
      dispatch({ type: "SET_PRODUCTS", products: mockProducts });
      dispatch({ type: "SET_ORDERS", orders: mockOrders });
      dispatch({ type: "SET_ANALYTICS", analytics: initialAnalytics });
      
      dispatch({ type: "SET_LOADING", loading: false });
    };

    initializeData();
  }, []);

  const addProduct = async (productData: Omit<Product, "id">): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", loading: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newProduct: Product = {
        ...productData,
        id: Date.now() // Generate simple ID
      };
      
      dispatch({ type: "ADD_PRODUCT", product: newProduct });
      dispatch({ type: "SET_LOADING", loading: false });
      
      return true;
    } catch (error) {
      dispatch({ type: "SET_LOADING", loading: false });
      return false;
    }
  };

  const updateProduct = async (product: Product): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", loading: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch({ type: "UPDATE_PRODUCT", product });
      dispatch({ type: "SET_LOADING", loading: false });
      
      return true;
    } catch (error) {
      dispatch({ type: "SET_LOADING", loading: false });
      return false;
    }
  };

  const deleteProduct = async (productId: number): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", loading: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      dispatch({ type: "DELETE_PRODUCT", productId });
      dispatch({ type: "SET_LOADING", loading: false });
      
      return true;
    } catch (error) {
      dispatch({ type: "SET_LOADING", loading: false });
      return false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", loading: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch({ type: "UPDATE_ORDER_STATUS", orderId, status });
      dispatch({ type: "SET_LOADING", loading: false });
      
      return true;
    } catch (error) {
      dispatch({ type: "SET_LOADING", loading: false });
      return false;
    }
  };

  const refreshAnalytics = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", loading: true });
      
      // Simulate API call to recalculate analytics
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Recalculate analytics based on current orders
      const totalRevenue = state.orders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = state.orders.length;
      
      const updatedAnalytics: SalesAnalytics = {
        ...state.analytics,
        totalRevenue,
        totalOrders,
        totalProducts: state.products.length
      };
      
      dispatch({ type: "SET_ANALYTICS", analytics: updatedAnalytics });
      dispatch({ type: "SET_LOADING", loading: false });
    } catch (error) {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const value: AdminContextType = {
    state,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    refreshAnalytics
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
export type { Order, OrderItem, SalesAnalytics, Product };