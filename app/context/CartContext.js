import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  // Bổ sung thêm state này để CartScreen có thể cập nhật số lượng badge từ API
  const [cartCount, setCartCount] = useState(0);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const increaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Sửa lỗi: cartItems -> cart
  const getTotalQuantity = () =>
    cart.reduce((total, item) => total + (item.quantity || 0), 0);

  // Backwards-compatible helper expected elsewhere: return explicit cartCount if set, else computed total
  const getCartCount = () => (typeof cartCount === 'number' && cartCount >= 0 ? cartCount : getTotalQuantity());

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,    // Thêm vào để CartScreen sử dụng
        setCartCount, // Thêm vào để CartScreen sử dụng
        getCartCount,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        getTotalQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    // Trả về object rỗng tránh lỗi crash nếu gọi ngoài Provider
    return {};
  }
  return context;
};