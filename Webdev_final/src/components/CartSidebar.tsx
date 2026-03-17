import React from 'react';
import { X, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart } = useCart();
  const navigate = useNavigate();

  // คำนวณยอดรวมของสินค้าทั้งหมดในตะกร้า
  const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.course.price || 0), 0);

  
  // ฟังก์ชันกดปุ่มชำระเงิน
  const handleCheckout = () => {
  onClose();
  navigate('/payment'); // ไม่มี courseId = มาจากตะกร้า
};

  // ดักจับรูปภาพพัง
  const getImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    return url.startsWith('/uploads') ? `http://localhost:3001${url}` : url;
  };

  return (
    <>
      {/* 1. พื้นหลังสีดำจางๆ (Overlay) เอาไว้กดเพื่อปิด */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999,
          opacity: isOpen ? 1 : 0, visibility: isOpen ? 'visible' : 'hidden',
          transition: 'all 0.3s ease-in-out'
        }}
        onClick={onClose}
      />

      {/* 2. ตัวแถบ Sidebar ที่สไลด์ออกมาจากด้านขวา */}
      <div
        style={{
          position: 'fixed', top: 0, right: isOpen ? 0 : '-400px', // สไลด์ซ่อน/โชว์
          width: '400px', maxWidth: '100%', height: '100vh',
          backgroundColor: 'white', zIndex: 1000,
          boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
          transition: 'right 0.3s ease-in-out',
          display: 'flex', flexDirection: 'column'
        }}
      >
        {/* ส่วนหัวตะกร้า */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>ตะกร้าสินค้า ({cartItems.length})</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </div>

        {/* ส่วนเนื้อหาคอร์สที่เลือก (เลื่อน Scroll ได้) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '50px' }}>
              <ShoppingCart size={48} style={{ margin: '0 auto 15px', opacity: 0.5 }} />
              <p>ตะกร้าของคุณยังว่างเปล่า</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.cart_item_id} style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                {/* รูปคอร์สจิ๋ว */}
                <img src={getImageUrl(item.course.cover_image_url)} alt={item.course.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                
                {/* ชื่อและราคา */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', color: '#334155', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.course.title}
                  </h4>
                  <div style={{ color: '#2563eb', fontWeight: 'bold' }}>฿{Number(item.course.price).toLocaleString()}</div>
                </div>

                {/* ปุ่มลบทิ้ง */}
                <button 
                  onClick={() => removeFromCart(item.cart_item_id)} 
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px', height: 'fit-content' }}
                  title="ลบออกจากตะกร้า"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* ส่วนท้าย: สรุปยอดและปุ่มจ่ายเงิน */}
        {cartItems.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem', fontWeight: 'bold' }}>
              <span style={{ color: '#475569' }}>ยอดรวมทั้งหมด:</span>
              <span style={{ color: '#2563eb' }}>฿{totalAmount.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout} 
              style={{ width: '100%', padding: '14px', backgroundColor: '#3674B5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#18334F'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3674B5'}
            >
              ดำเนินการชำระเงิน
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;