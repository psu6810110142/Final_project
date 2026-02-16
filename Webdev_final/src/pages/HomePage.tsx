import React from 'react';
import './HomePage.css'; // อย่าลืม import file css
import { Search, BookOpen, Users, Star, ArrowRight, Monitor, Clock } from 'lucide-react';
import logoImage from '../assets/Logo.png';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      {/* ================= Navbar ================= */}
      <nav className="navbar">
        <div className="container navbar-container">
          <div className="logo">
            <img src={logoImage} alt="New Learning Academy Logo" className="logo-image" />
            <span>New Learning Academy</span>
          </div>
          
          <div className="nav-actions">
            <div className="search-box">
              <Search className="search-icon" />
              <input type="text" placeholder="ค้นหาคอร์ส..." />
            </div>
            <button className="btn btn-login">เข้าสู่ระบบ</button>
            <button className="btn btn-signup">สมัครสมาชิก</button>
          </div>
        </div>
      </nav>

      {/* ================= Hero Section ================= */}
      <header className="hero">
        <div className="container hero-content">
          {/* Left Content */}
          <div className="hero-text">
            <h1>
              เรียนออนไลน์ <br />
              ที่บ้าน สะดวก สบาย
            </h1>
            <p>
              แพลตฟอร์มการเรียนออนไลน์สำหรับนักเรียนชั้นประถมและมัธยมต้น 
              เรียนได้ทุกที่ทุกเวลา พร้อมครูผู้สอนที่มีคุณภาพ
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">
                <BookOpen size={20} /> เริ่มเรียนเลย
              </button>
              <button className="btn btn-outline">
                สมัครสมาชิก <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Right Stats Grid */}
          <div className="stats-grid">
            <StatCard number="500+" label="นักเรียน" />
            <StatCard number="50+" label="คอร์สเรียน" />
            <StatCard number="20+" label="อาจารย์" />
            <StatCard number="4.8" label="คะแนนเฉลี่ย" />
          </div>
        </div>
      </header>

      {/* ================= Features Section ================= */}
      <section className="features">
        <div className="container">
          <h2>ทำไมต้องเลือกเรียนกับเรา?</h2>
          <div className="features-grid">
            <FeatureCard 
              icon={<Star size={40} color="#eab308" />}
              title="คุณภาพการสอน"
              desc="อาจารย์ผู้เชี่ยวชาญที่มีประสบการณ์การสอนมากกว่า 10 ปี"
            />
            <FeatureCard 
              icon={<Monitor size={40} color="#22c55e" />}
              title="เรียนได้ทุกที่"
              desc="เรียนออนไลน์ได้ทุกที่ทุกเวลา เหมาะกับนักเรียนที่อยู่ห่างไกล"
            />
            <FeatureCard 
              icon={<Users size={40} color="#f97316" />}
              title="ราคาเป็นกันเอง"
              desc="ราคาถูกกว่าเรียนพิเศษที่บ้าน แต่ได้คุณภาพเท่าเทียมกัน"
            />
          </div>
        </div>
      </section>

      {/* ================= Courses Section ================= */}
      <section className="courses">
        <div className="container">
          <div className="section-header">
            <h2 style={{ color: '#1e3a8a', fontSize: '2rem', margin: 0 }}>คอร์สแนะนำ</h2>
            <button className="btn-link" style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
              ดูทั้งหมด <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="courses-grid">
            <CourseCard 
              subject="คณิตศาสตร์" grade="ป.5" title="คณิตศาสตร์ ป.5" price="฿1,500" 
              tagStyle={{ backgroundColor: '#dbeafe', color: '#2563eb' }}
              imgSrc="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400"
            />
            <CourseCard/>
            <CourseCard/>
          </div>
        </div>
      </section>

      {/* ================= CTA Bottom ================= */}
      <section className="cta-section">
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>พร้อมเริ่มต้นการเรียนรู้แล้วหรือยัง?</h2>
          <p style={{ marginBottom: '30px', opacity: 0.9 }}>ลงทะเบียนวันนี้และเริ่มเรียนคอร์สที่คุณสนใจได้เลย</p>
          <button className="btn btn-primary" style={{ color: '#2563eb' }}>
            สมัครสมาชิกฟรี
          </button>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3>เกี่ยวกับเรา</h3>
              <p>New Learning Academy เป็นแพลตฟอร์มรับการเรียนออนไลน์ที่ออกแบบมาเพื่อนักเรียนระดับประถมและมัธยมต้น</p>
            </div>
            <div>
              <h3>ติดต่อเรา</h3>
              <p>อีเมล: newlearningacademy@gmail.com</p>
              <p>โทร: 064-262-4200 (พร้อมเพย์ โอนได้นะค้าบบ)</p>
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

// ================= Helper Components =================

const StatCard = ({ number, label }: { number: string, label: string }) => (
  <div className="stat-card">
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const CourseCard = ({ subject, grade, title, price, tagStyle, imgSrc }: any) => (
  <div className="course-card">
    <div className="course-image">
      <img src={imgSrc} alt={title} />
      <span className="badge">{grade}</span>
    </div>
    <div className="course-content">
      <div className="course-tag" style={tagStyle}>
        {subject}
      </div>
      <h3 className="course-title">{title}</h3>
      <p className="course-desc">
        เรียนรู้พื้นฐานและเทคนิคสำคัญ ครอบคลุมทุกหัวข้อในหลักสูตร
      </p>
      
      <div className="course-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={14} /> 100 คน</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> 12 สัปดาห์</div>
      </div>
      
      <div className="course-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <div style={{ width: '30px', height: '30px', backgroundColor: '#e5e7eb', borderRadius: '50%' }}></div>
           <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4b5563' }}>อาจารย์สมชาย</span>
        </div>
        <span className="course-price">{price}</span>
      </div>
    </div>
  </div>
);

export default HomePage;