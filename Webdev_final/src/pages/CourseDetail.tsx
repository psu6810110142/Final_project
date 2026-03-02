import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HomePage.css'; 
import api from '../api'; // 🌟 ดึงข้อมูลจาก API
import logoImg from '../assets/Logo.png'; 

// 📌 โครงสร้างข้อมูลจาก Database
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
  };
  lessons?: Lesson[];
}

export default function CourseDetail() {
  const { id } = useParams(); // รับ ID จาก URL
  const navigate = useNavigate();

  // 📌 State สำหรับเก็บข้อมูลคอร์สที่ดึงมา
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันดึงรูปภาพ
  const getImageUrl = (url?: string, type: 'course' | 'user' = 'course') => {
    if (!url) {
      return type === 'user'
        ? ""
        : "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80"; // รูปคอร์สเรียน Default
    }
    if (url.startsWith('/uploads')) {
      return `http://localhost:3000${url}`;
    }
    return url;
  };

  // 🌟 ดึงข้อมูลจาก Backend เมื่อเข้ามาหน้านี้
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

    if (id) {
      fetchCourseDetail();
    }
  }, [id]);

  // สถานะกำลังโหลด
  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>กำลังโหลดข้อมูลคอร์สเรียน... ⏳</div>;

  // ถ้า Error หรือไม่พบข้อมูล
  if (error || !course) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <p style={{ color: 'red', fontSize: '1.2rem', marginBottom: '20px' }}>{error || 'ไม่พบคอร์สเรียน'}</p>
      <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', cursor: 'pointer' }}>&larr; กลับไปก่อนหน้า</button>
    </div>
  );

  return (
    <div className="cd-page-wrapper">
      
      {/* 🟢 แถบเมนูด้านบน (Navbar) */}
      <nav className="cd-navbar">
        <div className="cd-nav-container">
          <div className="cd-logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
            <img src={logoImg} alt="New Learning Academy Logo" className="cd-logo-img" />
            <div className="cd-logo-text">
              <h2 style={{ fontSize: '16px', margin: '0' }}>New Learning Academy</h2>
              <p style={{ fontSize: '12px', margin: '0' }}>สถาบันกวดวิชานิวเลิร์นนิง</p>
            </div>
          </div>

          <ul className="cd-nav-links">
            <li onClick={() => navigate('/home')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              หน้าหลัก
            </li>
            <li className="active" onClick={() => navigate('/courses')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              คอร์สเรียน
            </li>
            <li onClick={() => navigate('/mycourse')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              คอร์สของฉัน
            </li>
          </ul>
        </div>
      </nav>

      {/* 🔵 เนื้อหาหน้าเว็บ */}
      <div className="cd-page-container">
        
        {/* Banner สีฟ้าพร้อมรูปลายน้ำ */}
        <div className="cd-banner">
          <div className="cd-banner-content">
            
            <div className="cd-banner-info">
              <div className="cd-tags">
                <span className="cd-tag white-bg">{course.level?.level_name || 'ทั่วไป'}</span>
                <span className="cd-tag outline">คอร์สเรียน</span>
              </div>
              
              {/* 🌟 ดึงชื่อและรายละเอียดจาก DB */}
              <h1 className="cd-title">{course.title}</h1>
              <p className="cd-subtitle" style={{
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
              }}>
                {course.description}
              </p>
              
              <div className="cd-stats-top">
                <div className="cd-stat-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  128 คน (จำลอง)
                </div>
                <div className="cd-stat-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {course.duration_weeks || 12} สัปดาห์
                </div>
              </div>

              {/* 🌟 ดึงข้อมูลอาจารย์จาก DB */}
              <div className="cd-instructor-badge" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor?.name || 'Instructor')}&background=random&color=fff`} 
                  alt="Instructor" 
                  style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="cd-instructor-name">สอนโดย: {course.instructor?.name || 'ไม่ระบุชื่อผู้สอน'}</span>
                  <span className="cd-instructor-sub" style={{ fontSize: '0.9rem', opacity: 0.8 }}>ผู้เชี่ยวชาญประจำวิชา</span>
                </div>
              </div>
            </div>

            {/* รูปหน้าปกคอร์สจาก DB */}
            <div className="cd-banner-video">
              <img 
                src={getImageUrl(course.cover_image_url)} 
                alt={course.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

          </div>
        </div>

        {/* ⚪️ เนื้อหาด้านล่าง แบ่ง 2 คอลัมน์ */}
        <div className="cd-main-content">
          
          {/* ฝั่งซ้าย: รายละเอียดคอร์ส */}
          <div className="cd-left-column">
            
            <div className="cd-card">
              <h2 className="cd-card-title">รายละเอียดคอร์ส</h2>
              <div className="cd-feature-list">
                <div className="cd-feature-item">
                  <div className="cd-check-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
                  <div><h4>เรียนรู้แบบทีละขั้นตอน</h4><p>เนื้อหาครอบคลุมตามหลักสูตร จัดเรียงลำดับการเรียนอย่างเป็นระบบ</p></div>
                </div>
                <div className="cd-feature-item">
                  <div className="cd-check-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
                  <div><h4>วิดีโอคุณภาพสูง</h4><p>ความละเอียดชัด เสียงดัง ไม่มีสะดุด</p></div>
                </div>
                <div className="cd-feature-item">
                  <div className="cd-check-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
                  <div><h4>ดูซ้ำได้ไม่จำกัด</h4><p>เมื่อซื้อคอร์สแล้ว สามารถดูซ้ำได้ไม่จำกัดจำนวนครั้ง</p></div>
                </div>
              </div>
            </div>

            <div className="cd-card">
              <h2 className="cd-card-title">เนื้อหาในคอร์ส (Syllabus)</h2>
              <div className="cd-lesson-list">
                
                {/* 🌟 วนลูปแสดงบทเรียนจาก Database */}
                {course.lessons && course.lessons.length > 0 ? (
                  course.lessons.map((lesson, index) => (
                    <div className="cd-lesson-item" key={lesson.lesson_id || index}>
                      <div className="cd-lesson-name">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        {lesson.title}
                      </div>
                      <div className="cd-lesson-time">
                        {lesson.duration_minutes ? `${lesson.duration_minutes} นาที` : 'ไม่ระบุเวลา'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
                    ยังไม่มีข้อมูลบทเรียนในขณะนี้
                  </div>
                )}
                
              </div>
            </div>

          </div>

          {/* ฝั่งขวา: ราคาสินค้า */}
          <div className="cd-right-column">
            <div className="cd-price-card">
              {/* 🌟 ดึงราคาจาก Database */}
              <h1 className="cd-price-amount">
                {course.price > 0 ? `฿${course.price.toLocaleString()}` : 'เรียนฟรี'}
              </h1>
              <p className="cd-price-subtitle">ครั้งเดียว เรียนได้ไม่จำกัด</p>
              
              <button className="cd-enroll-btn" onClick={() => navigate('/payment')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                ลงทะเบียนเรียน
              </button>

              <div className="cd-course-includes">
                <div className="cd-include-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                  {course.lessons?.length || 0} บทเรียน
                </div>
                <div className="cd-include-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  ระยะเวลา {course.duration_weeks || 12} สัปดาห์
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🟢 ส่วนท้าย (Footer) */}
      <footer className="cd-footer">
        <div className="cd-footer-content">
          <div className="cd-footer-col">
            <h3>เกี่ยวกับเรา</h3>
            <p>New Learning Academy<br/>แพลตฟอร์มการเรียนออนไลน์ที่ออกแบบมาเพื่อนักเรียน</p>
          </div>
        </div>
        <div className="cd-footer-bottom">
          <p>© 2026 New Learning Academy. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}