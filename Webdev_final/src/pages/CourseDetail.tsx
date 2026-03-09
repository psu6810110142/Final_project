import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Home, Book, User, LogOut, UserPlus, LogIn, Clock, Users, PlayCircle, CheckCircle } from 'lucide-react';
import './HomePage.css';
import api from '../api';
import logoImg from '../assets/Logo.png';
import imgVDO from '../assets/locobackgroudewhite.png';

// 📌 Types
interface Lesson {
  lesson_id: number;
  title: string;
  duration_minutes: number;
}

interface CourseDetailData {
  course_id: number;
  title: string;
  description: string;
  price: number;
  duration_weeks: number;
  cover_image_url?: string;
  level?: {
    level_name: string;
  };
  instructor?: {
    name: string;
    profile_image_url: string;
    bio: string;
  };
  lessons?: Lesson[];
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 📌 States
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 🔍 ตรวจสอบ User เหมือนหน้า HomePage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // 🌟 ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('ไม่สามารถโหลดข้อมูลคอร์สได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourseDetail();
  }, [id]);

  // 🚪 Logout function
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.location.href = '/landing';
  };

  // 🌟 ฟังก์ชันดึงรูปภาพ (ใช้รูป Logo.png จาก assets เป็นรูปเริ่มต้น)
  const getImageUrl = (url?: string, type: 'course' | 'user' = 'course') => {
    if (!url) {
      return type === 'user'
        ? ""
        : imgVDO;
    }
    return url.startsWith('/uploads') ? `http://localhost:3001${url}` : url;
  };

  if (loading) return <div className="state-message" style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>กำลังโหลดข้อมูลคอร์สเรียน... ⏳</div>;

  if (error || !course) return (
    <div className="state-message" style={{ textAlign: 'center', padding: '100px' }}>
      <p style={{ color: 'red', fontSize: '1.2rem', marginBottom: '20px' }}>{error || 'ไม่พบคอร์สเรียน'}</p>
      <button className="btn-learn review" onClick={() => navigate(-1)} style={{ padding: '10px 20px', cursor: 'pointer' }}>กลับไปก่อนหน้า</button>
    </div>
  );

  return (
    <div className="page-wrapper">

      {/* ================= Navbar (เหมือนหน้าหลัก 100%) ================= */}
      <nav className="navbar">
        <div className="container navbar-container">
          <Link to="/" className="navbar-left">
            <img src={logoImg} alt="Logo" className="navbar-logo" />
            <div className="brand-text">
              <span className="brand-title">New Learning Academy</span>
              <span className="brand-subtitle">สถาบันกวดวิชานิวเลิร์นนิง</span>
            </div>
          </Link>

          <div className="navbar-menu">
            <Link to="/home" className="menu-item"><Home size={18} /> หน้าหลัก</Link>
            <Link to="/courses" className="menu-item active"><Book size={18} /> คอร์สเรียน</Link>
            {currentUser ? (
              <>
                <Link to="/my-courses" className="menu-item"><User size={18} /> คอร์สของฉัน</Link>
                <a onClick={handleLogout} className="menu-item" style={{ cursor: 'pointer' }}><LogOut size={18} /> ออกจากระบบ</a>
                <div className="user-pill" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                  {currentUser.full_name || currentUser.username}
                </div>
              </>
            ) : (
              <div className="nav-auth-buttons">
                <Link to="/login" className="btn-nav-login"><LogIn size={18} /> เข้าสู่ระบบ</Link>
                <Link to="/register" className="btn-nav-register"><UserPlus size={18} /> สมัครสมาชิก</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 🔵 Header Section */}
      <header className="page-header">
        <div className="container">
          <div className="cd-banner-content">
            <div className="cd-banner-info">
              <div className="cd-tags">
                <span className="cd-tag white-bg">{course.level?.level_name || 'ทั่วไป'}</span>
              </div>
              <h1 className="cd-title">{course.title}</h1>
              <p className="cd-subtitle">{course.description}</p>

              <div className="cd-stats-top">
                <div className="cd-stat-item"><Users size={18} /> 128 คนเรียนแล้ว</div>
                <div className="cd-stat-item"><Clock size={18} /> {course.duration_weeks || 12} สัปดาห์</div>
              </div>

              <div className="cd-instructor-badge">
                <div>
                  <span className="cd-instructor-name">สอนโดย: {course.instructor?.name || 'ไม่ระบุชื่อผู้สอน'}</span>
                  <span className="cd-instructor-sub">{course.instructor?.bio}</span>
                </div>
              </div>
            </div>

            <div className="cd-banner-video">
              <img src={getImageUrl(course.cover_image_url)} alt={course.title} />
            </div>
          </div>
        </div>
      </header>

      {/* ⚪️ Main Content */}
      <main className="section">
        <div className="container">
          <div className="cd-main-content">

            {/* Left: Syllabus & Details */}
            <div className="cd-left-column">
              <div className="cd-card">
                <h2 className="cd-card-title">รายละเอียดคอร์ส</h2>
                <div className="cd-feature-list">
                  <FeatureItem title="เรียนรู้แบบทีละขั้นตอน" desc="เนื้อหาครอบคลุมตามหลักสูตร จัดเรียงลำดับอย่างเป็นระบบ" />
                  <FeatureItem title="วิดีโอคุณภาพสูง" desc="ความละเอียดชัดเจน ดูได้ทุกอุปกรณ์" />
                  <FeatureItem title="ดูซ้ำได้ไม่จำกัด" desc="เข้าเรียนได้ตลอดเวลา ไม่มีวันหมดอายุ" />
                </div>
              </div>

              <div className="cd-card">
                <h2 className="cd-card-title">เนื้อหาในคอร์ส (Syllabus)</h2>
                <div className="cd-lesson-list">
                  {course.lessons && course.lessons.length > 0 ? (
                    course.lessons.map((lesson) => (
                      <div className="cd-lesson-item" key={lesson.lesson_id}>
                        <div className="cd-lesson-name"><PlayCircle size={16} color="#3b82f6" /> {lesson.title}</div>
                        <div className="cd-lesson-time">{lesson.duration_minutes} นาที</div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">ยังไม่มีข้อมูลบทเรียนในขณะนี้</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Pricing Card */}
            <div className="cd-right-column">
              <div className="cd-price-card">
                <h1 className="cd-price-amount">
                  {course.price > 0 ? `฿${course.price.toLocaleString()}` : 'เรียนฟรี'}
                </h1>
                <p className="cd-price-subtitle">จ่ายครั้งเดียว เข้าถึงเนื้อหาได้ตลอดไป</p>
                <button className="cd-enroll-bag">
                  + เพิ่มลงในตะกร้า
                </button>
                <button className="cd-enroll-btn" onClick={() => navigate(`/payment/${course.course_id}`)}>
                  ลงทะเบียนเรียนเลย
                </button>
                <div className="cd-course-includes">
                  <div className="cd-include-item"><Book size={18} color="#3b82f6" /> {course.lessons?.length || 0} บทเรียน</div>
                  <div className="cd-include-item"><Clock size={18} color="#3b82f6" /> ระยะเวลา {course.duration_weeks || 12} สัปดาห์</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

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
}

// Helper Component
const FeatureItem = ({ title, desc }: { title: string; desc: string }) => (
  <div className="cd-feature-item">
    <div className="cd-check-icon"><CheckCircle size={20} color="#10b981" /></div>
    <div><h4>{title}</h4><p>{desc}</p></div>
  </div>
);