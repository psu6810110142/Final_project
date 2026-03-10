import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

interface CartItem {
  cart_item_id: number;
  added_at: string;
  course: {
    course_id: number;
    title: string;
    price: string;
    cover_image_url?: string;
    instructor?: { name: string };
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (courseId: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const fetchCart = async () => {
    const user = getUser();
    if (!user) return;

    try {
      const response = await api.get(`/cart-items/user/${user.sub}`);
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (courseId: number): Promise<boolean> => {
    const user = getUser();
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนหยิบใส่ตะกร้าครับ');
      return false;
    }

    try {
      await api.post('/cart-items', {
        user_id: user.sub,
        course_id: courseId,
      });
      await fetchCart();
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('เกิดข้อผิดพลาด หรือคอร์สนี้อาจจะอยู่ในตะกร้าแล้วครับ');
      return false;
    }
  };

  const removeFromCart = async (cartItemId: number): Promise<void> => {
    try {
      await api.delete(`/cart-items/${cartItemId}`);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount: cartItems.length, fetchCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};