import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HomeTheme.css';
import { PlayCircle, CheckCircle, LockKeyhole, RefreshCw, XCircle, Mail, Clock, Search } from 'lucide-react';
import api from '../api';
import Navbar from '../components/Navbar';
import './OceanTheme.css';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import OceanAnimations from '../components/OceanAnimations';

interface Course {
  id: number;
  orderId: number;
  title: string;
  subject: string;
  imgSrc: string;
  progress: number;
  orderStatus: string;
  tagColor: string;
  textColor: string;
  expireDate: Date | null;
}

const getImageUrl = (url?: string): string => {
  if (!url) return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400";
  if (url.startsWith('/uploads')) return `http://localhost:3001${url}`;
  return url;
};

const statusStyleMap: Record<string, { tagColor: string; textColor: string }> = {
  COMPLETED:       { tagColor: '#dcfce7', textColor: '#166534' },
  WAITING_PAYMENT: { tagColor: '#fef9c3', textColor: '#854d0e' },
  REJECTED:        { tagColor: '#fee2e2', textColor: '#991b1b' },
};

const MyCourses: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState("in-progress");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expiringCourses, setExpiringCourses] = useState<Course[]>([]);
  const [myGrades, setMyGrades] = useState<Record<number, string>>({});
  const [expiredPopup, setExpiredPopup] = useState<{ courseId: string; expiredAt: string } | null>(
    location.state?.expiredCourseId 
    ? { courseId: location.state.expiredCourseId, expiredAt: location.state.expiredAt }
    : null
);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (!token || !storedUser) {
      window.location.replace('/landing');
      return;
    }
    setCurrentUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetchMyCourses();
  }, [currentUser]);

  const fetchMyCourses = async () => {
    const userId = currentUser?.sub;
    if (!userId) { setLoading(false); return; }

    try {
      const [ordersRes, progressRes, gradesRes] = await Promise.all([
        api.get(`/orders/user/${userId}`),
        api.get('/learning-progress/user/my-progress'),
        api.get('/grades/my-grades').catch(() => ({ data: [] })),
      ]);

      const myProgress: any[] = progressRes.data;

      // ดึงจำนวนบทเรียนเฉพาะคอร์สที่ COMPLETED
      const completedCourseIds: number[] = [];
      ordersRes.data.forEach((order: any) => {
        if (order.status === 'COMPLETED' && order.order_details) {
          order.order_details.forEach((detail: any) => {
            if (detail.course) completedCourseIds.push(detail.course.course_id);
          });
        }
      });

      const lessonCounts = new Map<number, number>();
      await Promise.all(
        completedCourseIds.map(async (courseId) => {
          try {
            const res = await api.get(`/lessons/course/${courseId}`);
            lessonCounts.set(courseId, Array.isArray(res.data) ? res.data.length : 0);
          } catch {
            lessonCounts.set(courseId, 0);
          }
        })
      );

      // สร้างรายการคอร์ส
      const purchasedCourses: Course[] = [];
      ordersRes.data.forEach((order: any) => {
        if (order.status === 'CANCELLED' || !order.order_details) return;

        order.order_details.forEach((detail: any) => {
          const course = detail.course;
          if (!course) return;

          const completedCount = myProgress.filter(
            (p: any) => p.lesson?.course?.course_id === course.course_id && p.is_completed
          ).length;

          const totalLessons = lessonCounts.get(course.course_id) || 0;
          const progressPercent = totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0;

          const statusStyle = statusStyleMap[order.status] || { tagColor: '#f1f5f9', textColor: '#475569' };

          purchasedCourses.push({
            id: course.course_id,
            orderId: order.order_id,
            title: course.title,
            subject: course.level?.level_name || 'ไม่ระบุระดับชั้น',
            imgSrc: course.cover_image_url || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400",
            progress: progressPercent,
            orderStatus: order.status,
            tagColor: statusStyle.tagColor,
            textColor: statusStyle.textColor,
            expireDate: order.access_expire_date ? new Date(order.access_expire_date) : null,
          });
        });
      });

      // เรียงตาม priority และ dedup ด้วย course_id
      const statusPriority: Record<string, number> = { COMPLETED: 0, WAITING_PAYMENT: 1, REJECTED: 2, CANCELLED: 3 };
      purchasedCourses.sort((a, b) => {
        const sp = (statusPriority[a.orderStatus] ?? 9) - (statusPriority[b.orderStatus] ?? 9);
        if (sp !== 0) return sp;
        return b.orderId - a.orderId;
      });
      const uniqueCourses = Array.from(new Map(purchasedCourses.map(c => [c.id, c])).values());
      setMyCourses(uniqueCourses);

      // เช็คคอร์สที่ใกล้หมดอายุ (เหลือน้อยกว่า 7 วัน) แล้วแจ้งเตือน
      const now = new Date();
      const expiringSoon = uniqueCourses.filter((c: Course) => {
        if (!c.expireDate || c.orderStatus !== 'COMPLETED') return false;
        const daysLeft = Math.round((c.expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft > 0 && daysLeft <= 7;
      });
      if (expiringSoon.length > 0) {
        setExpiringCourses(expiringSoon);
      }

      // grades
      const gradesMap: Record<number, string> = {};
      (Array.isArray(gradesRes.data) ? gradesRes.data : []).forEach((g: any) => {
        if (g.course?.course_id && g.grade) gradesMap[g.course.course_id] = g.grade;
      });
      setMyGrades(gradesMap);

    } catch (error: any) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส:', error);
      if (error.response?.status === 401) {
        alert('เซสชันของคุณหมดอายุ กรุณาเข้าสู่ระบบใหม่');
        localStorage.clear();
        window.location.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = myCourses.filter(course => {
    const isExpired = course.expireDate ? course.expireDate < new Date() : false;
    if (filter === "in-progress") return course.progress < 100 && !isExpired;
    if (filter === "completed") return course.progress === 100;
    if (filter === "expired") return isExpired;
    return true;
  });

  const cancelOrder = async (orderId: number) => {
    if (!window.confirm('ยืนยันการยกเลิกคำสั่งซื้อนี้?\nหากต้องการรับเงินคืน กรุณาติดต่อแอดมิน')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      fetchMyCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ยกเลิกไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  return (
    <div className={`page-wrapper ${theme === 'ocean' ? 'ocean-page' : ''}`}>
      <ThemeToggleButton/>
      {expiredPopup && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', maxWidth: '420px', width: '90%', textAlign: 'center' }}>
            <LockKeyhole size={56} color="#eb2525" />
            <h2 style={{ color: '#1e293b', margin: '16px 0 8px' }}>คอร์สหมดอายุแล้ว</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              คอร์สนี้หมดอายุเมื่อ <strong>{expiredPopup.expiredAt}</strong><br/>
              </p>
              <button
              onClick={() => setExpiredPopup(null)}
              style={{ padding: '10px 32px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}
              >
                รับทราบ
                </button>
              </div>
            </div>
          )}
              
              <Navbar/>
              
    <div className="page-header">
          <OceanAnimations />
      <div className="container" style={{ textAlign: 'center' }}>
        <h1 className="my-courses-header" style={{ fontSize: '3rem', textAlign: 'center' }}>
          คอร์สเรียนของฉัน
        </h1>
        <p className="my-courses-subtitle" style={{ fontSize: '1.1rem', textAlign: 'center' }}>
          ยินดีต้อนรับกลับมา! ลุยต่อให้จบกันเถอะ
        </p>
          <p style={{ 
            textAlign: 'center', 
            color: 'white', 
            fontSize: '1rem', 
            marginTop: '10px',
            opacity: 0.9 
          }}>
            ตอนนี้คุณเรียนไปแล้ว{' '}
            <strong>{myCourses.filter(c => c.progress === 100).length}</strong>
            {' '}คอร์ส จาก{' '}
            <strong>{myCourses.length}</strong>
            {' '}คอร์ส
          </p>
          <div style={{ maxWidth: '500px', margin: '20px auto 0', position: 'relative' }}>
      <Search style={{ position: 'absolute', left: '15px', top: '14px', color: '#6b7280' }} size={20} />
      <input
        type="text"
        placeholder="ค้นหาชื่อคอร์สเรียน..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ 
          width: '100%', 
          padding: '14px 14px 14px 45px', 
          borderRadius: '50px', 
          border: 'none', 
          fontSize: '1rem', 
          outline: 'none', 
          color: '#1f2937',
          boxSizing: 'border-box'
        }}
      />
    </div>
        </div>
    </div>

      <section className="section my-courses-section">
        <div className="container">
          <div className="tabs-container">
            <button className={`tab-button ${filter === "in-progress" ? "active" : ""}`} onClick={() => setFilter("in-progress")}>กำลังเรียน</button>
            <button className={`tab-button ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>เรียนจบแล้ว</button>
            <button className={`tab-button ${filter === "expired" ? "active" : ""}`} onClick={() => setFilter("expired")}>หมดเขตเรียน</button>
            <button className={`tab-button ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>ทั้งหมด</button>
          </div>

          {/* แจ้งเตือนคอร์สใกล้หมดอายุ */}
          {expiringCourses.length > 0 && (
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Clock size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }}/>
              <div>
                <div style={{ fontWeight: '700', color: '#92400e', fontSize: '14px', marginBottom: '4px' }}>
                  แจ้งเตือน: คอร์สใกล้หมดอายุ
                </div>
                {expiringCourses.map((c: Course) => {
                  const daysLeft = Math.round((c.expireDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={c.id} style={{ fontSize: '13px', color: '#78350f' }}>
                      • <strong>{c.title}</strong> — เหลือ <strong>{daysLeft} วัน</strong> ({c.expireDate!.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })})
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {loading ? (
            <div className="state-message">กำลังโหลดข้อมูลคอร์สเรียนของคุณ... ⏳</div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div key={course.id} onClick={() => { 
                    const isExpired = course.expireDate ? course.expireDate < new Date() : false;
                    if (isExpired) {
                      setExpiredPopup({ courseId: String(course.id), expiredAt: course.expireDate!.toLocaleDateString('th-TH') });
                      return;
                    }
                    navigate(`/learn/${course.id}`);}} style={{ cursor: 'pointer' }}>
                    <MyCourseCard course={course} onCancel={cancelOrder} grade={myGrades[Number(course.id)]} />
                  </div>
                ))
              ) : (
                <div className="state-message empty-state-grid">
                  คุณยังไม่มีคอร์สในหมวดหมู่นี้ เริ่มต้นค้นหาคอร์สที่ใช่เลย!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

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
          <div className="copyright">© 2026 New Learning Academy. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

const MyCourseCard = ({ course, onCancel, grade }: { course: Course; onCancel: (orderId: number) => void; grade?: string }) => {
  const isCompleted = course.progress === 100;
  const isPending = course.orderStatus === 'WAITING_PAYMENT';
  const isRejected = course.orderStatus === 'REJECTED';
  const isApproved = course.orderStatus === 'COMPLETED';
  const progressColor = isCompleted ? '#16a34a' : '#2563eb';
  const navigate = useNavigate();

  return (
    <div className="course-card my-course-card">
      <div className="course-image-wrapper">
        <img src={getImageUrl(course.imgSrc)} alt={course.title} className="course-image-img" />
        {isCompleted && (
          <span className="status-badge"><CheckCircle size={14} /> เรียนจบแล้ว</span>
        )}
        {isPending && (
          <span className="status-badge" style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' }}>
            ⏳ รอตรวจสอบ
          </span>
        )}
        {isRejected && (
          <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
            ไม่อนุมัติ
          </span>
        )}
      </div>

      <div className="my-course-content">
        <span className="course-tag-custom" style={{ backgroundColor: course.tagColor, color: course.textColor }}>
          {course.subject}
        </span>
        <h3 className="my-course-title">{course.title}</h3>

        {isApproved && (
          <div className="progress-container">
            <div className="progress-header">
              <span>ความคืบหน้า</span>
              <span style={{ fontWeight: 'bold', color: progressColor }}>{course.progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${course.progress}%`, backgroundColor: progressColor }} />
            </div>
          </div>
        )}

        {/* เกรดที่ได้รับจากอาจารย์ */}
        {grade && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>เกรดที่ได้:</span>
            <span style={{
              fontWeight: '900', fontSize: '22px',
              color: grade === 'A' ? '#16a34a' : grade === 'B' ? '#2563eb' : grade === 'C' ? '#d97706' : grade === 'D' ? '#ea580c' : '#dc2626'
            }}>{grade}</span>
            {grade === 'F' && <span style={{ fontSize: '11px', color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '999px' }}>ไม่ผ่าน</span>}
          </div>
        )}

        {isPending ? (
          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px', fontSize: '13px' }}>
            <div style={{ color: '#92400e', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14}/> รอแอดมินตรวจสอบสลิป
            </div>
            <div style={{ fontSize: '12px', color: '#78350f', marginBottom: '10px', lineHeight: '1.5' }}>
              ทีมงานจะตรวจสอบภายใน 1-2 ชั่วโมง
            </div>
            <button
              onClick={() => onCancel(course.orderId)}
              style={{ width: '100%', padding: '8px', backgroundColor: 'white', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <XCircle size={13}/> ยกเลิกคำสั่งซื้อ
            </button>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
              เลขคำสั่งซื้อ #{course.orderId}
            </div>
          </div>
        ) : isRejected ? (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', fontSize: '13px' }}>
            <div style={{ color: '#991b1b', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <XCircle size={15}/> การชำระเงินถูกปฏิเสธ
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href={`/payment/${course.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}>
                <RefreshCw size={13}/> ส่งหลักฐานการชำระเงินใหม่
              </a>
              <a href="mailto:info@newlearning.com?subject=ขอยกเลิกและรับเงินคืน"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', backgroundColor: 'white', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}>
                <Mail size={13}/> ยกเลิกและติดต่อขอเงินคืน
              </a>
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
              เลขคำสั่งซื้อ #{course.orderId}
            </div>
          </div>
        ) : (
          <button className={`btn-learn ${isCompleted ? 'review' : 'continue'}`} onClick={() => navigate(`/learn/${course.id}`)}>
            {isCompleted ? 'ทบทวนเนื้อหา' : <><PlayCircle size={18} /> เรียนต่อ</>}
          </button>
        )}

        {isApproved && course.expireDate && (() => {
          const now = new Date();
          const isExpired = course.expireDate! < now;
          const diffDays = Math.round((course.expireDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const expireStr = course.expireDate!.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
          return (
            <div style={{
              fontSize: '12px',
              color: isExpired ? '#991b1b' : diffDays <= 7 ? '#92400e' : '#475569',
              backgroundColor: isExpired ? '#fee2e2' : diffDays <= 7 ? '#fffbeb' : '#f8fafc',
              border: `1px solid ${isExpired ? '#fecaca' : diffDays <= 7 ? '#fde68a' : '#e2e8f0'}`,
              padding: '8px 12px',
              borderRadius: '8px',
              marginTop: '8px',
              display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500'
            }}>
              <Clock size={12}/>
              {isExpired
                ? `หมดอายุแล้ว — ${expireStr}`
                : diffDays <= 7
                  ? `⚠️ ใกล้หมดอายุ! เหลือ ${diffDays} วัน (${expireStr})`
                  : `เข้าเรียนได้ถึง ${expireStr} (เหลือ ${diffDays} วัน)`
              }
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default MyCourses;