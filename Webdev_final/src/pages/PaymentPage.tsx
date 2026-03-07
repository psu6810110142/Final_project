import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './HomePage.css';
import { Home, Book, User, LogOut, Info, Upload, CheckCircle } from 'lucide-react';
import logoImage from '../assets/Logo.png';
import defaultCourseImage from '../assets/locobackgroudewhite.png';

const PaymentPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${courseId}`);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course:', error);
        setMessage('ไม่พบข้อมูลคอร์สเรียน กรุณากลับไปเลือกคอร์สใหม่');
      } finally {
        setLoadingCourse(false);
      }
    };

    if (courseId) fetchCourse();
  }, [courseId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setMessage('');
      setIsSuccess(false);
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
        // ส่ง ID ของคอร์สกลับไปให้ Backend บันทึกว่าจ่ายเงินค่าคอร์สไหน
        formData.append('courseId', courseId);
      }

      // ✨ อัปเดตล่าสุด: เปลี่ยนเป็นยิงไปที่ /payments ตรงๆ (ตามที่ Backend เพื่อนเขียนไว้)
      const response = await api.post('/payments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('อัพโหลดสลิปสำเร็จ:', response.data);
      setIsSuccess(true);

      setTimeout(() => {
        navigate('/mycourse'); // ✨ เด้งกลับไปหน้าคอร์สของฉัน
      }, 3000);

    } catch (error: any) {
      console.error('Upload Error:', error);
      setMessage('เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันจัดการรูปภาพ ถ้าไม่มี url ให้ใช้ defaultCourseImage แทน
  const getImageUrl = (url?: string) => {
    if (!url) return defaultCourseImage;
    return url.startsWith('/uploads') ? `http://localhost:3000${url}` : url;
  };

  if (loadingCourse) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>กำลังเตรียมข้อมูลการชำระเงิน... ⏳</div>;

  return (
    <div className="page-wrapper">

      {/* ================= Navbar ================= */}
      <nav className="navbar">
        <div className="container navbar-container">
          <Link to="/home" className="navbar-left">
            <img src={logoImage} alt="Logo" className="navbar-logo" />
            <div className="brand-text">
              <span className="brand-title">New Learning Academy</span>
              <span className="brand-subtitle">เรียนออนไลน์ ง่าย สนุก ได้ผล</span>
            </div>
          </Link>
          <div className="navbar-menu">
            <Link to="/home" className="menu-item"><Home size={18} /> หน้าหลัก</Link>
            <Link to="/courses" className="menu-item active"><Book size={18} /> คอร์สเรียน</Link>
            <Link to="/mycourse" className="menu-item"><User size={18} /> คอร์สของฉัน</Link>
            <a onClick={() => { localStorage.clear(); window.location.replace('/landing'); }} className="menu-item" style={{ cursor: 'pointer' }}><LogOut size={18} /> ออกจากระบบ</a>
          </div>
        </div>
      </nav>

      {/* ================= Page Header ================= */}
      <div className="payment-page-header">
        <div className="container" style={{ paddingLeft: '100px' }}>
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
                  <div className="bank-amount">฿{course?.price ? course.price.toLocaleString() : '0'}</div>
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
                disabled={isLoading || isSuccess}
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
                  <span>ส่งหลักฐานสำเร็จ! ระบบกำลังรอแอดมินตรวจสอบและยืนยัน<br />(กำลังพากลับไปยังหน้าหลัก...)</span>
                </div>
              )}

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
                src={getImageUrl(course?.cover_image_url)}
                alt={course?.title || "Course Image"}
                className="summary-image"
                onError={(e) => { e.currentTarget.src = defaultCourseImage }}
              />
              <h3 className="summary-course-title">{course?.title || 'ไม่ระบุชื่อวิชา'}</h3>
              <p className="summary-instructor">อาจารย์: {course?.instructor?.name || 'ไม่ระบุ'}</p>

              <div className="summary-row" style={{ borderTop: 'none', paddingTop: 0 }}>
                <span className="bank-label">ราคาคอร์ส</span>
                <span style={{ color: '#0f172a', fontWeight: 'bold' }}>฿{course?.price ? course.price.toLocaleString() : '0'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-total-label">ยอดรวม</span>
                <span className="summary-total-value">฿{course?.price ? course.price.toLocaleString() : '0'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= Footer ================= */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3>เกี่ยวกับเรา</h3>
              <p>New Learning Academy เป็นแพลตฟอร์มการเรียนรู้<br />ออนไลน์ชั้นนำ มุ่งเน้นพัฒนาศักยภาพผู้เรียน</p>
            </div>
            <div>
              <h3>ติดต่อเรา</h3>
              <p>อีเมล: info@newlearning.com</p>
              <p>โทร: 02-123-4567</p>
            </div>
            <div>
              <h3>เวลาทำการ</h3>
              <p>จันทร์ - ศุกร์: 09:00 - 18:00</p>
              <p>เสาร์ - อาทิตย์: 10:00 - 16:00</p>
            </div>
          </div>
          <div className="copyright">
            © 2026 New Learning Academy. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default PaymentPage;