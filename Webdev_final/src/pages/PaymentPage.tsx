import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './HomePage.css';
import { Home, Book, User, LogOut, Info, Upload, CheckCircle, Clock } from 'lucide-react';
import logoImage from '../assets/Logo.png';
import defaultCourseImage from '../assets/locobackgroudewhite.png';

const PaymentPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (courseId) {
      api.get(`/courses/${courseId}`)
        .then(r => setCourse(r.data))
        .catch(() => setMessage('ไม่พบข้อมูลคอร์สเรียน'))
        .finally(() => setLoadingCourse(false));
    }
  }, [courseId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage('');
    setIsSuccess(false);
    if (file) setSlipPreview(URL.createObjectURL(file));
    else setSlipPreview(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('กรุณาอัพโหลดรูปสลิปการโอนเงินก่อนส่งครับ');
      return;
    }
    setIsLoading(true);
    setMessage('');

    try {
      // ดึง user จาก localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = Number(user?.sub || user?.user_id);

      if (!userId) {
        setMessage('กรุณาเข้าสู่ระบบก่อนชำระเงิน');
        setIsLoading(false);
        return;
      }

      // Step 1: สร้าง Order
      console.log('Creating order:', { user_id: userId, total_amount: Number(course.price) });
      const orderRes = await api.post('/orders', {
        user_id: userId,
        total_amount: Number(course.price),
      });
      const orderId = orderRes.data.order_id;

      // Step 2: สร้าง Order Detail
      await api.post('/order-details', {
        order_id: orderId,
        course_id: Number(courseId),
        price_at_purchase: Number(course.price),
      });

      // Step 3: อัปโหลด Payment พร้อมสลิป
      const formData = new FormData();
      formData.append('slip_image', selectedFile);
      formData.append('order_id', String(orderId));
      formData.append('amount', String(Number(course.price)));
      formData.append('payment_date', new Date().toISOString());

      await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsSuccess(true);
      setTimeout(() => navigate('/my-courses'), 3000);

    } catch (error: any) {
      console.error('Payment error:', error);
      setMessage(error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return defaultCourseImage;
    return url.startsWith('/uploads') ? `http://localhost:3001${url}` : url;
  };

  if (loadingCourse) return (
    <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>
      กำลังเตรียมข้อมูลการชำระเงิน... ⏳
    </div>
  );

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <nav className="navbar" style={{ background: 'linear-gradient(90deg, #3674B5 0%)' }}>
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
            <a href="/courses" className="menu-item"><Book size={18} /> คอร์สเรียน</a>
            <a href="/my-courses" className="menu-item"><User size={18} /> คอร์สของฉัน</a>
            <a href="/logout" className="menu-item"><LogOut size={18} /> ออกจากระบบ</a>
          </div>
        </div>
      </nav>

      <div className="payment-page-header">
        <div className="container">
          <h1>ชำระเงิน</h1>
          <p>กรุณาโอนเงินตามจำนวนที่ระบุ แล้วแนบสลิปยืนยันการชำระเงิน</p>
        </div>
      </div>

      <div className="container">
        <div className="payment-layout">

          {/* ฝั่งซ้าย */}
          <div>
            {/* ข้อมูลธนาคาร */}
            <div className="payment-card">
              <h2 className="payment-title">ข้อมูลการโอนเงิน</h2>
              <div className="bank-info-box">
                <div className="bank-row"><span className="bank-label">ธนาคาร:</span><span className="bank-value">ธนาคารกสิกรไทย</span></div>
                <div className="bank-row"><span className="bank-label">ชื่อบัญชี:</span><span className="bank-value">New Learning Academy Co., Ltd.</span></div>
                <div className="bank-row"><span className="bank-label">เลขที่บัญชี:</span><span className="bank-value">123-4-56789-0</span></div>
                <div className="bank-row" style={{ marginTop: '20px' }}>
                  <span className="bank-label">จำนวนเงิน:</span>
                  <div className="bank-amount">฿{course?.price ? Number(course.price).toLocaleString() : '0'}</div>
                </div>
              </div>
              <div className="payment-alert"><Info size={18} /><span>กรุณาโอนเงินตามจำนวนที่ระบุและอัพโหลดหลักฐานการโอนเงิน</span></div>
            </div>

            {/* อัปโหลดสลิป */}
            <div className="payment-card">
              <h2 className="payment-title">อัพโหลดสลิปการโอนเงิน</h2>

              <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b' }}>
                รูปสลิปการโอนเงิน *
              </label>

              <input
                type="file" accept="image/*"
                onChange={handleFileChange}
                className="upload-input-mock"
                disabled={isLoading || isSuccess}
              />

              {/* ✅ Preview สลิปที่เลือก */}
              {slipPreview && (
                <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                  <img src={slipPreview} alt="slip preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              )}

              {message && (
                <div style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '15px', padding: '10px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                  {message}
                </div>
              )}

              {/* Success state */}
              {isSuccess ? (
                <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px', fontWeight: '500' }}>
                  <CheckCircle size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>ส่งหลักฐานสำเร็จ!</div>
                    <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> รอแอดมินตรวจสอบและยืนยัน (กำลังพากลับหน้าหลัก...)
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  className="btn-upload-slip"
                  onClick={handleUpload}
                  disabled={isLoading || !selectedFile}
                  style={{ opacity: (isLoading || !selectedFile) ? 0.6 : 1, cursor: (isLoading || !selectedFile) ? 'not-allowed' : 'pointer' }}
                >
                  <Upload size={18} />
                  {isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งหลักฐานการชำระเงิน'}
                </button>
              )}
            </div>
          </div>

          {/* ฝั่งขวา: สรุปคำสั่งซื้อ */}
          <div>
            <div className="payment-card">
              <h2 className="payment-title">สรุปการสั่งซื้อ</h2>
              <img
                src={getImageUrl(course?.cover_image_url)}
                alt={course?.title || 'Course'}
                className="summary-image"
                onError={(e) => { e.currentTarget.src = defaultCourseImage; }}
              />
              <h3 className="summary-course-title">{course?.title || 'ไม่ระบุชื่อวิชา'}</h3>
              <p className="summary-instructor">อาจารย์: {course?.instructor?.name || 'ไม่ระบุ'}</p>
              <div className="summary-row" style={{ borderTop: 'none', paddingTop: 0 }}>
                <span className="bank-label">ราคาคอร์ส</span>
                <span style={{ color: '#0f172a', fontWeight: 'bold' }}>฿{course?.price ? Number(course.price).toLocaleString() : '0'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-total-label">ยอดรวม</span>
                <span className="summary-total-value">฿{course?.price ? Number(course.price).toLocaleString() : '0'}</span>
              </div>
              {/* สถานะ */}
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef9c3', borderRadius: '8px', border: '1px solid #fde047', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#854d0e' }}>
                <Clock size={16} />
                <span>หลังส่งสลิปแล้ว แอดมินจะตรวจสอบและยืนยันภายใน 1-2 ชั่วโมง</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <footer className="footer" style={{ backgroundColor: '#3674B5', color: 'white', padding: '60px 0 30px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.9 }}>
            © 2026 New Learning Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PaymentPage;