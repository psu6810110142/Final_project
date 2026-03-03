import React from 'react';
import './HomePage.css';
import { Home, Book, User, LogOut, Info, Upload } from 'lucide-react';
import logoImage from '../assets/Logo.png'; 

const PaymentPage: React.FC = () => {
  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      
      {/* ================= Navbar (สีจาก Figma) ================= */}
      <nav className="navbar" style={{ background: 'linear-gradient(90deg, #3674B5 0%, #18334F 100%)' }}>
        <div className="container navbar-container">
          <a href="/home" className="navbar-left">
            <img src={logoImage} alt="Logo" className="navbar-logo" />
            <div className="brand-text">
              <span className="brand-title">New Learning Academy</span>
              <span className="brand-subtitle">เรียนออนไลน์ ง่าย สนุก ได้ผล</span>
            </div>
          </a>
          <div className="navbar-menu">
            <a href="/home" className="menu-item"><Home size={18} /> หน้าหลัก</a>
            <a href="/courses" className="menu-item active"><Book size={18} /> คอร์สเรียน</a>
            <a href="/my-courses" className="menu-item"><User size={18} /> คอร์สของฉัน</a>
            <a href="/logout" className="menu-item"><LogOut size={18} /> ออกจากระบบ</a>
            <div className="user-pill" style={{ background: 'rgba(255,255,255,0.2)' }}>User</div>
          </div>
        </div>
      </nav>

      {/* ================= Page Header (รูปพื้นหลังจะดึงจาก CSS) ================= */}
      <div className="payment-page-header">
        <div className="container">
          <h1>ชำระเงิน</h1>
          <p>กรุณาชำระเงิน ตามราคาที่ระบุไว้</p>
        </div>
      </div>

      {/* ================= Main Content ================= */}
      <div className="container">
        <div className="payment-layout">
          
          {/* ----- ฝั่งซ้าย: ข้อมูลการโอนเงิน & อัปโหลดสลิป ----- */}
          <div>
            
            {/* กล่อง 1: ข้อมูลการโอนเงิน */}
            <div className="payment-card">
              <h2 className="payment-title">ข้อมูลการโอนเงิน</h2>
              
              <div className="bank-info-box">
                <div className="bank-row">
                  <span className="bank-label">ธนาคาร:</span>
                  <span className="bank-value">ธนาคารกสิกรไทย</span>
                </div>
                <div className="bank-row">
                  <span className="bank-label">ชื่อบัญชี:</span>
                  <span className="bank-value">New Learning Academy Co., Ltd.</span>
                </div>
                <div className="bank-row">
                  <span className="bank-label">เลขที่บัญชี:</span>
                  <span className="bank-value">123-4-56789-0</span>
                </div>
                <div className="bank-row" style={{ marginTop: '20px' }}>
                  <span className="bank-label">จำนวนเงิน:</span>
                  <div className="bank-amount">฿1,800</div>
                </div>
              </div>

              <div className="payment-alert">
                <Info size={18} />
                <span>กรุณาโอนเงินตามจำนวนที่ระบุและอัพโหลดหลักฐานการโอนเงิน</span>
              </div>
            </div>

            {/* กล่อง 2: อัพโหลดสลิปการโอนเงิน */}
            <div className="payment-card">
              <h2 className="payment-title">อัพโหลดสลิปการโอนเงิน</h2>
              
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b' }}>
                รูปสลิปการโอนเงิน
              </label>
              
              <input type="file" className="upload-input-mock" />

              <button className="btn-upload-slip">
                <Upload size={18} /> ส่งหลักฐานการชำระเงิน
              </button>
            </div>

          </div>

          {/* ----- ฝั่งขวา: สรุปการสั่งซื้อ ----- */}
          <div>
            <div className="payment-card">
              <h2 className="payment-title">สรุปการสั่งซื้อ</h2>
              
              <img 
                src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400" 
                alt="Science Course" 
                className="summary-image"
              />
              
              <h3 className="summary-course-title">วิทยาศาสตร์ ม.1</h3>
              <p className="summary-instructor">อาจารย์: อาจารย์สุดา</p>
              
              <div className="summary-row" style={{ borderTop: 'none', paddingTop: 0 }}>
                <span className="bank-label">ราคาคอร์ส</span>
                <span style={{ color: '#0f172a', fontWeight: 'bold' }}>฿1,800</span>
              </div>
              
              <div className="summary-row">
                <span className="summary-total-label">ยอดรวม</span>
                <span className="summary-total-value">฿1,800</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= Footer ================= */}
      <footer className="footer" style={{ backgroundColor: '#3674B5', color: 'white', padding: '60px 0 30px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '50px' }}>
            
            {/* คอลัมน์ที่ 1 */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>เกี่ยวกับเรา</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.7', opacity: 0.9, margin: 0 }}>
                New Learning Academy<br />
                เป็นแพลตฟอร์มการเรียนรู้ออนไลน์ที่ออกแบบมาเพื่อนักเรียน<br />
                ระดับประถมและมัธยมต้น
              </p>
            </div>

            {/* คอลัมน์ที่ 2 */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>ติดต่อเรา</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.7', opacity: 0.9, margin: 0 }}>
                อีเมล: info@newlearning.com<br />
                โทร: 02-XXX-XXXX
              </p>
            </div>

            {/* คอลัมน์ที่ 3 */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>เวลาทำการ</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.7', opacity: 0.9, margin: 0 }}>
                จันทร์ - ศุกร์: 09:00 - 18:00<br />
                เสาร์ - อาทิตย์: 10:00 - 16:00
              </p>
            </div>

          </div>

          {/* Copyright */}
          <div style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.9 }}>
            © 2026 New Learning Academy. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default PaymentPage;