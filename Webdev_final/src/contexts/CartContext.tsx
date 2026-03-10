import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

interface CartContextType {
  cartItems: any[];
  cartCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (courseId: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<void>;
}

// สร้าง Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// สร้าง Provider (ตัวคลุมระบบเพื่อแจกจ่ายข้อมูล)
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);

  // ฟังก์ชันไปดึงข้อมูลตะกร้าจาก Backend
  const fetchCart = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return; // ถ้าไม่ได้ล็อกอิน ไม่ต้องดึง

    try {
      const user = JSON.parse(userStr);
      // สมมติว่า Backend ของเพื่อนมี API สำหรับดึงตะกร้าของ User คนนี้
      const response = await api.get(`/cart-items/user/${user.user_id || user.id}`);
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // ดึงตะกร้าครั้งแรกตอนเปิดเว็บ
  useEffect(() => {
    fetchCart();
  }, []);

  // ฟังก์ชันเพิ่มของลงตะกร้า
  const addToCart = async (courseId: number) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('กรุณาเข้าสู่ระบบก่อนหยิบใส่ตะกร้าครับ');
      return false;
    }

    try {
      const user = JSON.parse(userStr);
      await api.post('/cart-items', {
        user_id: user.user_id || user.id,
        course_id: courseId
      });
      await fetchCart(); // ดึงข้อมูลใหม่เพื่ออัปเดตตัวเลข
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('เกิดข้อผิดพลาด หรือคอร์สนี้อาจจะอยู่ในตะกร้าแล้วครับ');
      return false;
    }
  };

  // ฟังก์ชันลบของออกจากตะกร้า
  const removeFromCart = async (cartItemId: number) => {
    try {
      await api.delete(`/cart-items/${cartItemId}`);
      await fetchCart(); // ดึงข้อมูลใหม่
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

// Hook สำหรับให้หน้าอื่นๆ เรียกใช้งานได้ง่ายๆ
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};