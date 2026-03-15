import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Book, User, LogOut, ShoppingCart, LogIn, UserPlus } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useNotifications } from '../contexts/NotificationContext';
import logoImage from '../assets/Logo.png'; 
import '../pages/HomeTheme.css';
import { useCart } from '../contexts/CartContext';
import CartSidebar from './CartSidebar';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { cartCount } = useCart();
  const { unreadCount } = useNotifications();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    setCurrentUser(null);
    window.location.replace('/landing');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        
        {/* เปลี่ยน a href="/" เป็น Link to="/" ตามหลัก React */}
        <Link to="/" className="navbar-left">
          <img src={logoImage} alt="Logo" className="navbar-logo" />
          <div className="brand-text">
            <span className="brand-title">New Learning Academy</span>
            <span className="brand-subtitle">สถาบันกวดวิชานิวเลิร์นนิง</span>
          </div>
        </Link>

        <div className="navbar-menu">
          {/* ระบบเช็ค Active อัตโนมัติ */}
          <Link to="/home" className={`menu-item ${location.pathname === '/home' ? 'active' : ''}`}>
            <Home size={18} /> หน้าหลัก
          </Link>
          <Link to="/courses" className={`menu-item ${location.pathname === '/courses' ? 'active' : ''}`}>
            <Book size={18} /> คอร์สเรียน
          </Link>

          {/* ไอคอนตะกร้า */}
          <div 
            className="menu-item" 
            style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={18} /> ตะกร้า
            
            {/* โชว์วงกลมสีแดง เฉพาะตอนที่มีของในตะกร้า (> 0) */}
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-15px',
                backgroundColor: '#ef4444', color: 'white',
                borderRadius: '50%', minWidth: '18px', height: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 'bold'
              }}>
                {cartCount}
              </span>
            )}
          </div>

          {/* ลอจิก Login/Register ใช้โครงสร้างเดิมของคุณ 100% */}
          {currentUser ? (
            <>
              <Link to="/my-courses" className={`menu-item ${location.pathname === '/my-courses' ? 'active' : ''}`}>
                <User size={18} /> คอร์สของฉัน
              </Link>
              <a onClick={handleLogout} className="menu-item" style={{ cursor: 'pointer' }}>
                <LogOut size={18} /> ออกจากระบบ
              </a>
              <NotificationBell />
              <div className="user-pill" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                {currentUser.full_name || currentUser.username}
              </div>
            </>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn-nav-login">
                <LogIn size={18} /> เข้าสู่ระบบ
              </Link>
              <Link to="/register" className="btn-nav-register">
                <UserPlus size={18} /> สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </div>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};

export default Navbar;