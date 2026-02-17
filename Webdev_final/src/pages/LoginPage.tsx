import React from 'react';
import './HomePage.css'; // ใช้ CSS ไฟล์เดียวกับ Home/Register เพื่อคุม Theme
import { Home, UserPlus } from 'lucide-react'; 
import logoImage from '../assets/Logo.png'; // เช็คชื่อไฟล์รูปโลโก้ให้ตรงนะครับ

const LoginPage: React.FC = () => {
  return (
    <div className="page-wrapper">
      
      {/* ================= Navbar (สำหรับหน้า Login) ================= */}
      <nav className="navbar">
        <div className="container navbar-container">
          {/* Logo */}
          <a href="/" className="navbar-left">
            <img src={logoImage} alt="Logo" className="navbar-logo" />
            <div className="brand-text">
              <span className="brand-title">New Learning Academy</span>
              <span className="brand-subtitle">สถาบันกวดวิชานิวเลิร์นนิง</span>
            </div>
          </a>
          
          {/* Menu: หน้า Login จะมีปุ่มชวนไป "สมัครสมาชิก" */}
          <div className="navbar-menu">
            <a href="/" className="menu-item">
              <Home size={18} /> กลับหน้าหลัก
            </a>
            <a href="/register" className="menu-item active">
               <UserPlus size={18} /> สมัครสมาชิก
            </a>
          </div>
        </div>
      </nav>

      {/* ================= Login Form Content ================= */}
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>เข้าสู่ระบบ</h2>
            <p>ยินดีต้อนรับกลับมา! กรุณาล็อกอินเพื่อเข้าเรียน</p>
          </div>

          <form>
            <div className="form-group">
              <label className="form-label">อีเมล</label>
              <input type="email" className="form-input" placeholder="name@example.com" />
            </div>

            <div className="form-group">
              <label className="form-label">รหัสผ่าน</label>
              <input type="password" className="form-input" placeholder="กรอกรหัสผ่านของคุณ" />
              
              {/* ลิงก์ลืมรหัสผ่าน */}
              <div className="forgot-password-row">
                <label className="remember-me">
                    <input type="checkbox" style={{accentColor: '#2563eb'}} /> จดจำฉันไว้
                </label>
                <a href="#" className="forgot-link">ลืมรหัสผ่าน?</a>
              </div>
            </div>

            {/* ตัวอย่างการแก้ปุ่มใน LoginPage.tsx เพื่อทดสอบลิ้งก์ไปหน้า Home */}
            <a href="/home" className="btn-submit" style={{display:'block', textAlign:'center', textDecoration:'none'}}>
            เข้าสู่ระบบ (Demo Link)
            </a>
          </form>

          <div className="divider">
            <span>หรือเข้าสู่ระบบด้วย</span>
          </div>

          <button className="btn-google">
             {/* Google Icon SVG */}
             <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <div className="auth-footer">
            ยังไม่มีบัญชีใช่ไหม? <a href="/register">สมัครสมาชิกที่นี่</a>
          </div>
        </div>
      </div>

      {/* ================= Footer ================= */}
      <footer className="footer">
        <div className="container">
          <div className="copyright">
            © 2026 New Learning Academy. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LoginPage;