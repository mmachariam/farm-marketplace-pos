// ===========================================
// CART CONTEXT
// Shares the buyer's cart across pages (Browse → Checkout)
// without needing to pass props through every component.
//
// Usage:
// 1. Wrap the app in <CartProvider> (done in App.jsx)
// 2. In any component: const { cart, addToCart, removeFromCart, clearCart, cartTotal } = useCart();
// ===========================================

import { createContext, useContext, useState } from "react";

// Create the context object
const CartContext = createContext(null);

// Provider component - wraps the whole app
export function CartProvider({ children }) {
  // cart = [{ product_id, name, price, quantity, stock_quantity }]
  const [cart, setCart] = useState([]);

  // Add item to cart, or increase quantity if it already exists
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product_id === product.product_id);

      if (existing) {
        return prevCart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock_quantity ?? Infinity) }
            : item
        );
      }

      return [
        ...prevCart,
        {
          product_id: product.product_id,
          name: product.product_name || product.name,
          price: product.price,
          quantity: 1,
          stock_quantity: product.stock_quantity,
        },
      ];
    });
  };

  // Decrease quantity by 1, remove item if it reaches 0
  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product_id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Empty the cart entirely (after checkout)
  const clearCart = () => setCart([]);

  // Running total - recalculated whenever cart changes
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for easy access in any component
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
