import React from 'react';
import './HomePage.css'; 
import { Home, LogIn } from 'lucide-react';
import logoImage from '../assets/Logo.png'; // เช็ค path โลโก้ให้ตรง

const RegisterPage: React.FC = () => {
  return (
    <div className="page-wrapper">
      
      {/* ================= Navbar ================= */}
      <nav className="navbar">
        <div className="container navbar-container">
          <a href="/" className="navbar-left">
            <img src={logoImage} alt="Logo" className="navbar-logo" />
            <div className="brand-text">
              <span className="brand-title">New Learning Academy</span>
              <span className="brand-subtitle">สถาบันกวดวิชานิวเลิร์นนิง</span>
            </div>
          </a>
          
          <div className="navbar-menu">
            <a href="/" className="menu-item">
              <Home size={18} /> กลับหน้าหลัก
            </a>
            <a href="/login" className="menu-item active">
               <LogIn size={18} /> เข้าสู่ระบบ
            </a>
          </div>
        </div>
      </nav>

      {/* ================= Register Form Content ================= */}
      <div className="auth-container page-header-white" style={{ padding: '40px 20px'}}>
        {/* ขยายขนาดกล่องเล็กน้อย เพราะฟอร์มยาวขึ้น */}
        <div className="auth-card" style={{ maxWidth: '550px' }}>
          <div className="auth-header">
            <h2>สมัครสมาชิก</h2>
            <p>สร้างบัญชีเพื่อเริ่มต้นการเรียนรู้กับเรา</p>
          </div>

          <form>
            {/* ข้อมูลการเข้าสู่ระบบ */}
            <h3 style={{ fontSize: '1.1rem', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
              1. ข้อมูลการเข้าสู่ระบบ
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">ชื่อผู้ใช้งาน (Username) *</label>
                <input type="text" className="form-input" placeholder="เช่น somchai123" required />
              </div>
              <div className="form-group">
                <label className="form-label">อีเมล (Email) *</label>
                <input type="email" className="form-input" placeholder="name@example.com" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">รหัสผ่าน *</label>
                <input type="password" className="form-input" placeholder="ขั้นต่ำ 8 ตัวอักษร" required />
              </div>
              <div className="form-group">
                <label className="form-label">ยืนยันรหัสผ่าน *</label>
                <input type="password" className="form-input" placeholder="กรอกรหัสผ่านอีกครั้ง" required />
              </div>
            </div>

            {/* ข้อมูลส่วนตัว */}
            <h3 style={{ fontSize: '1.1rem', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', marginTop: '10px' }}>
              2. ข้อมูลส่วนตัวผู้เรียน
            </h3>

            <div className="form-group">
              <label className="form-label">ชื่อ - นามสกุล (Full Name) *</label>
              <input type="text" className="form-input" placeholder="กรอกชื่อและนามสกุลจริง" required />
            </div>

            <div className="form-group">
              <label className="form-label">เบอร์โทรศัพท์ (Phone)</label>
              <input type="tel" className="form-input" placeholder="เช่น 0812345678" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {/* ระดับชั้น (level_id) */}
              <div className="form-group">
                <label className="form-label">ระดับชั้นปัจจุบัน</label>
                <select className="form-input" style={{ cursor: 'pointer' }}>
                  <option value="">-- เลือกระดับชั้น --</option>
                  <option value="1">ประถมศึกษาปีที่ 4</option>
                  <option value="2">ประถมศึกษาปีที่ 5</option>
                  <option value="3">ประถมศึกษาปีที่ 6</option>
                  <option value="4">มัธยมศึกษาปีที่ 1</option>
                  <option value="5">มัธยมศึกษาปีที่ 2</option>
                  <option value="6">มัธยมศึกษาปีที่ 3</option>
                </select>
              </div>
              
              {/* วิชาที่สนใจ (interesting_subject) */}
              <div className="form-group">
                <label className="form-label">วิชาที่สนใจเป็นพิเศษ</label>
                <select className="form-input" style={{ cursor: 'pointer' }}>
                  <option value="">-- เลือกวิชา --</option>
                  <option value="math">คณิตศาสตร์</option>
                  <option value="science">วิทยาศาสตร์</option>
                  <option value="english">ภาษาอังกฤษ</option>
                  <option value="thai">ภาษาไทย</option>
                  <option value="social">สังคมศึกษา</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-submit" style={{ marginTop: '20px' }}>
              ลงทะเบียน
            </button>
          </form>

          <div className="divider">
            <span>หรือสมัครด้วย</span>
          </div>

          <button className="btn-google">
             <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <div className="auth-footer">
            มีบัญชีอยู่แล้ว? <a href="/login">เข้าสู่ระบบที่นี่</a>
          </div>
        </div>
      </div>

      {/* ================= Footer ================= */}
      <footer className="footer">
        <div className="container text-center">
          <div className="copyright" style={{ border: 'none' }}>
            © 2026 New Learning Academy. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default RegisterPage;