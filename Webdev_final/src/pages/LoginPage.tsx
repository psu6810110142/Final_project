import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // ✅ 1. เพิ่ม useNavigate
import './HomePage.css'; 
import { Home, UserPlus } from 'lucide-react'; 
import logoImage from '../assets/Logo.png'; 

const LoginPage: React.FC = () => {
  const navigate = useNavigate(); // ✅ 2. สร้างตัวแปร navigate
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        email: email,
        password: password 
      });

      console.log("Login Response:", response.data); // 🔍 ดูข้อมูลที่ได้จาก Backend

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // ดึง Role และแปลงเป็นตัวพิมพ์ใหญ่กันเหนียว
        const userRole = response.data.user.role?.toUpperCase(); 
        console.log("User Role is:", userRole); // 🔍 เช็คว่า Role เป็นอะไร

        alert(`ยินดีต้อนรับคุณ ${response.data.user.full_name || response.data.user.username}`);

        // ✅ 3. ใช้ navigate แทน window.location.href
        if (userRole === 'ADMIN') {
          console.log("Redirecting to Admin Dashboard...");
          navigate('/manage-courses'); 
        } else {
          console.log("Redirecting to Home...");
          navigate('/home');
        }
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      alert(error.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="container navbar-container">
          <Link to="/" className="navbar-left"> {/* ใช้ Link แทน a href */}
            <img src={logoImage} alt="Logo" className="navbar-logo" />
            <div className="brand-text">
              <span className="brand-title">New Learning Academy</span>
              <span className="brand-subtitle">สถาบันกวดวิชานิวเลิร์นนิง</span>
            </div>
          </Link>
          <div className="navbar-menu">
            <Link to="/" className="menu-item">
              <Home size={18} /> กลับหน้าหลัก
            </Link>
            <Link to="/register" className="menu-item">
               <UserPlus size={18} /> สมัครสมาชิก
            </Link>
          </div>
        </div>
      </nav>

      <div className="auth-container page-header-white">
        <div className="auth-card">
          <div className="auth-header">
            <h2>เข้าสู่ระบบ</h2>
            <p>ยินดีต้อนรับกลับมา! กรุณาล็อกอินเพื่อเข้าเรียน</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">อีเมล</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">รหัสผ่าน</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="กรอกรหัสผ่านของคุณ" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
              <div className="forgot-password-row">
                <label className="remember-me">
                    <input type="checkbox" style={{accentColor: '#2563eb'}} /> จดจำฉันไว้
                </label>
                <a href="#" className="forgot-link">ลืมรหัสผ่าน?</a>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-submit" 
              disabled={loading}
              style={{ width: '100%', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="divider"><span>หรือเข้าสู่ระบบด้วย</span></div>
          <button className="btn-google">Google</button>

          <div className="auth-footer">
            ยังไม่มีบัญชีใช่ไหม? <Link to="/register">สมัครสมาชิกที่นี่</Link>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="copyright">© 2026 New Learning Academy. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;