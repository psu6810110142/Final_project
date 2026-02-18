import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // นำเข้าเครื่องมือสำหรับเปลี่ยนหน้า
import './HomePage.css'; 
import { Home, Book, User, LogOut, PlayCircle, CheckCircle } from 'lucide-react';
import logoImage from '../assets/Logo.png'; // เช็คชื่อไฟล์รูปโลโก้

// --- ข้อมูลจำลองสำหรับคอร์สที่ซื้อแล้ว (เพิ่ม progress เข้ามา) ---
const MY_COURSES = [
  { id: 1, subject: "คณิตศาสตร์", grade: "ป.5", title: "คณิตศาสตร์ ป.5 ตะลุยโจทย์", progress: 45, tagColor: "#dbeafe", textColor: "#1e40af", imgSrc: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400" },
  { id: 2, subject: "วิทยาศาสตร์", grade: "ม.1", title: "วิทยาศาสตร์ ม.1 พื้นฐาน", progress: 100, tagColor: "#f3e8ff", textColor: "#6b21a8", imgSrc: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400" },
  { id: 3, subject: "ภาษาอังกฤษ", grade: "ป.6", title: "Grammar ป.6 สอบเข้า ม.1", progress: 10, tagColor: "#dcfce7", textColor: "#166534", imgSrc: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400" },
];

const MyCourses: React.FC = () => {
  const navigate = useNavigate(); // ฟังก์ชันสำหรับใช้เปลี่ยนหน้า
  const [filter, setFilter] = useState("all"); // 'all', 'in-progress', 'completed'

  // ฟังก์ชันกรองคอร์สตามสถานะการเรียน
  const filteredCourses = MY_COURSES.filter(course => {
    if (filter === "in-progress") return course.progress < 100;
    if (filter === "completed") return course.progress === 100;
    return true; // "all"
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
            <a href="/home" className="menu-item">
              <Home size={18} /> หน้าหลัก
            </a>
            <a href="/courses" className="menu-item">
              <Book size={18} /> คอร์สเรียน
            </a>
            <a href="/my-courses" className="menu-item active"> {/* ทำสี Active ที่หน้านี้ */}
              <User size={18} /> คอร์สของฉัน
            </a>
            <a href="/logout" className="menu-item">
              <LogOut size={18} /> ออกจากระบบ
            </a>
            <div className="user-pill">User</div>
          </div>
        </div>
      </nav>

      {/* ================= Header ================= */}
      <div className="page-header">
        <div className="container">
          <h1 style={{ fontSize: '2rem', margin: 0 }}>คอร์สเรียนของฉัน</h1>
          <p style={{ opacity: 0.8, marginTop: '10px' }}>ยินดีต้อนรับกลับมา! ลุยต่อให้จบกันเถอะ</p>
        </div>
      </div>

      {/* ================= My Courses Content ================= */}
      <section className="section" style={{ backgroundColor: '#f9fafb', minHeight: '60vh' }}>
        <div className="container">
          
          {/* Tabs สำหรับกรองสถานะการเรียน */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            <button onClick={() => setFilter("all")} style={tabStyle(filter === "all")}>ทั้งหมด</button>
            <button onClick={() => setFilter("in-progress")} style={tabStyle(filter === "in-progress")}>กำลังเรียน</button>
            <button onClick={() => setFilter("completed")} style={tabStyle(filter === "completed")}>เรียนจบแล้ว</button>
          </div>

          {/* Courses Grid */}
          <div className="courses-grid">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                // === จุดสำคัญ: ใส่ onClick เพื่อกดแล้วเปลี่ยนหน้าไปที่ /learn/:id ===
                <div key={course.id} onClick={() => navigate(`/learn/${course.id}`)} style={{ cursor: 'pointer' }}>
                  <MyCourseCard course={course} />
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#6b7280' }}>
                ไม่มีคอร์สในหมวดหมู่นี้
              </div>
            )}
          </div>
          
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3>เกี่ยวกับเรา</h3>
              <p>New Learning Academy เป็นแพลตฟอร์มการเรียนรู้ออนไลน์ชั้นนำ มุ่งเน้นพัฒนาศักยภาพผู้เรียน</p>
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

// --- Component: การ์ดสำหรับคอร์สที่ซื้อแล้ว (มี Progress Bar) ---
const MyCourseCard = ({ course }: { course: any }) => (
  <div className="course-card" style={{ transition: 'transform 0.2s, boxShadow 0.2s' }}>
    <div className="course-image">
      <img src={course.imgSrc} alt={course.title} />
      {course.progress === 100 && (
        <span style={{ position: 'absolute', top: 15, right: 15, background: '#16a34a', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle size={14} /> เรียนจบแล้ว
        </span>
      )}
    </div>
    
    <div className="course-content" style={{ display: 'flex', flexDirection: 'column' }}>
      <span className="course-tag" style={{ backgroundColor: course.tagColor, color: course.textColor, marginBottom: '10px' }}>
        {course.subject} • {course.grade}
      </span>
      <h3 className="course-title" style={{ fontSize: '1.2rem' }}>{course.title}</h3>
      
      {/* Progress Bar */}
      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>
          <span>ความคืบหน้า</span>
          <span style={{ fontWeight: 'bold', color: course.progress === 100 ? '#16a34a' : '#2563eb' }}>{course.progress}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${course.progress}%`, height: '100%', backgroundColor: course.progress === 100 ? '#16a34a' : '#2563eb', transition: 'width 0.5s ease-in-out' }}></div>
        </div>
      </div>

      <button style={{ width: '100%', marginTop: '20px', padding: '10px', backgroundColor: course.progress === 100 ? '#f3f4f6' : '#eff6ff', color: course.progress === 100 ? '#4b5563' : '#2563eb', border: course.progress === 100 ? '1px solid #d1d5db' : '1px solid #bfdbfe', borderRadius: '8px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        {course.progress === 100 ? 'ทบทวนเนื้อหา' : <><PlayCircle size={18} /> เรียนต่อ</>}
      </button>
    </div>
  </div>
);

// สไตล์จำลองสำหรับ Tab
const tabStyle = (isActive: boolean) => ({
  background: 'none',
  border: 'none',
  padding: '10px 15px',
  fontSize: '1rem',
  fontWeight: isActive ? 'bold' : 'normal',
  color: isActive ? '#2563eb' : '#6b7280',
  borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
  cursor: 'pointer',
  marginBottom: '-12px' // ให้ขอบเส้นทับกับเส้นกรอบด้านล่างพอดี
});

export default MyCourses;