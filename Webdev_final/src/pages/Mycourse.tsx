import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { PlayCircle, CheckCircle } from 'lucide-react';
import api from '../api';
import Navbar from '../components/Navbar';

interface Course {
  id: number;
  title: string;
  subject: string;
  imgSrc: string;
  progress: number;
  orderStatus: string;
  tagColor: string;
  textColor: string;
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
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [ordersRes, progressRes] = await Promise.all([
        api.get(`/orders/user/${userId}`),
        api.get('/learning-progress/user/my-progress'),
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
            title: course.title,
            subject: course.level?.level_name || 'ไม่ระบุระดับชั้น',
            imgSrc: course.cover_image_url || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400",
            progress: progressPercent,
            orderStatus: order.status,
            tagColor: statusStyle.tagColor,
            textColor: statusStyle.textColor,
          });
        });
      });

      const uniqueCourses = Array.from(new Map(purchasedCourses.map(c => [c.id, c])).values());
      setMyCourses(uniqueCourses);

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
    if (filter === "in-progress") return course.progress < 100;
    if (filter === "completed") return course.progress === 100;
    return true;
  });

  return (
    <div className="page-wrapper">
      <Navbar/>

      <div className="page-header">
        <div className="container">
          <h1 className="my-courses-header">คอร์สเรียนของฉัน</h1>
          <p className="my-courses-subtitle">ยินดีต้อนรับกลับมา! ลุยต่อให้จบกันเถอะ</p>
        </div>
      </div>

      <section className="section my-courses-section">
        <div className="container">
          <div className="tabs-container">
            <button className={`tab-button ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>ทั้งหมด</button>
            <button className={`tab-button ${filter === "in-progress" ? "active" : ""}`} onClick={() => setFilter("in-progress")}>กำลังเรียน</button>
            <button className={`tab-button ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>เรียนจบแล้ว</button>
          </div>

          {loading ? (
            <div className="state-message">กำลังโหลดข้อมูลคอร์สเรียนของคุณ... ⏳</div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div key={course.id} onClick={() => navigate(`/learn/${course.id}`)} style={{ cursor: 'pointer' }}>
                    <MyCourseCard course={course} />
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

const MyCourseCard = ({ course }: { course: Course }) => {
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
            ❌ ไม่อนุมัติ
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

        {isPending ? (
          <div style={{ padding: '10px', backgroundColor: '#fef9c3', borderRadius: '8px', fontSize: '13px', color: '#854d0e', textAlign: 'center' }}>
            ⏳ รอแอดมินตรวจสอบสลิปการชำระเงิน
          </div>
        ) : isRejected ? (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', borderRadius: '8px', fontSize: '13px', color: '#991b1b', textAlign: 'center' }}>
            ❌ การชำระเงินถูกปฏิเสธ<br />
            <span style={{ fontSize: '12px' }}>กรุณาติดต่อแอดมินหรือชำระใหม่อีกครั้ง</span>
          </div>
        ) : (
          <button className={`btn-learn ${isCompleted ? 'review' : 'continue'}`} onClick={() => navigate(`/learn/${course.id}`)}>
            {isCompleted ? 'ทบทวนเนื้อหา' : <><PlayCircle size={18} /> เรียนต่อ</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default MyCourses;