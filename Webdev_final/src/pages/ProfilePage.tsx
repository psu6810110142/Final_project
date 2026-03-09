import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; 

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
  return (
    <div className="profile-wrapper">
        <div className="page-header">
            <div className="container">
            {/* 3. เพิ่มปุ่มย้อนกลับ ตรงนี้ (ไว้เหนือแท็ก <h1>) */}
                <button className="btn-back" onClick={() => navigate(-1)}>
                    &#8592; ย้อนกลับ
                </button>
          
                <h1>ตั้งค่าโปรไฟล์</h1>
                <p>จัดการข้อมูลส่วนตัว รหัสผ่าน และการตั้งค่าบัญชีของคุณ</p>
            </div>
        </div>

      <div className="container">
        {/* เลย์เอาต์แบ่ง 2 ฝั่ง ซ้าย(รูปโปรไฟล์) - ขวา(ฟอร์มแก้ไข) */}
        <div className="profile-layout">
          
          {/* ฝั่งซ้าย: ข้อมูลแบบย่อและรูปโปรไฟล์ */}
          <div className="profile-card profile-sidebar">
            <div className="profile-avatar-container">
              <img 
                src="https://via.placeholder.com/150" 
                alt="User Avatar" 
                className="profile-avatar"
              />
              <button className="avatar-edit-btn">
                <span className="material-icons">📷</span> {/* สามารถใช้ Icon จากไลบรารีอื่นได้ */}
              </button>
            </div>
            <h2 className="profile-name">Ikwan Hawor</h2>
            <p className="profile-role">นักเรียน / Student</p>
            <p className="profile-email">6810110762@psu.ac.th</p>
            <div className="profile-divider"></div>
            <button className="btn-outline-primary">เปลี่ยนรูปโปรไฟล์</button>
          </div>

          {/* ฝั่งขวา: ฟอร์มแก้ไขข้อมูล */}
          <div className="profile-card profile-main">
            <h3 className="profile-section-title">ข้อมูลส่วนตัว</h3>
            
            <form>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ชื่อจริง</label>
                  <input type="text" className="form-input" defaultValue="Ikwan" placeholder="กรอกชื่อจริง" />
                </div>
                <div className="form-group">
                  <label className="form-label">นามสกุล</label>
                  <input type="text" className="form-input" defaultValue="Hawor" placeholder="กรอกนามสกุล" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">อีเมล</label>
                <input type="email" className="form-input" defaultValue="6810110762@psu.ac.th" disabled />
                <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>ไม่สามารถเปลี่ยนอีเมลได้</small>
              </div>

              <div className="form-group">
                <label className="form-label">เบอร์โทรศัพท์</label>
                <input type="tel" className="form-input" placeholder="กรอกเบอร์โทรศัพท์" />
              </div>

              <div className="form-group">
                <label className="form-label">แนะนำตัวสั้นๆ</label>
                {/* ใช้ form-textarea จาก Modal Styles ที่มีอยู่แล้ว */}
                <textarea className="form-textarea" rows={4} placeholder="เขียนคำอธิบายเกี่ยวกับตัวคุณ..."></textarea>
              </div>

              <div className="profile-actions">
                <button type="button" className="btn-cancel">ยกเลิก</button>
                <button type="submit" className="btn-save">บันทึกข้อมูล</button>
              </div>
            </form>

            {/* ส่วนเปลี่ยนรหัสผ่าน (ถ้ามี) */}
            <h3 className="profile-section-title" style={{ marginTop: '40px' }}>เปลี่ยนรหัสผ่าน</h3>
            <form>
              <div className="form-group">
                <label className="form-label">รหัสผ่านปัจจุบัน</label>
                <input type="password" className="form-input" placeholder="กรอกรหัสผ่านปัจจุบัน" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">รหัสผ่านใหม่</label>
                  <input type="password" className="form-input" placeholder="รหัสผ่านใหม่ 8 ตัวอักษรขึ้นไป" />
                </div>
                <div className="form-group">
                  <label className="form-label">ยืนยันรหัสผ่านใหม่</label>
                  <input type="password" className="form-input" placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" />
                </div>
              </div>
              <div className="profile-actions">
                <button type="submit" className="btn-save" style={{ backgroundColor: '#10b981' }}>อัปเดตรหัสผ่าน</button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;