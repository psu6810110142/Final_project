import React, { useEffect, useState } from 'react';
import './HomeTheme.css';
import { BookOpen, ArrowRight, Users, Star, Clock } from 'lucide-react';
import GrayLogo from '../assets/graylogo.png';
import api from '../api'; 
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './OceanTheme.css';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';

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
      ? GrayLogo // 👨‍🏫 รูปคน Default
      : GrayLogo // 📚 รูปคอร์สเรียน Default
  }

  if (url.startsWith('/uploads')) {
    return `http://localhost:3001${url}`;
  }
  return url;
};

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  // State สำหรับคอร์สเรียน
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ดึงข้อมูลคอร์สเรียนจาก Backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className={`page-wrapper ${theme === 'ocean' ? 'ocean-page' : ''}`}>
      <Navbar/>

      {/* ================= Hero Section ================= */}
      <header className={theme === 'ocean' ? 'landing-hero' : 'page-header home-page-header'}>
        {theme === 'ocean' ? (
          <>
            <div className="stars-layer" />
            <div className="moon" />
            <div className="ocean-bubbles">{[...Array(8)].map((_, i) => <div key={i} className="bubble" />)}</div>
            <span className="fish fish-1">🐠</span>
            <span className="fish fish-2">🐟</span>
            <span className="fish fish-3">🦑</span>
            <div className="wave-layer-1" />
            <div className="wave-layer-2" />
            <div className="wave-layer-3" />
            <div className="wave-layer-sand" />
            <span className="palm-left">🌴</span>
            <span className="palm-right">🌴</span>
          </>
        ) : (
          <div className="wave-bottom" />
        )}
        <div className="container home-hero-content">
          <div className="hero-text" style={{ marginLeft: '15%', marginTop: theme === 'ocean' ? '100px' : '0px' }}>
            <h1>เรียนออนไลน์ <br />ที่บ้าน สะดวก สบาย</h1>
            <p style={{ marginBottom: '30px' }}>แพลตฟอร์มการเรียนออนไลน์สำหรับนักเรียนชั้นประถมและมัธยมต้น เรียนได้ทุกที่ทุกเวลา พร้อมครูผู้สอนที่มีคุณภาพ</p>
            <button className="btn-hero">
              <BookOpen size={20} /> เริ่มเรียนเลย
            </button>
          </div>

          <div className="hero-mascot">
            <div className="mascot-wrap">
              <div className="mascot-bubble">👋 ยินดีต้อนรับ!</div>
              <div className="mascot-body">🦈</div>
              <div className="mascot-books">📚</div>
              <div className="mascot-star star-1">⭐</div>
              <div className="mascot-star star-2">✨</div>
              <div className="mascot-star star-3">🌟</div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= Features Section ================= */}
      <section className="section home-features-section">
        <div className="container">
          <h2 className="section-title">ทำไมต้องเลือกเรียนกับเรา?</h2>
          <div className="features-grid">
            <FeatureCard
              icon={<Star size={40} color="#2563eb" />}
              bg="#dbeafe"
              title="คุณภาพการสอน"
              desc="อาจารย์ผู้เชี่ยวชาญที่มีประสบการณ์การสอนมากกว่า 10 ปี"
            />
            <FeatureCard
              icon={<BookOpen size={40} color="#059669" />}
              bg="#d1fae5"
              title="เรียนได้ทุกที่"
              desc="เรียนออนไลน์ได้ทุกที่ทุกเวลา เหมาะกับนักเรียนที่อยู่ห่างไกล"
            />
            <FeatureCard
              icon={<Users size={40} color="#ea580c" />}
              bg="#ffedd5"
              title="ราคาเป็นกันเอง"
              desc="ราคาถูกกว่าเรียนพิเศษที่บ้าน แต่ได้คุณภาพเท่าเทียมกัน"
            />
          </div>
        </div>
      </section>

      {/* ================= Courses Section ================= */}
      <section className="section" style={{ backgroundColor: '#f9fafb' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title" style={{ margin: 0 }}>คอร์สแนะนำ</h2>
            <button className="btn-link" onClick={() => window.location.href = '/courses'}>
              ดูทั้งหมด <ArrowRight size={18} />
            </button>
          </div>

          {isLoading ? (
            <p style={{ textAlign: 'center', padding: '2rem 0' }}>กำลังโหลดข้อมูลคอร์ส...</p>
          ) : (
            <div className="courses-scroll-container">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <Link
                    to={`/course/${course.course_id}`}
                    key={course.course_id}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <CourseCard
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
                  </Link>
                ))
              ) : (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>ยังไม่มีคอร์สแนะนำในขณะนี้</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid" >
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
      <ThemeToggleButton />
    </div>
  );
};

// --- Helper Components ---

const FeatureCard = ({ icon, bg, title, desc }: any) => (
  <div className="feature-card">
    <div className="feature-icon-wrapper" style={{ backgroundColor: bg }}>{icon}</div>
    <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{title}</h3>
    <p style={{ color: '#6b7280', lineHeight: '1.6' }}>{desc}</p>
  </div>
);

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

export default HomePage;