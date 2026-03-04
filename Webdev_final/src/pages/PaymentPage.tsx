import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';
import { Home, Book, User, LogOut, Info, Upload, CheckCircle } from 'lucide-react'; // เพิ่ม CheckCircle
import logoImage from '../assets/Logo.png'; 

const PaymentPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(''); 
  
  // 1. เพิ่ม State สำหรับจัดการสถานะ "สำเร็จ"
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setMessage('');
      setIsSuccess(false); // เคลียร์สถานะสำเร็จเมื่อเลือกรูปใหม่
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('กรุณาอัพโหลดรูปสลิปการโอนเงินก่อนส่งครับ');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const formData = new FormData();
      formData.append('slip_image', selectedFile); 
      
      if (courseId) {
        formData.append('courseId', courseId);
      }

      const response = await axios.post('http://localhost:3000/payments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('อัพโหลดสลิปสำเร็จ:', response.data);
      
      // 2. ตั้งค่าสถานะเป็น "สำเร็จ" แทนการใช้ alert()
      setIsSuccess(true);
      
      // 3. หน่วงเวลา 3 วินาที (3000ms) ให้คนอ่านข้อความ ก่อนเด้งไปหน้าอื่น
      setTimeout(() => {
        navigate('/my-courses');
      }, 3000); 

    } catch (error: any) {
      console.error('Upload Error:', error);
      setMessage('เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      
      {/* ================= Navbar ================= */}
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

      {/* ================= Page Header ================= */}
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

            <div className="payment-card">
              <h2 className="payment-title">อัพโหลดสลิปการโอนเงิน</h2>
              
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b' }}>
                รูปสลิปการโอนเงิน
              </label>
              
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="upload-input-mock" 
                disabled={isLoading || isSuccess} // ปิดช่องเมื่อส่งสำเร็จแล้ว
              />

              {message && (
                <div style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '15px' }}>
                  {message}
                </div>
              )}

              {selectedFile && !message && !isSuccess && (
                <div style={{ color: '#16a34a', fontSize: '0.9rem', marginBottom: '15px' }}>
                  แนบไฟล์สำเร็จ: {selectedFile.name}
                </div>
              )}

              {/* 4. แสดงกล่องข้อความสีเขียวเมื่ออัปโหลดสำเร็จ */}
              {isSuccess && (
                <div style={{ 
                  backgroundColor: '#dcfce7', 
                  border: '1px solid #bbf7d0',
                  color: '#166534', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  marginBottom: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  fontWeight: '500'
                }}>
                  <CheckCircle size={24} color="#16a34a" />
                  <span>ส่งหลักฐานสำเร็จ! ระบบกำลังรอแอดมินตรวจสอบและยืนยัน<br/>(กำลังพากลับไปยังหน้าหลัก...)</span>
                </div>
              )}

              {/* ซ่อนปุ่มกดเมื่อสำเร็จแล้ว เพื่อไม่ให้กดซ้ำ */}
              {!isSuccess && (
                <button 
                  className="btn-upload-slip" 
                  onClick={handleUpload}
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  <Upload size={18} /> 
                  {isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งหลักฐานการชำระเงิน'}
                </button>
              )}
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
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>เกี่ยวกับเรา</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.7', opacity: 0.9, margin: 0 }}>
                New Learning Academy<br />
                เป็นแพลตฟอร์มการเรียนรู้ออนไลน์ที่ออกแบบมาเพื่อนักเรียน<br />
                ระดับประถมและมัธยมต้น
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>ติดต่อเรา</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.7', opacity: 0.9, margin: 0 }}>
                อีเมล: info@newlearning.com<br />
                โทร: 02-XXX-XXXX
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>เวลาทำการ</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.7', opacity: 0.9, margin: 0 }}>
                จันทร์ - ศุกร์: 09:00 - 18:00<br />
                เสาร์ - อาทิตย์: 10:00 - 16:00
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.9 }}>
            © 2026 New Learning Academy. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default PaymentPage;