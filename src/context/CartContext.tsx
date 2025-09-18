"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: ReactNode;
  category: string;
  brand: string;
  size?: string;
  inStock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.product.id
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { 
                ...item, 
                quantity: Math.min(item.quantity + action.quantity, item.inStock) 
              }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          ...action.product,
          quantity: Math.min(action.quantity, action.product.inStock)
        };
        newItems = [...state.items, newItem];
      }

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      const newState = {
        ...state,
        items: newItems,
        total,
        itemCount
      };
      
      return newState;
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(item => item.id !== action.productId);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount
      };
    }

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", productId: action.productId });
      }

      const newItems = state.items.map(item =>
        item.id === action.productId
          ? { ...item, quantity: Math.min(action.quantity, item.inStock) }
          : item
      );

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount
      };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      };
    }

    case "TOGGLE_CART": {
      return {
        ...state,
        isOpen: !state.isOpen
      };
    }

    case "OPEN_CART": {
      return {
        ...state,
        isOpen: true
      };
    }

    case "CLOSE_CART": {
      return {
        ...state,
        isOpen: false
      };
    }

    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false
};

interface CartContextType {
  state: CartState;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("glowhair-cart");
    if (savedCart) {
      try {
        const { items } = JSON.parse(savedCart);
        items.forEach((item: CartItem) => {
          dispatch({
            type: "ADD_ITEM",
            product: item,
            quantity: item.quantity
          });
        });
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem("glowhair-cart", JSON.stringify({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount
      }));
    } else {
      localStorage.removeItem("glowhair-cart");
    }
  }, [state.items, state.total, state.itemCount]);

  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: "ADD_ITEM", product, quantity });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const openCart = () => {
    dispatch({ type: "OPEN_CART" });
  };

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
};

// Cart Drawer Component
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const CartDrawer = () => {
  const { state, removeItem, updateQuantity, closeCart } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={24} />
                Carrito ({state.itemCount})
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {state.items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-glow-50 to-glow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="w-8 h-8">
                            {item.image}
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 text-xs">
                            {item.brand} • {item.category}
                          </p>
                          <p className="text-glow-600 font-semibold text-sm mt-1">
                            ${item.price.toFixed(2)}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-100 transition-colors"
                              >
                                <Minus size={12} />
                              </motion.button>
                              <span className="px-3 py-1 text-sm border-x border-gray-300">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.inStock}
                                className="p-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                              >
                                <Plus size={12} />
                              </motion.button>
                            </div>

                            {/* Remove Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-glow-600">
                    ${state.total.toFixed(2)}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-glow-600 to-glow-500 text-white py-3 rounded-lg font-semibold hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
                >
                  Proceder al Pago
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeCart}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Continuar Comprando
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartContext;