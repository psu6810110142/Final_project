import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './HomePage.css'; 
import { Home, UserPlus } from 'lucide-react'; 
import logoImage from '../assets/Logo.png'; 

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
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

      console.log("Login Response:", response.data);

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // ดึง Role และแปลงเป็นตัวพิมพ์ใหญ่
        const userRole = response.data.user.role?.toUpperCase(); 
        console.log("User Role is:", userRole);

        alert(`ยินดีต้อนรับคุณ ${response.data.user.full_name || response.data.user.username}`);

        // นำทางไปยังหน้าที่เหมาะสมตาม Role
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
          <Link to="/" className="navbar-left">
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

          <div className="divider">
            <span>หรือเข้าสู่ระบบด้วย</span>
          </div>

          <button className="btn-google">
             <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

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