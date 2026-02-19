import { Product } from "@/lib/database-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // Get user-specific storage key
  const getStorageKey = () => {
    return user ? `@printcraft_cart_${user.id}` : "@printcraft_cart_guest";
  };

  // Load cart when user changes
  useEffect(() => {
    console.log("🛒 User changed, loading cart for:", user?.id || "guest");
    loadCart();
  }, [user?.id]);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveCart();
  }, [items]);

  const loadCart = async () => {
    try {
      const storageKey = getStorageKey();
      console.log("📦 Loading cart from key:", storageKey);
      const savedCart = await AsyncStorage.getItem(storageKey);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log("✅ Cart loaded with", parsedCart.length, "items");
        setItems(parsedCart);
      } else {
        console.log("📭 No cart found, starting with empty cart");
        setItems([]);
      }
    } catch (error) {
      console.error("❌ Error loading cart:", error);
    }
  };

  const saveCart = async () => {
    try {
      // Only save if we have a valid storage key (user or guest)
      const storageKey = getStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(items));
      console.log(
        "💾 Cart saved to key:",
        storageKey,
        "- items:",
        items.length,
      );
    } catch (error) {
      console.error("❌ Error saving cart:", error);
    }
  };

  const addItem = (product: Product, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id,
      );

      if (existingItem) {
        // Update quantity if item exists
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      } else {
        // Add new item
        return [...currentItems, { product, quantity }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (productId: string): boolean => {
    return items.some((item) => item.product.id === productId);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const value = {
    items,
    itemCount,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
