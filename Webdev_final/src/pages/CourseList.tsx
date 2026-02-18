import React, { useState } from 'react';
import './HomePage.css'; // ใช้ CSS ชุดเดิมได้เลย
import { Home, Book, User, LogOut, Search, Users, Clock, Filter } from 'lucide-react';
import logoImage from '../assets/Logo.png'; // เช็ค path รูปให้ถูกนะครับ

// --- ข้อมูลจำลอง (Mock Data) สำหรับคอร์สเรียน ---
const MOCK_COURSES = [
  { id: 1, subject: "คณิตศาสตร์", grade: "ป.5", title: "คณิตศาสตร์ ป.5 ตะลุยโจทย์", price: "฿1,500", tagColor: "#dbeafe", textColor: "#1e40af", imgSrc: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400" },
  { id: 2, subject: "วิทยาศาสตร์", grade: "ม.1", title: "วิทยาศาสตร์ ม.1 พื้นฐาน", price: "฿1,800", tagColor: "#f3e8ff", textColor: "#6b21a8", imgSrc: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400" },
  { id: 3, subject: "ภาษาอังกฤษ", grade: "ป.6", title: "Grammar ป.6 สอบเข้า ม.1", price: "฿2,000", tagColor: "#dcfce7", textColor: "#166534", imgSrc: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400" },
  { id: 4, subject: "คณิตศาสตร์", grade: "ม.3", title: "คณิตศาสตร์ ม.3 เตรียมสอบ O-NET", price: "฿2,500", tagColor: "#dbeafe", textColor: "#1e40af", imgSrc: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400" },
  { id: 5, subject: "ภาษาไทย", grade: "ม.2", title: "ภาษาไทย ม.2 วรรณคดี", price: "฿1,200", tagColor: "#ffedd5", textColor: "#9a3412", imgSrc: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400" },
  { id: 6, subject: "วิทยาศาสตร์", grade: "ป.4", title: "การทดลองวิทย์ ป.4 สนุกๆ", price: "฿1,500", tagColor: "#f3e8ff", textColor: "#6b21a8", imgSrc: "https://images.unsplash.com/photo-1564325724739-bae0bd08762c?auto=format&fit=crop&q=80&w=400" },
];

const CourseList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  const categories = ["ทั้งหมด", "คณิตศาสตร์", "วิทยาศาสตร์", "ภาษาอังกฤษ", "ภาษาไทย"];

  return (
    <div className="page-wrapper">
      {/* ================= Navbar (แบบล็อกอินแล้ว) ================= */}
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
            <a href="/home" className="menu-item">
              <Home size={18} /> หน้าหลัก
            </a>
            <a href="/courses" className="menu-item active">
              <Book size={18} /> คอร์สเรียน
            </a>
            <a href="/my-courses" className="menu-item">
              <User size={18} /> คอร์สของฉัน
            </a>
            <a href="/logout" className="menu-item">
              <LogOut size={18} /> ออกจากระบบ
            </a>
            <div className="user-pill">User</div>
          </div>
        </div>
      </nav>

      {/* ================= Course Header & Search ================= */}
      <div className="hero" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>ค้นหาคอร์สเรียนที่ใช่สำหรับคุณ</h1>
          <p style={{ opacity: 0.9, marginBottom: '30px' }}>เลือกเรียนจากคอร์สคุณภาพที่สอนโดยอาจารย์ผู้เชี่ยวชาญ</p>
          
          {/* Search Box */}
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '15px', top: '14px', color: '#6b7280' }} size={20} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อคอร์สเรียน, วิชา..." 
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
          
          {/* Categories Filter */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#4b5563', marginRight: '10px' }}>
              <Filter size={18} /> หมวดหมู่:
            </div>
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
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
                {cat}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          <div className="courses-grid">
            {MOCK_COURSES
              // กรองตามหมวดหมู่
              .filter(course => activeCategory === "ทั้งหมด" || course.subject === activeCategory)
              // กรองตามคำค้นหา
              .filter(course => course.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((course) => (
                <CourseCard 
                  key={course.id}
                  subject={course.subject} 
                  grade={course.grade} 
                  title={course.title} 
                  price={course.price} 
                  tagColor={course.tagColor} 
                  textColor={course.textColor}
                  imgSrc={course.imgSrc}
                />
            ))}
          </div>
          
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

// --- Helper Component: CourseCard (ก๊อปมาจาก HomePage) ---
const CourseCard = ({ subject, grade, title, price, tagColor, textColor, imgSrc }: any) => (
  <div className="course-card">
    <div className="course-image">
      <img src={imgSrc} alt={title} />
      <span className="badge">{grade}</span>
    </div>
    <div className="course-content">
      <span className="course-tag" style={{ backgroundColor: tagColor, color: textColor }}>{subject}</span>
      <h3 className="course-title">{title}</h3>
      <p className="course-desc">เรียนรู้พื้นฐานและเทคนิคสำคัญ ครอบคลุมทุกหัวข้อในหลักสูตร</p>
      <div className="course-meta">
        <div><Users size={14} /> 100 คน</div>
        <div><Clock size={14} /> 12 สัปดาห์</div>
      </div>
      <div className="course-footer">
        <div className="instructor">
          <div className="avatar"></div>
          <span>อ.สมชาย</span>
        </div>
        <div className="course-price">{price}</div>
      </div>
    </div>
  </div>
);

export default CourseList;