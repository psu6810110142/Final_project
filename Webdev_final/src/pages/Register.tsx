import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomeTheme.css'; 
import { Home, LogIn } from 'lucide-react';
import logoImage from '../assets/Logo.png'; 
import api from '../api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // 1. สร้าง State เก็บข้อมูล (รวมฟิลด์ใหม่ level_id และ interesting_subject)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password_hash: '', 
    confirmPassword: '',
    full_name: '',
    phone: '',
    level_id: '', 
    interesting_subject: '', 
    role: 'STUDENT'
  });

  const [loading, setLoading] = useState(false);

  // ✨ 1. สร้าง State มารับข้อมูลระดับชั้นจาก Database
  const [levels, setLevels] = useState<any[]>([]);

  // ✨ 2. ใช้ useEffect ดึงข้อมูล Levels ตอนเปิดหน้าเว็บ
  React.useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await api.get('/levels');
        setLevels(response.data);
      } catch (err) {
        console.error('Fetch levels error:', err);
      }
    };
    fetchLevels();
  }, []);

  // 2. ฟังก์ชันอัปเดตค่าเมื่อพิมพ์ หรือเลือก Dropdown
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. ฟังก์ชันส่งข้อมูลสมัครสมาชิก
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // เช็ครหัสผ่านให้ตรงกันก่อนส่ง
    if (formData.password_hash !== formData.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกันครับ!');
      return;
    }

    setLoading(true);
    try {
      // ยิงไปที่ NestJS (Port 3001)
      const response = await api.post('/users', {
        username: formData.username,
        email: formData.email,
        password_hash: formData.password_hash,
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role,
        interesting_subject: formData.interesting_subject,
        // เปิดคอมเมนต์ด้านล่างหาก Backend ต้องการ level_id เป็นตัวเลข (number)
        // level_id: formData.level_id ? parseInt(formData.level_id) : null 
      });

      if (response.status === 201) {
        alert('ลงทะเบียนสำเร็จ! ยินดีต้อนรับครับ');
        navigate('/login'); // เปลี่ยนหน้าโดยใช้ React Router
      }
    } catch (error: any) {
      console.error('Register Error:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      
      {/* ================= Navbar ================= */}
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
            <Link to="/login" className="menu-item active">
               <LogIn size={18} /> เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= Register Form Content ================= */}
      <div className="auth-container page-header-white" style={{ padding: '40px 20px'}}>
        <div className="auth-card" style={{ maxWidth: '600px' }}>
          <div className="auth-header">
            <h2>สมัครสมาชิก</h2>
            <p>สร้างบัญชีเพื่อเริ่มต้นการเรียนรู้กับเรา</p>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* --- ส่วนที่ 1: ข้อมูลล็อกอิน --- */}
            <h3 style={{ fontSize: '1.1rem', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
              1. ข้อมูลการเข้าสู่ระบบ
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">ชื่อผู้ใช้งาน (Username) *</label>
                <input 
                  name="username"
                  type="text" 
                  className="form-input" 
                  placeholder="เช่น somchai123" 
                  value={formData.username}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">อีเมล (Email) *</label>
                <input 
                  name="email"
                  type="email" 
                  className="form-input" 
                  placeholder="name@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">รหัสผ่าน *</label>
                <input 
                  name="password_hash"
                  type="password" 
                  className="form-input" 
                  placeholder="ขั้นต่ำ 6 ตัวอักษร" 
                  value={formData.password_hash}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">ยืนยันรหัสผ่าน *</label>
                <input 
                  name="confirmPassword"
                  type="password" 
                  className="form-input" 
                  placeholder="กรอกรหัสผ่านอีกครั้ง" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* --- ส่วนที่ 2: ข้อมูลส่วนตัว --- */}
            <h3 style={{ fontSize: '1.1rem', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', marginTop: '10px' }}>
              2. ข้อมูลส่วนตัวผู้เรียน
            </h3>

            <div className="form-group">
              <label className="form-label">ชื่อ - นามสกุล (Full Name) *</label>
              <input 
                name="full_name"
                type="text" 
                className="form-input" 
                placeholder="กรอกชื่อและนามสกุลจริง" 
                value={formData.full_name}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">เบอร์โทรศัพท์ (Phone)</label>
              <input 
                name="phone"
                type="tel" 
                className="form-input" 
                placeholder="เช่น 0812345678" 
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {/* ระดับชั้น */}
              <div className="form-group">
                <label className="form-label">ระดับชั้นปัจจุบัน</label>
                <select 
                  name="level_id"
                  className="form-input" 
                  style={{ cursor: 'pointer' }}
                  value={formData.level_id}
                  onChange={handleChange}
                >
                  <option value="">-- เลือกระดับชั้น --</option>
                  {/* ✨ 3. เอา levels ที่ดึงมา วนลูปสร้างตัวเลือก */}
                  {levels.map((level) => (
                    <option key={level.level_id} value={level.level_id}>
                      {level.level_name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* วิชาที่สนใจ */}
              <div className="form-group">
                <label className="form-label">วิชาที่สนใจเป็นพิเศษ</label>
                <select 
                  name="interesting_subject"
                  className="form-input" 
                  style={{ cursor: 'pointer' }}
                  value={formData.interesting_subject}
                  onChange={handleChange}
                >
                  <option value="">-- เลือกวิชา --</option>
                  <option value="math">คณิตศาสตร์</option>
                  <option value="science">วิทยาศาสตร์</option>
                  <option value="english">ภาษาอังกฤษ</option>
                  <option value="thai">ภาษาไทย</option>
                  <option value="social">สังคมศึกษา</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-submit" style={{ marginTop: '20px', width: '100%', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
              {loading ? 'กำลังบันทึกข้อมูล...' : 'ลงทะเบียน'}
            </button>
          </form>

          <div className="divider">
            <span>หรือสมัครด้วย</span>
          </div>

          <button className="btn-google" onClick={() => window.location.href = 'http://localhost:3001/auth/google'}>
             <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <div className="auth-footer">
            มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบที่นี่</Link>
          </div>
        </div>
      </div>

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