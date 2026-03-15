import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './HomeTheme.css';
import { Home, Book, User, LogOut, Info, Upload, CheckCircle, Clock, QrCode } from 'lucide-react';
import logoImage from '../assets/Logo.png';
import defaultCourseImage from '../assets/locobackgroudewhite.png';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import './OceanTheme.css';

const PaymentPage: React.FC = () => {
  const { theme } = useTheme();
  const { courseId } = useParams(); // มีค่า = มาจากปุ่ม "ลงทะเบียนเรียนเลย", ไม่มี = มาจากตะกร้า
  const navigate = useNavigate();
  const { cartItems, fetchCart } = useCart();

  const isCartMode = !courseId; 

  const [course, setCourse] = useState<any>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isCartMode && courseId) {
      api.get(`/courses/${courseId}`)
        .then(r => setCourse(r.data))
        .catch(() => setMessage('ไม่พบข้อมูลคอร์สเรียน'))
        .finally(() => setLoadingCourse(false));
    } else {
      setLoadingCourse(false);
    }
  }, [courseId, isCartMode]);

  const totalAmount = isCartMode
    ? cartItems.reduce((sum, item) => sum + Number(item.course.price || 0), 0)
    : Number(course?.price || 0);

  // ✨ กำหนดคอร์สที่จะดึงข้อมูลบัญชีและ QR Code มาแสดง (ถ้าตะกร้ามีหลายวิชา จะยึดข้อมูลของวิชาแรก)
  const displayCourse = isCartMode && cartItems.length > 0 ? cartItems[0].course : course;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMessage('');
    setIsSuccess(false);

    if (file) {
      // เช็คขนาดไฟล์ — backend รับสูงสุด 2MB
      if (file.size > 2 * 1024 * 1024) {
        setMessage('ไฟล์ใหญ่เกินไป กรุณาเลือกรูปที่มีขนาดไม่เกิน 2MB');
        setSelectedFile(null);
        setSlipPreview(null);
        e.target.value = ''; // reset input
        return;
      }
      setSelectedFile(file);
      setSlipPreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setSlipPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('กรุณาอัพโหลดรูปสลิปการโอนเงินก่อนส่งครับ');
      return;
    }
    if (isCartMode && cartItems.length === 0) {
      setMessage('ไม่มีคอร์สในตะกร้า');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = Number(user?.sub);

      if (!userId) {
        setMessage('กรุณาเข้าสู่ระบบก่อนชำระเงิน');
        return;
      }

      let orderId: number | null = null;

      if (!isCartMode && courseId) {
        // เช็คว่ามี order REJECTED อยู่แล้วไหม — ถ้ามีให้ใช้ order_id เดิม
        const existingRes = await api.get(`/orders/user/${userId}`);
        const existingOrders: any[] = Array.isArray(existingRes.data) ? existingRes.data : [];

        // เช็ค REJECTED order ก่อน
        const rejectedOrder = existingOrders.find(o =>
          o.status === 'REJECTED' &&
          o.order_details?.some((d: any) => d.course?.course_id === Number(courseId))
        );

        // เช็ค WAITING_PAYMENT ที่ยังไม่มี payment สำเร็จ (กรณีไฟล์ใหญ่เกินแล้วสร้าง order ค้างไว้)
        const waitingOrder = existingOrders.find(o =>
          o.status === 'WAITING_PAYMENT' &&
          o.order_details?.some((d: any) => d.course?.course_id === Number(courseId))
        );

        if (rejectedOrder) {
          // ใช้ order_id เดิม — reset status กลับเป็น WAITING_PAYMENT
          orderId = rejectedOrder.order_id;
          await api.patch(`/orders/${orderId}/resubmit`, {});
        } else if (waitingOrder) {
          // ใช้ order_id เดิมที่ค้างอยู่ — ไม่ต้อง reset เพราะยังเป็น WAITING_PAYMENT อยู่แล้ว
          orderId = waitingOrder.order_id;
        }
      }

      // ถ้าไม่มี order เดิม → สร้างใหม่
      if (!orderId) {
        const orderRes = await api.post('/orders', {
          user_id: userId,
          total_amount: totalAmount,
          ...(isCartMode ? {} : { course_id: Number(courseId) }),
        });
        orderId = orderRes.data.order_id;

        if (isCartMode) {
          await Promise.all(
            cartItems.map(item =>
              api.post('/order-details', {
                order_id: orderId,
                course_id: item.course.course_id,
                price_at_purchase: Number(item.course.price),
              })
            )
          );
        } else {
          await api.post('/order-details', {
            order_id: orderId,
            course_id: Number(courseId),
            price_at_purchase: Number(course.price),
          });
        }
      }

      // สร้าง payment ใหม่เสมอ (ผูกกับ order_id ที่ได้มา)
      const formData = new FormData();
      formData.append('slip_image', selectedFile);
      formData.append('order_id', String(orderId));
      formData.append('amount', String(totalAmount));
      formData.append('payment_date', new Date().toISOString());

      await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (isCartMode) {
        await Promise.all(
          cartItems.map(item => api.delete(`/cart-items/${item.cart_item_id}`))
        );
        await fetchCart(); 
      }

      setIsSuccess(true);
      setTimeout(() => navigate('/my-courses'), 3000);

    } catch (error: any) {
      console.error('Payment error:', error);
      const status = error.response?.status;
      const msg = error.response?.data?.message;

      if (status === 409) {
        setMessage('คุณมีคำสั่งซื้อคอร์สนี้อยู่แล้ว หากต้องการส่งสลิปใหม่กรุณาไปที่หน้า "คอร์สของฉัน"');
      } else if (status === 413 || msg?.includes('File too large') || msg?.includes('ขนาด')) {
        setMessage('ไฟล์ใหญ่เกินไป กรุณาเลือกรูปที่มีขนาดไม่เกิน 2MB');
      } else {
        setMessage(msg || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
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
    <div className={`page-wrapper ${theme === 'ocean' ? 'ocean-theme' : ''}`} style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
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

          {/* ฝั่งซ้าย: ข้อมูลธนาคาร + อัปโหลดสลิป */}
          <div>
            <div className="payment-card">
              <h2 className="payment-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} /> ข้อมูลการโอนเงิน
              </h2>
              
              {/* ✨ แสดงข้อมูลบัญชีและ QR Code ที่ดึงมาจาก Database */}
              <div className="bank-info-box" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div className="bank-row"><span className="bank-label">ธนาคาร:</span><span className="bank-value">{displayCourse?.bank_name || 'ไม่ระบุ (กรุณาติดต่อแอดมิน)'}</span></div>
                  <div className="bank-row"><span className="bank-label">ชื่อบัญชี:</span><span className="bank-value">{displayCourse?.account_name || '-'}</span></div>
                  <div className="bank-row"><span className="bank-label">เลขที่บัญชี:</span><span className="bank-value">{displayCourse?.account_number || '-'}</span></div>
                  <div className="bank-row" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1' }}>
                    <span className="bank-label" style={{ fontSize: '1.1rem' }}>จำนวนเงินที่ต้องชำระ:</span>
                    <div className="bank-amount">฿{totalAmount.toLocaleString()}</div>
                  </div>
                </div>

                {/* แสดงรูป QR Code ถ้ามี */}
                {displayCourse?.payment_qr_url && (
                  <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#64748b' }}>สแกน QR Code เพื่อชำระเงิน</p>
                    <img 
                      src={getImageUrl(displayCourse.payment_qr_url)} 
                      alt="Payment QR Code" 
                      style={{ maxWidth: '200px', width: '100%', borderRadius: '8px' }} 
                    />
                  </div>
                )}
              </div>
              <div className="payment-alert"><Info size={18} /><span>กรุณาโอนเงินตามจำนวนที่ระบุและอัพโหลดหลักฐานการโอนเงิน</span></div>
            </div>

            <div className="payment-card">
              <h2 className="payment-title">อัพโหลดสลิปการโอนเงิน</h2>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b' }}>
                รูปสลิปของท่าน *
              </label>
              <input
                type="file" accept="image/*"
                onChange={handleFileChange}
                className="upload-input-mock"
                disabled={isLoading || isSuccess}
              />
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
                  {isLoading ? 'กำลังส่งข้อมูล...' : 'แจ้งโอนเงิน'}
                </button>
              )}
            </div>
          </div>

          {/* ฝั่งขวา: สรุปคำสั่งซื้อ */}
          <div>
            <div className="payment-card">
              <h2 className="payment-title">สรุปการสั่งซื้อ</h2>

              {isCartMode ? (
                <>
                  {cartItems.map(item => (
                    <div key={item.cart_item_id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                      <img
                        src={getImageUrl(item.course.cover_image_url)}
                        alt={item.course.title}
                        style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                        onError={(e) => { e.currentTarget.src = defaultCourseImage; }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{item.course.title}</div>
                        <div style={{ color: '#2563eb', fontWeight: 'bold' }}>฿{Number(item.course.price).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <img
                    src={getImageUrl(course?.cover_image_url)}
                    alt={course?.title || 'Course'}
                    className="summary-image"
                    onError={(e) => { e.currentTarget.src = defaultCourseImage; }}
                  />
                  <h3 className="summary-course-title">{course?.title || 'ไม่ระบุชื่อวิชา'}</h3>
                  <p className="summary-instructor">อาจารย์: {course?.instructor?.name || 'ไม่ระบุ'}</p>
                </>
              )}

              <div className="summary-row" style={{ borderTop: '1px solid #e2e8f0', marginTop: '8px', paddingTop: '12px' }}>
                <span className="summary-total-label">ยอดรวม</span>
                <span className="summary-total-value">฿{totalAmount.toLocaleString()}</span>
              </div>

              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef9c3', borderRadius: '8px', border: '1px solid #fde047', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#854d0e' }}>
                <Clock size={16} />
                <span>หลังส่งสลิปแล้ว แอดมินจะตรวจสอบและยืนยันภายใน 1-2 ชั่วโมง</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;