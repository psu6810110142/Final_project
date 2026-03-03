import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // แน่ใจว่าไฟล์ CSS อัปเดตแล้ว
import { Home, Book, User, LogOut, PlayCircle, CheckCircle } from 'lucide-react';
import logoImage from '../assets/Logo.png';
import api from '../api';

const getImageUrl = (url?: string, type: 'course' | 'user' = 'course') => {
  if (!url) {
    return type === 'user'
      ? "" // 👨‍🏫 รูปคน Default
      : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400"; // 📚 รูปคอร์สเรียน Default
  }

  if (url.startsWith('/uploads')) {
    return `http://localhost:3000${url}`;
  }
  return url;
};

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myCourses, setMyCourses] = useState<any[]>([]);
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

    const fetchMyCourses = async () => {
      const userId = currentUser?.user_id || currentUser?.id || currentUser?.userId || currentUser?.sub;
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/orders/user/${userId}`);
        let purchasedCourses: any[] = [];

        response.data.forEach((order: any) => {
          if (order.status === 'COMPLETED' && order.order_details) {
            order.order_details.forEach((detail: any) => {
              const course = detail.course;
              if (course) {
                purchasedCourses.push({
                  id: course.course_id,
                  title: course.title,
                  subject: course.level?.level_name || 'ไม่ระบุระดับชั้น',
                  imgSrc: course.cover_image_url || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400",
                  progress: 0,
                  tagColor: "#dbeafe",
                  textColor: "#1e40af",
                });
              }
            });
          }
        });

        const uniqueCourses = Array.from(new Map(purchasedCourses.map(item => [item.id, item])).values());
        setMyCourses(uniqueCourses);

      } catch (error: any) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส:', error);
        if (error.response && error.response.status === 401) {
          alert('เซสชันของคุณหมดอายุ หรือไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
          localStorage.clear();
          window.location.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [currentUser]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    setCurrentUser(null);
    window.location.replace('/landing');
  };

  const filteredCourses = myCourses.filter(course => {
    if (filter === "in-progress") return course.progress < 100;
    if (filter === "completed") return course.progress === 100;
    return true;
  });

  return (
    <div className="page-wrapper">
      {/* ================= Navbar ================= */}
      <nav className="navbar">
        <div className="container navbar-container">
          <a href="/home" className="navbar-left">
            <img src={logoImage} alt="Logo" className="navbar-logo" />
            <div className="brand-text">
              <span className="brand-title">New Learning Academy</span>
              <span className="brand-subtitle">สถาบันกวดวิชานิวเลิร์นนิง</span>
            </div>
          </a>

          <div className="navbar-menu">
            <a href="/home" className="menu-item"><Home size={18} /> หน้าหลัก</a>
            <a href="/courses" className="menu-item"><Book size={18} /> คอร์สเรียน</a>
            <a href="/mycourse" className="menu-item active"><User size={18} /> คอร์สของฉัน</a>
            <a onClick={handleLogout} className="menu-item" style={{ cursor: 'pointer' }}><LogOut size={18} /> ออกจากระบบ</a>
            <div className="user-pill">{currentUser?.full_name || currentUser?.username}</div>
          </div>
        </div>
      </nav>

      {/* ================= Header ================= */}
      <div className="page-header">
        <div className="container">
          <h1 className="my-courses-header">คอร์สเรียนของฉัน</h1>
          <p className="my-courses-subtitle">ยินดีต้อนรับกลับมา! ลุยต่อให้จบกันเถอะ</p>
        </div>
      </div>

      {/* ================= My Courses Content ================= */}
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

// --- Component: การ์ดสำหรับคอร์สที่ซื้อแล้ว ---
const MyCourseCard = ({ course }: { course: any }) => {
  const isCompleted = course.progress === 100;
  const progressColor = isCompleted ? '#16a34a' : '#2563eb';

  return (
    <div className="course-card my-course-card">
      <div className="course-image-wrapper">
        <img src={getImageUrl(course.imgSrc)} alt={course.title} className="course-image-img" />
        {isCompleted && (
          <span className="status-badge">
            <CheckCircle size={14} /> เรียนจบแล้ว
          </span>
        )}
      </div>

      <div className="my-course-content">
        <span
          className="course-tag-custom"
          style={{ backgroundColor: course.tagColor, color: course.textColor }}
        >
          {course.subject}
        </span>
        <h3 className="my-course-title">{course.title}</h3>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-header">
            <span>ความคืบหน้า</span>
            <span style={{ fontWeight: 'bold', color: progressColor }}>{course.progress}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${course.progress}%`, backgroundColor: progressColor }}
            ></div>
          </div>
        </div>

        <button className={`btn-learn ${isCompleted ? 'review' : 'continue'}`}>
          {isCompleted ? 'ทบทวนเนื้อหา' : <><PlayCircle size={18} /> เรียนต่อ</>}
        </button>
      </div>
    </div>
  );
};

export default MyCourses;