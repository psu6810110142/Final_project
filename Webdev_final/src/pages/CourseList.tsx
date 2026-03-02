import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { Home, Book, User, LogOut, Search, Users, Clock, Filter, UserPlus, LogIn } from 'lucide-react';
import logoImage from '../assets/Logo.png';
import api from '../api';

interface CourseData {
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
  };
}

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

const CourseList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const dynamicCategories = ["ทั้งหมด", ...Array.from(new Set(courses.map(c => c.level?.level_name).filter(Boolean)))];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('ไม่สามารถดึงข้อมูลคอร์สเรียนได้ กรุณาตรวจสอบว่า Backend รันอยู่หรือไม่');
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (token && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      setCurrentUser(null);
    }
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    setCurrentUser(null);
    window.location.replace('/landing');
  };

  return (
    <div className="page-wrapper">
      {/* ================= Navbar ================= */}
      <nav className="navbar">
        <div className="container navbar-container">
          <a href="/" className="navbar-left">
            <img src={logoImage} alt="Logo" className="navbar-logo" />
            <div className="brand-text">
              <span className="brand-title">New Learning Academy</span>
              <span className="brand-subtitle">สถาบันกวดวิชานิวเลิร์นนิง</span>
            </div>
          </a>

          <div className="navbar-menu">
            <a href="/home" className="menu-item"><Home size={18} /> หน้าหลัก</a>
            <a href="/courses" className="menu-item active"><Book size={18} /> คอร์สเรียน</a>
            {currentUser ? (
              <>
                <a href="/my-courses" className="menu-item"><User size={18} /> คอร์สของฉัน</a>
                <a onClick={handleLogout} className="menu-item" style={{ cursor: 'pointer' }}><LogOut size={18} /> ออกจากระบบ</a>
                <div className='user-pill'> {currentUser?.full_name || currentUser?.username}</div>
              </>
            ) : (
              <div className="nav-auth-buttons">
                <a href="/login" className="btn-nav-login">
                  <LogIn size={18} /> เข้าสู่ระบบ
                </a>
                <a href="/register" className="btn-nav-register">
                  <UserPlus size={18} /> สมัครสมาชิก
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ================= Course Header & Search ================= */}
      <div className="page-header" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>ค้นหาคอร์สเรียนที่ใช่สำหรับคุณ</h1>
          <p style={{ opacity: 0.9, marginBottom: '30px' }}>เลือกเรียนจากคอร์สคุณภาพที่สอนโดยอาจารย์ผู้เชี่ยวชาญ</p>

          {/* Search Box */}
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '15px', top: '14px', color: '#6b7280' }} size={20} />
            <input
              type="text"
              placeholder="ค้นหาชื่อคอร์สเรียน, รายละเอียด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '50px', border: 'none', fontSize: '1rem', outline: 'none', color: '#1f2937' }}
            />
          </div>
        </div>
      </div>

      {/* ================= Courses Content ================= */}
      <section className="section" style={{ backgroundColor: '#f9fafb', minHeight: '50vh' }}>
        <div className="container">

          {/* Categories Filter (สร้างปุ่มอัตโนมัติตามข้อมูลที่มี) */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#4b5563', marginRight: '10px' }}>
              <Filter size={18} /> หมวดหมู่:
            </div>
            {dynamicCategories.map((cat) => (
              <button
                key={cat as string}
                onClick={() => setActiveCategory(cat as string)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '50px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: activeCategory === cat ? '#2563eb' : 'white',
                  color: activeCategory === cat ? 'white' : '#4b5563',
                  cursor: 'pointer',
                  fontWeight: activeCategory === cat ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {cat as string}
              </button>
            ))}
          </div>

          {/* ✨ สถานะการโหลด หรือ Error */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#6b7280' }}>กำลังโหลดข้อมูลคอร์สเรียน... ⏳</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>{error} ❌</div>
          ) : (
            <div className="courses-grid">
              {courses
                .filter(course => activeCategory === "ทั้งหมด" || course.level?.level_name === activeCategory)
                .filter(course => course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.description.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((course) => (
                  <CourseCard
                    key={course.course_id}
                    subject={course.level?.level_name || 'ทั่วไป'}
                    grade={course.level?.level_name || '-'}
                    title={course.title}
                    price={`฿${course.price.toLocaleString()}`}
                    tagColor="#dbeafe"
                    textColor="#1e40af"
                    imgSrc={getImageUrl(course.cover_image_url)}
                    instructorName={course.instructor?.name || 'ไม่ระบุ'}
                    duration={course.duration_weeks || 12}
                    description={course.description}
                    instructorImage={getImageUrl(course.instructor?.profile_image_url, 'user')}
                  />
                ))}

              {/* ถ้าค้นหาแล้วไม่เจออะไรเลย */}
              {courses.filter(course => (activeCategory === "ทั้งหมด" || course.level?.level_name === activeCategory) && (course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.description.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  ไม่พบคอร์สเรียนที่ตรงกับการค้นหา
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="footer">
        <div className="container">
          <div className="copyright" style={{ paddingTop: '20px', borderTop: 'none' }}>
            © 2026 New Learning Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const CourseCard = ({ subject, grade, title, price, tagColor, textColor, imgSrc, instructorName, instructorImage, instructor, duration, description }: any) => (
  <div className="course-card">
    <div className="course-image">
      <img src={imgSrc} alt={title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
      <span className="badge">{grade}</span>
    </div>
    <div className="course-content">
      <span className="course-tag" style={{ backgroundColor: tagColor, color: textColor }}>{subject}</span>
      <h3 className="course-title">{title}</h3>
      <p className="course-desc" style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {description}
      </p>
      <div className="course-meta">
        <div><Users size={14} /> 100 คน</div>
        <div><Clock size={14} /> {duration} สัปดาห์</div>
      </div>
      <div className="course-footer">
        <div className="instructor">
          <div className="avatar" style={{ overflow: 'hidden', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              // ถ้าระบบไม่มีรูป จะดึง API สร้างรูปตัวอักษรย่อชื่ออาจารย์มาโชว์แทนอัตโนมัติ
              src={instructorImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor || 'T')}&background=random&color=fff`}
              alt={instructor || 'Instructor'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <span>{instructorName}</span>
        </div>
        <div className="course-price" style={{ color: '#e74c3c', fontWeight: 'bold' }}>{price}</div>
      </div>
    </div>
  </div>
);

export default CourseList;